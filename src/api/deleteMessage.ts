export default async function deleteMessage(messageId: string) {
  const res = await fetch(`/api/messages/${messageId}`, {
    method: "DELETE",
  });

  return res.ok;
}
