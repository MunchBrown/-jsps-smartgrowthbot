// The core workflow: leads → AI calls / texts → appointments → estimates →
// invoices. Every route is scoped to the signed-in user's company.
import { Router } from "express";
import { requireAuth, requireOrg, requireSubscription, orgIdOf } from "../auth";
import { store, paths, nowIso } from "../store";
import { str, email as emailField, num, oneOf, isoDate, bool, ValidationError } from "../validate";
import { cleanLeadInput, createLead, LEAD_STATUSES } from "../leads";
import { priceLines, docNumber, usd } from "../money";
import { randomToken } from "../crypto";
import {
  placeVapiCall, sendSms, sendEmail, createCalendarEvent, deleteCalendarEvent, toE164, IntegrationError,
} from "../integrations";
import { config } from "../config";

const router = Router();
router.use("/api", requireAuth, requireOrg, requireSubscription);

const col = (req: any, name: string) => paths.orgCol(orgIdOf(req), name);
const docPath = (req: any, name: string, id: string) => paths.orgDoc(orgIdOf(req), name, id);

async function mustGet(req: any, name: string, id: string, label: string) {
  const d = await store.get(docPath(req, name, id));
  if (!d) throw new NotFound(`${label} not found.`);
  return d;
}

export class NotFound extends Error {}

async function issuePublicToken(orgId: string, type: "estimate" | "invoice", id: string, existing?: string) {
  if (existing) return existing;
  const token = randomToken(18);
  await store.set(paths.publicToken(token), { orgId, type, id, createdAt: nowIso() }, false);
  return token;
}

// ===========================================================================
// Leads
// ===========================================================================
router.get("/api/leads", async (req, res) => {
  const { status, search } = req.query as any;
  let rows = await store.list(col(req, "leads"), status ? { where: [["status", String(status)]] } : undefined);
  if (search) {
    const s = String(search).toLowerCase();
    rows = rows.filter((l) => [l.clientName, l.email, l.phone, l.address].some((v) => String(v || "").toLowerCase().includes(s)));
  }
  res.json({ leads: rows, total: rows.length });
});

router.get("/api/leads/:id", async (req, res) => {
  const lead = await mustGet(req, "leads", req.params.id, "Lead");
  const [calls, messages, estimates, appointments] = await Promise.all([
    store.list(col(req, "calls"), { where: [["leadId", lead.id]] }),
    store.list(col(req, "messages"), { where: [["leadId", lead.id]], orderBy: "createdAt" }),
    store.list(col(req, "estimates"), { where: [["leadId", lead.id]] }),
    store.list(col(req, "appointments"), { where: [["leadId", lead.id]] }),
  ]);
  res.json({ lead, calls, messages: messages.reverse(), estimates, appointments });
});

router.post("/api/leads", async (req, res) => {
  const input = cleanLeadInput(req.body || {});
  const consent = bool(req.body?.contactConsent);
  const lead = await createLead(orgIdOf(req), req.auth!.org, input, {
    contactConsent: consent ? { given: true, method: str(req.body?.consentMethod, "Consent method", { max: 200 }) || "Recorded by staff", at: nowIso(), by: req.auth!.email } : { given: false },
  });
  res.status(201).json(lead);
});

router.patch("/api/leads/:id", async (req, res) => {
  const lead = await mustGet(req, "leads", req.params.id, "Lead");
  const patch: any = cleanLeadInput(req.body || {}, true);
  if (req.body?.contactConsent !== undefined) {
    patch.contactConsent = bool(req.body.contactConsent)
      ? { given: true, method: str(req.body?.consentMethod, "Consent method", { max: 200 }) || "Recorded by staff", at: nowIso(), by: req.auth!.email }
      : { given: false };
  }
  patch.updatedAt = nowIso();
  await store.set(docPath(req, "leads", lead.id), patch);
  res.json({ ...lead, ...patch });
});

// Kept for the original LeadFlow board.
router.post("/api/leads/:id/status", async (req, res) => {
  const lead = await mustGet(req, "leads", req.params.id, "Lead");
  const status = oneOf(req.body?.status, LEAD_STATUSES, "Status");
  await store.set(docPath(req, "leads", lead.id), { status, updatedAt: nowIso() });
  res.json({ success: true, lead: { ...lead, status } });
});

