import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabaseAdmin() {
  if (client) return client;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) throw new Error("SUPABASE_URL mungon në .env.local.");
  if (!supabaseServiceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY mungon në .env.local.");
  client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return client;
}
