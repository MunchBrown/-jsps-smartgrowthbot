# Beta program — first 3–5 painting companies

Goal: real usage, real numbers and honest testimonials before public sales.

## Who to invite
1. **Johnny Sons Painting Services** — customer #1. Run every lead through the app for 30 days.
2. Three or four other painting companies you know personally (supplier counter, PCA chapter, past subs). Mix: 1 residential owner-operator, 1–2 crews of 3–10 painters, 1 commercial-heavy shop.

## The offer (set up in Stripe)
- **Founding beta coupon:** 50% off for 6 months (Stripe → Coupons → "FOUNDING50", duration 6 months, applies to all plans). Create a promotion code `FOUNDING50` limited to 5 redemptions.
- The normal 14-day free trial still applies first.
- In return they agree to: a 20-minute weekly check-in for 4 weeks, honest feedback, and (if they're happy) a written or video testimonial with their permission.

## Onboarding call (45 minutes, screen-share)
1. They sign up at the app URL with the promo code at checkout.
2. Company profile → Settings → Company (phone, email, license #).
3. Lead form → Settings → Integrations → Create my lead form → add the link to their website "Free estimate" button and Google Business Profile.
4. Google → Connect Google (add their Gmail as a test user first while the OAuth app is in testing).
5. Stripe → Settings → Billing & payments → Connect Stripe → finish onboarding.
6. Twilio (optional) → number + A2P 10DLC registration (takes days; start it on the call).
7. Vapi (optional / done-for-you) → their assistant + real phone number; paste the Server URL and secret into the assistant.
8. Walk one real lead through: add → book → estimate → send link → invoice.

## What to measure (per company, weekly)
- Leads added, and from which source
- Median time from lead created to first contact (call or text)
- Estimates sent, viewed, accepted; accepted value
- Invoices paid online vs. by check, and days to paid
- Problems hit (copy the exact error message)

## Testimonials — do it right
- Only publish what they actually said, with written permission (email is fine), using their real name and company.
- Use real numbers from their account, with the time period (e.g. "in the first 30 days").
- Don't promise results in ads ("guaranteed leads") — the old sales page guarantee was removed for this reason.

## Exit criteria for public launch
- 3+ companies using it weekly for 4 weeks
- Zero open data or billing bugs
- At least 2 testimonials with permission
- Attorney-reviewed legal pages, Google OAuth verification submitted, Stripe live mode tested end-to-end
