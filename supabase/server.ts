// supabase/server.ts
// Server-side Supabase clients for Route Handlers, Server Components, Server Actions.

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// ── Anon client (respects RLS) ────────────────────────────────────────────────
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll()             { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // In Server Components cookies are read-only — this is expected.
        }
      },
    },
  });
};

// ── Service-role client (bypasses RLS — server-only, never expose to client) ──
// BUG FIX #4: old code used require("@supabase/supabase-js") which is CommonJS
// in an ESM module — works in Next.js but is incorrect and can break in strict
// ESM environments or edge runtime. Now uses the top-level ESM import.
export const createServiceRoleClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local"
    );
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
