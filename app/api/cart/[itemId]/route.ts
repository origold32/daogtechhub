// app/api/cart/[itemId]/route.ts
// PATCH  → Update quantity of a specific cart item
// DELETE → Remove a specific cart item

import { NextRequest } from "next/server";
import { ok, notFound, serverError, forbidden } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { itemId } = await params;
    const { quantity } = await req.json();

    // Verify ownership
    const { data: item } = await supabase!
      .from("cart_items")
      .select("user_id")
      .eq("id", itemId)
      .single();

    if (!item) return notFound("Cart item");
    if (item.user_id !== user!.id) return forbidden();

    if (quantity <= 0) {
      await supabase!.from("cart_items").delete().eq("id", itemId);
      return ok({ deleted: true }, "Item removed");
    }

    const { data, error: updateError } = await supabase!
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .select()
      .single();

    if (updateError) return serverError(updateError);
    return ok(data, "Quantity updated");
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { itemId } = await params;

    const { data: item } = await supabase!
      .from("cart_items")
      .select("user_id")
      .eq("id", itemId)
      .single();

    if (!item) return notFound("Cart item");
    if (item.user_id !== user!.id) return forbidden();

    await supabase!.from("cart_items").delete().eq("id", itemId);
    return ok({ deleted: true }, "Item removed from cart");
  } catch (err) {
    return serverError(err);
  }
}
