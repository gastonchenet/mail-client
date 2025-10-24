import { HashLoader } from "react-spinners";
import styles from "./loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.container}>
      <HashLoader size={64} color="#ffffff" />
      <div className={styles.textContent}>
        <h2 className={styles.loadingLabel}>Loading...</h2>
        <p className={styles.loadingText}>We are preparing the page for you.</p>
      </div>
    </div>
  );
}
