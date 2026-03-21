// supabase/client.ts
import type { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export { getSupabaseBrowserClient };
export const createClient = getSupabaseBrowserClient;
export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;
