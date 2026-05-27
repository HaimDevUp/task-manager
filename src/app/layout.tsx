import type { Metadata } from "next";
import "@/styles/globals.scss";
import styles from "./layout.module.scss";

export const metadata: Metadata = {
  title: "UpNext Manager",
  description: "מערכת פנימית לניהול משימות לפי עובדים",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={styles.body}>{children}</body>
    </html>
  );
}
