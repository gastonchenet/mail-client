import { jwtVerify, createRemoteJWKSet } from "jose";

export default {
  async email(message, env, ctx) {
    try {
      const id = crypto.randomUUID();
      const r2Key = `emails/${id}.eml`;
      const uint8 = new Uint8Array(message.raw);

      await env.MAIL_BUCKET.put(r2Key, uint8, {
        httpMetadata: {
          contentType: "message/rfc822",
        },
      });

      const subject = message.headers.get("subject") || "";
      const from = message.from || "";
      const to = message.to || "";
      const dateHeader = message.headers.get("date");
      const date =
        dateHeader && !isNaN(Date.parse(dateHeader))
          ? new Date(dateHeader).toISOString()
          : new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO messages (id, r2_key, sender, recipients, subject, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, r2Key, from, to, subject, date, new Date().toISOString())
        .run();

      return new Response("OK", { status: 200 });
    } catch (err) {
      console.error("Email handler error:", err?.message || err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  async fetch(request, env, ctx) {
    const token = request.headers.get("cf-access-jwt-assertion");

    if (!token) {
      return new Response("Missing required CF Access JWT", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

    try {
      const JWKS = createRemoteJWKSet(
        new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`)
      );

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: env.TEAM_DOMAIN,
        audience: env.POLICY_AUD,
      });

      const url = new URL(request.url);
      const p = url.pathname;

      if (p === "/" && request.method === "GET") {
        return new Response(
          JSON.stringify({
            email: payload.email,
          }),
          { status: 200 }
        );
      }

      if (p === "/messages" && request.method === "GET") {
        const q = await env.DB.prepare(
          `SELECT id, sender, recipients, subject, date, created_at FROM messages ORDER BY created_at DESC LIMIT 100`
        ).all();

        const rows = q.results || [];

        return new Response(JSON.stringify(rows), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (p.startsWith("/messages/") && request.method === "GET") {
        const id = p.split("/")[2];
        const res = await env.DB.prepare(`SELECT * FROM messages WHERE id = ?`)
          .bind(id)
          .first();
        if (!res) return new Response("Not found", { status: 404 });

        const r2Key = res.r2_key;
        const obj = await env.MAIL_BUCKET.get(r2Key);
        if (!obj) return new Response("Message raw not found", { status: 404 });
        const raw = await obj.arrayBuffer();

        return new Response(raw, {
          headers: {
            "Content-Type": "message/rfc822",
            "X-Message-Metadata": JSON.stringify({
              id: res.id,
              sender: res.sender,
              recipients: res.recipients,
              subject: res.subject,
              date: res.date,
            }),
          },
        });
      }

      if (p === "/send" && request.method === "POST") {
        try {
          const body = await request.json();
          const sgKey = env.SENDGRID_API_KEY;
          if (!sgKey)
            return new Response("SendGrid API key not configured", {
              status: 500,
            });

          const payload = {
            personalizations: [{ to: [{ email: body.to }] }],
            from: { email: body.from || "no-reply@gche.me" },
            subject: body.subject,
            content: [
              { type: "text/plain", value: body.text || "" },
              ...(body.html ? [{ type: "text/html", value: body.html }] : []),
            ],
          };

          const sendRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sgKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!sendRes.ok) {
            const txt = await sendRes.text();
            console.error("sendgrid error", sendRes.status, txt);
            return new Response(`Send failed: ${sendRes.status}`, {
              status: 502,
            });
          }

          return new Response("Sent", { status: 200 });
        } catch (err) {
          console.error("send error", err);
          return new Response("Internal error", { status: 500 });
        }
      }

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      return new Response(`Invalid token: ${error.message}`, {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
