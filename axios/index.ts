// Lightweight fetch-based client that mirrors the minimal axios API surface used in the app.
// - Attaches Supabase session JWT when available
// - Retries once on 401 after refreshSession()
// - Supports get/post/patch/put/delete helpers
// - Returns { data, status, statusText, message } similar to AxiosResponse

type RequestConfig = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  data?: any;
  signal?: AbortSignal;
};

let _supabase: Awaited<ReturnType<typeof import("@/supabase/client").createClient>> | null = null;
function getSupabaseClient() {
  if (_supabase) return _supabase;
  try {
    const { createClient } = require("@/supabase/client");
    _supabase = createClient();
    return _supabase!;
  } catch {
    return null;
  }
}

async function attachAuthHeaders(headers: Record<string, string> = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return headers;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { ...headers, Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // ignore
  }
  return headers;
}

async function doFetch(config: RequestConfig, retry = true): Promise<any> {
  const method = config.method ?? "GET";
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

  const headers = await attachAuthHeaders(
    isFormData ? { ...config.headers } : { "Content-Type": "application/json", ...config.headers }
  );

  const body =
    method === "GET" || method === "DELETE"
      ? undefined
      : isFormData
        ? config.data
        : JSON.stringify(config.data ?? {});

  const res = await fetch(config.url, {
    method,
    headers,
    body,
    signal: config.signal,
  });

  if (res.status === 401 && retry) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        return doFetch(config, false);
      }
    }
  }

  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const error: any = new Error(data?.message ?? res.statusText);
    error.response = { data, status: res.status, statusText: res.statusText };
    throw error;
  }

  return {
    data,
    status: res.status,
    statusText: res.statusText,
    message: (data && (data.message ?? data.msg)) || res.statusText,
    headers: res.headers,
  };
}

type AxiosLike = {
  (config: RequestConfig): Promise<any>;
  get: (url: string, headers?: Record<string, string>) => Promise<any>;
  post: (url: string, data?: any, headers?: Record<string, string>) => Promise<any>;
  put: (url: string, data?: any, headers?: Record<string, string>) => Promise<any>;
  patch: (url: string, data?: any, headers?: Record<string, string>) => Promise<any>;
  delete: (url: string, headers?: Record<string, string>) => Promise<any>;
};

export const axiosBaseInstance: AxiosLike = Object.assign(
  (config: RequestConfig) => doFetch(config),
  {
    get: (url: string, headers?: Record<string, string>) =>
      doFetch({ url, method: "GET", headers }),
    post: (url: string, data?: any, headers?: Record<string, string>) =>
      doFetch({ url, method: "POST", data, headers }),
    put: (url: string, data?: any, headers?: Record<string, string>) =>
      doFetch({ url, method: "PUT", data, headers }),
    patch: (url: string, data?: any, headers?: Record<string, string>) =>
      doFetch({ url, method: "PATCH", data, headers }),
    delete: (url: string, headers?: Record<string, string>) =>
      doFetch({ url, method: "DELETE", headers }),
  }
);

export default axiosBaseInstance;
