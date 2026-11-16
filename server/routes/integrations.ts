// Settings → Integrations: each company connects its own Vapi, Twilio, Google
// and lead-capture form. Secrets are encrypted at rest and never sent back.
import { Router } from "express";
import { requireAuth, requireOrg, requireRole, orgIdOf } from "../auth";
import { store, paths, nowIso } from "../store";
import { encrypt, decrypt, randomToken } from "../crypto";
import { str, ValidationError } from "../validate";
import { getSecrets, saveSecrets, googleAuthUrl, exchangeGoogleCode, toE164, IntegrationError } from "../integrations";
import { config } from "../config";

const router = Router();

function webhookUrls(orgId: string) {
  return {
    vapiServerUrl: `${config.appUrl}/api/webhooks/vapi/${orgId}`,
    twilioSmsUrl: `${config.appUrl}/api/webhooks/twilio/${orgId}`,
  };
}

router.get("/api/integrations", requireAuth, requireOrg, async (req, res) => {
  const orgId = orgIdOf(req);
  const org = req.auth!.org;
  const isAdmin = req.auth!.role === "owner" || req.auth!.role === "admin";
  const secrets = isAdmin ? await getSecrets(orgId) : {};
  const leadFormToken = org.leadFormToken;
  res.json({
    status: org.integrations || {},
    ...webhookUrls(orgId),
    vapiSecret: isAdmin ? secrets.webhookSecret || "" : "",
    leadForm: leadFormToken
      ? { url: `${config.appUrl}/f/${leadFormToken}`, apiUrl: `${config.appUrl}/api/public/leads/${leadFormToken}` }
      : null,
    googleAvailable: !!config.google.clientId,
    stripeAvailable: !!config.stripe.secretKey,
  });
});

// ---- Vapi -----------------------------------------------------------------
router.put("/api/integrations/vapi", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const orgId = orgIdOf(req);
  const b = req.body || {};
  const existing = await getSecrets(orgId);
  const apiKey = str(b.apiKey, "Vapi private API key", { max: 200 });
  const assistantId = str(b.assistantId, "Assistant ID", { required: true, max: 100 });
  const phoneNumberId = str(b.phoneNumberId, "Phone number ID", { required: true, max: 100 });
  if (!apiKey && !existing.vapi?.apiKeyEnc) throw new ValidationError("Paste your Vapi private API key.");
  const keyToTest = apiKey || decrypt(existing.vapi.apiKeyEnc);
  const check = await fetch(`https://api.vapi.ai/assistant/${encodeURIComponent(assistantId)}`, { headers: { Authorization: `Bearer ${keyToTest}` } });
  if (!check.ok) throw new IntegrationError(check.status === 401 ? "Vapi rejected that API key." : "Vapi couldn't find that assistant ID with this key.");
  const phoneCheck = await fetch(`https://api.vapi.ai/phone-number/${encodeURIComponent(phoneNumberId)}`, { headers: { Authorization: `Bearer ${keyToTest}` } });
  if (!phoneCheck.ok) throw new IntegrationError("Vapi couldn't find that phone number ID. Outbound calls need a real phone number (not a SIP address).");
  await saveSecrets(orgId, { vapi: { apiKeyEnc: apiKey ? encrypt(apiKey) : existing.vapi.apiKeyEnc, assistantId, phoneNumberId } });
  await store.set(paths.org(orgId), { integrations: { vapi: { connected: true, assistantId, phoneNumberId, updatedAt: nowIso() } } });
  res.json({ success: true });
});

router.delete("/api/integrations/vapi", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  await saveSecrets(orgIdOf(req), { vapi: { apiKeyEnc: "", assistantId: "", phoneNumberId: "" } });
  await store.set(paths.org(orgIdOf(req)), { integrations: { vapi: { connected: false } } });
  res.json({ success: true });
});

