export default async function email(message, env, _ctx) {
  try {
    const id = crypto.randomUUID();
    const r2Key = `emails/${id}.eml`;
    const rawResponse = new Response(message.raw);
    const rawResponseClone = rawResponse.clone();
    const rawText = await rawResponse.text();

    const preview = (
      rawText.match(
        /Content-Type:\s*text\/plain[^]*?(?:\r?\n\r?\n)([^]*?)(?:\r?\n--|$)/i
      )?.[1] ?? rawText
    )
      .replace(/--.*?boundary.*?[\r\n]+/gi, "")
      .replace(/Content-Type:.+?[\r\n]+/gi, "")
      .replace(/Content-Transfer-Encoding:.+?[\r\n]+/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200);

    const arrayBuffer = await rawResponseClone.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    await env.MAIL_BUCKET.put(r2Key, uint8, {
      httpMetadata: { contentType: "message/rfc822" },
    });

    const subject = message.headers?.get("subject") || "";
    const from = message.headers?.get("from") || "";
    const to = message.headers?.get("to") || "";
    const dateHeader = message.headers?.get("date") || null;

    const date =
      dateHeader && !isNaN(Date.parse(dateHeader))
        ? new Date(dateHeader).toISOString()
        : new Date().toISOString();

    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      /* SQL */ `INSERT INTO messages (id, r2_key, sender, recipients, subject, preview, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, r2Key, from, to, subject, preview, date, createdAt)
      .run();

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Email handler error:", err?.message || err, err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
