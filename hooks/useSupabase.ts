// hooks/useSupabase.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { clearSupabasePkceCookiesInBrowser } from "@/lib/auth-utils";
import { getSupabaseBrowserClient as _getClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

function getClient() {
  if (typeof window === "undefined") return null;
  return _getClient();
}

// ── Friendly error mapper ─────────────────────────────────────────────────────
export function toFriendlyError(raw: string | undefined | null): string {
  const m = (raw ?? "").toLowerCase();
  if (!m) return "Something went wrong. Please try again.";

  if (m.includes("invalid") && m.includes("otp"))            return "Incorrect code — please check and try again.";
  if (m.includes("otp") && m.includes("expired"))            return "That code has expired. Request a new one.";
  if (m.includes("token") && m.includes("expired"))          return "Your sign-in link has expired. Please request a new one.";
  if (m.includes("email link is invalid"))                    return "That sign-in link is invalid or already used. Please request a new one.";
  if (m.includes("expired"))                                  return "Session expired — please sign in again.";
  if (m.includes("email rate limit") || m.includes("for security purposes")) return "Too many sign-in attempts — please wait a few minutes before trying again.";
  if (m.includes("rate limit") || m.includes("too many"))    return "Too many attempts — please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch"))          return "Network error — please check your connection.";
  if (m.includes("not configured") || m.includes("env"))     return "Auth not set up — check your .env.local file.";
  if (m.includes("invalid credentials"))                      return "Incorrect email or password.";
  if (m.includes("email not confirmed"))                      return "Please verify your email address first.";
  if (m.includes("user not found"))                           return "No account found — one will be created automatically on first sign-in.";
  if (m.includes("already registered"))                       return "This email is already registered.";
  if (m.includes("invalid phone") || (m.includes("phone") && m.includes("invalid")))
                                                              return "Invalid phone number. Use international format e.g. +2348012345678.";
  if (m.includes("phone not confirmed"))                      return "Please verify your phone number first.";
  if (m.includes("invalid jwt") || m.includes("jwt expired")) return "Your session has expired. Please sign in again.";
  if (m.includes("unauthorized") || m.includes("401"))        return "You need to sign in to do that.";
  if (m.includes("forbidden") || m.includes("403"))           return "You don't have permission to do that.";
  if (m.includes("not found") || m.includes("404"))           return "The requested resource wasn't found.";
  if (m.includes("database"))                                  return "Database error — please try again shortly.";
  if (m.includes("server") || m.includes("500"))              return "Server error — please try again shortly.";
  if (m.includes("signups not allowed"))                       return "New sign-ups are currently disabled.";

  return raw!.charAt(0).toUpperCase() + raw!.slice(1);
}

// ── Profile fetcher ───────────────────────────────────────────────────────────
// BUG FIX #1: old code only called login() when fallbackEmail was truthy.
// Phone-auth users have null email — they were authenticated by Supabase but
// the store was never updated, so the app treated them as logged-out.
// Fix: always call login() with whatever data we have.
export async function fetchAndStoreProfile(
  supabase: NonNullable<ReturnType<typeof getClient>>,
  userId: string,
  fallbackEmail?: string | null,
  fallbackPhone?: string | null,
): Promise<Record<string, unknown> | null> {
  const attempt = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  };

  let { data: profile, error } = await attempt();

  // Profile not found yet (DB trigger may not have fired) — retry once after 700ms
  if (!profile && (error?.code === "PGRST116" || error?.message?.includes("not found"))) {
    await new Promise((r) => setTimeout(r, 700));
    const retry = await attempt();
    profile = retry.data;
    error   = retry.error;
  }

  if (profile) {
    useAuthStore.getState().login({
      id:        profile.id        as string,
      firstName: (profile.first_name as string) ?? "",
      lastName:  (profile.last_name  as string) ?? "",
      email:     (profile.email      as string) ?? fallbackEmail ?? "",
      phone:     (profile.phone      as string) ?? fallbackPhone ?? undefined,
      avatar:    (profile.avatar_url as string) ?? undefined,
      role:      (profile.role       as "customer" | "admin" | "vendor") ?? "customer",
      // Address fields from DB
      addressLine1: (profile.address_line1 as string) ?? undefined,
      addressLine2: (profile.address_line2 as string) ?? undefined,
      city:         (profile.city          as string) ?? undefined,
      state:        (profile.state         as string) ?? undefined,
      country:      (profile.country       as string) ?? undefined,
      postalCode:   (profile.postal_code   as string) ?? undefined,
    });
  } else {
    // BUG FIX #1 continued: always call login() even without a profile row.
    // Build a minimal record from the auth session data so the store is populated.
    const emailName = fallbackEmail?.split("@")[0];
    const phoneName = fallbackPhone ? `User ${fallbackPhone.slice(-4)}` : undefined;
    useAuthStore.getState().login({
      id:        userId,
      firstName: emailName ?? phoneName ?? "User",
      lastName:  "",
      email:     fallbackEmail ?? "",
      phone:     fallbackPhone ?? undefined,
      role:      "customer",
    });
  }

  return profile;
}

