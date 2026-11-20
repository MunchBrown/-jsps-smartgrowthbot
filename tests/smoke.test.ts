// End-to-end smoke test of the core workflow against an in-memory database.
// Run with: npm test
process.env.DATA_STORE = "memory";
process.env.ALLOW_TEST_AUTH = "1";
process.env.NO_LISTEN = "1";
process.env.NODE_ENV = "test";
process.env.APP_URL = "http://localhost:3999";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_dummy";
delete process.env.GEMINI_API_KEY;

import assert from "node:assert/strict";
import crypto from "node:crypto";

const { app } = await import("../server");
const { store, paths } = await import("../server/store");
const { encrypt } = await import("../server/crypto");

const server = app.listen(3999);
const base = "http://localhost:3999";
let passed = 0;

async function call(method: string, url: string, opts: { token?: string; body?: any; form?: Record<string, string>; headers?: any } = {}) {
  const headers: any = { ...(opts.headers || {}) };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  let body: any;
  if (opts.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(opts.form).toString();
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }
  const res = await fetch(base + url, { method, headers, body, redirect: "manual" });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, headers: res.headers };
}

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

const OWNER = "test:owner1:owner@acmepainting.com";
const OTHER = "test:owner2:boss@rivalpainting.com";
let orgId = "", otherOrgId = "", leadId = "", estimateId = "", estToken = "", invoiceId = "", invToken = "";

