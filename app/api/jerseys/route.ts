// app/api/jerseys/route.ts

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const type = searchParams.get("type") ?? "all";
    const category = searchParams.get("category") ?? "all";
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
    if (type !== "all") query = query.eq("type", type);
    if (category !== "all") query = query.eq("category", category);

    const { data, error, count } = await query;
    if (error) {
      console.error("[jerseys GET]", error.message);
      return withMeta([], { page, pageSize, total: 0, totalPages: 0 });
    }

    return withMeta(data ?? [], {
      page,
      pageSize,
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
