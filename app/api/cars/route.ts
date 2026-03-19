// app/api/cars/route.ts

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const brand = searchParams.get("brand") ?? "all";
    const model = searchParams.get("model") ?? "all";
    const year = searchParams.get("year") ?? "all";
    const { page, pageSize, from, to } = parsePagination(searchParams);

    let query = supabase
      .from("cars")
      .select("*", { count: "exact" })
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    }
    if (brand !== "all") query = query.ilike("brand", brand);
    if (model !== "all") query = query.ilike("model", model);
    if (year !== "all") query = query.eq("year", parseInt(year, 10));

    const { data, error, count } = await query;
    if (error) {
      console.error("[cars GET]", error.message);
      return withMeta([], { page, pageSize, total: 0, totalPages: 0 });
    }

    return withMeta(data ?? [], {
      page, pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    console.error("[cars GET catch]", err);
    return withMeta([], { page: 1, pageSize: 20, total: 0, totalPages: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin", "vendor");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, brand, model, year, price, imageUrl, description, mileage, condition, fuelType, transmission } = body;

    if (!name || !brand || !model || !year || !price) {
      return badRequest("name, brand, model, year, and price are required");
    }

    const { data, error } = await auth.supabase
      .from("cars")
      .insert({
        name, brand, model, year,
        price, image_url: imageUrl,
        description, mileage,
        condition, fuel_type: fuelType,
        transmission,
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
