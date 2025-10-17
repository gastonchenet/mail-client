import type { Metadata } from "next";
import "./globals.scss";

type RootLayout = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Mail client",
};

export default function RootLayout({ children }: Readonly<RootLayout>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