// ---- Twilio ---------------------------------------------------------------
router.put("/api/integrations/twilio", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const orgId = orgIdOf(req);
  const b = req.body || {};
  const accountSid = str(b.accountSid, "Account SID", { required: true, max: 64 });
  const authToken = str(b.authToken, "Auth token", { required: true, max: 64 });
  const fromNumber = toE164(str(b.fromNumber, "Twilio phone number", { required: true, max: 30 }));
  if (!/^AC[0-9a-f]{32}$/i.test(accountSid)) throw new ValidationError("The Account SID starts with AC and is 34 characters long.");
  if (!fromNumber) throw new ValidationError("Enter your Twilio phone number, e.g. +17175551234.");
  const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const nums = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(fromNumber)}`,
    { headers: { Authorization: auth } },
  );
  if (nums.status === 401) throw new IntegrationError("Twilio rejected that Account SID / auth token.");
  const data: any = await nums.json().catch(() => ({}));
  const number = data?.incoming_phone_numbers?.[0];
  if (!number) throw new IntegrationError("That phone number isn't in this Twilio account.");
  // Point the number's incoming texts at this app so replies land in the lead's history.
  let smsWebhookSet = false;
  const update = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${number.sid}.json`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ SmsUrl: webhookUrls(orgId).twilioSmsUrl, SmsMethod: "POST" }),
  });
  smsWebhookSet = update.ok;
  await saveSecrets(orgId, { twilio: { accountSid, authTokenEnc: encrypt(authToken), fromNumber } });
  await store.set(paths.org(orgId), { integrations: { twilio: { connected: true, fromNumber, smsWebhookSet, updatedAt: nowIso() } } });
  res.json({ success: true, smsWebhookSet });
});

router.delete("/api/integrations/twilio", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  await saveSecrets(orgIdOf(req), { twilio: { accountSid: "", authTokenEnc: "", fromNumber: "" } });
  await store.set(paths.org(orgIdOf(req)), { integrations: { twilio: { connected: false } } });
  res.json({ success: true });
});

// ---- Google (Calendar + Gmail) ----------------------------------------------
router.post("/api/integrations/google/start", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const state = randomToken(24);
  await store.set(`oauthStates/${state}`, { orgId: orgIdOf(req), uid: req.auth!.uid, expiresAt: Date.now() + 10 * 60000 }, false);
  res.json({ url: googleAuthUrl(state) });
});

// Google redirects the browser here (no app session header), so we trust the one-time state.
router.get("/api/integrations/google/callback", async (req, res) => {
  const state = String(req.query.state || "");
  const code = String(req.query.code || "");
  const back = (q: string) => res.redirect(`${config.appUrl}/?tab=settings&${q}`);
  if (!state) return back("google=error");
  const saved = await store.get(`oauthStates/${state}`);
  await store.remove(`oauthStates/${state}`);
  if (!saved || saved.expiresAt < Date.now() || !code) return back("google=error");
  try {
    const tokens = await exchangeGoogleCode(code);
    if (!tokens.refreshToken) return back("google=norefresh");
    await saveSecrets(saved.orgId, { google: { refreshTokenEnc: encrypt(tokens.refreshToken) } });
    await store.set(paths.org(saved.orgId), { integrations: { google: { connected: true, email: tokens.email, updatedAt: nowIso() } } });
    back("google=connected");
  } catch (err) {
    console.error("[google] OAuth callback failed:", err);
    back("google=error");
  }
});

router.delete("/api/integrations/google", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  await saveSecrets(orgIdOf(req), { google: { refreshTokenEnc: "" } });
  await store.set(paths.org(orgIdOf(req)), { integrations: { google: { connected: false, email: "" } } });
  res.json({ success: true });
});

// ---- Lead capture form ------------------------------------------------------
router.post("/api/integrations/leadform", requireAuth, requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const orgId = orgIdOf(req);
  let token = req.auth!.org.leadFormToken;
  if (!token) {
    token = randomToken(12);
    await store.set(paths.publicToken(token), { orgId, type: "leadform", createdAt: nowIso() }, false);
    await store.set(paths.org(orgId), { leadFormToken: token });
  }
  res.json({ url: `${config.appUrl}/f/${token}`, apiUrl: `${config.appUrl}/api/public/leads/${token}` });
});

export default router;
