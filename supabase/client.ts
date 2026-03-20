// supabase/client.ts
// Browser client - delegates to the app singleton.
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
export const createClient = getSupabaseBrowserClient;
export { getSupabaseBrowserClient as supabase };