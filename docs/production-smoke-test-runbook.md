# Production Smoke Test Runbook

## Purpose
This runbook verifies DAOG Tech Hub core production flows after deployment. It is intended for developers, QA, or ops staff and does not require prior knowledge of the platform.

## Pre-flight
- Confirm environment variables are set in production: `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `RESEND_API_KEY`.
- Confirm webhook endpoint is configured in Paystack with the production URL: `https://<your-domain>/api/payment/webhook`.
- Confirm the admin user exists and can sign in.
- Confirm storage permissions allow public access to product images and protected access to uploads.

## 1. Admin login and dashboard
1. Open `/admin` and sign in with an admin account.
2. Verify the admin dashboard loads without errors.
3. Confirm the analytics panel displays live totals and warnings.
4. Validate the support search can resolve an order ID, payment reference, or customer email.

## 2. Product browsing and add to cart
1. Open a live product detail page.
2. Verify the product view is tracked in analytics by checking the admin analytics summary.
3. Add a product to cart and confirm the action succeeds.
4. Verify `add_to_cart` is reflected in analytics within a few minutes.

## 3. Checkout and payment flow
1. Start checkout with a test order.
2. Verify the checkout initialization endpoint returns a valid Paystack authorization URL.
3. Complete payment in sandbox/test mode and confirm the callback page loads.
4. Confirm the order moves to `confirmed` and receipt data appears.
5. Validate payment success is reflected in the admin analytics panel.

## 4. Failure and recovery checks
1. Attempt payment verification with an intentionally invalid reference.
2. Confirm the app returns a proper error and logs the failure event.
3. Send a malformed webhook signature to `/api/payment/webhook` and confirm the endpoint responds with `401` and logs the invalid signature.
4. Submit a manual payment for an order in `awaiting_payment` and verify the admin can approve/reject it.

## 5. Email and contact form
1. Submit the contact form with valid details.
2. Confirm the endpoint returns success and no errors.
3. If available, verify the admin receives the enquiry email.

## 6. Release verification
1. Open the support search tool and search by order ID, email address, and payment reference.
2. Confirm order, receipt, and user records are found.
3. Validate all public endpoints still respond and the admin analytics route is live.
4. Check the release checklist before closing the deployment.

## Notes
- If any step fails, capture request/response details and rollback using the prepared rollback checklist.
- Use the admin alerts section to identify repeated payment failures, duplicate webhook spikes, or suspicious auth activity.