try {
  await step("API rejects requests without a login", async () => {
    const r = await call("GET", "/api/me");
    assert.equal(r.status, 401);
  });

  await step("new user has no company yet", async () => {
    const r = await call("GET", "/api/me", { token: OWNER });
    assert.equal(r.status, 200);
    assert.equal(r.json.org, null);
  });

  await step("owner creates a company workspace", async () => {
    const r = await call("POST", "/api/onboarding", { token: OWNER, body: { companyName: "Acme Painting", ownerName: "Ann Owner", phone: "717-555-0100" } });
    assert.equal(r.status, 201, r.text);
    orgId = r.json.org.id;
    assert.equal(r.json.org.subscription.status, "none");
  });

  await step("workspace is locked until a plan/trial starts", async () => {
    const r = await call("GET", "/api/leads", { token: OWNER });
    assert.equal(r.status, 402);
    assert.equal(r.json.code, "NO_SUBSCRIPTION");
  });

  await step("checkout refuses an unknown plan", async () => {
    const r = await call("POST", "/api/billing/checkout", { token: OWNER, body: { plan: "gold" } });
    assert.equal(r.status, 400);
  });

  // Simulate what the Stripe webhook does after checkout.
  await store.set(paths.org(orgId), { plan: "starter", subscription: { status: "trialing" } });

  await step("lead is created and needs a phone or email", async () => {
    const bad = await call("POST", "/api/leads", { token: OWNER, body: { clientName: "No Contact" } });
    assert.equal(bad.status, 400);
    const r = await call("POST", "/api/leads", { token: OWNER, body: { clientName: "Pat Homeowner", phone: "(717) 555-0142", email: "pat@example.com", projectDescription: "Exterior repaint", budget: 6000 } });
    assert.equal(r.status, 201, r.text);
    leadId = r.json.id;
    assert.equal(r.json.phoneE164, "+17175550142");
    assert.equal(r.json.score, null, "no fake AI score when AI is unavailable");
  });

  await step("AI call is blocked without recorded consent", async () => {
    const r = await call("POST", `/api/leads/${leadId}/call`, { token: OWNER });
    assert.equal(r.status, 400);
    assert.match(r.json.error, /consent/i);
  });

  await step("AI call explains Vapi isn't connected once consent is recorded", async () => {
    await call("PATCH", `/api/leads/${leadId}`, { token: OWNER, body: { contactConsent: true, consentMethod: "Signed estimate request form" } });
    const r = await call("POST", `/api/leads/${leadId}/call`, { token: OWNER });
    assert.equal(r.status, 400);
    assert.match(r.json.error, /Connect Vapi/);
  });

  await step("another company can't see or change this company's leads", async () => {
    await call("POST", "/api/onboarding", { token: OTHER, body: { companyName: "Rival Painting" } });
    otherOrgId = (await call("GET", "/api/me", { token: OTHER })).json.org.id;
    await store.set(paths.org(otherOrgId), { plan: "starter", subscription: { status: "active" } });
    const list = await call("GET", "/api/leads", { token: OTHER });
    assert.equal(list.json.total, 0);
    const get = await call("GET", `/api/leads/${leadId}`, { token: OTHER });
    assert.equal(get.status, 404);
    const del = await call("DELETE", `/api/leads/${leadId}`, { token: OTHER });
    assert.equal(del.status, 404);
  });

  await step("estimate totals are computed on the server", async () => {
    const r = await call("POST", "/api/estimates", {
      token: OWNER,
      body: { leadId, projectType: "Exterior repaint", taxRate: 6, total: 1, lineItems: [{ description: "Prep & prime", qty: 1, unitPrice: 1200 }, { description: "Two coats siding", qty: 2, unitPrice: 1650.5 }] },
    });
    assert.equal(r.status, 201, r.text);
    estimateId = r.json.id;
    assert.equal(r.json.subtotal, 4501);
    assert.equal(r.json.tax, 270.06);
    assert.equal(r.json.total, 4771.06);
    assert.equal(r.json.clientName, "Pat Homeowner");
  });

  await step("estimate send by email explains Gmail isn't connected", async () => {
    const r = await call("POST", `/api/estimates/${estimateId}/send`, { token: OWNER, body: { channel: "email" } });
    assert.equal(r.status, 400);
    assert.match(r.json.error, /Connect Google/);
  });

  await step("estimate share link works and the customer can accept it", async () => {
    const r = await call("POST", `/api/estimates/${estimateId}/send`, { token: OWNER, body: { channel: "link" } });
    assert.equal(r.status, 200, r.text);
    estToken = r.json.link.split("/e/")[1];
    const leadAfterSend = await call("GET", `/api/leads/${leadId}`, { token: OWNER });
    assert.equal(leadAfterSend.json.lead.status, "Quoted");
    const page = await call("GET", `/e/${estToken}`);
    assert.equal(page.status, 200);
    assert.match(page.text, /\$4,771\.06/);
    const missing = await call("POST", `/e/${estToken}/respond`, { form: { decision: "accept", name: "" } });
    assert.equal(missing.status, 400);
    const ok = await call("POST", `/e/${estToken}/respond`, { form: { decision: "accept", name: "Pat Homeowner", agree: "1" } });
    assert.equal(ok.status, 200);
    assert.match(ok.text, /accepted/i);
    const est = (await call("GET", "/api/estimates", { token: OWNER })).json.find((e: any) => e.id === estimateId);
    assert.equal(est.status, "Accepted");
    assert.equal((await call("GET", `/api/leads/${leadId}`, { token: OWNER })).json.lead.status, "Won");
  });

  await step("public links reject guessed or wrong-type tokens", async () => {
    assert.equal((await call("GET", "/e/not-a-real-token-123")).status, 404);
    assert.equal((await call("GET", `/i/${estToken}`)).status, 404);
  });

  await step("deposit invoice is created from the accepted estimate", async () => {
    const r = await call("POST", `/api/estimates/${estimateId}/invoice`, { token: OWNER, body: { depositPercent: 30 } });
    assert.equal(r.status, 201, r.text);
    invoiceId = r.json.id;
    assert.equal(r.json.total, 1431.32);
    const send = await call("POST", `/api/invoices/${invoiceId}/send`, { token: OWNER, body: { channel: "link" } });
    assert.equal(send.json.canPayOnline, false);
    invToken = send.json.link.split("/i/")[1];
    const page = await call("GET", `/i/${invToken}`);
    assert.match(page.text, /Contact Acme Painting for payment options/);
    const pay = await call("POST", `/i/${invToken}/pay`);
    assert.equal(pay.status, 400, "no online payment until Stripe Connect is finished");
  });

  await step("invoice can be marked paid by check, then can't be voided", async () => {
    const r = await call("PATCH", `/api/invoices/${invoiceId}`, { token: OWNER, body: { markPaid: true, paymentMethod: "Check" } });
    assert.equal(r.json.status, "Paid");
    const v = await call("PATCH", `/api/invoices/${invoiceId}`, { token: OWNER, body: { void: true } });
    assert.equal(v.status, 400);
  });

  await step("appointment is saved even without Google connected", async () => {
    const r = await call("POST", "/api/appointments", { token: OWNER, body: { title: "Estimate - Pat", leadId, start: "2030-05-02T14:00:00.000Z", durationMinutes: 60 } });
    assert.equal(r.status, 201, r.text);
    assert.equal(r.json.end, "2030-05-02T15:00:00.000Z");
  });

  await step("hosted lead form creates a lead with consent, honeypot blocks bots", async () => {
    const r = await call("POST", "/api/integrations/leadform", { token: OWNER });
    const token = r.json.url.split("/f/")[1];
    assert.equal((await call("GET", `/f/${token}`)).status, 200);
    const sub = await call("POST", `/f/${token}`, { form: { clientName: "Web Visitor", phone: "7175550199", contactConsent: "1", service: "Interior painting" } });
    assert.equal(sub.status, 200, sub.text);
    const bot = await call("POST", `/f/${token}`, { form: { clientName: "Bot", phone: "7175550000", company_website: "spam.example" } });
    assert.equal(bot.status, 200);
    const leads = (await call("GET", "/api/leads", { token: OWNER })).json.leads;
    const web = leads.find((l: any) => l.clientName === "Web Visitor");
    assert.ok(web);
    assert.equal(web.contactConsent.given, true);
    assert.ok(!leads.find((l: any) => l.clientName === "Bot"));
  });

  await step("Vapi webhook requires the company's secret and logs the call", async () => {
    const secrets = await store.get(paths.secrets(orgId));
    const payload = { message: { type: "end-of-call-report", call: { id: "call_abc", type: "outboundPhoneCall", customer: { number: "+17175550142" }, metadata: { leadId } }, analysis: { summary: "Booked estimate Thursday" }, artifact: { transcript: "AI: Hi..." }, durationSeconds: 95 } };
    assert.equal((await call("POST", `/api/webhooks/vapi/${orgId}`, { body: payload, headers: { "x-vapi-secret": "wrong" } })).status, 401);
    const ok = await call("POST", `/api/webhooks/vapi/${orgId}`, { body: payload, headers: { "x-vapi-secret": secrets.webhookSecret } });
    assert.equal(ok.status, 200);
    const calls = (await call("GET", `/api/calls?leadId=${leadId}`, { token: OWNER })).json;
    assert.equal(calls[0].summary, "Booked estimate Thursday");
    assert.equal((await call("GET", "/api/calls", { token: OTHER })).json.length, 0);
  });

  await step("Twilio webhook checks the signature and honors STOP", async () => {
    const authToken = "test_twilio_auth_token";
    await store.set(paths.secrets(orgId), { twilio: { accountSid: "AC" + "0".repeat(32), authTokenEnc: encrypt(authToken), fromNumber: "+17175550000" } });
    const url = `http://localhost:3999/api/webhooks/twilio/${orgId}`;
    const params = { From: "+17175550142", Body: "STOP", MessageSid: "SM1" };
    const data = Object.keys(params).sort().reduce((a, k) => a + k + (params as any)[k], url);
    const sig = crypto.createHmac("sha1", authToken).update(data).digest("base64");
    assert.equal((await call("POST", `/api/webhooks/twilio/${orgId}`, { form: params, headers: { "x-twilio-signature": "bad" } })).status, 403);
    const ok = await call("POST", `/api/webhooks/twilio/${orgId}`, { form: params, headers: { "x-twilio-signature": sig } });
    assert.equal(ok.status, 200);
    const detail = (await call("GET", `/api/leads/${leadId}`, { token: OWNER })).json;
    assert.equal(detail.lead.smsOptOut, true);
    assert.equal(detail.messages.at(-1).body, "STOP");
    const text = await call("POST", `/api/leads/${leadId}/text`, { token: OWNER, body: { body: "Hi again" } });
    assert.equal(text.status, 400);
    assert.match(text.json.error, /opted out/);
  });

  await step("Stripe webhook rejects unsigned events", async () => {
    const r = await call("POST", "/api/webhooks/stripe", { body: { id: "evt_1", type: "customer.subscription.updated" }, headers: { "stripe-signature": "t=1,v1=bad" } });
    assert.equal(r.status, 400);
  });

  await step("signed Stripe events update the subscription and pay invoices exactly once", async () => {
    const Stripe = (await import("stripe")).default;
    const s = new Stripe("sk_test_dummy");
    const send = async (event: any) => {
      const payload = JSON.stringify(event);
      const header = s.webhooks.generateTestHeaderString({ payload, secret: "whsec_dummy" });
      return call("POST", "/api/webhooks/stripe", { body: payload, headers: { "stripe-signature": header } });
    };
    const subEvent = {
      id: "evt_sub_1", object: "event", type: "customer.subscription.updated",
      data: { object: { id: "sub_1", object: "subscription", customer: "cus_1", status: "active", cancel_at_period_end: false, trial_end: null,
        metadata: { orgId, plan: "professional" }, items: { data: [{ price: { id: "price_x" }, current_period_end: 1900000000 }] } } },
    };
    assert.equal((await send(subEvent)).status, 200);
    const org = await store.get(paths.org(orgId));
    assert.equal(org.subscription.status, "active");
    assert.equal(org.plan, "professional");

    const inv = await call("POST", "/api/invoices", { token: OWNER, body: { clientName: "Pat Homeowner", lineItems: [{ description: "Balance", qty: 1, unitPrice: 500 }] } });
    const paidEvent = {
      id: "evt_pay_1", object: "event", type: "checkout.session.completed",
      data: { object: { id: "cs_1", object: "checkout.session", mode: "payment", payment_status: "paid", amount_total: 50000, metadata: { kind: "invoice", orgId, invoiceId: inv.json.id } } },
    };
    assert.equal((await send(paidEvent)).status, 200);
    const dup = await send(paidEvent);
    assert.equal(dup.json.duplicate, true);
    const after = (await call("GET", "/api/invoices", { token: OWNER })).json.find((i: any) => i.id === inv.json.id);
    assert.equal(after.status, "Paid");
    assert.equal(after.amountPaid, 500);
    await store.set(paths.org(orgId), { plan: "starter" });
  });

  await step("Starter plan seat limit blocks a second user", async () => {
    const r = await call("POST", "/api/team/invite", { token: OWNER, body: { email: "crew@acmepainting.com" } });
    assert.equal(r.status, 403);
    assert.match(r.json.error, /seat/);
  });

  await step("AI tools require a login and report missing AI config honestly", async () => {
    assert.equal((await call("POST", "/api/seo", { body: { topic: "a", keyword: "b" } })).status, 401);
    const r = await call("POST", "/api/ai/complete", { token: OWNER, body: { prompt: "hello", apiKey: "attacker", baseUrl: "http://169.254.169.254" } });
    assert.equal(r.status, 500);
    assert.match(r.json.error, /GEMINI_API_KEY/);
  });

  await step("dashboard summarizes real data", async () => {
    const r = await call("GET", "/api/dashboard", { token: OWNER });
    assert.equal(r.status, 200);
    assert.equal(r.json.leads.total, 2);
    assert.equal(r.json.estimates.acceptedValue, 4771.06);
    assert.equal(r.json.upcoming.length, 1);
  });

  await step("Google OAuth callback is reachable without a login and rejects bad state", async () => {
    const r = await call("GET", "/api/integrations/google/callback?state=forged&code=x");
    assert.equal(r.status, 302);
    assert.match(r.headers.get("location") || "", /google=error/);
  });

  await step("platform admin can give a company free beta access without Stripe", async () => {
    process.env.PLATFORM_ADMIN_EMAILS = "owner@acmepainting.com";
    const beta = await call("POST", "/api/onboarding", { token: "test:beta1:beta@newpainter.com", body: { companyName: "Beta Painters" } });
    const betaId = beta.json.org.id;
    assert.equal((await call("GET", "/api/leads", { token: "test:beta1:beta@newpainter.com" })).status, 402);
    assert.equal((await call("GET", "/api/admin/orgs", { token: OTHER })).status, 403, "non-admins are refused");
    const list = await call("GET", "/api/admin/orgs", { token: OWNER });
    assert.ok(list.json.find((o: any) => o.id === betaId));
    const g = await call("POST", `/api/admin/orgs/${betaId}/beta`, { token: OWNER, body: { plan: "professional", days: 90 } });
    assert.equal(g.status, 200, g.text);
    const me = (await call("GET", "/api/me", { token: "test:beta1:beta@newpainter.com" })).json;
    assert.equal(me.org.hasAccess, true);
    assert.equal(me.org.plan, "professional");
    assert.equal((await call("GET", "/api/leads", { token: "test:beta1:beta@newpainter.com" })).status, 200);
    await call("DELETE", `/api/admin/orgs/${betaId}/beta`, { token: OWNER });
    assert.equal((await call("GET", "/api/leads", { token: "test:beta1:beta@newpainter.com" })).status, 402);
    await store.set(paths.org(betaId), { comp: { active: true, plan: "starter", until: "2020-01-01T00:00:00.000Z" } });
    assert.equal((await call("GET", "/api/leads", { token: "test:beta1:beta@newpainter.com" })).status, 402, "expired beta locks again");
    process.env.PLATFORM_ADMIN_EMAILS = "";
  });

  await step("unknown API routes return 404 JSON", async () => {
    const r = await call("GET", "/api/nope", { token: OWNER });
    assert.equal(r.status, 404);
  });

  console.log(`\n${passed} checks passed.`);
} finally {
  server.close();
}
process.exit(0);
