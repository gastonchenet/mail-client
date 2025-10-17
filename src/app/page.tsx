import MailList from "@/components/MessageList";
import styles from "./page.module.scss";
import getMessages from "@/api/getMessages";

export default async function Home() {
  const messages = await getMessages();
  if (messages.error) return messages.error;

  return (
    <main>
      <MailList messages={messages.data} />
    </main>
  );
}
