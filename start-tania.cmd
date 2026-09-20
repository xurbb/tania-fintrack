@echo off
REM ==================================================
REM  Tania's FinTrack - launcher
REM  Server jalan di http://localhost:4100
REM  (port 3000 dibiarkan untuk proyek lain)
REM ==================================================
title Tania's FinTrack (port 4100)

REM Pastikan Node.js portable terdeteksi
set "PATH=%LOCALAPPDATA%\Programs\nodejs-lts;%PATH%"

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [X] Node.js tidak ditemukan.
  echo     Install dari https://nodejs.org lalu jalankan lagi.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [i] Pertama kali jalan - menginstall dependensi...
  call npm install
)

echo.
echo  ==========================================
echo   Tania's FinTrack - Financial Tracker
echo   URL  : http://localhost:4100
echo   Stop : tekan Ctrl + C
echo  ==========================================
echo.
echo  Menyalakan server, browser akan terbuka otomatis...
echo.

REM Buka browser setelah server siap (~15 detik)
start "" /min cmd /c "ping 127.0.0.1 -n 16 >nul & start "" http://localhost:4100"

call npm run dev

pause
