// One-time script: sets role = 'admin' for daogstore@gmail.com
// Run with: node scripts/set-admin.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Read .env.local
const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();

const url     = get("NEXT_PUBLIC_SUPABASE_URL");
const service = get("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, service, { auth: { persistSession: false } });

const EMAIL = "daogstore@gmail.com";

const { data, error } = await supabase
  .from("profiles")
  .update({ role: "admin" })
  .eq("email", EMAIL)
  .select("id, email, role");

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

if (!data?.length) {
  console.error(`No profile found with email: ${EMAIL}`);
  process.exit(1);
}

console.log(`Done. Updated profile:`, data[0]);
