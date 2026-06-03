"use client";

import { useCallback, useRef } from "react";
import { currentTimeString } from "@/lib/workTimeUtils";
import styles from "./ClockTimeField.module.scss";

interface ClockTimeFieldProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ClockTimeField({
  value,
  onChange,
  placeholder = "—",
}: ClockTimeFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    if (!value) {
      input.value = currentTimeString();
    }
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  }, [value]);

  const handleChange = (next: string) => {
    if (next) onChange(next);
  };

  return (
    <div
      className={styles.field}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={value ? `שעה ${value}` : "בחר שעה"}
    >
      <span className={value ? styles.value : styles.placeholder}>
        {value ?? placeholder}
      </span>
      <input
        ref={inputRef}
        type="time"
        className={styles.nativeInput}
        value={value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
