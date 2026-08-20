# ============================================================
#  Senyou WP8 APK - 自動下載並安裝 Temurin JDK 21 (免管理員權限)
#  安裝位置: %LOCALAPPDATA%\Android\jdk21
#  為什麼要 JDK 21: Capacitor 7 的 Gradle 8.11.1 不支援
#  Android Studio 內建的 Java 25 (會報 major version 69)
# ============================================================
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$dest   = Join-Path $env:LOCALAPPDATA 'Android\jdk21'
$zip    = Join-Path $env:TEMP 'adoptium-jdk21.zip'
$tmp    = Join-Path $env:LOCALAPPDATA 'Android\jdk21-tmp'
$url    = 'https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk'

Write-Host '============================================================' -ForegroundColor Cyan
Write-Host '  森友出行 WP8 - JDK 21 安裝工具'
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host "目標位置: $dest"
Write-Host ''

# 1. 已經裝好（或跑過一次）就直接用
if (Test-Path (Join-Path $dest 'bin\java.exe')) {
    Write-Host '[OK] JDK 21 已存在，無需重複下載。' -ForegroundColor Green
    & (Join-Path $dest 'bin\java.exe') -version 2>&1 | Out-String | Write-Host
    Write-Host ''
    Write-Host '完成! 現在雙擊 build-apk.bat 即可。' -ForegroundColor Green
    exit 0
}

# 2. 系統裡已經有正式安裝的 JDK 21（如 winget 裝過）
$pf = 'C:\Program Files\Eclipse Adoptium'
if (Test-Path $pf) {
    $installed = Get-ChildItem $pf -Directory | Where-Object { $_.Name -like 'jdk-21*' } | Select-Object -First 1
    if ($installed) {
        Write-Host "[OK] 已找到系統安裝的 JDK: $($installed.FullName)" -ForegroundColor Green
        & (Join-Path $installed.FullName 'bin\java.exe') -version 2>&1 | Out-String | Write-Host
        Write-Host ''
        Write-Host '完成! 現在雙擊 build-apk.bat 即可。' -ForegroundColor Green
        exit 0
    }
}

# 3. 下載 Temurin JDK 21（約 200MB）
Write-Host '[1/3] 下載 Temurin JDK 21（約 200MB，視網速需數分鐘）...'
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
} catch {
    Write-Host '[ERROR] 下載失敗，請檢查網絡後重試。' -ForegroundColor Red
    Write-Host "        或手動到 https://adoptium.net/temurin/releases/ 下載"
    Write-Host "        Windows x64 JDK 21 的 .zip，解壓到: $dest"
    exit 1
}

# 4. 解壓
Write-Host '[2/3] 解壓中...'
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
    tar -xf $zip -C $tmp
} catch {
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
}
$inner = Get-ChildItem $tmp -Directory | Select-Object -First 1
if (-not $inner) { Write-Host '[ERROR] 解壓失敗（壓縮包內沒有目錄）。' -ForegroundColor Red; exit 1 }
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Move-Item $inner.FullName $dest
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zip -Force -ErrorAction SilentlyContinue

# 5. 驗證
Write-Host '[3/3] 驗證 JDK...'
$v = & (Join-Path $dest 'bin\java.exe') -version 2>&1 | Out-String
Write-Host $v
if ($v -notmatch 'version "21') {
    Write-Host '[ERROR] 安裝的 Java 版本不對，請刪除後重試。' -ForegroundColor Red
    Write-Host "        $dest"
    exit 1
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host '  安裝完成! 現在雙擊 build-apk.bat 即可構建 APK'
Write-Host "  JAVA_HOME = $dest"
Write-Host '============================================================' -ForegroundColor Green
