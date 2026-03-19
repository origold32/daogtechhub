// app/api/orders/[id]/route.ts

import { NextRequest } from "next/server";
import { ok, notFound, serverError, forbidden } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth-guard";

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
    const { status, notes } = await req.json();

    const { data, error } = await auth.supabase
      .from("orders")
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return serverError(error);
    return ok(data, "Order status updated");
  } catch (err) {
    return serverError(err);
  }
}
