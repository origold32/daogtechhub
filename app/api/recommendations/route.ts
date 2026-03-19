// app/api/recommendations/route.ts
// GET /api/recommendations?category=gadgets&productId=xxx

import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { createServerSupabaseClient } from "@/supabase/server";

// Map URL category param to actual Supabase table names
const TABLE_MAP: Record<string, "gadgets" | "jerseys" | "cars" | "real_estates"> = {
  gadgets:    "gadgets",
  jerseys:    "jerseys",
  cars:       "cars",
  realestate: "real_estates",
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const category  = searchParams.get("category") ?? "gadgets";
    const productId = searchParams.get("productId");
    const limit     = Math.min(parseInt(searchParams.get("limit") ?? "6"), 12);

    const table = TABLE_MAP[category] ?? "gadgets";

    if (productId) {
      const { data: ref } = await supabase.from(table).select("*").eq("id", productId).single();

      if (ref) {
        // ref is typed as the full row — .type and .brand exist on gadgets/jerseys/cars
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = ref as any;
        let query = supabase.from(table).select("*").neq("id", productId).limit(limit);

        if (r.type)       query = query.eq("type" as never, r.type);
        else if (r.brand) query = query.eq("brand" as never, r.brand);

        const { data: similar } = await query;
        if (similar && similar.length >= 3) return ok(similar, "Similar products");
      }
    }

    const { data: trending } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    return ok(trending ?? [], "Trending products");
  } catch (err) {
    return serverError(err);
  }
}