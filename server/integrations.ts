// Per-company integrations: Vapi (AI calls), Twilio (texts), Google
// (Calendar + Gmail) and outbound email. Secrets are stored encrypted in
// orgSecrets/{orgId}, which only the server can read.
import crypto from "crypto";
import { store, paths } from "./store";
import { encrypt, decrypt } from "./crypto";
import { config, APP_NAME } from "./config";

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------
export async function getSecrets(orgId: string): Promise<any> {
  return (await store.get(paths.secrets(orgId))) || {};
}

export async function saveSecrets(orgId: string, patch: any) {
  await store.set(paths.secrets(orgId), patch, true);
}

export class IntegrationError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// Vapi — outbound AI phone calls
// ---------------------------------------------------------------------------
export async function placeVapiCall(orgId: string, opts: {
  phone: string;
  name?: string;
  variables?: Record<string, string>;
  metadata?: Record<string, string>;
}) {
  const s = await getSecrets(orgId);
  const apiKey = decrypt(s.vapi?.apiKeyEnc);
  if (!apiKey || !s.vapi?.assistantId || !s.vapi?.phoneNumberId) {
    throw new IntegrationError("Connect Vapi in Settings → Integrations (API key, assistant and phone number) to place AI calls.");
  }
  const res = await fetch("https://api.vapi.ai/call/phone", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      assistantId: s.vapi.assistantId,
      phoneNumberId: s.vapi.phoneNumberId,
      customer: { number: opts.phone, name: opts.name },
      assistantOverrides: { variableValues: { name: opts.name || "", ...(opts.variables || {}) } },
      metadata: { orgId, ...(opts.metadata || {}) },
    }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join("; ") : data?.message || data?.error;
    throw new IntegrationError(`Vapi refused the call: ${msg || res.status}`, 502);
  }
  return data as { id: string; status?: string };
}

// ---------------------------------------------------------------------------
// Twilio — text messages
// ---------------------------------------------------------------------------
export async function sendSms(orgId: string, to: string, body: string) {
  const s = await getSecrets(orgId);
  const sid = s.twilio?.accountSid;
  const token = decrypt(s.twilio?.authTokenEnc);
  const from = s.twilio?.fromNumber;
  if (!sid || !token || !from) {
    throw new IntegrationError("Connect Twilio in Settings → Integrations to send text messages.");
  }
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new IntegrationError(`Twilio refused the text: ${data?.message || res.status}`, 502);
  return data as { sid: string; status: string };
}

/** Validates Twilio's X-Twilio-Signature header. */
export function validTwilioSignature(authToken: string, url: string, params: Record<string, any>, signature: string) {
  const data = Object.keys(params).sort().reduce((acc, k) => acc + k + (params[k] ?? ""), url);
  const expected = crypto.createHmac("sha1", authToken).update(Buffer.from(data, "utf8")).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Google — OAuth, Calendar and Gmail
// ---------------------------------------------------------------------------
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.send",
];

export function googleRedirectUri() {
  return `${config.appUrl}/api/integrations/google/callback`;
}

export function googleAuthUrl(state: string) {
  if (!config.google.clientId) throw new IntegrationError("Google sign-in is not configured on this server yet.");
  const p = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: GOOGLE_SCOPES.join(" "),
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new IntegrationError(`Google sign-in failed: ${data.error_description || data.error}`);
  let email = "";
  if (data.id_token) {
    try {
      email = JSON.parse(Buffer.from(data.id_token.split(".")[1], "base64url").toString()).email || "";
    } catch {}
  }
  return { refreshToken: data.refresh_token as string | undefined, accessToken: data.access_token as string, email };
}

async function googleAccessToken(orgId: string): Promise<string | null> {
  const s = await getSecrets(orgId);
  const refresh = decrypt(s.google?.refreshTokenEnc);
  if (!refresh) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const data: any = await res.json();
  if (!res.ok) {
    if (data.error === "invalid_grant") {
      await saveSecrets(orgId, { google: { refreshTokenEnc: "" } });
      await store.set(paths.org(orgId), { integrations: { google: { connected: false, email: "" } } });
      throw new IntegrationError("Google access was revoked. Reconnect Google in Settings → Integrations.");
    }
    throw new IntegrationError(`Google refused the request: ${data.error_description || data.error}`, 502);
  }
  return data.access_token;
}

export async function googleConnected(orgId: string) {
  const s = await getSecrets(orgId);
  return !!s.google?.refreshTokenEnc;
}

export async function createCalendarEvent(orgId: string, ev: {
  summary: string;
  description?: string;
  location?: string;
  start: string; // ISO
  end: string; // ISO
  timeZone?: string;
}) {
  const token = await googleAccessToken(orgId);
  if (!token) return null;
  const tz = ev.timeZone || "America/New_York";
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: ev.summary,
      description: ev.description,
      location: ev.location,
      start: { dateTime: ev.start, timeZone: tz },
      end: { dateTime: ev.end, timeZone: tz },
    }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new IntegrationError(`Google Calendar refused the event: ${data?.error?.message || res.status}`, 502);
  return { id: data.id as string, htmlLink: data.htmlLink as string };
}

export async function deleteCalendarEvent(orgId: string, eventId: string) {
  const token = await googleAccessToken(orgId);
  if (!token) return;
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

function mimeEncodeHeader(v: string) {
  return /^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${Buffer.from(v, "utf8").toString("base64")}?=`;
}

async function sendViaGmail(orgId: string, msg: EmailMessage, token: string) {
  const boundary = "sgb" + crypto.randomBytes(8).toString("hex");
  const headers = [`To: ${msg.to}`, `Subject: ${mimeEncodeHeader(msg.subject)}`];
  if (msg.replyTo) headers.push(`Reply-To: ${msg.replyTo}`);
  const lines = [
    ...headers,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    msg.text,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    msg.html || escapeHtml(msg.text).replace(/\n/g, "<br>"),
    `--${boundary}--`,
  ];
  const raw = Buffer.from(lines.join("\r\n")).toString("base64url");
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new IntegrationError(`Gmail refused the email: ${data?.error?.message || res.status}`, 502);
  return { id: data.id as string, via: "gmail" as const };
}

// ---------------------------------------------------------------------------
// Email — the company's own Gmail if connected, otherwise the platform sender
// ---------------------------------------------------------------------------
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
}

export async function sendEmail(orgId: string, msg: EmailMessage) {
  const token = await googleAccessToken(orgId);
  if (token) return sendViaGmail(orgId, msg, token);
  if (config.resend.apiKey && config.resend.from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resend.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: msg.fromName ? `${msg.fromName.replace(/[<>"]/g, "")} via ${APP_NAME} <${config.resend.from}>` : config.resend.from,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        reply_to: msg.replyTo,
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new IntegrationError(`Email could not be sent: ${data?.message || res.status}`, 502);
    return { id: data.id as string, via: "platform" as const };
  }
  throw new IntegrationError("Connect Google in Settings → Integrations to send email from your Gmail.");
}

export function escapeHtml(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Normalises a US phone number to E.164 (+1XXXXXXXXXX). Returns "" if it can't. */
export function toE164(phone: string): string {
  const raw = String(phone || "").trim();
  if (/^\+[1-9]\d{7,14}$/.test(raw.replace(/[^\d+]/g, ""))) return raw.replace(/[^\d+]/g, "");
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}
