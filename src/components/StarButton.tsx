"use client";

import { useState } from "react";
import { GoStar, GoStarFill } from "react-icons/go";
import styles from "./StarButton.module.scss";
import toggleMessageStar from "@/api/toggleMessageStar";
import { HashLoader } from "react-spinners";

type StarButtonProps = {
  messageId: string;
  initialValue: boolean;
  size?: number;
  className?: string;
  iconClassName?: string;
};

export default function StarButton({
  messageId,
  initialValue,
  size = 16,
  className,
}: StarButtonProps) {
  const [starred, setStarred] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const toggleStar = async (e: React.MouseEvent) => {
    if (loading) return;
    e.preventDefault();
    setLoading(true);
    const done = await toggleMessageStar(messageId);
    setLoading(false);
    if (done) setStarred(!starred);
  };

  return (
    <button className={className} onClick={toggleStar} title="Star email">
      {loading ? (
        <HashLoader color="#666666" size={size} />
      ) : starred ? (
        <GoStarFill className={styles.starred} size={size} />
      ) : (
        <GoStar className={styles.star} size={size} />
      )}
    </button>
  );
}
