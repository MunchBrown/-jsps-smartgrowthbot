// Routes the public internet reaches without signing in: customer-facing
// estimate / invoice / lead-form pages, and webhooks from Vapi and Twilio.
// Each one proves who it is (unguessable token, shared secret or signature).
import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import { store, paths, nowIso } from "../store";
import { config } from "../config";
import { safeEqual } from "../crypto";
import { decrypt } from "../crypto";
import { str, ValidationError } from "../validate";
import { cleanLeadInput, createLead, findLeadByPhone } from "../leads";
import { getSecrets, validTwilioSignature, toE164, sendEmail } from "../integrations";
import { estimatePage, invoicePage, leadFormPage, messagePage } from "../publicPages";
import { createInvoiceCheckout } from "./billing";
import { usd } from "../money";

const router = Router();
const form = express.urlencoded({ extended: false, limit: "50kb" });
const publicPostLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

async function resolveToken(token: string, type: string) {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(token)) return null;
  const t = await store.get(paths.publicToken(token));
  if (!t || t.type !== type) return null;
  const org = await store.get(paths.org(t.orgId));
  if (!org) return null;
  return { orgId: t.orgId as string, id: t.id as string, org };
}

const notFound = (res: express.Response) =>
  res.status(404).send(messagePage({ name: "" }, "Link not found", "This link is invalid or has been removed."));

/** Best-effort heads-up to the company owner. Never blocks the customer. */
async function notifyCompany(orgId: string, org: any, subject: string, text: string) {
  const to = org.profile?.email;
  if (!to) return;
  try {
    await sendEmail(orgId, { to, subject, text });
  } catch {}
}

// ---- Estimates --------------------------------------------------------------
router.get("/e/:token", async (req, res) => {
  const r = await resolveToken(req.params.token, "estimate");
  if (!r) return notFound(res);
  const est = await store.get(paths.orgDoc(r.orgId, "estimates", r.id));
  if (!est) return notFound(res);
  if (!est.viewedAt) await store.set(paths.orgDoc(r.orgId, "estimates", r.id), { viewedAt: nowIso() });
  res.send(estimatePage(r.org, est, req.params.token));
});

router.post("/e/:token/respond", publicPostLimit, form, async (req, res) => {
  const r = await resolveToken(req.params.token, "estimate");
  if (!r) return notFound(res);
  const path = paths.orgDoc(r.orgId, "estimates", r.id);
  const est = await store.get(path);
  if (!est) return notFound(res);
  if (est.status === "Accepted" || est.status === "Declined") return res.send(estimatePage(r.org, est, req.params.token));
  const decision = req.body?.decision === "decline" ? "decline" : "accept";
  if (decision === "accept") {
    const name = String(req.body?.name || "").trim().slice(0, 120);
    if (!name || req.body?.agree !== "1") {
      return res.status(400).send(estimatePage(r.org, est, req.params.token, "Type your name and tick the box to accept."));
    }
    const patch = { status: "Accepted", acceptedAt: nowIso(), acceptedName: name, acceptedIp: req.ip };
    await store.set(path, patch);
    if (est.leadId) await store.set(paths.orgDoc(r.orgId, "leads", est.leadId), { status: "Won", updatedAt: nowIso() });
    notifyCompany(r.orgId, r.org, `Estimate ${est.number} accepted — ${usd(est.total)}`, `${name} accepted estimate ${est.number} for ${est.clientName} (${usd(est.total)}). Open Smart Growth Bot to schedule the job and send a deposit invoice.`);
    return res.send(estimatePage(r.org, { ...est, ...patch }, req.params.token, "Thank you — your estimate is accepted."));
  }
  const patch = { status: "Declined", declinedAt: nowIso() };
  await store.set(path, patch);
  notifyCompany(r.orgId, r.org, `Estimate ${est.number} declined`, `${est.clientName} declined estimate ${est.number} (${usd(est.total)}).`);
  res.send(estimatePage(r.org, { ...est, ...patch }, req.params.token, "Thanks for letting us know."));
});

