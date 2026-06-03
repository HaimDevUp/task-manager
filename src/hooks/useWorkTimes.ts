"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "@/services/apiClient";
import { mergeMonthDays, getCurrentYearMonth } from "@/lib/workTimeUtils";
import type { UpsertWorkDayInput, WorkDayEntry } from "@/types/workTime";

export function useWorkTimes(employeeId: string) {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth);
  const [savedEntries, setSavedEntries] = useState<WorkDayEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isFirstLoadRef = useRef(true);

  const { year, month } = yearMonth;

  useEffect(() => {
    isFirstLoadRef.current = true;
    setInitialLoading(true);
    setSavedEntries([]);
  }, [employeeId]);

  const loadMonth = useCallback(async () => {
    if (!employeeId) return;
    const showSkeleton = isFirstLoadRef.current;
    try {
      setError(null);
      if (showSkeleton) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      const entries = await api.fetchWorkDays(employeeId, year, month);
      setSavedEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינה");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      isFirstLoadRef.current = false;
    }
  }, [employeeId, year, month]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const days = useMemo(() => {
    const merged = mergeMonthDays(year, month, savedEntries).map((day) => ({
      ...day,
      employeeId,
    }));
    return merged;
  }, [year, month, savedEntries, employeeId]);

  const goToPrevMonth = useCallback(() => {
    setYearMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { ...prev, month: prev.month - 1 };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setYearMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: prev.month + 1 };
    });
  }, []);

  const saveDay = useCallback(
    async (input: UpsertWorkDayInput): Promise<WorkDayEntry | null> => {
      try {
        setSaving(true);
        setError(null);
        const entry = await api.upsertWorkDay(input);
        setSavedEntries((prev) => {
          const idx = prev.findIndex((e) => e.date === entry.date);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = entry;
            return next;
          }
          return [...prev, entry];
        });
        return entry;
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בשמירה");
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    year,
    month,
    days,
    initialLoading,
    refreshing,
    error,
    saving,
    goToPrevMonth,
    goToNextMonth,
    saveDay,
    reload: loadMonth,
  };
}
