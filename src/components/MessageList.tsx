"use client";

import MessageInline from "./MessageInline";

type MessageListProps = {
  messages: any[];
};

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ul>
      {messages.map((m) => (
        <MessageInline data={m} key={m.id} />
      ))}
    </ul>
  );
}
