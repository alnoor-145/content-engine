import { geoArea } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import world110 from "world-atlas/countries-110m.json";
import world50 from "world-atlas/countries-50m.json";

type CountryProps = { name: string };
export type Country = Feature<Geometry, CountryProps>;

const load = (topo: any): Country[] =>
  (feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, CountryProps>).features.filter((f) => f.properties.name !== "Antarctica");

// World countries from Natural Earth (public domain). 110m = light, for world views;
// 50m = more detailed coastlines, for zoomed-in country views.
export const COUNTRIES: Country[] = load(world110);
export const COUNTRIES_HD: Country[] = load(world50);

export const WORLD: FeatureCollection<Geometry, CountryProps> = { type: "FeatureCollection", features: COUNTRIES };

// Common short names and Bangla names → Natural Earth names.
const ALIASES: Record<string, string> = {
  usa: "United States of America", us: "United States of America", america: "United States of America", "united states": "United States of America",
  uk: "United Kingdom", england: "United Kingdom", britain: "United Kingdom", "great britain": "United Kingdom",
  uae: "United Arab Emirates", ksa: "Saudi Arabia", saudi: "Saudi Arabia", korea: "South Korea", "czech republic": "Czechia",
  "বাংলাদেশ": "Bangladesh", "ভারত": "India", "পাকিস্তান": "Pakistan", "নেপাল": "Nepal", "ভুটান": "Bhutan", "মিয়ানমার": "Myanmar", "শ্রীলঙ্কা": "Sri Lanka",
  "চীন": "China", "জাপান": "Japan", "সৌদি আরব": "Saudi Arabia", "সংযুক্ত আরব আমিরাত": "United Arab Emirates", "কাতার": "Qatar", "মালয়েশিয়া": "Malaysia",
  "যুক্তরাজ্য": "United Kingdom", "যুক্তরাষ্ট্র": "United States of America", "আমেরিকা": "United States of America", "রাশিয়া": "Russia", "কানাডা": "Canada",
  "অস্ট্রেলিয়া": "Australia", "তুরস্ক": "Turkey", "মিশর": "Egypt", "ইন্দোনেশিয়া": "Indonesia", "ফ্রান্স": "France", "জার্মানি": "Germany", "ইতালি": "Italy",
};

export const countryName = (name: string) => ALIASES[name.trim().toLowerCase()] ?? ALIASES[name.trim()] ?? name.trim();

export const countryByName = (name: string, hd = false) => {
  const wanted = countryName(name).toLowerCase();
  return (hd ? COUNTRIES_HD : COUNTRIES).find((c) => c.properties.name.toLowerCase() === wanted);
};

// Like countryByName, but throws a helpful error (shown in Studio) when the name is unknown.
export const requireCountry = (name: string, hd = false) => {
  const c = countryByName(name, hd);
  if (!c) throw new Error(`Unknown country "${name}". Use the English map name, e.g. "Bangladesh", "India", "United Kingdom", "United States of America".`);
  return c;
};

const EARTH_RADIUS_KM = 6371.0088;
export const areaKm2 = (f: Country) => geoArea(f) * EARTH_RADIUS_KM * EARTH_RADIUS_KM;
export const EARTH_KM = EARTH_RADIUS_KM;
