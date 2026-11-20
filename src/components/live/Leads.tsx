import React from "react";
import { Phone, MessageSquare, CalendarPlus, FileText, Trash2, Plus, Search, ShieldCheck, Bot } from "lucide-react";
import { api, money, shortDate, dateTime } from "../../lib/api";
import { useSession } from "../../lib/session";
import {
  PageHeader, Card, Button, Field, Input, Textarea, Select, Badge, ErrorText, Notice, Spinner, Empty, Modal, useLoad,
} from "./ui";
import { AppointmentForm } from "./Schedule";
import { EstimateEditor } from "./Estimates";

const STATUSES = ["New", "Contacted", "Qualified", "Quoted", "Won", "Lost"];

export default function Leads({ focusLeadId, onFocusHandled }: { focusLeadId?: string; onFocusHandled?: () => void }) {
  const { me, refresh } = useSession();
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(focusLeadId || null);
  const q = new URLSearchParams({ ...(status ? { status } : {}), ...(search ? { search } : {}) }).toString();
  const { data, error, loading, reload } = useLoad(() => api<{ leads: any[] }>(`/api/leads${q ? "?" + q : ""}`), [q]);

  React.useEffect(() => {
    if (focusLeadId) {
      setOpenId(focusLeadId);
      onFocusHandled?.();
    }
  }, [focusLeadId]);

  const usage = me?.usage;
  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={usage ? `${usage.leads} of ${usage.leadLimit} new leads used this month` : undefined}
        actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add lead</Button>}
      />
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search name, phone, email or address" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>
      <ErrorText>{error}</ErrorText>
      {loading && !data ? (
        <Spinner />
      ) : !data?.leads.length ? (
        <Empty title={search || status ? "No leads match" : "No leads yet"}>
          Add one by hand, share your lead form (Settings → Integrations), or connect your AI phone line so callers become leads automatically.
        </Empty>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Customer</th><th className="text-left p-3">Status</th><th className="text-left p-3">AI score</th>
                <th className="text-left p-3">Source</th><th className="text-left p-3">Added</th><th className="text-left p-3">Contact</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map((l) => (
                <tr key={l.id} onClick={() => setOpenId(l.id)} className="border-t border-slate-800 hover:bg-slate-900/70 cursor-pointer">
                  <td className="p-3">
                    <p className="font-semibold text-white flex items-center gap-2">{l.clientName}{l.hasUnread && <span className="h-2 w-2 rounded-full bg-orange-500" title="New reply" />}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[260px]">{l.projectDescription || l.address || l.clientType}</p>
                  </td>
                  <td className="p-3"><Badge>{l.status}</Badge></td>
                  <td className="p-3">{l.score == null ? <span className="text-slate-600">—</span> : <span className="flex items-center gap-2"><Badge tone={l.category}>{l.category}</Badge><span className="tabular-nums text-slate-300">{l.score}</span></span>}</td>
                  <td className="p-3 text-slate-400">{l.source}</td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">{shortDate(l.createdAt)}</td>
                  <td className="p-3 text-slate-400">
                    <span className="flex items-center gap-1.5">{l.contactConsent?.given ? <ShieldCheck className="h-4 w-4 text-emerald-400" aria-label="Consent recorded" /> : null}{l.phone || l.email}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adding && (
        <AddLeadModal
          onClose={() => setAdding(false)}
          onCreated={async (lead) => {
            setAdding(false);
            await reload();
            refresh();
            setOpenId(lead.id);
          }}
        />
      )}
      {openId && <LeadDrawer id={openId} onClose={() => { setOpenId(null); reload(); }} />}
    </div>
  );
}

function AddLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (lead: any) => void }) {
  const [f, setF] = React.useState<any>({ clientName: "", phone: "", email: "", clientType: "Residential", address: "", projectDescription: "", budget: "", timeline: "", source: "Phone call", contactConsent: false, consentMethod: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onCreated(await api("/api/leads", { body: { ...f, budget: f.budget ? Number(f.budget) : undefined } }));
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <Modal title="Add a lead" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Customer name"><Input value={f.clientName} onChange={set("clientName")} required maxLength={120} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Phone"><Input value={f.phone} onChange={set("phone")} inputMode="tel" /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={set("email")} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Type"><Select value={f.clientType} onChange={set("clientType")}><option>Residential</option><option>Commercial</option><option>Government</option></Select></Field>
          <Field label="Source"><Select value={f.source} onChange={set("source")}>{["Phone call", "Referral", "Website", "Google", "Facebook", "Angi / HomeAdvisor", "Walk-in", "Other"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        </div>
        <Field label="Project address"><Input value={f.address} onChange={set("address")} /></Field>
        <Field label="Project details"><Textarea rows={3} value={f.projectDescription} onChange={set("projectDescription")} placeholder="Rooms or surfaces, condition, anything they mentioned" /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Budget (optional)"><Input type="number" min={0} value={f.budget} onChange={set("budget")} /></Field>
          <Field label="Timeline"><Input value={f.timeline} onChange={set("timeline")} placeholder="e.g. Next month" /></Field>
        </div>
        <ConsentBox checked={f.contactConsent} onChange={set("contactConsent")} method={f.consentMethod} onMethod={set("consentMethod")} />
        <ErrorText>{error}</ErrorText>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" busy={busy}>Save lead</Button></div>
        <p className="text-[11px] text-slate-500">New leads are scored by AI automatically when AI is available.</p>
      </form>
    </Modal>
  );
}

function ConsentBox({ checked, onChange, method, onMethod }: any) {
  return (
    <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/50 space-y-2">
      <label className="flex gap-2 items-start text-sm text-slate-200">
        <input type="checkbox" checked={checked} onChange={onChange} className="mt-1" />
        <span>This customer agreed in writing to be contacted by AI calls and text messages.</span>
      </label>
      {checked && <Input value={method} onChange={onMethod} placeholder="How? e.g. signed request form 11/16, website checkbox" maxLength={200} />}
      <p className="text-[11px] text-slate-500">Required by the TCPA before AI-voice calls or marketing texts. Without it, you can still call and email them yourself.</p>
    </div>
  );
}

function LeadDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { me } = useSession();
  const { data, error, loading, reload } = useLoad(() => api<any>(`/api/leads/${id}`), [id]);
  const [action, setAction] = React.useState<"" | "text" | "appt" | "estimate" | "edit">("");
  const [busy, setBusy] = React.useState("");
  const [msg, setMsg] = React.useState<{ tone: "success" | "warn"; text: string } | null>(null);
  const [actionError, setActionError] = React.useState("");
  const lead = data?.lead;
  const integ = me?.org?.integrations || {};

  const run = async (key: string, fn: () => Promise<any>, ok: string) => {
    setBusy(key);
    setActionError("");
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: "success", text: ok });
      await reload();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setBusy("");
    }
  };

  const timeline = React.useMemo(() => {
    if (!data) return [];
    const items: any[] = [
      ...data.calls.map((c: any) => ({ kind: "call", at: c.createdAt, c })),
      ...data.messages.map((m: any) => ({ kind: "msg", at: m.createdAt, m })),
      ...data.appointments.map((a: any) => ({ kind: "appt", at: a.createdAt, a })),
      ...data.estimates.map((e: any) => ({ kind: "est", at: e.createdAt, e })),
    ];
    return items.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }, [data]);

  return (
    <Modal title={lead?.clientName || "Lead"} onClose={onClose} wide>
      {loading && !data ? <Spinner /> : error ? <ErrorText>{error}</ErrorText> : lead && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={lead.status}
              onChange={(e) => run("status", () => api(`/api/leads/${id}`, { method: "PATCH", body: { status: e.target.value } }), "Status updated.")}
              className="w-40"
              aria-label="Lead status"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
            {lead.score != null && <Badge tone={lead.category}>{lead.category} · {lead.score}</Badge>}
            {lead.contactConsent?.given ? <Badge tone="Won">Consent recorded</Badge> : <Badge tone="Draft">No AI-contact consent</Badge>}
            {lead.smsOptOut && <Badge tone="Declined">Opted out of texts</Badge>}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info label="Phone" value={lead.phone} />
            <Info label="Email" value={lead.email} />
            <Info label="Address" value={lead.address} />
            <Info label="Type / source" value={`${lead.clientType} · ${lead.source}`} />
            {lead.budget ? <Info label="Budget" value={money(lead.budget)} /> : null}
            {lead.timeline ? <Info label="Timeline" value={lead.timeline} /> : null}
          </div>
          {lead.projectDescription && <p className="text-sm text-slate-300 whitespace-pre-wrap">{lead.projectDescription}</p>}
          {lead.justification && (
            <Card className="!p-4">
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" />AI read on this lead</p>
              <p className="text-sm text-slate-200 mt-1">{lead.justification}</p>
              {lead.actionPlan?.length > 0 && <ul className="list-disc pl-5 mt-2 text-sm text-slate-300 space-y-0.5">{lead.actionPlan.map((s: string) => <li key={s}>{s}</li>)}</ul>}
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              busy={busy === "call"}
              onClick={() => run("call", () => api(`/api/leads/${id}/call`, { body: { leadType: lead.status === "Quoted" ? "estimate" : "form" } }), "AI call started. The summary and transcript will appear here when the call ends.")}
              title={integ.vapi?.connected ? "" : "Connect Vapi in Settings first"}
            >
              <Phone className="h-4 w-4" />AI call
            </Button>
            <Button variant="secondary" onClick={() => setAction(action === "text" ? "" : "text")}><MessageSquare className="h-4 w-4" />Text</Button>
            <Button variant="secondary" onClick={() => setAction(action === "appt" ? "" : "appt")}><CalendarPlus className="h-4 w-4" />Book visit</Button>
            <Button variant="secondary" onClick={() => setAction(action === "estimate" ? "" : "estimate")}><FileText className="h-4 w-4" />Estimate</Button>
            <Button variant="ghost" onClick={() => setAction(action === "edit" ? "" : "edit")}>Edit</Button>
          </div>
          {!integ.vapi?.connected && <p className="text-xs text-slate-500">AI calls need Vapi connected in Settings → Integrations. Texts need Twilio.</p>}
          <ErrorText>{actionError}</ErrorText>
          {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

          {action === "text" && <TextForm leadId={id} onSent={() => { setAction(""); setMsg({ tone: "success", text: "Text sent." }); reload(); }} />}
          {action === "appt" && (
            <Card><AppointmentForm lead={lead} onSaved={(appt) => { setAction(""); setMsg({ tone: appt.calendarWarning ? "warn" : "success", text: appt.calendarWarning ? `Saved, but not added to Google Calendar: ${appt.calendarWarning}` : appt.googleEventId ? "Booked and added to your Google Calendar." : "Booked. Connect Google in Settings to sync your calendar." }); reload(); }} /></Card>
          )}
          {action === "estimate" && (
            <Card><EstimateEditor lead={lead} onSaved={() => { setAction(""); setMsg({ tone: "success", text: "Estimate saved. Send it from the Estimates page." }); reload(); }} onCancel={() => setAction("")} /></Card>
          )}
          {action === "edit" && <EditLead lead={lead} onSaved={() => { setAction(""); reload(); }} />}

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">History</h4>
            {!timeline.length ? <p className="text-sm text-slate-500">Nothing yet.</p> : (
              <ul className="space-y-2">
                {timeline.map((t, i) => (
                  <li key={i} className="border border-slate-800 rounded-xl p-3 text-sm">
                    <p className="text-[11px] text-slate-500">{dateTime(t.at)}</p>
                    {t.kind === "call" && (
                      <div>
                        <p className="text-white font-medium">{t.c.direction === "inbound" ? "Inbound" : "AI"} call {t.c.status === "ended" ? `· ${Math.round((t.c.durationSeconds || 0) / 60)} min` : `· ${t.c.status}`}</p>
                        {t.c.summary && <p className="text-slate-300 mt-1">{t.c.summary}</p>}
                        {t.c.recordingUrl && <a href={t.c.recordingUrl} target="_blank" rel="noreferrer" className="text-orange-400 text-xs">Listen to recording</a>}
                        {t.c.transcript && <details className="mt-1"><summary className="text-xs text-slate-400 cursor-pointer">Transcript</summary><pre className="whitespace-pre-wrap text-xs text-slate-400 mt-1 max-h-60 overflow-auto">{t.c.transcript}</pre></details>}
                      </div>
                    )}
                    {t.kind === "msg" && <p className={t.m.direction === "inbound" ? "text-white" : "text-slate-300"}><strong>{t.m.direction === "inbound" ? "Customer texted:" : "You texted:"}</strong> {t.m.body}</p>}
                    {t.kind === "appt" && <p className="text-slate-300"><strong className="text-white">Appointment:</strong> {t.a.title} — {dateTime(t.a.start)} <Badge>{t.a.status}</Badge></p>}
                    {t.kind === "est" && <p className="text-slate-300"><strong className="text-white">Estimate {t.e.number}:</strong> {money(t.e.total)} <Badge>{t.e.status}</Badge></p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <Button variant="danger" busy={busy === "del"} onClick={() => {
              if (busy !== "confirm-del") { setBusy("confirm-del"); setActionError("Click Delete again to permanently delete this lead."); return; }
              run("del", async () => { await api(`/api/leads/${id}`, { method: "DELETE" }); onClose(); }, "Deleted.");
            }}><Trash2 className="h-4 w-4" />{busy === "confirm-del" ? "Confirm delete" : "Delete lead"}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-slate-200 break-words select-text">{value || "—"}</p>
    </div>
  );
}

function TextForm({ leadId, onSent }: { leadId: string; onSent: () => void }) {
  const { me } = useSession();
  const [body, setBody] = React.useState(`Hi, this is ${me?.org?.name}. `);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/api/leads/${leadId}/text`, { body: { body } });
      onSent();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={send} className="space-y-2">
      <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1500} required />
      <p className="text-[11px] text-slate-500">{body.length}/1500 · Replies show up in this lead's history.</p>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" busy={busy}>Send text</Button>
    </form>
  );
}

function EditLead({ lead, onSaved }: { lead: any; onSaved: () => void }) {
  const [f, setF] = React.useState<any>({
    clientName: lead.clientName, phone: lead.phone || "", email: lead.email || "", address: lead.address || "",
    projectDescription: lead.projectDescription || "", notes: lead.notes || "",
    contactConsent: !!lead.contactConsent?.given, consentMethod: lead.contactConsent?.method || "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/api/leads/${lead.id}`, { method: "PATCH", body: f });
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <form onSubmit={save} className="space-y-3">
        <Field label="Name"><Input value={f.clientName} onChange={set("clientName")} required /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Phone"><Input value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={set("email")} /></Field>
        </div>
        <Field label="Address"><Input value={f.address} onChange={set("address")} /></Field>
        <Field label="Project details"><Textarea rows={3} value={f.projectDescription} onChange={set("projectDescription")} /></Field>
        <Field label="Private notes"><Textarea rows={2} value={f.notes} onChange={set("notes")} /></Field>
        <ConsentBox checked={f.contactConsent} onChange={set("contactConsent")} method={f.consentMethod} onMethod={set("consentMethod")} />
        <ErrorText>{error}</ErrorText>
        <Button type="submit" busy={busy}>Save changes</Button>
      </form>
    </Card>
  );
}
