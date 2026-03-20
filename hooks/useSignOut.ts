// hooks/useSignOut.ts
"use client";

import { useCallback, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      // Sign out from Supabase (clears session cookies + localStorage)
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      await getSupabaseBrowserClient().auth.signOut();
    } catch {
      // Continue even if Supabase call fails
    }
    // Clear client state
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
    // Hard redirect — clears all in-memory state, forces middleware re-check
    window.location.href = "/";
  }, []);

  return { handleSignOut, loading };
}