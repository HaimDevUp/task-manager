"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { he } from "date-fns/locale";
import {
  formatDateFromInput,
  parseInputDate,
  dateToInputValue,
  HEBREW_WEEKDAY_LETTERS,
} from "@/lib/formatDate";
import "react-day-picker/style.css";
import styles from "./HebrewDatePicker.module.scss";

interface HebrewDatePickerProps {
  /** YYYY-MM-DD או מחרוזת ISO */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  /** פתוח תמיד (למשל בעריכת משימה) */
  inline?: boolean;
}

export function HebrewDatePicker({
  value,
  onChange,
  placeholder = "בחר תאריך יעד",
  allowClear = true,
  inline = false,
}: HebrewDatePickerProps) {
  const [open, setOpen] = useState(inline);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseInputDate(value);

  useEffect(() => {
    if (inline || !open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, inline]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(dateToInputValue(date));
    if (!inline) setOpen(false);
  };

  const calendar = (
    <div className={styles.calendarWrap}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        locale={he}
        dir="rtl"
        weekStartsOn={0}
        showOutsideDays
        className={styles.calendar}
        formatters={{
          formatWeekdayName: (date) =>
            HEBREW_WEEKDAY_LETTERS[date.getDay()],
        }}
        labels={{
          labelNext: () => "חודש הבא",
          labelPrevious: () => "חודש קודם",
          labelMonthDropdown: () => "חודש",
          labelYearDropdown: () => "שנה",
        }}
      />
      {allowClear && value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => {
            onChange("");
            if (!inline) setOpen(false);
          }}
        >
          הסר תאריך
        </button>
      )}
    </div>
  );

  if (inline) {
    return <div className={styles.root}>{calendar}</div>;
  }

  return (
    <div className={styles.root} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${!value ? styles.placeholder : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {value ? formatDateFromInput(value) : placeholder}
      </button>
      {open && <div className={styles.popover}>{calendar}</div>}
    </div>
  );
}
