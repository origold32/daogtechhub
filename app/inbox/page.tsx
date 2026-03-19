// app/inbox/page.tsx — Inbox connected to live Supabase notifications
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bell, Package2, Tag,
  ShoppingCart, Megaphone, Loader2, Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AuthGuard from "@/components/providers/AuthGuard";

interface Notification {
  id: string;
  type: "order" | "offer" | "system" | "abandoned_cart";
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

const TYPE_CFG: Record<string, { icon: any; color: string; bg: string }> = {
  order:          { icon: Package2,     color: "text-blue-400",   bg: "bg-blue-500/15" },
  offer:          { icon: Tag,          color: "text-green-400",  bg: "bg-green-500/15" },
  abandoned_cart: { icon: ShoppingCart, color: "text-amber-400",  bg: "bg-amber-500/15" },
  system:         { icon: Megaphone,    color: "text-[#d4a5ff]",  bg: "bg-[#d4a5ff]/15" },
};

function InboxInner() {
  const router = useRouter();
  const [items,   setItems]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setItems(j.data ?? []);
        else setError(j.error ?? "Failed to load");
      })
      .catch(() => setError("Network error — please try again"))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    setMarking(id);
    await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH", credentials: "include",
    }).catch(() => {});
    setItems((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
    setMarking(null);
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH", credentials: "include" }).catch(() => {});
    setItems((n) => n.map((x) => ({ ...x, read: true })));
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      {/* Header */}
      <div
        className="border-b border-white/10 px-4 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: "rgba(26,11,46,0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-lavender hover:text-lilac transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-lilac" />
            <h1 className="text-soft-white font-bold">Inbox</h1>
            {unread > 0 && (
              <span className="text-xs bg-lilac text-deep-purple font-black px-2 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-lilac/60 hover:text-lilac transition-colors flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-6 h-6 text-lilac/40 animate-spin" />
            <p className="text-white/30 text-sm">Loading notifications…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-red-400 text-sm mb-2">Could not load notifications</p>
            <p className="text-white/30 text-xs">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <Bell className="w-9 h-9 text-white/20" strokeWidth={1.5} />
            </div>
            <h3 className="text-white/70 font-semibold mb-2">Your inbox is empty</h3>
            <p className="text-white/35 text-sm max-w-xs mx-auto">
              Order updates, special offers, and account alerts will appear here.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {items.map((n, i) => {
                const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.system;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                      n.read
                        ? "border-white/[0.06] bg-white/[0.02] opacity-60 cursor-default"
                        : "border-white/15 bg-white/[0.05] hover:border-lilac/30 hover:bg-white/[0.07] cursor-pointer"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      {marking === n.id
                        ? <Loader2 size={15} className="animate-spin text-white/50" />
                        : <Icon size={15} className={cfg.color} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-snug ${n.read ? "text-white/50" : "text-white"}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-lilac shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-white/25 text-[11px] mt-1.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default function InboxPage() {
  return <AuthGuard><InboxInner /></AuthGuard>;
}
