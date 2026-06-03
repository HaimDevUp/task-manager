import { ARRIVAL_STATUSES, type ArrivalStatus } from "@/types/workTime";
import { BRAND_COLORS } from "@/lib/brandColors";

export interface ArrivalStatusStyle {
  icon: string;
  background: string;
  color: string;
}

export const ARRIVAL_STATUS_STYLES: Record<ArrivalStatus, ArrivalStatusStyle> = {
  הגיע: {
    icon: "✓",
    background: "rgba(117, 189, 111, 0.22)",
    color: "#4a8f45",
  },
  חופש: {
    icon: "🏖",
    background: "rgba(75, 200, 200, 0.22)",
    color: BRAND_COLORS.teal,
  },
  "חצי יום חופש": {
    icon: "🕐",
    background: "rgba(232, 185, 35, 0.24)",
    color: "#9a7b10",
  },
  מחלה: {
    icon: "🤒",
    background: "rgba(219, 107, 107, 0.2)",
    color: "#b84a4a",
  },
  חג: {
    icon: "✦",
    background: "rgba(58, 47, 205, 0.14)",
    color: BRAND_COLORS.indigo,
  },
  "ערב חג": {
    icon: "🌙",
    background: "rgba(54, 184, 159, 0.2)",
    color: "#2a8f7c",
  },
  היעדרות: {
    icon: "⊘",
    background: "rgba(125, 135, 158, 0.18)",
    color: BRAND_COLORS.gray700,
  },
};

export const ARRIVAL_STATUS_PLACEHOLDER: ArrivalStatusStyle & { label: string } =
  {
    label: "בחר...",
    icon: "◎",
    background: BRAND_COLORS.gray100,
    color: BRAND_COLORS.gray500,
  };

export function getArrivalStatusStyle(
  status: ArrivalStatus | null
): ArrivalStatusStyle & { label: string } {
  if (!status) return ARRIVAL_STATUS_PLACEHOLDER;
  return { ...ARRIVAL_STATUS_STYLES[status], label: status };
}

export { ARRIVAL_STATUSES };
