import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseServerClientInstance: SupabaseClient | null = null;

/**
 * Returns a shared server-side Supabase client instance.
 * Uses SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseServerClientInstance) {
    return supabaseServerClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  supabaseServerClientInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseServerClientInstance;
}

/**
 * Returns the configured Supabase Storage Bucket name.
 */
export function getStorageBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "portfolio-uploads";
}
