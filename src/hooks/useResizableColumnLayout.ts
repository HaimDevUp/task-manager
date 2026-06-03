"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_COLUMN_WIDTHS: [number, number, number] = [20, 20, 60];
export const DEFAULT_TWO_COLUMN_WIDTHS: [number, number] = [38, 62];

const MIN_COLUMN_PERCENT = 12;
const STORAGE_KEY = "task-manager-column-widths";
const STORAGE_KEY_TWO = "task-manager-column-widths-2";

function isValidWidths3(value: unknown): value is [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) return false;
  const nums = value.map((n) => Number(n));
  if (nums.some((n) => !Number.isFinite(n) || n < MIN_COLUMN_PERCENT)) {
    return false;
  }
  const sum = nums[0] + nums[1] + nums[2];
  return Math.abs(sum - 100) < 0.5;
}

function isValidWidths2(value: unknown): value is [number, number] {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const nums = value.map((n) => Number(n));
  if (nums.some((n) => !Number.isFinite(n) || n < MIN_COLUMN_PERCENT)) {
    return false;
  }
  return Math.abs(nums[0] + nums[1] - 100) < 0.5;
}

function loadWidths3(): [number, number, number] {
  if (typeof window === "undefined") return DEFAULT_COLUMN_WIDTHS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMN_WIDTHS;
    const parsed: unknown = JSON.parse(raw);
    return isValidWidths3(parsed) ? parsed : DEFAULT_COLUMN_WIDTHS;
  } catch {
    return DEFAULT_COLUMN_WIDTHS;
  }
}

function loadWidths2(): [number, number] {
  if (typeof window === "undefined") return DEFAULT_TWO_COLUMN_WIDTHS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TWO);
    if (!raw) return DEFAULT_TWO_COLUMN_WIDTHS;
    const parsed: unknown = JSON.parse(raw);
    return isValidWidths2(parsed) ? parsed : DEFAULT_TWO_COLUMN_WIDTHS;
  } catch {
    return DEFAULT_TWO_COLUMN_WIDTHS;
  }
}

export type ColumnLayoutMode = 2 | 3;

export function useResizableColumnLayout(mode: ColumnLayoutMode = 3) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [widths3, setWidths3] = useState<[number, number, number]>(() =>
    typeof window !== "undefined" ? loadWidths3() : DEFAULT_COLUMN_WIDTHS
  );
  const [widths2, setWidths2] = useState<[number, number]>(() =>
    typeof window !== "undefined" ? loadWidths2() : DEFAULT_TWO_COLUMN_WIDTHS
  );
  const [activeResizer, setActiveResizer] = useState<0 | 1 | null>(null);
  const widths3Ref = useRef(widths3);
  const widths2Ref = useRef(widths2);
  widths3Ref.current = widths3;
  widths2Ref.current = widths2;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode === 2) {
      localStorage.setItem(STORAGE_KEY_TWO, JSON.stringify(widths2));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widths3));
    }
  }, [mode, widths2, widths3]);

  const startResize = useCallback(
    (index: 0 | 1) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (mode === 2 && index === 1) return;
      setActiveResizer(index);
    },
    [mode]
  );

  useEffect(() => {
    if (activeResizer === null) return;

    const onMove = (e: MouseEvent) => {
      const el = layoutRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const xPercent = ((rect.right - e.clientX) / rect.width) * 100;

      if (mode === 2) {
        const [w1, w2] = widths2Ref.current;
        const maxW1 = 100 - MIN_COLUMN_PERCENT;
        const newW1 = Math.max(MIN_COLUMN_PERCENT, Math.min(maxW1, xPercent));
        const newW2 = 100 - newW1;
        if (newW2 < MIN_COLUMN_PERCENT) return;
        setWidths2([newW1, newW2]);
        return;
      }

      const [w1, w2, w3] = widths3Ref.current;

      if (activeResizer === 0) {
        const maxW1 = 100 - MIN_COLUMN_PERCENT - w3;
        const newW1 = Math.max(
          MIN_COLUMN_PERCENT,
          Math.min(maxW1, xPercent)
        );
        const newW2 = 100 - w3 - newW1;
        if (newW2 < MIN_COLUMN_PERCENT) return;
        setWidths3([newW1, newW2, w3]);
        return;
      }

      const maxW2 = 100 - MIN_COLUMN_PERCENT - w1;
      const newW2 = Math.max(
        MIN_COLUMN_PERCENT,
        Math.min(maxW2, xPercent - w1)
      );
      const newW3 = 100 - w1 - newW2;
      if (newW3 < MIN_COLUMN_PERCENT) return;
      setWidths3([w1, newW2, newW3]);
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
  }, [activeResizer, mode]);

  if (mode === 2) {
    return {
      layoutRef,
      widths: widths2,
      widths3: undefined as undefined,
      startResize,
      activeResizer,
      boundary1: widths2[0],
      boundary2: widths2[0] + widths2[1],
      mode: 2 as const,
    };
  }

  return {
    layoutRef,
    widths: widths3,
    widths3,
    startResize,
    activeResizer,
    boundary1: widths3[0],
    boundary2: widths3[0] + widths3[1],
    mode: 3 as const,
  };
}
