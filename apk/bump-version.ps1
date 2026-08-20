# 森友出行 APK 版本計數器：每次構建 +1，寫入 www/js/version.js（Beta 0.1 build N）
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$counter = Join-Path $root 'build-counter.txt'
$n = 0
if (Test-Path $counter) {
  $t = (Get-Content $counter -Raw).Trim()
  if ($t -match '^\d+$') { $n = [int]$t }
}
$n++
Set-Content -Path $counter -Value ($n.ToString()) -Encoding ascii
$dir = Join-Path $root 'www\js'
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
$js = "window.APP_VERSION = 'Beta 0.1 build " + $n + "';"
[System.IO.File]::WriteAllText((Join-Path $dir 'version.js'), $js + [Environment]::NewLine)
Write-Host ("App version: Beta 0.1 build " + $n)

# Sync Android versionName/versionCode (installer shows 0.1.N instead of 1.0)
$gradleFile = Join-Path $root 'android\app\build.gradle'
if (Test-Path $gradleFile) {
  $g = [System.IO.File]::ReadAllText($gradleFile)
  $g = [regex]::Replace($g, 'versionCode\s+\d+', ('versionCode ' + $n))
  $g = [regex]::Replace($g, 'versionName\s+"[^"]*"', ('versionName "0.1.' + $n + '"'))
  [System.IO.File]::WriteAllText($gradleFile, $g)
  Write-Host ("Android version: 0.1." + $n)
}
