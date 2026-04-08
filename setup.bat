@echo off
setlocal enabledelayedexpansion
title JeevikaAI Setup

echo.
echo ============================================================
echo   JeevikaAI - Free Indian Health Report AI Translator
echo ============================================================
echo.

:: ── 1. Python virtual environment ───────────────────────────
echo [1/5] Setting up Python virtual environment...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo   Python not found — skipping venv setup.
) else (
    if not exist venv (
        echo   Creating venv...
        python -m venv venv
        if %errorlevel% neq 0 (
            echo   WARNING: Failed to create venv. Continuing without it.
            goto :skip_venv
        )
        echo   venv created.
    ) else (
        echo   venv already exists.
    )
    call venv\Scripts\activate
    echo   venv activated.
    if exist requirements.txt (
        echo   Installing Python dependencies...
        pip install -r requirements.txt --quiet
        if %errorlevel% neq 0 (
            echo   WARNING: pip install failed. Check requirements.txt and try again.
        ) else (
            echo   Python dependencies installed.
        )
    )
)
:skip_venv

:: ── 2. Check Node.js ────────────────────────────────────────
echo.
echo [2/5] Checking Node.js...
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
echo [3/5] Installing npm dependencies...
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
echo [4/5] Setting up environment variables...
if exist .env (
    echo   .env file already exists — skipping copy.
) else (
    if exist env.example (
        copy env.example .env >nul
        echo   Created .env from env.example.
    ) else (
        (echo # Google Gemini -- free key at https://aistudio.google.com
         echo VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
         echo.
         echo # Anthropic Claude -- key at https://console.anthropic.com
         echo VITE_ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE) > .env
        echo   Created a blank .env file.
    )
)

:: Check if any placeholder keys remain
set NEED_KEYS=0
findstr /c:"YOUR_GEMINI_API_KEY_HERE" .env >nul 2>&1
if %errorlevel% equ 0 set NEED_KEYS=1
findstr /c:"YOUR_ANTHROPIC_API_KEY_HERE" .env >nul 2>&1
if %errorlevel% equ 0 set NEED_KEYS=1

if "!NEED_KEYS!"=="1" (
    echo.
    echo   *** ACTION REQUIRED — API Keys ***
    echo   At least one key is still a placeholder. Edit .env and fill in:
    echo.
    echo     VITE_GEMINI_API_KEY    — free at aistudio.google.com (Gemini provider)
    echo     VITE_ANTHROPIC_API_KEY — paid at console.anthropic.com (Claude provider)
    echo.
    echo   You only need ONE key to run the app; add both to use either provider.
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
echo [5/5] Ready to launch!
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
