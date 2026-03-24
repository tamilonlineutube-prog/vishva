import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const missing = !SUPABASE_URL ? 'VITE_SUPABASE_URL' : 'VITE_SUPABASE_ANON_KEY';
  console.error(
    `[Supabase Config Error] ${missing} is not configured.\n` +
    'Please add the following to your .env file:\n' +
    'VITE_SUPABASE_URL=your_supabase_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Log successful initialization in development
if (import.meta.env.DEV && SUPABASE_URL && SUPABASE_ANON_KEY) {
  console.log('[Supabase] Client initialized successfully');
}