// Stripe: platform subscriptions (Starter / Professional / Premium with a free
// trial) and Stripe Connect Express accounts so each painting company can get
// paid by its own customers.
import express, { Router } from "express";
import Stripe from "stripe";
import { requireAuth, requireOrg, requireRole, orgIdOf } from "../auth";
import { store, paths, nowIso } from "../store";
import { config } from "../config";
import { isPlanId, PLANS, PlanId } from "../plans";

let stripeClient: Stripe | null = null;
export function stripe(): Stripe {
  if (!config.stripe.secretKey) throw Object.assign(new Error("Billing is not configured on this server yet."), { status: 503 });
  if (!stripeClient) stripeClient = new Stripe(config.stripe.secretKey, { appInfo: { name: "Smart Growth Bot Painting AI" } });
  return stripeClient;
}

function planForPrice(priceId: string | undefined): PlanId | null {
  for (const [plan, id] of Object.entries(config.stripe.prices)) if (id && id === priceId) return plan as PlanId;
  return null;
}

const router = Router();

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------
router.post("/api/billing/checkout", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const plan = req.body?.plan;
  if (!isPlanId(plan)) {
    res.status(400).json({ error: "Choose Starter, Professional or Premium." });
    return;
  }
  const price = config.stripe.prices[plan];
  if (!price) {
    res.status(503).json({ error: `The ${PLANS[plan].name} plan isn't set up in billing yet.` });
    return;
  }
  const orgId = orgIdOf(req);
  const org = req.auth!.org;
  if (["active", "trialing", "past_due"].includes(org.subscription?.status)) {
    res.status(409).json({ error: "You already have a subscription. Use Manage billing to change plans." });
    return;
  }
  let customerId = org.subscription?.customerId as string | undefined;
  if (!customerId) {
    const customer = await stripe().customers.create(
      { email: req.auth!.email, name: org.name, metadata: { orgId } },
      { idempotencyKey: `customer-${orgId}` },
    );
    customerId = customer.id;
    await store.set(paths.org(orgId), { subscription: { customerId } });
  }
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: orgId,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { orgId, plan },
      ...(org.trialUsed ? {} : { trial_period_days: config.stripe.trialDays }),
    },
    metadata: { orgId, plan, kind: "subscription" },
    success_url: `${config.appUrl}/?billing=success`,
    cancel_url: `${config.appUrl}/?billing=canceled`,
  });
  res.json({ url: session.url });
});

router.post("/api/billing/portal", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const customerId = req.auth!.org.subscription?.customerId;
  if (!customerId) {
    res.status(400).json({ error: "Start a plan first." });
    return;
  }
  const session = await stripe().billingPortal.sessions.create({ customer: customerId, return_url: `${config.appUrl}/?tab=settings` });
  res.json({ url: session.url });
});

async function syncSubscription(sub: Stripe.Subscription) {
  let orgId = sub.metadata?.orgId;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  if (!orgId) {
    const rows = await store.list("orgs", { where: [["subscription.customerId", customerId]], limit: 1 });
    orgId = rows[0]?.id;
  }
  if (!orgId) {
    console.warn("[stripe] subscription without a matching company:", sub.id);
    return;
  }
  const item = sub.items?.data?.[0] as any;
  const periodEnd = (sub as any).current_period_end ?? item?.current_period_end;
  const plan = planForPrice(item?.price?.id) || (isPlanId(sub.metadata?.plan) ? sub.metadata.plan : null);
  await store.set(paths.org(orgId), {
    ...(plan ? { plan } : {}),
    trialUsed: true,
    subscription: {
      id: sub.id,
      customerId,
      status: sub.status,
      priceId: item?.price?.id || "",
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      updatedAt: nowIso(),
    },
  });
}

// ---------------------------------------------------------------------------
// Stripe Connect (Express) — painting companies collect invoice payments
// ---------------------------------------------------------------------------
async function syncConnectAccount(account: Stripe.Account) {
  const orgId = account.metadata?.orgId;
  if (!orgId) return;
  await store.set(paths.org(orgId), {
    integrations: {
      stripeConnect: {
        accountId: account.id,
        chargesEnabled: !!account.charges_enabled,
        payoutsEnabled: !!account.payouts_enabled,
        detailsSubmitted: !!account.details_submitted,
        updatedAt: nowIso(),
      },
    },
  });
}

