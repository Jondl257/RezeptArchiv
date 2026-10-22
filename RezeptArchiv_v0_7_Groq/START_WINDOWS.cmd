@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Bitte Node.js ab Version 22 installieren und danach erneut starten.
  pause
  exit /b 1
)
if not exist .env (
  copy .env.example .env >nul
  echo Die Datei .env wurde angelegt.
  echo Bitte GROQ_API_KEY und APP_ACCESS_CODE in .env eintragen.
  echo Danach diese Startdatei erneut ausfuehren.
  pause
  exit /b 0
)
echo RezeptArchiv starten. Danach http://localhost:8080 im Browser oeffnen.
node --env-file=.env server/start.mjs
pause
