import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvrkupjugxyzkhhafsup.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cmt1cGp1Z3h5emtoaGFmc3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5ODMzNDcsImV4cCI6MjAzMjU1OTM0N30.QuQfWQEvwQhE7x8vMxq0fBPvzVNk8T8qN8e0hWq0j0k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'transporter' | 'admin';
  phone?: string;
  location?: string;
  profile_photo?: string;
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  map_visibility: 'everyone' | 'friends' | 'hidden';
  created_at: string;
  updated_at: string;
}

export interface Product { id: number; seller_id: number; name: string; category: string; price: number; unit: string; quantity: number; description?: string; image_url?: string; location?: string; latitude?: number; longitude?: number; is_available: boolean; created_at: string; }

export interface Driver { id: number; user_id: number; user?: User; vehicle_type: 'pickup' | 'truck' | 'motorcycle' | 'tractor'; vehicle_plate?: string; vehicle_capacity?: string; status: 'available' | 'busy' | 'offline'; current_latitude?: number; current_longitude?: number; rating: number; total_trips: number; is_verified: boolean; }

export interface Expert { id: number; user_id: number; user?: User; specialization: 'crop' | 'livestock' | 'irrigation' | 'soil' | 'veterinary' | 'consultant'; years_experience: number; qualifications?: string; consultation_fee: number; is_available: boolean; is_verified: boolean; rating: number; total_consultations: number; }

export interface Message { id: number; sender_id: number; receiver_id?: number; group_id?: number; content: string; message_type: 'text' | 'image' | 'file' | 'voice'; media_url?: string; reply_to_id?: number; is_read: boolean; is_deleted: boolean; created_at: string; sender?: User; reaction?: string; }

export interface ChatGroup { id: number; name: string; description?: string; created_by: number; is_public: boolean; image_url?: string; created_at: string; }

// Error handling helper
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  return 'Operation failed. Please try again.';
};
