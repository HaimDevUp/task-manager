"use client";

import { useRef, useCallback, useEffect } from "react";

interface AutoGrowTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minRows?: number;
  autoFocus?: boolean;
}

export function AutoGrowTextarea({
  value,
  onChange,
  className,
  minRows = 8,
  autoFocus = false,
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const style = getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const paddingY =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const minHeight = lineHeight * minRows + paddingY;

    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [minRows]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
      resize();
    }
  }, [autoFocus, resize]);

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      rows={minRows}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
    />
  );
}
