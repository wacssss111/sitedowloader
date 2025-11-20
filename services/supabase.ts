
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// тут стоят мои данные базы (Settings -> API)
// Если данные пустые, сайт будет работать в режиме LocalStorage (ток для нас)
// ------------------------------------------------------------------

const SUPABASE_URL = 'https://myzxhbangledeqalpaar.supabase.co'; // 
const SUPABASE_ANON_KEY = 'sb_publishable_ZgE6fRaOnnFDUl6_-3Nhqg_uet643-v'; //

// ------------------------------------------------------------------

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export const isSupabaseConfigured = !!supabase;
