# OGP の画像（LINE や X でアドレスを送ったときに出る絵、1200×630）を作る（Windows の PowerShell で動く。Pixellab は使わない）。
#
#   powershell -ExecutionPolicy Bypass -File scripts/make_ogp.ps1 -Design A -Out art/ogp-candidates/ogp-A.png
#
# 240×126 の小さな絵を、今あるドット絵（背景・主人公・モンスター）で組み立て、5倍に拡大して 1200×630 にする。
# 文字も小さく描いてから拡大するので、ドット絵らしい文字になる。題名は 5×7 のドット文字（make_icon.ps1 と同じ形）。
#   A：はじまりの街の前に主人公（下の帯に一言）
#   B：草原で主人公とモンスターが向かい合う戦闘の場面
#   C：紺の夜空に主人公（男の子・女の子）と、能力値の六角形
param(
  [Parameter(Mandatory = $true)][ValidateSet('A', 'B', 'C')][string]$Design,
  [Parameter(Mandatory = $true)][string]$Out
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..'
$W = 240; $H = 126; $SCALE = 5

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
  ' ' = @('.....', '.....', '.....', '.....', '.....', '.....', '.....')
}

function Img($rel) { return [System.Drawing.Image]::FromFile((Resolve-Path (Join-Path $root $rel))) }
function C($hex) { return [System.Drawing.ColorTranslator]::FromHtml($hex) }

$navy = C '#0c1026'
$ink = C '#120c14'
$white = C '#ffffff'
$gold = C '#ffc430'
$light = C '#ffeca0'
$deep = C '#d68018'

$bmp = New-Object System.Drawing.Bitmap -ArgumentList $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit

# 絵を、そのままの大きさ（1倍）で置く。sx・sy・sw・sh はもとの絵から切り取る範囲
function Put($image, $x, $y, $sx = 0, $sy = 0, $sw = -1, $sh = -1) {
  if ($sw -lt 0) { $sw = $image.Width }
  if ($sh -lt 0) { $sh = $image.Height }
  $dst = New-Object System.Drawing.Rectangle -ArgumentList $x, $y, $sw, $sh
  $g.DrawImage($image, $dst, $sx, $sy, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel)
}

# 題名（ドット文字。dot は1つの点の大きさ）。黒いふちどり、上は明るい金、下は濃い金
function Title($text, $cx, $top, $dot) {
  $w = $text.Length * 6 * $dot - $dot
  $left = [int]($cx - $w / 2)
  $outlineBrush = New-Object System.Drawing.SolidBrush $ink
  for ($pass = 0; $pass -lt 2; $pass++) {
    for ($i = 0; $i -lt $text.Length; $i++) {
      $gl = $glyphs[[string]$text[$i]]
      for ($gy = 0; $gy -lt 7; $gy++) { for ($gx = 0; $gx -lt 5; $gx++) {
        if ($gl[$gy][$gx] -ne '#') { continue }
        $x = $left + ($i * 6 + $gx) * $dot; $y = $top + $gy * $dot
        if ($pass -eq 0) { $g.FillRectangle($outlineBrush, $x - 1, $y - 1, $dot + 2, $dot + 2) }
        else {
          $c = if ($gy -le 1) { $light } elseif ($gy -le 4) { $gold } else { $deep }
          $b = New-Object System.Drawing.SolidBrush $c
          $g.FillRectangle($b, $x, $y, $dot, $dot)
          $b.Dispose()
        }
      } }
    }
  }
  $outlineBrush.Dispose()
}

# 日本語の文（小さいドットの字）。ふちどりつき、cx を中心に
$font = New-Object System.Drawing.Font -ArgumentList 'MS UI Gothic', 12, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
function Text($text, $cx, $top, $color, $outline = $true) {
  $size = $g.MeasureString($text, $font, 1000, [System.Drawing.StringFormat]::GenericTypographic)
  $x = [int]($cx - $size.Width / 2)
  if ($outline) {
    $ob = New-Object System.Drawing.SolidBrush $ink
    foreach ($o in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, 1), @(-1, 1), @(1, -1))) {
      $g.DrawString($text, $font, $ob, $x + $o[0], $top + $o[1], [System.Drawing.StringFormat]::GenericTypographic)
    }
    $ob.Dispose()
  }
  $b = New-Object System.Drawing.SolidBrush $color
  $g.DrawString($text, $font, $b, $x, $top, [System.Drawing.StringFormat]::GenericTypographic)
  $b.Dispose()
}

