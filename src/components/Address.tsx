import Link from "next/link";
import styles from "./Address.module.scss";
import { FaPen } from "react-icons/fa";

type AddressProps = {
  name: string | null;
  email: string;
};

export default function Address({ name, email }: AddressProps) {
  return (
    <Link className={styles.name} href={`/s?to=${email}`}>
      <span className={styles.content}>{name || email}</span>
      <FaPen className={styles.icon} size={12} />
      {!!name && <span className={styles.email}>{email}</span>}
    </Link>
  );
}
