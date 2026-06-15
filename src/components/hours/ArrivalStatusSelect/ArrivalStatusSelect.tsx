"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ArrivalStatus } from "@/types/workTime";
import {
  ARRIVAL_STATUSES,
  ARRIVAL_STATUS_PLACEHOLDER,
  getArrivalStatusStyle,
} from "@/lib/arrivalStatusConfig";
import styles from "./ArrivalStatusSelect.module.scss";

interface ArrivalStatusSelectProps {
  value: ArrivalStatus | null;
  onChange: (value: ArrivalStatus | null) => void;
}

export function ArrivalStatusSelect({
  value,
  onChange,
}: ArrivalStatusSelectProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = getArrivalStatusStyle(value, isDark);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const select = (status: ArrivalStatus | null) => {
    onChange(status);
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        style={{
          background: current.background,
          color: current.color,
        }}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={value ? `סטטוס הגעה: ${value}` : "בחר סטטוס הגעה"}
      >
        <span className={styles.icon} aria-hidden="true">
          {current.icon}
        </span>
        <span className={styles.label}>{current.label}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox" aria-label="בחירת סטטוס הגעה">
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              className={value === null ? styles.optionSelected : styles.option}
              style={{
                background: ARRIVAL_STATUS_PLACEHOLDER.background,
                color: ARRIVAL_STATUS_PLACEHOLDER.color,
              }}
              onClick={() => select(null)}
            >
              <span className={styles.icon} aria-hidden="true">
                {ARRIVAL_STATUS_PLACEHOLDER.icon}
              </span>
              <span className={styles.label}>ללא בחירה</span>
              {value === null && (
                <span className={styles.selectedMark} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          </li>
          {ARRIVAL_STATUSES.map((status) => {
            const opt = getArrivalStatusStyle(status, isDark);
            const isSelected = status === value;

            return (
              <li key={status} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={isSelected ? styles.optionSelected : styles.option}
                  style={{
                    background: opt.background,
                    color: opt.color,
                  }}
                  onClick={() => select(status)}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span className={styles.label}>{status}</span>
                  {isSelected && (
                    <span className={styles.selectedMark} aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
