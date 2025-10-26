"use client";

import Link from "next/link";
import {
  FaInbox,
  FaPen,
  FaRegPaperPlane,
  FaRegStar,
  FaRegTrashAlt,
} from "react-icons/fa";
import styles from "./Sidebar.module.scss";
import React, { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

enum PageLink {
  Inbox = "/",
  Starred = "/starred",
  Sent = "/sent",
  Trash = "/trash",
}

export default function Sidebar() {
  const linkListRef = useRef<HTMLUListElement>(null);
  const [selectorY, setSelectorY] = useState(0);
  const [visible, setVisible] = useState(true);

  const pathname = usePathname();

  useLayoutEffect(() => {
    const links = Object.values(PageLink) as string[];
    setVisible(links.includes(pathname));

    if (!linkListRef.current) return;

    const listBounds = linkListRef.current.getBoundingClientRect();

    for (const child of linkListRef.current.children) {
      const elem = child.children[0] as HTMLAnchorElement;
      if (!elem?.href || new URL(elem.href).pathname !== pathname) continue;
      const elemBounds = elem.getBoundingClientRect();
      setSelectorY(elemBounds.top - listBounds.top);
    }
  }, [pathname]);

  return (
    <aside className={styles.sidebar}>
      <Link href="/send" className={styles.sendMailButton}>
        <FaPen className={styles.icon} />
        <span>Send a mail</span>
      </Link>
      <ul className={styles.linkList} ref={linkListRef}>
        <li className={styles.listItem}>
          <Link href={PageLink.Inbox} className={styles.link}>
            <FaInbox />
            <span>Inbox</span>
          </Link>
        </li>
        <li className={styles.listItem}>
          <Link href={PageLink.Starred} className={styles.link}>
            <FaRegStar />
            <span>Starred</span>
          </Link>
        </li>
        <li className={styles.listItem}>
          <Link href={PageLink.Sent} className={styles.link}>
            <FaRegPaperPlane />
            <span>Sent</span>
          </Link>
        </li>
        <li className={styles.listItem}>
          <Link href={PageLink.Trash} className={styles.link}>
            <FaRegTrashAlt />
            <span>Trash</span>
          </Link>
        </li>
        <div
          className={styles.selector}
          style={{ top: selectorY, opacity: visible ? 1 : 0 }}
        ></div>
      </ul>
    </aside>
  );
}
