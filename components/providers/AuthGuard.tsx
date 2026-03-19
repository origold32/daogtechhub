// components/providers/AuthGuard.tsx
// Client-side auth guard for protected pages.
// Usage: wrap the page content with <AuthGuard redirectTo="/profile">
// The middleware handles server-side guards; this handles the client hydration gap.
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string; // where to go after login (defaults to current path)
}

export default function AuthGuard({ children, redirectTo }: AuthGuardProps) {
  const { isAuthenticated, isHydrating } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  const destination = redirectTo ?? pathname;

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      router.replace(`/auth?redirectTo=${encodeURIComponent(destination)}`);
    }
  }, [isHydrating, isAuthenticated, router, destination]);

  // While session check is running, show a minimal non-blocking indicator.
  // Avoid a full-screen spinner here — the isHydrating window is now very short
  // (<100ms on cached sessions) thanks to the fast-path getSession() in useSupabase.
  if (isHydrating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "#1a0b2e" }}>
        <Loader2 className="w-6 h-6 text-[#d4a5ff]/50 animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirect in progress, show nothing
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#1a0b2e" }}>
        <Loader2 className="w-6 h-6 text-[#d4a5ff]/40 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
