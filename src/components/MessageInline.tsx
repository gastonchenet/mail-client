"use client";

import type { RawMessage } from "@/types/message";
import parseMessage from "@/utils/parseMessage";
import Link from "next/link";
import styles from "./MessageInline.module.scss";
import moment from "moment";
import React, { useState } from "react";
import Address from "./Address";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import StarButton from "./StarButton";

type MessageInlineProps = {
  data: RawMessage;
};

export default function MessageInline({ data }: MessageInlineProps) {
  const [selected, setSelected] = useState(false);
  const message = parseMessage(data);

  const toggleSelected = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelected((prev) => !prev);
  };

  return (
    <li className={data.seen ? styles.listElement : styles.listElementUnseen}>
      <Link
        href={`/mail/${message.id}`}
        className={selected ? styles.selectedMail : styles.mail}
      >
        <div className={styles.mailInlineWrapper}>
          <div className={styles.buttons}>
            <button className={styles.button} onClick={toggleSelected}>
              {selected ? (
                <MdCheckBox className={styles.selected} size={16} />
              ) : (
                <MdCheckBoxOutlineBlank className={styles.selector} size={16} />
              )}
            </button>
            <StarButton
              messageId={data.id}
              initialValue={data.starred}
              size={16}
              className={styles.button}
            />
          </div>
          <Address name={message.sender.name} email={message.sender.email} />
          <p className={styles.previewDesktop}>
            <span className={styles.subject}>{message.subject}</span> -{" "}
            <span className={styles.body}>{message.preview || "No body"}</span>
          </p>
          <p className={styles.date}>{moment(message.date).format("MMM D")}</p>
        </div>
        <p className={styles.previewMobile}>
          <span className={styles.subject}>{message.subject}</span> -{" "}
          <span className={styles.body}>{message.preview || "No body"}</span>
        </p>
      </Link>
    </li>
  );
}
