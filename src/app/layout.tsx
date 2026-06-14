import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { themeInitScript } from "@/lib/theme";
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
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={styles.body}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
