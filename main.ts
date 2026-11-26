// main.ts — news-image-20261126
// Node 22, standard library only, no network.
// Draws a one-page world-news front page for Thursday 26 November 2026
// and writes it to /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png).
// Deterministic: fixed strings, fixed layout, zlib level 9, no time/random.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------------------
// 5x7 bitmap font (ASCII). Each glyph: 7 rows of 5 bits, '#' = on.
// ---------------------------------------------------------------------------
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '"': ['01010', '01010', '00000', '00000', '00000', '00000', '00000'],
};

type RGB = [number, number, number];

const PAPER: RGB = [248, 245, 238];
const NAVY: RGB = [16, 36, 62];
const GOLD: RGB = [201, 162, 39];
const WHITE: RGB = [255, 255, 255];
const INK: RGB = [17, 17, 17];
const GREY: RGB = [51, 51, 51];
const CARD_LINE: RGB = [216, 210, 196];

// ---------------------------------------------------------------------------
// Raster buffer (RGB, row-major)
// ---------------------------------------------------------------------------
const px = Buffer.alloc(W * H * 3);

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(xx, yy, c);
  }
}

function textWidth(text: string, scale: number): number {
  if (text.length === 0) return 0;
  return text.length * 6 * scale - scale;
}

function drawText(text: string, x: number, y: number, scale: number, c: RGB): void {
  const upper = text.toUpperCase();
  for (let ci = 0; ci < upper.length; ci++) {
    const glyph = FONT[upper[ci]] ?? FONT['?'];
    const cx = x + ci * 6 * scale;
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[r][col] === '1') {
          fillRect(cx + col * scale, y + r * scale, scale, scale, c);
        }
      }
    }
  }
}

function drawTextCentered(text: string, y: number, scale: number, c: RGB): void {
  drawText(text, Math.floor((W - textWidth(text, scale)) / 2), y, scale, c);
}

// Word-wrap to lines that fit maxWidth px at the given scale.
function wrap(text: string, scale: number, maxWidth: number): string[] {
  const maxChars = Math.max(1, Math.floor((maxWidth + scale) / (6 * scale)));
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const next = cur === '' ? word : cur + ' ' + word;
    if (next.length <= maxChars) {
      cur = next;
    } else {
      if (cur !== '') lines.push(cur);
      cur = word;
    }
  }
  if (cur !== '') lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------------------
// News: Thursday 26 November 2026. Verified by web search on 2026-11-26.
// Events happened, or were first reported, on 26 Nov 2026 in some time zone.
// ---------------------------------------------------------------------------
interface Story {
  tag: string;
  color: RGB;
  headline: string;
  summary: string;
}

const STORIES: Story[] = [
  {
    tag: 'OIL',
    color: [125, 102, 8],
    headline: 'BRENT NEARS 95 ON GULF ATTACKS',
    summary:
      'HOUTHI REFINERY CLAIM AND IRAN MINE STRIKES LIFT OIL. BRENT AT 94.71.',
  },
  {
    tag: 'TRADE',
    color: [20, 90, 50],
    headline: 'US PROPOSES TARIFFS ON 14 ECONOMIES',
    summary:
      'USTR NAMES RATES UP TO 35 PERCENT. INDIA 25, VIETNAM 35, CHINA PLUS 20.',
  },
  {
    tag: 'UKRAINE',
    color: [27, 79, 114],
    headline: 'UKRAINE HITS RUSSIAN AIRBASE',
    summary:
      'KYIV SAYS FIVE JETS DAMAGED AT SAVASLEYKA. RUSSIA HITS KYIV WITH MISSILES.',
  },
  {
    tag: 'UK',
    color: [146, 43, 33],
    headline: 'UK WRITES TO 100,000 VETERANS',
    summary:
      'FIRST CALL-UP LETTERS SINCE COLD WAR. RESERVISTS TOLD TO BE READY.',
  },
  {
    tag: 'NORTH KOREA',
    color: [108, 52, 131],
    headline: 'KIM VOWS MORE NUKES, EXPELS SWISS',
    summary:
      'PYONGYANG TO EXPAND ARSENAL. ORDERS SWISS OFFICE SHUT AFTER TRUMP OVERTURE.',
  },
  {
    tag: 'USA',
    color: [26, 82, 118],
    headline: "MACY'S PARADE MOVED BY STORM",
    summary:
      '100TH THANKSGIVING PARADE POSTPONED TO SATURDAY. FIRST WEATHER DELAY EVER.',
  },
];

// ---------------------------------------------------------------------------
// Layout: 1024 x 1024 front page
// ---------------------------------------------------------------------------
fillRect(0, 0, W, H, PAPER);

// Header band
fillRect(0, 0, W, 148, NAVY);
drawTextCentered('WORLD NEWS', 22, 7, WHITE);
drawTextCentered('THURSDAY 26 NOVEMBER 2026', 86, 4, GOLD);
fillRect(0, 144, W, 4, GOLD);

// Subhead
drawTextCentered('SIX STORIES THAT DEFINED THE DAY', 160, 3, NAVY);

// Story cards
const CARD_X = 28;
const CARD_W = 968;
const ROW_H = 122;
const ROW_GAP = 8;
const START_Y = 196;

for (let i = 0; i < STORIES.length; i++) {
  const s = STORIES[i];
  const y = START_Y + i * (ROW_H + ROW_GAP);
  // Card
  fillRect(CARD_X, y, CARD_W, ROW_H, WHITE);
  // Border: top and bottom hairlines + side hairlines
  fillRect(CARD_X, y, CARD_W, 2, CARD_LINE);
  fillRect(CARD_X, y + ROW_H - 2, CARD_W, 2, CARD_LINE);
  fillRect(CARD_X, y, 2, ROW_H, CARD_LINE);
  fillRect(CARD_X + CARD_W - 2, y, 2, ROW_H, CARD_LINE);
  // Accent bar
  fillRect(CARD_X, y, 14, ROW_H, s.color);
  // Tag
  drawText(s.tag, CARD_X + 30, y + 12, 3, s.color);
  // Headline
  drawText(s.headline, CARD_X + 30, y + 40, 4, INK);
  // Summary, wrapped to two lines
  const lines = wrap(s.summary, 3, CARD_W - 60).slice(0, 2);
  lines.forEach((line, li) => {
    drawText(line, CARD_X + 30, y + 74 + li * 24, 3, GREY);
  });
}

// Footer: sources
drawTextCentered('SOURCES: REUTERS / AP / TELEGRAPH / WSJ / CNN', 984, 3, GREY);

// ---------------------------------------------------------------------------
// PNG encoder (stdlib only): IHDR + IDAT (zlib deflate, level 9) + IEND.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter: none
  px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}
const idat = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), png);
