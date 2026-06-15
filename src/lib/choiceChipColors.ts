import { BRAND_COLORS } from "@/lib/brandColors";

export interface ChoiceChipStyle {
  background: string;
  color: string;
}

interface ChipThemePair {
  light: ChoiceChipStyle;
  dark: ChoiceChipStyle;
}

export function resolveChipStyle(pair: ChipThemePair, isDark: boolean): ChoiceChipStyle {
  return isDark ? pair.dark : pair.light;
}

/** רקע + טקסט בוהקים לפי מצב תצוגה */
export const CHIP_THEMES = {
  golden: {
    light: { background: "rgba(244, 188, 117, 0.72)", color: "#7a5208" },
    dark: { background: "rgba(247, 164, 43, 0.42)", color: "#ffe2a8" },
  },
  periwinkle: {
    light: { background: "rgba(136, 150, 202, 0.62)", color: "#3d4a82" },
    dark: { background: "rgba(136, 150, 202, 0.38)", color: "#d4dcff" },
  },
  orange: {
    light: { background: "rgba(247, 164, 43, 0.68)", color: "#7a4e08" },
    dark: { background: "rgba(247, 164, 43, 0.4)", color: "#ffd899" },
  },
  pink: {
    light: { background: "rgba(248, 189, 190, 0.78)", color: "#9a3f42" },
    dark: { background: "rgba(248, 189, 190, 0.32)", color: "#ffd4d5" },
  },
  lavender: {
    light: { background: "rgba(198, 171, 195, 0.65)", color: "#6b4f68" },
    dark: { background: "rgba(198, 171, 195, 0.34)", color: "#f0d8ee" },
  },
  peach: {
    light: { background: "rgba(250, 209, 163, 0.75)", color: "#8a5a18" },
    dark: { background: "rgba(250, 209, 163, 0.32)", color: "#ffe8c8" },
  },
  neutral: {
    light: { background: "rgba(130, 133, 149, 0.28)", color: BRAND_COLORS.gray700 },
    dark: { background: "rgba(168, 170, 184, 0.22)", color: BRAND_COLORS.gray300 },
  },
} satisfies Record<string, ChipThemePair>;
