// モンスターと装備品の仮のドット絵（16×16マス、3〜4色＋黒い輪郭）を PNG にする。外部のライブラリは使わない。
//
//   node scripts/make_sprites.mjs
//
// public/monsters/<モンスターID>.png、public/equipment/<装備品ID>.png、public/hero/hero.png、
// public/towns/<街ID>.png に書き出す
// （透明な背景、1マス=1ピクセル）。
// 画面では image-rendering: pixelated で拡大して表示する。
// 本番の絵ができたら、同じ名前の PNG を置き換えればよい。
//
// 絵は1行16文字（ボスは32文字×32行）で書く。'.' は透明、ほかの文字は palette の色。

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
  // モンスター・装備品は 16×16、ボスと主人公は 32×32、街の背景は横長
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  if (h === 0 || w === 0) throw new Error(`${id}: 絵が空です`);
  const raw = Buffer.alloc(h * (1 + w * 4));
  rows.forEach((row, y) => {
    if (row.length !== w) throw new Error(`${id}: ${y}行目が${w}文字ではありません（${row.length}文字）`);
    const base = y * (1 + w * 4);
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
  return encodePng(w, h, raw);
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

// ---------- ボス（32×32） ----------
// ことだまの門番：言葉の門を守る石の門。口が扉になっていて、王冠をかぶっている。
// 32×32 は手で書くと長いので、形を組み合わせて描き、最後に黒い輪郭をつける。
function drawBoss() {
  const N = 32;
  const g = Array.from({ length: N }, () => Array(N).fill('.'));
  const set = (x, y, c) => {
    if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c;
  };
  const get = (x, y) => (x >= 0 && x < N && y >= 0 && y < N ? g[y][x] : '.');

  // 体：上が半円、下がまっすぐの石の門
  const inBody = (x, y) => {
    if (y < 3 || y > 28 || x < 4 || x > 27) return false;
    if (y >= 14) return true;
    return (x - 15.5) ** 2 + (y - 14) ** 2 <= 11.5 ** 2;
  };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inBody(x, y)) set(x, y, 's');
  // 左側を明るくして立体に見せる
  for (let y = 0; y < N; y++) {
    const xs = [...Array(N).keys()].filter((x) => get(x, y) === 's');
    if (xs.length) {
      set(xs[0], y, 'l');
      set(xs[0] + 1, y, 'l');
    }
  }
  // 石の継ぎ目
  for (const y of [18, 23]) for (let x = 5; x <= 26; x++) if (get(x, y) === 's') set(x, y, 'm');
  for (let y = 19; y <= 22; y++) for (const x of [8, 23]) set(x, y, 'm');
  for (let y = 24; y <= 28; y++) for (const x of [6, 25]) set(x, y, 'm');

  // 足
  for (let y = 29; y <= 30; y++) for (const [a, b] of [[5, 10], [21, 26]]) for (let x = a; x <= b; x++) set(x, y, 's');

  // 口（扉）：上が丸いアーチ
  const inMouth = (x, y) => {
    if (x < 11 || x > 20 || y < 15 || y > 28) return false;
    if (y >= 19) return true;
    return (x - 15.5) ** 2 + (y - 19) ** 2 <= 4.6 ** 2;
  };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inMouth(x, y)) set(x, y, 'd');
  // 口のふち
  const mouth = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inMouth(x, y)) mouth.push([x, y]);
  for (const [x, y] of mouth) {
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inMouth(x + dx, y + dy))) set(x, y, 'k');
  }
  // 歯
  for (const x of [13, 15, 16, 18]) {
    const top = mouth.filter(([mx]) => mx === x).map(([, y]) => y).sort((a, b) => a - b)[1];
    if (top !== undefined) set(x, top, 'w');
  }
  // 舌（赤い言葉）
  for (const [x, y] of [[14, 25], [15, 25], [16, 25], [17, 25], [15, 26], [16, 26]]) set(x, y, 'r');

  // 目（光る黄色）と、つり上がった眉
  for (const ex of [9, 19]) {
    for (let y = 9; y <= 11; y++) for (let x = ex; x <= ex + 3; x++) set(x, y, 'y');
  }
  for (const [x, y] of [[11, 10], [11, 11], [20, 10], [20, 11]]) set(x, y, 'k');
  for (const [x, y] of [[8, 7], [9, 7], [10, 7], [11, 8], [12, 8], [13, 8]]) {
    set(x, y, 'k');
    set(31 - x, y, 'k');
  }

  // 王冠
  for (const x of [11, 15, 16, 20]) set(x, 0, 'g');
  for (const x of [11, 12, 14, 15, 16, 17, 19, 20]) set(x, 1, 'g');
  for (let y = 2; y <= 3; y++) for (let x = 11; x <= 20; x++) set(x, y, 'g');
  for (const [x, y] of [[15, 2], [16, 2], [15, 3], [16, 3]]) set(x, y, 'r');

  // 外側の輪郭（透明なマスのうち、絵に接するところを黒にする）
  const out = g.map((row) => [...row]);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (g[y][x] !== '.') continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(x + dx, y + dy) !== '.')) out[y][x] = 'k';
    }
  }
  return {
    palette: {
      k: OUTLINE,
      s: '#8a8f9c',
      l: '#b9bec9',
      m: '#5d6270',
      d: '#2a1f33',
      y: '#ffd84a',
      w: '#ffffff',
      g: '#e0b33a',
      r: '#d83a3a',
    },
    rows: out.map((row) => row.join('')),
  };
}
SPRITES['monsters/town01-boss'] = drawBoss();