router.delete("/api/leads/:id", async (req, res) => {
  await mustGet(req, "leads", req.params.id, "Lead");
  await store.remove(docPath(req, "leads", req.params.id));
  res.json({ success: true });
});

router.post("/api/leads/import", async (req, res) => {
  const rows = Array.isArray(req.body?.leads) ? req.body.leads.slice(0, 500) : [];
  const created: any[] = [];
  const errors: string[] = [];
  for (const [i, row] of rows.entries()) {
    try {
      created.push(await createLead(orgIdOf(req), req.auth!.org, cleanLeadInput(row), { source: row.source || "Import", contactConsent: { given: false } }));
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
      if (/lead limit/.test(err.message)) break;
    }
  }
  res.json({ imported: created.length, errors });
});

function requireConsent(lead: any) {
  if (!lead.contactConsent?.given) {
    throw new ValidationError(
      "Before an AI call or text, confirm this customer agreed to be contacted (open the lead and tick the consent box). AI calls and marketing texts need the customer's prior written consent.",
    );
  }
  if (lead.smsOptOut) throw new ValidationError("This customer replied STOP and opted out. Don't contact them by text or AI call.");
}

// AI phone call through the company's own Vapi assistant.
router.post("/api/leads/:id/call", async (req, res) => {
  const lead = await mustGet(req, "leads", req.params.id, "Lead");
  requireConsent(lead);
  const phone = lead.phoneE164 || toE164(lead.phone);
  if (!phone) throw new ValidationError("This lead doesn't have a valid phone number.");
  const call = await placeVapiCall(orgIdOf(req), {
    phone,
    name: lead.clientName,
    variables: {
      lead_type: str(req.body?.leadType, "Lead type", { max: 40 }) || "form",
      project: lead.projectDescription || lead.condition || "",
      company: lead.clientType === "Commercial" ? lead.clientName : "",
    },
    metadata: { leadId: lead.id },
  });
  const now = nowIso();
  await store.set(docPath(req, "calls", call.id), {
    id: call.id, vapiCallId: call.id, leadId: lead.id, callerName: lead.clientName, phoneNumber: phone,
    direction: "outbound", status: call.status || "queued", startedBy: req.auth!.email, createdAt: now,
  }, false);
  await store.set(docPath(req, "leads", lead.id), { lastContactAt: now, updatedAt: now, ...(lead.status === "New" ? { status: "Contacted" } : {}) });
  res.json({ success: true, callId: call.id });
});

router.post("/api/leads/:id/text", async (req, res) => {
  const lead = await mustGet(req, "leads", req.params.id, "Lead");
  const inbound = await store.list(col(req, "messages"), { where: [["leadId", lead.id], ["direction", "inbound"]], limit: 1 });
  if (!inbound.length) requireConsent(lead); // Replying to a customer who texted you first is allowed.
  if (lead.smsOptOut) throw new ValidationError("This customer replied STOP and opted out of texts.");
  const phone = lead.phoneE164 || toE164(lead.phone);
  if (!phone) throw new ValidationError("This lead doesn't have a valid phone number.");
  const body = str(req.body?.body, "Message", { required: true, max: 1500 });
  const sent = await sendSms(orgIdOf(req), phone, body);
  const now = nowIso();
  const msg = { leadId: lead.id, direction: "outbound", channel: "sms", to: phone, body, status: sent.status, twilioSid: sent.sid, sentBy: req.auth!.email, createdAt: now };
  const id = await store.add(col(req, "messages"), msg);
  await store.set(docPath(req, "leads", lead.id), { lastContactAt: now, updatedAt: now, ...(lead.status === "New" ? { status: "Contacted" } : {}) });
  res.status(201).json({ ...msg, id });
});

// ===========================================================================
// Calls & messages
// ===========================================================================
router.get("/api/calls", async (req, res) => {
  const leadId = req.query.leadId ? String(req.query.leadId) : "";
  res.json(await store.list(col(req, "calls"), leadId ? { where: [["leadId", leadId]] } : { limit: 200 }));
});

router.get("/api/messages", async (req, res) => {
  const leadId = req.query.leadId ? String(req.query.leadId) : "";
  res.json(await store.list(col(req, "messages"), leadId ? { where: [["leadId", leadId]] } : { limit: 300 }));
});

