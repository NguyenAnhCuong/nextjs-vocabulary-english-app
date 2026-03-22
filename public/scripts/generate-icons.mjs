// scripts/generate-icons.mjs
// Chạy: node scripts/generate-icons.mjs
// Cần: npm install sharp

import sharp from "sharp";
import { mkdirSync } from "fs";

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = "public/icons";

mkdirSync(OUTPUT_DIR, { recursive: true });

// SVG source icon — chữ W trên nền xanh
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#1a1f2e"/>
  <rect x="40" y="40" width="432" height="432" rx="80" fill="#6c8fff" opacity="0.15"/>
  <text
    x="256" y="320"
    font-family="Georgia, serif"
    font-size="280"
    font-weight="bold"
    fill="#6c8fff"
    text-anchor="middle"
    dominant-baseline="auto"
  >W</text>
</svg>`;

const svgBuffer = Buffer.from(SVG);

for (const size of SIZES) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`${OUTPUT_DIR}/icon-${size}x${size}.png`);
  console.log(`✅ icon-${size}x${size}.png`);
}

console.log("\n🎉 All icons generated in public/icons/");
