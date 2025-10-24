"use client";

import { useRouter } from "next/navigation";
import styles from "./Address.module.scss";
import { FaPen } from "react-icons/fa";
import React from "react";

type AddressProps = {
  name: string | null;
  email: string;
};

export default function Address({ name, email }: AddressProps) {
  const router = useRouter();

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/s?to=${email}`);
  };

  return (
    <button className={styles.name} onClick={click}>
      <span className={styles.content}>{name || email}</span>
      <FaPen className={styles.icon} size={11} />
      {!!name && <span className={styles.email}>{email}</span>}
    </button>
  );
}
