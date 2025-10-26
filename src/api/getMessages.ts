import type { RawMessage } from "@/types/message";

type GetMessageReturn = {
  error: string | null;
  data: RawMessage[];
};

type SenderFilter = {
  include?: string[];
  exclude?: string[];
};

export default async function getMessages(
  type: "deleted" | "starred" | null = null,
  { include, exclude }: SenderFilter = { include: [], exclude: [] }
): Promise<GetMessageReturn> {
  include ??= [];
  exclude ??= [];

  const url = new URL(`${process.env.API_BASE}/messages`);

  if (type) url.searchParams.set("type", type);

  if (include.length + exclude.length > 0) {
    url.searchParams.set(
      "senders",
      include.join(",") + "," + exclude.map((a) => "!" + a).join(",")
    );
  }

  const res = await fetch(url.toString(), {
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
