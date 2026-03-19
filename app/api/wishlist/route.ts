// app/api/wishlist/route.ts
// GET    → Fetch user's saved wishlist items with product details
// POST   → Add item to wishlist
// DELETE → Remove item from wishlist (or clear all)

import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { data, error: qErr } = await supabase!
      .from("wishlists")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (qErr) return serverError(qErr);
    return ok(data ?? []);
  } catch (err) { return serverError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { productId, productCategory, productName, productImage, productPrice } = body;

    if (!productId || !productCategory) {
      return badRequest("productId and productCategory are required");
    }

    const { data, error: iErr } = await supabase!
      .from("wishlists")
      .upsert(
        {
          user_id:          user!.id,
          product_id:       productId,
          product_category: productCategory,
          product_name:     productName     ?? null,
          product_image:    productImage    ?? null,
          product_price:    productPrice    ?? null,
        },
        { onConflict: "user_id,product_id", ignoreDuplicates: true }
      )
      .select()
      .single();

    if (iErr) return serverError(iErr);
    return ok(data, "Added to wishlist");
  } catch (err) { return serverError(err); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (productId) {
      // Remove specific item
      const { error: dErr } = await supabase!
        .from("wishlists")
        .delete()
        .eq("user_id", user!.id)
        .eq("product_id", productId);
      if (dErr) return serverError(dErr);
      return ok({ removed: productId }, "Removed from wishlist");
    } else {
      // Clear entire wishlist
      const { error: dErr } = await supabase!
        .from("wishlists").delete().eq("user_id", user!.id);
      if (dErr) return serverError(dErr);
      return ok({ cleared: true }, "Wishlist cleared");
    }
  } catch (err) { return serverError(err); }
}
