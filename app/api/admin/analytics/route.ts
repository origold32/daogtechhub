import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_RANGES = ["7d", "30d", "90d"] as const;
type AnalyticsMetadata = Record<string, string | number | boolean | null | undefined>;

function parseRange(value: string | null) {
  if (!value) return "7d";
  return ALLOWED_RANGES.includes(value as typeof ALLOWED_RANGES[number]) ? value as typeof ALLOWED_RANGES[number] : "7d";
}

function buildRangeDates(range: typeof ALLOWED_RANGES[number]) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  if (range === "30d") start.setDate(start.getDate() - 30);
  else if (range === "90d") start.setDate(start.getDate() - 90);
  else start.setDate(start.getDate() - 7);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const range = parseRange(searchParams.get("range"));
    const { start, end } = buildRangeDates(range);

    const service = createServiceRoleClient();
    const { data: events, error } = await service
      .from("analytics_events")
      .select("event_type,product_id,product_category,metadata,created_at")
      .gte("created_at", start)
      .lte("created_at", end);

    if (error) {
      console.error("[admin/analytics]", error);
      return serverError(error);
    }

    const summary = {
      productViews: 0,
      addToCart: 0,
      checkoutStarted: 0,
      paymentSuccess: 0,
      paymentFailure: 0,
      manualPaymentApproved: 0,
      manualPaymentRejected: 0,
      webhookDuplicates: 0,
      invalidSignatures: 0,
      conversionRate: 0,
      totalEvents: 0,
    };

    const productMap = new Map<string, { name: string; category: string | null; count: number }>();
    const categoryMap = new Map<string, number>();

    (events ?? []).forEach((event) => {
      summary.totalEvents += 1;
      const eventType = event.event_type;
      if (eventType === "product_view") summary.productViews += 1;
      if (eventType === "add_to_cart") summary.addToCart += 1;
      if (eventType === "checkout_started") summary.checkoutStarted += 1;
      if (eventType === "payment_webhook_confirmed" || eventType === "payment_verification_confirmed") summary.paymentSuccess += 1;
      if (eventType === "payment_webhook_rejected" || eventType === "payment_verification_failed") summary.paymentFailure += 1;
      if (eventType === "manual_payment_approved") summary.manualPaymentApproved += 1;
      if (eventType === "manual_payment_rejected") summary.manualPaymentRejected += 1;
      if (eventType === "payment_webhook_duplicate") summary.webhookDuplicates += 1;
      if (eventType === "payment_webhook_invalid_signature") summary.invalidSignatures += 1;

      const metadata =
        event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
          ? (event.metadata as AnalyticsMetadata)
          : null;

      const categoryValue = event.product_category ?? metadata?.productCategory ?? metadata?.product_category ?? null;
      const category = typeof categoryValue === "string" ? categoryValue : null;
      if (category) {
        categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
      }

      const productIdValue = event.product_id ?? metadata?.productId ?? metadata?.product_id ?? "unknown";
      const productId = typeof productIdValue === "string" ? productIdValue : String(productIdValue);
      const productName = typeof metadata?.productName === "string"
        ? metadata.productName
        : typeof metadata?.product_name === "string"
          ? metadata.product_name
          : productId;
      const key = `${productId}::${productName}`;
      const bucket = productMap.get(key) ?? { name: productName, category, count: 0 };
      bucket.count += 1;
      productMap.set(key, bucket);
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({ name: item.name, count: item.count, category: item.category }));

    const topCategories = Array.from(categoryMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    summary.conversionRate = summary.checkoutStarted > 0
      ? Number(((summary.paymentSuccess / summary.checkoutStarted) * 100).toFixed(1))
      : 0;

    return ok({ summary, topProducts, topCategories, range, liveAt: new Date().toISOString() });
  } catch (err) {
    return serverError(err);
  }
}
