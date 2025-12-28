import { createClient, SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;
let serverInstance: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (serverInstance) return serverInstance;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error(`Supabase server environment variables missing: url=${!!url}, key=${!!key}`);
  }
  
  serverInstance = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  return serverInstance;
}

export function supabase(): SupabaseClient {
  if (clientInstance) return clientInstance;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error("Supabase environment variables missing");
  }
  
  clientInstance = createClient(url, key);
  return clientInstance;
}
