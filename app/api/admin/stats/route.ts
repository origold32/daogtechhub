// app/api/admin/stats/route.ts
// GET → Dashboard statistics (admin only)

import { ok, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const supabase = auth.supabase;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Count queries — all head:true, TypeScript infers them uniformly
    const [
      { count: totalOrders },
      { count: ordersThisMonth },
      { count: totalUsers },
      { count: pendingSwaps },
      { count: totalGadgets },
      { count: totalJerseys },
      { count: totalCars },
      { count: totalEstates },
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("swap_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("gadgets").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("jerseys").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("cars").select("*", { count: "exact", head: true }).eq("is_available", true),
      supabase.from("real_estates").select("*", { count: "exact", head: true }).eq("is_available", true),
    ]);

    // .returns<T>() explicitly declares the row shape — the documented Supabase API
    // for cases where column-filtered selects cannot be inferred from the schema.
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_amount")
      .neq("status", "cancelled")
      .returns<Array<{ total_amount: number }>>();

    const { data: monthlyRevenueData } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", startOfMonth)
      .neq("status", "cancelled")
      .returns<Array<{ total_amount: number }>>();

    const totalRevenue = (revenueData ?? []).reduce(
      (sum, o) => sum + (o.total_amount ?? 0),
      0
    );
    const revenueThisMonth = (monthlyRevenueData ?? []).reduce(
      (sum, o) => sum + (o.total_amount ?? 0),
      0
    );

    // Recent orders with customer names
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, status, total_amount, created_at, user_id, profiles(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    return ok({
      totalOrders,
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
      recentOrders: recentOrders ?? [],
    });
  } catch (err) {
    return serverError(err);
  }
}