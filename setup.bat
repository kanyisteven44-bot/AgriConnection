@echo off
REM AgriConnection Initialize Script (Windows)
REM Sets up development environment

setlocal enabledelayedexpansion

echo 🌱 AgriConnection Setup
echo ━━━━━━━━━━━━━━━━━━━━━━━━

REM 1. Copy environment files
echo.
echo 1️⃣  Setting up environment files...
if not exist ".env.local" (
  copy .env.example .env.local
  echo    ✅ Created .env.local from template
  echo    ⚠️  Remember to fill in your API keys!
) else (
  echo    ℹ️  .env.local already exists
)

REM 2. Install web dependencies
echo.
echo 2️⃣  Installing web app dependencies...
cd apps\web
call npm install --legacy-peer-deps
echo    ✅ Web app dependencies installed
cd ..\..

REM 3. Install mobile dependencies
echo.
echo 3️⃣  Installing mobile app dependencies...
cd apps\mobile
call npm install
echo    ✅ Mobile app dependencies installed
cd ..\..

REM 4. Database setup
echo.
echo 4️⃣  Database Setup
echo    📝 To set up Supabase:
echo       1. Create a project at https://supabase.com
echo       2. Note your PROJECT_URL and ANON_KEY
echo       3. Update DATABASE_URL in .env.local
echo       4. Run: supabase migration up

REM 5. Git setup
echo.
echo 5️⃣  Git Setup
if exist ".git" (
  echo    ℹ️  Git repository already initialized
) else (
  call git init
  echo    ✅ Git repository initialized
)

REM 6. Summary
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your API keys
echo 2. Set up database (Supabase)
echo 3. Run: npm run dev (in apps\web)
echo.
echo 📚 Documentation: See README.md and PRODUCTION_READINESS_REPORT.md
