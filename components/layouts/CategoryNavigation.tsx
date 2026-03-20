"use client";

import { useRouter } from "next/navigation";
import {
  ShoppingCart, User, ChevronDown, Package2,
  Heart, Mail, Ticket, Sun, Moon, Search, Bell, LogOut, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartAvatar } from "@/components/reusables/smart-avatar";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { useSignOut } from "@/hooks/useSignOut";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GoBack from "../reusables/go-back";
import AppLogo from "../reusables/app-logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useNotificationStore } from "@/store/notificationStore";
import { useScrollNav } from "@/hooks/useScrollNav";

const SmartSearch = dynamic(
  () => import("@/components/product/SmartSearch").then((m) => ({ default: m.SmartSearch })),
  { ssr: false, loading: () => <div className="h-9 flex-1 rounded-xl bg-white/5 animate-pulse" /> }
);
const NotificationPanel = dynamic(
  () => import("@/components/notifications/NotificationPanel").then((m) => ({ default: m.NotificationPanel })),
  { ssr: false }
);

interface CategoryNavigationProps {
  category: "gadgets" | "jerseys" | "cars" | "realestate";
}

export function CategoryNavigation({ category }: CategoryNavigationProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { getTotalItems, setCartOpen, lastAddedId } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, setPanelOpen } = useNotificationStore();
  const { handleSignOut, loading: signingOut } = useSignOut();
  const [showSearch, setShowSearch] = useState(false);
  const navVisible = useScrollNav();

  // Only link to pages that actually exist
  const dropdownItems = [
    { label: "My Profile", icon: User,     href: "/profile" },
    { label: "Orders",     icon: Package2, href: "/orders" },
    { label: "Wishlist",   icon: Heart,    href: "/wishlist" },
    { label: "Inbox",      icon: Mail,     href: "/inbox" },
    { label: "Vouchers",   icon: Ticket,   href: "/vouchers" },
  ];

  const cartCount = getTotalItems();

  const CATEGORY_LABELS: Record<string, string> = {
    gadgets:    "Gadgets",
    jerseys:    "Jerseys",
    cars:       "Cars",
    realestate: "Real Estate",
  };

  return (
    <>
      <nav
        className={`fixed top-9 left-0 right-0 z-[100] px-4 lg:px-8 py-3 flex items-center justify-between border-b border-lilac/15 transition-transform duration-300 ease-in-out ${navVisible ? "translate-y-0" : "-translate-y-full"}`}
        style={{ background: "rgba(26,11,46,0.95)", backdropFilter: "blur(20px)" }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <GoBack variant="nav" link="/" />
          <div className="h-5 w-px bg-lilac/40" />
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <AppLogo width={36} height={36} />
            <span className="hidden sm:inline text-base font-bold text-lilac">
              {CATEGORY_LABELS[category]}
            </span>
          </div>
        </div>

        {/* Center search (desktop) */}
        <div className="hidden lg:block flex-1 max-w-md mx-6">
          <SmartSearch />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <button
            onClick={() => setShowSearch((s) => !s)}
            className="lg:hidden p-2 text-muted-lavender hover:text-lilac transition-colors rounded-xl hover:bg-white/5"
          >
            <Search className="w-4 h-4" />
          </button>



          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-lavender hover:text-lilac transition-colors rounded-xl hover:bg-white/5"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setPanelOpen(true)}
            className="relative p-2 text-muted-lavender hover:text-lilac transition-colors rounded-xl hover:bg-white/5"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-lilac hover:text-soft-white transition-colors rounded-xl hover:bg-lilac/10"
          >
            <motion.div
              animate={lastAddedId ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-lilac text-deep-purple text-xs font-black rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Auth */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1 rounded-2xl border border-white/10 cursor-pointer hover:border-lilac/30 transition-colors">
                  <SmartAvatar
                    data={user}
                    getKey={(u) => u.id}
                    getName={(u) => `${u.firstName} ${u.lastName}`}
                    getInitialsName={(u) => `${u.firstName} ${u.lastName}`}
                    responsiveName
                    avatarSizeClassName="w-6 h-6"
                    fallbackTextClassName="text-xs"
                  />
                  <ChevronDown className="shrink-0" size={12} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card-small z-[200] min-w-[180px]">
                {dropdownItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="text-lilac cursor-pointer flex items-center gap-3 data-[highlighted]:bg-lilac/20"
                  >
                    <item.icon size={14} />
                    <p className="text-sm">{item.label}</p>
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-white/10 my-1" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-red-400 cursor-pointer flex items-center gap-3 data-[highlighted]:bg-red-400/10"
                >
                  {signingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                  <p className="text-sm">Sign out</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/auth?mode=signin&redirectTo=/profile")}
                variant="outline" size="sm"
                className="border-lilac/40 text-lilac hover:bg-lilac hover:text-deep-purple rounded-xl text-xs"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/auth?mode=signup&redirectTo=/profile")}
                size="sm"
                className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl text-xs px-3"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Panels */}
      <NotificationPanel />

      {/* Mobile search dropdown */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-[92px] left-0 right-0 z-[99] px-4 py-3 border-b border-lilac/10"
            style={{ background: "rgba(26,11,46,0.98)" }}
          >
            <SmartSearch />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}