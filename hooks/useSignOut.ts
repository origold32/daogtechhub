"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // scope: 'global' invalidates all sessions across all devices
      await getSupabaseBrowserClient().auth.signOut({ scope: "global" });
    } catch (err) {
      console.error("Sign-out error:", err);
    }

    // Always clear local state even if signOut API call fails
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();

    // refresh() clears Next.js server-side render cache so protected
    // pages immediately see the logged-out state on next navigation
    router.refresh();
    router.replace("/");
  }, [loading, router]);

  return { handleSignOut, loading };
}
