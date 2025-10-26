import getMessage from "@/api/getMessage";
import MessageAttachment from "@/components/MessageAttachment";
import { simpleParser } from "mailparser";
import moment from "moment";
import styles from "./page.module.scss";
import Address from "@/components/Address";
import React from "react";
import parseMessageContent from "@/utils/parseMessageContent";
import MailControlButtons from "@/components/MailControlButtons";

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
      <div className={styles.container}>
        <MailControlButtons message={message.data!.metadata} />
        <div className={styles.metadata}>
          <h2 className={styles.subject}>{parsed.subject}</h2>
          <p className={styles.date}>
            {moment(parsed.date?.toISOString()).format("dddd D MMMM YYYY")}
          </p>
        </div>
        <div className={styles.addresses}>
          <div className={styles.addressRow}>
            <span className={styles.addressLabel}>From</span>
            {from?.map((u) => (
              <Address
                name={u.name}
                email={u.address ?? u.name}
                key={u.address ?? u.name}
              />
            ))}
          </div>
          <div className={styles.addressRow}>
            <span className={styles.addressLabel}>To</span>
            {to?.map((u) => (
              <Address
                name={u.name}
                email={u.address ?? u.name}
                key={u.address ?? u.name}
              />
            ))}
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.content}>
            {parseMessageContent(parsed.html || parsed.textAsHtml || "", {
              ul: styles.ul,
              li: styles.li,
              hr: styles.hr,
            })}
          </div>
        </div>
        {parsed.attachments.length > 0 && (
          <React.Fragment>
            <h2 className={styles.attachmentsLabel}>
              Attachments{" "}
              <span className={styles.count}>
                ({parsed.attachments.length})
              </span>
            </h2>
            <div className={styles.attachments}>
              {parsed.attachments.map((a) => (
                <MessageAttachment data={a} key={a.cid} />
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    );
  } catch (e) {
    return "Error reading this file";
  }
}
