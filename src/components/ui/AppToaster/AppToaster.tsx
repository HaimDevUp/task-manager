"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      dir="rtl"
      position="bottom-left"
      theme={theme}
      richColors
      closeButton
      toastOptions={{
        duration: 3500,
      }}
    />
  );
}
