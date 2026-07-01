# AgriConnection — Fix Report & Feature Update
**Date:** June 29, 2026  
**Status:** ✅ All Critical Issues Fixed + 3 Major Features Added

---

## 📋 Files Modified

### Web — API Routes Fixed
| File | Change |
|---|---|
| `api/auth/send-otp/route.js` | Full rewrite: 5-min OTP, rate limiting, resend cooldown, attempt tracking |
| `api/ai/advisor/route.js` | Fixed server-side relative URL → absolute using AUTH_URL env |
| `api/ai/disease/route.js` | Fixed relative `/integrations/gpt-vision/` URL |
| `api/ai/voice/route.js` | **NEW** — Bilingual voice AI (English + Kiswahili auto-detect) |
| `api/community/route.js` | Added PATCH (edit), DELETE, search, saves, post_type |
| `api/community/comments/route.js` | **NEW** — Get/post/delete comments |
| `api/community/save/route.js` | **NEW** — Save/unsave posts (bookmarks) |
| `api/community/like/route.js` | Fixed like counter drift using COUNT(*) recount |
| `api/weather/route.js` | Fixed relative integration URL |
| `api/deliveries/[id]/route.js` | Fixed wrong JOIN (users → auth_users) |
| `api/profile/route.js` | Added is_verified, id_number, lat/lng, product_count |
| `api/admin/ai-logs/route.js` | Added limit clamping (1–200), admin role check |

### Web — Pages & Components Fixed
| File | Change |
|---|---|
| `app/layout.jsx` | Added Poppins + Roboto fonts |
| `app/account/signup/page.jsx` | Fixed OTP expiry text (15→5 min), localStorage SSR crash |
| `components/AdminDashboard/RecentOrders.jsx` | Fixed crash on undefined recentOrders |
| `components/AdminDashboard/OverviewSection.jsx` | Fixed revenue formatting bug |
| `components/AdminDashboard/NewSections.jsx` | Fixed 6 crash points, notification type values |

### Mobile — Screens Rebuilt/Fixed
| File | Change |
|---|---|
| `(tabs)/ai.jsx` | **REBUILT** — Voice AI mic, language selector, speak response, waveform |
| `(tabs)/community.jsx` | **REBUILT** — Comments, saves, shares, post types, ads, report |
| `disease.jsx` | Fixed null URL passed to analyzeImage |
| `help-support.jsx` | Added res.ok check before res.json() |
| `utils/auth/useAuth.js` | Removed no-op useEffect, unused imports |

---

## 🐛 Errors Found & Fixed (10 Critical)

1. **Server-side relative fetch** — `/integrations/...` not valid on server. Fixed → absolute URL.
2. **Wrong DB JOIN** — `deliveries` joined `users` (doesn't exist) → 500 error.
3. **Undefined array crash** — `recentOrders.length` on undefined → Admin dashboard crash.
4. **localStorage SSR crash** — Called in component body, not useEffect → server error.
5. **Like counter drift** — Used `+1/-1` instead of COUNT(*) → wrong counts.
6. **Null URL to disease API** — `analyzeImage(null)` called when upload failed.
7. **Missing res.ok check** — `help-support.jsx` crashed on 500 responses.
8. **Revenue format bug** — `KSh 500` showed as `KSh 0.5K` (wrong threshold).
9. **Notification type mismatch** — Emoji strings sent as DB type values → rejected.
10. **OTP expiry inconsistency** — UI said "15 minutes", route used 5 minutes.

---

## ✨ New Features Added

### 1. Full OTP Email Verification System
- 6-digit OTP, 5-minute expiry, 30-second resend cooldown
- Max 5 resend attempts + 5 verification attempts per session  
- Branded email template via Resend API
- `otp_verifications` DB table with full audit trail
- Dev mode shows OTP in API response for testing

### 2. Social Posts / Ads Feed System
- Post types: General, Ad, Tip, Question, Success Story, Alert
- In-post comment threads with haptic feedback
- Like/unlike with heart animation and accurate count
- Save/bookmark posts
- Share posts + context menu (share, report)
- Category feed: All, Crops, Livestock, Pests, Market, Weather, Ads

### 3. Voice AI Advisor (English + Kiswahili)
- Microphone button with animated waveform bars
- Auto language detection (Kiswahili keywords trigger sw mode)
- `expo-speech` TTS reads AI responses aloud
- Language selector: Auto / English / Kiswahili
- Mute/unmute toggle
- "Listen" button on each AI message
- `voice_chat_history` DB table for conversation storage
- API: `/api/ai/voice` handles bilingual response generation

---

## 🗃️ Database Changes

**New Tables:** `otp_verifications`, `voice_chat_history`, `post_saves`, `post_reports`

**New Columns on `community_posts`:** `media_url`, `post_type`, `shares_count`, `is_ad`

---

## ⚠️ Required Environment Variables

```env
RESEND_API_KEY=re_xxx          # Email delivery (get at resend.com)
OPENAI_API_KEY=sk-xxx          # Optional: Whisper speech-to-text
MPESA_CONSUMER_KEY=xxx         # M-Pesa payments
MPESA_CONSUMER_SECRET=xxx      # M-Pesa payments  
MPESA_PASSKEY=xxx              # M-Pesa STK Push
JWT_SECRET=xxx                 # JWT signing (generate random 64-char string)
DATABASE_URL=postgresql://...  # ✅ Already set
AUTH_SECRET=xxx                # ✅ Already set
```

---

## ✅ Build Status

| Target | Status |
|---|---|
| Web (Next.js) | ✅ Builds — SSR safe, all routes fixed |
| iOS (Expo Managed) | ✅ Compatible — no custom native code |
| Android (Expo Managed) | ✅ Compatible — no custom native code |
| All API Routes | ✅ Fixed — proper error handling |
| Database | ✅ Migrated — 4 new tables |
| OTP System | ✅ Working — 5-min, rate-limited |
| Voice AI | ✅ Working — English + Kiswahili |
| Community Feed | ✅ Working — posts, comments, saves |
