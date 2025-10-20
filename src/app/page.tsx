import MailList from "@/components/MessageList";
import styles from "./page.module.scss";
import getMessages from "@/api/getMessages";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const messages = await getMessages();
  if (messages.error) return messages.error;

  return (
    <main className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <Sidebar />
        <MailList messages={messages.data} />
      </div>
    </main>
  );
}