router.post("/api/billing/connect/start", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const orgId = orgIdOf(req);
  const org = req.auth!.org;
  let accountId = org.integrations?.stripeConnect?.accountId as string | undefined;
  if (!accountId) {
    const account = await stripe().accounts.create(
      {
        type: "express",
        country: "US",
        email: org.profile?.email || req.auth!.email,
        business_profile: { name: org.name, mcc: "1799", product_description: "Painting services" },
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { orgId },
      },
      { idempotencyKey: `connect-account-${orgId}` },
    );
    accountId = account.id;
    await syncConnectAccount(account);
  }
  const link = await stripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${config.appUrl}/?tab=settings&connect=refresh`,
    return_url: `${config.appUrl}/?tab=settings&connect=return`,
  });
  res.json({ url: link.url });
});

router.post("/api/billing/connect/sync", requireAuth, requireOrg, async (req, res) => {
  const accountId = req.auth!.org.integrations?.stripeConnect?.accountId;
  if (!accountId) {
    res.json({ connected: false });
    return;
  }
  const account = await stripe().accounts.retrieve(accountId);
  await syncConnectAccount(account);
  res.json({ connected: true, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, detailsSubmitted: account.details_submitted });
});

router.post("/api/billing/connect/dashboard", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const accountId = req.auth!.org.integrations?.stripeConnect?.accountId;
  if (!accountId) {
    res.status(400).json({ error: "Connect Stripe first." });
    return;
  }
  const link = await stripe().accounts.createLoginLink(accountId);
  res.json({ url: link.url });
});

/** Creates a hosted Checkout page for a customer to pay an invoice. Amount is computed server-side. */
export async function createInvoiceCheckout(orgId: string, org: any, invoice: any, publicToken: string) {
  const acct = org.integrations?.stripeConnect;
  if (!acct?.accountId || !acct.chargesEnabled) throw Object.assign(new Error("Online payment isn't available for this invoice. Please contact the company."), { status: 400 });
  const due = Math.round((Number(invoice.total) - Number(invoice.amountPaid || 0)) * 100);
  if (due < 50) throw Object.assign(new Error("Nothing is due on this invoice."), { status: 400 });
  const fee = Math.floor((due * config.stripe.platformFeeBps) / 10000);
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.clientEmail || undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: due,
        product_data: { name: `Invoice ${invoice.number} — ${org.name}` },
      },
    }],
    payment_intent_data: {
      on_behalf_of: acct.accountId,
      transfer_data: { destination: acct.accountId },
      ...(fee > 0 ? { application_fee_amount: fee } : {}),
      metadata: { orgId, invoiceId: invoice.id, kind: "invoice" },
    },
    metadata: { orgId, invoiceId: invoice.id, kind: "invoice", amountCents: String(due) },
    success_url: `${config.appUrl}/i/${publicToken}?paid=1`,
    cancel_url: `${config.appUrl}/i/${publicToken}`,
  });
  return session.url!;
}

async function markInvoicePaid(session: Stripe.Checkout.Session) {
  const { orgId, invoiceId } = session.metadata || {};
  if (!orgId || !invoiceId || session.payment_status !== "paid") return;
  const path = paths.orgDoc(orgId, "invoices", invoiceId);
  const inv = await store.get(path);
  if (!inv) return;
  // Idempotent: record by session id, then recompute the total paid.
  const payments = { ...(inv.payments || {}), [session.id]: { amount: (session.amount_total || 0) / 100, at: nowIso(), method: "Card (Stripe)" } };
  const amountPaid = Math.round((Object.values(payments) as any[]).reduce((s: number, p: any) => s + Number(p.amount || 0), 0) * 100) / 100;
  const paid = amountPaid + 0.005 >= Number(inv.total);
  await store.set(path, {
    payments,
    amountPaid,
    status: paid ? "Paid" : inv.status,
    ...(paid ? { paidAt: nowIso(), paymentMethod: "Card (Stripe)" } : {}),
  });
  if (paid && inv.leadId) {
    await store.set(paths.orgDoc(orgId, "leads", inv.leadId), { status: "Won", updatedAt: nowIso() });
  }
}

// ---------------------------------------------------------------------------
// Webhooks (raw body + signature verification + idempotency)
// ---------------------------------------------------------------------------
async function alreadyProcessed(event: Stripe.Event) {
  const fresh = await store.create(paths.stripeEvent(event.id), { type: event.type, at: nowIso() });
  return !fresh;
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe().subscriptions.retrieve(String(session.subscription));
        await syncSubscription(sub);
      } else if (session.metadata?.kind === "invoice") {
        await markInvoicePaid(session);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    case "account.updated":
      await syncConnectAccount(event.data.object as Stripe.Account);
      break;
    default:
      break;
  }
}

function webhookHandler(secret: () => string) {
  return async (req: express.Request, res: express.Response) => {
    const sig = req.headers["stripe-signature"];
    let event: Stripe.Event;
    try {
      if (!secret()) throw new Error("Webhook secret is not configured.");
      event = stripe().webhooks.constructEvent(req.body as Buffer, String(sig || ""), secret());
    } catch (err: any) {
      res.status(400).send(`Webhook signature verification failed: ${err.message}`);
      return;
    }
    if (await alreadyProcessed(event)) {
      res.json({ received: true, duplicate: true });
      return;
    }
    try {
      await handleEvent(event);
      res.json({ received: true });
    } catch (err) {
      // Let Stripe retry: forget that we saw it.
      await store.remove(paths.stripeEvent(event.id));
      console.error("[stripe] webhook handler failed:", err);
      res.status(500).json({ error: "Handler failed" });
    }
  };
}

// Mounted in server.ts BEFORE express.json() so the raw body is preserved.
export const stripeWebhookRouter = Router();
stripeWebhookRouter.post("/api/webhooks/stripe", express.raw({ type: "application/json", limit: "1mb" }), webhookHandler(() => config.stripe.webhookSecret));
stripeWebhookRouter.post("/api/webhooks/stripe-connect", express.raw({ type: "application/json", limit: "1mb" }), webhookHandler(() => config.stripe.connectWebhookSecret));

export default router;
