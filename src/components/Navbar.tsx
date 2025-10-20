import { MdMarkunreadMailbox } from "react-icons/md";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.appName}>
        <MdMarkunreadMailbox className={styles.icon} />
        <span>Bean Mails</span>
      </h1>
    </nav>
  );
}
