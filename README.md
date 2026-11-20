# Smart Growth Bot Painting AI

The AI front office for painting companies: leads → AI calls and texts → booked visits → estimates customers accept online → invoices paid by card.

Multi-company SaaS. Each painting company gets its own workspace, team logins and subscription, and connects its own Vapi, Twilio, Google and Stripe accounts.

## What's live

| Area | What it does |
|---|---|
| Sign-in & accounts | Firebase email/password sign-in, email verification, password reset, company onboarding, team invites with owner/admin/member roles and plan seat limits |
| Billing | Stripe subscriptions (Starter $297, Professional $697, Premium $1,497) with a 14-day trial, promo codes, customer billing portal, access lock when unpaid |
| Leads | Lead list, AI lead scoring (Gemini), notes, consent tracking, monthly lead limits per plan, hosted lead-capture form + JSON endpoint |
| AI calls | One-click outbound calls through the company's Vapi assistant; end-of-call webhook saves summary, transcript and recording to the lead; inbound callers become leads |
| Texts | Two-way SMS through the company's Twilio number; signed inbound webhook; STOP/START opt-out handling |
| Schedule | Appointments that sync to the company's Google Calendar |
| Estimates | Line items with server-side totals, AI-drafted scope of work, send by Gmail/text/link, customer accepts or declines online |
| Invoices | From an accepted estimate (deposit % or full) or from scratch; send by Gmail/text/link; customers pay by card via Stripe Connect; mark paid by check/cash; void |
| AI tools | Quote Genius (real photo-based room measurement + estimate builder), Business OS (SOP builder, business advisor) |
| Legal | Terms of Service, Privacy Policy, Messaging & AI Calling Policy at `/terms`, `/privacy`, `/messaging-policy` (drafts — get attorney review) |

Modules still on sample data are grouped under **Preview — sample data** in the sidebar: Gov contracting, pipeline board, reviews & reputation, funnel builder, unified inbox, AI phone lab, crew optimizer, finance command. They show a banner and are blocked from changing real records.

## Architecture

- `server.ts` — Express app: security headers, rate limits, routers, error handling, serves the built React app.
- `server/` — `auth.ts` (Firebase ID-token verification + company membership), `store.ts` (Firestore via Admin SDK, company-scoped paths), `routes/` (account, billing, integrations, core workflow, public pages + webhooks, AI tools), `integrations.ts` (Vapi, Twilio, Google, email), `crypto.ts` (AES-256-GCM for stored secrets).
- `src/` — React app. `src/components/live/` holds the real-data screens; `src/lib/` holds the API client and session.
- Browsers only use Firebase for sign-in. All data goes through the server; `firestore.rules` denies direct database access.

## Run locally

```bash
npm install
cp .env.example .env    # fill in at least GEMINI_API_KEY and ENCRYPTION_KEY
npm run dev             # http://localhost:3000
npm test                # 27 end-to-end server checks against an in-memory database
npm run lint && npm run build
```

## Deploy

See [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) for the full, ordered setup (Firebase, Stripe, Google OAuth, hosting, webhooks) and [docs/BETA_PROGRAM.md](docs/BETA_PROGRAM.md) for running the first 3–5 beta companies.
