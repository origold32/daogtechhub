import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SUPABASE_AUTH_COOKIE_OPTIONS } from "@/lib/auth-utils";

let implicitSupabase: SupabaseClient<Database> | undefined;

export function getSupabaseImplicitClient() {
  if (typeof window === "undefined") return null;

  if (!implicitSupabase) {
    implicitSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "implicit",
          detectSessionInUrl: true,
          persistSession: false,
          autoRefreshToken: false,
          storageKey: `${SUPABASE_AUTH_COOKIE_OPTIONS.name}-implicit`,
        },
      },
    );
  }

  return implicitSupabase;
}

export function resetSupabaseImplicitClient() {
  implicitSupabase = undefined;
}
