import getMessage from "@/api/getMessage";
import MessageAttachment from "@/components/MessageAttachment";
import { simpleParser } from "mailparser";
import moment from "moment";
import Link from "next/link";
import styles from "./page.module.scss";

type Params = {
  messageId: string;
};

type PageProps = {
  params: Promise<Params>;
};

export default async function Page({ params }: PageProps) {
  const { messageId } = await params;
  const message = await getMessage(messageId);
  if (message.error) return message.error;

  try {
    const parsed = await simpleParser(message.data!.content);
    const from = parsed.from?.value ?? [];
    const to = Array.isArray(parsed.to)
      ? parsed.to?.flatMap((a) => a.value)
      : parsed.to?.value ?? [];

    return (
      <div>
        <Link href="/">Back</Link>
        <div>
          <span>From</span>
          {from?.map((u) => (
            <span key={u.address}>
              {u.name}
              <span>{u.address}</span>
            </span>
          ))}
        </div>
        <div>
          <span>To</span>
          {to?.map((u) => (
            <span key={u.address}>
              {u.name}
              <span>{u.address}</span>
            </span>
          ))}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: parsed.html || parsed.textAsHtml || "",
          }}
        />
        <div>
          {moment(parsed.date?.toISOString()).format("dddd D MMMM YYYY")}
        </div>
        <div className={styles.attachments}>
          {parsed.attachments.map((a) => (
            <MessageAttachment data={a} key={a.cid} />
          ))}
        </div>
      </div>
    );
  } catch (e) {
    return "Error reading this file";
  }
}
