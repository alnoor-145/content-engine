// Split text into user-perceived characters (graphemes) so Bangla conjuncts
// like "ক্ষ" or "স্ত্র" are never broken apart by per-character animations.
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export const graphemes = (text: string): string[] => Array.from(segmenter.segment(text), (s) => s.segment);

export const isBangla = (text: string) => /[ঀ-৿]/.test(text);
