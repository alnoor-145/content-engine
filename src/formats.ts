// Output formats for each platform. Add a new one here and it becomes
// available to every template in Root.tsx.
export type Format = {
  id: string;
  label: string;
  width: number;
  height: number;
  fps: number;
};

export const FORMATS = {
  youtube: { id: "YouTube", label: "YouTube 16:9", width: 1920, height: 1080, fps: 30 },
  short: { id: "Short", label: "YouTube Shorts / Reels 9:16", width: 1080, height: 1920, fps: 30 },
  fbSquare: { id: "FB-Square", label: "Facebook 1:1", width: 1080, height: 1080, fps: 30 },
  fbFeed: { id: "FB-Feed", label: "Facebook feed 4:5", width: 1080, height: 1350, fps: 30 },
} satisfies Record<string, Format>;

export const ALL_FORMATS: Format[] = Object.values(FORMATS);
