import { WORK_LOCATIONS, type WorkLocation } from "@/types/workTime";
import { BRAND_COLORS } from "@/lib/brandColors";

export interface WorkLocationStyle {
  icon: string;
  background: string;
  color: string;
}

export const WORK_LOCATION_STYLES: Record<WorkLocation, WorkLocationStyle> = {
  בית: {
    icon: "🏠",
    background: "rgba(66, 210, 178, 0.22)",
    color: "#2a9a82",
  },
  משרד: {
    icon: "🏢",
    background: "rgba(44, 31, 252, 0.12)",
    color: BRAND_COLORS.indigo,
  },
  חוץ: {
    icon: "🌳",
    background: "rgba(117, 189, 111, 0.22)",
    color: "#4a8f45",
  },
};

export const WORK_LOCATION_PLACEHOLDER: WorkLocationStyle & { label: string } = {
  label: "בחר...",
  icon: "◎",
  background: BRAND_COLORS.gray100,
  color: BRAND_COLORS.gray500,
};

export function getWorkLocationStyle(
  location: WorkLocation | null
): WorkLocationStyle & { label: string } {
  if (!location) return WORK_LOCATION_PLACEHOLDER;
  return { ...WORK_LOCATION_STYLES[location], label: location };
}

export { WORK_LOCATIONS };
