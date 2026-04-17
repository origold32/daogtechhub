import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("orders")
      .select("id, user_id, status, payment_method, payment_reference, subtotal_amount, discount_amount, delivery_fee, grand_total, currency, manual_payment_submitted_at, manual_payment_note, manual_payment_proof_url, created_at, order_items(product_name, quantity, unit_price), profiles(first_name, last_name, email)")
      .eq("status", "payment_submitted")
      .order("created_at", { ascending: false });

    if (error) return serverError(error);
    return ok(data ?? []);
  } catch (err) {
    return serverError(err);
  }
}