// ---------- 主人公（32×32） ----------
// ニット帽と青いマフラーの旅人。肩かけかばんに単語帳を入れている。
function drawHero() {
  const W = 32;
  const H = 32;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const set = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c;
  };
  const get = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? g[y][x] : '.');
  const rect = (x0, y0, x1, y1, c) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
  };
  const ellipse = (cx, cy, rx, ry, c, yMin = -Infinity, yMax = Infinity) => {
    for (let y = 0; y < H; y++) {
      if (y < yMin || y > yMax) continue;
      for (let x = 0; x < W; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(x, y, c);
    }
  };

  // 足と靴
  rect(11, 27, 14, 29, 'p');
  rect(17, 27, 20, 29, 'p');
  rect(10, 30, 14, 30, 'h');
  rect(17, 30, 21, 30, 'h');
  // 腕と手
  rect(7, 20, 9, 25, 't');
  rect(22, 20, 24, 25, 't');
  rect(7, 26, 9, 26, 's');
  rect(22, 26, 24, 26, 's');
  // 服
  rect(10, 20, 21, 26, 't');
  rect(20, 20, 21, 26, 'd');
  // かばんのひも（ななめ）とかばん
  for (let i = 0; i <= 6; i++) set(11 + i, 20 + i, 'y');
  rect(16, 25, 20, 27, 'p');
  set(18, 26, 'y');
  // 顔
  ellipse(15.5, 13.5, 6.2, 5.2, 's');
  // 髪（帽子の下からのぞく）
  rect(10, 10, 21, 10, 'a');
  rect(9, 10, 10, 13, 'a');
  rect(21, 10, 22, 13, 'a');
  // ニット帽
  ellipse(15.5, 9, 7, 6, 'b', 2, 9);
  rect(9, 8, 22, 9, 'e'); // 折り返し
  for (const x of [11, 14, 17, 20]) set(x, 8, 'b');
  ellipse(15.5, 2, 1.6, 1.4, 'w'); // ぼんぼん
  // 目・ほお・口
  rect(13, 13, 13, 14, 'k');
  rect(18, 13, 18, 14, 'k');
  set(13, 13, 'k');
  set(12, 15, 'r');
  set(19, 15, 'r');
  set(15, 16, 'k');
  set(16, 16, 'k');
  // マフラー（首と、たれた端）
  rect(9, 18, 22, 19, 'c');
  rect(19, 20, 21, 23, 'c');
  set(19, 23, 'f');
  set(21, 23, 'f');

  // 外側の輪郭
  const out = g.map((row) => [...row]);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g[y][x] !== '.') continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(x + dx, y + dy) !== '.')) out[y][x] = 'k';
    }
  }
  return {
    palette: {
      k: OUTLINE,
      s: '#f2c29b',
      r: '#f28b82',
      a: '#5a3a22',
      b: '#d83a3a',
      e: '#a52a2a',
      w: '#ffffff',
      c: '#3d7be0',
      f: '#8fc4ff',
      t: '#4caf6a',
      d: '#2f7d4f',
      p: '#8a5a2b',
      h: '#4a3020',
      y: '#e0b33a',
    },
    rows: out.map((row) => row.join('')),
  };
}

