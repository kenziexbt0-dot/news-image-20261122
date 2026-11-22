// news-image-20261122 — "The World in One Page"
// A one-page newspaper image summing up Sunday 22 November 2026.
// Written from scratch in this session. Node 22, standard library only.
// Renders a 1024x1024 PNG deterministically (pure-code drawing + a
// hand-built 5x7 bitmap font), writes it to MAKEFUN_OUTPUT_DIR/entry.png,
// and verifies the two in-memory renders are byte-identical first.

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 1024;
const H = 1024;

// ---- palette -------------------------------------------------------------
const PAPER = [247, 242, 231];
const INK = [17, 17, 17];
const RED = [176, 32, 32];
const BLUE = [29, 78, 137];
const GOLD = [184, 134, 11];
const TEAL = [14, 94, 90];
const GREY = [90, 86, 78];
const WHITE = [255, 255, 255];
const LIGHT = [232, 226, 210];

// ---- raster --------------------------------------------------------------
const buf = Buffer.alloc(W * H * 3);
function px(x: number, y: number, c: number[]): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: number[]): void {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) px(i, j, c);
}
function hline(x: number, y: number, w: number, c: number[], t = 1): void {
  rect(x, y, w, t, c);
}
function vline(x: number, y: number, h: number, c: number[], t = 1): void {
  rect(x, y, t, h, c);
}
function frame(x: number, y: number, w: number, h: number, c: number[], t = 2): void {
  hline(x, y, w, c, t); hline(x, y + h - t, w, c, t);
  vline(x, y, h, c, t); vline(x + w - t, y, h, c, t);
}
function circle(cx: number, cy: number, r: number, c: number[]): void {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++)
      if (x * x + y * y <= r * r) px(cx + x, cy + y, c);
}
function ring(cx: number, cy: number, r: number, c: number[], t = 3): void {
  for (let a = 0; a < 360; a++) {
    const rad = (a * Math.PI) / 180;
    for (let k = 0; k < t; k++)
      px(Math.round(cx + (r - k) * Math.cos(rad)), Math.round(cy + (r - k) * Math.sin(rad)), c);
  }
}

// ---- 5x7 bitmap font (uppercase only; text is upper-cased on draw) -------
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
};

// ---- text helpers ----------------------------------------------------------
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}
function drawChar(ch: string, x: number, y: number, scale: number, c: number[]): void {
  const g = FONT[ch] ?? FONT["?"];
  for (let r = 0; r < 7; r++)
    for (let col = 0; col < 5; col++)
      if (g[r][col] === "1") rect(x + col * scale, y + r * scale, scale, scale, c);
}
function drawText(s: string, x: number, y: number, scale: number, c: number[]): void {
  const t = s.toUpperCase();
  for (let i = 0; i < t.length; i++) drawChar(t[i], x + i * 6 * scale, y, scale, c);
}
function drawTextCentered(s: string, cx: number, y: number, scale: number, c: number[]): void {
  drawText(s, cx - Math.floor(textWidth(s.toUpperCase(), scale) / 2), y, scale, c);
}
// Wrap words to fit maxW pixels at the given scale; returns lines drawn.
function drawWrapped(
  s: string, x: number, y: number, maxW: number, scale: number, c: number[], lh: number,
): number {
  const words = s.toUpperCase().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? cur + " " + w : w;
    if (textWidth(trial, scale) <= maxW) cur = trial;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  lines.forEach((ln, i) => drawText(ln, x, y + i * lh, scale, c));
  return lines.length;
}

// ---- panel helpers ---------------------------------------------------------
function panel(x: number, y: number, w: number, h: number, accent: number[]): void {
  rect(x, y, w, h, WHITE);
  frame(x, y, w, h, INK, 2);
  rect(x, y, w, 34, accent);
  hline(x, y + 34, w, INK, 2);
}
function kicker(x: number, y: number, label: string): void {
  drawText(label, x + 12, y + 10, 2, WHITE);
}
function headline(x: number, y: number, maxW: number, s: string, scale = 3): number {
  return drawWrapped(s, x, y, maxW, scale, INK, scale * 9 + 2);
}
function body(x: number, y: number, maxW: number, s: string): number {
  return drawWrapped(s, x, y, maxW, 2, INK, 17);
}
function stat(x: number, y: number, big: string, small: string, c: number[]): void {
  drawText(big, x, y, 4, c);
  drawText(small, x, y + 32, 2, GREY);
}

// ---- background ------------------------------------------------------------
rect(0, 0, W, H, PAPER);

// ---- masthead --------------------------------------------------------------
hline(24, 18, 976, INK, 3);
drawTextCentered("THE WORLD IN ONE PAGE", 512, 34, 6, INK);
drawTextCentered("SUNDAY 22 NOVEMBER 2026  -  SIX STORIES THAT DEFINED THE DAY", 512, 82, 2, RED);
hline(24, 112, 976, RED, 4);
hline(24, 120, 976, INK, 2);

