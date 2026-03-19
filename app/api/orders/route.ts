// app/api/orders/route.ts
// GET  → List the authenticated user's orders
// POST → Create a new order (from cart items)

import { NextRequest } from "next/server";
import { ok, created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, from, to } = parsePagination(searchParams);

    const { data, error: queryError, count } = await supabase!
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (queryError) return serverError(queryError);

    return withMeta(data, {
      page, pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { items, paymentMethod, paymentReference, notes } = body as {
      items: Array<{
        productId: string;
        productCategory: string;
        productName: string;
        productImage: string;
        unitPrice: number;
        quantity: number;
      }>;
      paymentMethod?: string;
      paymentReference?: string;
      notes?: string;
    };

    if (!items || items.length === 0) {
      return badRequest("Order must contain at least one item");
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Create order + items in a single transaction via Supabase RPC
    const { data: order, error: orderError } = await supabase!
      .from("orders")
      .insert({
        user_id: user!.id,
        status: "pending",
        total_amount: totalAmount,
        payment_method: paymentMethod ?? null,
        payment_reference: paymentReference ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (orderError) return serverError(orderError);

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_category: item.productCategory,
      product_name: item.productName,
      product_image: item.productImage,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase!
      .from("order_items")
      .insert(orderItems);

    if (itemsError) return serverError(itemsError);

    // Clear the user's cart after successful order
    await supabase!.from("cart_items").delete().eq("user_id", user!.id);

    return created({ ...order, items: orderItems }, "Order placed successfully");
  } catch (err) {
    return serverError(err);
  }
}
