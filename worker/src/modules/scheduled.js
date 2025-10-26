export default async function scheduled(event, env, ctx) {
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - THIRTY_DAYS;

  const expired = await env.DB.prepare(
    /* SQL */ `SELECT id, r2_key FROM messages WHERE deleted_at IS NOT NULL AND deleted_at < ?`
  )
    .bind(cutoff)
    .all();

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

  console.log(`Deleted ${expired.results.length} old emails`);
}
