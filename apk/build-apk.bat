@echo off
title Senyou WP8 - APK Build
REM ============================================================
REM  Senyou Travel (WP8) Android APK one-click build script
REM  Double-click this file to build app-debug.apk
REM ============================================================

REM 1. Setup environment (Android Studio JBR + SDK)
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

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
echo ============================================================
pause
