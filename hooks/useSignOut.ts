// hooks/useSignOut.ts
// Shared sign-out hook used by all navigation components.
// Properly signs out from BOTH Supabase (clears session cookie) AND the Zustand store.
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/useSupabase";

export function useSignOut() {
  const { signOut } = useSupabaseAuth();
  const router      = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(); // signs out Supabase + clears Zustand store + clears cart
    } finally {
      setLoading(false);
      router.push("/");
      router.refresh(); // force middleware session re-check
    }
  }, [signOut, router]);

  return { handleSignOut, loading };
}
