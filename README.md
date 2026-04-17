# DAOG Tech Hub — Full-Stack E-Commerce

Nigeria's #1 premium marketplace for gadgets, jerseys, cars & real estate.

## 🚀 Quick Start

```bash
# 1. If upgrading from a previous version — run the cleanup script FIRST
#    Windows:  double-click _cleanup.bat  (or run in terminal)
#    Mac/Linux: bash _cleanup.sh
#    This removes the old app\auth\callback duplicate route.

# 2. Install dependencies  ← REQUIRED on first run
pnpm install

# 3. Configure environment
cp .env.local.example .env.local
# Fill in your Supabase, Paystack, and email / site settings

# 4. Run database migrations
# → Paste supabase/PATCH.sql into Supabase SQL Editor and run

# 5. Make yourself admin
# → Run in Supabase SQL Editor:
# UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

# 6. Start dev server
pnpm dev
# → http://localhost:3232
```

## 📦 Tech Stack

- **Framework**: Next.js 14.2.5 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth (Magic Link OTP + Google OAuth)
- **Payments**: Paystack (card, bank transfer, USSD)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (cart, auth, filters)
- **PWA**: Service Worker + Web App Manifest

## 🏗 Project Structure

```
app/
├── (auth)/           # Auth pages: sign-in, reset-password
├── (landing)/        # Homepage with product sections
├── (legal)/          # Privacy, Terms, Cookies, Refund policy
├── admin/            # Admin dashboard (role-guarded)
├── api/              # All API routes
│   ├── auth/         # OTP, verify, me, reset-password
│   ├── payment/      # Paystack initialize, verify, webhook
│   ├── discount/     # Discount code validation
│   ├── recommendations/ # AI product recommendations
│   └── [category]/   # gadgets, jerseys, cars, realestate CRUD
├── checkout/         # Checkout + Paystack redirect verify page
├── gadgets/          # Category listing + [id] detail pages
├── jerseys/          # Category listing + [id] detail pages
├── cars/             # Category listing + [id] detail pages
├── realestate/       # Category listing + [id] detail pages
├── sitemap.ts        # Dynamic XML sitemap
└── offline/          # PWA offline fallback page
```

## 💳 Paystack Setup

1. Sign up at [paystack.com](https://paystack.com)
2. Get your keys from Dashboard → Settings → API Keys
3. Add to `.env.local`:
   - `PAYSTACK_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...`
4. Register webhook URL: `https://yourdomain.com/api/payment/webhook`

## 🔧 Required environment variables

Add or confirm the following values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `RESEND_API_KEY` (optional, for email notifications)

## 🔐 Security Features

- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Rate limiting on auth endpoints (10 req/min)
- ✅ Paystack webhook HMAC-SHA512 signature verification
- ✅ Supabase Row Level Security (RLS) on all tables
- ✅ HTTPS enforced via HSTS
- ✅ No server-side secrets exposed to client

## 📊 SEO Features

- ✅ Dynamic sitemap at `/sitemap.xml`
- ✅ `robots.txt` with crawler directives
- ✅ JSON-LD structured data (Organization, WebSite, Product, Breadcrumb)
- ✅ Open Graph + Twitter Card meta tags
- ✅ Canonical URLs
- ✅ Image alt text + lazy loading
- ✅ Mobile-first responsive design

## 📱 PWA Features

- ✅ Web App Manifest (`/manifest.json`)
- ✅ Service Worker with offline support
- ✅ "Add to Home Screen" prompt
- ✅ Push notification infrastructure
- ✅ Background sync for cart
- ✅ All icon sizes (72px → 512px)

## 🗃 Database

Run `supabase/PATCH.sql` in the Supabase SQL Editor. This creates:

- `profiles` — user profiles with role (customer/admin/vendor)
- `gadgets`, `jerseys`, `cars`, `realestate` — product tables
- `orders` + `order_items` — order management
- `cart_items` — server-side cart sync
- `wishlists` — server-side wishlist
- `swap_requests` — product swap system
- `discount_codes` — marketing discount codes
- `product_reviews` — customer reviews
- `auth_logs` — authentication event log

## 🌐 Deployment (Vercel)

```bash
# Push to GitHub, then connect to Vercel
# Add all environment variables in Vercel Dashboard → Settings → Environment Variables
# Set NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📧 Google Search Console

After deployment:
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property for your domain
3. Verify ownership (DNS or HTML file method)
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`
