import React from "react";
import { Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { api } from "../../lib/api";
import { useSession, isAdmin } from "../../lib/session";
import { PageHeader, Card, Button, Field, Input, Badge, ErrorText, Notice, Spinner, useLoad } from "./ui";

type Tab = "company" | "team" | "integrations" | "billing";

export default function Settings() {
  const params = new URLSearchParams(location.search);
  const initial: Tab = params.get("connect") || params.get("billing") ? "billing" : params.get("google") ? "integrations" : "company";
  const [tab, setTab] = React.useState<Tab>(initial);
  const { me } = useSession();
  const admin = isAdmin(me);
  return (
    <div>
      <PageHeader title="Settings" subtitle={me?.org?.name} />
      <div className="flex gap-1 mb-6 border-b border-slate-800 overflow-x-auto" role="tablist">
        {([["company", "Company"], ["team", "Team"], ["integrations", "Integrations"], ["billing", "Billing & payments"]] as [Tab, string][]).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px cursor-pointer ${tab === id ? "border-orange-500 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{label}</button>
        ))}
      </div>
      {!admin && tab !== "team" && <div className="mb-4"><Notice>Only the owner or an admin can change these settings.</Notice></div>}
      {tab === "company" && <Company />}
      {tab === "team" && <Team />}
      {tab === "integrations" && <Integrations />}
      {tab === "billing" && <Billing />}
    </div>
  );
}

