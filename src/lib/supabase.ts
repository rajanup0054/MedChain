import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here';

// Create client only if configured, otherwise use null
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}) : null;

// Export configuration status
export const isSupabaseReady = isSupabaseConfigured;

// Database types
export interface Medicine {
  id: string;
  name: string;
  batch_id: string;
  manufacturer: string;
  quantity: number;
  expiry_date: string;
  location: string;
  status: 'active' | 'expired' | 'low_stock' | 'out_of_stock';
  blockchain_hash?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse';
  created_at: string;
}

export interface Alert {
  id: string;
  type: 'expiry' | 'low_stock' | 'out_of_stock' | 'quality';
  medicine_id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  created_at: string;
  medicines?: Medicine;
}

export interface Reorder {
  id: string;
  medicine_id: string;
  quantity: number;
  status: 'pending' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  supplier?: string;
  expected_delivery?: string;
  created_at: string;
  medicines?: Medicine;
}