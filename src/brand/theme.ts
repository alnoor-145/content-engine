import { FONT_FAMILIES } from "./fonts";

// Your brand in one place. Change these and every template updates.
export const theme = {
  colors: {
    background: "#0B0F1A",
    surface: "#151B2E",
    primary: "#FF4D6D",
    secondary: "#4DD4FF",
    accent: "#FFD84D",
    text: "#F5F7FF",
    muted: "#8A93B2",
  },
  fonts: {
    // English uses Poppins/Inter; any Bangla characters fall back to Hind Siliguri.
    heading: `${FONT_FAMILIES.poppins}, ${FONT_FAMILIES.bangla}, 'Nirmala UI', sans-serif`,
    body: `${FONT_FAMILIES.inter}, ${FONT_FAMILIES.bangla}, 'Nirmala UI', sans-serif`,
    bangla: `${FONT_FAMILIES.bangla}, 'Nirmala UI', sans-serif`,
    mono: "'JetBrains Mono', Consolas, monospace",
  },
  channelName: "My Channel",
} as const;
