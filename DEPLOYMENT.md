# AgriConnection Deployment Guide

## Overview
This guide covers deploying AgriConnection to production using Docker (web) and EAS Build (mobile).

---

## Web Deployment (Docker)

### Prerequisites
- Docker & Docker Compose installed
- Environment variables configured
- PostgreSQL database accessible

### Local Development

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# Start services
docker-compose up --build

# App will be available at http://localhost:3000
```

### Production Deployment

#### Option 1: Self-Hosted (VPS/Server)

```bash
# On your server
git clone https://github.com/kanyisteven44-bot/AgriConnection.git
cd AgriConnection

# Set environment variables
cp .env.example .env.production
# Edit .env.production with production secrets

# Build and start
docker-compose -f docker-compose.yml up -d --build

# Verify health
curl http://localhost:3000
```

#### Option 2: Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Connect repo to Vercel dashboard
3. Set environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `OPENAI_API_KEY`
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_PASSKEY`
4. Deploy from Vercel UI (auto-deploys on push to main)

#### Option 3: Railway/Render

```bash
# Railway (example)
railway link
railway up

# Set environment variables in dashboard
# Auto-deploys on push
```

---

## Mobile Deployment (EAS Build)

### Prerequisites
- Expo account (https://expo.dev)
- EAS CLI installed: `npm install -g eas-cli`
- Apple Developer account (for iOS)
- Google Play account (for Android)

### Setup

```bash
# Navigate to mobile app
cd apps/mobile

# Login to Expo
eas login

# Configure EAS (generates eas.json)
eas build:configure
```

### Build & Submit

#### Android
```bash
# Build APK (testing) or AAB (production)
eas build --platform android --non-interactive

# Submit to Play Store
eas submit --platform android
```

#### iOS
```bash
# Build IPA
eas build --platform ios --non-interactive

# Submit to App Store
eas submit --platform ios
```

#### Both platforms
```bash
eas build --platform all
```

---

## Environment Variables Reference

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth secret (64 chars) | Generate: `openssl rand -base64 48` |
| `JWT_SECRET` | JWT signing key (64 chars) | Generate: `openssl rand -base64 48` |

### M-Pesa Payment
| Variable | Description | Status |
|----------|-------------|--------|
| `MPESA_CONSUMER_KEY` | gDCArHObNOtACGpGaaT2jcAwVam9Q74Z6BjBJtk3TGjXwXfX | ✅ Configured |
| `MPESA_CONSUMER_SECRET` | kB3ZTRzyKnR3mwmphPy7zCYvVbDhshPbMmP0WcFRV2gzHIa2ayWbOKoDdvmmFkRV | ✅ Configured |
| `MPESA_PASSKEY` | Till/Paybill passkey | ⚠️ Needs setup |
| `MPESA_SHORT_CODE` | Till/Paybill number | ⚠️ Needs setup |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Email delivery via Resend | (OTP emails won't work) |
| `OPENAI_API_KEY` | Voice AI transcription | (Voice features limited) |

---

## Database Migrations

### Running Migrations

```bash
# In production (via Supabase dashboard or pgAdmin)
# Navigate to SQL Editor and run migration files from supabase/ directory

# Tables created:
# - otp_verifications
# - voice_chat_history
# - post_saves
# - post_reports
# - And updates to community_posts (new columns)
```

---

## Monitoring & Logs

### Docker
```bash
# View logs
docker-compose logs -f web

# Check health
docker-compose ps
```

### Production
- Vercel: Dashboard → Analytics → Logs
- Railway: Dashboard → Deployments → Logs
- Self-hosted: `docker logs agriconnection-web`

---

## Troubleshooting

### Build Fails
- Check `NODE_ENV=production` is not set locally
- Clear node_modules: `rm -rf node_modules apps/*/node_modules && npm ci`
- Check Node version: `node --version` (should be 18+)

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- Test connection: `psql $DATABASE_URL`

### M-Pesa Integration Not Working
- Verify credentials in `.env.production`
- Check M-Pesa API endpoint in `apps/web/api/payments/mpesa/route.js`
- Test in sandbox first

### Mobile Build Fails
- Clear EAS cache: `eas build:cancel --all`
- Update Expo: `npm install -g expo-cli@latest`
- Check `eas.json` configuration

---

## Rollback

```bash
# Docker
docker-compose down
git checkout <previous-commit>
docker-compose up --build

# Vercel
Vercel Dashboard → Deployments → Click previous version → Redeploy

# EAS
eas build:list
eas submit --id <previous-build-id>
```

---

## Performance Optimization

### Web
- Enable Redis caching in production
- Use CDN for static assets (Vercel auto-handles)
- Monitor database query performance

### Mobile
- Use ProGuard/R8 for Android (automatic with EAS)
- Test on real devices before release
- Monitor app size (target <100MB)

---

## Quick Start Commands

### Local Development
```bash
docker-compose up --build
# Access at http://localhost:3000
```

### Deploy to Production (Docker)
```bash
docker build -t agriconnection:prod .
docker run -d -p 3000:3000 --env-file .env.production agriconnection:prod
```

### Deploy Mobile
```bash
cd apps/mobile
eas build --platform all --non-interactive
eas submit --platform all
```

---

## Support & Resources
- GitHub Issues: https://github.com/kanyisteven44-bot/AgriConnection/issues
- Expo Docs: https://docs.expo.dev
- Docker Docs: https://docs.docker.com
- Next.js Docs: https://nextjs.org/docs
