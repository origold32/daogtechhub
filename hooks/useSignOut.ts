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

    const { error } = await getSupabaseBrowserClient().auth.signOut({ scope: "global" });
    if (error) {
      console.error("Sign-out failed:", error.message);
      setLoading(false);
      return;
    }

    // Clear all client-side state
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();

    // router.refresh() clears Next.js server cache
    // window.location.replace ensures hard navigation — no stale authenticated UI
    router.refresh();
    window.location.replace("/");
  }, [loading, router]);

  return { handleSignOut, loading };
}
