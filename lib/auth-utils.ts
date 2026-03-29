const DEFAULT_AUTH_REDIRECT_PATH = "/profile";

function readForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function sanitizeRedirectPath(
  candidate?: string | null,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
) {
  if (!candidate?.trim()) return fallback;
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  return candidate;
}

export function resolveRequestOrigin(
  requestUrl: string,
  headers: Pick<Headers, "get">,
) {
  const url = new URL(requestUrl);
  const forwardedHost = readForwardedValue(headers.get("x-forwarded-host"));
  const forwardedProto = readForwardedValue(headers.get("x-forwarded-proto"));

  if (!forwardedHost) return url.origin;

  return `${forwardedProto ?? url.protocol.replace(":", "")}://${forwardedHost}`;
}

export function buildRedirectUrl(
  origin: string,
  pathname: string,
  paramName: "next" | "redirectTo",
  redirectPath?: string | null,
) {
  const url = new URL(pathname, origin);
  url.searchParams.set(paramName, sanitizeRedirectPath(redirectPath));
  return url.toString();
}

export function getSupabaseStorageKey(supabaseUrl: string) {
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  return `sb-${projectRef}-auth-token`;
}

export function listSupabasePkceCookieNames(
  cookieNames: string[],
  supabaseUrl: string,
) {
  const prefix = `${getSupabaseStorageKey(supabaseUrl)}-code-verifier`;
  return cookieNames.filter(
    (name) => name === prefix || name.startsWith(`${prefix}.`),
  );
}

export function clearSupabasePkceCookiesInBrowser() {
  if (typeof document === "undefined") return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return;

  const prefix = `${getSupabaseStorageKey(supabaseUrl)}-code-verifier`;
  const cookieNames = document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name === prefix || name.startsWith(`${prefix}.`));

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  });

  try {
    window.localStorage.removeItem(prefix);
  } catch {
    // Cookie storage is the primary source of truth, so ignore localStorage failures.
  }
}
