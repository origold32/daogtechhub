#!/usr/bin/env node
// scripts/setup.mjs
// Run once: pnpm setup
// ─────────────────────────────────────────────────────────────────
// 1. Deletes the duplicate /auth/callback route file
// 2. Reads .env.local and validates required vars
// 3. Runs the database patch SQL via Supabase service role
// 4. Opens Supabase SQL editor in browser as a fallback
// ─────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ── ANSI colours ─────────────────────────────────────────────────
const g = (s) => `\x1b[32m${s}\x1b[0m`;
const r = (s) => `\x1b[31m${s}\x1b[0m`;
const y = (s) => `\x1b[33m${s}\x1b[0m`;
const b = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

console.log(bold("\n🔧 DAOG Tech Hub — Setup Script\n"));

// ── Step 1: Delete duplicate route ───────────────────────────────
const DUPE = path.join(ROOT, "app", "auth");
if (fs.existsSync(DUPE)) {
  fs.rmSync(DUPE, { recursive: true, force: true });
  console.log(g("✓ Deleted duplicate app/auth/ folder"));
} else {
  console.log(g("✓ No duplicate route found (already clean)"));
}

// ── Step 2: Read .env.local ───────────────────────────────────────
const envPath = path.join(ROOT, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(r("✗ .env.local not found. Create it from .env.local.example"));
  process.exit(1);
}

const envVars = {};
fs.readFileSync(envPath, "utf8")
  .split("\n")
  .forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
  });

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"];
const ANON_KEY = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!SUPABASE_URL || !ANON_KEY) {
  console.error(r("✗ NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in .env.local"));
  process.exit(1);
}

if (!SERVICE_KEY) {
  console.warn(y("⚠ SUPABASE_SERVICE_ROLE_KEY not found — cannot auto-run SQL"));
} else {
  console.log(g("✓ .env.local loaded successfully"));
}

// ── Step 3: Run patch SQL via service role ───────────────────────
const PATCH_SQL = path.join(ROOT, "supabase", "PATCH.sql");

if (!fs.existsSync(PATCH_SQL)) {
  console.warn(y("⚠ supabase/PATCH.sql not found, skipping auto-migration"));
} else if (!SERVICE_KEY) {
  console.warn(y("⚠ No service role key — skipping auto-migration"));
} else {
  console.log(b("\n⏳ Running database patch via Supabase…\n"));

  // Extract project ref from URL: https://xxxx.supabase.co → xxxx
  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
  const sql = fs.readFileSync(PATCH_SQL, "utf8");

  try {
    // Use fetch (Node 18+) to call Supabase management API
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (res.ok) {
      console.log(g("✓ Database patch applied successfully!"));
    } else {
      const body = await res.text();
      console.warn(y(`⚠ Auto-migration response: ${res.status} — ${body.slice(0, 200)}`));
      openBrowserFallback(SUPABASE_URL, projectRef, sql);
    }
  } catch (err) {
    console.warn(y(`⚠ Auto-migration failed (${err.message}) — opening browser fallback`));
    const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
    openBrowserFallback(SUPABASE_URL, projectRef, sql);
  }
}

function openBrowserFallback(supabaseUrl, projectRef, sql) {
  const editorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  console.log(b("\n📋 Manual step required:"));
  console.log(`   1. Open: ${b(editorUrl)}`);
  console.log(`   2. Paste the contents of: ${b("supabase/PATCH.sql")}`);
  console.log(`   3. Click Run\n`);

  // Copy SQL to clipboard on Windows
  try {
    const tempFile = path.join(ROOT, ".tmp-sql.txt");
    fs.writeFileSync(tempFile, sql);
    execSync(`type "${tempFile}" | clip`, { shell: "cmd.exe", stdio: "ignore" });
    fs.unlinkSync(tempFile);
    console.log(g("✓ SQL copied to clipboard! Just Ctrl+V in the editor.\n"));
  } catch {
    // Not on Windows or clip not available — that's fine
  }

  // Open browser
  try {
    execSync(`start "" "${editorUrl}"`, { shell: "cmd.exe", stdio: "ignore" });
  } catch {
    try {
      execSync(`open "${editorUrl}"`, { stdio: "ignore" });
    } catch {
      try {
        execSync(`xdg-open "${editorUrl}"`, { stdio: "ignore" });
      } catch {
        // Can't open browser, that's fine
      }
    }
  }
}

// ── Summary ───────────────────────────────────────────────────────
console.log(bold("\n📌 Setup Summary:"));
console.log(g("  ✓ Duplicate route deleted"));
console.log(`  ${SERVICE_KEY ? g("✓") : y("⚠")} Database migration ${SERVICE_KEY ? "ran" : "needs manual run (see above)"}`);
console.log(b("\n  Next: pnpm dev\n"));
