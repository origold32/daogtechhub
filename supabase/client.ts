// supabase/client.ts
// All browser auth uses the shared singleton from lib/supabaseClient.
// This file exists for backward compatibility with existing imports.

import { supabase } from "@/lib/supabaseClient";

export const createClient = () => supabase;
export { supabase };
export default supabase;