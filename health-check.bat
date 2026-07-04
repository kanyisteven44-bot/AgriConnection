@echo off
REM AgriConnection Health Check Script (Windows)

setlocal enabledelayedexpansion

echo 🏥 AgriConnection Health Check
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Check 1: Environment
echo.
echo 1️⃣  Environment Check
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo    Node version: %NODE_VER%
echo    npm version: %NPM_VER%

REM Check 2: Dependencies
echo.
echo 2️⃣  Dependencies Check
if exist "apps\web\node_modules" (
  echo    ✅ Web app dependencies installed
) else (
  echo    ⚠️  Web app dependencies not installed
)

if exist "apps\mobile\node_modules" (
  echo    ✅ Mobile app dependencies installed
) else (
  echo    ⚠️  Mobile app dependencies not installed
)

REM Check 3: Build
echo.
echo 3️⃣  Build Check
cd apps\web
call npm run typecheck >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo    ✅ Web app type checking passed
) else (
  echo    ❌ Web app type checking failed
)
cd ..\..

REM Check 4: Database
echo.
echo 4️⃣  Database Check
if defined DATABASE_URL (
  echo    ✅ DATABASE_URL configured
) else (
  echo    ⚠️  DATABASE_URL not configured
)

REM Check 5: API Keys
echo.
echo 5️⃣  API Keys Check
if defined AUTH_SECRET (
  echo    ✅ AUTH_SECRET configured
) else (
  echo    ⚠️  AUTH_SECRET not configured
)

if defined RESEND_API_KEY (
  echo    ✅ RESEND_API_KEY configured
) else (
  echo    ⚠️  RESEND_API_KEY not configured
)

if defined MPESA_CONSUMER_KEY (
  echo    ✅ MPESA_CONSUMER_KEY configured
) else (
  echo    ⚠️  MPESA_CONSUMER_KEY not configured
)

REM Check 6: Files
echo.
echo 6️⃣  Critical Files Check
if exist "apps\web\package.json" (
  echo    ✅ apps\web\package.json
) else (
  echo    ❌ apps\web\package.json MISSING
)

if exist "apps\mobile\package.json" (
  echo    ✅ apps\mobile\package.json
) else (
  echo    ❌ apps\mobile\package.json MISSING
)

if exist "supabase\migrations\20260701065642_001_agriconnection_complete_schema.sql" (
  echo    ✅ Database migration file
) else (
  echo    ❌ Database migration file MISSING
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Health check complete
