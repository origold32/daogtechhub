"use client";
import { useState, useEffect } from "react";
import { Tag, Package, ShoppingBag, Bell, X } from "lucide-react";

const PROMOS = [
  { icon: Tag,         color: "#d4a5ff", msg: "🔥 Flash Sale: 15% off all gadgets today only!" },
  { icon: Package,     color: "#4ade80", msg: "📦 Free delivery on orders above ₦100,000" },
  { icon: ShoppingBag, color: "#fbbf24", msg: "⭐ New arrivals: Latest iPhones & MacBooks in stock" },
  { icon: Bell,        color: "#60a5fa", msg: "💎 New premium listings added — check them out!" },
];

// Height of the banner — used by navbars to set their top offset
export const BANNER_HEIGHT = 36; // px  (h-9)

export function NotificationBanner() {
  const [idx,       setIdx]       = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    if (dismissed) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((p) => (p + 1) % PROMOS.length); setVisible(true); }, 300);
    }, 5000);
    return () => clearInterval(t);
  }, [dismissed]);

  if (dismissed) return null;

  const p    = PROMOS[idx];
  const Icon = p.icon;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[500] h-9 flex items-center justify-center gap-2 text-xs font-medium select-none"
      style={{
        background: "linear-gradient(90deg, #2e1a47, #1a0b2e, #2e1a47)",
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-4px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.color }} />
      <span className="text-soft-white truncate max-w-[calc(100vw-80px)]">{p.msg}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 text-muted-lavender hover:text-soft-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}