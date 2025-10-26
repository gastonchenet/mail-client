import Router from "../classes/Router";

const router = new Router();

router.post("/trash/empty", async ({ env }) => {
  try {
    const expired = await env.DB.prepare(
      /* SQL */ `SELECT id, r2_key FROM messages WHERE deleted_at IS NOT NULL`
    ).all();

    if (!expired.results.length) return;

    for (const email of expired.results) {
      try {
        await env.MAIL_BUCKET.delete(email.r2_key);

        await env.DB.prepare(/* SQL */ `DELETE FROM messages WHERE id = ?`)
          .bind(email.id)
          .run();
      } catch (error) {
        console.error(`Failed to delete mail '${email.id}':`, error);
      }
    }

    return new Response("OK");
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response("Internal server error");
  }
});

export default router;
