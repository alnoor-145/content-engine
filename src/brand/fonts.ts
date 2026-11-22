// Loads brand fonts from Google Fonts so renders look identical on every machine.
// Bangla (বাংলা) text falls back to Hind Siliguri automatically, per glyph.
import { loadFont as loadHindSiliguri } from "@remotion/google-fonts/HindSiliguri";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

const poppins = loadPoppins("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });
const inter = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const hind = loadHindSiliguri("normal", { weights: ["400", "500", "600", "700"], subsets: ["bengali", "latin"] });

export const FONT_FAMILIES = {
  poppins: poppins.fontFamily,
  inter: inter.fontFamily,
  bangla: hind.fontFamily,
};
