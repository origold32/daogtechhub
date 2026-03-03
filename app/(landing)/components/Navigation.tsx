"use client";

import { useState, RefObject } from "react";
import {
  Menu,
  X,
  User,
  ChevronDown,
  Heart,
  Mail,
  Package2,
  Ticket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AppLogo from "@/components/reusables/app-logo";
import { useAuthStore } from "@/store/authStore";
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

  const { user, isAuthenticated, logout } = useAuthStore();

  const scrollTo = (ref: RefObject<HTMLElement | null>) => {
    setMobileOpen(false);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const dropdownItems = [
    {
      label: "Profile",
      icon: User,
      action: () => router.push("/profile"),
    },
    {
      label: "Orders",
      icon: Package2,
      action: () => router.push("/orders"),
    },
    {
      label: "Inbox",
      icon: Mail,
      action: () => router.push("/inbox"),
    },
    {
      label: "Wishlist",
      icon: Heart,
      action: () => router.push("/wishlist"),
    },
    {
      label: "Vouchers",
      icon: Ticket,
      action: () => router.push("/vouchers"),
    },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 lg:px-12 py-5 flex items-center justify-between bg-gradient-to-b from-[#1A0B2E]/80 to-transparent backdrop-blur-sm">
        {/* Logo */}
        <AppLogo width={50} height={50} />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.ref)}
              className="nav-link"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-lilac p-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={24} />
          </button>

          {/* AUTH SECTION */}

          {isAuthenticated && user && (
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 p-1 rounded-full border cursor-pointer">
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

                <DropdownMenuContent
                  align="end"
                  className="glass-card-small z-[200]"
                >
                  {dropdownItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={item.action}
                        className="text-lilac cursor-pointer flex items-center gap-3 data-[highlighted]:bg-lilac/20 data-[highlighted]:text-lilac"
                      >
                        <span className="w-4 flex justify-center">
                          {Icon && <Icon size={16} />}
                        </span>
                        <p>{item.label}</p>
                      </DropdownMenuItem>
                    );
                  })}

                  <div className="flex-1 h-px bg-muted-lavender opacity-50 my-1" />

                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="text-center text-primary w-full hover:bg-transparent hover:text-muted-foreground "
                    rounded={"default"}
                  >
                    Logout
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-[#1A0B2E]/95 backdrop-blur-lg lg:hidden flex flex-col items-center justify-center gap-8"
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-lilac p-2"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={24} />
            </button>

            {/* Links */}
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

            {/* Mobile Auth (inside menu) */}
            {isAuthenticated && user ? (
              <>
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/profile");
                  }}
                >
                  Profile
                </Button>

                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  variant="outline"
                  className="border-lilac/50 text-lilac"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push("/auth")}
                variant="outline"
                size="sm"
                className="border-lilac/50 text-lilac hover:bg-lilac hover:text-deep-purple"
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
