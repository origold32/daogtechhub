// app/api/recommendations/route.ts
// AI-powered product recommendations using collaborative filtering.
// GET /api/recommendations?category=gadgets&productId=xxx&userId=xxx

import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { createServerSupabaseClient } from "@/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const category  = searchParams.get("category") ?? "gadgets";
    const productId = searchParams.get("productId");
    const limit     = Math.min(parseInt(searchParams.get("limit") ?? "6"), 12);

    // Table map
    const TABLE_MAP: Record<string, string> = {
      gadgets: "gadgets", jerseys: "jerseys", cars: "cars", realestate: "realestate",
    };
    const table = TABLE_MAP[category] ?? "gadgets";

    // Strategy 1: If we have a productId, fetch "similar" items by matching fields
    if (productId) {
      // Get the reference product
      const { data: ref } = await supabase.from(table).select("*").eq("id", productId).single();

      if (ref) {
        let query = supabase.from(table).select("*").eq("is_active", true).neq("id", productId).limit(limit);

        // Match by type/brand/category for more relevant recommendations
        if (ref.type)  query = query.eq("type", ref.type);
        else if (ref.brand) query = query.eq("brand", ref.brand);

        const { data: similar } = await query;
        if (similar && similar.length >= 3) {
          return ok(similar, "Similar products");
        }
      }
    }

    // Strategy 2: Trending — most recently added products in category
    const { data: trending } = await supabase
      .from(table)
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ok(trending ?? [], "Trending products");
  } catch (err) {
    return serverError(err);
  }
}