# ドット絵のウインドウ（紺の中身に白いわく）
function Window($x, $y, $w, $h) {
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $navy), $x, $y, $w, $h)
  $p = New-Object System.Drawing.Pen -ArgumentList $white, 1
  $g.DrawRectangle($p, $x + 1, $y + 1, $w - 3, $h - 3)
  $p.Dispose()
}

switch ($Design) {
  'A' {
    $g.Clear($navy)
    $town = Img 'public/towns/town01.png'
    Put $town 0 0 8 0 240 112
    $hero = Img 'public/hero/hero.png'
    Put $hero 88 50
    $girl = Img 'public/hero/girl/hero.png'
    Put $girl 120 50
    Title 'ENGLISH QUEST' 120 8 2
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $navy), 0, 110, 240, 16)
    Text 'RPGの冒険で、英語をきたえよう' 120 112 $white $false
  }
  'B' {
    $bg = Img 'public/battle/town01-meadow.png'
    Put $bg 0 0 8 0 240 126
    $hero = Img 'public/hero/hero.png'
    Put $hero 20 40
    $mon = Img 'public/monsters/town01-mon-voc.png'
    Put $mon 150 36
    Title 'ENGLISH QUEST' 120 6 2
    Window 8 96 224 26
    Text '問題に答えて、モンスターをたおそう！' 120 103 $white $false
  }
  'C' {
    $g.Clear($navy)
    $star = New-Object System.Drawing.SolidBrush $light
    foreach ($s in @(@(12, 40), @(30, 100), @(70, 30), @(110, 112), @(150, 36), @(228, 30), @(220, 112), @(96, 70))) {
      $g.FillRectangle($star, $s[0], $s[1], 1, 1)
    }
    $hero = Img 'public/hero/hero.png'
    Put $hero 8 34
    $girl = Img 'public/hero/girl/hero.png'
    Put $girl 58 34
    Title 'ENGLISH QUEST' 120 6 2
    # 能力値の六角形（見本の形）
    $cx = 178; $cy = 68; $r = 26
    $labels = @('語彙', '文法', '聞く', '読む', '話す', '書く')
    $vals = @(0.85, 0.6, 0.75, 0.5, 0.7, 0.8)
    $outer = @(); $inner = @(); $mid = @()
    for ($i = 0; $i -lt 6; $i++) {
      $a = -[Math]::PI / 2 + $i * [Math]::PI / 3
      $outer += New-Object System.Drawing.PointF -ArgumentList ($cx + $r * [Math]::Cos($a)), ($cy + $r * [Math]::Sin($a))
      $mid += New-Object System.Drawing.PointF -ArgumentList ($cx + $r * 0.5 * [Math]::Cos($a)), ($cy + $r * 0.5 * [Math]::Sin($a))
      $inner += New-Object System.Drawing.PointF -ArgumentList ($cx + $r * $vals[$i] * [Math]::Cos($a)), ($cy + $r * $vals[$i] * [Math]::Sin($a))
    }
    $grid = New-Object System.Drawing.Pen -ArgumentList (C '#5a6496'), 1
    $g.DrawPolygon($grid, $outer)
    $g.DrawPolygon($grid, $mid)
    $g.FillPolygon((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, 255, 196, 48))), $inner)
    $g.DrawPolygon((New-Object System.Drawing.Pen -ArgumentList $gold, 1), $inner)
    for ($i = 0; $i -lt 6; $i++) {
      $a = -[Math]::PI / 2 + $i * [Math]::PI / 3
      $lx = $cx + ($r + 12) * [Math]::Cos($a); $ly = $cy + ($r + 9) * [Math]::Sin($a) - 6
      Text $labels[$i] $lx $ly $white $false
    }
    Text '答えるほど、6つの力が育っていく' 120 111 $white $false
  }
}

$g.Dispose()
$big = New-Object System.Drawing.Bitmap -ArgumentList ($W * $SCALE), ($H * $SCALE)
$bg2 = [System.Drawing.Graphics]::FromImage($big)
$bg2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$bg2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$bg2.DrawImage($bmp, 0, 0, $W * $SCALE, $H * $SCALE)
$bg2.Dispose()
$outPath = Join-Path $root $Out
New-Item -ItemType Directory -Force (Split-Path $outPath) | Out-Null
$big.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$big.Dispose(); $bmp.Dispose()
Write-Output "作成: $outPath"
