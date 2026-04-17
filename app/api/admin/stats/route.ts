export const dynamic = "force-dynamic";
// app/api/admin/stats/route.ts
// GET → Dashboard statistics (admin only)

import { ok, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { createServiceRoleClient } = await import("@/supabase/server");
    const service = createServiceRoleClient();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const recentWindow = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();

    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: confirmedOrders },
      { count: processingOrders },
      { count: shippedOrders },
      { count: deliveredOrders },
      { count: ordersThisMonth },
      { count: totalUsers },
      { count: pendingManualPayments },
      { count: pendingSwaps },
      { count: totalGadgets },
      { count: totalJerseys },
      { count: totalCars },
      { count: totalEstates },
      { count: unreadNotifications },
      { count: lowStockGadgets },
      { count: lowStockJerseys },
    ] = await Promise.all([
      service.from("orders").select("*", { count: "exact", head: true }),
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "processing"),
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "shipped"),
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered"),
      service.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
      service.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      service.from("orders").select("*", { count: "exact", head: true }).eq("status", "payment_submitted"),
      service.from("swap_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      service.from("gadgets").select("*", { count: "exact", head: true }).eq("is_active", true),
      service.from("jerseys").select("*", { count: "exact", head: true }).eq("is_active", true),
      service.from("cars").select("*", { count: "exact", head: true }).eq("is_available", true),
      service.from("real_estates").select("*", { count: "exact", head: true }).eq("is_available", true),
      service.from("notifications").select("*", { count: "exact", head: true }).eq("read", false),
      service.from("gadgets").select("stock", { head: true, count: "exact" }).lte("stock", 5),
      service.from("jerseys").select("stock", { head: true, count: "exact" }).lte("stock", 5),
    ]);

    const { data: revenueData } = await service
      .from("orders")
      .select("grand_total")
      .neq("status", "cancelled")
      .returns<Array<{ grand_total: number }>>();

    const { data: monthlyRevenueData } = await service
      .from("orders")
      .select("grand_total, created_at")
      .gte("created_at", recentWindow)
      .neq("status", "cancelled")
      .returns<Array<{ grand_total: number; created_at: string }>>();

    const { data: orderItems } = await service
      .from("order_items")
      .select("product_category")
      .returns<Array<{ product_category: string }>>();

    const totalRevenue = (revenueData ?? []).reduce(
      (sum, o) => sum + Number(o.grand_total ?? 0),
      0
    );
    const revenueThisMonth = (monthlyRevenueData ?? []).reduce(
      (sum, o) => sum + Number(o.grand_total ?? 0),
      0
    );

    const monthlyRevenue = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (6 - index), 1);
      const label = date.toLocaleString("en-US", { month: "short" });
      const monthTotal = (monthlyRevenueData ?? [])
        .filter((item) => new Date(item.created_at).getMonth() === date.getMonth() && new Date(item.created_at).getFullYear() === date.getFullYear())
        .reduce((sum, item) => sum + Number(item.grand_total ?? 0), 0);
      return { m: label, v: monthTotal / 1_000_000 };
    });

    const categoryCounts = (orderItems ?? []).reduce<Record<string, number>>((acc, item) => {
      const key = item.product_category ?? "other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const categoryBreakdown = Object.entries(categoryCounts).map(([label, count]) => ({ label, count }));

    const { data: recentOrders } = await service
      .from("orders")
      .select("id, status, grand_total, created_at, user_id, profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .limit(10);

    return ok({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      ordersThisMonth,
      totalUsers,
      pendingSwaps,
      totalRevenue,
      revenueThisMonth,
      inventory: {
        gadgets:     totalGadgets,
        jerseys:     totalJerseys,
        cars:        totalCars,
        realEstates: totalEstates,
      },
      lowStock: Number(lowStockGadgets ?? 0) + Number(lowStockJerseys ?? 0),
      unreadNotifications: Number(unreadNotifications ?? 0),
      pendingManualPayments: Number(pendingManualPayments ?? 0),
      recentOrders: recentOrders ?? [],
      monthlyRevenue,
      categoryBreakdown,
    });
  } catch (err) {
    return serverError(err);
  }
}
