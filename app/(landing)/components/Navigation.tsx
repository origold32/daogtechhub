"use client";

import { useState, RefObject } from "react";
import {
  Menu, X, User, ChevronDown,
  Heart, Package2, Mail, Ticket, LogOut, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AppLogo from "@/components/reusables/app-logo";
import { useAuthStore } from "@/store/authStore";
import { useSignOut } from "@/hooks/useSignOut";
import { SmartAvatar } from "@/components/reusables/smart-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScrollNav } from "@/hooks/useScrollNav";

interface NavLink {
  label: string;
  ref: RefObject<HTMLElement | null>;
}

interface NavigationProps {
  links: NavLink[];
}

export function Navigation({ links }: NavigationProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { handleSignOut, loading: signingOut } = useSignOut();
  const navVisible = useScrollNav({ threshold: 60, hysteresis: 8 });

  const scrollTo = (ref: RefObject<HTMLElement | null>) => {
    setMobileOpen(false);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const dropdownItems = [
    { label: "My Profile", icon: User,     href: "/profile" },
    { label: "Orders",     icon: Package2, href: "/orders" },
    { label: "Wishlist",   icon: Heart,    href: "/wishlist" },
    { label: "Inbox",      icon: Mail,     href: "/inbox" },
    { label: "Vouchers",   icon: Ticket,   href: "/vouchers" },
  ];

  return (
    <>
      {/* ── Desktop / Mobile nav bar ── */}
      <nav
        className="fixed left-0 right-0 z-[100] px-6 lg:px-12 py-4 flex items-center justify-between"
        style={{
          top: 36, // sits below the 36px announcement banner
          background: "rgba(26,11,46,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(212,165,255,0.08)",
          transform: navVisible ? "translateY(0)" : "translateY(calc(-100% - 36px))",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <AppLogo width={44} height={44} />
        </div>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-7">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.ref)}
              className="text-sm font-medium text-muted-lavender hover:text-soft-white transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-lilac group-hover:w-full transition-all duration-200" />
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
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
                    avatarSizeClassName="w-7 h-7"
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
            <Button
              onClick={() => router.push("/auth")}
              size="sm"
              className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl text-xs px-4 hidden sm:flex"
            >
              Sign In
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-muted-lavender hover:text-lilac transition-colors rounded-xl hover:bg-white/5"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 z-[99] px-4 py-4 flex flex-col gap-2"
            style={{
              top: 36 + 64, // banner + nav height
              background: "rgba(26,11,46,0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(212,165,255,0.08)",
            }}
          >
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.ref)}
                className="w-full text-left px-3 py-3 text-sm font-medium text-muted-lavender hover:text-soft-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {link.label}
              </button>
            ))}
            {!isAuthenticated && (
              <Button
                onClick={() => { setMobileOpen(false); router.push("/auth"); }}
                className="w-full mt-1 bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl"
              >
                Sign In
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}