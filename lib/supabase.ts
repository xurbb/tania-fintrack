import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * true  = data disimpan di Supabase (sinkron antar device + ada login)
 * false = mode lokal (localStorage), dipakai kalau env belum diisi
 */
export const isCloudEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isCloudEnabled
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
