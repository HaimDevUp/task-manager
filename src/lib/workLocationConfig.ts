import { WORK_LOCATIONS, type WorkLocation } from "@/types/workTime";
import { CHIP_THEMES, resolveChipStyle } from "@/lib/choiceChipColors";

export interface WorkLocationStyle {
  icon: string;
  background: string;
  color: string;
}

const WORK_LOCATION_THEMES: Record<
  WorkLocation,
  { icon: string; theme: keyof typeof CHIP_THEMES }
> = {
  בית: { icon: "🏠", theme: "peach" },
  משרד: { icon: "🏢", theme: "periwinkle" },
  חוץ: { icon: "🌳", theme: "golden" },
};

export const WORK_LOCATION_PLACEHOLDER: WorkLocationStyle & { label: string } = {
  label: "בחר...",
  icon: "◎",
  background: "var(--bg-secondary)",
  color: "var(--text-muted)",
};

export function getWorkLocationStyle(
  location: WorkLocation | null,
  isDark = false
): WorkLocationStyle & { label: string } {
  if (!location) return WORK_LOCATION_PLACEHOLDER;

  const entry = WORK_LOCATION_THEMES[location];
  const chip = resolveChipStyle(CHIP_THEMES[entry.theme], isDark);

  return {
    icon: entry.icon,
    label: location,
    ...chip,
  };
}

export { WORK_LOCATIONS };
