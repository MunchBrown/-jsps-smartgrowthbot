import React from "react";
import { Plus, ExternalLink } from "lucide-react";
import { api, dateTime } from "../../lib/api";
import { useSession } from "../../lib/session";
import { PageHeader, Card, Button, Field, Input, Textarea, Select, Badge, ErrorText, Notice, Spinner, Empty, Modal, useLoad } from "./ui";

function defaultStart() {
  const d = new Date(Date.now() + 24 * 3600 * 1000);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppointmentForm({ lead, onSaved }: { lead?: any; onSaved: (appt: any) => void }) {
  const [f, setF] = React.useState<any>({
    title: lead ? `Estimate - ${lead.clientName}` : "",
    type: "Estimate",
    start: defaultStart(),
    durationMinutes: 60,
    customerName: lead?.clientName || "",
    address: lead?.address || "",
    notes: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const start = new Date(f.start);
      if (Number.isNaN(start.getTime())) throw new Error("Pick a date and time.");
      const appt = await api("/api/appointments", { body: { ...f, start: start.toISOString(), durationMinutes: Number(f.durationMinutes), leadId: lead?.id } });
      onSaved(appt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Title"><Input value={f.title} onChange={set("title")} required maxLength={200} /></Field>
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Type"><Select value={f.type} onChange={set("type")}>{["Estimate", "Walkthrough", "Job", "Follow-up", "Other"].map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Date & time"><Input type="datetime-local" value={f.start} onChange={set("start")} required /></Field>
        <Field label="Length"><Select value={f.durationMinutes} onChange={set("durationMinutes")}>{[30, 60, 90, 120, 240, 480].map((m) => <option key={m} value={m}>{m >= 60 ? `${m / 60} hr` : `${m} min`}</option>)}</Select></Field>
      </div>
      {!lead && <Field label="Customer"><Input value={f.customerName} onChange={set("customerName")} /></Field>}
      <Field label="Address"><Input value={f.address} onChange={set("address")} /></Field>
      <Field label="Notes"><Textarea rows={2} value={f.notes} onChange={set("notes")} /></Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" busy={busy}>Book it</Button>
    </form>
  );
}

export default function Schedule() {
  const { me } = useSession();
  const [adding, setAdding] = React.useState(false);
  const [showPast, setShowPast] = React.useState(false);
  const [note, setNote] = React.useState("");
  const { data, error, loading, reload } = useLoad(() => api<any[]>("/api/appointments"), []);
  const now = Date.now();
  const rows = (data || []).filter((a) => (showPast ? true : Date.parse(a.end) >= now - 3600000));
  const google = me?.org?.integrations?.google;

  const setStatus = async (id: string, status: string) => {
    try {
      await api(`/api/appointments/${id}`, { method: "PATCH", body: { status } });
      reload();
    } catch (e: any) {
      setNote(e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle={google?.connected ? `Syncing to Google Calendar (${google.email})` : "Connect Google in Settings to sync with your calendar."}
        actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Book appointment</Button>}
      />
      <label className="flex items-center gap-2 text-sm text-slate-400 mb-4"><input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />Show past appointments</label>
      <ErrorText>{error || note}</ErrorText>
      {loading && !data ? <Spinner /> : !rows.length ? (
        <Empty title="Nothing on the schedule">Book estimate visits from a lead, or add one here.</Empty>
      ) : (
        <div className="grid gap-3">
          {rows.map((a) => (
            <div key={a.id}><Card className="!p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-semibold">{a.title}</p>
                  <p className="text-sm text-slate-400">{dateTime(a.start)} · {a.type}{a.address ? ` · ${a.address}` : ""}</p>
                  {a.notes && <p className="text-xs text-slate-500 mt-1">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>{a.status}</Badge>
                  {a.googleEventLink && <a href={a.googleEventLink} target="_blank" rel="noreferrer" className="text-xs text-orange-400 inline-flex items-center gap-1">Google <ExternalLink className="h-3 w-3" /></a>}
                  {a.status === "Scheduled" && (
                    <>
                      <Button variant="secondary" onClick={() => setStatus(a.id, "Completed")}>Done</Button>
                      <Button variant="ghost" onClick={() => setStatus(a.id, "Canceled")}>Cancel</Button>
                    </>
                  )}
                </div>
              </div>
            </Card></div>
          ))}
        </div>
      )}
      {adding && (
        <Modal title="Book an appointment" onClose={() => setAdding(false)}>
          <AppointmentForm onSaved={(appt) => { setAdding(false); setNote(appt.calendarWarning ? `Saved, but not added to Google Calendar: ${appt.calendarWarning}` : ""); reload(); }} />
        </Modal>
      )}
      {!google?.connected && <div className="mt-6"><Notice>Tip: connecting Google adds every booking to your Google Calendar and lets you email estimates from your Gmail.</Notice></div>}
    </div>
  );
}
