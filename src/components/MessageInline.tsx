import type { RawMessage } from "@/types/message";
import parseMessage from "@/utils/parseMessage";
import Link from "next/link";
import styles from "./MessageInline.module.scss";
import moment from "moment";
import { GoStar, GoStarFill } from "react-icons/go";
import React, { useState } from "react";

type MessageInlineProps = {
  data: RawMessage;
};

export default function MessageInline({ data }: MessageInlineProps) {
  const [starred, setStarred] = useState(false);
  const message = parseMessage(data);

  const toggleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    setStarred((prev) => !prev);
  };

  return (
    <li className={styles.listElement}>
      <Link href={`/m/${message.id}`} className={styles.mail}>
        <button className={styles.starButton} onClick={toggleStar}>
          {starred ? (
            <GoStarFill className={styles.starred} />
          ) : (
            <GoStar className={styles.star} />
          )}
        </button>
        <p className={styles.sender}>
          {message.sender.name ?? message.sender.email}
        </p>
        <p className={styles.preview}>
          <span className={styles.subject}>{message.subject}</span> -{" "}
          <span className={styles.body}>{message.preview || "No body"}</span>
        </p>
        <p className={styles.date}>{moment(message.date).format("MMM D")}</p>
      </Link>
    </li>
  );
}
