// Default demo for the StoryScene template: a short Bangla story with three original characters.
// Replace the lines with your own voice-over timings (or set srtSrc + voiceSrc) to make your own episode.
export const DEMO_STORY = {
  characters: [
    { id: "rafi", name: "রাফি", type: "boy" as const, skin: "#C68642", hair: "#1B1B1B", shirt: "#2E86DE", pants: "#34495E", color: "#4DD4FF" },
    { id: "nila", name: "নীলা", type: "girl" as const, skin: "#D9A066", hair: "#2B1B12", shirt: "#E84393", pants: "#F8C291", color: "#FF8FC8" },
    { id: "dadu", name: "দাদু", type: "elder" as const, skin: "#B9824F", hair: "#E5E5E5", shirt: "#F5F5F0", pants: "#D6D6D6", color: "#FFD84D" },
  ],
  lines: [
    { speaker: "nila", text: "রাফি, এত সকালে কোথায় যাচ্ছো?", start: 1.0, end: 3.6 },
    { speaker: "rafi", text: "নদীর ঘাটে! দাদু আজ নৌকায় ঘোরাবেন।", start: 3.9, end: 7.2 },
    { speaker: "dadu", text: "চলো দাদুভাই, নদী পার হই। শক্ত করে বসো!", start: 8.6, end: 11.8 },
    { speaker: "rafi", text: "ওয়াও! কী সুন্দর নদী!", start: 12.0, end: 14.4 },
    { speaker: "nila", text: "সন্ধ্যা হয়ে আসছে, চলো বাড়ি ফিরি।", start: 15.6, end: 18.6 },
    { speaker: "rafi", text: "হ্যাঁ, কাল আবার আসবো!", start: 18.9, end: 21.4 },
  ],
  voiceSrc: "",
  srtSrc: "",
  musicSrc: "",
  musicVolume: 0.35,
  subtitles: "karaoke" as const,
  scenes: [
    {
      start: 0, end: 8, background: "village" as const, time: "day" as const, extras: [], camera: "speaker" as const, transition: "cut" as const, title: "",
      cast: [
        { id: "rafi", x: 0.08, walk: [{ from: 0.2, to: 2.4, x: 0.36 }], emotions: [{ at: 3.9, value: "happy" as const }] },
        { id: "nila", x: 0.66, facing: "left" as const, gestures: [{ from: 0.4, to: 1.4, type: "wave" as const }] },
      ],
    },
    {
      start: 8, end: 15, background: "river" as const, time: "day" as const, extras: [], camera: "speaker" as const, transition: "iris" as const, title: "",
      cast: [
        { id: "rafi", x: 0.3, emotions: [{ at: 12, value: "surprised" as const }, { at: 13.2, value: "happy" as const }], gestures: [{ from: 12.4, to: 14.2, type: "cheer" as const }] },
        { id: "dadu", x: 0.66, emotions: [{ at: 8, value: "happy" as const }], gestures: [{ from: 8.8, to: 10.2, type: "point" as const }] },
      ],
    },
    {
      start: 15, end: 22, background: "road" as const, time: "sunset" as const, extras: [], camera: "pushIn" as const, transition: "wipe" as const, title: "",
      cast: [
        { id: "rafi", x: 0.36, emotions: [{ at: 18.9, value: "happy" as const }], gestures: [{ from: 19.2, to: 21, type: "wave" as const }] },
        { id: "nila", x: 0.6 },
      ],
    },
    {
      start: 22, end: 26.5, background: "night" as const, time: "night" as const, extras: [], camera: "pullOut" as const, transition: "fade" as const, title: "সমাপ্ত",
      cast: [
        { id: "rafi", x: 0.36, walk: [{ from: 22.2, to: 25.6, x: 0.7 }] },
        { id: "nila", x: 0.5, walk: [{ from: 22.2, to: 25.6, x: 0.84 }] },
      ],
    },
  ],
};
