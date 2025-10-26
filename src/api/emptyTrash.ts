export default async function emptyTrash() {
  const res = await fetch("/api/trash/empty", {
    method: "POST",
  });

  return res.ok;
}
