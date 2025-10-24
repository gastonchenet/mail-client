import getMessages from "@/api/getMessages";
import styles from "./page.module.scss";
import MessageInline from "@/components/MessageInline";

export default async function Home() {
  const messages = await getMessages();
  if (messages.error) return messages.error;

  return (
    <ul className={styles.list}>
      {messages.data.map((m) => (
        <MessageInline data={m} key={m.id} />
      ))}
    </ul>
  );
}
