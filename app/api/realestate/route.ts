// app/api/realestate/route.ts

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
    const location = searchParams.get("location") ?? "all";
    const size = searchParams.get("size") ?? "all";
    const { page, pageSize, from, to } = parsePagination(searchParams);

    let query = supabase
      .from("real_estates")
      .select("*", { count: "exact" })
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
    }
    if (type !== "all") query = query.eq("type", type);
    if (location !== "all") query = query.ilike("location", `%${location}%`);

    const { data, error, count } = await query;
    if (error) {
      console.error("[realestate GET]", error.message);
      return withMeta([], { page, pageSize, total: 0, totalPages: 0 });
    }

    // Size filter done in-memory since it's a range check on a text field
    const filtered =
      size !== "all"
        ? (data ?? []).filter((e) => {
            const sqm = parseInt(e.size ?? "0", 10);
            return sqm >= parseInt(size, 10);
          })
        : data ?? [];

    return withMeta(filtered, {
      page, pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    console.error("[realestate GET catch]", err);
    return withMeta([], { page: 1, pageSize: 20, total: 0, totalPages: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin", "vendor");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, type, location, price, imageUrl, description, size, bedrooms, bathrooms, features } = body;

    if (!name || !type || !location || !price) {
      return badRequest("name, type, location, and price are required");
    }

    const { data, error } = await auth.supabase
      .from("real_estates")
      .insert({
        name, type, location, price,
        image_url: imageUrl, description, size,
        bedrooms: bedrooms ?? null,
        bathrooms: bathrooms ?? null,
        features: features ?? [],
        is_available: true,
        seller_id: auth.user!.id,
      })
      .select()
      .single();

    if (error) return serverError(error);
    return created(data);
  } catch (err) {
    return serverError(err);
  }
}
