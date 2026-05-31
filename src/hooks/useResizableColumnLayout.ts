"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_COLUMN_WIDTHS: [number, number, number] = [20, 20, 60];
const MIN_COLUMN_PERCENT = 12;
const STORAGE_KEY = "task-manager-column-widths";

function isValidWidths(value: unknown): value is [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) return false;
  const nums = value.map((n) => Number(n));
  if (nums.some((n) => !Number.isFinite(n) || n < MIN_COLUMN_PERCENT)) {
    return false;
  }
  const sum = nums[0] + nums[1] + nums[2];
  return Math.abs(sum - 100) < 0.5;
}

function loadWidths(): [number, number, number] {
  if (typeof window === "undefined") return DEFAULT_COLUMN_WIDTHS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMN_WIDTHS;
    const parsed: unknown = JSON.parse(raw);
    return isValidWidths(parsed) ? parsed : DEFAULT_COLUMN_WIDTHS;
  } catch {
    return DEFAULT_COLUMN_WIDTHS;
  }
}

export function useResizableColumnLayout() {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<[number, number, number]>(() =>
    typeof window !== "undefined" ? loadWidths() : DEFAULT_COLUMN_WIDTHS
  );
  const [activeResizer, setActiveResizer] = useState<0 | 1 | null>(null);
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  }, [widths]);

  const startResize = useCallback(
    (index: 0 | 1) => (e: React.MouseEvent) => {
      e.preventDefault();
      setActiveResizer(index);
    },
    []
  );

  useEffect(() => {
    if (activeResizer === null) return;

    const onMove = (e: MouseEvent) => {
      const el = layoutRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // RTL: עמודות זורמות מימין; אחוזים נמדדים מקצה ימין
      const xPercent = ((rect.right - e.clientX) / rect.width) * 100;
      const [w1, w2, w3] = widthsRef.current;

      if (activeResizer === 0) {
        const maxW1 = 100 - MIN_COLUMN_PERCENT - w3;
        const newW1 = Math.max(
          MIN_COLUMN_PERCENT,
          Math.min(maxW1, xPercent)
        );
        const newW2 = 100 - w3 - newW1;
        if (newW2 < MIN_COLUMN_PERCENT) return;
        setWidths([newW1, newW2, w3]);
        return;
      }

      const maxW2 = 100 - MIN_COLUMN_PERCENT - w1;
      const newW2 = Math.max(
        MIN_COLUMN_PERCENT,
        Math.min(maxW2, xPercent - w1)
      );
      const newW3 = 100 - w1 - newW2;
      if (newW3 < MIN_COLUMN_PERCENT) return;
      setWidths([w1, newW2, newW3]);
    };

    const onUp = () => setActiveResizer(null);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [activeResizer]);

  const boundary1 = widths[0];
  const boundary2 = widths[0] + widths[1];

  return {
    layoutRef,
    widths,
    startResize,
    activeResizer,
    boundary1,
    boundary2,
  };
}
