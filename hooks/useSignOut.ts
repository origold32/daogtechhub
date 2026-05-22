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

    // Navigate FIRST — before any state changes or async calls.
    // If we clear the store first, AuthGuard on protected pages fires
    // router.replace("/auth?redirectTo=<page>") which races with our
    // intended destination and can bounce the user back to the page
    // they just signed out from.
    window.location.replace("/");

    // Clear session client-side and server-side in parallel.
    // "local" clears the browser cookie; the POST clears the SSR cookie
    // used by middleware — both must be gone to fully sign out.
    try {
      await Promise.allSettled([
        getSupabaseBrowserClient().auth.signOut({ scope: "local" }),
        fetch("/auth/signout", { method: "POST" }),
      ]);
    } catch {
      // Ignore — navigation already in progress
    }
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
  }, [loading]);

  return { handleSignOut, loading };
}
