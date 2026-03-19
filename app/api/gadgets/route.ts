// app/api/gadgets/route.ts
// GET  → List gadgets with search, type, brand filters + pagination
// POST → Create gadget (admin only)

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { ok, created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const type = searchParams.get("type") ?? "all";
    const brand = searchParams.get("brand") ?? "all";
    const { page, pageSize, from, to } = parsePagination(searchParams);

    let query = supabase
      .from("gadgets")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    if (type !== "all") query = query.eq("type", type);
    if (brand !== "all") query = query.ilike("brand", brand);

    const { data, error, count } = await query;
    if (error) {
      console.error("[gadgets GET]", error.message);
      return withMeta([], { page, pageSize, total: 0, totalPages: 0 });
    }

    return withMeta(data ?? [], {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    console.error("[gadgets GET catch]", err);
    return withMeta([], { page: 1, pageSize: 20, total: 0, totalPages: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, brand, type, price, imageUrl, description, condition, specs, stock } = body;

    if (!name || !brand || !type || !price) {
      return badRequest("name, brand, type, and price are required");
    }

    const { data, error } = await auth.supabase
      .from("gadgets")
      .insert({
        name,
        brand,
        type,
        price,
        image_url: imageUrl,
        description,
        condition,
        specs: specs ?? {},
        stock: stock ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) return serverError(error);
    return created(data, "Gadget created successfully");
  } catch (err) {
    return serverError(err);
  }
}
