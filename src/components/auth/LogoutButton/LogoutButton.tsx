"use client";

import { useState } from "react";
import styles from "./LogoutButton.module.scss";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.logoutBtn}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "מתנתק..." : "התנתקות"}
    </button>
  );
}
