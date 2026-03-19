"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Tag, Package, ShoppingBag, Zap, Star, Check, Trash2, BellOff } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS = {
  offer: { Icon: Tag, color: "text-lilac", bg: "bg-lilac/10" },
  order: { Icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
  cart: { Icon: ShoppingBag, color: "text-amber-400", bg: "bg-amber-500/10" },
  loyalty: { Icon: Star, color: "text-purple-300", bg: "bg-purple-500/10" },
  system: { Icon: Zap, color: "text-green-400", bg: "bg-green-500/10" },
};

export function NotificationPanel() {
  const { notifications, unreadCount, isPanelOpen, setPanelOpen, markRead, markAllRead, removeNotification, clearAll } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    if (isPanelOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isPanelOpen, setPanelOpen]);

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[290] bg-black/40 backdrop-blur-sm" />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-12 right-4 w-[360px] z-[291] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            style={{ background: "#18082e" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-lilac" />
                <span className="text-soft-white font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-lilac text-deep-purple text-xs font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className="text-xs text-muted-lavender hover:text-lilac transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setPanelOpen(false)}
                  className="w-7 h-7 rounded-xl hover:bg-white/10 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-muted-lavender" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <BellOff className="w-10 h-10 text-muted-lavender/30 mx-auto mb-3" />
                  <p className="text-muted-lavender text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const { Icon, color, bg } = TYPE_ICONS[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group",
                        !notif.read && "bg-lilac/3"
                      )}
                      onClick={() => {
                        markRead(notif.id);
                        if (notif.actionUrl) { router.push(notif.actionUrl); setPanelOpen(false); }
                      }}
                    >
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", bg)}>
                        <Icon className={cn("w-4 h-4", color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm font-semibold line-clamp-1", notif.read ? "text-muted-lavender" : "text-soft-white")}>
                            {notif.title}
                          </p>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-lilac flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-lavender line-clamp-2 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-muted-lavender/50 mt-1">
                          {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                        className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <X className="w-3 h-3 text-muted-lavender hover:text-red-400" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-white/10">
                <button onClick={clearAll} className="text-xs text-muted-lavender/50 hover:text-red-400 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
