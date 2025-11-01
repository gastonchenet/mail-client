import Router from "../classes/Router";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";

const ITEMS_PER_PAGE = 100;

const router = new Router();

router.get("/messages", async ({ request, env }) => {
  const url = new URL(request.url);

  const page = Math.max(0, parseInt(url.searchParams.get("page") ?? "1") - 1);
  const senders =
    url.searchParams.get("senders")?.split(",").filter(Boolean) ?? [];
  const type = url.searchParams.get("type");

  const whereClauses = [];
  const params = [];

  if (type === "deleted") {
    whereClauses.push(/* SQL */ `deleted_at IS NOT NULL`);
  } else if (type === "starred") {
    whereClauses.push(/* SQL */ `starred = 1`);
  } else {
    whereClauses.push(/* SQL */ `deleted_at IS NULL`);
  }

  if (senders.length > 0) {
    const includeSenders = senders.filter((s) => !s.startsWith("!"));
    const excludeSenders = senders
      .filter((s) => s.startsWith("!"))
      .map((s) => s.slice(1));

    const senderClauses = [];

    if (includeSenders.length > 0) {
      const includeClauses = includeSenders
        .map(() => /* SQL */ `(sender = ? OR sender LIKE ?)`)
        .join(" OR ");
      senderClauses.push(/* SQL */ `(${includeClauses})`);

      for (const s of includeSenders) {
        params.push(s, `%${s}%`);
      }
    }

    if (excludeSenders.length > 0) {
      const excludeClauses = excludeSenders
        .map(() => /* SQL */ `(sender != ? AND sender NOT LIKE ?)`)
        .join(" AND ");
      senderClauses.push(/* SQL */ `(${excludeClauses})`);

      for (const s of excludeSenders) {
        params.push(s, `%${s}%`);
      }
    }

    if (senderClauses.length > 0) {
      whereClauses.push(senderClauses.join(" AND "));
    }
  }

  let query = /* SQL */ `
    SELECT *
    FROM messages
    ${
      whereClauses.length > 0
        ? /* SQL */ `WHERE ` + whereClauses.join(/* SQL */ ` AND `)
        : ""
    }
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const result = await env.DB.prepare(query)
    .bind(...params)
    .all();

  const rows = result.results || [];

  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
});

router.post("/messages", async ({ request, env }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gche.me",
      port: 587,
      secure: false,
      auth: { user: "mailuser", pass: env.SMTP_KEY },
    });

    const formData = await request.formData();

    const id = crypto.randomUUID();
    const r2Key = `emails/${id}.eml`;
    const rawSender = formData.get("from");
    const toAddresses = formData.getAll("to");
    const ccAddresses = formData.getAll("cc");
    const subject = formData.get("subject");
    const textContent = formData.get("text");
    const htmlContent = formData.get("html");
    const trackMessage = formData.get("trackMessage") === "1";
    const attachments = formData.getAll("attachment");
    const preview = (textContent || "").substring(0, 200).trim();
    const createdAt = new Date().toISOString();

    if (!rawSender)
      return new Response("You should enter sender data.", { status: 403 });

    if (toAddresses.length < 1)
      return new Response(
        "You should enter at least one destination address.",
        { status: 403 }
      );

    const sender = JSON.parse(rawSender);

    if (!sender.username || !sender.email)
      return new Response("You should enter sender data.", { status: 403 });

    const mailOptions = {
      from: `"${sender.username}" <${sender.email}>`,
      to: toAddresses,
      cc: ccAddresses.length ? ccAddresses : undefined,
      subject: subject || "(no subject)",
      text: textContent || "",
      html: htmlContent || "",
      attachments: await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type || "application/octet-stream",
        }))
      ),
    };

    const mailComposer = new MailComposer(mailOptions);

    const emlBuffer = await new Promise((resolve, reject) =>
      mailComposer.compile().build((err, message) => {
        if (err) return reject(err);
        resolve(message);
      })
    );

    const uint8 = new Uint8Array(
      emlBuffer.buffer.slice(
        emlBuffer.byteOffset,
        emlBuffer.byteOffset + emlBuffer.byteLength
      )
    );

    await env.MAIL_BUCKET.put(r2Key, uint8, {
      httpMetadata: { contentType: "message/rfc822" },
    });

    await env.DB.prepare(
      /* SQL */ `INSERT INTO messages (id, r2_key, sender, recipients, subject, preview, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        r2Key,
        mailOptions.from,
        mailOptions.to.join(", "),
        mailOptions.subject,
        preview,
        createdAt,
        createdAt
      )
      .run();

    if (trackMessage) {
      mailOptions.html += /* HTML */ `<img
        src="${env.API_BASE}/messages/${id}/seen-pixel"
        alt="pixel"
      />`;
    }

    await transporter.sendMail(mailOptions);
    transporter.close();

    return new Response("OK");
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

router.get("/messages/:messageId", async ({ request, params, env }) => {
  const address = request.headers.get("X-User-Email");

  const id = params.messageId;
  const email = await env.DB.prepare(
    /* SQL */ `SELECT * FROM messages WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!email) return new Response("Not found", { status: 404 });

  const r2Key = email.r2_key;
  const obj = await env.MAIL_BUCKET.get(r2Key);
  if (!obj) return new Response("Message raw not found", { status: 404 });

  if (!email.seen_at && !email.sender.includes(address)) {
    await env.DB.prepare(
      /* SQL */ `UPDATE messages SET seen_at = ? WHERE id = ?`
    )
      .bind(new Date().toISOString(), id)
      .run();
  }

  const raw = await obj.arrayBuffer();

  return new Response(raw, {
    headers: {
      "Content-Type": "message/rfc822",
      "X-Message-Metadata": JSON.stringify(email),
    },
  });
});

router.delete("/messages/:messageId", async ({ params, env }) => {
  const id = params.messageId;

  const email = await env.DB.prepare(
    /* SQL */ `SELECT id, r2_key, deleted_at FROM messages WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!email) return new Response("Invalid message ID", { status: 404 });

  if (email.deleted_at) {
    await env.MAIL_BUCKET.delete(email.r2_key);

    await env.DB.prepare(/* SQL */ `DELETE FROM messages WHERE id = ?`)
      .bind(email.id)
      .run();
  } else {
    await env.DB.prepare(
      /* SQL */ `UPDATE messages SET deleted_at = ? WHERE id = ?`
    )
      .bind(new Date().toISOString(), id)
      .run();
  }

  return new Response("OK");
});

router.post("/messages/:messageId/recover", async ({ params, env }) => {
  const id = params.messageId;

  await env.DB.prepare(
    /* SQL */ `UPDATE messages SET deleted_at = NULL WHERE id = ?`
  )
    .bind(id)
    .run();

  return new Response("OK");
});

router.post("/messages/:messageId/star", async ({ params, env }) => {
  const id = params.messageId;

  const email = await env.DB.prepare(
    /* SQL */ `SELECT starred FROM messages WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!email) return new Response("Invalid message ID", { status: 404 });

  await env.DB.prepare(/* SQL */ `UPDATE messages SET starred = ? WHERE id = ?`)
    .bind(!email.starred, id)
    .run();

  return new Response("OK");
});

router.get(
  "/messages/:messagesId/seen-pixel",
  async ({ params, env }) => {
    const pixel = new Response(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=",
      { headers: { "Content-Type": "image/png" } }
    );

    const id = params.messageId;
    const email = await env.DB.prepare(
      /* SQL */ `SELECT seen_at FROM messages WHERE id = ?`
    )
      .bind(id)
      .first();

    if (!email) return pixel;

    await env.DB.prepare(
      /* SQL */ `UPDATE messages SET seen_at = ? WHERE id = ?`
    )
      .bind(new Date().toISOString(), id)
      .run();

    return pixel;
  },
  true
);

export default router;
