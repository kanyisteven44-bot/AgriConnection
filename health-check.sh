#!/bin/bash
# AgriConnection Health Check Script
# Usage: ./health-check.sh

set -e

echo "🏥 AgriConnection Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check 1: Environment
echo ""
echo "1️⃣  Environment Check"
echo "   Node version: $(node --version)"
echo "   npm version: $(npm --version)"

# Check 2: Dependencies
echo ""
echo "2️⃣  Dependencies Check"
if [ -d "apps/web/node_modules" ]; then
  echo "   ✅ Web app dependencies installed"
else
  echo "   ⚠️  Web app dependencies not installed"
fi

if [ -d "apps/mobile/node_modules" ]; then
  echo "   ✅ Mobile app dependencies installed"
else
  echo "   ⚠️  Mobile app dependencies not installed"
fi

# Check 3: Build
echo ""
echo "3️⃣  Build Check"
cd apps/web
if npm run typecheck 2>/dev/null; then
  echo "   ✅ Web app type checking passed"
else
  echo "   ❌ Web app type checking failed"
fi
cd ../..

# Check 4: Database
echo ""
echo "4️⃣  Database Check"
if [ -z "$DATABASE_URL" ]; then
  echo "   ⚠️  DATABASE_URL not configured"
else
  echo "   ✅ DATABASE_URL configured"
fi

# Check 5: API Keys
echo ""
echo "5️⃣  API Keys Check"
declare -a keys=(
  "AUTH_SECRET"
  "RESEND_API_KEY"
  "MPESA_CONSUMER_KEY"
  "STRIPE_SECRET_KEY"
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
)

for key in "${keys[@]}"; do
  if [ -z "${!key}" ]; then
    echo "   ⚠️  $key not configured"
  else
    echo "   ✅ $key configured"
  fi
done

# Check 6: Files
echo ""
echo "6️⃣  Critical Files Check"
critical_files=(
  "apps/web/package.json"
  "apps/mobile/package.json"
  "supabase/migrations/20260701065642_001_agriconnection_complete_schema.sql"
)

for file in "${critical_files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file MISSING"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Health check complete"
