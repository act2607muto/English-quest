# 画面のわく（ウインドウ・ボタン・カード）のドット絵を作る（Windows の PowerShell で動く。外部のツールは使わない）。
#
#   powershell -ExecutionPolicy Bypass -File scripts/make_ui_frames.ps1
#
# public/ui/frame-{色}.png（24×24）を書き出す。CSS の border-image で、角はそのまま・辺は伸ばして使う
# （styles.css の「ドット絵のわく」）。1ドットを 2×2 の点で描き、角は階段のように丸める。
# わくは外から「黒いふち・明るい線・明るい線・影の線・黒いふち」の5ドット。中は透明（背景の色が見える）。

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot '..\public\ui'
New-Item -ItemType Directory -Force $out | Out-Null

$ART = 12      # 1辺のドット数
$SCALE = 2     # 1ドットの大きさ（点）
$R = 5.0       # 角の丸み（ドット）

function C($hex) { return [System.Drawing.ColorTranslator]::FromHtml($hex) }

# 色ごとの「外のふち・明るい線1・明るい線2・影の線・内のふち」
$frames = [ordered]@{
  'white'  = @('#0b0820', '#ffffff', '#e6e8ff', '#8f98c8', '#0b0820')
  'gold'   = @('#1a1000', '#fff4c0', '#ffd84a', '#c48a14', '#1a1000')
  'grey'   = @('#08080c', '#b4b4bc', '#8c8c96', '#55555e', '#08080c')
  'purple' = @('#120822', '#f0e2ff', '#c4a1ff', '#7a55c0', '#120822')
  'red'    = @('#1a0606', '#ffd0d0', '#ff7b7b', '#b83c3c', '#1a0606')
  'green'  = @('#041a0a', '#d8ffe0', '#8ff0a4', '#3e9c58', '#041a0a')
}

foreach ($name in $frames.Keys) {
  $layers = $frames[$name] | ForEach-Object { C $_ }
  $bmp = New-Object System.Drawing.Bitmap -ArgumentList ($ART * $SCALE), ($ART * $SCALE)
  for ($y = 0; $y -lt $ART; $y++) { for ($x = 0; $x -lt $ART; $x++) {
    $px = $x + 0.5; $py = $y + 0.5
    # 角の丸い四角のふちからの距離（ドット）
    $dx = [Math]::Max([Math]::Max($R - $px, 0), $px - ($ART - $R))
    $dy = [Math]::Max([Math]::Max($R - $py, 0), $py - ($ART - $R))
    if ($dx -gt 0 -and $dy -gt 0) { $dist = $R - [Math]::Sqrt($dx * $dx + $dy * $dy) }
    else { $dist = [Math]::Min([Math]::Min($px, $ART - $px), [Math]::Min($py, $ART - $py)) }
    $layer = [int][Math]::Floor($dist)
    if ($dist -lt 0 -or $layer -ge $layers.Count) { $c = [System.Drawing.Color]::Transparent } else { $c = $layers[$layer] }
    for ($sy = 0; $sy -lt $SCALE; $sy++) { for ($sx = 0; $sx -lt $SCALE; $sx++) {
      $bmp.SetPixel($x * $SCALE + $sx, $y * $SCALE + $sy, $c)
    } }
  } }
  $path = Join-Path $out "frame-$name.png"
  $bmp.Save($path)
  $bmp.Dispose()
  Write-Output "作成: $path"
}
