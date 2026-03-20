// hooks/useSignOut.ts
// Production-grade sign-out hook.
// Terminates session server-side (clears cookies) + clears client state.
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Sign out server-side — clears Supabase session cookies
      await fetch("/api/auth/signout", { method: "POST", credentials: "same-origin" });

      // 2. Clear browser-side Supabase client session
      if (typeof window !== "undefined") {
        try {
          const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
          await getSupabaseBrowserClient().auth.signOut();
        } catch {
          // Client may not be initialized — that's fine, server cleared the session
        }
      }

      // 3. Clear Zustand stores
      useAuthStore.getState().logout();
      useCartStore.getState().clearCart?.();

      // 4. Navigate to home and force a fresh server check
      router.push("/");
      router.refresh();
    } catch {
      // Even on error, clear client state so user isn't stuck
      useAuthStore.getState().logout();
      useCartStore.getState().clearCart?.();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { handleSignOut, loading };
}