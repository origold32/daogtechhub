export const dynamic = "force-dynamic";
// app/api/jerseys/route.ts

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import type { Database } from "@/types/database";

type JerseyType     = Database["public"]["Tables"]["jerseys"]["Row"]["type"];
type JerseyCategory = Database["public"]["Tables"]["jerseys"]["Row"]["category"];
const VALID_TYPES:      JerseyType[]     = ["club", "country", "nfl", "basketball", "retro"];
const VALID_CATEGORIES: JerseyCategory[] = ["current", "retro", "special"];

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const search       = searchParams.get("search")   ?? "";
    const typeParam    = searchParams.get("type")     ?? "all";
    const categoryParam = searchParams.get("category") ?? "all";
    const { page, pageSize, from, to } = parsePagination(searchParams);

    let query = supabase
      .from("jerseys")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,team.ilike.%${search}%`);
    }

    const type     = VALID_TYPES.find((t) => t === typeParam);
    const category = VALID_CATEGORIES.find((c) => c === categoryParam);
    if (type)     query = query.eq("type", type);
    if (category) query = query.eq("category", category);

    const { data, error, count } = await query;
    if (error) {
      console.error("[jerseys GET]", error.message);
      return withMeta([], { page, pageSize, total: 0, totalPages: 0 });
    }

    return withMeta(data ?? [], {
      page, pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    console.error("[jerseys GET catch]", err);
    return withMeta([], { page: 1, pageSize: 20, total: 0, totalPages: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, team, type, category, price, imageUrl, description, sizes, season, stock } = body;

    if (!name || !team || !type || !price) {
      return badRequest("name, team, type, and price are required");
    }

    const { data, error } = await auth.supabase
      .from("jerseys")
      .insert({
        name, team, type, category,
        price, image_url: imageUrl,
        description, sizes: sizes ?? [],
        season, stock: stock ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) return serverError(error);
    return created(data);
  } catch (err) {
    return serverError(err);
  }
}
