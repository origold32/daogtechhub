// supabase/client.ts
// Thin wrapper — use getSupabaseBrowserClient() from @/lib/supabaseClient directly when possible.
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
export const createClient = getSupabaseBrowserClient;
export default getSupabaseBrowserClient;