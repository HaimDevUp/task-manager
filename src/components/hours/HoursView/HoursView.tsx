"use client";

import { useCallback } from "react";
import { EmployeeTabs } from "@/components/employees/EmployeeTabs/EmployeeTabs";
import { HoursTimesheet } from "@/components/hours/HoursTimesheet/HoursTimesheet";
import { useWorkTimes } from "@/hooks/useWorkTimes";
import type { UpsertWorkDayInput } from "@/types/workTime";
import styles from "./HoursView.module.scss";

interface HoursViewProps {
  selectedEmployeeId: string;
  onEmployeeSelect: (id: string) => void;
  mobileView: "employees" | "timesheet";
  showEmployeeSidebar: boolean;
  employeeColWidth?: string;
}

export function HoursView({
  selectedEmployeeId,
  onEmployeeSelect,
  mobileView,
  showEmployeeSidebar,
  employeeColWidth,
}: HoursViewProps) {
  const {
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
  } = useWorkTimes(selectedEmployeeId);

  const handleSaveDay = useCallback(
    async (
      date: string,
      patch: Omit<UpsertWorkDayInput, "employeeId" | "date">
    ) => {
      return saveDay({
        employeeId: selectedEmployeeId,
        date,
        ...patch,
      });
    },
    [saveDay, selectedEmployeeId]
  );

  return (
    <div
      className={`${styles.layout} ${!showEmployeeSidebar ? styles.layoutFullWidth : ""}`}
    >
      {showEmployeeSidebar && employeeColWidth ? (
        <div
          className={`${styles.employeesCol} ${mobileView === "employees" ? styles.mobileVisible : ""}`}
          style={{ width: employeeColWidth }}
        >
          <EmployeeTabs
            selectedId={selectedEmployeeId}
            onSelect={onEmployeeSelect}
            showCreateButton={false}
            includeUnassigned={false}
          />
        </div>
      ) : null}
      <div
        className={`${styles.mainCol} ${!showEmployeeSidebar || mobileView === "timesheet" ? styles.mobileVisible : ""}`}
      >
        <HoursTimesheet
          days={days}
          year={year}
          month={month}
          initialLoading={initialLoading}
          refreshing={refreshing}
          error={error}
          saving={saving}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onSaveDay={(date, patch) => handleSaveDay(date, patch)}
        />
      </div>
    </div>
  );
}
