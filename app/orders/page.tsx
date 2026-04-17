"use client";
import { useState } from "react";
import Image from "next/image";
import AuthGuard from "@/components/providers/AuthGuard";
import { motion } from "framer-motion";
import { Package2, Clock, Check, Truck, ArrowLeft, ShoppingBag, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useFetchProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: Array<{ product_name: string; product_image: string }>;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  awaiting_payment:  { color: "text-amber-300", bg: "bg-amber-500/15", icon: Clock,    label: "Awaiting Payment" },
  payment_submitted: { color: "text-blue-300",  bg: "bg-blue-500/15",  icon: Clock,    label: "Payment Submitted" },
  delivered:         { color: "text-green-400",  bg: "bg-green-500/20",  icon: Check,    label: "Delivered" },
  shipped:           { color: "text-blue-400",   bg: "bg-blue-500/20",   icon: Truck,    label: "Shipped" },
  processing:        { color: "text-amber-400",  bg: "bg-amber-500/20",  icon: Clock,    label: "Processing" },
  pending:           { color: "text-lilac",      bg: "bg-lilac/20",      icon: Package2, label: "Pending" },
  confirmed:         { color: "text-green-300",  bg: "bg-green-500/15",  icon: Check,    label: "Confirmed" },
  cancelled:         { color: "text-red-400",    bg: "bg-red-500/20",    icon: Package2, label: "Cancelled" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function OrdersPageInner() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const { data: orders, loading, error } = useFetchProducts<Order>(
    filter === "all" ? "/api/orders?pageSize=50" : `/api/orders?pageSize=50&status=${filter}`
  );

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      <div className="border-b border-white/10 px-4 py-4 flex items-center gap-4" style={{ background: "rgba(26,11,46,0.95)" }}>
        <button onClick={() => router.back()} className="text-muted-lavender hover:text-lilac transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-soft-white font-bold flex items-center gap-2"><Package2 className="w-5 h-5 text-lilac" /> My Orders</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {["all", "pending", "awaiting_payment", "payment_submitted", "processing", "shipped", "delivered"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize", filter === f ? "bg-lilac text-deep-purple" : "bg-white/5 text-muted-lavender hover:bg-white/10")}>
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-2">Failed to load orders</p>
            <p className="text-muted-lavender text-sm">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-lilac/20 mx-auto mb-4" />
            <p className="text-soft-white font-semibold mb-2">No orders yet</p>
            <p className="text-muted-lavender text-sm mb-6">Your order history will appear here</p>
            <Button onClick={() => router.push("/")} className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-2xl">Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const Icon = sc.icon;
              const itemNames = order.order_items?.map((oi) => oi.product_name).join(", ") ?? "Order items";
              const img = order.order_items?.[0]?.product_image;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-lilac/30 transition-colors cursor-pointer">
                  {img ? <Image src={img} alt="" width={56} height={56} className="rounded-xl object-cover flex-shrink-0" unoptimized /> :
                    <div className="w-14 h-14 rounded-xl bg-lilac/10 flex items-center justify-center flex-shrink-0"><Package2 className="w-6 h-6 text-lilac/40" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lilac text-xs font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", sc.bg, sc.color)}>
                        <Icon className="w-3 h-3" />{sc.label}
                      </span>
                    </div>
                    <p className="text-soft-white text-sm font-medium line-clamp-1">{itemNames}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-muted-lavender text-xs">{formatDate(order.created_at)}</p>
                      <p className="text-lilac text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-lavender flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersPageInner />
    </AuthGuard>
  );
}