// ===========================================================================
// Appointments (synced to the company's Google Calendar when connected)
// ===========================================================================
router.get("/api/appointments", async (req, res) => {
  const rows = await store.list(col(req, "appointments"), { orderBy: "start" });
  res.json(rows.reverse());
});

router.post("/api/appointments", async (req, res) => {
  const b = req.body || {};
  const start = isoDate(b.start, "Start time", { required: true });
  const durationMin = num(b.durationMinutes ?? 60, "Duration", { min: 15, max: 24 * 60 });
  const end = new Date(new Date(start).getTime() + durationMin * 60000).toISOString();
  let lead: any = null;
  if (b.leadId) lead = await mustGet(req, "leads", String(b.leadId), "Lead");
  const appt: any = {
    title: str(b.title, "Title", { required: true, max: 200 }),
    type: oneOf(b.type || "Estimate", ["Estimate", "Job", "Follow-up", "Walkthrough", "Other"], "Type"),
    leadId: lead?.id || "",
    customerName: str(b.customerName ?? lead?.clientName, "Customer", { max: 120 }),
    address: str(b.address ?? lead?.address, "Address", { max: 200 }),
    notes: str(b.notes, "Notes", { max: 2000 }),
    start: new Date(start).toISOString(),
    end,
    status: "Scheduled",
    createdBy: req.auth!.email,
    createdAt: nowIso(),
  };
  let calendarWarning = "";
  try {
    const ev = await createCalendarEvent(orgIdOf(req), {
      summary: appt.title,
      description: [appt.customerName && `Customer: ${appt.customerName}`, lead?.phone && `Phone: ${lead.phone}`, lead?.email && `Email: ${lead.email}`, appt.notes].filter(Boolean).join("\n"),
      location: appt.address,
      start: appt.start,
      end: appt.end,
      timeZone: req.auth!.org?.profile?.timeZone,
    });
    if (ev) Object.assign(appt, { googleEventId: ev.id, googleEventLink: ev.htmlLink });
  } catch (err: any) {
    calendarWarning = err.message;
  }
  const id = await store.add(col(req, "appointments"), appt);
  if (lead && ["New", "Contacted"].includes(lead.status)) {
    await store.set(docPath(req, "leads", lead.id), { status: "Qualified", updatedAt: nowIso() });
  }
  res.status(201).json({ ...appt, id, calendarWarning });
});

router.patch("/api/appointments/:id", async (req, res) => {
  const appt = await mustGet(req, "appointments", req.params.id, "Appointment");
  const patch: any = {};
  if (req.body?.status !== undefined) patch.status = oneOf(req.body.status, ["Scheduled", "Completed", "Canceled", "No-show"], "Status");
  if (req.body?.notes !== undefined) patch.notes = str(req.body.notes, "Notes", { max: 2000 });
  if (patch.status === "Canceled" && appt.googleEventId) {
    await deleteCalendarEvent(orgIdOf(req), appt.googleEventId).catch(() => {});
  }
  await store.set(docPath(req, "appointments", appt.id), patch);
  res.json({ ...appt, ...patch });
});

router.delete("/api/appointments/:id", async (req, res) => {
  const appt = await mustGet(req, "appointments", req.params.id, "Appointment");
  if (appt.googleEventId) await deleteCalendarEvent(orgIdOf(req), appt.googleEventId).catch(() => {});
  await store.remove(docPath(req, "appointments", appt.id));
  res.json({ success: true });
});

// ===========================================================================
// Estimates
// ===========================================================================
function cleanEstimate(b: any) {
  // Accept the original QuoteGenius shape (totalAmount / rooms) as well as line items.
  let items = b.lineItems;
  if ((!Array.isArray(items) || !items.length) && (b.totalAmount || b.value)) {
    items = [{ description: b.projectName || b.projectType || "Painting project", qty: 1, unitPrice: Number(b.totalAmount || b.value) }];
  }
  const priced = priceLines(items, b.taxRate);
  return {
    clientName: str(b.clientName ?? b.customerName, "Customer name", { required: true, max: 120 }),
    clientEmail: emailField(b.clientEmail, "Customer email"),
    clientPhone: str(b.clientPhone, "Customer phone", { max: 40 }),
    address: str(b.address, "Address", { max: 200 }),
    projectType: str(b.projectType ?? b.projectName, "Project type", { max: 120 }),
    scope: str(b.scope ?? b.details, "Scope of work", { max: 8000 }),
    notes: str(b.notes, "Notes", { max: 4000 }),
    validDays: num(b.validDays ?? 30, "Valid for", { min: 1, max: 365 }),
    ...priced,
    totalAmount: priced.total, // read by the Quote Genius board
  };
}

