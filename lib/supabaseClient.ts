// supabase/client.ts — re-exports the shared browser client
export { supabase, getSupabaseBrowserClient } from "@/lib/supabaseClient";
export const createClient = () => {
  const { supabase } = require("@/lib/supabaseClient");
  return supabase;
};