"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchProducts, useFetchOne } from "@/hooks/useProducts";
import {
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp,
  ArrowRightLeft, MessageSquare, Settings, LogOut, Menu,
  Plus, Eye, Edit, Trash2, Check, Clock,
  ChevronUp, ChevronDown, Search, Bell, Sun, Moon, BarChart3,
  DollarSign, Boxes, Star, Upload, Image as ImageIcon, X,
  Shield, UserCheck, Zap, RefreshCw, Filter, Download,
  AlertTriangle, CheckCircle2, Wifi, Database, Lock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AdminSection = "overview" | "products" | "orders" | "analytics" | "support" | "swaps" | "enquiries" | "manual-payments" | "settings" | "users" | "auth-logs" | "marketing";
type UserRole = "admin" | "customer" | "vendor";

interface LiveUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

interface AdminOrder {
  id: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  subtotal_amount: number;
  discount_amount: number;
  delivery_fee: number;
  grand_total: number;
  currency: string;
  created_at: string;
  profiles: { first_name: string; last_name: string; email: string | null } | null;
  order_items: Array<{ product_name: string; quantity: number; unit_price: number }>;
}

interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  ordersThisMonth: number;
  totalUsers: number;
  pendingSwaps: number;
  pendingManualPayments: number;
  totalRevenue: number;
  revenueThisMonth: number;
  inventory: {
    gadgets: number;
    jerseys: number;
    cars: number;
    realEstates: number;
  };
  lowStock: number;
  unreadNotifications: number;
  recentOrders: Array<{ id: string; status: string; grand_total: number; created_at: string; profiles: { first_name: string; last_name: string; email: string | null } | null }>;
  monthlyRevenue: Array<{ m: string; v: number }>;
  categoryBreakdown: Array<{ label: string; count: number }>;
}

interface AnalyticsSummary {
  summary: {
    productViews: number;
    addToCart: number;
    checkoutStarted: number;
    paymentSuccess: number;
    paymentFailure: number;
    manualPaymentApproved: number;
    manualPaymentRejected: number;
    webhookDuplicates: number;
    invalidSignatures: number;
    conversionRate: number;
  };
  topProducts: Array<{ name: string; count: number; category: string | null }>;
  topCategories: Array<{ label: string; count: number }>;
  range: string;
  liveAt: string;
}

interface AdminAlerts {
  repeatedPaymentFailures: number;
  webhookDuplicates: number;
  invalidSignatures: number;
  recentAuthAlerts: Array<{ id: string; user_id: string | null; event_type: string; ip_address: string | null; user_agent: string | null; created_at: string }>;
  liveAt: string;
}

interface SupportSearchResult {
  orders: Array<{ id: string; user_id: string; status: string; payment_reference: string | null; grand_total: number; currency: string; created_at: string }>;
  receipts: Array<{ id: string; order_id: string; receipt_number: string; payment_reference: string | null; amount_paid: number; currency: string; customer_email: string | null; created_at: string }>;
  users: Array<{ id: string; email: string | null; first_name: string | null; last_name: string | null; role: UserRole; created_at: string }>;
}

const NAV_ITEMS = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "products" as const, label: "Products", icon: Package },
  { id: "orders" as const, label: "Orders", icon: ShoppingBag, badge: 3 },
  { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { id: "support" as const, label: "Support", icon: Search },
  { id: "swaps" as const, label: "Swaps", icon: ArrowRightLeft, badge: 2 },
  { id: "enquiries" as const, label: "Enquiries", icon: MessageSquare, badge: 5 },
  { id: "manual-payments" as const, label: "Manual Payments", icon: Upload },
  { id: "users" as const, label: "Users & Roles", icon: Users },
  { id: "auth-logs" as const, label: "Auth Logs", icon: Lock },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

const STATS = [
  { label: "Total Revenue", value: "₦84.5M", change: "+12.5%", up: true, icon: DollarSign, color: "from-purple-500/20 to-lilac/10" },
  { label: "Total Orders", value: "1,284", change: "+8.2%", up: true, icon: ShoppingBag, color: "from-blue-500/20 to-blue-400/10" },
  { label: "Products", value: "36", change: "+4", up: true, icon: Boxes, color: "from-green-500/20 to-green-400/10" },
  { label: "Customers", value: "3,891", change: "+15.3%", up: true, icon: Users, color: "from-amber-500/20 to-amber-400/10" },
];

const MONTHLY_REVENUE = [
  { m: "Sep", v: 28 }, { m: "Oct", v: 36 }, { m: "Nov", v: 52 },
  { m: "Dec", v: 89 }, { m: "Jan", v: 65 }, { m: "Feb", v: 80 }, { m: "Mar", v: 100 },
];

const CATEGORY_BREAKDOWN = [
  { label: "Gadgets", pct: 42, color: "bg-lilac" },
  { label: "Cars", pct: 30, color: "bg-blue-400" },
  { label: "Real Estate", pct: 20, color: "bg-green-400" },
  { label: "Jerseys", pct: 8, color: "bg-amber-400" },
];

const RECENT_ORDERS = [
  { id: "#ORD-001", customer: "Adebayo Johnson", product: "iPhone 15 Pro Max", amount: 1250000, status: "delivered", date: "2 hrs ago" },
  { id: "#ORD-002", customer: "Chioma Okafor", product: "Real Madrid Jersey", amount: 45000, status: "processing", date: "4 hrs ago" },
  { id: "#ORD-003", customer: "Emeka Nwosu", product: "Lexus RX 350", amount: 42000000, status: "pending", date: "6 hrs ago" },
  { id: "#ORD-004", customer: "Fatima Bello", product: "MacBook Pro M3", amount: 2800000, status: "shipped", date: "1 day ago" },
  { id: "#ORD-005", customer: "Bode Williams", product: "PS5 Console", amount: 550000, status: "confirmed", date: "2 days ago" },
];

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-lilac/20 text-lilac",
  customer: "bg-blue-500/20 text-blue-400",
  vendor: "bg-amber-500/20 text-amber-400",
};

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-green-500/20 text-green-400",
  processing: "bg-blue-500/20 text-blue-400",
  pending: "bg-amber-500/20 text-amber-400",
  shipped: "bg-purple-500/20 text-purple-400",
  confirmed: "bg-lilac/20 text-lilac",
  cancelled: "bg-red-500/20 text-red-400",
  approved: "bg-green-500/20 text-green-400",
  under_review: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  inactive: "bg-red-500/20 text-red-400",
};

