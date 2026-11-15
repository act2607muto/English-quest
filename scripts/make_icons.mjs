// ホーム画面用のアイコン（PNG）を作る。外部のライブラリは使わない。
// 黒地に、能力値の六角形（白い外枠と、黄色の能力の形）を描く。
//
//   node scripts/make_icons.mjs
//
// public/ に apple-touch-icon.png（180）、icon-192.png、icon-512.png を書き出す。

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const BG = [0, 0, 0];
const WHITE = [255, 255, 255];
const GRAY = [90, 90, 90];
const YELLOW = [255, 216, 74];

// 六角形の頂点（中心0、半径1、上から時計回り）
function hexagon(radii) {
  return radii.map((r, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
}

const OUTER = hexagon([1, 1, 1, 1, 1, 1]);
const MIDDLE = hexagon([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
// 能力の形（語彙・文法・リスニング・リーディング・スピーキング・ライティング）
const STATS = hexagon([0.85, 0.62, 0.78, 0.4, 0.7, 0.55]);

function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function distToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function nearEdge(poly, x, y, width) {
  for (let i = 0; i < poly.length; i++) {
    if (distToSegment(x, y, poly[i], poly[(i + 1) % poly.length]) <= width) return true;
  }
  return false;
}

// 図形の座標（-1〜1）での色。iOS は角を丸く切るので、図形は内側 70% に収める
function colorAt(x, y) {
  const s = 1 / 0.7;
  const u = x * s;
  const v = y * s;
  if (nearEdge(OUTER, u, v, 0.06)) return WHITE;
  if (inside(STATS, u, v)) {
    return nearEdge(STATS, u, v, 0.05) ? YELLOW : [150, 120, 30];
  }
  if (nearEdge(MIDDLE, u, v, 0.025)) return GRAY;
  for (const p of OUTER) {
    if (distToSegment(u, v, [0, 0], p) <= 0.02 && inside(OUTER, u, v)) return GRAY;
  }
  return BG;
}

function render(size) {
  const SS = 4; // 4×4 の平均でふちをなめらかにする
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // フィルターなし
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = ((px + (sx + 0.5) / SS) / size) * 2 - 1;
          const y = ((py + (sy + 0.5) / SS) / size) * 2 - 1 + 0.03;
          const c = colorAt(x, y);
          r += c[0];
          g += c[1];
          b += c[2];
        }
      }
      const n = SS * SS;
      row[1 + px * 3] = Math.round(r / n);
      row[2 + px * 3] = Math.round(g / n);
      row[3 + px * 3] = Math.round(b / n);
    }
    rows.push(row);
  }
  return encodePng(size, size, Buffer.concat(rows));
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8bit
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, render(size));
  console.log(`${file} (${size}x${size})`);
}
