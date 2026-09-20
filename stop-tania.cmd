@echo off
REM ==========================================
REM  Tania's FinTrack - stop server (port 4100)
REM  Hanya mematikan proses milik folder ini.
REM ==========================================
title Stop Tania's FinTrack

echo Menghentikan server Tania's FinTrack (port 4100)...

powershell -NoProfile -Command ^
  "$t = Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*Belajar Ngoding*' -and $_.CommandLine -notlike '*Belajar Ngoding Lagi*' }; if ($t) { $t | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Write-Host ('  ' + $t.Count + ' proses dihentikan.') } else { Write-Host '  Tidak ada server yang berjalan.' }"

echo Selesai.
ping 127.0.0.1 -n 3 >nul