function Company() {
  const { me, refresh } = useSession();
  const p = me?.org?.profile || {};
  const [f, setF] = React.useState<any>({ name: me?.org?.name || "", ownerName: p.ownerName || "", phone: p.phone || "", email: p.email || "", address: p.address || "", serviceArea: p.serviceArea || "", website: p.website || "", licenseNumber: p.licenseNumber || "", timeZone: p.timeZone || "America/New_York" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOk(false);
    try {
      const { name, ...profile } = f;
      await api("/api/org", { method: "PATCH", body: { name, profile } });
      await refresh();
      setOk(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="max-w-2xl">
      <form onSubmit={save} className="space-y-3">
        <Field label="Company name"><Input value={f.name} onChange={set("name")} required /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Owner name"><Input value={f.ownerName} onChange={set("ownerName")} /></Field>
          <Field label="Business phone"><Input value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Business email" hint="Shown to customers and used for new-lead alerts."><Input type="email" value={f.email} onChange={set("email")} /></Field>
          <Field label="Website"><Input value={f.website} onChange={set("website")} /></Field>
          <Field label="Contractor license / HIC #"><Input value={f.licenseNumber} onChange={set("licenseNumber")} /></Field>
          <Field label="Time zone"><Input value={f.timeZone} onChange={set("timeZone")} /></Field>
        </div>
        <Field label="Address"><Input value={f.address} onChange={set("address")} /></Field>
        <Field label="Service area"><Input value={f.serviceArea} onChange={set("serviceArea")} /></Field>
        <ErrorText>{error}</ErrorText>
        {ok && <Notice tone="success">Saved.</Notice>}
        <Button type="submit" busy={busy}>Save</Button>
      </form>
    </Card>
  );
}

function Team() {
  const { me } = useSession();
  const admin = isAdmin(me);
  const { data, error, reload } = useLoad(() => api<any>("/api/team"), []);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("member");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [err, setErr] = React.useState("");
  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api<any>("/api/team/invite", { body: { email, role } });
      setMsg(r.emailed ? `Invite emailed to ${email}.` : `Invite saved. Tell ${email} to create an account at ${r.signupUrl} with that email address.`);
      setEmail("");
      reload();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (path: string) => {
    try { await api(path, { method: "DELETE" }); reload(); } catch (e: any) { setErr(e.message); }
  };
  if (!data) return error ? <ErrorText>{error}</ErrorText> : <Spinner />;
  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <p className="text-sm text-slate-400 mb-3">{data.members.length + data.invites.length} of {data.seats} seats used</p>
        <ul className="divide-y divide-slate-800">
          {data.members.map((m: any) => (
            <li key={m.uid} className="py-2.5 flex items-center justify-between gap-3">
              <span className="min-w-0"><span className="text-white block truncate">{m.name || m.email}</span><span className="text-xs text-slate-500">{m.email}</span></span>
              <span className="flex items-center gap-2"><Badge>{m.role}</Badge>{admin && m.role !== "owner" && m.uid !== me?.user.uid && <Button variant="ghost" onClick={() => remove(`/api/team/${m.uid}`)}>Remove</Button>}</span>
            </li>
          ))}
          {data.invites.map((i: any) => (
            <li key={i.email} className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-300 truncate">{i.email}</span>
              <span className="flex items-center gap-2"><Badge tone="Draft">invited</Badge>{admin && <Button variant="ghost" onClick={() => remove(`/api/team/invites/${encodeURIComponent(i.email)}`)}>Cancel</Button>}</span>
            </li>
          ))}
        </ul>
      </Card>
      {admin && (
        <Card>
          <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1"><Field label="Invite by email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field></div>
            <Field label="Role"><select value={role} onChange={(e) => setRole(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"><option value="member">Member</option><option value="admin">Admin</option></select></Field>
            <Button type="submit" busy={busy}>Send invite</Button>
          </form>
          <div className="mt-3 space-y-2"><ErrorText>{err}</ErrorText>{msg && <Notice tone="success">{msg}</Notice>}</div>
        </Card>
      )}
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input readOnly value={value} onFocus={(e) => e.target.select()} className="font-mono text-xs" />
        <Button type="button" variant="secondary" aria-label={`Copy ${label}`} onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}>
          {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </Field>
  );
}

function Status({ on, label }: { on: boolean; label?: string }) {
  return on ? <Badge tone="Won">{label || "Connected"}</Badge> : <Badge tone="Draft">Not connected</Badge>;
}

function Integrations() {
  const { me, refresh } = useSession();
  const admin = isAdmin(me);
  const { data, error, reload } = useLoad(() => api<any>("/api/integrations"), []);
  const params = new URLSearchParams(location.search);
  const googleResult = params.get("google");
  const after = async () => { await Promise.all([reload(), refresh()]); };

  if (!data) return error ? <ErrorText>{error}</ErrorText> : <Spinner />;
  const s = data.status || {};
  return (
    <div className="space-y-5 max-w-3xl">
      {googleResult === "connected" && <Notice tone="success">Google connected. Bookings now go to your calendar and emails send from your Gmail.</Notice>}
      {googleResult === "error" && <ErrorText>Google connection didn't finish. Try again.</ErrorText>}
      {googleResult === "norefresh" && <ErrorText>Google didn't grant offline access. Remove Smart Growth Bot from your Google account's third-party access page, then connect again.</ErrorText>}

      <VapiCard status={s.vapi} admin={admin} serverUrl={data.vapiServerUrl} secret={data.vapiSecret} onSaved={after} />
      <TwilioCard status={s.twilio} admin={admin} smsUrl={data.twilioSmsUrl} onSaved={after} />
      <GoogleCard status={s.google} admin={admin} available={data.googleAvailable} onSaved={after} />
      <LeadFormCard leadForm={data.leadForm} admin={admin} onSaved={after} />
    </div>
  );
}

function useAction(after: () => Promise<void> | void) {
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const run = async (key: string, fn: () => Promise<any>, msg = "") => {
    setBusy(key);
    setError("");
    setOk("");
    try {
      const r = await fn();
      setOk(msg);
      await after();
      return r;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };
  return { busy, error, ok, run };
}

function VapiCard({ status, admin, serverUrl, secret, onSaved }: any) {
  const [f, setF] = React.useState({ apiKey: "", assistantId: status?.assistantId || "", phoneNumberId: status?.phoneNumberId || "" });
  const a = useAction(onSaved);
  return (
    <Card>
      <div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-white">AI phone calls — Vapi</h3><Status on={!!status?.connected} /></div>
      <p className="text-sm text-slate-400 mt-1">Places AI calls to leads using your own Vapi assistant and phone number, and logs every call summary here.</p>
      {admin && (
        <form className="grid sm:grid-cols-2 gap-3 mt-4" onSubmit={(e) => { e.preventDefault(); a.run("save", () => api("/api/integrations/vapi", { method: "PUT", body: f }), "Vapi connected."); }}>
          <div className="sm:col-span-2"><Field label="Vapi private API key" hint={status?.connected ? "Leave blank to keep the saved key." : "Vapi dashboard → API Keys → Private key."}><Input type="password" value={f.apiKey} onChange={(e) => setF({ ...f, apiKey: e.target.value })} autoComplete="off" /></Field></div>
          <Field label="Assistant ID"><Input value={f.assistantId} onChange={(e) => setF({ ...f, assistantId: e.target.value })} required /></Field>
          <Field label="Phone number ID" hint="A real number in Vapi (not a SIP address)."><Input value={f.phoneNumberId} onChange={(e) => setF({ ...f, phoneNumberId: e.target.value })} required /></Field>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" busy={a.busy === "save"}>{status?.connected ? "Update" : "Connect Vapi"}</Button>
            {status?.connected && <Button type="button" variant="ghost" busy={a.busy === "del"} onClick={() => a.run("del", () => api("/api/integrations/vapi", { method: "DELETE" }), "Disconnected.")}>Disconnect</Button>}
          </div>
        </form>
      )}
      {admin && (
        <div className="mt-5 space-y-3 border-t border-slate-800 pt-4">
          <p className="text-sm text-slate-300">So call summaries land here: in Vapi, open your assistant → <strong>Advanced → Server URL</strong>, paste this URL, and set the <strong>Server URL secret</strong> to the secret below.</p>
          <CopyField label="Server URL" value={serverUrl} />
          <CopyField label="Server URL secret" value={secret} />
        </div>
      )}
      <div className="mt-3 space-y-2"><ErrorText>{a.error}</ErrorText>{a.ok && <Notice tone="success">{a.ok}</Notice>}</div>
    </Card>
  );
}

function TwilioCard({ status, admin, smsUrl, onSaved }: any) {
  const [f, setF] = React.useState({ accountSid: "", authToken: "", fromNumber: status?.fromNumber || "" });
  const a = useAction(onSaved);
  return (
    <Card>
      <div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-white">Text messages — Twilio</h3><Status on={!!status?.connected} label={status?.fromNumber ? `Connected · ${status.fromNumber}` : undefined} /></div>
      <p className="text-sm text-slate-400 mt-1">Text leads from your Twilio number. Replies show up in the lead's history, and STOP opt-outs are honored automatically.</p>
      {admin && (
        <form className="grid sm:grid-cols-2 gap-3 mt-4" onSubmit={(e) => { e.preventDefault(); a.run("save", () => api("/api/integrations/twilio", { method: "PUT", body: f }), "Twilio connected."); }}>
          <Field label="Account SID"><Input value={f.accountSid} onChange={(e) => setF({ ...f, accountSid: e.target.value })} required placeholder="AC…" /></Field>
          <Field label="Auth token"><Input type="password" value={f.authToken} onChange={(e) => setF({ ...f, authToken: e.target.value })} required autoComplete="off" /></Field>
          <Field label="Twilio phone number"><Input value={f.fromNumber} onChange={(e) => setF({ ...f, fromNumber: e.target.value })} required placeholder="+17175551234" /></Field>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" busy={a.busy === "save"}>{status?.connected ? "Update" : "Connect Twilio"}</Button>
            {status?.connected && <Button type="button" variant="ghost" busy={a.busy === "del"} onClick={() => a.run("del", () => api("/api/integrations/twilio", { method: "DELETE" }), "Disconnected.")}>Disconnect</Button>}
          </div>
        </form>
      )}
      {status?.connected && status.smsWebhookSet === false && (
        <div className="mt-4"><Notice tone="warn">We couldn't set your number's incoming-text URL automatically. In Twilio, set the number's "A message comes in" webhook to:</Notice><div className="mt-2"><CopyField label="Incoming text webhook (HTTP POST)" value={smsUrl} /></div></div>
      )}
      <p className="text-[11px] text-slate-500 mt-3">US carriers require business texting to be registered (A2P 10DLC) in your Twilio account before texts deliver reliably.</p>
      <div className="mt-3 space-y-2"><ErrorText>{a.error}</ErrorText>{a.ok && <Notice tone="success">{a.ok}</Notice>}</div>
    </Card>
  );
}

function GoogleCard({ status, admin, available, onSaved }: any) {
  const a = useAction(onSaved);
  const connect = () => a.run("connect", async () => {
    const { url } = await api<{ url: string }>("/api/integrations/google/start", { body: {} });
    window.location.href = url;
  });
  return (
    <Card>
      <div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-white">Google Calendar &amp; Gmail</h3><Status on={!!status?.connected} label={status?.email ? `Connected · ${status.email}` : undefined} /></div>
      <p className="text-sm text-slate-400 mt-1">Adds bookings to your Google Calendar and sends estimates, invoices and invites from your own Gmail.</p>
      {!available && <div className="mt-3"><Notice tone="warn">Google sign-in isn't configured on this server yet.</Notice></div>}
      {admin && available && (
        <div className="flex gap-2 mt-4">
          <Button busy={a.busy === "connect"} onClick={connect}>{status?.connected ? "Reconnect Google" : "Connect Google"}</Button>
          {status?.connected && <Button variant="ghost" busy={a.busy === "del"} onClick={() => a.run("del", () => api("/api/integrations/google", { method: "DELETE" }), "Disconnected.")}>Disconnect</Button>}
        </div>
      )}
      <div className="mt-3 space-y-2"><ErrorText>{a.error}</ErrorText>{a.ok && <Notice tone="success">{a.ok}</Notice>}</div>
    </Card>
  );
}

function LeadFormCard({ leadForm, admin, onSaved }: any) {
  const a = useAction(onSaved);
  return (
    <Card>
      <h3 className="font-semibold text-white">Lead capture form</h3>
      <p className="text-sm text-slate-400 mt-1">A hosted "request an estimate" page with a TCPA consent checkbox. Link it from your website, Google Business Profile or ads — every submission becomes a lead here.</p>
      {leadForm ? (
        <div className="space-y-3 mt-4">
          <CopyField label="Form link" value={leadForm.url} />
          <a href={leadForm.url} target="_blank" rel="noreferrer" className="text-sm text-orange-400 inline-flex items-center gap-1">Open the form <ExternalLink className="h-3.5 w-3.5" /></a>
          <CopyField label="For developers: JSON endpoint (POST clientName, phone, email, address, projectDescription, contactConsent)" value={leadForm.apiUrl} />
        </div>
      ) : admin ? (
        <Button className="mt-4" busy={a.busy === "make"} onClick={() => a.run("make", () => api("/api/integrations/leadform", { body: {} }), "Your form is live.")}>Create my lead form</Button>
      ) : null}
      <div className="mt-3 space-y-2"><ErrorText>{a.error}</ErrorText>{a.ok && <Notice tone="success">{a.ok}</Notice>}</div>
    </Card>
  );
}

function Billing() {
  const { me, refresh } = useSession();
  const admin = isAdmin(me);
  const params = new URLSearchParams(location.search);
  const a = useAction(refresh);
  const sub = me?.org?.subscription;
  const plan = me?.plans.find((p) => p.id === me?.org?.plan);
  const connect = me?.org?.integrations?.stripeConnect;

  React.useEffect(() => {
    if (params.get("connect") === "return" || params.get("connect") === "refresh") {
      a.run("sync", () => api("/api/billing/connect/sync", { body: {} }));
    }
    if (params.get("billing") === "success") refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (key: string, path: string) => a.run(key, async () => {
    const { url } = await api<{ url: string }>(path, { body: {} });
    window.location.href = url;
  });

  return (
    <div className="space-y-5 max-w-3xl">
      {params.get("billing") === "success" && <Notice tone="success">You're all set. Your plan is active.</Notice>}
      <Card>
        <div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-white">Your plan</h3><Badge tone={sub?.status === "active" || sub?.status === "trialing" || me?.org?.beta ? "Won" : "Declined"}>{sub?.status === "none" && me?.org?.beta ? "free beta" : sub?.status?.replace("_", " ")}</Badge></div>
        <p className="text-sm text-slate-300 mt-2">{plan ? `${plan.name} — $${plan.priceMonthly}/month · ${plan.seats} seat(s) · ${plan.leadsPerMonth} leads/month` : "No plan yet."}</p>
        {sub?.trialEnd && sub.status === "trialing" && <p className="text-sm text-slate-400 mt-1">Trial ends {new Date(sub.trialEnd).toLocaleDateString()}.</p>}
        {sub?.cancelAtPeriodEnd && sub.currentPeriodEnd && <p className="text-sm text-amber-300 mt-1">Cancels on {new Date(sub.currentPeriodEnd).toLocaleDateString()}.</p>}
        {me?.org?.beta && <p className="text-sm text-emerald-300 mt-1">Free beta access{me.org.beta.until ? ` until ${new Date(me.org.beta.until).toLocaleDateString()}` : ""}. Thanks for helping us build it.</p>}
        {admin && sub?.status !== "none" && <Button className="mt-4" variant="secondary" busy={a.busy === "portal"} onClick={() => go("portal", "/api/billing/portal")}>Change plan, update card or cancel</Button>}
        {admin && sub?.status === "none" && me?.org?.plan && (
          <Button className="mt-4" variant="secondary" busy={a.busy === "checkout"} onClick={() => a.run("checkout", async () => {
            const { url } = await api<{ url: string }>("/api/billing/checkout", { body: { plan: me!.org!.plan } });
            window.location.href = url;
          })}>Start a paid plan</Button>
        )}
      </Card>
      <Card>
        <div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-white">Get paid online — Stripe</h3><Status on={!!connect?.chargesEnabled} label="Accepting card payments" /></div>
        <p className="text-sm text-slate-400 mt-1">Connect a Stripe account so customers can pay invoices by card. Money goes to your bank account on Stripe's standard payout schedule.</p>
        {connect?.accountId && !connect.chargesEnabled && <div className="mt-3"><Notice tone="warn">Stripe still needs a few details before you can accept payments. Continue setup to finish.</Notice></div>}
        {admin && (
          <div className="flex flex-wrap gap-2 mt-4">
            {!connect?.chargesEnabled && <Button busy={a.busy === "connect"} onClick={() => go("connect", "/api/billing/connect/start")}>{connect?.accountId ? "Continue Stripe setup" : "Connect Stripe"}</Button>}
            {connect?.accountId && <Button variant="secondary" busy={a.busy === "dash"} onClick={() => go("dash", "/api/billing/connect/dashboard")}>Open Stripe payouts dashboard</Button>}
            {connect?.accountId && <Button variant="ghost" busy={a.busy === "sync"} onClick={() => a.run("sync", () => api("/api/billing/connect/sync", { body: {} }), "Status refreshed.")}>Refresh status</Button>}
          </div>
        )}
      </Card>
      <ErrorText>{a.error}</ErrorText>
      {a.ok && <Notice tone="success">{a.ok}</Notice>}
    </div>
  );
}
