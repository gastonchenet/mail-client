import { MdMarkunreadMailbox } from "react-icons/md";
import styles from "./Navbar.module.scss";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.appNameLink}>
        <h1 className={styles.appName}>
          <MdMarkunreadMailbox className={styles.icon} />
          <span>Bean Mails</span>
        </h1>
      </Link>
    </nav>
  );
}
