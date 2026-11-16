# Launch checklist — Smart Growth Bot Painting AI

Do these in order. Use Stripe **test mode** first, run the beta, then switch to live keys.

## 1. Firebase (sign-in + database)
1. Open the Firebase console for project `supple-timer-cn56p` (or create a new project and replace `firebase-applet-config.json`).
2. **Authentication → Sign-in method →** enable **Email/Password**.
3. **Authentication → Settings → Authorized domains →** add your app domain (e.g. `app.smartgrowthbot.com`).
4. **Authentication → Templates →** set the sender name to "Smart Growth Bot" on the verification and password-reset emails.
5. **Firestore Database →** create the database in production mode (region `us-east4` or `nam5`).
6. Deploy the locked-down rules: `npx firebase-tools deploy --only firestore:rules --project supple-timer-cn56p`
   (or paste `firestore.rules` into Firestore → Rules → Publish).
7. If hosting outside Google Cloud: **Project settings → Service accounts → Generate new private key**, and put the JSON in the `FIREBASE_SERVICE_ACCOUNT` secret.

## 2. Server secrets
Set every value in `.env.example` as a secret in your host. At minimum:
- `APP_URL` (your public URL), `ENCRYPTION_KEY` (`openssl rand -hex 32` — store it safely; never change it), `GEMINI_API_KEY`.

## 3. Stripe — subscriptions
1. **Product catalog →** create product "Smart Growth Bot Painting AI" with three monthly prices: $297 (Starter), $697 (Professional), $1,497 (Premium). Copy the `price_…` IDs into `STRIPE_PRICE_STARTER/PROFESSIONAL/PREMIUM`.
2. **Settings → Billing → Customer portal →** turn on: update payment method, cancel subscription (at end of period), switch plans (add all three prices), invoice history.
3. **Developers → API keys →** copy the secret key into `STRIPE_SECRET_KEY`.
4. **Developers → Webhooks → Add endpoint** `{APP_URL}/api/webhooks/stripe` ("Your account") with events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
5. **Coupons →** create the beta coupon (see BETA_PROGRAM.md) and a promotion code for it.

## 4. Stripe — Connect (painting companies get paid by their customers)
1. **Connect → Get started →** choose platform/marketplace, **Express** accounts, US.
2. **Connect → Settings → Branding →** add the Smart Growth Bot name, icon and colors.
3. **Developers → Webhooks → Add endpoint** `{APP_URL}/api/webhooks/stripe-connect` with **"Events on Connected accounts"** and the event `account.updated`. Copy its signing secret into `STRIPE_CONNECT_WEBHOOK_SECRET`.
4. Optional: set `PLATFORM_FEE_BPS` if you want a cut of invoice payments (e.g. `50` = 0.5%). Default is 0.

## 5. Google (Calendar + Gmail per company)
1. Google Cloud console (same project) → **APIs & Services → Library →** enable **Google Calendar API** and **Gmail API**.
2. **OAuth consent screen →** External; app name "Smart Growth Bot Painting AI"; support email; links to `{APP_URL}/privacy` and `{APP_URL}/terms`; scopes `calendar.events` and `gmail.send`.
3. **Credentials → Create OAuth client ID → Web application**, redirect URI `{APP_URL}/api/integrations/google/callback`. Put the ID/secret in `GOOGLE_CLIENT_ID/SECRET`.
4. While in "Testing" status, add each beta company's Google email as a test user. Before public launch, submit for verification — `gmail.send` is a sensitive scope and Google will review the privacy policy's Limited Use statement (already included).

## 6. Optional services
- **Resend** (`RESEND_API_KEY`, `EMAIL_FROM`) so companies that haven't connected Gmail can still email estimates/invoices. Verify the sending domain first.
- **SAM.gov** (`SAM_API_KEY`) for live opportunities in the Gov contracting preview.

## 7. Host it
- **Cloud Run (recommended):** `gcloud run deploy smartgrowthbot --source . --region us-east4 --allow-unauthenticated` (uses the Dockerfile), then set the secrets and map your domain.
- **AI Studio:** keep using it if you prefer — it runs `npm run build` and `npm start`. Add the secrets in its Secrets panel.
- Point a DNS record for `app.smartgrowthbot.com` in GoDaddy at the host. Leave `dashboard.smartgrowthbot.com` (Aminos) alone.

## 8. Before the first paying customer
- [ ] Attorney review of `/terms`, `/privacy`, `/messaging-policy`; confirm the legal entity name and support email in `src/components/live/Legal.tsx` (`LEGAL`).
- [ ] Make sure `support@smartgrowthbot.com` (or whatever you choose) receives mail.
- [ ] Run the full flow in Stripe test mode: sign up → trial → add lead → AI call → book → estimate → accept → deposit invoice → pay with card `4242 4242 4242 4242` → invoice shows Paid.
- [ ] Switch Stripe to live keys and live webhook secrets; recreate prices in live mode.
- [ ] `npm test` and CI green.
