import { NextRequest, NextResponse } from "next/server";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";
import { manualPaymentSubmitSchema } from "@/lib/validators";
import { getClientIp, apiLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limit = apiLimiter.check(ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Retry after ${Math.ceil((limit.reset - Date.now()) / 1000)}s` },
        { status: 429 },
      );
    }

    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = manualPaymentSubmitSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors.map((err) => err.message).join(", "));

    const { orderId, note, proofUrl } = parsed.data;
    const service = createServiceRoleClient();

    const { data: order, error: orderError } = await service
      .from("orders")
      .select("id, user_id, status, payment_method")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return badRequest("Order not found");
    if (order.user_id !== user!.id) return badRequest("Order does not belong to this account");
    if (order.status !== "awaiting_payment") {
      return badRequest("Manual payment can only be submitted for awaiting_payment orders");
    }

    const { error: updateError } = await service.from("orders").update({
      status: "payment_submitted",
      manual_payment_note: note,
      manual_payment_proof_url: proofUrl ?? null,
      manual_payment_submitted_at: new Date().toISOString(),
    }).eq("id", orderId);

    if (updateError) return serverError(updateError);

    return ok({ orderId, status: "payment_submitted" }, "Manual payment information submitted. An admin will review your transfer.");
  } catch (err) {
    return serverError(err);
  }
}
