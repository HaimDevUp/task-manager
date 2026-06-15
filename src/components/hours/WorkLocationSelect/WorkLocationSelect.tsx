"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { WorkLocation } from "@/types/workTime";
import {
  WORK_LOCATIONS,
  WORK_LOCATION_PLACEHOLDER,
  getWorkLocationStyle,
} from "@/lib/workLocationConfig";
import styles from "../ArrivalStatusSelect/ArrivalStatusSelect.module.scss";

interface WorkLocationSelectProps {
  value: WorkLocation | null;
  onChange: (value: WorkLocation | null) => void;
}

export function WorkLocationSelect({ value, onChange }: WorkLocationSelectProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = getWorkLocationStyle(value, isDark);

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

  const select = (location: WorkLocation | null) => {
    onChange(location);
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
        aria-label={
          value ? `מיקום עבודה: ${value}` : "בחר מיקום עבודה"
        }
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
        <ul className={styles.menu} role="listbox" aria-label="בחירת מיקום עבודה">
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              className={value === null ? styles.optionSelected : styles.option}
              style={{
                background: WORK_LOCATION_PLACEHOLDER.background,
                color: WORK_LOCATION_PLACEHOLDER.color,
              }}
              onClick={() => select(null)}
            >
              <span className={styles.icon} aria-hidden="true">
                {WORK_LOCATION_PLACEHOLDER.icon}
              </span>
              <span className={styles.label}>ללא בחירה</span>
              {value === null && (
                <span className={styles.selectedMark} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          </li>
          {WORK_LOCATIONS.map((location) => {
            const opt = getWorkLocationStyle(location, isDark);
            const isSelected = location === value;

            return (
              <li key={location} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={isSelected ? styles.optionSelected : styles.option}
                  style={{
                    background: opt.background,
                    color: opt.color,
                  }}
                  onClick={() => select(location)}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span className={styles.label}>{location}</span>
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
