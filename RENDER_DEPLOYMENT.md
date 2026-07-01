# Render Deployment Guide for AgriConnection

## Overview
Deploy AgriConnection to Render.com with automatic deployments from GitHub.

---

## Prerequisites
- Render account (https://render.com - free tier available)
- GitHub repository linked to Render
- Environment variables ready
- PostgreSQL database (Render provides free tier)

---

## Step 1: Create PostgreSQL Database on Render

1. Go to https://render.com/dashboard
2. Click **+ New** → **PostgreSQL**
3. Configure:
   - **Name:** `agriconnection-db`
   - **Database:** `agriconnection`
   - **User:** `agriconnection`
   - **Region:** Choose closest to you
   - **Version:** 15 or higher
4. Click **Create Database**
5. Copy the **Internal Database URL** (use for internal services)

---

## Step 2: Create Web Service on Render

1. Go to Render Dashboard
2. Click **+ New** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Click **Connect GitHub**
5. Select `kanyisteven44-bot/AgriConnection` repository

### Configuration:

**General**
- **Name:** `agriconnection-web`
- **Region:** Same as database
- **Branch:** `main`
- **Runtime:** Node
- **Root Directory:** (leave empty)

**Build Command:**
```
npm ci && cd apps/web && npm ci && npm run build
```

**Start Command:**
```
cd apps/web && npm run start
```

**Environment Variables:**
Click **Add Environment Variable** for each:

```
NODE_ENV=production
DATABASE_URL=<paste internal DB URL from Step 1>
AUTH_SECRET=<generate: openssl rand -base64 48>
JWT_SECRET=<generate: openssl rand -base64 48>
AUTH_URL=https://agriconnection-web.onrender.com
NEXT_PUBLIC_APP_URL=https://agriconnection-web.onrender.com
RESEND_API_KEY=<your Resend API key>
OPENAI_API_KEY=<your OpenAI API key>
MPESA_CONSUMER_KEY=gDCArHObNOtACGpGaaT2jcAwVam9Q74Z6BjBJtk3TGjXwXfX
MPESA_CONSUMER_SECRET=kB3ZTRzyKnR3mwmphPy7zCYvVbDhshPbMmP0WcFRV2gzHIa2ayWbOKoDdvmmFkRV
MPESA_PASSKEY=<your M-Pesa passkey>
MPESA_SHORT_CODE=<your M-Pesa short code>
SUPABASE_URL=<if using Supabase>
SUPABASE_ANON_KEY=<if using Supabase>
```

**Instance Type:**
- Free tier: 0.5 CPU, 512 MB RAM (good for testing)
- Paid tier: 1 CPU, 1 GB RAM (recommended for production)

6. Click **Create Web Service**

---

## Step 3: Run Database Migrations

After the web service deploys:

1. Go to your PostgreSQL database in Render
2. Click **Connect** → **Psql**
3. Run SQL migrations from `supabase/` directory:

```sql
-- Create tables (copy from supabase migration files)
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add other tables as needed from supabase/migrations/
```

---

## Step 4: Configure Auto-Deployment

Render automatically deploys on `git push` to `main`:

1. Go to your web service in Render
2. **Settings** → **Deploy Hooks**
3. Copy the webhook URL
4. Go to GitHub → **Settings** → **Webhooks**
5. Click **Add webhook**
6. **Payload URL:** Paste Render webhook
7. **Content type:** `application/json`
8. Click **Add webhook**

---

## Step 5: Test Deployment

```bash
# Push to main to trigger deployment
git push origin main

# Monitor deployment in Render dashboard
# Check logs in Render → Web Service → Logs
```

Your app will be live at: `https://agriconnection-web.onrender.com`

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | Render PostgreSQL URL | ✅ Yes |
| `AUTH_SECRET` | 64-char random string | ✅ Yes |
| `JWT_SECRET` | 64-char random string | ✅ Yes |
| `MPESA_CONSUMER_KEY` | Your M-Pesa key | ✅ Yes |
| `MPESA_CONSUMER_SECRET` | Your M-Pesa secret | ✅ Yes |
| `MPESA_PASSKEY` | Your M-Pesa passkey | ⚠️ Needed for payments |
| `MPESA_SHORT_CODE` | Your till/paybill code | ⚠️ Needed for payments |
| `RESEND_API_KEY` | From resend.com | ❌ Optional (OTP) |
| `OPENAI_API_KEY` | From openai.com | ❌ Optional (Voice AI) |

---

## Monitoring & Logs

### View Logs
1. Go to Render Dashboard
2. Select `agriconnection-web`
3. Click **Logs** tab
4. View real-time logs

### Health Checks
Render auto-checks HTTP health:
- **Endpoint:** `https://agriconnection-web.onrender.com`
- **Expected:** 200 status
- If unhealthy, service restarts automatically

### Metrics
1. Go to service settings
2. **Metrics** tab to view:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## Troubleshooting

### Build Fails
```bash
# Check if dependencies install correctly
npm ci
cd apps/web && npm ci

# Verify build script works locally
npm run build
```

### Database Connection Error
```
Error: could not translate host name "db" to address
```
- Ensure `DATABASE_URL` uses Render's internal URL (not external)
- Format: `postgresql://user:password@host:5432/database`

### App Won't Start
- Check **Start Command** is correct: `cd apps/web && npm run start`
- Verify all required env vars are set
- Check logs for specific errors

### Service Keeps Restarting
- Usually due to out of memory
- Upgrade to paid tier with more RAM
- Or optimize app to use less memory

---

## Cost Estimate (Render Free Tier)

| Service | Free Tier | Price |
|---------|-----------|-------|
| PostgreSQL | 90 days free | $15/month after |
| Web Service | 750 hrs/month | $7/month active |
| **Total** | Free (limited) | ~$22/month |

### To Stay on Free Tier:
- Use Railway or Heroku alternatives
- Or deploy web only, database elsewhere

---

## Upgrade to Paid (Recommended for Production)

1. Go to service **Settings**
2. Click **Plan** → **Upgrade**
3. Choose tier:
   - **Starter:** 1 vCPU, 512 MB RAM - $7/month
   - **Standard:** 2 vCPU, 1 GB RAM - $24/month
   - **Pro:** 4 vCPU, 4 GB RAM - $76/month

---

## Deploy Mobile Separately (Optional)

Mobile apps are deployed via **EAS Build** (not Render):

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas build --platform all
eas submit --platform all
```

---

## Quick Summary

```
1. Create PostgreSQL on Render ✅
2. Create Web Service on Render ✅
3. Add environment variables ✅
4. Connect GitHub for auto-deploy ✅
5. Run database migrations ✅
6. Test deployment ✅
```

**Your app is now deployed at: `https://agriconnection-web.onrender.com`**

---

## Support & Resources
- Render Docs: https://render.com/docs
- GitHub Integration: https://render.com/docs/deploy-from-github
- PostgreSQL on Render: https://render.com/docs/databases