interface AddProductForm {
  name: string; brand: string; category: string;
  price: string; description: string; condition: string;
}

export default function AdminPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [section, setSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState<AddProductForm>({
    name: "", brand: "", category: "gadget", price: "", description: "", condition: "Brand New",
  });
  const [searchQ, setSearchQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [staffUsers, setStaffUsers] = useState<LiveUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  const statsState = useFetchOne<AdminStats>("/api/admin/stats");
  const ordersState = useFetchOne<AdminOrder[]>("/api/admin/orders?pageSize=6");
  const manualPaymentsState = useFetchOne<AdminOrder[]>("/api/admin/manual-payments");
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d" | "90d">("7d");
  const [supportQuery, setSupportQuery] = useState("");
  const [supportResults, setSupportResults] = useState<SupportSearchResult | null>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  const analyticsState = useFetchOne<AnalyticsSummary>(`/api/admin/analytics?range=${analyticsRange}`);
  const alertsState = useFetchOne<AdminAlerts>("/api/admin/alerts");

  const overviewStats = statsState.data
    ? [
        {
          label: "Total Revenue",
          value: formatCurrency(statsState.data.totalRevenue),
          change: statsState.data.totalRevenue > 0
            ? `+${((statsState.data.revenueThisMonth / statsState.data.totalRevenue) * 100).toFixed(1)}%`
            : "–",
          up: true,
          icon: DollarSign,
          color: "from-purple-500/20 to-lilac/10",
        },
        {
          label: "Pending Orders",
          value: statsState.data.pendingOrders.toString(),
          change: `${statsState.data.ordersThisMonth} this month`,
          up: false,
          icon: Clock,
          color: "from-amber-500/20 to-amber-400/10",
        },
        {
          label: "Manual Reviews",
          value: statsState.data.pendingManualPayments.toString(),
          change: `${statsState.data.pendingManualPayments} awaiting approval`,
          up: statsState.data.pendingManualPayments === 0,
          icon: Upload,
          color: "from-blue-500/20 to-blue-400/10",
        },
        {
          label: "Confirmed Orders",
          value: statsState.data.confirmedOrders.toString(),
          change: `${statsState.data.confirmedOrders} confirmed`,
          up: true,
          icon: Check,
          color: "from-green-500/20 to-green-400/10",
        },
        {
          label: "Low Stock",
          value: statsState.data.lowStock.toString(),
          change: `${statsState.data.lowStock} items`,
          up: false,
          icon: AlertTriangle,
          color: "from-red-500/20 to-red-400/10",
        },
      ]
    : STATS;

  const revenueTrend = statsState.data?.monthlyRevenue ?? MONTHLY_REVENUE;
  const totalInventory = statsState.data
    ? statsState.data.inventory.gadgets + statsState.data.inventory.jerseys + statsState.data.inventory.cars + statsState.data.inventory.realEstates
    : 0;
  const categoryBreakdown = statsState.data
    ? [
        { label: "Gadgets", pct: totalInventory ? Math.round((statsState.data.inventory.gadgets / totalInventory) * 100) : 0, color: "bg-lilac" },
        { label: "Cars", pct: totalInventory ? Math.round((statsState.data.inventory.cars / totalInventory) * 100) : 0, color: "bg-blue-400" },
        { label: "Real Estate", pct: totalInventory ? Math.round((statsState.data.inventory.realEstates / totalInventory) * 100) : 0, color: "bg-green-400" },
        { label: "Jerseys", pct: totalInventory ? Math.round((statsState.data.inventory.jerseys / totalInventory) * 100) : 0, color: "bg-amber-400" },
      ]
    : CATEGORY_BREAKDOWN;

  const recentOrders = statsState.data?.recentOrders ?? [];
  const adminOrders = ordersState.data ?? [];
  const manualPaymentOrders = manualPaymentsState.data ?? [];
  const statsError = statsState.error;
  const ordersError = ordersState.error;
  const manualPaymentsError = manualPaymentsState.error;
  const isOrdersLoading = ordersState.loading;
  const isManualPaymentsLoading = manualPaymentsState.loading;

  // Fetch live users from Supabase
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (searchQ) params.set("search", searchQ);
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.success) setStaffUsers(json.data ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSupportSearch = async () => {
    const query = supportQuery.trim();
    if (!query) {
      setSupportError("Enter an order ID, reference, or email to search.");
      return;
    }
    setSupportLoading(true);
    setSupportError(null);
    try {
      const res = await fetch(`/api/admin/support/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Search failed");
      setSupportResults(json.data);
    } catch (err) {
      setSupportError((err as Error).message ?? "Failed to search");
      setSupportResults(null);
    } finally {
      setSupportLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/");
  }, [user, router]);

  useEffect(() => {
    if (section === "users") fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setRoleUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setStaffUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleManualPaymentAction = async (orderId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/manual-payments/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unable to update manual payment");
      toast.success(json.message ?? `Manual payment ${action}d successfully`);
      manualPaymentsState.mutate?.();
      ordersState.mutate?.();
      statsState.mutate?.();
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update manual payment");
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setStaffUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(`${name} has been removed`);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to delete user");
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) { toast.error("Name and price are required"); return; }
    try {
      const endpoint = productForm.category === "gadget" ? "/api/gadgets" : productForm.category === "jersey" ? "/api/jerseys" : productForm.category === "car" ? "/api/cars" : "/api/realestate";
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productForm.name, brand: productForm.brand, type: "accessory", price: parseFloat(productForm.price), description: productForm.description, condition: productForm.condition }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(`${productForm.name} added successfully! 🎉`);
      setShowAddProduct(false);
      setProductForm({ name: "", brand: "", category: "gadget", price: "", description: "", condition: "Brand New" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to add product");
    }
  };

  // Live product data from API
  const { data: gadgetsData } = useFetchProducts<{id:string;name:string;price:number;image_url:string;brand:string;condition:string}>(`/api/gadgets?pageSize=100`, section === "products");
  const { data: jerseysData } = useFetchProducts<{id:string;name:string;price:number;image_url:string;team:string}>(`/api/jerseys?pageSize=100`, section === "products");
  const { data: carsData } = useFetchProducts<{id:string;name:string;price:number;image_url:string;brand:string;condition:string}>(`/api/cars?pageSize=100`, section === "products");
  const { data: estatesData } = useFetchProducts<{id:string;name:string;price:number;image_url:string;type:string}>(`/api/realestate?pageSize=100`, section === "products");

  const allProducts = [
    ...gadgetsData.map((p) => ({ ...p, cat: "Gadget", img: p.image_url, image: p.image_url })),
    ...jerseysData.map((p) => ({ ...p, cat: "Jersey", img: p.image_url, image: p.image_url })),
    ...carsData.map((p) => ({ ...p, cat: "Car", img: p.image_url, image: p.image_url })),
    ...estatesData.map((p) => ({ ...p, cat: "Real Estate", img: p.image_url, image: p.image_url })),
  ].filter((p) => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="min-h-screen flex" style={{ background: "#0d0620" }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
            transition={{ type: "spring", damping: 30 }}
            className="w-60 flex-shrink-0 flex flex-col border-r border-white/10 z-50"
            style={{ background: "#13082b" }}
          >
            {/* Logo */}
            <div className="px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lilac to-purple-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-soft-white font-black text-sm">DAOG Admin</p>
                  <p className="text-muted-lavender text-xs">Control Panel</p>
                </div>
              </div>
            </div>

            {/* Role badge */}
            <div className="px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-lilac/10 border border-lilac/20">
                <Shield className="w-4 h-4 text-lilac" />
                <div>
                  <p className="text-soft-white text-xs font-bold">{user?.firstName || "Admin"}</p>
                  <p className="text-lilac text-xs capitalize">{user?.role || "admin"}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      section === item.id ? "bg-lilac text-deep-purple" : "text-muted-lavender hover:bg-white/5 hover:text-soft-white"
                    )}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {((item.id === "manual-payments" ? manualPaymentOrders.length : item.badge) ?? 0) > 0 && (
                      <span className={cn("ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold", section === item.id ? "bg-deep-purple/30 text-deep-purple" : "bg-red-500/20 text-red-400")}>
                        {item.id === "manual-payments" ? manualPaymentOrders.length : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* System status */}
            <div className="px-4 py-3 border-t border-white/10 space-y-1.5">
              {[
                { label: "Database", ok: true, icon: Database },
                { label: "API", ok: true, icon: Wifi },
                { label: "Auth", ok: true, icon: Lock },
              ].map(({ label, ok, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-muted-lavender/50" />
                  <span className="text-xs text-muted-lavender/70">{label}</span>
                  <div className={cn("w-1.5 h-1.5 rounded-full ml-auto", ok ? "bg-green-400" : "bg-red-400")} />
                </div>
              ))}
            </div>

            {/* Logout */}
            <div className="px-3 pb-4">
              <button onClick={() => { logout(); router.push("/"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0"
          style={{ background: "rgba(13,6,32,0.95)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
              <Menu className="w-4 h-4 text-muted-lavender" />
            </button>
            <h2 className="text-soft-white font-bold capitalize">{section}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.info("Refreshing data...")}
              className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-muted-lavender hover:text-soft-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-muted-lavender hover:text-soft-white transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-muted-lavender" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* OVERVIEW */}
              {section === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-black text-soft-white">Good morning, {user?.firstName || "Admin"} 👋</h1>
                      <p className="text-muted-lavender text-sm mt-1">Here&apos;s what&apos;s happening at DAOG Tech Hub</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-xs font-medium">Live</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {overviewStats.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          className={cn("p-5 rounded-2xl border border-white/10 bg-gradient-to-br", stat.color)}>
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="w-5 h-5 text-lilac" />
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stat.up ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                              {stat.change}
                            </span>
                          </div>
                          <p className="text-2xl font-black text-soft-white">{stat.value}</p>
                          <p className="text-muted-lavender text-sm mt-0.5">{stat.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Revenue chart + recent orders */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Chart */}
                    <div className="lg:col-span-2 p-5 rounded-2xl border border-white/10 bg-white/3">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-soft-white font-bold">Revenue Trend</h3>
                        <span className="text-xs text-muted-lavender bg-white/5 px-3 py-1 rounded-full">Last 7 months</span>
                      </div>
                      <div className="flex items-end gap-2 h-32">
                        {revenueTrend.map(({ m, v }, i) => (
                          <div key={m} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-xs text-muted-lavender opacity-0 group-hover:opacity-100 transition-opacity">
                              ₦{(v * 0.845).toFixed(0)}M
                            </span>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${v}%` }}
                              transition={{ duration: 0.8, delay: i * 0.08 }}
                              className="w-full rounded-t-lg bg-gradient-to-t from-lilac/40 to-lilac cursor-pointer hover:from-lilac/60 hover:to-lilac transition-colors"
                            />
                            <span className="text-xs text-muted-lavender">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category breakdown */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/3">
                      <h3 className="text-soft-white font-bold mb-5">Inventory by Category</h3>
                      <div className="space-y-4">
                        {categoryBreakdown.map(({ label, pct, color }, i) => (
                          <div key={label}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-muted-lavender text-sm">{label}</span>
                              <span className="text-soft-white text-sm font-bold">{pct}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.15 }}
                                className={cn("h-full rounded-full", color)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent orders */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-soft-white font-bold">Recent Orders</h3>
                      <button onClick={() => setSection("orders")} className="text-xs text-lilac hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-white/5">{["Order", "Customer", "Product", "Amount", "Status", "Time"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs text-muted-lavender uppercase tracking-wider">{h}</th>
                        ))}</tr></thead>
                        <tbody className="divide-y divide-white/5">
                          {recentOrders.slice(0, 4).map((o) => {
                            const label = o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}` : "Unknown";
                            const product = o.order_items?.[0]?.product_name ?? "—";
                            return (
                              <tr key={o.id} className="hover:bg-white/3 transition-colors">
                                <td className="px-5 py-3 text-lilac text-sm font-mono">{o.id}</td>
                                <td className="px-5 py-3 text-soft-white text-sm">{label}</td>
                                <td className="px-5 py-3 text-muted-lavender text-sm">{product}</td>
                                <td className="px-5 py-3 text-soft-white text-sm font-semibold">{formatCurrency(o.grand_total)}</td>
                                <td className="px-5 py-3"><span className={cn("text-xs px-2 py-1 rounded-full", STATUS_STYLES[o.status] ?? "bg-white/10 text-white/80")}>{o.status}</span></td>
                                <td className="px-5 py-3 text-muted-lavender text-xs">{new Date(o.created_at).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              {section === "products" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h1 className="text-2xl font-bold text-soft-white">Products</h1>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                        <Search className="w-4 h-4 text-muted-lavender" />
                        <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search..."
                          className="bg-transparent text-soft-white text-sm outline-none placeholder-muted-lavender/50 w-40" />
                      </div>
                      <Button onClick={() => setShowAddProduct(true)}
                        className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl gap-2 text-sm font-bold">
                        <Plus className="w-4 h-4" /> Add Product
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-white/10 bg-white/3">{["Product", "Category", "Price", "Condition", "Status", "Actions"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs text-muted-lavender uppercase tracking-wider">{h}</th>
                        ))}</tr></thead>
                        <tbody className="divide-y divide-white/5">
                          {allProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-white/3 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <Image src={p.img} alt={p.name} width={40} height={40} className="rounded-xl object-cover" unoptimized />
                                  <p className="text-soft-white text-sm font-medium line-clamp-1 max-w-[200px]">{p.name}</p>
                                </div>
                              </td>
                              <td className="px-5 py-3"><span className="text-xs bg-lilac/10 text-lilac px-2 py-1 rounded-full">{p.cat}</span></td>
                              <td className="px-5 py-3 text-lilac text-sm font-bold">{formatCurrency(p.price)}</td>
                              <td className="px-5 py-3 text-muted-lavender text-xs">{"condition" in p ? p.condition : "N/A"}</td>
                              <td className="px-5 py-3"><span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Active</span></td>
                              <td className="px-5 py-3">
                                <div className="flex gap-2">
                                  <button className="p-1.5 rounded-lg text-muted-lavender hover:text-lilac hover:bg-lilac/10 transition-colors"><Eye className="w-4 h-4" /></button>
                                  <button className="p-1.5 rounded-lg text-muted-lavender hover:text-soft-white hover:bg-white/10 transition-colors"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => toast.success("Product removed")}
                                    className="p-1.5 rounded-lg text-muted-lavender hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ANALYTICS */}
              {section === "analytics" && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-soft-white">Analytics</h1>
                      <p className="text-muted-lavender text-sm mt-1 max-w-2xl">
                        Live operational metrics from the analytics_events table and payment flows.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(["7d", "30d", "90d"] as const).map((range) => (
                        <button key={range} onClick={() => setAnalyticsRange(range)}
                          className={cn(
                            "text-xs px-3 py-2 rounded-xl border transition-colors",
                            analyticsRange === range
                              ? "bg-lilac text-deep-purple border-lilac"
                              : "bg-white/5 text-muted-lavender border-white/10 hover:bg-white/10",
                          )}
                        >
                          {range}
                        </button>
                      ))}
                      <button onClick={() => analyticsState.mutate?.()}
                        className="text-xs px-3 py-2 rounded-xl bg-white/5 text-muted-lavender border border-white/10 hover:bg-white/10 transition-colors">
                        Refresh
                      </button>
                    </div>
                  </div>

                  {alertsState.data && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                      <div className="font-semibold text-amber-100">Operational alerts</div>
                      <ul className="mt-2 space-y-1">
                        {alertsState.data.repeatedPaymentFailures > 2 && (
                          <li>Repeated payment failures in the last hour: {alertsState.data.repeatedPaymentFailures}</li>
                        )}
                        {alertsState.data.webhookDuplicates > 0 && (
                          <li>Webhook duplicates detected: {alertsState.data.webhookDuplicates}</li>
                        )}
                        {alertsState.data.invalidSignatures > 0 && (
                          <li>Invalid webhook signatures rejected: {alertsState.data.invalidSignatures}</li>
                        )}
                        {alertsState.data.recentAuthAlerts.length > 0 && (
                          <li>Suspicious auth activity detected: {alertsState.data.recentAuthAlerts.length} recent events</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {analyticsState.loading ? (
                      <div className="col-span-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-muted-lavender">Loading analytics…</div>
                    ) : analyticsState.error ? (
                      <div className="col-span-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-center text-red-100">{analyticsState.error}</div>
                    ) : (
                      [
                        { label: "Product views", value: analyticsState.data?.summary.productViews.toLocaleString() ?? "0" },
                        { label: "Add to cart", value: analyticsState.data?.summary.addToCart.toLocaleString() ?? "0" },
                        { label: "Checkout started", value: analyticsState.data?.summary.checkoutStarted.toLocaleString() ?? "0" },
                        { label: "Conversion rate", value: `${analyticsState.data?.summary.conversionRate.toFixed(1) ?? 0}%` },
                        { label: "Payment success", value: analyticsState.data?.summary.paymentSuccess.toLocaleString() ?? "0" },
                        { label: "Payment failures", value: analyticsState.data?.summary.paymentFailure.toLocaleString() ?? "0" },
                        { label: "Manual approved", value: analyticsState.data?.summary.manualPaymentApproved.toLocaleString() ?? "0" },
                        { label: "Manual rejected", value: analyticsState.data?.summary.manualPaymentRejected.toLocaleString() ?? "0" },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-muted-lavender text-xs mb-1">{label}</p>
                          <p className="text-2xl font-black text-soft-white">{value}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-soft-white font-bold">Top categories</h3>
                        <span className="text-xs text-muted-lavender">{analyticsState.data?.range ?? analyticsRange}</span>
                      </div>
                      <div className="space-y-3">
                        {!analyticsState.data?.topCategories.length ? (
                          <p className="text-muted-lavender text-sm">No category activity in this range.</p>
                        ) : analyticsState.data.topCategories.map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-2">
                            <p className="text-soft-white text-sm">{item.label}</p>
                            <span className="text-muted-lavender text-sm">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-soft-white font-bold">Top products</h3>
                        <span className="text-xs text-muted-lavender">live</span>
                      </div>
                      <div className="space-y-3">
                        {!analyticsState.data?.topProducts.length ? (
                          <p className="text-muted-lavender text-sm">Not enough product event data yet.</p>
                        ) : analyticsState.data.topProducts.slice(0, 8).map((product, index) => (
                          <div key={`${product.name}-${index}`} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-soft-white text-sm truncate">{product.name}</p>
                              <p className="text-muted-lavender text-xs">{product.category ?? "Unknown category"}</p>
                            </div>
                            <span className="text-lilac font-bold text-sm">{product.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUPPORT */}
              {section === "support" && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-soft-white">Support Search</h1>
                      <p className="text-muted-lavender text-sm mt-1">
                        Look up orders, payment references, receipts, and customer accounts from a single admin utility.
                      </p>
                    </div>
                    <div className="flex gap-2 items-center w-full lg:w-auto">
                      <input value={supportQuery} onChange={(e) => setSupportQuery(e.target.value)}
                        placeholder="Order ID, payment reference, or email"
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-soft-white outline-none placeholder-muted-lavender focus:border-lilac focus:ring-1 focus:ring-lilac/30"
                      />
                      <Button onClick={handleSupportSearch} className="bg-lilac text-deep-purple rounded-2xl text-sm font-bold">Search</Button>
                    </div>
                  </div>

                  {supportLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-muted-lavender">Searching…</div>
                  ) : supportError ? (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-100">{supportError}</div>
                  ) : supportResults ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <h3 className="text-soft-white font-bold mb-3">Orders</h3>
                        {!supportResults.orders.length ? (
                          <p className="text-muted-lavender text-sm">No orders found.</p>
                        ) : supportResults.orders.map((order) => (
                          <div key={order.id} className="rounded-2xl border border-white/10 p-3 mb-3 bg-white/5">
                            <p className="text-soft-white text-sm font-semibold">{order.id}</p>
                            <p className="text-muted-lavender text-xs">Status: {order.status}</p>
                            <p className="text-muted-lavender text-xs">Total: {formatCurrency(order.grand_total)} {order.currency}</p>
                            <p className="text-muted-lavender text-xs">Reference: {order.payment_reference ?? "—"}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <h3 className="text-soft-white font-bold mb-3">Receipts</h3>
                        {!supportResults.receipts.length ? (
                          <p className="text-muted-lavender text-sm">No receipts found.</p>
                        ) : supportResults.receipts.map((receipt) => (
                          <div key={receipt.id} className="rounded-2xl border border-white/10 p-3 mb-3 bg-white/5">
                            <p className="text-soft-white text-sm font-semibold">{receipt.receipt_number}</p>
                            <p className="text-muted-lavender text-xs">Amount: {formatCurrency(receipt.amount_paid)} {receipt.currency}</p>
                            <p className="text-muted-lavender text-xs">Reference: {receipt.payment_reference ?? "—"}</p>
                            <p className="text-muted-lavender text-xs">Email: {receipt.customer_email ?? "—"}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <h3 className="text-soft-white font-bold mb-3">Users</h3>
                        {!supportResults.users.length ? (
                          <p className="text-muted-lavender text-sm">No users found.</p>
                        ) : supportResults.users.map((user) => (
                          <div key={user.id} className="rounded-2xl border border-white/10 p-3 mb-3 bg-white/5">
                            <p className="text-soft-white text-sm font-semibold">{user.first_name ?? user.email ?? "Unknown"}</p>
                            <p className="text-muted-lavender text-xs">{user.email ?? "No email"}</p>
                            <p className="text-muted-lavender text-xs">Role: {user.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-muted-lavender">Enter a search phrase to find support records.</div>
                  )}
                </div>
              )}

              {/* USERS & ROLES */}
              {section === "users" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-soft-white">Users & Role Management</h1>
                    <Button onClick={() => toast.info("Invite sent!")}
                      className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl gap-2 text-sm font-bold">
                      <Plus className="w-4 h-4" /> Invite Staff
                    </Button>
                    <Button onClick={fetchUsers} variant="outline"
                      className="border-white/20 text-muted-lavender hover:bg-white/10 rounded-xl gap-2 text-sm">
                      <RefreshCw className={cn("w-4 h-4", usersLoading && "animate-spin")} /> Refresh
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(["all", "admin", "vendor", "customer"] as const).map((r) => (
                      <button key={r} onClick={() => setRoleFilter(r)}
                        className={cn("text-xs px-3 py-1.5 rounded-xl transition-all capitalize font-medium",
                          roleFilter === r ? "bg-lilac text-deep-purple" : "bg-white/5 text-muted-lavender hover:bg-white/10")}>
                        {r === "all" ? "All Users" : r}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {usersLoading ? (
                      <div className="text-center py-12 text-muted-lavender">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading users…</p>
                      </div>
                    ) : staffUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-10 h-10 text-muted-lavender mx-auto mb-3 opacity-40" />
                        <p className="text-muted-lavender text-sm">No users found</p>
                        <p className="text-muted-lavender text-xs mt-1 opacity-60">Users appear here after they sign up</p>
                      </div>
                    ) : staffUsers.map((u) => {
                      const fullName = `${u.first_name} ${u.last_name}`.trim() || u.email?.split("@")[0] || "Unknown";
                      const initials = (u.first_name?.[0] ?? u.email?.[0] ?? "?").toUpperCase();
                      const joinedDate = new Date(u.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
                      const isUpdating = roleUpdating === u.id;
                      return (
                        <motion.div key={u.id} layout className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/10">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lilac/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                            {u.avatar_url
                              ? <Image src={u.avatar_url} width={40} height={40} className="rounded-2xl object-cover" alt={fullName} unoptimized />
                              : <span className="text-lilac font-black text-sm">{initials}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-soft-white font-semibold text-sm truncate">{fullName}</p>
                            <p className="text-muted-lavender text-xs truncate">{u.email ?? u.phone ?? "No contact"} · Joined {joinedDate}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {isUpdating ? (
                              <span className="text-xs text-muted-lavender animate-pulse px-2">Saving…</span>
                            ) : (
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                disabled={isUpdating}
                                className={cn("text-xs px-2 py-1 rounded-xl border-0 outline-none cursor-pointer font-medium", ROLE_STYLES[u.role])}
                                style={{ background: "#1a0b2e" }}
                              >
                                <option value="customer" style={{ background: "#1a0b2e" }}>Customer</option>
                                <option value="vendor" style={{ background: "#1a0b2e" }}>Vendor</option>
                                <option value="admin" style={{ background: "#1a0b2e" }}>Admin</option>
                              </select>
                            )}
                            <button onClick={() => handleDeleteUser(u.id, fullName)}
                              className="p-1.5 rounded-lg text-muted-lavender hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Role permissions reference */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/3">
                    <h3 className="text-soft-white font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-lilac" /> Role Permissions
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr>{["Permission", "Admin", "Vendor", "Customer"].map((h) => (
                          <th key={h} className={cn("py-2 text-xs uppercase tracking-wider", h === "Permission" ? "text-left text-muted-lavender" : "text-center text-muted-lavender")}>{h}</th>
                        ))}</tr></thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            ["View dashboard", true, false, false],
                            ["Manage products", true, true, false],
                            ["Process orders", true, false, false],
                            ["Manage users & roles", true, false, false],
                            ["View analytics", true, false, false],
                            ["List cars / real estate", true, true, false],
                            ["Buy products", true, true, true],
                          ].map(([label, ...perms]) => (
                            <tr key={label as string}>
                              <td className="py-2 text-muted-lavender text-sm">{label as string}</td>
                              {perms.map((p, i) => (
                                <td key={i} className="py-2 text-center">
                                  {p ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-red-400/50 mx-auto" />}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {section === "orders" && (
                <div className="space-y-5">
                  <h1 className="text-2xl font-bold text-soft-white">Orders</h1>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Pending", count: orderCounts.pending, icon: Clock, color: "text-amber-400" },
                      { label: "Processing", count: orderCounts.processing, icon: Package, color: "text-blue-400" },
                      { label: "Shipped", count: orderCounts.shipped, icon: TrendingUp, color: "text-purple-400" },
                      { label: "Delivered", count: orderCounts.delivered, icon: Check, color: "text-green-400" },
                    ].map(({ label, count, icon: Icon, color }) => (
                      <div key={label} className="p-4 rounded-2xl bg-white/3 border border-white/10">
                        <Icon className={cn("w-5 h-5 mb-2", color)} />
                        <p className="text-2xl font-black text-soft-white">{count}</p>
                        <p className="text-muted-lavender text-sm">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    {ordersError && (
                      <div className="px-5 py-4 text-sm text-rose-200 bg-rose-500/10">Failed to load orders: {ordersError}</div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-white/10 bg-white/3">{["Order", "Customer", "Product", "Amount", "Status", "Time"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs text-muted-lavender uppercase">{h}</th>
                        ))}</tr></thead>
                        <tbody className="divide-y divide-white/5">
                          {isOrdersLoading ? (
                            <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-lavender">Loading orders…</td></tr>
                          ) : adminOrders.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-lavender">No recent orders available.</td></tr>
                          ) : adminOrders.map((o) => {
                            const customerName = o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}` : o.profiles?.email ?? "Unknown";
                            const productName = o.order_items?.[0]?.product_name ?? "—";
                            return (
                              <tr key={o.id} className="hover:bg-white/3 transition-colors">
                                <td className="px-5 py-3 text-lilac text-sm font-mono">{o.id}</td>
                                <td className="px-5 py-3 text-soft-white text-sm">{customerName}</td>
                                <td className="px-5 py-3 text-muted-lavender text-sm">{productName}</td>
                                <td className="px-5 py-3 text-soft-white text-sm font-semibold">{formatCurrency(o.grand_total)}</td>
                                <td className="px-5 py-3"><span className={cn("text-xs px-2 py-1 rounded-full", STATUS_STYLES[o.status] ?? "bg-white/10 text-white/80")}>{o.status}</span></td>
                                <td className="px-5 py-3 text-muted-lavender text-xs">{new Date(o.created_at).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* MANUAL PAYMENTS */}
              {section === "manual-payments" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold text-soft-white">Manual Payment Reviews</h1>
                      <p className="text-muted-lavender text-sm mt-1">Review submitted bank transfers and approve or reject payments safely.</p>
                    </div>
                    <div className="text-sm text-muted-lavender">{manualPaymentOrders.length} payment request(s) awaiting review</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    {manualPaymentsError && (
                      <div className="px-5 py-4 text-sm text-rose-200 bg-rose-500/10">Failed to load manual payments: {manualPaymentsError}</div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/3">
                            {[
                              "Order",
                              "Customer",
                              "Amount",
                              "Status",
                              "Submitted",
                              "Reference",
                              "Actions",
                            ].map((h) => (
                              <th key={h} className="px-5 py-3 text-left text-xs text-muted-lavender uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {isManualPaymentsLoading ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-6 text-center text-muted-lavender">Loading manual payments…</td>
                            </tr>
                          ) : manualPaymentOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-6 text-center text-muted-lavender">No manual payments pending review.</td>
                            </tr>
                          ) : manualPaymentOrders.map((order) => {
                            const customerName = order.profiles ? `${order.profiles.first_name} ${order.profiles.last_name}` : order.profiles?.email ?? "Unknown";
                            return (
                              <tr key={order.id} className="hover:bg-white/3 transition-colors">
                                <td className="px-5 py-3 text-lilac text-sm font-mono">{order.id}</td>
                                <td className="px-5 py-3 text-soft-white text-sm">{customerName}</td>
                                <td className="px-5 py-3 text-soft-white text-sm font-semibold">{formatCurrency(order.grand_total)}</td>
                                <td className="px-5 py-3"><span className={cn("text-xs px-2 py-1 rounded-full", STATUS_STYLES[order.status] ?? "bg-white/10 text-white/80")}>{order.status}</span></td>
                                <td className="px-5 py-3 text-muted-lavender text-sm">{order.manual_payment_submitted_at ? new Date(order.manual_payment_submitted_at).toLocaleString() : "-"}</td>
                                <td className="px-5 py-3 text-muted-lavender text-sm">{order.payment_reference ?? "-"}</td>
                                <td className="px-5 py-3 flex gap-2">
                                  <button onClick={() => handleManualPaymentAction(order.id, "approve")}
                                    className="text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-xl hover:bg-green-500/20 transition-colors">Approve</button>
                                  <button onClick={() => handleManualPaymentAction(order.id, "reject")}
                                    className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/20 transition-colors">Reject</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SWAPS */}
              {section === "swaps" && (
                <div className="space-y-5">
                  <h1 className="text-2xl font-bold text-soft-white">Swap Requests</h1>
                  <div className="space-y-3">
                    {[
                      { id: "SW-001", user: "Tunde Adeyemi", from: "iPhone 13 Pro", to: "iPhone 15 Pro Max", battery: "82%", status: "pending" },
                      { id: "SW-002", user: "Ngozi Eze", from: "Samsung S22", to: "Samsung S24 Ultra", battery: "91%", status: "under_review" },
                      { id: "SW-003", user: "Yemi Alade", from: "iPhone 12", to: "iPhone 14 Pro", battery: "78%", status: "approved" },
                    ].map((req) => (
                      <div key={req.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/10">
                        <div className="w-9 h-9 rounded-xl bg-lilac/20 flex items-center justify-center flex-shrink-0">
                          <ArrowRightLeft className="w-4 h-4 text-lilac" />
                        </div>
                        <div className="flex-1">
                          <p className="text-soft-white text-sm font-medium">{req.user}</p>
                          <p className="text-muted-lavender text-xs">{req.from} → {req.to} · Battery: {req.battery}</p>
                        </div>
                        <span className={cn("text-xs px-2 py-1 rounded-full", STATUS_STYLES[req.status])}>{req.status.replace("_", " ")}</span>
                        <div className="flex gap-2">
                          <button onClick={() => toast.success("Swap approved!")} className="text-xs text-green-400 hover:underline px-2 py-1 rounded-lg hover:bg-green-500/10">Approve</button>
                          <button onClick={() => toast.info("Swap rejected")} className="text-xs text-red-400 hover:underline px-2 py-1 rounded-lg hover:bg-red-500/10">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ENQUIRIES */}
              {section === "enquiries" && (
                <div className="space-y-5">
                  <h1 className="text-2xl font-bold text-soft-white">Customer Enquiries</h1>
                  <div className="space-y-3">
                    {[
                      { name: "David Okonkwo", email: "david@gmail.com", product: "BMW X5", msg: "Is the car still available? Can I schedule a viewing?", time: "5 min ago", unread: true },
                      { name: "Blessing Nwosu", email: "blessing@yahoo.com", product: "Lekki Duplex", msg: "What is the asking price? Is it negotiable?", time: "1 hr ago", unread: true },
                      { name: "Hakeem Alabi", email: "hakeem@gmail.com", product: "MacBook Pro", msg: "Do you have any with 64GB RAM?", time: "3 hrs ago", unread: false },
                      { name: "Sade Olu", email: "sade@gmail.com", product: "Galaxy S24 Ultra", msg: "Do you offer trade-ins?", time: "1 day ago", unread: false },
                    ].map((e, i) => (
                      <div key={i} className={cn("flex items-start justify-between gap-4 p-4 rounded-2xl border transition-colors", e.unread ? "border-lilac/20 bg-lilac/5" : "border-white/10 bg-white/3")}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-soft-white font-medium text-sm">{e.name}</p>
                            {e.unread && <span className="w-2 h-2 rounded-full bg-lilac flex-shrink-0" />}
                            <span className="text-muted-lavender/50 text-xs ml-auto">{e.time}</span>
                          </div>
                          <p className="text-muted-lavender text-xs mb-1">{e.email} · Re: {e.product}</p>
                          <p className="text-muted-lavender/80 text-sm">{e.msg}</p>
                        </div>
                        <button onClick={() => toast.info(`Opening reply to ${e.name}...`)}
                          className="text-xs text-lilac hover:bg-lilac/10 px-3 py-1.5 rounded-xl border border-lilac/30 flex-shrink-0 transition-colors">
                          Reply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AUTH LOGS */}
              {section === "auth-logs" && (
                <AuthLogsSection />
              )}

              {/* SETTINGS */}
              {section === "settings" && (
                <div className="space-y-5 max-w-2xl">
                  <h1 className="text-2xl font-bold text-soft-white">Settings</h1>
                  <div className="space-y-3">
                    {[
                      { label: "Store Name", value: "DAOG Tech Hub" },
                      { label: "Support Email", value: "daogstore@gmail.com" },
                      { label: "WhatsApp Number", value: "+234 800 000 0000" },
                      { label: "Currency", value: "NGN (₦)" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/10">
                        <div>
                          <p className="text-muted-lavender text-xs">{label}</p>
                          <p className="text-soft-white text-sm mt-0.5">{value}</p>
                        </div>
                        <button onClick={() => toast.info(`Edit ${label}`)}
                          className="text-xs text-lilac hover:bg-lilac/10 px-3 py-1.5 rounded-xl border border-lilac/30 transition-colors">Edit</button>
                      </div>
                    ))}
                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 text-sm font-medium">Supabase Connected</p>
                      </div>
                      <p className="text-muted-lavender text-xs mt-1 ml-6">Real-time sync active · Last synced: just now</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <p className="text-amber-400 text-sm font-medium">2FA Not Configured</p>
                      </div>
                      <p className="text-muted-lavender text-xs mt-1 ml-6">Enable two-factor authentication for enhanced security</p>
                      <button onClick={() => toast.info("2FA setup coming soon!")}
                        className="ml-6 mt-2 text-xs text-amber-400 hover:underline">Configure 2FA →</button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[400]" onClick={() => setShowAddProduct(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[401] p-4"
            >
              <div className="w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                style={{ background: "#18082e" }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="text-soft-white font-bold text-lg">Add New Product</h3>
                  <button onClick={() => setShowAddProduct(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-lavender" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Image upload */}
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-lilac/30 transition-colors cursor-pointer"
                    onClick={() => toast.info("Image upload requires Supabase Storage setup")}>
                    <ImageIcon className="w-8 h-8 text-muted-lavender/30 mx-auto mb-2" />
                    <p className="text-muted-lavender text-sm">Click to upload product image</p>
                    <p className="text-muted-lavender/50 text-xs mt-1">PNG, JPG up to 10MB</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Product Name", key: "name", placeholder: "iPhone 15 Pro Max" },
                      { label: "Brand", key: "brand", placeholder: "Apple" },
                      { label: "Price (₦)", key: "price", placeholder: "1250000" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key} className={key === "name" ? "col-span-2" : ""}>
                        <label className="block text-xs text-muted-lavender mb-1.5">{label}</label>
                        <input
                          value={productForm[key as keyof AddProductForm]}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-soft-white text-sm outline-none focus:border-lilac/50 placeholder-muted-lavender/40 transition-colors"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs text-muted-lavender mb-1.5">Category</label>
                      <select value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-soft-white text-sm outline-none focus:border-lilac/50">
                        {["gadget", "jersey", "car", "realestate"].map((c) => (
                          <option key={c} value={c} style={{ background: "#1a0b2e" }} className="capitalize">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-lavender mb-1.5">Condition</label>
                      <select value={productForm.condition} onChange={(e) => setProductForm((prev) => ({ ...prev, condition: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-soft-white text-sm outline-none focus:border-lilac/50">
                        {["Brand New", "Used - Like New", "Used - Good", "Refurbished"].map((c) => (
                          <option key={c} value={c} style={{ background: "#1a0b2e" }}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-lavender mb-1.5">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the product..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-soft-white text-sm outline-none focus:border-lilac/50 placeholder-muted-lavender/40 resize-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setShowAddProduct(false)} variant="outline"
                      className="flex-1 border-white/10 text-muted-lavender hover:bg-white/5 rounded-xl">Cancel</Button>
                    <Button onClick={handleAddProduct}
                      className="flex-1 bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl font-bold gap-2">
                      <Upload className="w-4 h-4" /> Add Product
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Auth Logs Section ────────────────────────────────────────────────────────
// Displays recent registrations, sign-ins, and sign-outs from Supabase profiles.
// In production, wire this to a dedicated auth_logs table (see PATCH.sql).
function AuthLogsSection() {
  const [users,   setUsers]   = useState<LiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"all" | "new" | "admin">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/admin/users?pageSize=50");
        const json = await res.json();
        if (json.success) setUsers(json.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived sign-up timeline from profiles.created_at
  const now = Date.now();
  const newThisWeek  = users.filter((u) => now - new Date(u.created_at).getTime() < 7  * 86400000).length;
  const newThisMonth = users.filter((u) => now - new Date(u.created_at).getTime() < 30 * 86400000).length;
  const admins       = users.filter((u) => u.role === "admin").length;
  const vendors      = users.filter((u) => u.role === "vendor").length;

  const filtered = users.filter((u) => {
    if (filter === "new")   return now - new Date(u.created_at).getTime() < 7 * 86400000;
    if (filter === "admin") return u.role === "admin" || u.role === "vendor";
    return true;
  });

  function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)   return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const EVENT_COLORS: Record<string, string> = {
    admin:    "bg-lilac/20 text-lilac",
    vendor:   "bg-amber-500/20 text-amber-400",
    customer: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-soft-white">Auth Logs</h1>
          <p className="text-muted-lavender text-sm mt-0.5">User registrations and account activity</p>
        </div>
        <div className="flex gap-2">
          {(["all", "new", "admin"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold transition-all", filter === f ? "bg-lilac text-deep-purple" : "bg-white/5 text-muted-lavender hover:bg-white/10 border border-white/10")}>
              {f === "all" ? "All users" : f === "new" ? "New this week" : "Staff & Admins"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total users",      value: users.length.toString(),  icon: Users,       color: "text-lilac" },
          { label: "New this week",    value: newThisWeek.toString(),   icon: UserCheck,   color: "text-green-400" },
          { label: "New this month",   value: newThisMonth.toString(),  icon: TrendingUp,  color: "text-blue-400" },
          { label: "Staff & Admins",   value: (admins + vendors).toString(), icon: Shield, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-2xl bg-white/3 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-muted-lavender text-xs">{label}</p>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <p className="text-2xl font-black text-soft-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Role distribution bar */}
      <div className="p-5 rounded-2xl bg-white/3 border border-white/10">
        <h3 className="text-soft-white font-bold mb-3">Role Distribution</h3>
        {users.length > 0 && (
          <div className="space-y-3">
            {[
              { label: "Customers", count: users.filter((u) => u.role === "customer").length, color: "bg-blue-400" },
              { label: "Admins",    count: admins,  color: "bg-lilac" },
              { label: "Vendors",   count: vendors, color: "bg-amber-400" },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-muted-lavender text-sm">{label}</span>
                  <span className="text-soft-white text-sm font-bold">{count} ({Math.round(count / users.length * 100)}%)</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / users.length) * 100}%` }}
                    transition={{ duration: 1.2 }}
                    className={cn("h-full rounded-full", color)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User log table */}
      <div className="rounded-2xl bg-white/3 border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-soft-white font-bold">Recent Registrations</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-lavender">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-lavender text-sm">No entries found</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-lilac/20 border border-lilac/30 flex items-center justify-center text-lilac font-bold text-sm shrink-0">
                  {(u.first_name?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-soft-white text-sm font-medium truncate">
                    {u.first_name} {u.last_name}
                  </p>
                  <p className="text-muted-lavender text-xs truncate">{u.email ?? u.phone ?? "—"}</p>
                </div>
                <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0", EVENT_COLORS[u.role ?? "customer"])}>
                  {u.role ?? "customer"}
                </span>
                <span className="text-muted-lavender/60 text-xs shrink-0 hidden sm:block">
                  {timeAgo(u.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 text-xs font-semibold">Full auth event logging</p>
          <p className="text-muted-lavender text-xs mt-0.5">
            To track individual sign-in, sign-out, and failed login events, run the PATCH.sql script
            to create the <code className="text-soft-white">auth_logs</code> table. Events are then
            recorded automatically via Supabase triggers.
          </p>
        </div>
      </div>
    </div>
  );
}
