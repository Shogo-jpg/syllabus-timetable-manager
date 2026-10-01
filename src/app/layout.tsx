import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "シラバスノート | 時間割マネージャー",
  description: "時間割と授業情報をひとつにまとめる学生向けマネージャー",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
