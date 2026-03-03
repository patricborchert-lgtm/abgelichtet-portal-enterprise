const { VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_URL } = import.meta.env;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  throw new Error("Supabase environment variables are missing.");
}

export const env = {
  supabaseAnonKey: VITE_SUPABASE_ANON_KEY,
  supabaseUrl: VITE_SUPABASE_URL,
} as const;
