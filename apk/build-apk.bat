@echo off
title Senyou WP8 - APK Build
REM ============================================================
REM  Senyou Travel (WP8) Android APK one-click build script
REM  Double-click this file to build app-debug.apk
REM  Full log: %~dp0build-log.txt
REM ============================================================

set "LOG=%~dp0build-log.txt"
del "%LOG%" 2>nul
echo [start] %date% %time% >> "%LOG%" 2>&1

REM 1. Locate JDK 21 (Capacitor 7 / Gradle 8.11.1 does NOT support Java 25)
set "JDK="
if exist "%LOCALAPPDATA%\Android\jdk21\bin\java.exe" set "JDK=%LOCALAPPDATA%\Android\jdk21"
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do if exist "%%i\bin\java.exe" if not defined JDK set "JDK=%%i"
for /d %%i in ("C:\Program Files\Microsoft\jdk-21*") do if exist "%%i\bin\java.exe" if not defined JDK set "JDK=%%i"
if not defined JDK (
    echo [error] JDK21 not found, LOCALAPPDATA=%LOCALAPPDATA% >> "%LOG%" 2>&1
    echo:
    echo [ERROR] JDK 21 not found.
    echo Android Studio bundled Java 25 is incompatible with Gradle 8.11
    echo error Unsupported class file major version 69.
    echo Please double-click setup-jdk.bat first then run this again.
    echo:
    goto :fail
)
set "JAVA_HOME=%JDK%"
echo [jdk] %JAVA_HOME% >> "%LOG%" 2>&1
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"
echo JDK 21: %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version

cd /d "%~dp0"
echo [cwd] %CD% >> "%LOG%" 2>&1

echo ============================================================
echo  Senyou Travel - Windows Phone 8 - APK Build
echo ============================================================

REM 2. Install npm dependencies (picks up newly added plugins)
echo [1/4] Installing npm dependencies...
echo [step1] npm install >> "%LOG%" 2>&1
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
if errorlevel 1 goto :fail

REM 3. Generate Android native project (first time only)
if not exist "android" (
    echo [2/4] Generating Android native project...
    echo [step2] cap add android >> "%LOG%" 2>&1
    call npx cap add android >> "%LOG%" 2>&1
    if errorlevel 1 goto :fail
) else (
    echo [2/4] Android project already exists, skip
    echo [step2] skip >> "%LOG%" 2>&1
)

REM 3.5. Bump Beta version (counter + web version.js + android versionName/versionCode)
echo [step3.5] bump version >> "%LOG%" 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0bump-version.ps1" >> "%LOG%" 2>&1

REM 4. Sync web assets into the native project
echo [3/4] Syncing web assets...
echo [step3] cap sync android >> "%LOG%" 2>&1
call npx cap sync android >> "%LOG%" 2>&1
if errorlevel 1 goto :fail

REM 5. Stop stale Gradle daemons, then build debug APK
echo [4/4] Building debug APK (first time downloads Gradle, please wait)...
echo [step4] gradlew --stop >> "%LOG%" 2>&1
cd android
call gradlew.bat --stop >> "%LOG%" 2>&1
REM Clean app module incremental outputs (avoids AAPT2 "no data file for changedFile" cache bug)
if exist "app\build" rmdir /s /q "app\build"
echo [step5] gradlew assembleDebug >> "%LOG%" 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "& .\gradlew.bat assembleDebug --console=plain 2>&1 | Tee-Object -FilePath '%~dp0build-log.txt' -Append; exit $LASTEXITCODE"
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
echo [success] %date% %time% >> "%LOG%" 2>&1
REM Copy a versioned APK (senyou-wp8-v0.1.N.apk)
for /f %%v in ('type "%~dp0build-counter.txt"') do set "VER=%%v"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d='%~dp0android\app\build\outputs\apk\debug\'; Copy-Item (Join-Path $d 'app-debug.apk') (Join-Path $d ('senyou-wp8-v0.1.'+$env:VER+'.apk')) -Force" >> "%LOG%" 2>&1
echo  Versioned: senyou-wp8-v0.1.%VER%.apk
start explorer "%~dp0android\app\build\outputs\apk\debug"
goto :eof

:fail
echo [fail] %date% %time% >> "%LOG%" 2>&1
echo.
echo ============================================================
echo  BUILD FAILED - see the error messages above.
echo  Full log: %~dp0build-log.txt
echo ============================================================
pause
