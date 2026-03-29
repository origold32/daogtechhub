"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient as _getClient } from "@/lib/supabaseClient";
import {
  clearBrowserCookie,
  clearSupabasePkceCookiesInBrowser,
  OAUTH_PROVIDER_COOKIE_NAME,
  OAUTH_REDIRECT_COOKIE_NAME,
  OAUTH_RETRY_COOKIE_NAME,
  setBrowserCookie,
} from "@/lib/auth-utils";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

function getClient() {
  if (typeof window === "undefined") return null;
  return _getClient();
}

export function toFriendlyError(raw: string | undefined | null): string {
  const m = (raw ?? "").toLowerCase();
  if (!m) return "Something went wrong. Please try again.";

  if (m.includes("invalid") && m.includes("otp")) return "Incorrect code - please check and try again.";
  if (m.includes("otp") && m.includes("expired")) return "That code has expired. Request a new one.";
  if (m.includes("token") && m.includes("expired")) return "Your sign-in link has expired. Please request a new one.";
  if (m.includes("email link is invalid")) return "That sign-in link is invalid or already used. Please request a new one.";
  if (m.includes("expired")) return "Session expired - please sign in again.";
  if (m.includes("email rate limit") || m.includes("for security purposes")) return "Too many sign-in attempts - please wait a few minutes before trying again.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts - please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch")) return "Network error - please check your connection.";
  if (m.includes("not configured") || m.includes("env")) return "Auth not set up - check your .env.local file.";
  if (m.includes("invalid credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please verify your email address first.";
  if (m.includes("user not found")) return "No account found - one will be created automatically on first sign-in.";
  if (m.includes("already registered")) return "This email is already registered.";
  if (m.includes("invalid phone") || (m.includes("phone") && m.includes("invalid"))) {
    return "Invalid phone number. Use international format e.g. +2348012345678.";
  }
  if (m.includes("phone not confirmed")) return "Please verify your phone number first.";
  if (m.includes("invalid jwt") || m.includes("jwt expired")) return "Your session has expired. Please sign in again.";
  if (m.includes("unauthorized") || m.includes("401")) return "You need to sign in to do that.";
  if (m.includes("forbidden") || m.includes("403")) return "You don't have permission to do that.";
  if (m.includes("not found") || m.includes("404")) return "The requested resource wasn't found.";
  if (m.includes("database")) return "Database error - please try again shortly.";
  if (m.includes("server") || m.includes("500")) return "Server error - please try again shortly.";
  if (m.includes("signups not allowed")) return "New sign-ups are currently disabled.";

  return raw!.charAt(0).toUpperCase() + raw!.slice(1);
}

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

  if (!profile && (error?.code === "PGRST116" || error?.message?.includes("not found"))) {
    await new Promise((r) => setTimeout(r, 700));
    const retry = await attempt();
    profile = retry.data;
    error = retry.error;
  }

  if (profile) {
    useAuthStore.getState().login({
      id: profile.id as string,
      firstName: (profile.first_name as string) ?? "",
      lastName: (profile.last_name as string) ?? "",
      email: (profile.email as string) ?? fallbackEmail ?? "",
      phone: (profile.phone as string) ?? fallbackPhone ?? undefined,
      avatar: (profile.avatar_url as string) ?? undefined,
      role: (profile.role as "customer" | "admin" | "vendor") ?? "customer",
      addressLine1: (profile.address_line1 as string) ?? undefined,
      addressLine2: (profile.address_line2 as string) ?? undefined,
      city: (profile.city as string) ?? undefined,
      state: (profile.state as string) ?? undefined,
      country: (profile.country as string) ?? undefined,
      postalCode: (profile.postal_code as string) ?? undefined,
    });
  } else {
    const emailName = fallbackEmail?.split("@")[0];
    const phoneName = fallbackPhone ? `User ${fallbackPhone.slice(-4)}` : undefined;
    useAuthStore.getState().login({
      id: userId,
      firstName: emailName ?? phoneName ?? "User",
      lastName: "",
      email: fallbackEmail ?? "",
      phone: fallbackPhone ?? undefined,
      role: "customer",
    });
  }

  return profile;
}

