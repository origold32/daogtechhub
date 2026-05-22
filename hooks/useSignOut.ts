"use client";
import { useCallback, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // "local" clears the session from this browser only without a server
      // round-trip — works even when the token is already expired.
      await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
    } catch {
      // Ignore Supabase errors — we always clear local state below
    }

    // Always clear client state regardless of whether the API call succeeded
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();

    // Hard navigation ensures no stale server cache or authenticated UI lingers
    window.location.replace("/");
  }, [loading]);

  return { handleSignOut, loading };
}
