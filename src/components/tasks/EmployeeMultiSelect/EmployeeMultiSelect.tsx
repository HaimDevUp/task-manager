"use client";

import { employees } from "../../../../config/employees";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import styles from "./EmployeeMultiSelect.module.scss";

interface EmployeeMultiSelectProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function EmployeeMultiSelect({
  selected,
  onChange,
}: EmployeeMultiSelectProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={styles.grid} role="group" aria-label="בחירת עובדים">
      {employees.map((emp) => {
        const isSelected = selected.includes(emp.id);
        return (
          <button
            key={emp.id}
            type="button"
            className={`${styles.option} ${isSelected ? styles.selected : ""}`}
            onClick={() => toggle(emp.id)}
            aria-pressed={isSelected}
          >
            <Avatar src={emp.image} alt={emp.name} size="sm" />
            <span>{emp.name}</span>
            {isSelected && <span className={styles.check}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
