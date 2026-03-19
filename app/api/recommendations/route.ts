// app/api/recommendations/route.ts
// GET /api/recommendations?category=gadgets&productId=xxx

import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { createServerSupabaseClient } from "@/supabase/server";

const TABLE_MAP: Record<string, "gadgets" | "jerseys" | "cars" | "real_estates"> = {
  gadgets:    "gadgets",
  jerseys:    "jerseys",
  cars:       "cars",
  realestate: "real_estates",
};

export async function GET(req: NextRequest) {
  try {
    const supabase  = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const category  = searchParams.get("category") ?? "gadgets";
    const productId = searchParams.get("productId");
    const limit     = Math.min(parseInt(searchParams.get("limit") ?? "6"), 12);

    const table = TABLE_MAP[category] ?? "gadgets";

    if (productId) {
      const { data: ref } = await supabase
        .from(table)
        .select("*")
        .eq("id", productId)
        .single();

      if (ref) {
        // ref.type and ref.brand exist on gadgets/jerseys/cars rows — access
        // through bracket notation with unknown cast to avoid any, then check
        const refType  = (ref as Record<string, unknown>)["type"];
        const refBrand = (ref as Record<string, unknown>)["brand"];

        let query = supabase
          .from(table)
          .select("*")
          .neq("id", productId)
          .limit(limit);

        if (typeof refType  === "string") query = query.eq("type"  as never, refType);
        else if (typeof refBrand === "string") query = query.eq("brand" as never, refBrand);

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