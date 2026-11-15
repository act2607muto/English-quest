// モンスターと装備品の仮のドット絵（16×16マス、3〜4色＋黒い輪郭）を PNG にする。外部のライブラリは使わない。
//
//   node scripts/make_sprites.mjs
//
// public/monsters/<モンスターID>.png、public/equipment/<装備品ID>.png に書き出す
// （透明な背景、1マス=1ピクセル）。
// 画面では image-rendering: pixelated で拡大して表示する。
// 本番の絵ができたら、同じ名前の PNG を置き換えればよい。
//
// 絵は1行16文字で書く。'.' は透明、ほかの文字は palette の色。

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const OUTLINE = '#1a1a1a';

const SPRITES = {
  // 語彙：開いた本のモンスター（しおりのひもが舌）
  'monsters/town01-mon-voc': {
    palette: { k: OUTLINE, c: '#f4e6c4', l: '#b59a6a', o: '#c8642a', r: '#d83a3a', w: '#ffffff' },
    rows: [
      '................',
      '................',
      '.kkkkkk..kkkkkk.',
      '.kccccckkccccck.',
      '.kclllckkclllck.',
      '.kcwkcckkccwkck.',
      '.kckkcckkcckkck.',
      '.kccccckkccccck.',
      '.kclllckkclllck.',
      'kkccccckkccccckk',
      'kooooookrooooook',
      '.kkkkkkkrkkkkkk.',
      '...kk...r..kk...',
      '...kk...rr.kk...',
      '................',
      '................',
    ],
  },
  // 文法：積み木を積んだゴーレム
  'monsters/town01-mon-gra': {
    palette: { k: OUTLINE, b: '#3d7be0', l: '#8fc4ff', y: '#ffd84a', w: '#ffffff' },
    rows: [
      '................',
      '....kkkkkkkk....',
      '....kllllllk....',
      '....klkllklk....',
      '....klwllwlk....',
      '..kkkkkkkkkkkk..',
      'kkkkbbbbbbbbkkkk',
      'kllkbbbyybbbkllk',
      'kllkbbyyyybbkllk',
      'kkkkbbybbybbkkkk',
      '...kbbbbbbbbk...',
      '...kkkkkkkkkk...',
      '...kllk..kllk...',
      '...kllk..kllk...',
      '...kkkk..kkkk...',
      '................',
    ],
  },
  // リスニング：耳の大きな生き物
  'monsters/town01-mon-lis': {
    palette: { k: OUTLINE, p: '#9b6bd6', n: '#ffb3d1', v: '#e0ccff', w: '#ffffff' },
    rows: [
      '.kk..........kk.',
      'kpnk........knpk',
      'kpnk........knpk',
      'kpnpk......kpnpk',
      '.kpnpk....kpnpk.',
      '..kppkkkkkkppk..',
      '..kppppppppppk..',
      '.kppkkppppkkppk.',
      '.kppkwppppkwppk.',
      '.kppppppppppppk.',
      '.kpppvvkkvvpppk.',
      '.kppvvvvvvvvppk.',
      '..kpvvvvvvvvpk..',
      '...kkpkkkkpkk...',
      '....kk....kk....',
      '................',
    ],
  },
  // ライティング：羽ペンのささったインクつぼ
  'monsters/town01-mon-wri': {
    palette: { k: OUTLINE, d: '#2b3a67', i: '#5a78c8', g: '#d9a62e', w: '#ffffff' },
    rows: [
      '...........kk...',
      '..........kwwk..',
      '.........kwwk...',
      '........kwwk....',
      '.......kwwk.....',
      '....kkkkkkkk....',
      '....kggggggk....',
      '...kkkkkkkkkk...',
      '..kddddddddddk..',
      '.kdikkddddkkdik.',
      '.kdikwddddkwdik.',
      '.kdiddddddddddk.',
      '.kddddkkkkddddk.',
      '.kddddddddddddk.',
      '..kkkkkkkkkkkk..',
      '................',
    ],
  },
  // スピーキング：くちばしの大きな鳥
  'monsters/town01-mon-spe': {
    palette: { k: OUTLINE, e: '#4caf6a', l: '#bff0c8', a: '#ff9a2e', w: '#ffffff' },
    rows: [
      '................',
      '....kkkkk.......',
      '...keeeeek......',
      '..keeeeeeek.....',
      '..keekkeeeekkk..',
      '..keekweeekaaak.',
      '.keeeeeeekaaaaak',
      '.keeeeeeekkkkkk.',
      '.keelllleekaaaak',
      '.kellllllekaaak.',
      '.kellllllekkkk..',
      '..kelllllek.....',
      '...keeeeek......',
      '....kkkkk.......',
      '....ka..ka......',
      '....kk..kk......',
    ],
  },

  // ---------- 装備品 ----------
  // 語彙の武器：ことのはのナイフ
  'equipment/town01-wpn-voc': {
    palette: { k: OUTLINE, s: '#c9d1dc', w: '#ffffff', g: '#e0b33a', b: '#8a5a2b' },
    rows: [
      '.......kk.......',
      '......kswk......',
      '......kswk......',
      '......kswk......',
      '......kswk......',
      '......kswk......',
      '......kswk......',
      '....kkkkkkkk....',
      '....kggggggk....',
      '....kkkbbkkk....',
      '......kbbk......',
      '......kbbk......',
      '......kbbk......',
      '.....kggggk.....',
      '.....kkkkkk.....',
      '................',
    ],
  },
  // 文法の武器：くみたてハンマー
  'equipment/town01-wpn-gra': {
    palette: { k: OUTLINE, l: '#8fc4ff', b: '#3d7be0', d: '#8a5a2b' },
    rows: [
      '................',
      '..kkkkkkkkkkkk..',
      '..kllllllllllk..',
      '..kbbbbbbbbbbk..',
      '..kbbbbbbbbbbk..',
      '..kkkkkkkkkkkk..',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kkkk......',
      '................',
    ],
  },
  // リスニングの武器：みみすましの弓
  'equipment/town01-wpn-lis': {
    palette: { k: OUTLINE, d: '#8a5a2b', s: '#e8e8e8', g: '#9b6bd6' },
    rows: [
      '....kkk.........',
      '....kddkk.......',
      '....ks.kdk......',
      '....ks..kdk.....',
      '....ks...kdk....',
      '....ks...kdk....',
      '....ks....kdk...',
      '....ks....kgk...',
      '....ks....kgk...',
      '....ks....kdk...',
      '....ks...kdk....',
      '....ks...kdk....',
      '....ks..kdk.....',
      '....ks.kdk......',
      '....kddkk.......',
      '....kkk.........',
    ],
  },
  // ライティングの武器：はねペンのつるぎ
  'equipment/town01-wpn-wri': {
    palette: { k: OUTLINE, w: '#ffffff', p: '#ff8fb1', g: '#e0b33a' },
    rows: [
      '........kk......',
      '.......kwwk.....',
      '......kwwpk.....',
      '......kwwpk.....',
      '.....kwwppk.....',
      '.....kwwpk......',
      '.....kwwpk......',
      '....kwwpk.......',
      '....kwwpk.......',
      '....kwpk........',
      '....kwk.........',
      '...kgk..........',
      '...kgk..........',
      '..kgk...........',
      '..kk............',
      '................',
    ],
  },
  // スピーキングの武器：よびかけの杖（先に吹き出し）
  'equipment/town01-wpn-spe': {
    palette: { k: OUTLINE, w: '#ffffff', a: '#c58b4a', e: '#4caf6a' },
    rows: [
      '...kkkkkkkk.....',
      '..kwwwwwwwwk....',
      '..kwkwkwkwwk....',
      '..kwwwwwwwwk....',
      '...kkkkwkkk.....',
      '......kak.......',
      '......kek.......',
      '......kak.......',
      '......kak.......',
      '......kak.......',
      '......kak.......',
      '......kak.......',
      '......kek.......',
      '......kak.......',
      '......kkk.......',
      '................',
    ],
  },
  // 防具（HP+1）：たびびとのマント
  'equipment/town01-arm-hp': {
    palette: { k: OUTLINE, r: '#d83a3a', d: '#8f1f2a', y: '#e0b33a' },
    rows: [
      '................',
      '.....kkkkkk.....',
      '....kyyyyyyk....',
      '...kkrrrrrrkk...',
      '...krrrrrrrrk...',
      '..krrrrrrrrrrk..',
      '..krrdrrrrdrrk..',
      '..krrdrrrrdrrk..',
      '.krrrdrrrrdrrrk.',
      '.krrrdrrrrdrrrk.',
      '.krrdrrrrrrdrrk.',
      'krrrdrrrrrrdrrrk',
      'krrrdrrrrrrdrrrk',
      'kkrrkkrrrrkkrrkk',
      '..kk..kkkk..kk..',
      '................',
    ],
  },
  // 防具（低下の猶予+1日）：わすれずのかぶと
  'equipment/town01-arm-grace': {
    palette: { k: OUTLINE, s: '#b8c2cc', w: '#ffffff', b: '#3d7be0' },
    rows: [
      '......kkkk......',
      '.....kbbbbk.....',
      '......kbbk......',
      '....kkkkkkkk....',
      '...kssswwsssk...',
      '..ksssswwssssk..',
      '..kssssssssssk..',
      '..kssssssssssk..',
      '..kkkkkkkkkkkk..',
      '..ksk......ksk..',
      '..ksk......ksk..',
      '..ksk......ksk..',
      '..kssk....kssk..',
      '...kkk....kkk...',
      '................',
      '................',
    ],
  },
};

function hex(c) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
}

function render({ palette, rows }, id) {
  if (rows.length !== 16) throw new Error(`${id}: 16行ではありません（${rows.length}行）`);
  const raw = Buffer.alloc(16 * (1 + 16 * 4));
  rows.forEach((row, y) => {
    if (row.length !== 16) throw new Error(`${id}: ${y}行目が16文字ではありません（${row.length}文字）`);
    const base = y * (1 + 16 * 4);
    raw[base] = 0;
    [...row].forEach((ch, x) => {
      const o = base + 1 + x * 4;
      if (ch === '.') return; // 透明
      const color = palette[ch];
      if (!color) throw new Error(`${id}: ${y}行目の「${ch}」に色がありません`);
      const [r, g, b] = hex(color);
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = 255;
    });
  });
  return encodePng(16, 16, raw);
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
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [id, sprite] of Object.entries(SPRITES)) {
  const colors = Object.keys(sprite.palette).filter((k) => k !== 'k' && k !== 'w');
  if (colors.length > 4) throw new Error(`${id}: 色が多すぎます（輪郭と白を除いて4色まで）`);
  const file = path.join(OUT_DIR, `${id}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(sprite, id));
  console.log(file);
}
