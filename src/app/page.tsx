import MailList from "@/components/MessageList";
import styles from "./page.module.scss";
import getMessages from "@/api/getMessages";
import Link from "next/link";

export default async function Home() {
  const messages = await getMessages();
  if (messages.error) return messages.error;

  return (
    <main className={styles.container}>
      <nav className={styles.navbar}></nav>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <Link href="/s">Send a mail</Link>
        </aside>
        <MailList messages={messages.data} />
      </div>
    </main>
  );
}