router.get("/api/estimates", async (req, res) => {
  res.json(await store.list(col(req, "estimates")));
});

router.post("/api/estimates", async (req, res) => {
  const b = req.body || {};
  let lead: any = null;
  if (b.leadId) lead = await mustGet(req, "leads", String(b.leadId), "Lead");
  const est: any = {
    ...cleanEstimate({ clientName: lead?.clientName, clientEmail: lead?.email, clientPhone: lead?.phone, address: lead?.address, ...b }),
    leadId: lead?.id || "",
    number: docNumber("EST"),
    status: "Draft",
    createdBy: req.auth!.email,
    createdAt: nowIso(),
  };
  const id = await store.add(col(req, "estimates"), est);
  res.status(201).json({ ...est, id });
});

router.patch("/api/estimates/:id", async (req, res) => {
  const est = await mustGet(req, "estimates", req.params.id, "Estimate");
  const b = req.body || {};
  let patch: any = {};
  if (b.lineItems || b.clientName || b.totalAmount) {
    if (est.status === "Accepted") throw new ValidationError("An accepted estimate can't be edited. Create a new one instead.");
    patch = cleanEstimate({ ...est, ...b });
  }
  if (b.status !== undefined) {
    const legacy: Record<string, string> = { Approved: "Accepted", Rejected: "Declined" };
    patch.status = oneOf(legacy[b.status] || b.status, ["Draft", "Sent", "Accepted", "Declined"], "Status");
  }
  patch.updatedAt = nowIso();
  await store.set(docPath(req, "estimates", est.id), patch);
  res.json({ ...est, ...patch });
});

router.delete("/api/estimates/:id", async (req, res) => {
  const est = await mustGet(req, "estimates", req.params.id, "Estimate");
  if (est.publicToken) await store.remove(paths.publicToken(est.publicToken));
  await store.remove(docPath(req, "estimates", est.id));
  res.json({ success: true });
});

router.post("/api/estimates/:id/send", async (req, res) => {
  const est = await mustGet(req, "estimates", req.params.id, "Estimate");
  const channel = oneOf(req.body?.channel || "email", ["email", "sms", "link"], "Channel");
  const org = req.auth!.org;
  const token = await issuePublicToken(orgIdOf(req), "estimate", est.id, est.publicToken);
  const link = `${config.appUrl}/e/${token}`;
  if (channel === "email") {
    if (!est.clientEmail) throw new ValidationError("Add the customer's email to this estimate first.");
    await sendEmail(orgIdOf(req), {
      to: est.clientEmail,
      subject: `Your painting estimate from ${org.name} (${usd(est.total)})`,
      text: `Hi ${est.clientName},\n\nThanks for the opportunity. Your estimate ${est.number} for ${est.projectType || "your project"} is ${usd(est.total)}.\n\nView and accept it here: ${link}\n\nQuestions? Reply to this email${org.profile?.phone ? ` or call ${org.profile.phone}` : ""}.\n\n${org.name}`,
      replyTo: org.profile?.email,
      fromName: org.name,
    });
  } else if (channel === "sms") {
    const phone = toE164(est.clientPhone);
    if (!phone) throw new ValidationError("Add a valid customer phone number to this estimate first.");
    await sendSms(orgIdOf(req), phone, `${org.name}: your painting estimate (${usd(est.total)}) is ready. View and accept: ${link}`);
  }
  const patch = { publicToken: token, status: est.status === "Draft" ? "Sent" : est.status, sentAt: nowIso(), sentVia: channel };
  await store.set(docPath(req, "estimates", est.id), patch);
  if (est.leadId) {
    const lead = await store.get(docPath(req, "leads", est.leadId));
    if (lead && ["New", "Contacted", "Qualified"].includes(lead.status)) await store.set(docPath(req, "leads", lead.id), { status: "Quoted", updatedAt: nowIso() });
  }
  res.json({ success: true, link, estimate: { ...est, ...patch } });
});

