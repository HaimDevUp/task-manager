"use client";

import { useTheme } from "@/contexts/ThemeContext";
import styles from "./ThemeToggle.module.scss";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? "עבור למצב בהיר" : "עבור למצב כהה"}
      title={isDark ? "מצב בהיר" : "מצב כהה"}
    >
      <span
        className={`${styles.track} ${isDark ? styles.trackDark : ""}`}
        aria-hidden="true"
      >
        <span className={styles.thumb}>
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 15a4 4 0 110-8 4 4 0 010 8zm8-4a1 1 0 010 2h-1a1 1 0 110-2h1zM5 14a1 1 0 110 2H4a1 1 0 110-2h1zm12.95-6.95a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM7.05 16.95a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM18 12a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM6 12a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm11.95 6.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM7.05 7.05a1 1 0 011.414 0l.707.707A1 1 0 119.878 6.34l-.707-.707a1 1 0 00-1.414 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 14.5A7.5 7.5 0 0110.5 4 7.5 7.5 0 0014.5 21a7.5 7.5 0 006.5-6.5z" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
