export type ThemeName = "parchment" | "midnight" | "rose" | "forest" | "mono";
export type Theme = {
  name: string;
  hindi: string;
  mood: string;
  bg: string;
  surface: string;
  soft: string;
  primary: string;
  primaryEnd: string;
  onPrimary: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  wash: string;
  gradientStart: string;
  gradientEnd: string;
  glow: string;
  glowSecondary: string;
  motif: "hearts" | "botanical" | "none";
  dark: boolean;
};
export const themes: Record<ThemeName, Theme> = {
  parchment: {
    name: "Classic Parchment",
    hindi: "क्लासिक पार्चमेंट",
    mood: "Warm parchment, a golden afternoon",
    bg: "#F7F2E8",
    surface: "#FFFCF5",
    soft: "#EEE5D6",
    primary: "#743A40",
    primaryEnd: "#60333E",
    onPrimary: "#FFFFFF",
    text: "#342B27",
    muted: "#6F6155",
    border: "#DFD4C3",
    accent: "#866329",
    wash: "#EADDCF",
    gradientStart: "#F9EBD3",
    gradientEnd: "#F7EBE4",
    glow: "#DAB771",
    glowSecondary: "#CA8F87",
    motif: "none",
    dark: false,
  },
  midnight: {
    name: "Midnight Ink",
    hindi: "मिडनाइट इंक",
    mood: "A quiet hour, a little gold",
    bg: "#151C29",
    surface: "#202A3A",
    soft: "#2A3546",
    primary: "#E0C58D",
    primaryEnd: "#C7A668",
    onPrimary: "#1A2230",
    text: "#F5EFDF",
    muted: "#B5B8C3",
    border: "#3B4555",
    accent: "#C9A775",
    wash: "#303C4D",
    gradientStart: "#1B2440",
    gradientEnd: "#17182D",
    glow: "#7A73CA",
    glowSecondary: "#C99F55",
    motif: "none",
    dark: true,
  },
  rose: {
    name: "Rose & Romance",
    hindi: "रोज़ एंड रोमांस",
    mood: "Blush pink, floating hearts, a little magic",
    bg: "#FFF0F6",
    surface: "#FFF4F9",
    soft: "#F9D5E5",
    primary: "#A82B64",
    primaryEnd: "#842654",
    onPrimary: "#FFFFFF",
    text: "#49152E",
    muted: "#7E3F5D",
    border: "#E9ACC9",
    accent: "#9F3E71",
    wash: "#F2B6D3",
    gradientStart: "#FFD6E7",
    gradientEnd: "#FCE9F9",
    glow: "#F875B2",
    glowSecondary: "#CE8DEC",
    motif: "hearts",
    dark: false,
  },
  forest: {
    name: "Forest Poetry",
    hindi: "फॉरेस्ट पोएट्री",
    mood: "Deep greens, soft leaves, woodland blooms",
    bg: "#0A211B",
    surface: "#123B2D",
    soft: "#194B39",
    primary: "#9CE8AE",
    primaryEnd: "#6DC998",
    onPrimary: "#0A291B",
    text: "#EDF8EA",
    muted: "#B0CDBB",
    border: "#2D5A42",
    accent: "#D9D89C",
    wash: "#245C41",
    gradientStart: "#0B3426",
    gradientEnd: "#102F29",
    glow: "#49AF65",
    glowSecondary: "#93B854",
    motif: "botanical",
    dark: true,
  },
  mono: {
    name: "Minimal Monochrome",
    hindi: "मिनिमल मोनोक्रोम",
    mood: "Deep blue, clean lines, a sapphire glow",
    bg: "#0A142B",
    surface: "#122441",
    soft: "#1B3457",
    primary: "#A4C9FF",
    primaryEnd: "#79A7F0",
    onPrimary: "#0A1C37",
    text: "#EDF4FF",
    muted: "#AFBED7",
    border: "#2A466E",
    accent: "#9AABEC",
    wash: "#233E68",
    gradientStart: "#102548",
    gradientEnd: "#111B36",
    glow: "#477BEA",
    glowSecondary: "#6775DD",
    motif: "none",
    dark: true,
  },
};
export const fonts = {
  serif: "Literary",
  hindi: "Devanagari",
  urdu: "Nastaliq",
  sans: "Interface",
};
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
