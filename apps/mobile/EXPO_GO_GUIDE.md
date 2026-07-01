# AgriConnection — Setup & Expo Go Guide

## Database
- **Neon PostgreSQL**: `ep-delicate-sun-abtz1sgg-pooler.eu-west-2.aws.neon.tech`
- 19 tables: auth_users, products, orders, community_posts, otp_verifications, ai_chat_history, farm_records, etc.
- Demo users seeded: james@demo.com (farmer), mary@demo.com (expert), admin@agriconnection.co.ke (admin)

## Web App (apps/web)
- DATABASE_URL = Neon connection string (set in apps/web/.env)
- Run: cd apps/web && npm run dev

## Mobile App — Expo Go QR

### Step 1 — Install dependencies
```bash
cd apps/mobile
npm install
```

### Step 2 — Set environment variables
Create `apps/mobile/.env.local` and add your Bolt web app URL:
```
EXPO_PUBLIC_BASE_URL=https://YOUR-BOLT-APP-URL.bolt.new
EXPO_PUBLIC_PROXY_BASE_URL=https://YOUR-BOLT-APP-URL.bolt.new
EXPO_PUBLIC_HOST=YOUR-BOLT-APP-URL.bolt.new
```

### Step 3 — Start Expo
```bash
cd apps/mobile
npx expo start --tunnel
```

Scan the QR code with **Expo Go** app (Android) or the Camera app (iOS).

## Features
- OTP signup (10 min expiry, SHA-256 hashed, 5 max attempts)
- AI Advisor (Dr. Agri) — 8 expert personas: crop, livestock, market, finance, disease, weather, equipment, government
- Marketplace with M-Pesa STK Push
- Community forum
- Farmers map
- Farm records & finance tracker
- Weather (GPS-based)
- Disease detection (image upload + AI)