// ── Session hydration — mounted ONCE in ClientProviders ───────────────────────
export function useSessionHydration() {
  const { logout } = useAuthStore();
  const hydrated       = useRef(false);
  const fetchingUserId = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getClient();
    if (!supabase) {
      useAuthStore.getState().setHydrating(false);
      return;
    }

    // ── Fast-path: call getSession() immediately on mount ─────────────────────
    // This resolves hydration instantly from the cached session (no network call),
    // eliminating the blank/spinner delay that users see while waiting for the
    // onAuthStateChange INITIAL_SESSION event to fire (~500–1500ms on slow tabs).
    supabase.auth.getSession().then(({ data }: { data: { session: import("@supabase/supabase-js").Session | null } }) => { const session = data.session;
      // Only act if we're still hydrating (INITIAL_SESSION hasn't fired yet)
      if (!useAuthStore.getState().isHydrating) return;

      if (session?.user && fetchingUserId.current !== session.user.id) {
        fetchingUserId.current = session.user.id;
        fetchAndStoreProfile(supabase, session.user.id, session.user.email, session.user.phone)
          .then(() => { fetchingUserId.current = null; });
      } else if (!session) {
        logout();
        useAuthStore.getState().setHydrating(false);
      }
    }).catch(() => {
      useAuthStore.getState().setHydrating(false);
    });

    // ── Subscribe first so we never miss an event ─────────────────────────────
    // BUG FIX #2: `INITIAL_SESSION` with a null session (not logged in) hit none
    // of the if-branches and `isHydrating` was never cleared. Added explicit
    // handling so the app stops showing the loading skeleton for anonymous users.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: import("@supabase/supabase-js").AuthChangeEvent, session: import("@supabase/supabase-js").Session | null) => {
        // ── User logged in (or page loaded with existing session) ─────────────
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          const uid = session.user.id;

          // Dedup: skip if this user's profile fetch is already in flight
          if (fetchingUserId.current === uid) return;

          // Dedup: skip if this user is fully loaded (authenticated + not hydrating)
          const stored = useAuthStore.getState();
          if (!stored.isHydrating && stored.isAuthenticated && stored.user?.id === uid) return;

          fetchingUserId.current = uid;
          await fetchAndStoreProfile(
            supabase,
            uid,
            session.user.email,
            session.user.phone,    // BUG FIX #1: pass phone as fallback
          );
          fetchingUserId.current = null;
          return;
        }

        // BUG FIX #2: INITIAL_SESSION with no session = user is not logged in.
        // Clear the hydration flag immediately so the UI doesn't stay in skeleton.
        if (event === "INITIAL_SESSION" && !session) {
          logout();
          useAuthStore.getState().setHydrating(false);
          return;
        }

        if (event === "TOKEN_REFRESHED" && session?.user) {
          const current = useAuthStore.getState().user;
          if (current?.id !== session.user.id) {
            fetchingUserId.current = session.user.id;
            await fetchAndStoreProfile(supabase, session.user.id, session.user.email, session.user.phone);
            fetchingUserId.current = null;
          }
          return;
        }

        if (event === "USER_UPDATED" && session?.user) {
          fetchingUserId.current = session.user.id;
          await fetchAndStoreProfile(supabase, session.user.id, session.user.email, session.user.phone);
          fetchingUserId.current = null;
          return;
        }

        if (event === "SIGNED_OUT") {
          logout();
          useCartStore.getState().clearCart?.();
          fetchingUserId.current = null;
          return;
        }
      }
    );

    // ── Safety-net fallback: if both getSession() AND INITIAL_SESSION somehow ──
    // fail to resolve hydration within 800ms, force-clear to unblock the UI.
    // (3000ms was too long — users saw a loading spinner for 3 full seconds.)
    const timeout = setTimeout(() => {
      if (useAuthStore.getState().isHydrating) {
        useAuthStore.getState().setHydrating(false);
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ── Cart sync ─────────────────────────────────────────────────────────────────
export function useCartSync() {
  const { user }    = useAuthStore();
  const { addItem } = useCartStore();
  const synced      = useRef<string | null>(null);

  useEffect(() => {
    if (!user || synced.current === user.id) return;
    const supabase = getClient();
    if (!supabase) return;
    synced.current = user.id;

    const localItems = useCartStore.getState().items;

    // Pull server cart → merge into local (server wins for quantity)
    Promise.resolve(
      supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
    ).then(({ data: serverItems }) => {
      serverItems?.forEach((s: any) => {
        if (!localItems.some((l) => l.id === s.product_id)) {
          addItem({
            id:       s.product_id,
            name:     s.product_name,
            price:    s.unit_price,
            image:    s.product_image,
            category: s.product_category,
          });
          // addItem defaults to qty 1; sync the real server quantity if different
          if (s.quantity > 1) {
            useCartStore.getState().updateQuantity(s.product_id, s.quantity);
          }
        }
      });
    }).catch(() => {}); // silently ignore — cart sync is best-effort

    // Push local items → server
    if (localItems.length > 0) {
      const rows = localItems.map((i) => ({
        user_id:          user.id,
        product_id:       i.id,
        product_category: i.category,
        product_name:     i.name,
        product_image:    i.image ?? "",
        unit_price:       i.price,
        quantity:         i.quantity,
      }));
      Promise.resolve(
        supabase
          .from("cart_items")
          .upsert(rows, { onConflict: "user_id,product_id" })
      ).catch(() => {}); // best-effort
    }
  }, [user, addItem]);
}

// ── Auth actions ──────────────────────────────────────────────────────────────
export function useSupabaseAuth() {
  const [isLoading, setIsLoading] = useState(false);

  // Send OTP / magic link via server-side rate-limited route
  const sendOtp = useCallback(async (
    identifier: string,
    type: "email" | "phone",
    meta?: { firstName?: string; lastName?: string },
    redirectTo?: string,
  ) => {
    setIsLoading(true);
    try {
      const res  = await fetch("/api/auth/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identifier, type, ...meta, redirectTo }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to send code");
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: toFriendlyError((err as Error).message) };
    } finally { setIsLoading(false); }
  }, []);

  // Verify 6-digit OTP (browser-side — Supabase handles this directly)
  const verifyOtp = useCallback(async (
    identifier: string, token: string, type: "email" | "sms"
  ) => {
    setIsLoading(true);
    try {
      const supabase = getClient();
      if (!supabase) throw new Error("Supabase not configured — check .env.local");

      const { data, error } = type === "email"
        ? await supabase.auth.verifyOtp({ email: identifier, token, type: "email" })
        : await supabase.auth.verifyOtp({ phone: identifier, token, type: "sms"   });

      if (error || !data.user) throw new Error(error?.message ?? "Verification failed");

      // BUG FIX #1: pass both email AND phone so phone-auth users get populated
      const profile = await fetchAndStoreProfile(
        supabase,
        data.user.id,
        data.user.email,
        data.user.phone,
      );
      return { success: true as const, data: { user: profile, session: data.session } };
    } catch (err) {
      return { success: false as const, error: toFriendlyError((err as Error).message) };
    } finally { setIsLoading(false); }
  }, []);

  // OAuth redirect (Google / Facebook)
  // Accepts optional redirectPath and appends as ?next= so after OAuth the
  // callback route sends the user to the right page, not always "/".
  //
  // IMPORTANT: Do NOT use skipBrowserRedirect:true here. @supabase/ssr's
  // createBrowserClient stores the PKCE code_verifier in a cookie automatically
  // before the redirect. Intercepting with skipBrowserRedirect and manually
  // copying from localStorage is wrong — the verifier lives in cookies, not
  // localStorage — and causes the "code challenge does not match previously
  // saved code verifier" error on the callback.
  const signInWithOAuth = useCallback(async (
    provider: "google" | "facebook",
    redirectPath?: string,
  ) => {
    const supabase = getClient();
    if (!supabase) return { success: false as const, error: "Supabase not configured — check .env.local" };
    setIsLoading(true);

    const siteUrl = window.location.origin;
    const nextParam = redirectPath && redirectPath !== "/" ? `?next=${encodeURIComponent(redirectPath)}` : "";

    clearSupabasePkceCookiesInBrowser();

    // Let Supabase handle the redirect natively. createBrowserClient (@supabase/ssr)
    // stores the PKCE code_verifier in a SameSite=Lax cookie before the browser
    // navigates to Google, so the /auth/callback server route can read it.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback${nextParam}`,
      },
    });

    if (error) {
      setIsLoading(false);
      return { success: false as const, error: toFriendlyError(error.message ?? "OAuth failed") };
    }

    // Browser is now navigating to Google — keep isLoading true until page leaves.
    return { success: true as const };
  }, []);

  // Password sign-in
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = getClient();
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new Error(error?.message ?? "Invalid credentials");
      const profile = await fetchAndStoreProfile(supabase, data.user.id, data.user.email, data.user.phone);
      return { success: true as const, data: { user: profile, session: data.session } };
    } catch (err) {
      return { success: false as const, error: toFriendlyError((err as Error).message) };
    } finally { setIsLoading(false); }
  }, []);

  // Sign out — clear store and Supabase session
  const signOut = useCallback(async () => {
    const supabase = getClient();
    if (supabase) await supabase.auth.signOut();
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
  }, []);

  return { sendOtp, verifyOtp, signInWithPassword, signInWithOAuth, signOut, isLoading };
}
