import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

type CountryProps = { name: string };

// World countries (Natural Earth 1:110m, public domain) as GeoJSON, parsed once.
const all = feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection<Geometry, CountryProps>;

export const COUNTRIES: Feature<Geometry, CountryProps>[] = all.features.filter((f) => f.properties.name !== "Antarctica");

export const WORLD: FeatureCollection<Geometry, CountryProps> = { type: "FeatureCollection", features: COUNTRIES };

export const countryByName = (name: string) => COUNTRIES.find((c) => c.properties.name.toLowerCase() === name.toLowerCase());
