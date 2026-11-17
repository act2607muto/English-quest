# アプリのアイコンを作る（Windows の PowerShell で動く。外部のツールや Pixellab は使わない）。
#
#   powershell -ExecutionPolicy Bypass -File scripts/make_icon.ps1 -Source art/icon-candidates/icon-A.png -Out art/icon-candidates/icon-A-title.png
#
# 64×64 の主人公の顔の絵を、ひとまわり大きい 80×80 のアイコンの中に置く（主人公が小さく見える）。
# 足りないまわりの背景は、もとの絵の背景の色をのばして作り、もとの絵との境目はなめらかにまぜる。
# 下のほうは紺の帯にだんだん溶かし、5×7 のドット文字で「ENGLISH / QUEST」の2行を金色で描く。
# -Export をつけると、public/ のアイコン（icon-512.png・icon-192.png・apple-touch-icon.png）も書き出す。
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Out,
  [switch]$Export
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..'
$SIZE = 80
$OX = 8; $OY = 4            # もとの絵を置く位置（左上）
$FADE_FROM = 50; $BAND_ROW = 60  # この行から下を紺の帯へだんだん溶かす／ここから下は帯
$BLEND = 6                   # もとの絵のふちを背景にまぜる幅

$glyphs = @{
  'E' = @('#####', '#....', '#....', '####.', '#....', '#....', '#####')
  'N' = @('#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#')
  'G' = @('.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.')
  'L' = @('#....', '#....', '#....', '#....', '#....', '#....', '#####')
  'I' = @('.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.')
  'S' = @('.####', '#....', '#....', '.###.', '....#', '....#', '####.')
  'H' = @('#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#')
  'Q' = @('.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#')
  'U' = @('#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.')
  'T' = @('#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..')
}

function Mix($a, $b, $t) {
  $t = [Math]::Max(0.0, [Math]::Min(1.0, $t))
  return [System.Drawing.Color]::FromArgb(255,
    [int]($a.R + ($b.R - $a.R) * $t), [int]($a.G + ($b.G - $a.G) * $t), [int]($a.B + ($b.B - $a.B) * $t))
}
function ColorDiff($a, $b) { return [Math]::Max([Math]::Abs($a.R - $b.R), [Math]::Max([Math]::Abs($a.G - $b.G), [Math]::Abs($a.B - $b.B))) }

$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path (Join-Path $root $Source)))
$W = $src.Width; $H = $src.Height
$px = New-Object 'object[,]' $W, $H
for ($y = 0; $y -lt $H; $y++) { for ($x = 0; $x -lt $W; $x++) { $px[$x, $y] = $src.GetPixel($x, $y) } }
$src.Dispose()

# 背景を見つける：上の段と左右の上半分から、となりと色が近いところへ広げる（主人公は黒いふちどりで止まる）
$bg = New-Object 'bool[,]' $W, $H
$queue = New-Object System.Collections.Generic.Queue[int[]]
for ($x = 0; $x -lt $W; $x++) { $queue.Enqueue(@($x, 0)) }
for ($y = 0; $y -lt [int]($H / 2); $y++) { $queue.Enqueue(@(0, $y)); $queue.Enqueue(@(($W - 1), $y)) }
foreach ($p in $queue.ToArray()) { $bg[$p[0], $p[1]] = $true }
while ($queue.Count -gt 0) {
  $p = $queue.Dequeue()
  foreach ($o in @(@(1, 0), @(-1, 0), @(0, 1), @(0, -1))) {
    $nx = $p[0] + $o[0]; $ny = $p[1] + $o[1]
    if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $W -or $ny -ge $H -or $bg[$nx, $ny]) { continue }
    if ((ColorDiff $px[$p[0], $p[1]] $px[$nx, $ny]) -le 30) { $bg[$nx, $ny] = $true; $queue.Enqueue(@($nx, $ny)) }
  }
}

# 行ごとの背景の色（その行の背景のふつうの色）。背景がない行は、上の行の色を使う
$rowColor = @()
$last = $px[1, 1]
for ($y = 0; $y -lt $H; $y++) {
  $r = 0; $g = 0; $b = 0; $n = 0
  foreach ($x in @(0, 1, 2, ($W - 3), ($W - 2), ($W - 1))) { if ($bg[$x, $y]) { $c = $px[$x, $y]; $r += $c.R; $g += $c.G; $b += $c.B; $n++ } }
  if ($n -gt 0) { $last = [System.Drawing.Color]::FromArgb(255, [int]($r / $n), [int]($g / $n), [int]($b / $n)) }
  $rowColor += $last
}
$bandColor = [System.Drawing.Color]::FromArgb(255, 12, 16, 38)
function BgAt($y) {
  $sy = $y - $OY
  if ($sy -lt 0) { return $rowColor[0] }
  if ($sy -ge $H) { return $rowColor[$H - 1] }
  return $rowColor[$sy]
}

