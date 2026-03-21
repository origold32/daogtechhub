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
    setLoading(true);
    const { error } = await getSupabaseBrowserClient().auth.signOut();
    if (error) {
      console.error("Sign-out failed:", error.message);
      setLoading(false);
      return;
    }
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
    // router.refresh() clears server-side session cache, then redirect
    router.refresh();
    router.push("/");
  }, [router]);

  return { handleSignOut, loading };
}
