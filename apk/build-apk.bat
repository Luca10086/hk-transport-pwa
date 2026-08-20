@echo off
chcp 65001 >nul
title Senyou WP8 - APK Build
REM ============================================================
REM  Senyou Travel (WP8) Android APK one-click build script
REM  Double-click this file to build app-debug.apk
REM ============================================================

REM 1. Locate JDK 21 (Capacitor 7 / Gradle 8.11.1 does NOT support Java 25)
set "JDK="
if exist "%LOCALAPPDATA%\Android\jdk21\bin\java.exe" set "JDK=%LOCALAPPDATA%\Android\jdk21"
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do if exist "%%i\bin\java.exe" if not defined JDK set "JDK=%%i"
for /d %%i in ("C:\Program Files\Microsoft\jdk-21*") do if exist "%%i\bin\java.exe" if not defined JDK set "JDK=%%i"
if not defined JDK (
    echo.
    echo [ERROR] 找不到 JDK 21。
    echo Android Studio 自帶的 Java 25 與 Gradle 8.11 不相容（會報 major version 69）。
    echo 請先雙擊 setup-jdk.bat 一鍵下載 JDK 21，完成後再重新雙擊本腳本。
    echo.
    goto :fail
)
set "JAVA_HOME=%JDK%"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"
echo JDK 21: %JAVA_HOME%

cd /d "%~dp0"

echo ============================================================
echo  Senyou Travel - Windows Phone 8 - APK Build
echo ============================================================

REM 2. Install npm dependencies (first time only)
if not exist "node_modules" (
    echo [1/4] Installing npm dependencies...
    call npm install --no-audit --no-fund
    if errorlevel 1 goto :fail
) else (
    echo [1/4] npm dependencies already installed, skip
)

REM 3. Generate Android native project (first time only)
if not exist "android" (
    echo [2/4] Generating Android native project...
    call npx cap add android
    if errorlevel 1 goto :fail
) else (
    echo [2/4] Android project already exists, skip
)

REM 4. Sync web assets into the native project
echo [3/4] Syncing web assets...
call npx cap sync android
if errorlevel 1 goto :fail

REM 5. Build debug APK (first build downloads Gradle, may take a while)
echo [4/4] Building debug APK (first time downloads Gradle, please wait)...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    cd ..
    goto :fail
)
cd ..

echo.
echo ============================================================
echo  BUILD SUCCESS
echo  APK: %~dp0android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================================
start explorer "%~dp0android\app\build\outputs\apk\debug"
goto :eof

:fail
echo.
echo ============================================================
echo  BUILD FAILED - see the error messages above.
echo  Common issues:
echo   - Gradle download slow/failed: just run this script again
echo   - SDK not found: check ANDROID_HOME in this script
echo   - Unsupported class file major version 69: run setup-jdk.bat first
echo ============================================================
pause
