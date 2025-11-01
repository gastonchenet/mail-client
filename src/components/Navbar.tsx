"use client";

import { MdMarkunreadMailbox } from "react-icons/md";
import styles from "./Navbar.module.scss";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Hamburger from "hamburger-react";
import {
  FaInbox,
  FaPen,
  FaRegPaperPlane,
  FaRegStar,
  FaRegTrashAlt,
} from "react-icons/fa";
import { usePathname } from "next/navigation";

enum PageLink {
  Inbox = "/",
  Starred = "/starred",
  Sent = "/sent",
  Trash = "/trash",
}

export default function Navbar() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setSidebarVisible(false);
  }, [pathname]);

  return (
    <React.Fragment>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.appNameLink}>
          <h1 className={styles.appName}>
            <MdMarkunreadMailbox className={styles.icon} />
            <span>Bean Mails</span>
          </h1>
        </Link>
        <div className={styles.hamburgerContainer}>
          <Hamburger
            size={24}
            onToggle={setSidebarVisible}
            toggled={sidebarVisible}
          />
        </div>
      </nav>
      <aside className={sidebarVisible ? styles.visibleLinks : styles.links}>
        <Link href="/send" className={styles.sendMailButton}>
          <FaPen className={styles.icon} />
          <span>Send a mail</span>
        </Link>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <Link
              href={PageLink.Inbox}
              className={
                pathname === PageLink.Inbox ? styles.selectedLink : styles.link
              }
            >
              <FaInbox />
              <span>Inbox</span>
            </Link>
          </li>
          <li className={styles.listItem}>
            <Link
              href={PageLink.Starred}
              className={
                pathname === PageLink.Starred
                  ? styles.selectedLink
                  : styles.link
              }
            >
              <FaRegStar />
              <span>Starred</span>
            </Link>
          </li>
          <li className={styles.listItem}>
            <Link
              href={PageLink.Sent}
              className={
                pathname === PageLink.Sent ? styles.selectedLink : styles.link
              }
            >
              <FaRegPaperPlane />
              <span>Sent</span>
            </Link>
          </li>
          <li className={styles.listItem}>
            <Link
              href={PageLink.Trash}
              className={
                pathname === PageLink.Trash ? styles.selectedLink : styles.link
              }
            >
              <FaRegTrashAlt />
              <span>Trash</span>
            </Link>
          </li>
        </ul>
      </aside>
    </React.Fragment>
  );
}
