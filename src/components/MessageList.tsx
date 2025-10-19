"use client";

import type { RawMessage } from "@/types/message";
import MessageInline from "./MessageInline";
import styles from "./MessageList.module.scss";

type MessageListProps = {
  messages: RawMessage[];
};

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ul className={styles.list}>
      {messages.map((m) => (
        <MessageInline data={m} key={m.id} />
      ))}
    </ul>
  );
}
