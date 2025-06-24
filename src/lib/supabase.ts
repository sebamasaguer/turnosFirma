import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          user_name: string;
          user_email: string;
          user_phone: string;
          user_dni: string;
          appointment_date: string;
          appointment_time: string;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_name: string;
          user_email: string;
          user_phone: string;
          user_dni: string;
          appointment_date: string;
          appointment_time: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
        };
        Update: {
          id?: string;
          user_name?: string;
          user_email?: string;
          user_phone?: string;
          user_dni?: string;
          appointment_date?: string;
          appointment_time?: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
        };
      };
    };
  };
};