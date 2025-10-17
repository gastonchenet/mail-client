export default async function getMessages() {
  const res = await fetch(`${process.env.API_BASE}/messages`, {
    method: "GET",
  });

  if (!res.ok) {
    return {
      error: "Internal server error: Unable to fetch messages.",
      data: [],
    };
  }

  const data = await res.json();
  return { error: null, data };
}
