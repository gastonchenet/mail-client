import getMessages from "@/api/getMessages";
import styles from "./page.module.scss";
import MessageInline from "@/components/MessageInline";
import { USER_EMAIL } from "@/constants/User";

export default async function Page() {
  const messages = await getMessages(null, { include: [USER_EMAIL] });
  if (messages.error) return messages.error;

  return (
    <ul className={styles.list}>
      {messages.data.map((m) => (
        <MessageInline data={m} key={m.id} />
      ))}
    </ul>
  );
}