// ---- Invoices ---------------------------------------------------------------
router.get("/i/:token", async (req, res) => {
  const r = await resolveToken(req.params.token, "invoice");
  if (!r) return notFound(res);
  const inv = await store.get(paths.orgDoc(r.orgId, "invoices", r.id));
  if (!inv) return notFound(res);
  if (!inv.viewedAt) await store.set(paths.orgDoc(r.orgId, "invoices", r.id), { viewedAt: nowIso() });
  const canPay = !!r.org.integrations?.stripeConnect?.chargesEnabled && !!config.stripe.secretKey;
  res.send(invoicePage(r.org, inv, req.params.token, { paidNow: req.query.paid === "1", canPay }));
});

router.post("/i/:token/pay", publicPostLimit, async (req, res) => {
  const r = await resolveToken(req.params.token, "invoice");
  if (!r) return notFound(res);
  const inv = await store.get(paths.orgDoc(r.orgId, "invoices", r.id));
  if (!inv || inv.status === "Paid" || inv.status === "Void") return res.redirect(303, `/i/${req.params.token}`);
  try {
    const url = await createInvoiceCheckout(r.orgId, r.org, inv, req.params.token);
    res.redirect(303, url);
  } catch (err: any) {
    res.status(400).send(messagePage(r.org, "Payment unavailable", err.message));
  }
});

// ---- Lead capture form (hosted page + JSON API for websites) ----------------
async function captureLead(token: string, body: any, ip?: string) {
  const r = await resolveToken(token, "leadform");
  if (!r) return null;
  if (body.company_website) return { r, spam: true }; // honeypot
  const consent = body.contactConsent === "1" || body.contactConsent === true;
  const input = cleanLeadInput({
    clientName: body.clientName ?? body.name,
    phone: body.phone,
    email: body.email,
    clientType: ["Residential", "Commercial"].includes(body.clientType) ? body.clientType : "Residential",
    address: body.address,
    projectDescription: [str(body.service, "Service", { max: 80 }), str(body.projectDescription ?? body.message, "Project", { max: 2000 })].filter(Boolean).join(" — "),
    timeline: body.timeline,
  });
  const lead = await createLead(r.orgId, r.org, input, {
    source: str(body.source, "Source", { max: 80 }) || "Website form",
    contactConsent: consent ? { given: true, method: "Web form checkbox", at: nowIso(), ip } : { given: false },
  });
  notifyCompany(r.orgId, r.org, `New lead: ${lead.clientName}`, `${lead.clientName} (${lead.phone || lead.email}) requested an estimate.\n${lead.projectDescription || ""}\n\nOpen Smart Growth Bot to follow up.`);
  return { r, lead };
}

router.get("/f/:token", async (req, res) => {
  const r = await resolveToken(req.params.token, "leadform");
  if (!r) return notFound(res);
  res.send(leadFormPage(r.org, req.params.token));
});

router.post("/f/:token", publicPostLimit, form, async (req, res) => {
  try {
    const out = await captureLead(req.params.token, req.body || {}, req.ip);
    if (!out) return notFound(res);
    res.send(messagePage(out.r.org, "Thank you!", `${out.r.org.name} received your request and will contact you shortly.`));
  } catch (err: any) {
    const r = await resolveToken(req.params.token, "leadform");
    if (!r) return notFound(res);
    const msg = err instanceof ValidationError && !/lead limit/.test(err.message) ? err.message : "We couldn't submit your request right now. Please call us instead.";
    res.status(400).send(leadFormPage(r.org, req.params.token, msg));
  }
});

router.options("/api/public/leads/:token", (_req, res) => {
  res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" }).sendStatus(204);
});

router.post("/api/public/leads/:token", publicPostLimit, express.json({ limit: "50kb" }), form, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  try {
    const out = await captureLead(req.params.token, req.body || {}, req.ip);
    if (!out) return res.status(404).json({ error: "Unknown form." });
    res.status(201).json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err instanceof ValidationError && !/lead limit/.test(err.message) ? err.message : "Could not submit right now." });
  }
});

