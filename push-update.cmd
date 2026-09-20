@echo off
REM ==========================================================
REM  Tania's FinTrack - kirim update ke GitHub
REM  Setelah ini Vercel otomatis build & deploy ulang.
REM
REM  Pakai:  klik 2x file ini, atau
REM          push-update.cmd "pesan update kamu"
REM ==========================================================
title Push update - Tania's FinTrack

set "GITDIR=%LOCALAPPDATA%\Programs\portablegit"
set "PATH=%GITDIR%\cmd;%GITDIR%\bin;%LOCALAPPDATA%\Programs\nodejs-lts;%PATH%"

cd /d "%~dp0"

set "MSG=%~1"
if "%MSG%"=="" set "MSG=update Tania's FinTrack"

echo.
echo  ==========================================
echo   Mengirim update ke GitHub
echo   Pesan: %MSG%
echo  ==========================================
echo.

git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo  Tidak ada perubahan untuk dikirim.
  ping 127.0.0.1 -n 4 >nul
  exit /b 0
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo  [X] Gagal commit.
  pause
  exit /b 1
)

git push
if errorlevel 1 (
  echo  [X] Gagal push. Cek koneksi internet / akses repo.
  pause
  exit /b 1
)

echo.
echo  Selesai! Vercel akan otomatis deploy dalam +-1 menit.
echo  Cek status di: https://vercel.com/dashboard
ping 127.0.0.1 -n 5 >nul
