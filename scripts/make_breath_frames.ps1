# 呼吸の動きに使う「2コマ目」の絵を作る（Windows の PowerShell で動く。外部のツールは使わない）。
#
#   powershell -ExecutionPolicy Bypass -File scripts/make_breath_frames.ps1
#
# public/ の絵（例：hero/hero.png）から、同じ場所に「-breath」をつけた絵（hero/hero-breath.png）を作る。
# 2コマ目は、足元（SplitRow の行）より上をまるごと1マス下げた絵。元の絵と交互に出すと、
# 息をして体が上下しているように見える。SplitRow の行は2コマ目では消える（上の行で上書きされる）。
#
# 画面では、-breath の絵があれば交互に出し、なければ止まった絵のまま（src/components/HeroArt.tsx、MonsterArt.tsx）。
# 絵を Pixellab で作り直したら、このスクリプトをもう一度動かす。新しい絵を足すときは下の一覧に1行足す。
# SplitRow は、足や地面に接している部分のすぐ上の行にする（そこから下は動かない）。

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$public = Join-Path $PSScriptRoot '..\public'

$frames = @(
  @{ File = 'hero/hero.png';                 SplitRow = 47 }  # 主人公（64×64）：腰から上
  @{ File = 'hero/girl/hero.png';            SplitRow = 47 }  # 主人公・女の子（64×64）：腰から上
  @{ File = 'monsters/town01-mon-voc.png';   SplitRow = 48 }  # ページムシ
  @{ File = 'monsters/town01-mon-gra.png';   SplitRow = 46 }
  @{ File = 'monsters/town01-mon-lis.png';   SplitRow = 45 }
  @{ File = 'monsters/town01-mon-wri.png';   SplitRow = 47 }
  @{ File = 'monsters/town01-mon-spe.png';   SplitRow = 46 }
  @{ File = 'monsters/town01-mon-voc-revival.png'; SplitRow = 48 }  # ページムシ（復活・色違い）
  @{ File = 'monsters/town01-mon-gra-revival.png'; SplitRow = 46 }
  @{ File = 'monsters/town01-mon-lis-revival.png'; SplitRow = 45 }
  @{ File = 'monsters/town01-mon-wri-revival.png'; SplitRow = 47 }
  @{ File = 'monsters/town01-mon-spe-revival.png'; SplitRow = 46 }
  @{ File = 'monsters/town01-rare-exp.png';  SplitRow = 54 }  # ひらめきボタル（飛んでいるので全体を下げる）
  @{ File = 'monsters/town01-rare-gold.png'; SplitRow = 47 }  # こばんガエル（足元の小判は動かさない）
  @{ File = 'monsters/town01-boss.png';      SplitRow = 80 }  # ことだまの門番（96×96。狼なので足先より上）
  @{ File = 'monsters/town02-mon-voc.png';   SplitRow = 49 }  # ねふだネズミ
  @{ File = 'monsters/town02-mon-gra.png';   SplitRow = 45 }  # てんびんガニ
  @{ File = 'monsters/town02-mon-lis.png';   SplitRow = 52 }  # よびこみオウム
  @{ File = 'monsters/town02-mon-rea.png';   SplitRow = 48 }  # レシートヘビ
  @{ File = 'monsters/town02-mon-wri.png';   SplitRow = 51 }  # ちょうめんフクロウ
  @{ File = 'monsters/town02-mon-spe.png';   SplitRow = 52 }  # ねぎりダヌキ
  @{ File = 'monsters/town02-mon-voc-revival.png'; SplitRow = 49 }  # ねふだネズミ（復活・色違い）
  @{ File = 'monsters/town02-mon-gra-revival.png'; SplitRow = 45 }  # てんびんガニ（復活・色違い）
  @{ File = 'monsters/town02-mon-lis-revival.png'; SplitRow = 52 }  # よびこみオウム（復活・色違い）
  @{ File = 'monsters/town02-mon-rea-revival.png'; SplitRow = 48 }  # レシートヘビ（復活・色違い）
  @{ File = 'monsters/town02-mon-wri-revival.png'; SplitRow = 51 }  # ちょうめんフクロウ（復活・色違い）
  @{ File = 'monsters/town02-mon-spe-revival.png'; SplitRow = 52 }  # ねぎりダヌキ（復活・色違い）
  @{ File = 'monsters/town02-rare-exp.png';  SplitRow = 50 }  # ほしくずリス
  @{ File = 'monsters/town02-rare-gold.png'; SplitRow = 46 }  # ちょきんブタ
  @{ File = 'monsters/town02-boss.png';      SplitRow = 82 }  # せきもりの大ガメ（96×96）
  @{ File = 'monsters/town01-wordbook.png';  SplitRow = 63 }  # しおりオバケ（浮いているので全体を下げる）
  @{ File = 'monsters/town02-wordbook.png';  SplitRow = 63 }  # ふせんチョウ（飛んでいるので全体を下げる）
  @{ File = 'monsters/town03-mon-voc.png';   SplitRow = 43 }  # おしながきイモムシ（地面をはうので低め）
  @{ File = 'monsters/town03-mon-gra.png';   SplitRow = 51 }  # ぎょうれつアリ
  @{ File = 'monsters/town03-mon-lis.png';   SplitRow = 52 }  # ちゅうもんコウモリ
  @{ File = 'monsters/town03-mon-rea.png';   SplitRow = 51 }  # たてふだカカシ
  @{ File = 'monsters/town03-mon-wri.png';   SplitRow = 51 }  # でんぴょうカモメ
  @{ File = 'monsters/town03-mon-spe.png';   SplitRow = 50 }  # よびりんペンギン
  @{ File = 'monsters/town03-mon-voc-revival.png'; SplitRow = 43 }  # おしながきイモムシ（復活・色違い）
  @{ File = 'monsters/town03-mon-gra-revival.png'; SplitRow = 51 }  # ぎょうれつアリ（復活・色違い）
  @{ File = 'monsters/town03-mon-lis-revival.png'; SplitRow = 52 }  # ちゅうもんコウモリ（復活・色違い）
  @{ File = 'monsters/town03-mon-rea-revival.png'; SplitRow = 51 }  # たてふだカカシ（復活・色違い）
  @{ File = 'monsters/town03-mon-wri-revival.png'; SplitRow = 51 }  # でんぴょうカモメ（復活・色違い）
  @{ File = 'monsters/town03-mon-spe-revival.png'; SplitRow = 50 }  # よびりんペンギン（復活・色違い）
  @{ File = 'monsters/town03-rare-exp.png';  SplitRow = 50 }  # ほうせきカタツムリ
  @{ File = 'monsters/town03-rare-gold.png'; SplitRow = 51 }  # おさいふペリカン
  @{ File = 'monsters/town03-boss.png';      SplitRow = 82 }  # みちまよいの大ダコ（96×96）
  @{ File = 'monsters/town03-wordbook.png';  SplitRow = 48 }  # じびきモグラ（本から上だけ動かす）
)

foreach ($f in $frames) {
  $src = Join-Path $public $f.File
  $dst = $src -replace '\.png$', '-breath.png'
  $b = [System.Drawing.Bitmap]::FromFile((Resolve-Path $src))
  $n = New-Object System.Drawing.Bitmap($b.Width, $b.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $clear = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
  for ($y = 0; $y -lt $b.Height; $y++) {
    for ($x = 0; $x -lt $b.Width; $x++) {
      if ($y -gt $f.SplitRow) { $c = $b.GetPixel($x, $y) }
      elseif ($y -ge 1) { $c = $b.GetPixel($x, $y - 1) }
      else { $c = $clear }
      $n.SetPixel($x, $y, $c)
    }
  }
  $b.Dispose()
  $n.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $n.Dispose()
  Write-Output "作成: $dst"
}