router.post("/api/estimates/:id/invoice", async (req, res) => {
  const est = await mustGet(req, "estimates", req.params.id, "Estimate");
  const depositPct = num(req.body?.depositPercent ?? 100, "Deposit percent", { min: 1, max: 100 });
  const items = depositPct === 100
    ? est.lineItems
    : [{ description: `${depositPct}% deposit — estimate ${est.number}`, qty: 1, unitPrice: Math.round(est.total * depositPct) / 100 }];
  const inv = await buildInvoice(req, {
    clientName: est.clientName, clientEmail: est.clientEmail, clientPhone: est.clientPhone, address: est.address,
    lineItems: items, taxRate: depositPct === 100 ? est.taxRate : 0, estimateId: est.id, leadId: est.leadId,
  });
  res.status(201).json(inv);
});

// ===========================================================================
// Invoices (customers pay through the company's connected Stripe account)
// ===========================================================================
async function buildInvoice(req: any, b: any) {
  const priced = priceLines(b.lineItems, b.taxRate);
  const due = b.dueDate ? isoDate(b.dueDate, "Due date") : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const inv: any = {
    clientName: str(b.clientName, "Customer name", { required: true, max: 120 }),
    clientEmail: emailField(b.clientEmail, "Customer email"),
    clientPhone: str(b.clientPhone, "Customer phone", { max: 40 }),
    address: str(b.address, "Address", { max: 200 }),
    notes: str(b.notes, "Notes", { max: 4000 }),
    ...priced,
    amountPaid: 0,
    dueDate: due.slice(0, 10),
    estimateId: b.estimateId || "",
    leadId: b.leadId || "",
    number: docNumber("INV"),
    status: "Draft",
    createdBy: req.auth!.email,
    createdAt: nowIso(),
  };
  const id = await store.add(col(req, "invoices"), inv);
  return { ...inv, id };
}

router.get("/api/invoices", async (req, res) => {
  res.json(await store.list(col(req, "invoices")));
});

router.post("/api/invoices", async (req, res) => {
  res.status(201).json(await buildInvoice(req, req.body || {}));
});

router.patch("/api/invoices/:id", async (req, res) => {
  const inv = await mustGet(req, "invoices", req.params.id, "Invoice");
  const b = req.body || {};
  const patch: any = { updatedAt: nowIso() };
  if (b.markPaid) {
    if (inv.status === "Paid") throw new ValidationError("This invoice is already paid.");
    Object.assign(patch, { status: "Paid", amountPaid: inv.total, paidAt: nowIso(), paymentMethod: oneOf(b.paymentMethod || "Check", ["Check", "Cash", "Bank transfer", "Other"], "Payment method") });
  } else if (b.void) {
    if (inv.status === "Paid") throw new ValidationError("A paid invoice can't be voided. Refund it in Stripe instead.");
    patch.status = "Void";
  } else {
    if (inv.status !== "Draft") throw new ValidationError("Only draft invoices can be edited.");
    Object.assign(patch, priceLines(b.lineItems ?? inv.lineItems, b.taxRate ?? inv.taxRate));
    if (b.dueDate !== undefined) patch.dueDate = isoDate(b.dueDate, "Due date").slice(0, 10);
    if (b.notes !== undefined) patch.notes = str(b.notes, "Notes", { max: 4000 });
    if (b.clientEmail !== undefined) patch.clientEmail = emailField(b.clientEmail, "Customer email");
    if (b.clientPhone !== undefined) patch.clientPhone = str(b.clientPhone, "Customer phone", { max: 40 });
  }
  await store.set(docPath(req, "invoices", inv.id), patch);
  res.json({ ...inv, ...patch });
});

router.delete("/api/invoices/:id", async (req, res) => {
  const inv = await mustGet(req, "invoices", req.params.id, "Invoice");
  if (inv.status !== "Draft") throw new ValidationError("Only draft invoices can be deleted. Void it instead.");
  await store.remove(docPath(req, "invoices", inv.id));
  res.json({ success: true });
});

