import { USER_EMAIL } from "@/constants/User";
import type { RawMessage } from "@/types/message";

type MessageData = {
  metadata: RawMessage;
  content: string;
};

type GetMessageReturn = {
  error: string | null;
  data: MessageData | null;
};

export default async function getMessage(
  messageId: string
): Promise<GetMessageReturn> {
  const res = await fetch(`${process.env.API_BASE}/messages/${messageId}`, {
    method: "GET",
    headers: {
      "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID!,
      "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET!,
      "X-User-Email": USER_EMAIL,
    },
  });

  if (!res.ok) {
    return {
      error: "Internal server error: Unable to fetch message.",
      data: null,
    };
  }

  const data = await res.text();
  const metadata = JSON.parse(res.headers.get("X-Message-Metadata") ?? "{}");
  return { error: null, data: { metadata, content: data } };
}
