# AgriConnection - Production Release Guide

## 🎯 Release Status: PRODUCTION READY

**Release Date**: 2026-07-02  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production Launch

---

## 📋 Quick Start

### Prerequisites
- Node.js 22+ (Node 20+ with `--legacy-peer-deps`)
- npm 9+
- Supabase account (or Neon PostgreSQL)
- Git

### Setup (Choose your OS)

**macOS/Linux:**
```bash
chmod +x setup.sh health-check.sh deploy.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Configuration

1. **Copy environment template**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required variables** in `.env.local`:
   - `AUTH_SECRET` - Min 32 characters
   - `DATABASE_URL` - Supabase/Neon connection
   - `RESEND_API_KEY` - Email service
   - `MPESA_*` - M-Pesa payment credentials
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Maps
   - Other API keys as needed

3. **Set up database**
   ```bash
   supabase migration up
   ```

---

## 🚀 Development

### Web App
```bash
cd apps/web
npm run dev
# Open http://localhost:5173
```

### Mobile App
```bash
cd apps/mobile
npm start
# Scan with Expo Go or press 'i' for iOS, 'a' for Android
```

### Type Checking
```bash
cd apps/web
npm run typecheck
```

---

## 📦 Production Deployment

### Option 1: Vercel (Web App)
```bash
# Push to GitHub, connect to Vercel
# Environment variables auto-synced
npm run build
```

### Option 2: Docker
```bash
docker build -t agriconnection:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL=your_db_url \
  -e AUTH_SECRET=your_secret \
  agriconnection:latest
```

### Option 3: Manual Server
```bash
./deploy.sh production  # macOS/Linux
# or
deploy.bat production   # Windows
```

### Mobile App Deployment

**iOS (TestFlight)**
```bash
cd apps/mobile
eas build --platform ios --build-profile production
eas submit --platform ios
```

**Android (Google Play)**
```bash
cd apps/mobile
eas build --platform android --build-profile production
eas submit --platform android
```

---

## ✅ Pre-Launch Checklist

### Environment
- [ ] All `.env` variables configured
- [ ] Database connection verified
- [ ] API keys obtained and valid
- [ ] SSL certificates installed

### Testing
- [ ] Run health check: `./health-check.sh`
- [ ] Manual smoke tests completed
- [ ] Mobile app tested on devices
- [ ] Payment flow tested (demo mode)

### Deployment
- [ ] Web app deployed to hosting
- [ ] Mobile app submitted to app stores
- [ ] APIs responding correctly
- [ ] Database backups enabled

### Monitoring
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Uptime monitoring (StatusPage)
- [ ] Log aggregation (CloudWatch/Loggly)

---

## 📚 Architecture

### Frontend
- **Web**: React Router 7, TypeScript, Tailwind CSS
- **Mobile**: React Native 0.81.5, Expo 54, Expo Router

### Backend
- **API**: Hono server (Node.js)
- **Database**: PostgreSQL (Neon/Supabase)
- **Auth**: Auth.js with Argon2 hashing
- **Email**: Resend API
- **Payments**: M-Pesa, Stripe, RevenueCat
- **Files**: Uploadcare

### Key Features
- ✅ Multi-role user system (Farmer, Buyer, Supplier, Transporter, Admin, Expert)
- ✅ Real-time marketplace with orders & deliveries
- ✅ AI agricultural advisor
- ✅ M-Pesa & Stripe payments
- ✅ Weather integration
- ✅ Maps & location services
- ✅ Messaging & notifications

---

## 🔧 Troubleshooting

### Build Issues

**"npm ERR! ERESOLVE unable to resolve dependency tree"**
```bash
npm install --legacy-peer-deps
```

**"react-router-hono-server requires Node 22+"**
- Use Node 22+ or use `--legacy-peer-deps`
- Or upgrade Node: `nvm install 22`

### Runtime Issues

**Database connection failed**
```bash
# Check DATABASE_URL in .env.local
# Verify credentials and network access
psql $DATABASE_URL -c "SELECT 1"
```

**Auth not working**
- Verify `AUTH_SECRET` (min 32 characters)
- Check `AUTH_URL` matches deployment URL
- Verify database tables created

**M-Pesa not working**
- App uses demo mode if `MPESA_PASSKEY` not set
- In demo mode, orders show simulated payment status
- Add real credentials for production M-Pesa flow

---

## 📞 Support

### Resources
- **Documentation**: See `PRODUCTION_READINESS_REPORT.md`
- **Database Schema**: See `supabase/migrations/`
- **API Routes**: See `apps/web/src/app/api/`

### Team Contacts
- **Engineering**: engineering@agriconnection.example.com
- **DevOps**: devops@agriconnection.example.com
- **Support**: support@agriconnection.example.com

---

## 🔐 Security

### Credentials Security
- Never commit `.env.local`
- Use unique secrets for each environment
- Rotate secrets quarterly
- Enable IP whitelisting

### Database Security
- Enable SSL connections
- Use strong passwords
- Limit database users to app only
- Enable automated backups

### API Security
- Enforce HTTPS only
- Use rate limiting
- Implement CORS properly
- Monitor for suspicious activity

---

## 📊 Performance Targets

### Web App
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

### Mobile App
- Startup time: < 3s
- Bundle size: < 20 MB
- Memory usage: < 200 MB

### Server
- API response time: < 100ms (p95)
- Database query: < 50ms (p95)
- 99.9% uptime target

---

## 🗺️ Roadmap - Phase 2

- [ ] Video tutorials
- [ ] Advanced analytics
- [ ] Supply chain tracking
- [ ] Blockchain verification
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Machine learning price predictions

---

**Last Updated**: 2026-07-02  
**Next Review**: 2026-07-09

For detailed technical information, see `PRODUCTION_READINESS_REPORT.md`
