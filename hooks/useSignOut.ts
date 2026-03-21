"use client";
import { useCallback, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const { error } = await getSupabaseBrowserClient().auth.signOut();
    if (error) {
      console.error("Sign-out failed:", error.message);
      setLoading(false);
      return;
    }
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
    window.location.href = "/";
  }, []);

  return { handleSignOut, loading };
}
