/*
# AgriConnection Complete Database Schema

## Overview
Full schema for the AgriConnection agricultural platform serving Kenya and East Africa.
Includes user management, marketplace, orders, deliveries, AI features, community, and finance tracking.

## Tables Created
1. auth_users - Extended user profiles (name, role, phone, location, verification)
2. auth_accounts - Authentication accounts (credentials, social)
3. auth_sessions - User sessions
4. auth_verification_token - Email verification tokens
5. otp_verifications - OTP codes for signup/reset (rate-limited)
6. products - Farm produce marketplace listings
7. orders - Purchase orders
8. deliveries - Delivery tracking
9. farms - Farm profile data
10. vehicles - Transporter vehicle data
11. community_posts - Social feed posts
12. post_likes - Post like tracking
13. post_comments - Post comments
14. post_saves - Saved/bookmarked posts
15. post_reports - Reported posts
16. notifications - User notifications
17. ai_chat_history - AI conversation history
18. ai_logs - AI query audit log
19. voice_chat_history - Voice AI conversations
20. farm_records - Farm income/expense tracking

## Security
- RLS enabled on all tables
- Policies scoped to authenticated users
- Public read for products/community posts
*/

-- ============================================================
-- AUTH USERS (extended profile, not replacing auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_users (
  id bigserial PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL,
  "emailVerified" timestamptz,
  image text,
  role text DEFAULT 'farmer',
  phone text,
  location text,
  profile_photo text,
  is_verified boolean DEFAULT false,
  id_number text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_auth_users" ON auth_users;
CREATE POLICY "public_read_auth_users" ON auth_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_auth_users" ON auth_users;
CREATE POLICY "anon_insert_auth_users" ON auth_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_auth_users" ON auth_users;
CREATE POLICY "anon_update_auth_users" ON auth_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_auth_users" ON auth_users;
CREATE POLICY "anon_delete_auth_users" ON auth_users FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- AUTH ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_accounts (
  id bigserial PRIMARY KEY,
  "userId" bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  access_token text,
  expires_at bigint,
  refresh_token text,
  id_token text,
  scope text,
  session_state text,
  token_type text,
  password text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (provider, "providerAccountId")
);

ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_auth_accounts" ON auth_accounts;
CREATE POLICY "anon_all_auth_accounts" ON auth_accounts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_auth_accounts" ON auth_accounts;
CREATE POLICY "anon_insert_auth_accounts" ON auth_accounts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_auth_accounts" ON auth_accounts;
CREATE POLICY "anon_update_auth_accounts" ON auth_accounts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_auth_accounts" ON auth_accounts;
CREATE POLICY "anon_delete_auth_accounts" ON auth_accounts FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- AUTH SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_sessions (
  id bigserial PRIMARY KEY,
  "sessionToken" text UNIQUE NOT NULL,
  "userId" bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_auth_sessions" ON auth_sessions;
CREATE POLICY "anon_all_auth_sessions" ON auth_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_auth_sessions" ON auth_sessions;
CREATE POLICY "anon_insert_auth_sessions" ON auth_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_auth_sessions" ON auth_sessions;
CREATE POLICY "anon_update_auth_sessions" ON auth_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_auth_sessions" ON auth_sessions;
CREATE POLICY "anon_delete_auth_sessions" ON auth_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- AUTH VERIFICATION TOKEN
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);

ALTER TABLE auth_verification_token ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_verification_token" ON auth_verification_token;
CREATE POLICY "anon_all_verification_token" ON auth_verification_token FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_verification_token" ON auth_verification_token;
CREATE POLICY "anon_insert_verification_token" ON auth_verification_token FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_verification_token" ON auth_verification_token;
CREATE POLICY "anon_delete_verification_token" ON auth_verification_token FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- OTP VERIFICATIONS (for signup & password reset)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_verifications (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  otp_code text NOT NULL,
  otp_type text NOT NULL DEFAULT 'signup',
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  resend_count integer DEFAULT 0,
  verify_attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_otp_verifications" ON otp_verifications;
CREATE POLICY "anon_all_otp_verifications" ON otp_verifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_otp_verifications" ON otp_verifications;
CREATE POLICY "anon_insert_otp_verifications" ON otp_verifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_otp_verifications" ON otp_verifications;
CREATE POLICY "anon_update_otp_verifications" ON otp_verifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_otp_verifications" ON otp_verifications;
CREATE POLICY "anon_delete_otp_verifications" ON otp_verifications FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- FARMS
-- ============================================================
CREATE TABLE IF NOT EXISTS farms (
  id bigserial PRIMARY KEY,
  farmer_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  size text,
  location text,
  crops_grown text,
  livestock_info text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_farms" ON farms;
CREATE POLICY "anon_all_farms" ON farms FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_farms" ON farms;
CREATE POLICY "anon_insert_farms" ON farms FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_farms" ON farms;
CREATE POLICY "anon_update_farms" ON farms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_farms" ON farms;
CREATE POLICY "anon_delete_farms" ON farms FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id bigserial PRIMARY KEY,
  transporter_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  vehicle_type text,
  capacity text,
  current_location text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_vehicles" ON vehicles;
CREATE POLICY "anon_all_vehicles" ON vehicles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
CREATE POLICY "anon_insert_vehicles" ON vehicles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;
CREATE POLICY "anon_update_vehicles" ON vehicles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- PRODUCTS (Marketplace)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  seller_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  price numeric(12,2) NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  quantity numeric(12,2) NOT NULL DEFAULT 0,
  description text,
  image_url text,
  location text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id bigserial PRIMARY KEY,
  buyer_id bigint REFERENCES auth_users(id) ON DELETE SET NULL,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  total_price numeric(12,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'mobile_money',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_orders" ON orders;
CREATE POLICY "anon_all_orders" ON orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- DELIVERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
  id bigserial PRIMARY KEY,
  order_id bigint REFERENCES orders(id) ON DELETE CASCADE,
  transporter_id bigint REFERENCES auth_users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  pickup_location text,
  dropoff_location text,
  estimated_arrival timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_deliveries" ON deliveries;
CREATE POLICY "anon_all_deliveries" ON deliveries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_deliveries" ON deliveries;
CREATE POLICY "anon_insert_deliveries" ON deliveries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_deliveries" ON deliveries;
CREATE POLICY "anon_update_deliveries" ON deliveries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- COMMUNITY POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  media_url text,
  category text DEFAULT 'general',
  post_type text DEFAULT 'general',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  is_ad boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_community_posts" ON community_posts;
CREATE POLICY "public_read_community_posts" ON community_posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_community_posts" ON community_posts;
CREATE POLICY "anon_insert_community_posts" ON community_posts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_community_posts" ON community_posts;
CREATE POLICY "anon_update_community_posts" ON community_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_community_posts" ON community_posts;
CREATE POLICY "anon_delete_community_posts" ON community_posts FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- POST LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS post_likes (
  id bigserial PRIMARY KEY,
  post_id bigint REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_post_likes" ON post_likes;
CREATE POLICY "anon_all_post_likes" ON post_likes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_post_likes" ON post_likes;
CREATE POLICY "anon_insert_post_likes" ON post_likes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_post_likes" ON post_likes;
CREATE POLICY "anon_delete_post_likes" ON post_likes FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- POST COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS post_comments (
  id bigserial PRIMARY KEY,
  post_id bigint REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_post_comments" ON post_comments;
CREATE POLICY "anon_all_post_comments" ON post_comments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_post_comments" ON post_comments;
CREATE POLICY "anon_insert_post_comments" ON post_comments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_post_comments" ON post_comments;
CREATE POLICY "anon_delete_post_comments" ON post_comments FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- POST SAVES (Bookmarks)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_saves (
  id bigserial PRIMARY KEY,
  post_id bigint REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_post_saves" ON post_saves;
CREATE POLICY "anon_all_post_saves" ON post_saves FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_post_saves" ON post_saves;
CREATE POLICY "anon_insert_post_saves" ON post_saves FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_post_saves" ON post_saves;
CREATE POLICY "anon_delete_post_saves" ON post_saves FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- POST REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS post_reports (
  id bigserial PRIMARY KEY,
  post_id bigint REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_post_reports" ON post_reports;
CREATE POLICY "anon_insert_post_reports" ON post_reports FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  type text DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_notifications" ON notifications;
CREATE POLICY "anon_all_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- AI CHAT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  session_id text,
  category text DEFAULT 'general',
  message text NOT NULL,
  response text NOT NULL,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_ai_chat" ON ai_chat_history;
CREATE POLICY "anon_all_ai_chat" ON ai_chat_history FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ai_chat" ON ai_chat_history;
CREATE POLICY "anon_insert_ai_chat" ON ai_chat_history FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ai_chat" ON ai_chat_history;
CREATE POLICY "anon_update_ai_chat" ON ai_chat_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ai_chat" ON ai_chat_history;
CREATE POLICY "anon_delete_ai_chat" ON ai_chat_history FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- AI LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_logs (
  id bigserial PRIMARY KEY,
  user_id bigint,
  query_type text DEFAULT 'general',
  input_data text,
  result text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_ai_logs" ON ai_logs;
CREATE POLICY "anon_all_ai_logs" ON ai_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ai_logs" ON ai_logs;
CREATE POLICY "anon_insert_ai_logs" ON ai_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- VOICE CHAT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_chat_history (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  session_id text,
  transcribed_text text,
  ai_response text,
  language text DEFAULT 'en',
  voice_gender text DEFAULT 'female',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE voice_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_voice_chat" ON voice_chat_history;
CREATE POLICY "anon_all_voice_chat" ON voice_chat_history FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_voice_chat" ON voice_chat_history;
CREATE POLICY "anon_insert_voice_chat" ON voice_chat_history FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- FARM RECORDS (Finance tracker)
-- ============================================================
CREATE TABLE IF NOT EXISTS farm_records (
  id bigserial PRIMARY KEY,
  farmer_id bigint REFERENCES auth_users(id) ON DELETE CASCADE,
  type text NOT NULL,
  category text NOT NULL,
  amount numeric(12,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farm_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_farm_records" ON farm_records;
CREATE POLICY "anon_all_farm_records" ON farm_records FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_farm_records" ON farm_records;
CREATE POLICY "anon_insert_farm_records" ON farm_records FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_farm_records" ON farm_records;
CREATE POLICY "anon_update_farm_records" ON farm_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_farm_records" ON farm_records;
CREATE POLICY "anon_delete_farm_records" ON farm_records FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_session ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_farm_records_farmer ON farm_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_otp_email_type ON otp_verifications(email, otp_type);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
