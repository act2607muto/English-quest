// Pixellab の地面の絵（Wang タイルの組）を取ってきて、マップのファイルに書く「角の表」を作る。
//
//   node scripts/fetch_tileset.mjs <tileset の ID> public/maps/terrain-xxx.png
//
// 絵（16枚が並んだ PNG）を指定の場所に保存し、マップのファイルの ground.sets に入れる
// corners（北西・北東・南西・南東の角が l＝lower か u＝upper かで、絵のどこを使うか）を表示する。
// 絵の ID は鍵ではない（公開の URL）ので、ログインはいらない。

import fs from 'node:fs';
import path from 'node:path';

const [id, out] = process.argv.slice(2);
if (!id || !out) {
  console.error('使い方: node scripts/fetch_tileset.mjs <tileset の ID> <保存する PNG>');
  process.exit(1);
}

const BASE = `https://api.pixellab.ai/mcp/tilesets/${encodeURIComponent(id)}`;

const png = await fetch(`${BASE}/image?inline=true`);
if (!png.ok) throw new Error(`絵を取れませんでした（${png.status}）`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(await png.arrayBuffer()));

const metaRes = await fetch(`${BASE}/metadata`);
if (!metaRes.ok) throw new Error(`角の情報を取れませんでした（${metaRes.status}）`);
const meta = await metaRes.json();

// 形の違う返事にも対応する：tiles が配列か、tileset_data.tiles か
const tiles = meta.tiles ?? meta.tileset_data?.tiles ?? [];
const corners = {};
for (const t of tiles) {
  const c = t.corners ?? {};
  const key = ['NW', 'NE', 'SW', 'SE'].map((k) => (c[k] === 'lower' ? 'l' : 'u')).join('');
  const box = t.bounding_box ?? t.boundingBox;
  if (!box) continue;
  corners[key] = [box.x, box.y];
}
if (Object.keys(corners).length !== 16) {
  console.error(`角の表が16通りそろいませんでした（${Object.keys(corners).length}通り）`);
  process.exit(1);
}
console.log(`保存: ${out}`);
console.log(JSON.stringify(corners));
