"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { AuthProvider, type AuthState } from "@/contexts/AuthContext";
import type { SessionUser } from "@/types/session";
import styles from "./LoginGate.module.scss";

type LoginGateProps = {
  children: ReactNode;
};

type SessionResponse = {
  authenticated: boolean;
  live: boolean;
  user: SessionUser | null;
  isAdmin: boolean;
};

export function LoginGate({ children }: LoginGateProps) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = (await res.json()) as SessionResponse;
      if (data.authenticated && data.user) {
        setAuthState({
          user: data.user,
          live: data.live,
          isAdmin: data.isAdmin,
        });
      } else {
        setAuthState(null);
      }
    } catch {
      setAuthState(null);
    }
  }, []);

  useEffect(() => {
    checkSession().finally(() => setChecked(true));
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
      await checkSession();
    } catch {
      setError("שגיאת רשת — נסה שוב");
    } finally {
      setSubmitting(false);
    }
  }

  if (!checked) {
    return (
      <div className={styles.screen}>
        <p className={styles.loading}>טוען...</p>
      </div>
    );
  }

  if (!authState) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <h1 className={styles.title}>UpNext Manager</h1>
          <p className={styles.subtitle}>הזן סיסמה אישית כדי להמשיך</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              סיסמה
              <span className={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className={styles.toggleVisibility}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M1 1l22 22" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
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

  return <AuthProvider value={authState}>{children}</AuthProvider>;
}
