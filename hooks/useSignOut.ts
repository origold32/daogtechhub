"use client";
import { useCallback, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { resetSupabaseBrowserClient } from "@/lib/supabaseClient";
import { clearSupabasePkceCookiesInBrowser } from "@/lib/auth-utils";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Clear session server-side and browser client-side in parallel.
      // "local" clears the browser cookie; the POST clears the SSR cookie
      // used by middleware — both must be gone to fully sign out.
      await Promise.allSettled([
        getSupabaseBrowserClient().auth.signOut({ scope: "local" }),
        fetch("/auth/signout", { method: "POST" }),
      ]);

      // Clear PKCE code_verifier cookies to prevent any session restoration
      clearSupabasePkceCookiesInBrowser();

      // Reset the browser client instance to ensure no stale session
      resetSupabaseBrowserClient();
    } catch (err) {
      console.error("Error during signout:", err);
      // Continue with logout even if signout fails
    }

    // Clear all local state
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();

    // Navigate AFTER all session clearing is complete
    // Use replace to prevent back navigation to the user's previous page
    window.location.replace("/");
  }, [loading]);

  return { handleSignOut, loading };
}
