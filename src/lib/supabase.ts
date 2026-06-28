import { createClient } from '@supabase/supabase-js';

// Menggunakan variabel yang sesuai dengan konfigurasi NEXT_PUBLIC_ Anda
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars not set. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah benar.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
