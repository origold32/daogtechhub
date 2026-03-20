// supabase/client.ts
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
export const createClient = getSupabaseBrowserClient;
export { getSupabaseBrowserClient };
export default getSupabaseBrowserClient;