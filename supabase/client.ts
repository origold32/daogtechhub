// supabase/client.ts — thin wrapper for backward compatibility
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Re-use the singleton from lib/supabaseClient without re-exporting the name "supabase"
// (circular alias issue when both files export the same name)
export { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export const createClient = (): ReturnType<typeof createBrowserClient<Database>> => {
  const { getSupabaseBrowserClient } = require("@/lib/supabaseClient");
  return getSupabaseBrowserClient();
};