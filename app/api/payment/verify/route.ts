import { NextRequest, NextResponse } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";
import { paymentVerifySchema } from "@/lib/validators";
import { fetchPaystackTransaction, processPaystackTransaction } from "@/lib/payment-service";
import { logAnalyticsEvent } from "@/lib/analytics-service";
import { getClientIp, strictLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limit = strictLimiter.check(ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Retry after ${Math.ceil((limit.reset - Date.now()) / 1000)}s` },
        { status: 429 },
      );
    }

    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = paymentVerifySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors.map((err) => err.message).join(", "));

    await logAnalyticsEvent({
      eventType: "payment_verification_attempt",
      userId: user!.id,
      metadata: { reference: parsed.data.reference },
    });

    const tx = await fetchPaystackTransaction(parsed.data.reference);
    const result = await processPaystackTransaction(tx, { expectedUserId: user!.id, source: "verify" });

    await logAnalyticsEvent({
      eventType: result.status === "confirmed" ? "payment_verification_confirmed" : "payment_verification_failed",
      userId: user!.id,
      metadata: {
        orderId: result.orderId,
        reference: parsed.data.reference,
        status: result.status,
      },
    });

    if (result.status === "invalid" || result.status === "amount_mismatch" || result.status === "not_found") {
      return badRequest(result.message ?? "Payment verification failed");
    }

    return ok(result);
  } catch (err) {
    console.error("[payment/verify]", err);
    return serverError(err);
  }
}

