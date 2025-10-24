import type { Metadata } from "next";
import "./globals.scss";
import { Rubik } from "next/font/google";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.scss";

type RootLayout = {
  children: React.ReactNode;
};

const rubik = Rubik({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mail client",
};

export default function RootLayout({ children }: Readonly<RootLayout>) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <main className={styles.container}>
          <Navbar />
          <div className={styles.content}>
            <Sidebar />
            <div className={styles.children}>{children}</div>
          </div>
        </main>
      </body>
    </html>
  );
}
