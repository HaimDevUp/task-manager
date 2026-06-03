"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      dir="rtl"
      position="bottom-left"
      theme="light"
      richColors
      closeButton
      toastOptions={{
        duration: 3500,
      }}
    />
  );
}
