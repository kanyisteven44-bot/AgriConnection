-- Fix overly permissive RLS policies on all tables
-- This migration replaces the permissive policies with proper ownership-based policies

-- ============================================================
-- AUTH USERS - Only allow users to read/update their own data
-- ============================================================
DROP POLICY IF EXISTS "public_read_auth_users" ON auth_users;
DROP POLICY IF EXISTS "anon_insert_auth_users" ON auth_users;
DROP POLICY IF EXISTS "anon_update_auth_users" ON auth_users;
DROP POLICY IF EXISTS "anon_delete_auth_users" ON auth_users;

CREATE POLICY "public_read_auth_users" ON auth_users FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_own_auth_users" ON auth_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "update_own_auth_users" ON auth_users FOR UPDATE
  TO authenticated USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "delete_own_auth_users" ON auth_users FOR DELETE
  TO authenticated USING (auth.uid()::text = id::text);

-- ============================================================
-- AUTH ACCOUNTS - Only allow users to manage their own accounts
-- ============================================================
DROP POLICY IF EXISTS "anon_all_auth_accounts" ON auth_accounts;
DROP POLICY IF EXISTS "anon_insert_auth_accounts" ON auth_accounts;
DROP POLICY IF EXISTS "anon_update_auth_accounts" ON auth_accounts;
DROP POLICY IF EXISTS "anon_delete_auth_accounts" ON auth_accounts;

CREATE POLICY "select_own_auth_accounts" ON auth_accounts FOR SELECT
  TO authenticated USING (auth.uid()::text = "userId"::text);

CREATE POLICY "insert_own_auth_accounts" ON auth_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "delete_own_auth_accounts" ON auth_accounts FOR DELETE
  TO authenticated USING (auth.uid()::text = "userId"::text);

-- ============================================================
-- AUTH SESSIONS - Only allow users to manage their own sessions
-- ============================================================
DROP POLICY IF EXISTS "anon_all_auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "anon_insert_auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "anon_update_auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "anon_delete_auth_sessions" ON auth_sessions;

CREATE POLICY "select_own_auth_sessions" ON auth_sessions FOR SELECT
  TO authenticated USING (auth.uid()::text = "userId"::text);

CREATE POLICY "insert_own_auth_sessions" ON auth_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "delete_own_auth_sessions" ON auth_sessions FOR DELETE
  TO authenticated USING (auth.uid()::text = "userId"::text);

-- ============================================================
-- OTP VERIFICATIONS - Only allow users to manage their own OTPs
-- ============================================================
DROP POLICY IF EXISTS "anon_all_otp_verifications" ON otp_verifications;
DROP POLICY IF EXISTS "anon_insert_otp_verifications" ON otp_verifications;
DROP POLICY IF EXISTS "anon_update_otp_verifications" ON otp_verifications;
DROP POLICY IF EXISTS "anon_delete_otp_verifications" ON otp_verifications;

CREATE POLICY "select_own_otp_verifications" ON otp_verifications FOR SELECT
  TO authenticated USING (auth.uid()::text IN (SELECT id::text FROM auth_users WHERE email = otp_verifications.email));

CREATE POLICY "insert_otp_verifications" ON otp_verifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "update_own_otp_verifications" ON otp_verifications FOR UPDATE
  TO authenticated USING (auth.uid()::text IN (SELECT id::text FROM auth_users WHERE email = otp_verifications.email)) WITH CHECK (true);

-- ============================================================
-- PRODUCTS - Public read, only owner can modify
-- ============================================================
DROP POLICY IF EXISTS "public_read_products" ON products;
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid()::text = seller_id::text) WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid()::text = seller_id::text);

-- ============================================================
-- ORDERS - Users can only see their own orders
-- ============================================================
DROP POLICY IF EXISTS "anon_all_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;

CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid()::text = buyer_id::text OR auth.uid()::text IN (SELECT seller_id::text FROM products WHERE id = product_id));

CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = buyer_id::text);

CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid()::text = buyer_id::text OR auth.uid()::text IN (SELECT seller_id::text FROM products WHERE id = product_id)) WITH CHECK (true);

-- ============================================================
-- DELIVERIES - Only related parties can access
-- ============================================================
DROP POLICY IF EXISTS "anon_all_deliveries" ON deliveries;
DROP POLICY IF EXISTS "anon_insert_deliveries" ON deliveries;
DROP POLICY IF EXISTS "anon_update_deliveries" ON deliveries;

CREATE POLICY "select_own_deliveries" ON deliveries FOR SELECT
  TO authenticated USING (
    auth.uid()::text = transporter_id::text 
    OR auth.uid()::text IN (SELECT buyer_id::text FROM orders WHERE id = order_id)
    OR auth.uid()::text IN (SELECT seller_id::text FROM products p JOIN orders o ON o.product_id = p.id WHERE o.id = order_id)
  );

CREATE POLICY "insert_own_deliveries" ON deliveries FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_own_deliveries" ON deliveries FOR UPDATE
  TO authenticated USING (auth.uid()::text = transporter_id::text) WITH CHECK (true);

-- ============================================================
-- FARMS - Users can only manage their own farms
-- ============================================================
DROP POLICY IF EXISTS "anon_all_farms" ON farms;
DROP POLICY IF EXISTS "anon_insert_farms" ON farms;
DROP POLICY IF EXISTS "anon_update_farms" ON farms;
DROP POLICY IF EXISTS "anon_delete_farms" ON farms;

CREATE POLICY "select_own_farms" ON farms FOR SELECT
  TO authenticated USING (auth.uid()::text = farmer_id::text);

CREATE POLICY "insert_own_farms" ON farms FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = farmer_id::text);

CREATE POLICY "update_own_farms" ON farms FOR UPDATE
  TO authenticated USING (auth.uid()::text = farmer_id::text) WITH CHECK (auth.uid()::text = farmer_id::text);

CREATE POLICY "delete_own_farms" ON farms FOR DELETE
  TO authenticated USING (auth.uid()::text = farmer_id::text);

-- ============================================================
-- VEHICLES - Transporters can only manage their own vehicles
-- ============================================================
DROP POLICY IF EXISTS "anon_all_vehicles" ON vehicles;
DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;

CREATE POLICY "select_own_vehicles" ON vehicles FOR SELECT
  TO authenticated USING (auth.uid()::text = transporter_id::text);

CREATE POLICY "insert_own_vehicles" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = transporter_id::text);

CREATE POLICY "update_own_vehicles" ON vehicles FOR UPDATE
  TO authenticated USING (auth.uid()::text = transporter_id::text) WITH CHECK (auth.uid()::text = transporter_id::text);

-- ============================================================
-- COMMUNITY POSTS - Public read, owner can modify
-- ============================================================
DROP POLICY IF EXISTS "public_read_community_posts" ON community_posts;
DROP POLICY IF EXISTS "anon_insert_community_posts" ON community_posts;
DROP POLICY IF EXISTS "anon_update_community_posts" ON community_posts;
DROP POLICY IF EXISTS "anon_delete_community_posts" ON community_posts;

CREATE POLICY "public_read_community_posts" ON community_posts FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_own_community_posts" ON community_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "update_own_community_posts" ON community_posts FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "delete_own_community_posts" ON community_posts FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- ============================================================
-- POST LIKES - Users can only manage their own likes
-- ============================================================
DROP POLICY IF EXISTS "anon_all_post_likes" ON post_likes;
DROP POLICY IF EXISTS "anon_insert_post_likes" ON post_likes;
DROP POLICY IF EXISTS "anon_delete_post_likes" ON post_likes;

CREATE POLICY "select_own_post_likes" ON post_likes FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);

