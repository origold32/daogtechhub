"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User, Package2, Heart, ShoppingCart, Settings, Shield, LogOut,
  ArrowLeft, Edit2, Check, X, ChevronRight,
  MapPin, Phone, Mail, Loader2, RefreshCw, Trash2,
  ShoppingBag, Clock, Truck, Star, Camera, AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useSignOut } from "@/hooks/useSignOut";
import AuthGuard from "@/components/providers/AuthGuard";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  id: string; firstName: string; lastName: string;
  email: string; phone?: string; avatar?: string; role?: string;
  addressLine1?: string; addressLine2?: string; city?: string;
  state?: string; country?: string; postalCode?: string;
}
interface Order {
  id: string; status: string; total_amount: number; created_at: string;
  order_items?: Array<{ product_name: string; product_image?: string; quantity: number; unit_price: number }>;
}
interface WishItem {
  id: string; product_id: string; product_name: string;
  product_image?: string; product_price?: number; product_category: string;
}

type Tab = "overview" | "orders" | "wishlist" | "cart" | "settings" | "security";

// ─── Fade transition ──────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.14 } },
};

// ─── Order status config ──────────────────────────────────────────────────────
const SC: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  delivered:  { label: "Delivered",  color: "text-green-400", bg: "bg-green-500/15",  icon: Check   },
  shipped:    { label: "Shipped",    color: "text-blue-400",  bg: "bg-blue-500/15",   icon: Truck   },
  processing: { label: "Processing", color: "text-amber-400", bg: "bg-amber-500/15",  icon: Clock   },
  pending:    { label: "Pending",    color: "text-[#d4a5ff]", bg: "bg-[#d4a5ff]/15",  icon: Package2},
  confirmed:  { label: "Confirmed",  color: "text-green-300", bg: "bg-green-500/10",  icon: Check   },
  cancelled:  { label: "Cancelled",  color: "text-red-400",   bg: "bg-red-500/15",    icon: X       },
};