export function useSessionHydration() {
  const { logout } = useAuthStore();
  const fetchingUserId = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getClient();
    if (!supabase) {
      useAuthStore.getState().setHydrating(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        const session = data.session;
        if (!useAuthStore.getState().isHydrating) return;

        if (session?.user && fetchingUserId.current !== session.user.id) {
          fetchingUserId.current = session.user.id;
          fetchAndStoreProfile(supabase, session.user.id, session.user.email, session.user.phone).then(() => {
            fetchingUserId.current = null;
          });
        } else if (!session) {
          logout();
          useAuthStore.getState().setHydrating(false);
        }
      })
      .catch(() => {
        useAuthStore.getState().setHydrating(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          const uid = session.user.id;

          if (fetchingUserId.current === uid) return;

          const stored = useAuthStore.getState();
          if (!stored.isHydrating && stored.isAuthenticated && stored.user?.id === uid) return;

          fetchingUserId.current = uid;
          await fetchAndStoreProfile(supabase, uid, session.user.email, session.user.phone);
          fetchingUserId.current = null;
          return;
        }

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
        }
      }
    );

    const timeout = setTimeout(() => {
      if (useAuthStore.getState().isHydrating) {
        useAuthStore.getState().setHydrating(false);
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [logout]);
}

export function useCartSync() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    if (!user || synced.current === user.id) return;
    const supabase = getClient();
    if (!supabase) return;
    synced.current = user.id;

    const localItems = useCartStore.getState().items;

    Promise.resolve(
      supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
    )
      .then(({ data: serverItems }) => {
        serverItems?.forEach((s: any) => {
          if (!localItems.some((l) => l.id === s.product_id)) {
            addItem({
              id: s.product_id,
              name: s.product_name,
              price: s.unit_price,
              image: s.product_image,
              category: s.product_category,
            });

            if (s.quantity > 1) {
              useCartStore.getState().updateQuantity(s.product_id, s.quantity);
            }
          }
        });
      })
      .catch(() => {});

    if (localItems.length > 0) {
      const rows = localItems.map((i) => ({
        user_id: user.id,
        product_id: i.id,
        product_category: i.category,
        product_name: i.name,
        product_image: i.image ?? "",
        unit_price: i.price,
        quantity: i.quantity,
      }));

      Promise.resolve(
        supabase
          .from("cart_items")
          .upsert(rows, { onConflict: "user_id,product_id" })
      ).catch(() => {});
    }
  }, [user, addItem]);
}

export function useSupabaseAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = useCallback(async (
    identifier: string,
    type: "email" | "phone",
    meta?: { firstName?: string; lastName?: string },
    redirectTo?: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, type, ...meta, redirectTo }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to send code");
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: toFriendlyError((err as Error).message) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (
    identifier: string,
    token: string,
    type: "email" | "sms",
  ) => {
    setIsLoading(true);
    try {
      const supabase = getClient();
      if (!supabase) throw new Error("Supabase not configured - check .env.local");

      const { data, error } = type === "email"
        ? await supabase.auth.verifyOtp({ email: identifier, token, type: "email" })
        : await supabase.auth.verifyOtp({ phone: identifier, token, type: "sms" });

      if (error || !data.user) throw new Error(error?.message ?? "Verification failed");

      const profile = await fetchAndStoreProfile(
        supabase,
        data.user.id,
        data.user.email,
        data.user.phone,
      );

      return { success: true as const, data: { user: profile, session: data.session } };
    } catch (err) {
      return { success: false as const, error: toFriendlyError((err as Error).message) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithOAuth = useCallback(async (
    provider: "google" | "facebook",
    redirectPath?: string,
  ) => {
    if (typeof window === "undefined") {
      return { success: false as const, error: "OAuth can only start in the browser." };
    }

    setIsLoading(true);
    clearSupabasePkceCookiesInBrowser();
    setBrowserCookie(OAUTH_PROVIDER_COOKIE_NAME, provider);
    setBrowserCookie(OAUTH_REDIRECT_COOKIE_NAME, redirectPath ?? "/profile");
    clearBrowserCookie(OAUTH_RETRY_COOKIE_NAME);

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
      await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
    }

    if ("caches" in window) {
      const cacheKeys = await caches.keys().catch(() => []);
      await Promise.all(
        cacheKeys
          .filter((key) => key.startsWith("daog-"))
          .map((key) => caches.delete(key).catch(() => false)),
      );
    }

    const supabase = getClient();
    if (!supabase) {
      setIsLoading(false);
      return { success: false as const, error: "Supabase not configured - check your .env.local file." };
    }

    const siteUrl = window.location.origin;
    const nextParam = redirectPath && redirectPath !== "/" ? `?next=${encodeURIComponent(redirectPath)}` : "";
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

    return { success: true as const };
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getClient();
    if (supabase) await supabase.auth.signOut();
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart?.();
  }, []);

  return { sendOtp, verifyOtp, signInWithPassword, signInWithOAuth, signOut, isLoading };
}
