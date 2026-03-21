// hooks/useSignOut.ts
"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out failed:", error.message);
      setLoading(false);
      return;
    }
    // Clear client stores
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
    // Hard redirect — resets all JS state, forces server session re-check
    window.location.href = "/";
  }, []);

  return { handleSignOut, loading };
}