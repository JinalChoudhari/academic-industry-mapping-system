@echo off
setlocal

cd /d "%~dp0"

echo Starting Academic Industry Mapping System (Single Port)...
echo.

if not exist "backend\node_modules" (
  echo Installing backend dependencies...
  cd /d "%~dp0backend"
  npm install
  if errorlevel 1 goto :fail
  cd /d "%~dp0"
)

if not exist "Frontend\node_modules" (
  echo Installing frontend dependencies...
  cd /d "%~dp0Frontend"
  npm install
  if errorlevel 1 goto :fail
  cd /d "%~dp0"
)

echo Building frontend...
cd /d "%~dp0Frontend"
call npm run build
if errorlevel 1 goto :fail

echo.
echo Releasing port 5000 if already in use...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":5000 .*LISTENING"') do (
  echo Stopping process on port 5000: PID %%a
  taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Opening app at http://localhost:5000
start "" "http://localhost:5000"

echo Starting backend in a persistent window...
start "AIMS Server (5000)" cmd /k "cd /d ""%~dp0backend"" && node server.js"

echo.
echo Startup command finished.
echo If app does not load, check the 'AIMS Server (5000)' window for error details.
exit /b 0

:fail
echo.
echo Failed to start system. Check errors above.
pause
exit /b 1
