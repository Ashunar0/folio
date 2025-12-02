import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/supabase/types";

export function createSupabaseBrowserClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase URL/anon key is not configured");
  }

  // Uses cookie-based session so middleware/RSC can read the auth state.
  return createBrowserClient<Database>(url, anonKey);
}