CREATE POLICY "insert_own_post_likes" ON post_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "delete_own_post_likes" ON post_likes FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- ============================================================
-- POST COMMENTS - Users can only modify their own comments
-- ============================================================
DROP POLICY IF EXISTS "anon_all_post_comments" ON post_comments;
DROP POLICY IF EXISTS "anon_insert_post_comments" ON post_comments;
DROP POLICY IF EXISTS "anon_delete_post_comments" ON post_comments;

CREATE POLICY "select_post_comments" ON post_comments FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_own_post_comments" ON post_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "delete_own_post_comments" ON post_comments FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- ============================================================
-- POST SAVES - Users can only manage their own saves
-- ============================================================
DROP POLICY IF EXISTS "anon_all_post_saves" ON post_saves;
DROP POLICY IF EXISTS "anon_insert_post_saves" ON post_saves;
DROP POLICY IF EXISTS "anon_delete_post_saves" ON post_saves;

CREATE POLICY "select_own_post_saves" ON post_saves FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);

CREATE POLICY "insert_own_post_saves" ON post_saves FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "delete_own_post_saves" ON post_saves FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- ============================================================
-- NOTIFICATIONS - Users can only see their own notifications
-- ============================================================
DROP POLICY IF EXISTS "anon_all_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;

CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);

CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- ============================================================
-- AI CHAT HISTORY - Users can only see their own chats
-- ============================================================
DROP POLICY IF EXISTS "anon_all_ai_chat" ON ai_chat_history;
DROP POLICY IF EXISTS "anon_insert_ai_chat" ON ai_chat_history;
DROP POLICY IF EXISTS "anon_update_ai_chat" ON ai_chat_history;
DROP POLICY IF EXISTS "anon_delete_ai_chat" ON ai_chat_history;

CREATE POLICY "select_own_ai_chat" ON ai_chat_history FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);

CREATE POLICY "insert_own_ai_chat" ON ai_chat_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "update_own_ai_chat" ON ai_chat_history FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "delete_own_ai_chat" ON ai_chat_history FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- ============================================================
-- AI LOGS - Only admins can access
-- ============================================================
DROP POLICY IF EXISTS "anon_all_ai_logs" ON ai_logs;
DROP POLICY IF EXISTS "anon_insert_ai_logs" ON ai_logs;

CREATE POLICY "select_ai_logs" ON ai_logs FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM auth_users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "insert_ai_logs" ON ai_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- VOICE CHAT HISTORY - Users can only see their own voice chats
-- ============================================================
DROP POLICY IF EXISTS "anon_all_voice_chat" ON voice_chat_history;
DROP POLICY IF EXISTS "anon_insert_voice_chat" ON voice_chat_history;

CREATE POLICY "select_own_voice_chat" ON voice_chat_history FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);

CREATE POLICY "insert_own_voice_chat" ON voice_chat_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================================
-- FARM RECORDS - Users can only see their own records
-- ============================================================
DROP POLICY IF EXISTS "anon_all_farm_records" ON farm_records;
DROP POLICY IF EXISTS "anon_insert_farm_records" ON farm_records;
DROP POLICY IF EXISTS "anon_update_farm_records" ON farm_records;
DROP POLICY IF EXISTS "anon_delete_farm_records" ON farm_records;

CREATE POLICY "select_own_farm_records" ON farm_records FOR SELECT
  TO authenticated USING (auth.uid()::text = farmer_id::text);

CREATE POLICY "insert_own_farm_records" ON farm_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = farmer_id::text);

CREATE POLICY "update_own_farm_records" ON farm_records FOR UPDATE
  TO authenticated USING (auth.uid()::text = farmer_id::text) WITH CHECK (auth.uid()::text = farmer_id::text);

CREATE POLICY "delete_own_farm_records" ON farm_records FOR DELETE
  TO authenticated USING (auth.uid()::text = farmer_id::text);

-- Add otp_hash column if it doesn't exist (for hashed OTP storage)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'otp_verifications' AND column_name = 'otp_hash') THEN
    ALTER TABLE otp_verifications ADD COLUMN otp_hash text;
  END IF;
END $$;