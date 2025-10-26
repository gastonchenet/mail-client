"use client";

import emptyTrashAPI from "@/api/emptyTrash";
import styles from "./TrashContent.module.scss";
import { FaRegTrashAlt } from "react-icons/fa";
import { RawMessage } from "@/types/message";
import React, { useState } from "react";
import MessageInline from "./MessageInline";
import { HashLoader } from "react-spinners";
import { CgTrashEmpty } from "react-icons/cg";

type TrashContentProps = {
  messages: RawMessage[];
};

export default function TrashContent({
  messages: _messages,
}: TrashContentProps) {
  const [messages, setMessages] = useState(_messages);
  const [loading, setLoading] = useState(false);

  const emptyTrash = async () => {
    setLoading(true);
    const success = await emptyTrashAPI();
    setLoading(false);
    if (success) setMessages([]);
  };

  return (
    <React.Fragment>
      <div className={styles.trashMessage}>
        <button className={styles.emptyButton} onClick={emptyTrash}>
          <FaRegTrashAlt className={styles.icon} />
          <span>Empty trash</span>
        </button>
        <p>
          Messages in the trash will stay for 30 days and will then be deleted.
        </p>
      </div>
      {messages.length === 0 && (
        <div className={styles.container}>
          <CgTrashEmpty size={48} className={styles.icon} />
          <h2 className={styles.emptyTrashLabel}>Your trash is empty.</h2>
        </div>
      )}
      {loading ? (
        <div className={styles.container}>
          <HashLoader color="white" size={48} />
        </div>
      ) : (
        <ul className={styles.list}>
          {messages.map((m) => (
            <MessageInline data={m} key={m.id} />
          ))}
        </ul>
      )}
    </React.Fragment>
  );
}
