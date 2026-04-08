@echo off
setlocal enabledelayedexpansion
title JeevikaAI Setup

echo.
echo ============================================================
echo   JeevikaAI - Free Indian Health Report AI Translator
echo ============================================================
echo.

:: ── 1. Check Node.js ────────────────────────────────────────
echo [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo   ERROR: Node.js is not installed or not in PATH.
    echo   Download it from: https://nodejs.org  (LTS version recommended)
    echo.
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%v in ('node -v') do set NODE_RAW=%%v
for /f "delims=v." %%m in ('node -v') do set NODE_MAJOR=%%m
if !NODE_MAJOR! lss 16 (
    echo.
    echo   ERROR: Node.js v!NODE_MAJOR! is too old. Version 16 or higher is required.
    echo   Download the latest LTS from: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo   Node.js found: v%NODE_MAJOR% (OK)

:: ── 2. Install dependencies ──────────────────────────────────
echo.
echo [2/4] Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo   ERROR: npm install failed. Check your internet connection and try again.
    echo.
    pause
    exit /b 1
)
echo   Dependencies installed successfully.

:: ── 3. Set up .env file ──────────────────────────────────────
echo.
echo [3/4] Setting up environment variables...
if exist .env (
    echo   .env file already exists — skipping copy.
) else (
    if exist env.example (
        copy env.example .env >nul
        echo   Created .env from env.example.
    ) else (
        echo VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE> .env
        echo   Created a blank .env file.
    )
)

:: Check if the API key has been set
findstr /c:"YOUR_GEMINI_API_KEY_HERE" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo   *** ACTION REQUIRED ***
    echo   Open .env in a text editor and replace:
    echo     VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    echo   with your free Gemini API key from:
    echo     https://aistudio.google.com
    echo.
    set /p OPEN_ENV="   Open .env now for editing? [Y/N]: "
    if /i "!OPEN_ENV!"=="Y" (
        notepad .env
        echo   Waiting for you to save and close Notepad...
        timeout /t 3 /nobreak >nul
    )
)

:: ── 4. Start dev server ──────────────────────────────────────
echo.
echo [4/4] Ready to launch!
echo.
echo   Available commands:
echo     npm run dev      - Start development server (http://localhost:5173)
echo     npm run build    - Build for production (output in dist/)
echo     npm run preview  - Preview the production build locally
echo.
set /p START_DEV="   Start the development server now? [Y/N]: "
if /i "!START_DEV!"=="Y" (
    echo.
    echo   Starting JeevikaAI dev server...
    echo   Open your browser at: http://localhost:5173
    echo   Press Ctrl+C to stop the server.
    echo.
    call npm run dev
) else (
    echo.
    echo   Setup complete! Run "npm run dev" whenever you're ready.
)

echo.
pause
endlocal
