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
    background: "rgba(244, 188, 117, 0.28)",
    color: "#b8862e",
  },
  חופש: {
    icon: "🏖",
    background: "rgba(136, 150, 202, 0.24)",
    color: BRAND_COLORS.periwinkle,
  },
  "חצי יום חופש": {
    icon: "🕐",
    background: "rgba(247, 164, 43, 0.28)",
    color: "#b8781f",
  },
  מחלה: {
    icon: "🤒",
    background: "rgba(248, 189, 190, 0.32)",
    color: "#c96a6b",
  },
  חג: {
    icon: "✦",
    background: "rgba(198, 171, 195, 0.24)",
    color: BRAND_COLORS.lavender,
  },
  "ערב חג": {
    icon: "🌙",
    background: "rgba(250, 209, 163, 0.28)",
    color: "#c9975a",
  },
  היעדרות: {
    icon: "⊘",
    background: "rgba(130, 133, 149, 0.18)",
    color: BRAND_COLORS.gray700,
  },
};

export const ARRIVAL_STATUS_PLACEHOLDER: ArrivalStatusStyle & { label: string } =
  {
    label: "בחר...",
    icon: "◎",
    background: "var(--bg-secondary)",
    color: "var(--text-muted)",
  };

export function getArrivalStatusStyle(
  status: ArrivalStatus | null
): ArrivalStatusStyle & { label: string } {
  if (!status) return ARRIVAL_STATUS_PLACEHOLDER;
  return { ...ARRIVAL_STATUS_STYLES[status], label: status };
}

export { ARRIVAL_STATUSES };
