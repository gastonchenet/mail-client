import type { Metadata } from "next";
import "./globals.scss";
import { Rubik } from "next/font/google";

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
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
