export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_AUTH_COOKIE_OPTIONS } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  const cookiesToWrite: Array<{
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }> = [];

  try {
    const body = await request.json();
    const accessToken = body?.access_token as string | undefined;
    const refreshToken = body?.refresh_token as string | undefined;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookiesToWrite.push({ name, value, options });
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { success: false, error: error?.message ?? "Could not establish session." },
        { status: 401 },
      );
    }

    await upsertProfile(data.user);

    const okResponse = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        phone: data.user.phone ?? null,
        user_metadata: data.user.user_metadata ?? {},
      },
    });

    cookiesToWrite.forEach(({ name, value, options }) => {
      okResponse.cookies.set(name, value, options);
    });
    okResponse.headers.set("Cache-Control", "private, no-store");

    return okResponse;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Could not establish session." },
      { status: 500 },
    );
  }
}

async function upsertProfile(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const { createClient } = await import("@supabase/supabase-js");
  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const raw = meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "User";
  const parts = raw.trim().split(/\s+/);

  await svc.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      first_name: meta.first_name ?? parts[0] ?? "User",
      last_name: meta.last_name ?? parts.slice(1).join(" ") ?? "",
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
      role: "customer",
    },
    { onConflict: "id", ignoreDuplicates: false },
  );
}
