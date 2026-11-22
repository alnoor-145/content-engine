// Output formats for each platform. Add a new one here and it becomes
// available to every template in Root.tsx.
export type Format = {
  id: string;
  label: string;
  width: number;
  height: number;
  fps: number;
  // Which channel branding (src/brand/theme.ts BRANDS) this format uses.
  platform: "youtube" | "facebook";
};

export const FORMATS = {
  youtube: { id: "YouTube", label: "YouTube 16:9", width: 1920, height: 1080, fps: 30, platform: "youtube" },
  short: { id: "Short", label: "YouTube Shorts 9:16", width: 1080, height: 1920, fps: 30, platform: "youtube" },
  fbReel: { id: "FB-Reel", label: "Facebook Reels 9:16", width: 1080, height: 1920, fps: 30, platform: "facebook" },
  fbSquare: { id: "FB-Square", label: "Facebook 1:1", width: 1080, height: 1080, fps: 30, platform: "facebook" },
  fbFeed: { id: "FB-Feed", label: "Facebook feed 4:5", width: 1080, height: 1350, fps: 30, platform: "facebook" },
} satisfies Record<string, Format>;

export const ALL_FORMATS: Format[] = Object.values(FORMATS);
