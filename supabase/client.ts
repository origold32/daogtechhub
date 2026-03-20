// supabase/client.ts
// Re-exports the shared singleton from lib/supabaseClient.
// All app code should import from here or from @/lib/supabaseClient directly.

export { supabase as default } from "@/lib/supabaseClient";

// Factory function for backward compatibility with existing imports
export const createClient = () => {
  const { supabase } = require("@/lib/supabaseClient");
  return supabase;
};