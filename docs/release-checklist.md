# Production Release Checklist

## Environment variables
- [ ] `NEXT_PUBLIC_SITE_URL` is correct for production domain.
- [ ] `SUPABASE_URL` and `SUPABASE_KEY` are set for the production Supabase project.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured where server-side jobs need it.
- [ ] `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` are present and valid.
- [ ] `RESEND_API_KEY` is configured for transactional email delivery.
- [ ] Any payment, webhook, or email-related secrets are rotated and stored securely.

## Webhook configuration
- [ ] Production Paystack webhook URL is registered: `https://<your-domain>/api/payment/webhook`.
- [ ] `PAYSTACK_SECRET_KEY` used for webhook signature validation matches the webhook configuration.
- [ ] Webhook retry behavior is understood and duplicate events are idempotent.

## Analytics verification
- [ ] Admin analytics section loads and returns live data from `analytics_events`.
- [ ] Payment success and failure events are populating correctly.
- [ ] Duplicate webhook and invalid signature alerts are visible in the admin alerts dashboard.
- [ ] Product view, add-to-cart, and checkout-started events are being recorded.

## Storage and permissions
- [ ] Image/storage URLs are accessible where expected.
- [ ] Upload endpoints enforce expected validation and do not expose private storage.
- [ ] Supabase row-level security (RLS) policies are active and tested for public/private data.

## Admin and auth verification
- [ ] Admin login works and only admin roles can access `/admin` pages.
- [ ] Admin mutation endpoints are protected by `requireRole("admin")` and are not publicly accessible.
- [ ] Admin support search can resolve order IDs, payment references, and customer emails.

## Payment and receipt verification
- [ ] Paystack checkout initialization returns a valid authorization URL.
- [ ] Payment callback and verification flow completes successfully.
- [ ] Receipts are created and linked to orders after payment confirmation.
- [ ] Manual payment approval/rejection flows are working.

## Rollback preparation
- [ ] Confirm there is a known rollback point or previous deployment snapshot.
- [ ] Capture failing request logs and reproduce in staging if possible.
- [ ] Have database change rollbacks or feature toggles ready if needed.
- [ ] Verify alert thresholds and logging are active so the rollback can be monitored.
