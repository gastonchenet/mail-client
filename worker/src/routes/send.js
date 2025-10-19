import Router from "../classes/Router";

const router = new Router();

router.post("/send", async ({ env, request }) => {
  try {
    const body = await request.json();

    const payload = {
      personalizations: [{ to: [{ email: body.to }] }],
      from: { email: body.from ?? "no-reply@gche.me" },
      subject: body.subject,
      content: [
        { type: "text/plain", value: body.text || "" },
        ...(body.html ? [{ type: "text/html", value: body.html }] : []),
      ],
    };

    const sendRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
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
});

export default router;
