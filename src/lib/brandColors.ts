/** צבעי מותג UpNext — מסונכרן עם src/styles/_palette.scss (לוגו SVG) */
export const BRAND_COLORS = {
  periwinkle: "#8896ca",
  lavender: "#c6abc3",
  pink: "#f8bdbe",
  peach: "#fad1a3",
  golden: "#f4bc75",
  orange: "#f7a42b",
  ink: "#2b2d42",
  white: "#ffffff",
  /** @deprecated השתמשו ב-periwinkle */
  blue: "#8896ca",
  /** @deprecated השתמשו ב-lavender */
  indigo: "#c6abc3",
  /** @deprecated השתמשו ב-pink */
  cyan: "#f8bdbe",
  /** @deprecated השתמשו ב-peach */
  mint: "#fad1a3",
  /** @deprecated השתמשו ב-golden */
  teal: "#f4bc75",
  coral: "#e07a7a",
  green: "#f4bc75",
  gray950: "#1a1c2e",
  gray900: "#2b2d42",
  gray700: "#4e5168",
  gray500: "#828595",
  gray400: "#a8aab8",
  gray300: "#cdd0dc",
  gray200: "#e4e6ef",
  gray100: "#f2f3f8",
  gray50: "#f8f9fc",
} as const;

export const BRAND_GRADIENT_STOPS = [
  { offset: "0%", color: BRAND_COLORS.periwinkle },
  { offset: "20%", color: BRAND_COLORS.lavender },
  { offset: "40%", color: BRAND_COLORS.pink },
  { offset: "60%", color: BRAND_COLORS.peach },
  { offset: "80%", color: BRAND_COLORS.golden },
  { offset: "100%", color: BRAND_COLORS.orange },
] as const;
