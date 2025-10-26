import getMessages from "@/api/getMessages";
import React from "react";
import TrashContent from "@/components/TrashContent";

export default async function Page() {
  const messages = await getMessages("deleted");
  if (messages.error) return messages.error;

  return <TrashContent messages={messages.data} />;
}
