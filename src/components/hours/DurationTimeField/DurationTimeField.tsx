"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatDurationInput,
  parseDurationParts,
} from "@/lib/workTimeUtils";
import styles from "./DurationTimeField.module.scss";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

interface DurationTimeFieldProps {
  /** סה״כ דקות עבודה */
  minutes: number;
  onChange: (minutes: number) => void;
  placeholder?: string;
}

export function DurationTimeField({
  minutes,
  onChange,
  placeholder = "—",
}: DurationTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const parts = parseDurationParts(minutes);
  const [draftHours, setDraftHours] = useState(parts.hours);
  const [draftMinutes, setDraftMinutes] = useState(parts.minutes);

  useEffect(() => {
    if (open) {
      const p = parseDurationParts(minutes);
      setDraftHours(p.hours);
      setDraftMinutes(p.minutes);
    }
  }, [open, minutes]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        fieldRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const display =
    minutes > 0 ? formatDurationInput(minutes) : null;

  const openPicker = useCallback(() => {
    setOpen(true);
  }, []);

  const apply = () => {
    onChange(draftHours * 60 + draftMinutes);
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={fieldRef}>
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
        aria-label={display ? `משך ${display} שעות` : "בחר משך עבודה"}
        aria-expanded={open}
      >
        <span className={display ? styles.value : styles.placeholder}>
          {display ?? placeholder}
        </span>
      </div>

      {open && (
        <div ref={popoverRef} className={styles.popover} role="dialog">
          <p className={styles.popoverTitle}>משך עבודה (שעות : דקות)</p>
          <div className={styles.selects}>
            <label>
              שעות
              <select
                value={draftHours}
                onChange={(e) => setDraftHours(Number(e.target.value))}
                className={styles.select}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.colon}>:</span>
            <label>
              דקות
              <select
                value={draftMinutes}
                onChange={(e) => setDraftMinutes(Number(e.target.value))}
                className={styles.select}
              >
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setOpen(false)}
            >
              ביטול
            </button>
            <button type="button" className={styles.primary} onClick={apply}>
              אישור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
