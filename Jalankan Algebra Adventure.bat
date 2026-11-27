@echo off
rem Klik dua kali file ini untuk menjalankan Algebra Adventure lengkap (aplikasi + Tanya TATA/AI).
rem Biarkan jendela ini terbuka selama aplikasi dipakai. Tutup jendela atau tekan Ctrl+C untuk berhenti.
title Algebra Adventure
cd /d "%~dp0frontend"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Unduh dari https://nodejs.org lalu jalankan file ini lagi.
  pause
  exit /b 1
)
node scripts\start-all.mjs
pause