$img = New-Object System.Drawing.Bitmap -ArgumentList $SIZE, $SIZE
for ($y = 0; $y -lt $SIZE; $y++) { for ($x = 0; $x -lt $SIZE; $x++) {
  $base = BgAt $y
  $sx = $x - $OX; $sy = $y - $OY
  if ($sx -ge 0 -and $sy -ge 0 -and $sx -lt $W -and $sy -lt $H) {
    $c = $px[$sx, $sy]
    if ($bg[$sx, $sy]) {
      # もとの絵の背景は、ふちに近いほど行の色にまぜて、境目を消す
      $edge = [Math]::Min([Math]::Min($sx, $W - 1 - $sx), $sy)
      $c = Mix $base $c ($edge / $BLEND)
    }
  } else { $c = $base }
  # 下のほうは紺の帯へ溶かす
  if ($y -ge $FADE_FROM) { $c = Mix $c $bandColor (($y - $FADE_FROM + 1) / ($BAND_ROW - $FADE_FROM + 1)) }
  $img.SetPixel($x, $y, $c)
} }

# まわりにのばした背景に、小さな星
$star = [System.Drawing.Color]::FromArgb(255, 255, 226, 120)
foreach ($s in @(@(3, 12), @(76, 8), @(4, 36), @(75, 30))) {
  $x = $s[0]; $y = $s[1]
  $img.SetPixel($x, $y, [System.Drawing.Color]::White)
  foreach ($o in @(@(1, 0), @(-1, 0), @(0, 1), @(0, -1))) { $img.SetPixel($x + $o[0], $y + $o[1], $star) }
}

# 文字
$outline = [System.Drawing.Color]::FromArgb(255, 18, 12, 20)
$light = [System.Drawing.Color]::FromArgb(255, 255, 236, 150)
$gold = [System.Drawing.Color]::FromArgb(255, 255, 196, 48)
$deep = [System.Drawing.Color]::FromArgb(255, 214, 128, 24)
$mask = New-Object 'bool[,]' $SIZE, $SIZE
$lines = @(@{ Text = 'ENGLISH'; Top = 62 }, @{ Text = 'QUEST'; Top = 71 })
foreach ($line in $lines) {
  $w = $line.Text.Length * 6 - 1
  $left = [int][Math]::Floor(($SIZE - $w) / 2)
  for ($i = 0; $i -lt $line.Text.Length; $i++) {
    $gl = $glyphs[[string]$line.Text[$i]]
    for ($gy = 0; $gy -lt 7; $gy++) { for ($gx = 0; $gx -lt 5; $gx++) {
      if ($gl[$gy][$gx] -eq '#') { $mask[($left + $i * 6 + $gx), ($line.Top + $gy)] = $true }
    } }
  }
}
for ($y = 55; $y -lt $SIZE; $y++) { for ($x = 0; $x -lt $SIZE; $x++) {
  if ($mask[$x, $y]) { continue }
  $near = $false
  for ($dy = -1; $dy -le 1 -and -not $near; $dy++) { for ($dx = -1; $dx -le 1; $dx++) {
    $nx = $x + $dx; $ny = $y + $dy
    if ($nx -ge 0 -and $ny -ge 0 -and $nx -lt $SIZE -and $ny -lt $SIZE -and $mask[$nx, $ny]) { $near = $true; break }
  } }
  if ($near) { $img.SetPixel($x, $y, $outline) }
} }
foreach ($line in $lines) {
  for ($y = $line.Top; $y -lt $line.Top + 7; $y++) { for ($x = 0; $x -lt $SIZE; $x++) {
    if (-not $mask[$x, $y]) { continue }
    $row = $y - $line.Top
    $c = if ($row -le 1) { $light } elseif ($row -le 4) { $gold } else { $deep }
    $img.SetPixel($x, $y, $c)
  } }
}

$outPath = Join-Path $root $Out
$img.Save($outPath)
Write-Output "作成: $outPath"

function Save-Scaled($bmp, $size, $path) {
  # 整数倍で大きくしてから目的の大きさに縮める（ドットがにじみにくい）
  $factor = [int][Math]::Ceiling($size / $bmp.Width)
  $big = New-Object System.Drawing.Bitmap -ArgumentList ($bmp.Width * $factor), ($bmp.Height * $factor)
  $g = [System.Drawing.Graphics]::FromImage($big)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g.DrawImage($bmp, 0, 0, $big.Width, $big.Height)
  $g.Dispose()
  $final = New-Object System.Drawing.Bitmap -ArgumentList $size, $size
  $g2 = [System.Drawing.Graphics]::FromImage($final)
  $g2.InterpolationMode = if ($big.Width -eq $size) { [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor } else { [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic }
  $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g2.DrawImage($big, 0, 0, $size, $size)
  $g2.Dispose(); $big.Dispose()
  $final.Save($path); $final.Dispose()
  Write-Output "作成: $path"
}

if ($Export) {
  $public = Join-Path $root 'public'
  Save-Scaled $img 512 (Join-Path $public 'icon-512.png')
  Save-Scaled $img 192 (Join-Path $public 'icon-192.png')
  Save-Scaled $img 180 (Join-Path $public 'apple-touch-icon.png')
}
$img.Dispose()
