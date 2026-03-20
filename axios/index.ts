// axios/index.ts
// Axios instance wired to Next.js API routes.
// Supabase JWT is attached per-request via an interceptor.

import axios, { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";

export const axiosBaseInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Supabase client — uses the app-wide singleton ────────────────────────────
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
function getSupabaseClient() {
  if (typeof window === "undefined") return null;
  try { return getSupabaseBrowserClient(); } catch { return null; }
}

// ── Request: attach Supabase JWT ──────────────────────────────────────────────
axiosBaseInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.set("Authorization", `Bearer ${session.access_token}`);
        }
      } catch {
        // Session unavailable — proceed without auth header
      }
    }

    // Don't override Content-Type for FormData uploads
    if (config.data instanceof FormData) {
      delete config.headers?.["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response: auto-retry on 401 after refreshing session ─────────────────────
axiosBaseInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          return axiosBaseInstance(originalRequest);
        }
      }

      // Refresh failed — redirect to sign-in
      if (typeof window !== "undefined") {
        const redirectTo = encodeURIComponent(window.location.pathname);
        window.location.href = `/auth?redirectTo=${redirectTo}`;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosBaseInstance;