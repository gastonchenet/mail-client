import Link from "next/link";
import { FaPen } from "react-icons/fa";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Link href="/s" className={styles.sendMailButton}>
        <FaPen className={styles.icon} />
        <span>Send a mail</span>
      </Link>
    </aside>
  );
}
