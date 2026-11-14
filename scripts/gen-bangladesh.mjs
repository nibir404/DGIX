// Generates public/data/bangladesh.json: Bangladesh's border (Natural Earth 50m) as GeoJSON,
// so the hero globe can draw it as a glowing amber shape without loading every country.
// Run: node scripts/gen-bangladesh.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const countries = require("world-atlas/countries-50m.json");
const bd = feature(countries, countries.objects.countries).features.find((f) => f.properties?.name === "Bangladesh");
if (!bd) throw new Error("Bangladesh not found");
const round = (c) => (typeof c[0] === "number" ? [+c[0].toFixed(3), +c[1].toFixed(3)] : c.map(round));
bd.geometry.coordinates = round(bd.geometry.coordinates);
fs.writeFileSync("public/data/bangladesh.json", JSON.stringify({ type: "Feature", properties: {}, geometry: bd.geometry }));
console.log("wrote public/data/bangladesh.json", fs.statSync("public/data/bangladesh.json").size, "bytes");
