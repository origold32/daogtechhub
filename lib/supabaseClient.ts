// lib/supabaseClient.ts
// Single shared Supabase browser client for the ENTIRE app.
// Guarded with typeof window to prevent SSR instantiation.
// Every component that needs auth imports THIS constant — never creates new clients.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Lazy singleton — only created in browser, never on server.
// This prevents Next.js SSR from creating a second instance during hydration.
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getOrCreateClient() {
  if (typeof window === "undefined") {
    // Server context — return a temporary client (no cookies available)
    // This should never be used for auth operations
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return _client;
}

// Export as a Proxy so it always uses the same lazy instance
// This allows `import { supabase }` to work naturally
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_target, prop) {
    const client = getOrCreateClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});