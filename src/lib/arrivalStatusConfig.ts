import { ARRIVAL_STATUSES, type ArrivalStatus } from "@/types/workTime";
import { CHIP_THEMES, resolveChipStyle } from "@/lib/choiceChipColors";

export interface ArrivalStatusStyle {
  icon: string;
  background: string;
  color: string;
}

const ARRIVAL_STATUS_THEMES: Record<
  ArrivalStatus,
  { icon: string; theme: keyof typeof CHIP_THEMES }
> = {
  הגיע: { icon: "✓", theme: "golden" },
  חופש: { icon: "🏖", theme: "periwinkle" },
  "חצי יום חופש": { icon: "🕐", theme: "orange" },
  מחלה: { icon: "🤒", theme: "pink" },
  חג: { icon: "✦", theme: "lavender" },
  "ערב חג": { icon: "🌙", theme: "peach" },
  היעדרות: { icon: "⊘", theme: "neutral" },
};

export const ARRIVAL_STATUS_PLACEHOLDER: ArrivalStatusStyle & { label: string } =
  {
    label: "בחר...",
    icon: "◎",
    background: "var(--bg-secondary)",
    color: "var(--text-muted)",
  };

export function getArrivalStatusStyle(
  status: ArrivalStatus | null,
  isDark = false
): ArrivalStatusStyle & { label: string } {
  if (!status) return ARRIVAL_STATUS_PLACEHOLDER;

  const entry = ARRIVAL_STATUS_THEMES[status];
  const chip = resolveChipStyle(CHIP_THEMES[entry.theme], isDark);

  return {
    icon: entry.icon,
    label: status,
    ...chip,
  };
}

export { ARRIVAL_STATUSES };
