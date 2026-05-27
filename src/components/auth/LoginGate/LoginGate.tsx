"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import styles from "./LoginGate.module.scss";

type LoginGateProps = {
  children: ReactNode;
};

export function LoginGate({ children }: LoginGateProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "התחברות נכשלה");
        return;
      }

      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("שגיאת רשת — נסה שוב");
    } finally {
      setSubmitting(false);
    }
  }

  if (authenticated === null) {
    return (
      <div className={styles.screen}>
        <p className={styles.loading}>טוען...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <h1 className={styles.title}>UpNext Manager</h1>
          <p className={styles.subtitle}>הזן סיסמה כדי להמשיך</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              סיסמה
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
              />
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button
              type="submit"
              className={styles.submit}
              disabled={submitting || !password}
            >
              {submitting ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
