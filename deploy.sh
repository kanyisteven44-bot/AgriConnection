#!/bin/bash
# AgriConnection Production Deployment Script
# Usage: ./deploy.sh production

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh {development|staging|production}"
  exit 1
fi

echo "🚀 AgriConnection Deployment: $ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Environment Setup
echo "1️⃣  Setting up environment..."
if [ "$ENVIRONMENT" = "production" ]; then
  cp .env.production.local .env.local
  echo "   ✅ Loaded production environment"
else
  cp .env.development.local .env.local
  echo "   ✅ Loaded development environment"
fi

# 2. Database Migration
echo "2️⃣  Running database migrations..."
if command -v supabase &> /dev/null; then
  supabase migration up
  echo "   ✅ Database migrations complete"
else
  echo "   ⚠️  Supabase CLI not found. Skipping migrations."
  echo "   📝 Run manually: supabase migration up"
fi

# 3. Web App Build
echo "3️⃣  Building web app..."
cd apps/web
npm install --legacy-peer-deps 2>/dev/null || npm install
npm run build
echo "   ✅ Web app built successfully"
cd ../..

# 4. Mobile App Build (optional)
if [ "$ENVIRONMENT" = "production" ]; then
  read -p "Build mobile app? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "4️⃣  Building mobile app..."
    cd apps/mobile
    npm install
    echo "   ℹ️  Run: eas build --platform ios --build-profile production"
    echo "   ℹ️  Run: eas build --platform android --build-profile production"
    cd ../..
  fi
else
  echo "4️⃣  Skipping mobile build (development mode)"
fi

# 5. Health Checks
echo "5️⃣  Running health checks..."
if [ "$ENVIRONMENT" = "production" ]; then
  echo "   Verifying environment variables..."
  required_vars=(
    "AUTH_SECRET"
    "DATABASE_URL"
    "RESEND_API_KEY"
    "MPESA_CONSUMER_KEY"
    "MPESA_CONSUMER_SECRET"
  )
  
  missing_vars=()
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "   ❌ Missing environment variables:"
    for var in "${missing_vars[@]}"; do
      echo "      - $var"
    done
    exit 1
  fi
  echo "   ✅ All required variables set"
fi

# 6. Final Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps for $ENVIRONMENT:"
if [ "$ENVIRONMENT" = "production" ]; then
  echo "1. Deploy web app build to production host"
  echo "2. Deploy mobile app to app stores"
  echo "3. Run final smoke tests"
  echo "4. Enable production monitoring"
else
  echo "1. Start dev server: npm run dev (in apps/web)"
  echo "2. Test features thoroughly"
  echo "3. Run test suite: npm run test"
fi
echo ""
echo "📚 Documentation: See PRODUCTION_READINESS_REPORT.md"
echo "🆘 Support: support@agriconnection.example.com"
