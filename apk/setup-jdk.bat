@echo off
chcp 65001 >nul
title Senyou WP8 - 安裝 JDK 21
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-jdk.ps1"
echo.
pause
