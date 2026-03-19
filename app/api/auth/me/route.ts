// app/api/auth/me/route.ts
// GET    → Full profile with cart, wishlist, and order counts
// PATCH  → Update editable profile fields
// DELETE → Sign out

import { NextRequest } from "next/server";
import { ok, serverError, notFound } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    // Single query — avoid double fetch (requireAuth already has profile)
    const { data: p, error: pErr } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();

    if (pErr || !p) return notFound("Profile");

    // Parallel fetch for counts (non-blocking if tables don't exist yet)
    const [ordersRes, wishlistRes, cartRes] = await Promise.allSettled([
      supabase!.from("orders")    .select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase!.from("wishlists") .select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase!.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    ]);

    return ok({
      id:           p.id,
      firstName:    p.first_name   ?? "",
      lastName:     p.last_name    ?? "",
      email:        p.email        ?? null,
      phone:        p.phone        ?? null,
      avatar:       p.avatar_url   ?? null,
      role:         p.role         ?? "customer",
      addressLine1: p.address_line1 ?? null,
      addressLine2: p.address_line2 ?? null,
      city:         p.city          ?? null,
      state:        p.state         ?? null,
      country:      p.country       ?? null,
      postalCode:   p.postal_code   ?? null,
      createdAt:    p.created_at,
      // Handy counts for the profile overview tab
      _counts: {
        orders:   ordersRes.status   === "fulfilled" ? (ordersRes.value.count   ?? 0) : 0,
        wishlist: wishlistRes.status === "fulfilled" ? (wishlistRes.value.count ?? 0) : 0,
        cart:     cartRes.status     === "fulfilled" ? (cartRes.value.count     ?? 0) : 0,
      },
    });
  } catch (err) { return serverError(err); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const {
      firstName, lastName, phone, avatarUrl,
      addressLine1, addressLine2, city, state, country, postalCode,
    } = body;

    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (firstName    !== undefined) update.first_name    = firstName;
    if (lastName     !== undefined) update.last_name     = lastName;
    if (phone        !== undefined) update.phone         = phone;
    if (avatarUrl    !== undefined) update.avatar_url    = avatarUrl;
    if (addressLine1 !== undefined) update.address_line1 = addressLine1;
    if (addressLine2 !== undefined) update.address_line2 = addressLine2;
    if (city         !== undefined) update.city          = city;
    if (state        !== undefined) update.state         = state;
    if (country      !== undefined) update.country       = country;
    if (postalCode   !== undefined) update.postal_code   = postalCode;

    const { data: p, error: uErr } = await supabase!
      .from("profiles")
      .update(update)
      .eq("id", user!.id)
      .select()
      .single();

    if (uErr) return serverError(uErr.message);

    return ok({
      id: p.id, firstName: p.first_name, lastName: p.last_name,
      email: p.email, phone: p.phone ?? null, avatar: p.avatar_url ?? null,
      role: p.role,
      addressLine1: p.address_line1 ?? null, addressLine2: p.address_line2 ?? null,
      city: p.city ?? null, state: p.state ?? null,
      country: p.country ?? null, postalCode: p.postal_code ?? null,
    }, "Profile updated");
  } catch (err) { return serverError(err); }
}

export async function DELETE() {
  try {
    const { supabase } = await requireAuth();
    if (supabase) await supabase.auth.signOut();
    return ok({ signedOut: true }, "Signed out");
  } catch (err) { return serverError(err); }
}
