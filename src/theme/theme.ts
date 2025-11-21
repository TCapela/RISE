import { LinearGradient } from "expo-linear-gradient";

const darkTheme = {
  mode: "dark" as const,
  colors: {
    background: "#0B0D13",
    surface: "#0F1220",
    surfaceAlt: "#14182A",
    glass: "rgba(255,255,255,0.04)",
    primary: "#4EF2C3",
    primaryAlt: "#24D8A8",
    accent: "#B86BFF",
    text: "#E7ECF7",
    textMuted: "#9AA3B2",
    border: "rgba(255,255,255,0.08)",
    shadow: "rgba(0,0,0,0.45)",
    tabInactive: "#738099",
    warn: "#F2B24B",
    success: "#22D07F",
    danger: "#F97171",
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 },
  motion: { fast: 120, base: 200, slow: 350 },
  gradients: {
    bg: ["#0B0D13", "#0E1220"],
    prime: ["#24D8A8", "#B86BFF"],
  },
  LinearGradient,
};

export type Theme = typeof darkTheme;

export function useTheme(): Theme {
  return darkTheme;
}
