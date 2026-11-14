// Generates public/og/dgix-og.jpg (1200x630): the image social apps show when the site link is shared
// (WhatsApp, Facebook, Messenger, Discord, LinkedIn, Slack, X).
// Run: node scripts/gen-og-image.mjs   (uses the Plus Jakarta Sans fonts installed on this machine)
import fs from "node:fs";
import sharp from "sharp";

const W = 1200;
const H = 630;
const BG = "#08152F";

// Globe artwork rising from the bottom
const GLOBE_TOP = 250;
const wide = await sharp("public/media/hero-globe.webp").resize({ width: 1440 }).toBuffer();
const wMeta = await sharp(wide).metadata();
const globe = await sharp(wide)
  .extract({ left: Math.round((wMeta.width - W) / 2), top: 0, width: W, height: Math.min(wMeta.height, H - GLOBE_TOP) })
  .toBuffer();

// White logo, centred at the top
const logo = await sharp("public/brand/dgix-logo-white.png").resize({ width: 230 }).toBuffer();
const lMeta = await sharp(logo).metadata();

const text = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BG}" stop-opacity="1"/>
      <stop offset="0.48" stop-color="${BG}" stop-opacity="0.92"/>
      <stop offset="0.7" stop-color="${BG}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <g font-family="Plus Jakarta Sans" text-anchor="middle" fill="#FFFFFF">
    <text x="${W / 2}" y="214" font-size="70" font-weight="300" letter-spacing="-2.5">Proven products.</text>
    <text x="${W / 2}" y="292" font-size="70" font-weight="300" letter-spacing="-2.5">Sold to the world.</text>
    <text x="${W / 2}" y="350" font-size="24" font-weight="400" fill-opacity="0.78">Verified software from Bangladesh, delivered to the USA and GCC under one contract.</text>
  </g>
</svg>`;

fs.mkdirSync("public/og", { recursive: true });
await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([
    { input: globe, left: 0, top: GLOBE_TOP },
    { input: Buffer.from(text), left: 0, top: 0 },
    { input: logo, left: Math.round((W - lMeta.width) / 2), top: 52 },
  ])
  .flatten({ background: BG })
  // JPEG keeps it well under WhatsApp's ~300 KB preview limit
  .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile("public/og/dgix-og.jpg");

const { size } = fs.statSync("public/og/dgix-og.jpg");
console.log(`public/og/dgix-og.jpg ${W}x${H}, ${Math.round(size / 1024)} KB`);
