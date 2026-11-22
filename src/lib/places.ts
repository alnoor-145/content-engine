import { geoContains, geoDistance } from "d3-geo";
import { z } from "zod";
import { COUNTRIES, EARTH_KM } from "./geo";

// A place can be given just by name (looked up below) or with exact coordinates.
export const placeSchema = z.object({
  name: z.string(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});
export type PlaceInput = z.infer<typeof placeSchema>;
export type Place = { name: string; lat: number; lon: number };

// Built-in city coordinates (English and Bangla names). Anything else: pass "lat" and "lon".
const CITY: Record<string, [number, number]> = {
  dhaka: [23.8103, 90.4125], "ঢাকা": [23.8103, 90.4125],
  chattogram: [22.3569, 91.7832], chittagong: [22.3569, 91.7832], "চট্টগ্রাম": [22.3569, 91.7832],
  sylhet: [24.8949, 91.8687], "সিলেট": [24.8949, 91.8687],
  khulna: [22.8456, 89.5403], "খুলনা": [22.8456, 89.5403],
  rajshahi: [24.3745, 88.6042], "রাজশাহী": [24.3745, 88.6042],
  barishal: [22.701, 90.3535], barisal: [22.701, 90.3535], "বরিশাল": [22.701, 90.3535],
  rangpur: [25.7439, 89.2752], "রংপুর": [25.7439, 89.2752],
  mymensingh: [24.7471, 90.4203], "ময়মনসিংহ": [24.7471, 90.4203],
  "cox's bazar": [21.4272, 92.0058], "coxs bazar": [21.4272, 92.0058], "কক্সবাজার": [21.4272, 92.0058],
  cumilla: [23.4607, 91.1809], comilla: [23.4607, 91.1809], "কুমিল্লা": [23.4607, 91.1809],
  bogura: [24.8465, 89.3773], bogra: [24.8465, 89.3773], "বগুড়া": [24.8465, 89.3773],
  gazipur: [23.9999, 90.4203], "গাজীপুর": [23.9999, 90.4203],
  narayanganj: [23.6238, 90.5], "নারায়ণগঞ্জ": [23.6238, 90.5],
  kolkata: [22.5726, 88.3639], "কলকাতা": [22.5726, 88.3639],
  delhi: [28.6139, 77.209], "new delhi": [28.6139, 77.209], "দিল্লি": [28.6139, 77.209],
  mumbai: [19.076, 72.8777], kathmandu: [27.7172, 85.324], "কাঠমান্ডু": [27.7172, 85.324],
  karachi: [24.8607, 67.0011], lahore: [31.5204, 74.3587], islamabad: [33.6844, 73.0479],
  dubai: [25.2048, 55.2708], "দুবাই": [25.2048, 55.2708], "abu dhabi": [24.4539, 54.3773],
  makkah: [21.3891, 39.8579], mecca: [21.3891, 39.8579], "মক্কা": [21.3891, 39.8579],
  madinah: [24.5247, 39.5692], medina: [24.5247, 39.5692], "মদিনা": [24.5247, 39.5692],
  riyadh: [24.7136, 46.6753], "রিয়াদ": [24.7136, 46.6753], jeddah: [21.4858, 39.1925],
  doha: [25.2854, 51.531], "দোহা": [25.2854, 51.531], muscat: [23.588, 58.3829], kuwait: [29.3759, 47.9774],
  "kuala lumpur": [3.139, 101.6869], "কুয়ালালামপুর": [3.139, 101.6869], singapore: [1.3521, 103.8198], "সিঙ্গাপুর": [1.3521, 103.8198],
  bangkok: [13.7563, 100.5018], tokyo: [35.6762, 139.6503], "টোকিও": [35.6762, 139.6503], beijing: [39.9042, 116.4074], seoul: [37.5665, 126.978],
  istanbul: [41.0082, 28.9784], "ইস্তানবুল": [41.0082, 28.9784], cairo: [30.0444, 31.2357], "কায়রো": [30.0444, 31.2357],
  london: [51.5074, -0.1278], "লন্ডন": [51.5074, -0.1278], paris: [48.8566, 2.3522], "প্যারিস": [48.8566, 2.3522],
  berlin: [52.52, 13.405], rome: [41.9028, 12.4964], moscow: [55.7558, 37.6173], "মস্কো": [55.7558, 37.6173],
  "new york": [40.7128, -74.006], "নিউ ইয়র্ক": [40.7128, -74.006], toronto: [43.6532, -79.3832], "টরন্টো": [43.6532, -79.3832],
  "los angeles": [34.0522, -118.2437], sydney: [-33.8688, 151.2093], "সিডনি": [-33.8688, 151.2093],
};

export const resolvePlace = (p: PlaceInput): Place => {
  if (p.lat !== undefined && p.lon !== undefined) return { name: p.name, lat: p.lat, lon: p.lon };
  const hit = CITY[p.name.trim().toLowerCase()] ?? CITY[p.name.trim()];
  if (!hit) throw new Error(`Unknown place "${p.name}". Add its coordinates, e.g. { "name": "${p.name}", "lat": 23.81, "lon": 90.41 } (right-click the place in Google Maps to copy them).`);
  return { name: p.name, lat: hit[0], lon: hit[1] };
};

export const distanceKm = (a: Place, b: Place) => geoDistance([a.lon, a.lat], [b.lon, b.lat]) * EARTH_KM;

export const countryOf = (p: Place) => COUNTRIES.find((c) => geoContains(c, [p.lon, p.lat]))?.properties.name ?? "";

export const formatLatLon = (p: Place) => `${Math.abs(p.lat).toFixed(2)}° ${p.lat >= 0 ? "N" : "S"}, ${Math.abs(p.lon).toFixed(2)}° ${p.lon >= 0 ? "E" : "W"}`;
