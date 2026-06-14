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
    background: "rgba(250, 209, 163, 0.28)",
    color: "#c9975a",
  },
  משרד: {
    icon: "🏢",
    background: "rgba(136, 150, 202, 0.2)",
    color: BRAND_COLORS.periwinkle,
  },
  חוץ: {
    icon: "🌳",
    background: "rgba(244, 188, 117, 0.28)",
    color: "#b8862e",
  },
};

export const WORK_LOCATION_PLACEHOLDER: WorkLocationStyle & { label: string } = {
  label: "בחר...",
  icon: "◎",
  background: "var(--bg-secondary)",
  color: "var(--text-muted)",
};

export function getWorkLocationStyle(
  location: WorkLocation | null
): WorkLocationStyle & { label: string } {
  if (!location) return WORK_LOCATION_PLACEHOLDER;
  return { ...WORK_LOCATION_STYLES[location], label: location };
}

export { WORK_LOCATIONS };
