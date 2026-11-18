# 絵の保管

アプリでは使わない絵を残しておく場所。`public/` の外にあるので、公開されない。

- `old-sprites/`：Pixellab に差し替える前の仮のドット絵（`scripts/make_sprites.mjs` で作ったもの。2026-11-16 のコミット 616351e の時点）。フォルダの分け方とファイル名は `public/` と同じ。戻すときは、同じ名前のファイルを `public/` にコピーする。
- `pixellab-original/town01-before-fix.png`：Pixellab で作った街の背景の、手直し前のもの。右上に紛れ込んだアイコンを、`public/towns/town01.png` ではとなりの壁の模様で塗りつぶしてある。

ほかの Pixellab の絵は、作ったままのものが `public/` に入っている。
- `pixellab-original/town01-boss-armored.png`：最初の Pixellab のボス（よろいの騎士）。2026-11-17 に「最初の街には強そうすぎる」ため、狼のボスに差し替えた。戻すときは `public/monsters/town01-boss.png` にコピーし、`scripts/make_breath_frames.ps1` のボスの SplitRow を 73 に戻して動かす。
- `pixellab-original/hero-map-three-quarter.png`：マップ用の主人公の、最初の絵（ななめ前向き）。2026-11-17 に、横へ歩くときは真横を向いた絵（`public/hero/hero-map.png`、左向き）に差し替えた。
- `icon-candidates/`：アプリのアイコンの案（2026-11-17）。本人が選んだのは A（`icon-A.png` に文字を入れた `icon-A-title.png`）。ほかは見比べた案。
- `old-map/`：2026-11-17 に作り直す前の街の外のマップ（20×16 の town01.json と、地面の絵 terrain-water.png・terrain-path.png）。戻すときは public/maps/ に上書きする。
- `pixellab-original/town01-wpn-all-rainbow.png`：はじまりの街の「すべてに効く剣」の最初の絵（にじいろのつるぎ）。2026-11-18 に「2つ目の街の剣より強そうに見える」ため、たびだちのつるぎ（地味な鉄の剣）に差し替えた。
