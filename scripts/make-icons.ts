/**
 * Génère les icônes PNG de l'appli à partir d'un SVG (poutre en I stylisée + « Rz »).
 * Usage : npm run icons
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.cwd(), 'public');
mkdirSync(out, { recursive: true });

/** pad = marge intérieure en fraction (les icônes maskable demandent ~10 % de zone de sécurité). */
function svg(pad: number, rounded: boolean): string {
  const s = 512;
  const inner = s * (1 - 2 * pad);
  const o = s * pad;
  const k = inner / 512; // échelle du dessin
  const t = (x: number) => (o + x * k).toFixed(1);
  const l = (x: number) => (x * k).toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b6aa3"/><stop offset="1" stop-color="#173d61"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" ${rounded ? 'rx="112"' : ''} fill="url(#g)"/>
  <!-- poutre en I : semelle haute, âme, semelle basse -->
  <rect x="${t(96)}" y="${t(78)}" width="${l(320)}" height="${l(46)}" rx="${l(8)}" fill="#e8eef5"/>
  <rect x="${t(226)}" y="${t(118)}" width="${l(60)}" height="${l(170)}" fill="#e8eef5"/>
  <rect x="${t(96)}" y="${t(282)}" width="${l(320)}" height="${l(46)}" rx="${l(8)}" fill="#e8eef5"/>
  <!-- trait orange chantier -->
  <rect x="${t(96)}" y="${t(350)}" width="${l(320)}" height="${l(14)}" rx="${l(7)}" fill="#f28c28"/>
  <text x="${t(256)}" y="${t(462)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="700" font-size="${l(104)}" fill="#ffffff">Rz</text>
</svg>`;
}

async function png(file: string, size: number, pad: number, rounded: boolean) {
  await sharp(Buffer.from(svg(pad, rounded))).resize(size, size).png().toFile(join(out, file));
  console.log('✓', file);
}

await png('pwa-192.png', 192, 0, false);
await png('pwa-512.png', 512, 0, false);
await png('maskable-512.png', 512, 0.1, false);
await png('apple-touch-icon-180.png', 180, 0, false); // iOS arrondit lui-même
writeFileSync(join(out, 'favicon.svg'), svg(0, true));
console.log('✓ favicon.svg');
