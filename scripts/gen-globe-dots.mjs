// Generates public/data/globe-dots.bin: Float32 triples [lat, lon, isBangladesh]
// for a regular lat/lon dot grid over land (Natural Earth 110m), like the Paper globe art.
// Run: node scripts/gen-globe-dots.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const require = createRequire(import.meta.url);
const land110 = require("world-atlas/land-110m.json");
const countries = require("world-atlas/countries-110m.json");

const land = feature(land110, land110.objects.land);
const bd = feature(countries, countries.objects.countries).features.find((f) => f.properties?.name === "Bangladesh");

const STEP = 0.85; // degrees between dots at the equator
const out = [];
for (let lat = -58; lat <= 82; lat += STEP) {
  const ring = Math.max(1, Math.round((360 / STEP) * Math.cos((lat * Math.PI) / 180)));
  const dLon = 360 / ring;
  for (let i = 0; i < ring; i++) {
    const lon = -180 + i * dLon;
    const inLand = land.features ? land.features.some((f) => geoContains(f, [lon, lat])) : geoContains(land, [lon, lat]);
    if (!inLand) continue;
    out.push(lat, lon, lat > 20 && lat < 27 && lon > 87.5 && lon < 93 && geoContains(bd, [lon, lat]) ? 1 : 0);
  }
}
// Extra density for Bangladesh so its outline glows like the artwork
for (let lat = 20.6; lat <= 26.7; lat += 0.22) {
  for (let lon = 88.0; lon <= 92.7; lon += 0.22) {
    if (geoContains(bd, [lon, lat])) out.push(lat, lon, 1);
  }
}
fs.mkdirSync("public/data", { recursive: true });
fs.writeFileSync("public/data/globe-dots.bin", Buffer.from(new Float32Array(out).buffer));
console.log(`dots: ${out.length / 3}, bytes: ${out.length * 4}`);
