// hooks/useUser.ts
// Fetches the current user's full profile from the server via SWR.
// Falls back to the Zustand auth store while the fetch is in progress.

import useSWR from "swr";
import { fetcher } from "@/swr";
import { useAuthStore } from "@/store/authStore";

const useUser = () => {
  const { user: storeUser, isAuthenticated, isHydrating, login } = useAuthStore();

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR(
    // BUG FIX #5: only fetch when auth is confirmed and hydration is done.
    // Old code always fetched, causing a 401 flash on page load before the
    // Supabase session cookie was available. Now we wait until the store
    // confirms the user is authenticated AND hydration is complete.
    isAuthenticated && !isHydrating ? "/api/auth/me" : null,
    fetcher,
    {
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        // Don't retry on auth errors — user just isn't signed in
        if (err?.statusCode === 404 || err?.statusCode === 401) return;
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 1000 * (retryCount + 1));
      },
      revalidateOnFocus:     false,
      revalidateOnReconnect: false,
      // BUG FIX #5 continued: sync all profile fields — including address —
      // back into the store when fresh data arrives from the server.
      onSuccess: (data) => {
        if (data?.data) {
          const d = data.data;
          login({
            id:           d.id,
            firstName:    d.firstName    ?? "",
            lastName:     d.lastName     ?? "",
            email:        d.email        ?? "",
            phone:        d.phone        ?? undefined,
            avatar:       d.avatar       ?? undefined,
            role:         d.role         ?? "customer",
            addressLine1: d.addressLine1 ?? undefined,
            addressLine2: d.addressLine2 ?? undefined,
            city:         d.city         ?? undefined,
            state:        d.state        ?? undefined,
            country:      d.country      ?? undefined,
            postalCode:   d.postalCode   ?? undefined,
          });
        }
      },
    }
  );

  // Prefer fresh server data, fall back to persisted store while loading
  const user = response?.data ?? storeUser;

  return {
    user,
    isLoading: isHydrating || isLoading,  // show loading while either is in-flight
    error,
    response,
    mutateUser: mutate,
  };
};

export default useUser;
