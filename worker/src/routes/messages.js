import Router from "../classes/Router";

const router = new Router();

router.get("/messages", async ({ env }) => {
  const q = await env.DB.prepare(
    /* SQL */ `SELECT id, sender, recipients, subject, preview, date, created_at FROM messages ORDER BY created_at DESC LIMIT 100`
  ).all();

  const rows = q.results || [];

  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
});

router.get("/messages/:messageId", async ({ params, env }) => {
  const id = params.messageId;
  const res = await env.DB.prepare(
    /* SQL */ `SELECT * FROM messages WHERE id = ?`
  )
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
        preview: res.preview,
        date: res.date,
      }),
    },
  });
});

export default router;