// ---- lead story: markets ---------------------------------------------------
panel(24, 132, 976, 268, RED);
kicker(24, 132, "LEAD  -  MARKETS");
drawText("WALL STREET IN CORRECTION", 40, 180, 4, INK);
drawText("AS THE AI RALLY CRACKS", 40, 214, 4, RED);
// bar chart: S&P 500 slide across the week to Friday's close
const chartX = 40, chartY = 252, chartW = 430, chartH = 120;
const vals = [7819, 7700, 7592, 7450, 7300, 7175, 6910];
const vMin = 6800, vMax = 7900;
frame(chartX - 6, chartY - 6, chartW + 12, chartH + 26, GREY, 1);
vals.forEach((v, i) => {
  const bw = 44;
  const bx = chartX + i * 60;
  const bh = Math.round(((v - vMin) / (vMax - vMin)) * chartH);
  rect(bx, chartY + chartH - bh, bw, bh, i === vals.length - 1 ? RED : [150, 60, 60]);
  drawText(String(v), bx + 2, chartY + chartH + 6, 1, GREY);
});
drawText("WORST WEEK SINCE APRIL 2025 - VIX 35.9", 500, 252, 2, INK);
drawWrapped("THE S&P 500 FELL 3.7% ON FRIDAY TO 6,910, JOINING THE DOW IN CORRECTION. THE NASDAQ PLUNGED 5.28%.", 500, 276, 470, 2, INK, 17);
stat(500, 336, "-3.7%", "S&P 500", RED);
stat(660, 336, "-5.28%", "NASDAQ", RED);
stat(840, 336, "-14%", "NVIDIA", RED);

// ---- row 2: bitcoin + Hormuz ----------------------------------------------
panel(24, 412, 481, 236, GOLD);
kicker(24, 412, "CRYPTO");
circle(452, 470, 22, GOLD);
ring(452, 470, 22, [120, 85, 0], 2);
drawText("B", 444, 458, 3, WHITE);
headline(40, 462, 449, "BITCOIN BREAKS $60,000", 3);
body(40, 500, 449, "BITCOIN FELL BELOW $60,000 ON FRIDAY FOR THE FIRST TIME SINCE JULY, THEN TO $55,127 ON SATURDAY BEFORE RECOVERING NEAR $59,700.");
stat(40, 600, "$55,127", "SATURDAY LOW", GOLD);
stat(240, 600, "-9%", "GOLD ON THE WEEK", RED);

panel(519, 412, 481, 236, TEAL);
kicker(519, 412, "MIDDLE EAST  -  SHIPPING");
headline(535, 462, 449, "TANKERS HIT IN HORMUZ", 3);
body(535, 500, 449, "TWO TANKERS WERE STRUCK BY PROJECTILES NEAR OMAN ON SATURDAY, UK MARITIME AUTHORITIES SAID. ONE, THE TORKEL, WAS LEFT BURNING AT ANCHOR. NO CREW WERE HURT.");
stat(535, 600, "2", "TANKERS STRUCK", TEAL);
stat(735, 600, "0", "CREW HURT", TEAL);

// ---- row 3: Ukraine, Gaza, Myanmar ----------------------------------------
panel(24, 660, 318, 300, BLUE);
kicker(24, 660, "UKRAINE  -  DIPLOMACY");
rect(40, 706, 120, 12, BLUE);
rect(40, 718, 120, 12, GOLD);
headline(40, 742, 286, "PEACE ENVOYS HEAD TO MOSCOW", 3);
body(40, 800, 286, "US ENVOYS JARED KUSHNER AND STEVE WITKOFF TRAVEL TO MOSCOW AFTER TALKS IN ABU DHABI, THEN TO DUBLIN TO MEET PRESIDENT ZELENSKY. RUSSIAN MISSILES CRASHED IN POLAND.");

panel(353, 660, 318, 300, [70, 90, 120]);
kicker(353, 660, "GAZA  -  WINTER");
// rain cloud drawn by code
circle(400, 712, 16, [70, 90, 120]);
circle(424, 706, 20, [70, 90, 120]);
circle(450, 714, 14, [70, 90, 120]);
rect(392, 726, 8, 14, BLUE);
rect(414, 726, 8, 14, BLUE);
rect(436, 726, 8, 14, BLUE);
headline(369, 752, 286, "STORM FLOODS GAZA SHELTERS", 3);
body(369, 810, 286, "HEAVY RAIN AND COLD HAVE FLOODED TEMPORARY SHELTERS ACROSS GAZA, LEAVING MORE THAN A MILLION DISPLACED PEOPLE EXPOSED. AID GROUPS WARN OF DISEASE.");

panel(682, 660, 318, 300, [90, 60, 120]);
kicker(682, 660, "ASIA-PACIFIC");
headline(698, 706, 286, "MYANMAR REJECTS ASEAN DECISION", 3);
body(698, 764, 286, "MYANMAR'S ARMY-BACKED GOVERNMENT CALLED AN ASEAN DECISION UNFAIR AND IMBALANCED ON SATURDAY. AUSTRALIA ALSO CRITICISED THE US BUDGET OFFICE OVER ITS AUKUS SUBMARINE REPORT.");
stat(698, 912, "NOV 22", "REPORTED BY REUTERS", [90, 60, 120]);

// ---- footer ----------------------------------------------------------------
hline(24, 976, 976, INK, 2);
drawTextCentered("SOURCES: REUTERS - AP - BLOOMBERG - FT - CNN - UKMTO - THE GUARDIAN  -  FIGURES AS REPORTED 20-22 NOV 2026", 512, 986, 1, GREY);

// ---- PNG encoder (pure Node stdlib) ----------------------------------------
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, "ascii"), data]));
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}
function renderPng(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    buf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- main ------------------------------------------------------------------
function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  // Determinism check: render twice in memory, require byte-identical output.
  const first = renderPng();
  const second = renderPng();
  if (!first.equals(second)) {
    throw new Error("non-deterministic render: two runs differ");
  }
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.png");
  writeFileSync(outPath, first);
  console.log(`wrote ${outPath} (${first.length} bytes, ${W}x${H})`);
}

main();
