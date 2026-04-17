// app/api/orders/[id]/route.ts

import { NextRequest } from "next/server";
import { ok, notFound, serverError, forbidden, badRequest } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth-guard";

const VALID_ORDER_STATUSES = [
  "pending", "awaiting_payment", "payment_submitted", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded",
] as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const { data, error: queryError } = await supabase!
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (queryError || !data) return notFound("Order");

    // Users can only view their own orders; admins see all
    const { data: profile } = await supabase!
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();

    if (data.user_id !== user!.id && profile?.role !== "admin") {
      return forbidden();
    }

    return ok(data);
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const status = body.status as string | undefined;
    const notes = body.notes as string | undefined;

    if (!status || !VALID_ORDER_STATUSES.includes(status as any)) {
      return badRequest(`status must be one of: ${VALID_ORDER_STATUSES.join(", ")}`);
    }

    const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (notes !== undefined) updatePayload.notes = String(notes).trim();

    const { data, error } = await auth.supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return serverError(error);
    return ok(data, "Order status updated");
  } catch (err) {
    return serverError(err);
  }
}
