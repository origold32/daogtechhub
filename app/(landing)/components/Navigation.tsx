"use client";

import { useState, RefObject } from "react";
import {
  Menu, X, User, ChevronDown,
  Heart, Package2, Mail, Ticket, LogOut, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useScrollNav } from "@/hooks/useScrollNav";
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
  const navVisible = useScrollNav();

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
      <nav className={`fixed top-9 left-0 right-0 z-[100] px-6 lg:px-12 py-5 flex items-center justify-between bg-gradient-to-b from-[#1A0B2E]/80 to-transparent backdrop-blur-sm transition-transform duration-300 ease-in-out ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
        {/* Logo */}
        <AppLogo width={50} height={50} />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <button key={link.label} onClick={() => scrollTo(link.ref)} className="nav-link">
              {link.label}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-lilac p-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={24} />
          </button>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 p-1 rounded-full border border-white/20 cursor-pointer hover:border-lilac/50 transition-colors">
                    <SmartAvatar
                      data={user}
                      getKey={(u) => u.id}
                      getName={(u) => `${u.firstName} ${u.lastName}`}
                      getInitialsName={(u) => `${u.firstName} ${u.lastName}`}
                      showName
                      avatarSizeClassName="w-7 h-7"
                      fallbackTextClassName="text-xs"
                    />
                    <ChevronDown className="shrink-0 mx-2" size={14} />
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
                  variant="outline"
                  size="sm"
                  className="border-lilac/50 text-lilac hover:bg-lilac hover:text-deep-purple"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/auth?mode=signup&redirectTo=/profile")}
                  size="sm"
                  className="bg-lilac text-deep-purple hover:bg-lilac/90"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-[#1A0B2E]/97 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center gap-6"
          >
            <button
              className="absolute top-6 right-6 text-lilac p-2"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={24} />
            </button>

            {links.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => scrollTo(link.ref)}
                className="text-2xl font-heading font-bold text-soft-white hover:text-lilac transition-colors"
              >
                {link.label}
              </motion.button>
            ))}

            <div className="h-px w-32 bg-white/10" />

            {isAuthenticated && user ? (
              <div className="flex flex-col items-center gap-3">
                <Button onClick={() => { setMobileOpen(false); router.push("/profile"); }}
                  className="bg-lilac text-deep-purple hover:bg-lilac/90 w-40">
                  My Profile
                </Button>
                <Button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  variant="outline"
                  disabled={signingOut}
                  className="border-red-400/50 text-red-400 hover:bg-red-400/10 w-40"
                >
                  {signingOut ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={() => { setMobileOpen(false); router.push("/auth?mode=signin&redirectTo=/profile"); }}
                  variant="outline"
                  className="border-lilac/50 text-lilac hover:bg-lilac hover:text-deep-purple w-40"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => { setMobileOpen(false); router.push("/auth?mode=signup&redirectTo=/profile"); }}
                  className="bg-lilac text-deep-purple hover:bg-lilac/90 w-40"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}