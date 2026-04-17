import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) return badRequest("Search query is required");

    const service = createServiceRoleClient();

    const [ordersRes, receiptsRes, usersRes] = await Promise.all([
      service
        .from("orders")
        .select("id,user_id,status,payment_reference,grand_total,currency,created_at")
        .or(`id.eq.${q},payment_reference.eq.${q}`)
        .limit(10),
      service
        .from("receipts")
        .select("id,order_id,receipt_number,payment_reference,amount_paid,currency,customer_email,created_at")
        .or(`receipt_number.eq.${q},payment_reference.eq.${q}`)
        .limit(10),
      service
        .from("profiles")
        .select("id,email,first_name,last_name,role,created_at")
        .ilike("email", `%${q}%")
        .limit(10),
    ]);

    return ok({
      orders: ordersRes.data ?? [],
      receipts: receiptsRes.data ?? [],
      users: usersRes.data ?? [],
    });
  } catch (err) {
    return serverError(err);
  }
}
