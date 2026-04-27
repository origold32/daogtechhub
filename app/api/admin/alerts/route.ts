import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const service = createServiceRoleClient();
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [{ data: events }, { data: authLogs }] = await Promise.all([
      service.from("analytics_events")
        .select("event_type")
        .or("event_type.eq.payment_verification_failed,event_type.eq.payment_webhook_rejected,event_type.eq.payment_webhook_duplicate,event_type.eq.payment_webhook_invalid_signature")
        .gte("created_at", lastHour),
      service.from("auth_logs")
        .select("id,user_id,event_type,ip_address,user_agent,created_at")
        .gte("created_at", lastHour)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const repeatedPaymentFailures = (events ?? []).filter((event) =>
      event.event_type === "payment_verification_failed" || event.event_type === "payment_webhook_rejected",
    ).length;
    const webhookDuplicates = (events ?? []).filter((event) => event.event_type === "payment_webhook_duplicate").length;
    const invalidSignatures = (events ?? []).filter((event) => event.event_type === "payment_webhook_invalid_signature").length;

    const recentAuthAlerts = (authLogs ?? []).filter((log) =>
      log.event_type?.toLowerCase().includes("fail") || log.event_type?.toLowerCase().includes("suspicious") || log.event_type?.toLowerCase().includes("locked"),
    );

    return ok({
      repeatedPaymentFailures,
      webhookDuplicates,
      invalidSignatures,
      recentAuthAlerts,
      liveAt: new Date().toISOString(),
    });
  } catch (err) {
    return serverError(err);
  }
}
