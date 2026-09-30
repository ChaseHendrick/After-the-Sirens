@echo off
cd /d "%~dp0\.."
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer, then open this launcher again.
  pause
  exit /b 1
)
if not exist node_modules\ws call npm ci
call npm run host -- --host 0.0.0.0 %*
pause
