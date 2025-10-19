import type { RawMessage } from "@/types/message";

type GetMessageReturn = {
  error: string | null;
  data: RawMessage[];
};

export default async function getMessages(): Promise<GetMessageReturn> {
  const res = await fetch(`${process.env.API_BASE}/messages`, {
    method: "GET",
    headers: {
      "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID!,
      "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET!,
    },
  });

  if (!res.ok) {
    return {
      error: "Internal server error: Unable to fetch messages.",
      data: [],
    };
  }

  const data: RawMessage[] = await res.json();
  return { error: null, data };
}
