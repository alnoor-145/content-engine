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
  channelName: "Mr N Boy",
} as const;

// Per-platform channel identity. YouTube formats use `youtube`, Facebook formats use `facebook`
// (see `platform` in src/formats.ts), so one video shows the right name on each platform.
export type Brand = {
  platform: "youtube" | "facebook";
  name: string;
  handle: string;
  url: string;
  follow: string; // button text before click
  following: string; // button text after click
  cta: string; // end screen call to action
  color: string; // platform button color
};

export const BRANDS: Record<Brand["platform"], Brand> = {
  youtube: {
    platform: "youtube",
    name: "Mr N Boy",
    handle: "@SubscribeYt_1",
    url: "https://www.youtube.com/@SubscribeYt_1",
    follow: "Subscribe",
    following: "Subscribed",
    cta: "SUBSCRIBE",
    color: "#FF0000",
  },
  facebook: {
    platform: "facebook",
    name: "Al NUR",
    handle: "Al NUR",
    url: "https://www.facebook.com/share/1HYnZ8SaYY/",
    follow: "Follow",
    following: "Following",
    cta: "FOLLOW",
    color: "#1877F2",
  },
};
