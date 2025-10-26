"use client";

import Link from "next/link";
import styles from "./MailControlButtons.module.scss";
import { GoArrowLeft, GoTrash } from "react-icons/go";
import deleteMessageAPI from "@/api/deleteMessage";
import { useRouter } from "next/navigation";
import StarButton from "./StarButton";
import { RawMessage } from "@/types/message";

type MailControlButtonsProps = {
  message: RawMessage;
};

export default function MailControlButtons({
  message,
}: MailControlButtonsProps) {
  const router = useRouter();

  const deleteMessage = async () => {
    await deleteMessageAPI(message.id);
    router.push("/");
  };

  return (
    <div className={styles.buttons}>
      <Link href="/" className={styles.action} title="Go back">
        <GoArrowLeft />
      </Link>
      <StarButton
        className={styles.action}
        messageId={message.id}
        initialValue={message.starred}
      />
      <button
        className={styles.action}
        onClick={deleteMessage}
        title="Delete email"
      >
        <GoTrash />
      </button>
    </div>
  );
}
