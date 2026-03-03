"use client";

import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  User,
  ChevronDown,
  Package2,
  Mail,
  Heart,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartAvatar } from "@/components/reusables/smart-avatar";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GoBack from "../reusables/go-back";
import AppLogo from "../reusables/app-logo";

interface CategoryNavigationProps {
  category: "gadgets" | "jerseys" | "cars" | "realestate";
  showSellButton?: boolean;
}

export function CategoryNavigation({
  category,
  showSellButton = true,
}: CategoryNavigationProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const categoryTitles = {
    gadgets: "Gadgets",
    jerseys: "Jerseys",
    cars: "Cars",
    realestate: "Real Estate",
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
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 lg:px-8 py-4 flex items-center justify-between bg-[#1A0B2E]/90 backdrop-blur-md border-b border-lilac/20">
      {/* Left Section: Logo and Go Back */}
      <div className="flex items-center gap-4">
        <GoBack variant="nav" link="/" />
        <div className="h-6 w-px bg-lilac" />
        <div className="flex items-center gap-2">
          <AppLogo width={40} height={40} />
          <span className="hidden sm:inline text-lg font-bold text-lilac">
            {categoryTitles[category]}
          </span>
        </div>
      </div>

      {/* Right Section: Sell Button, Cart, Auth */}
      <div className="flex items-center gap-3">
        {/* Sell Button - Hidden for jerseys */}
        {showSellButton && (
          <Button
            onClick={() => router.push(`/${category}/sell`)}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-lilac/50 text-lilac hover:bg-lilac hover:text-deep-purple"
          >
            <Plus className="w-4 h-4" />
            Sell
          </Button>
        )}

        {/* Cart Button */}
        <button
          onClick={() => router.push("/cart")}
          className="relative p-2 text-lilac hover:text-muted-foreground transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-lilac text-[#1A0B2E] text-xs font-bold rounded-full flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </button>

        {/* Auth Section */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 p-1 rounded-full border transition-colors cursor-pointer">
                <SmartAvatar
                  data={user}
                  getKey={(u) => u.id}
                  getName={(u) => `${u.firstName} ${u.lastName}`}
                  getInitialsName={(u) => `${u.firstName} ${u.lastName}`}
                  responsiveName
                  avatarSizeClassName="w-6 h-6"
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
      </div>
    </nav>
  );
}
