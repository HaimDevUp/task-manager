"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/types/session";

export interface AuthState {
  user: SessionUser;
  live: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthState;
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthOptional(): AuthState | null {
  return useContext(AuthContext);
}

export function useAuthUser(): SessionUser {
  return useAuth().user;
}
