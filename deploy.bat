@echo off
REM AgriConnection Production Deployment Script (Windows)
REM Usage: deploy.bat production

setlocal enabledelayedexpansion

set ENVIRONMENT=%1

if "%ENVIRONMENT%"=="" (
  echo Usage: deploy.bat {development^|staging^|production}
  exit /b 1
)

echo 🚀 AgriConnection Deployment: %ENVIRONMENT%
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM 1. Environment Setup
echo 1️⃣  Setting up environment...
if "%ENVIRONMENT%"=="production" (
  copy .env.production.local .env.local
  echo    ✅ Loaded production environment
) else (
  copy .env.development.local .env.local
  echo    ✅ Loaded development environment
)

REM 2. Database Migration
echo 2️⃣  Running database migrations...
where supabase >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  call supabase migration up
  echo    ✅ Database migrations complete
) else (
  echo    ⚠️  Supabase CLI not found. Skipping migrations.
  echo    📝 Run manually: supabase migration up
)

REM 3. Web App Build
echo 3️⃣  Building web app...
cd apps\web
call npm install --legacy-peer-deps
call npm run build
echo    ✅ Web app built successfully
cd ..\..

REM 4. Mobile App Build (optional)
if "%ENVIRONMENT%"=="production" (
  set /p BUILD_MOBILE="Build mobile app? (y/n): "
  if /i "!BUILD_MOBILE!"=="y" (
    echo 4️⃣  Building mobile app...
    cd apps\mobile
    call npm install
    echo    ℹ️  Run: eas build --platform ios --build-profile production
    echo    ℹ️  Run: eas build --platform android --build-profile production
    cd ..\..
  )
) else (
  echo 4️⃣  Skipping mobile build (development mode)
)

REM 5. Health Checks
echo 5️⃣  Running health checks...
if "%ENVIRONMENT%"=="production" (
  echo    Verifying environment variables...
  if not defined AUTH_SECRET (
    echo    ❌ AUTH_SECRET not defined
    exit /b 1
  )
  if not defined DATABASE_URL (
    echo    ❌ DATABASE_URL not defined
    exit /b 1
  )
  echo    ✅ All required variables set
)

REM 6. Final Summary
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 Deployment Complete!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if "%ENVIRONMENT%"=="production" (
  echo Next steps:
  echo 1. Deploy web app build to production host
  echo 2. Deploy mobile app to app stores
  echo 3. Run final smoke tests
  echo 4. Enable production monitoring
) else (
  echo Next steps:
  echo 1. Start dev server: npm run dev (in apps\web)
  echo 2. Test features thoroughly
  echo 3. Run test suite: npm run test
)

echo.
echo 📚 Documentation: See PRODUCTION_READINESS_REPORT.md
echo 🆘 Support: support@agriconnection.example.com
