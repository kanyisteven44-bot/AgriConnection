-- Enable RLS on all tables that are missing it
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages (chat messages)
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (
    (auth.uid())::text = (sender_id)::text
    OR (auth.uid())::text = (receiver_id)::text
  );
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (sender_id)::text);
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (sender_id)::text);
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING ((auth.uid())::text = (sender_id)::text);

-- RLS Policies for chat_groups
CREATE POLICY "select_chat_groups" ON chat_groups FOR SELECT
  TO authenticated USING (is_public = true OR (auth.uid())::text IN (SELECT (user_id)::text FROM chat_group_members WHERE group_id = chat_groups.id));
CREATE POLICY "insert_chat_groups" ON chat_groups FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (created_by)::text);
CREATE POLICY "update_chat_groups" ON chat_groups FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (created_by)::text);
CREATE POLICY "delete_chat_groups" ON chat_groups FOR DELETE
  TO authenticated USING ((auth.uid())::text = (created_by)::text);

-- RLS Policies for chat_group_members
CREATE POLICY "select_chat_group_members" ON chat_group_members FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_chat_group_members" ON chat_group_members FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "delete_chat_group_members" ON chat_group_members FOR DELETE
  TO authenticated USING ((auth.uid())::text = (user_id)::text);

-- RLS Policies for message_reactions
CREATE POLICY "select_message_reactions" ON message_reactions FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_message_reactions" ON message_reactions FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (user_id)::text);
CREATE POLICY "delete_message_reactions" ON message_reactions FOR DELETE
  TO authenticated USING ((auth.uid())::text = (user_id)::text);

-- RLS Policies for drivers
CREATE POLICY "select_drivers" ON drivers FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_drivers" ON drivers FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (user_id)::text);
CREATE POLICY "update_drivers" ON drivers FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (user_id)::text);
CREATE POLICY "delete_drivers" ON drivers FOR DELETE
  TO authenticated USING ((auth.uid())::text = (user_id)::text);

-- RLS Policies for driver_reviews
CREATE POLICY "select_driver_reviews" ON driver_reviews FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_driver_reviews" ON driver_reviews FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (reviewer_id)::text);
CREATE POLICY "delete_driver_reviews" ON driver_reviews FOR DELETE
  TO authenticated USING ((auth.uid())::text = (reviewer_id)::text);

-- RLS Policies for experts
CREATE POLICY "select_experts" ON experts FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_experts" ON experts FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (user_id)::text);
CREATE POLICY "update_experts" ON experts FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (user_id)::text);
CREATE POLICY "delete_experts" ON experts FOR DELETE
  TO authenticated USING ((auth.uid())::text = (user_id)::text);

-- RLS Policies for expert_bookings
CREATE POLICY "select_expert_bookings" ON expert_bookings FOR SELECT
  TO authenticated USING ((auth.uid())::text = (farmer_id)::text OR (auth.uid())::text = (expert_id)::text);
CREATE POLICY "insert_expert_bookings" ON expert_bookings FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (farmer_id)::text);
CREATE POLICY "update_expert_bookings" ON expert_bookings FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (farmer_id)::text OR (auth.uid())::text = (expert_id)::text);
CREATE POLICY "delete_expert_bookings" ON expert_bookings FOR DELETE
  TO authenticated USING ((auth.uid())::text = (farmer_id)::text);

-- RLS Policies for expert_reviews
CREATE POLICY "select_expert_reviews" ON expert_reviews FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_expert_reviews" ON expert_reviews FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (reviewer_id)::text);
CREATE POLICY "delete_expert_reviews" ON expert_reviews FOR DELETE
  TO authenticated USING ((auth.uid())::text = (reviewer_id)::text);

-- RLS Policies for transport_requests
CREATE POLICY "select_transport_requests" ON transport_requests FOR SELECT
  TO authenticated USING ((auth.uid())::text = (farmer_id)::text OR (auth.uid())::text = (driver_id)::text);
CREATE POLICY "insert_transport_requests" ON transport_requests FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (farmer_id)::text);
CREATE POLICY "update_transport_requests" ON transport_requests FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (farmer_id)::text OR (auth.uid())::text = (driver_id)::text);
CREATE POLICY "delete_transport_requests" ON transport_requests FOR DELETE
  TO authenticated USING ((auth.uid())::text = (farmer_id)::text);

-- RLS Policies for audit_logs (admin only)
CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- RLS Policies for user_verifications
CREATE POLICY "select_user_verifications" ON user_verifications FOR SELECT
  TO authenticated USING ((auth.uid())::text = (user_id)::text OR EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));
CREATE POLICY "insert_user_verifications" ON user_verifications FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (user_id)::text);
CREATE POLICY "update_user_verifications" ON user_verifications FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));

-- RLS Policies for reports
CREATE POLICY "select_reports" ON reports FOR SELECT
  TO authenticated USING ((auth.uid())::text = (reporter_id)::text OR EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));
CREATE POLICY "insert_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (reporter_id)::text);

-- RLS Policies for market_prices (public read)
CREATE POLICY "select_market_prices" ON market_prices FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_market_prices" ON market_prices FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));
CREATE POLICY "update_market_prices" ON market_prices FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));

-- RLS Policies for weather_alerts (public read)
CREATE POLICY "select_weather_alerts" ON weather_alerts FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_weather_alerts" ON weather_alerts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));

-- RLS Policies for disease_alerts (public read)
CREATE POLICY "select_disease_alerts" ON disease_alerts FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_disease_alerts" ON disease_alerts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));

-- RLS Policies for emergency_alerts (public read)
CREATE POLICY "select_emergency_alerts" ON emergency_alerts FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_emergency_alerts" ON emergency_alerts FOR INSERT
  TO authenticated WITH CHECK (true);

-- RLS Policies for crop_recommendations (public read)
CREATE POLICY "select_crop_recommendations" ON crop_recommendations FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "insert_crop_recommendations" ON crop_recommendations FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM auth_users WHERE (auth_users.id)::text = (auth.uid())::text AND role = 'admin'));

-- RLS Policies for rate_limits (system only - deny all)
CREATE POLICY "deny_rate_limits" ON rate_limits FOR ALL
  TO authenticated, anon USING (false);

-- RLS Policies for trip_tracking
CREATE POLICY "select_trip_tracking" ON trip_tracking FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM transport_requests WHERE transport_requests.id = trip_tracking.request_id AND ((auth.uid())::text = (transport_requests.driver_id)::text OR (auth.uid())::text = (transport_requests.farmer_id)::text)));
CREATE POLICY "insert_trip_tracking" ON trip_tracking FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM transport_requests WHERE transport_requests.id = trip_tracking.request_id AND (auth.uid())::text = (transport_requests.driver_id)::text));
CREATE POLICY "update_trip_tracking" ON trip_tracking FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM transport_requests WHERE transport_requests.id = trip_tracking.request_id AND (auth.uid())::text = (transport_requests.driver_id)::text));

-- RLS Policies for calls
CREATE POLICY "select_calls" ON calls FOR SELECT
  TO authenticated USING ((auth.uid())::text = (caller_id)::text OR (auth.uid())::text = (receiver_id)::text);
CREATE POLICY "insert_calls" ON calls FOR INSERT
  TO authenticated WITH CHECK ((auth.uid())::text = (caller_id)::text);
CREATE POLICY "update_calls" ON calls FOR UPDATE
  TO authenticated USING ((auth.uid())::text = (caller_id)::text OR (auth.uid())::text = (receiver_id)::text);