// ─── Inline editable field ────────────────────────────────────────────────────
function EditableField({
  label, value, onChange, type = "text", icon, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: React.ReactNode; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className="group">
      <p className="text-[11px] text-white/35 font-medium tracking-widest uppercase mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl border border-[#d4a5ff]/40 bg-white/[0.05]">
            {icon && <span className="text-white/30 shrink-0">{icon}</span>}
            <input
              type={type}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/20"
              autoFocus
            />
          </div>
          <button onClick={() => { onChange(local); setEditing(false); }}
            className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-colors">
            <Check size={13} />
          </button>
          <button onClick={() => { setLocal(value); setEditing(false); }}
            className="w-8 h-8 rounded-lg bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between h-10 px-3 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:border-white/15 transition-colors cursor-default">
          <div className="flex items-center gap-2">
            {icon && <span className="text-white/25 shrink-0">{icon}</span>}
            <span className={cn("text-sm", value ? "text-white/80" : "text-white/25 italic")}>{value || placeholder || "Not set"}</span>
          </div>
          <button onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md text-white/30 hover:text-[#d4a5ff] transition-all flex items-center justify-center">
            <Edit2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}



// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5", className)}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ProfilePageInner() {
  const router                    = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { items, wishlist, removeFromWishlist, moveWishlistToCart, removeItem } = useCartStore();
  const { handleSignOut: signOut } = useSignOut();

  const [tab,         setTab]     = useState<Tab>("overview");
  const [profile,     setProfile] = useState<ProfileData | null>(null);
  const [orders,      setOrders]  = useState<Order[]>([]);
  const [dbWishlist,  setDbWishlist] = useState<WishItem[]>([]);
  const [loading,     setLoading] = useState(true);
  const [saving,      setSaving]  = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");

  // Pending edits
  const [edits, setEdits] = useState<Partial<ProfileData>>({});



  // ── Load profile + orders + server wishlist ──────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, ordRes, wishRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/orders?pageSize=20"),
        fetch("/api/wishlist"),
      ]);

      // BUG FIX #9: if profile returns 401 the session has expired.
      // Redirect to /auth so the user can sign back in, then return here.
      if (profRes.status === 401) {
        router.push("/auth?redirectTo=/profile");
        return;
      }

      const [profJson, ordJson, wishJson] = await Promise.all([
        profRes.json(), ordRes.json(), wishRes.json(),
      ]);

      if (profJson.success) {
        const d = profJson.data;
        setProfile(d);
        setEdits(d);
        // Sync ALL profile fields into the store, including address
        updateUser({
          id:           d.id,
          firstName:    d.firstName,
          lastName:     d.lastName,
          email:        d.email,
          phone:        d.phone        ?? undefined,
          avatar:       d.avatar       ?? undefined,
          addressLine1: d.addressLine1 ?? undefined,
          addressLine2: d.addressLine2 ?? undefined,
          city:         d.city         ?? undefined,
          state:        d.state        ?? undefined,
          country:      d.country      ?? undefined,
          postalCode:   d.postalCode   ?? undefined,
        });
      }

      if (ordJson.success)  setOrders(ordJson.data ?? []);
      if (wishJson.success) setDbWishlist(wishJson.data ?? []);
    } catch {
      // silently handled — UI shows empty states
    } finally {
      setLoading(false);
    }
  }, [updateUser, router]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Save profile edits ───────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res  = await fetch("/api/auth/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(edits),
      });
      if (res.status === 401) { router.push("/auth?redirectTo=/profile"); return; }
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const d = json.data;
      setProfile(d);
      // Sync ALL updated fields into the store
      updateUser({
        firstName:    d.firstName,
        lastName:     d.lastName,
        phone:        d.phone        ?? undefined,
        avatar:       d.avatar       ?? undefined,
        addressLine1: d.addressLine1 ?? undefined,
        addressLine2: d.addressLine2 ?? undefined,
        city:         d.city         ?? undefined,
        state:        d.state        ?? undefined,
        country:      d.country      ?? undefined,
        postalCode:   d.postalCode   ?? undefined,
      });
      toast.success("Profile saved!");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to save profile");
    } finally { setSaving(false); }
  };

  // ── Change password ──────────────────────────────────────────────────────


  // ── Remove from server wishlist ──────────────────────────────────────────
  const removeFromServerWishlist = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
      setDbWishlist(prev => prev.filter(w => w.product_id !== productId));
      removeFromWishlist(productId);
    } catch { toast.error("Failed to remove from wishlist"); }
  };

  // ── Handle sign out ──────────────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut(); // clears Supabase session, Zustand store, cart, then navigates to "/"
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out — please try again.");
    }
  };

  // ── Avatar initials ──────────────────────────────────────────────────────
  const initials = ((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "U";

  // ── Nav tabs ─────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "overview",  label: "Overview",  icon: User },
    { id: "orders",    label: "Orders",    icon: Package2,   count: orders.length },
    { id: "wishlist",  label: "Wishlist",  icon: Heart,      count: dbWishlist.length || wishlist.length },
    { id: "cart",      label: "Cart",      icon: ShoppingCart, count: items.length },
    { id: "settings",  label: "Settings",  icon: Settings },
    { id: "security",  label: "Security",  icon: Shield },
  ];

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter(o => o.status === orderFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0720" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#d4a5ff] animate-spin" />
          <p className="text-white/40 text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0f0720" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-white/[0.08] px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(15,7,32,0.95)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-white font-bold flex-1">My Profile</h1>
        <button onClick={loadAll}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* ── Hero card ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl p-6"
          style={{ background: "linear-gradient(135deg, rgba(212,165,255,0.18) 0%, rgba(120,60,200,0.12) 50%, rgba(15,7,32,0) 100%)", border: "1px solid rgba(212,165,255,0.2)" }}>
          {/* BG orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #d4a5ff 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-8 w-32 h-32 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #7b3fe4 0%, transparent 70%)" }} />

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#d4a5ff]/40 to-[#7b3fe4]/30 border border-[#d4a5ff]/30 flex items-center justify-center text-2xl font-black text-white">
                {user?.avatar
                  ? <Image src={user.avatar} alt="" fill className="object-cover rounded-2xl" sizes="72px" unoptimized />
                  : initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[#0f0720] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-white font-black text-xl leading-tight">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-white/50 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#d4a5ff]/15 text-[#d4a5ff] capitalize">
                  {user?.role ?? "Customer"}
                </span>
                {user?.role === "admin" && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Orders", value: orders.length, tab: "orders" as Tab },
              { label: "Wishlist", value: dbWishlist.length || wishlist.length, tab: "wishlist" as Tab },
              { label: "In Cart", value: items.length, tab: "cart" as Tab },
            ].map(({ label, value, tab: t }) => (
              <button key={label} onClick={() => setTab(t)}
                className="flex flex-col items-center py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] hover:border-[#d4a5ff]/30 transition-all group">
                <span className="text-xl font-black text-white group-hover:text-[#d4a5ff] transition-colors">{value}</span>
                <span className="text-[11px] text-white/40 mt-0.5">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab navigation ─────────────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide rounded-2xl bg-white/[0.03] border border-white/[0.06] p-1">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center",
                tab === id
                  ? "bg-[#d4a5ff] text-[#1a0b2e] shadow-sm"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}>
              <Icon size={13} />
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn("min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                  tab === id ? "bg-[#1a0b2e]/30 text-[#1a0b2e]" : "bg-white/10 text-white/60")}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* OVERVIEW ────────────────────────────────────────────────── */}
          {tab === "overview" && (
            <motion.div key="overview" {...fadeUp} className="space-y-4">
              <Card>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <User size={15} className="text-[#d4a5ff]" /> Account Details
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[11px] text-white/35 uppercase tracking-widest">First Name</p>
                      <p className="text-white/80 text-sm mt-0.5">{profile?.firstName || "—"}</p></div>
                    <div><p className="text-[11px] text-white/35 uppercase tracking-widest">Last Name</p>
                      <p className="text-white/80 text-sm mt-0.5">{profile?.lastName || "—"}</p></div>
                  </div>
                  <div><p className="text-[11px] text-white/35 uppercase tracking-widest">Email</p>
                    <p className="text-white/80 text-sm mt-0.5">{profile?.email || "—"}</p></div>
                  <div><p className="text-[11px] text-white/35 uppercase tracking-widest">Phone</p>
                    <p className="text-white/80 text-sm mt-0.5">{profile?.phone || "Not set"}</p></div>
                  {(profile?.city || profile?.state) && (
                    <div><p className="text-[11px] text-white/35 uppercase tracking-widest">Location</p>
                      <p className="text-white/80 text-sm mt-0.5">
                        {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ")}
                      </p></div>
                  )}
                </div>
                <button onClick={() => setTab("settings")}
                  className="mt-4 w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#d4a5ff]/30 transition-all text-sm text-white/50 hover:text-white/80">
                  <span>Edit profile details</span>
                  <ChevronRight size={14} />
                </button>
              </Card>

              {/* Recent orders preview */}
              {orders.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2"><Package2 size={15} className="text-[#d4a5ff]" /> Recent Orders</h3>
                    <button onClick={() => setTab("orders")} className="text-[11px] text-[#d4a5ff]/70 hover:text-[#d4a5ff] transition-colors">View all →</button>
                  </div>
                  <div className="space-y-2">
                    {orders.slice(0, 3).map(order => {
                      const s = SC[order.status] ?? SC.pending;
                      const Icon = s.icon;
                      return (
                        <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            {order.order_items?.[0]?.product_image
                              ? <Image src={order.order_items[0].product_image} alt="" fill className="object-cover rounded-lg" sizes="56px" unoptimized />
                              : <Package2 size={16} className="text-white/20" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs font-mono">#{order.id.slice(0,8).toUpperCase()}</p>
                            <p className="text-[#d4a5ff] text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                          </div>
                          <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1", s.bg, s.color)}>
                            <Icon size={10} />{s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* ORDERS ──────────────────────────────────────────────────── */}
          {tab === "orders" && (
            <motion.div key="orders" {...fadeUp} className="space-y-4">
              {/* Filter pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {["all","pending","processing","shipped","delivered","cancelled"].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className={cn("px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize",
                      orderFilter === f ? "bg-[#d4a5ff] text-[#1a0b2e]" : "bg-white/[0.04] text-white/40 hover:bg-white/[0.07] border border-white/[0.06]")}>
                    {f}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-14 h-14 text-white/10 mx-auto mb-4" />
                  <p className="text-white/60 font-semibold">No {orderFilter === "all" ? "" : orderFilter} orders yet</p>
                  <p className="text-white/30 text-sm mt-1 mb-5">Your order history will appear here</p>
                  <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] text-sm font-bold hover:bg-[#c990ff] transition-colors">
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order, i) => {
                    const s = SC[order.status] ?? SC.pending;
                    const Icon = s.icon;
                    return (
                      <motion.div key={order.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-[#d4a5ff]/25 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0">
                            {order.order_items?.[0]?.product_image
                              ? <Image src={order.order_items[0].product_image} alt="" fill className="object-cover" sizes="56px" unoptimized />
                              : <div className="w-full h-full flex items-center justify-center"><Package2 size={18} className="text-white/20" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[#d4a5ff] text-xs font-mono font-bold">#{order.id.slice(0,8).toUpperCase()}</span>
                              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", s.bg, s.color)}>
                                <Icon size={9} />{s.label}
                              </span>
                            </div>
                            <p className="text-white/70 text-sm truncate">
                              {order.order_items?.map(i => i.product_name).join(", ") || "Order items"}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-white/35 text-xs">
                                {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <span className="text-[#d4a5ff] font-bold text-sm">{formatCurrency(order.total_amount)}</span>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-white/20 shrink-0 mt-1" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* WISHLIST ────────────────────────────────────────────────── */}
          {tab === "wishlist" && (
            <motion.div key="wishlist" {...fadeUp} className="space-y-4">
              {/* Merge server wishlist + local Zustand wishlist */}
              {(() => {
                const combined = [
                  ...dbWishlist.map(w => ({
                    id: w.product_id, name: w.product_name, price: w.product_price ?? 0,
                    image: w.product_image ?? "", category: w.product_category, source: "server" as const,
                  })),
                  ...wishlist
                    .filter(w => !dbWishlist.some(d => d.product_id === w.id))
                    .map(w => ({ id: w.id, name: w.name, price: w.price, image: w.image, category: w.category, source: "local" as const })),
                ];

                if (combined.length === 0) return (
                  <div className="text-center py-16">
                    <Heart className="w-14 h-14 text-white/10 mx-auto mb-4" />
                    <p className="text-white/60 font-semibold">Your wishlist is empty</p>
                    <p className="text-white/30 text-sm mt-1 mb-5">Save items you love for later</p>
                    <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] text-sm font-bold hover:bg-[#c990ff] transition-colors">
                      Browse products
                    </Link>
                  </div>
                );

                return (
                  <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence>
                      {combined.map((item, i) => (
                        <motion.div key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
                          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden hover:border-[#d4a5ff]/25 transition-colors group">
                          <div className="relative aspect-square overflow-hidden bg-white/5">
                            {item.image
                              ? <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" unoptimized />
                              : <div className="w-full h-full flex items-center justify-center"><Heart size={24} className="text-white/10" /></div>}
                            <button
                              onClick={() => item.source === "server" ? removeFromServerWishlist(item.id) : removeFromWishlist(item.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/20 transition-all">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="p-3">
                            <p className="text-white/80 text-xs font-medium line-clamp-2 mb-1">{item.name}</p>
                            <p className="text-[#d4a5ff] font-black text-sm mb-2">{item.price ? formatCurrency(item.price) : "—"}</p>
                            <button onClick={() => { moveWishlistToCart(item.id); toast.success("Moved to cart!"); }}
                              className="w-full h-8 rounded-lg bg-[#d4a5ff]/15 text-[#d4a5ff] text-xs font-semibold hover:bg-[#d4a5ff]/25 transition-colors flex items-center justify-center gap-1">
                              <ShoppingCart size={11} /> Add to cart
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* CART ────────────────────────────────────────────────────── */}
          {tab === "cart" && (
            <motion.div key="cart" {...fadeUp} className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-14 h-14 text-white/10 mx-auto mb-4" />
                  <p className="text-white/60 font-semibold">Your cart is empty</p>
                  <p className="text-white/30 text-sm mt-1 mb-5">Add items to get started</p>
                  <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] text-sm font-bold hover:bg-[#c990ff] transition-colors">
                    Browse products
                  </Link>
                </div>
              ) : (
                <>
                  {items.map((item, i) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-[#d4a5ff]/20 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        {item.image
                          ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" unoptimized />
                          : <div className="w-full h-full flex items-center justify-center"><ShoppingCart size={16} className="text-white/20" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-white/35 text-xs capitalize mt-0.5">{item.category}</p>
                        <p className="text-[#d4a5ff] font-bold text-sm mt-0.5">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white/40 text-xs">×{item.quantity}</span>
                        <button onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Cart total + checkout button */}
                  <div className="p-4 rounded-2xl border border-[#d4a5ff]/20 bg-[#d4a5ff]/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/50 text-sm">Total ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span className="text-[#d4a5ff] font-black text-lg">
                        {formatCurrency(items.reduce((s, i) => s + i.price * i.quantity, 0))}
                      </span>
                    </div>
                    <Link href="/checkout"
                      className="block w-full py-3 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm text-center hover:bg-[#c990ff] active:scale-[0.99] transition-all">
                      Proceed to Checkout →
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* SETTINGS ────────────────────────────────────────────────── */}
          {tab === "settings" && (
            <motion.div key="settings" {...fadeUp} className="space-y-4">
              <Card>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <User size={15} className="text-[#d4a5ff]" /> Personal Details
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <EditableField label="First Name" placeholder="Ada"
                      value={edits.firstName ?? ""} onChange={(v) => setEdits(e => ({ ...e, firstName: v }))}
                      icon={<User size={12} />} />
                    <EditableField label="Last Name" placeholder="Okafor"
                      value={edits.lastName ?? ""} onChange={(v) => setEdits(e => ({ ...e, lastName: v }))} />
                  </div>
                  <EditableField label="Phone Number" placeholder="+234 800 000 0000" type="tel"
                    value={edits.phone ?? ""} onChange={(v) => setEdits(e => ({ ...e, phone: v }))}
                    icon={<Phone size={12} />} />
                  {/* Email is read-only (managed by Supabase Auth) */}
                  <div>
                    <p className="text-[11px] text-white/35 font-medium tracking-widest uppercase mb-1">Email Address</p>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                      <Mail size={12} className="text-white/25 shrink-0" />
                      <span className="text-white/60 text-sm flex-1">{profile?.email}</span>
                      <span className="text-[10px] text-white/25 bg-white/5 px-2 py-0.5 rounded-full">Read-only</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <MapPin size={15} className="text-[#d4a5ff]" /> Delivery Address
                </h3>
                <div className="space-y-3">
                  <EditableField label="Address Line 1" placeholder="123 Victoria Island"
                    value={edits.addressLine1 ?? ""} onChange={(v) => setEdits(e => ({ ...e, addressLine1: v }))}
                    icon={<MapPin size={12} />} />
                  <EditableField label="Address Line 2 (optional)" placeholder="Apt 4B, Block C"
                    value={edits.addressLine2 ?? ""} onChange={(v) => setEdits(e => ({ ...e, addressLine2: v }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <EditableField label="City" placeholder="Lagos"
                      value={edits.city ?? ""} onChange={(v) => setEdits(e => ({ ...e, city: v }))} />
                    <EditableField label="State" placeholder="Lagos State"
                      value={edits.state ?? ""} onChange={(v) => setEdits(e => ({ ...e, state: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <EditableField label="Country" placeholder="Nigeria"
                      value={edits.country ?? ""} onChange={(v) => setEdits(e => ({ ...e, country: v }))} />
                    <EditableField label="Postal Code" placeholder="100001"
                      value={edits.postalCode ?? ""} onChange={(v) => setEdits(e => ({ ...e, postalCode: v }))} />
                  </div>
                </div>
              </Card>

              <button onClick={handleSaveProfile} disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={15} className="animate-spin" />Saving changes…</> : "Save all changes"}
              </button>
            </motion.div>
          )}

          {/* SECURITY ────────────────────────────────────────────────── */}
          {tab === "security" && (
            <motion.div key="security" {...fadeUp} className="space-y-4">
              <Card>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Shield size={15} className="text-[#d4a5ff]" /> Authentication
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                    <p className="text-white/70 text-sm font-medium mb-1">Passwordless Sign-in</p>
                    <p className="text-white/35 text-xs leading-relaxed">
                      Your account uses secure OTP codes and magic links — no password needed.
                      Sign in anytime with your email or phone number.
                    </p>
                  </div>
                  {user?.email && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                      <Mail size={14} className="text-[#d4a5ff] shrink-0" />
                      <div>
                        <p className="text-white/50 text-[11px] uppercase tracking-widest font-medium">Verified email</p>
                        <p className="text-white/80 text-sm">{user.email}</p>
                      </div>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                      <Phone size={14} className="text-[#d4a5ff] shrink-0" />
                      <div>
                        <p className="text-white/50 text-[11px] uppercase tracking-widest font-medium">Verified phone</p>
                        <p className="text-white/80 text-sm">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <LogOut size={15} className="text-[#d4a5ff]" /> Sign Out
                </h3>
                <p className="text-white/40 text-xs mb-4 leading-relaxed">
                  You will be signed out of your account on this device. Your data and orders remain safe.
                </p>
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/10 hover:border-white/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign out of this device
                </button>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageInner />
    </AuthGuard>
  );
}
