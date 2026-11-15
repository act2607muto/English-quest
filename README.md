# 英語ステータス育成アプリ

仕様は [docs/spec.md](docs/spec.md)、Supabase の準備は [docs/setup_supabase.md](docs/setup_supabase.md)。

## 画面を動かす

1. `.env.example` を `.env.local` という名前でコピーし、Supabase の Project URL と publishable key を入れる。
2. 次を実行する。

```bash
npm install
```

```bash
npm run dev
```

3. PC のブラウザで http://localhost:5173 を開く。

同じ Wi-Fi の iPhone からは、`npm run dev` の表示にある `Network: http://192.168.x.x:5173` を Safari で開く。
ただし録音は https でないと使えないので、iPhone での録音の確認は公開先（第1段階の手順3）で行う。

## フォルダ

| 場所 | 中身 |
| --- | --- |
| `src/` | 画面（React） |
| `src/lib/records.ts` | 記録の読み書き。データベースに触る処理はここにまとめる |
| `supabase/migrations/` | テーブル定義と RLS |
| `data/` | 教材の JSON |
| `scripts/` | 教材を作るスクリプト |
| `docs/` | 仕様書と手順書 |