// ---- Vapi call webhook --------------------------------------------------------
router.post("/api/webhooks/vapi/:orgId", express.json({ limit: "5mb" }), async (req, res) => {
  const orgId = String(req.params.orgId);
  const org = /^[A-Za-z0-9_-]{8,40}$/.test(orgId) ? await store.get(paths.org(orgId)) : null;
  const secrets = org ? await getSecrets(orgId) : {};
  const given = String(req.headers["x-vapi-secret"] || "");
  if (!org || !secrets.webhookSecret || !safeEqual(given, secrets.webhookSecret)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const message = req.body?.message;
  if (message?.type !== "end-of-call-report") {
    res.json({ received: true });
    return;
  }
  const call = message.call || {};
  const customer = call.customer || message.customer || {};
  const phone = toE164(customer.number || "");
  const inbound = call.type === "inboundPhoneCall";
  let leadId = call.metadata?.leadId || call.assistantOverrides?.metadata?.leadId || "";
  if (leadId && !(await store.get(paths.orgDoc(orgId, "leads", leadId)))) leadId = "";
  if (!leadId && phone) leadId = (await findLeadByPhone(orgId, phone))?.id || "";
  if (!leadId && inbound && phone) {
    try {
      const lead = await createLead(orgId, org, cleanLeadInput({ clientName: customer.name || "Phone caller", phone }), {
        source: "AI phone (inbound)",
        projectDescription: String(message.analysis?.summary || message.summary || "").slice(0, 2000),
        contactConsent: { given: false },
      });
      leadId = lead.id;
    } catch (err) {
      console.warn("[vapi] could not create lead for inbound call:", (err as Error).message);
    }
  }
  const callId = String(call.id || `vapi-${Date.now()}`);
  const transcript = String(message.artifact?.transcript || message.transcript || "").slice(0, 100_000);
  await store.set(paths.orgDoc(orgId, "calls", callId), {
    id: callId,
    vapiCallId: callId,
    leadId,
    callerName: customer.name || "",
    phoneNumber: phone || customer.number || "",
    direction: inbound ? "inbound" : "outbound",
    status: "ended",
    endedReason: message.endedReason || "",
    durationSeconds: Math.round(Number(message.durationSeconds || 0)),
    summary: String(message.analysis?.summary || message.summary || "").slice(0, 5000),
    transcript,
    recordingUrl: message.artifact?.recordingUrl || message.recordingUrl || "",
    startedAt: message.startedAt || "",
    endedAt: message.endedAt || nowIso(),
    createdAt: message.startedAt || nowIso(),
  });
  if (leadId) await store.set(paths.orgDoc(orgId, "leads", leadId), { lastContactAt: nowIso(), updatedAt: nowIso() });
  res.json({ received: true });
});

// ---- Twilio incoming text webhook ---------------------------------------------
const STOP_WORDS = new Set(["stop", "stopall", "unsubscribe", "cancel", "end", "quit", "revoke", "optout"]);
const START_WORDS = new Set(["start", "unstop", "yes"]);

router.post("/api/webhooks/twilio/:orgId", form, async (req, res) => {
  const orgId = String(req.params.orgId);
  const org = /^[A-Za-z0-9_-]{8,40}$/.test(orgId) ? await store.get(paths.org(orgId)) : null;
  const secrets = org ? await getSecrets(orgId) : {};
  const token = decrypt(secrets.twilio?.authTokenEnc);
  const url = `${config.appUrl}${req.originalUrl}`;
  if (!org || !token || !validTwilioSignature(token, url, req.body || {}, String(req.headers["x-twilio-signature"] || ""))) {
    res.status(403).send("Forbidden");
    return;
  }
  const from = toE164(String(req.body.From || ""));
  const body = String(req.body.Body || "").slice(0, 1600);
  let lead = await findLeadByPhone(orgId, from);
  if (!lead && from) {
    try {
      lead = await createLead(orgId, org, cleanLeadInput({ clientName: "Text message contact", phone: from }), {
        source: "Inbound text",
        projectDescription: body.slice(0, 500),
        contactConsent: { given: false },
      });
    } catch {}
  }
  const keyword = body.trim().toLowerCase();
  if (lead && STOP_WORDS.has(keyword)) await store.set(paths.orgDoc(orgId, "leads", lead.id), { smsOptOut: true, smsOptOutAt: nowIso() });
  if (lead && START_WORDS.has(keyword) && lead.smsOptOut) await store.set(paths.orgDoc(orgId, "leads", lead.id), { smsOptOut: false });
  await store.add(paths.orgCol(orgId, "messages"), {
    leadId: lead?.id || "",
    direction: "inbound",
    channel: "sms",
    from,
    body,
    twilioSid: String(req.body.MessageSid || ""),
    createdAt: nowIso(),
  });
  if (lead) await store.set(paths.orgDoc(orgId, "leads", lead.id), { lastContactAt: nowIso(), updatedAt: nowIso(), hasUnread: true });
  res.type("text/xml").send("<Response></Response>");
});

export default router;