router.post("/api/invoices/:id/send", async (req, res) => {
  const inv = await mustGet(req, "invoices", req.params.id, "Invoice");
  if (inv.status === "Void" || inv.status === "Paid") throw new ValidationError(`This invoice is ${inv.status.toLowerCase()}.`);
  const channel = oneOf(req.body?.channel || "email", ["email", "sms", "link"], "Channel");
  const org = req.auth!.org;
  const token = await issuePublicToken(orgIdOf(req), "invoice", inv.id, inv.publicToken);
  const link = `${config.appUrl}/i/${token}`;
  const canPayOnline = !!org.integrations?.stripeConnect?.chargesEnabled;
  if (channel === "email") {
    if (!inv.clientEmail) throw new ValidationError("Add the customer's email to this invoice first.");
    await sendEmail(orgIdOf(req), {
      to: inv.clientEmail,
      subject: `Invoice ${inv.number} from ${org.name} — ${usd(inv.total)}`,
      text: `Hi ${inv.clientName},\n\nYour invoice ${inv.number} for ${usd(inv.total)} is due ${inv.dueDate}.\n\n${canPayOnline ? "View and pay online" : "View it"} here: ${link}\n\nThank you,\n${org.name}`,
      replyTo: org.profile?.email,
      fromName: org.name,
    });
  } else if (channel === "sms") {
    const phone = toE164(inv.clientPhone);
    if (!phone) throw new ValidationError("Add a valid customer phone number to this invoice first.");
    await sendSms(orgIdOf(req), phone, `${org.name}: invoice ${inv.number} for ${usd(inv.total)}. ${canPayOnline ? "Pay online" : "View"}: ${link}`);
  }
  const patch = { publicToken: token, status: inv.status === "Draft" ? "Sent" : inv.status, sentAt: nowIso(), sentVia: channel };
  await store.set(docPath(req, "invoices", inv.id), patch);
  res.json({ success: true, link, canPayOnline, invoice: { ...inv, ...patch } });
});

// ===========================================================================
// Dashboard
// ===========================================================================
router.get("/api/dashboard", async (req, res) => {
  const [leads, estimates, invoices, appointments, calls] = await Promise.all([
    store.list(col(req, "leads")),
    store.list(col(req, "estimates")),
    store.list(col(req, "invoices")),
    store.list(col(req, "appointments"), { orderBy: "start" }),
    store.list(col(req, "calls"), { limit: 10 }),
  ]);
  const month = new Date().toISOString().slice(0, 7);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length]));
  const sum = (rows: any[], f: string) => Math.round(rows.reduce((s, r) => s + (Number(r[f]) || 0), 0) * 100) / 100;
  const now = Date.now();
  res.json({
    leads: { total: leads.length, thisMonth: leads.filter((l) => l.createdMonth === month).length, byStatus, recent: leads.slice(0, 5) },
    estimates: {
      open: estimates.filter((e) => e.status === "Sent").length,
      openValue: sum(estimates.filter((e) => e.status === "Sent"), "total"),
      acceptedValue: sum(estimates.filter((e) => e.status === "Accepted"), "total"),
      winRate: estimates.filter((e) => ["Accepted", "Declined"].includes(e.status)).length
        ? Math.round((estimates.filter((e) => e.status === "Accepted").length / estimates.filter((e) => ["Accepted", "Declined"].includes(e.status)).length) * 100)
        : null,
    },
    invoices: {
      outstanding: sum(invoices.filter((i) => i.status === "Sent"), "total"),
      overdue: sum(invoices.filter((i) => i.status === "Sent" && i.dueDate && Date.parse(i.dueDate) < now), "total"),
      paidThisMonth: sum(invoices.filter((i) => i.status === "Paid" && String(i.paidAt || "").startsWith(month)), "total"),
    },
    upcoming: appointments.filter((a) => a.status === "Scheduled" && Date.parse(a.start) >= now - 3600000).reverse().slice(0, 6),
    recentCalls: calls,
  });
});

// Map known errors to friendly HTTP responses.
router.use((err: any, _req: any, res: any, next: any) => {
  if (err instanceof NotFound) return res.status(404).json({ error: err.message });
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof IntegrationError) return res.status(err.status).json({ error: err.message });
  next(err);
});

export default router;
