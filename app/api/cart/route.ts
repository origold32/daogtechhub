export const dynamic = "force-dynamic";
// app/api/cart/route.ts
// Syncs the Zustand client cart with Supabase for persistence across devices.
// GET    → Fetch server cart
// POST   → Add / update item
// DELETE → Clear entire cart

import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { data, error: queryError } = await supabase!
      .from("cart_items")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });

    if (queryError) return serverError(queryError);
    return ok(data);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { productId, productCategory, productName, productImage, unitPrice, quantity } = body;

    if (!productId || !productCategory || !unitPrice) {
      return badRequest("productId, productCategory, and unitPrice are required");
    }

    // Upsert: increment quantity if item already exists
    const { data: existing } = await supabase!
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user!.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      const { data, error: updateError } = await supabase!
        .from("cart_items")
        .update({ quantity: existing.quantity + (quantity ?? 1) })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) return serverError(updateError);
      return ok(data, "Cart updated");
    }

    const { data, error: insertError } = await supabase!
      .from("cart_items")
      .insert({
        user_id: user!.id,
        product_id: productId,
        product_category: productCategory,
        product_name: productName,
        product_image: productImage,
        unit_price: unitPrice,
        quantity: quantity ?? 1,
      })
      .select()
      .single();

    if (insertError) return serverError(insertError);
    return ok(data, "Item added to cart");
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const productId = req.nextUrl.searchParams.get('productId');

    let query = supabase!
      .from("cart_items")
      .delete()
      .eq("user_id", user!.id);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { error: deleteError } = await query;

    if (deleteError) return serverError(deleteError);
    return ok({ cleared: !productId, productId }, productId ? "Item removed from cart" : "Cart cleared");
  } catch (err) {
    return serverError(err);
  }
}

