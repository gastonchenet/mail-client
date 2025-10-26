export default async function toggleMessageStar(messageId: string) {
  const res = await fetch(`/api/messages/${messageId}/star`, {
    method: "POST",
  });

  return res.ok;
}