// ---------- 街の背景（64×28） ----------
// はじまりの街：丘の上の家々と、街の外へ続く道。道ばたに吹き出しの看板。
function drawTown01() {
  const W = 64;
  const H = 28;
  const g = Array.from({ length: H }, () => Array(W).fill('a'));
  const set = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c;
  };
  const rect = (x0, y0, x1, y1, c) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
  };
  // 空（上が濃く、下が明るい）
  rect(0, 9, W - 1, 17, 'b');
  // 雲
  for (const [cx, cy] of [[10, 4], [44, 3], [56, 7]]) {
    rect(cx - 3, cy, cx + 3, cy + 1, 'w');
    rect(cx - 1, cy - 1, cx + 2, cy - 1, 'w');
  }
  // 遠くの丘
  for (let x = 0; x < W; x++) {
    const top = Math.round(15 + 2.5 * Math.sin(x / 7) + 1.5 * Math.sin(x / 3.1 + 1));
    for (let y = top; y < H; y++) set(x, y, 'm');
  }
  // 手前の草地
  rect(0, 20, W - 1, H - 1, 'g');
  for (let x = 1; x < W; x += 5) set(x, 22 + (x % 3), 'm');
  // 道（手前に向かって広がる）
  for (let y = 20; y < H; y++) {
    const half = 2 + Math.floor((y - 20) * 0.9);
    rect(31 - half, y, 32 + half, y, 'p');
  }
  // 家（壁・屋根・窓・戸口）
  const house = (x0, w, h, roof) => {
    const base = 20;
    const top = base - h;
    rect(x0, top, x0 + w - 1, base - 1, 'k');
    rect(x0 + 1, top + 1, x0 + w - 2, base - 1, 'h');
    // 屋根：軒（いちばん下）が広く、上に行くほどせまい三角
    let apex = top;
    for (let k = 0; ; k++) {
      const y = top - k;
      const left = x0 - 1 + k;
      const right = x0 + w - k;
      if (left > right) break;
      rect(left, y, right, y, roof);
      set(left, y, 'k');
      set(right, y, 'k');
      apex = y;
    }
    for (let x = 0; x < W; x++) if (g[apex][x] === roof) set(x, apex, 'k');
    rect(x0 - 1, top, x0 + w, top, 'k');
    rect(x0 + Math.floor(w / 2) - 1, base - 3, x0 + Math.floor(w / 2), base - 1, 'd');
    if (w >= 8) {
      set(x0 + 2, top + 2, 'y');
      set(x0 + w - 3, top + 2, 'y');
    }
  };
  house(3, 9, 6, 'r');
  house(14, 7, 5, 'R');
  house(42, 8, 6, 'R');
  house(53, 9, 5, 'r');
  // 吹き出しの看板（言葉の街のしるし）
  rect(26, 16, 26, 21, 'd');
  rect(22, 11, 30, 15, 'k');
  rect(23, 12, 29, 14, 'w');
  for (const x of [24, 26, 28]) set(x, 13, 'k');
  set(25, 16, 'k');
  set(25, 15, 'w');
  return {
    palette: {
      k: OUTLINE,
      a: '#6fb6e8',
      b: '#a9dbf7',
      w: '#ffffff',
      m: '#4f9a5a',
      g: '#73c063',
      p: '#d9c08c',
      h: '#f4e6c4',
      r: '#c8642a',
      R: '#3d7be0',
      d: '#8a5a2b',
      y: '#ffd84a',
    },
    rows: g.map((row) => row.join('')),
  };
}

SPRITES['hero/hero'] = drawHero();
SPRITES['towns/town01'] = drawTown01();

for (const [id, sprite] of Object.entries(SPRITES)) {
  const colors = Object.keys(sprite.palette).filter((k) => k !== 'k' && k !== 'w');
  // 16×16 は3〜4色まで。32×32 のボスは描き込むので制限しない
  if (sprite.rows.length === 16 && colors.length > 4) throw new Error(`${id}: 色が多すぎます（輪郭と白を除いて4色まで）`);
  const file = path.join(OUT_DIR, `${id}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(sprite, id));
  console.log(file);
}
