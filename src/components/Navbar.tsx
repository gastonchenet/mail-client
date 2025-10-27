"use client";

import { MdMarkunreadMailbox } from "react-icons/md";
import styles from "./Navbar.module.scss";
import Link from "next/link";
import React, { useState } from "react";
import Hamburger from "hamburger-react";
import {
  FaInbox,
  FaRegPaperPlane,
  FaRegStar,
  FaRegTrashAlt,
} from "react-icons/fa";

export default function Navbar() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
          <Hamburger size={24} />
        </div>
      </nav>
      <aside className={styles.links}>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <Link href="/" className={styles.link}>
              <FaInbox />
              <span>Inbox</span>
            </Link>
          </li>
          <li className={styles.listItem}>
            <Link href="/starred" className={styles.link}>
              <FaRegStar />
              <span>Starred</span>
            </Link>
          </li>
          <li className={styles.listItem}>
            <Link href="/sent" className={styles.link}>
              <FaRegPaperPlane />
              <span>Sent</span>
            </Link>
          </li>
          <li className={styles.listItem}>
            <Link href="/trash" className={styles.link}>
              <FaRegTrashAlt />
              <span>Trash</span>
            </Link>
          </li>
        </ul>
      </aside>
    </React.Fragment>
  );
}
