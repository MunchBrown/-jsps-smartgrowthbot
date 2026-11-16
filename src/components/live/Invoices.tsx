import React from "react";
import { Plus, Send, Copy, ExternalLink } from "lucide-react";
import { api, money, shortDate } from "../../lib/api";
import { useSession } from "../../lib/session";
import { PageHeader, Card, Button, Field, Input, Textarea, Select, Badge, ErrorText, Notice, Spinner, Empty, Modal, useLoad, Stat } from "./ui";
import { LineItems } from "./Estimates";

export default function Invoices() {
  const { me } = useSession();
  const [creating, setCreating] = React.useState(false);
  const [open, setOpen] = React.useState<any>(null);
  const { data, error, loading, reload } = useLoad(() => api<any[]>("/api/invoices"), []);
  const connect = me?.org?.integrations?.stripeConnect;
  const rows = data || [];
  const outstanding = rows.filter((i) => i.status === "Sent").reduce((s, i) => s + (i.total - (i.amountPaid || 0)), 0);
  const month = new Date().toISOString().slice(0, 7);
  const paid = rows.filter((i) => i.status === "Paid" && String(i.paidAt || "").startsWith(month)).reduce((s, i) => s + i.total, 0);

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Customers pay by card from the invoice link." actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" />New invoice</Button>} />
      {!connect?.chargesEnabled && (
        <div className="mb-4"><Notice tone="warn">Online card payments are off until you connect Stripe in Settings → Billing &amp; payments. You can still send invoices and mark them paid by check or cash.</Notice></div>
      )}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <Stat label="Outstanding" value={money(outstanding)} />
        <Stat label="Paid this month" value={money(paid)} />
      </div>
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Spinner /> : !rows.length ? (
        <Empty title="No invoices yet">Create one here, or from an accepted estimate.</Empty>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Invoice</th><th className="text-left p-3">Customer</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Due</th></tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const overdue = i.status === "Sent" && i.dueDate && Date.parse(i.dueDate) < Date.now();
                return (
                  <tr key={i.id} onClick={() => setOpen(i)} className="border-t border-slate-800 hover:bg-slate-900/70 cursor-pointer">
                    <td className="p-3 font-mono text-xs text-slate-300">{i.number}</td>
                    <td className="p-3 text-white">{i.clientName}</td>
                    <td className="p-3 text-right tabular-nums text-white">{money(i.total)}</td>
                    <td className="p-3"><Badge>{i.status}</Badge>{overdue && <span className="text-[11px] text-red-300 ml-2">overdue</span>}</td>
                    <td className="p-3 text-slate-400">{i.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {creating && <Modal title="New invoice" onClose={() => setCreating(false)} wide><InvoiceEditor onSaved={(inv) => { setCreating(false); reload(); setOpen(inv); }} /></Modal>}
      {open && <InvoiceDetail inv={open} canPayOnline={!!connect?.chargesEnabled} onClose={() => { setOpen(null); reload(); }} />}
    </div>
  );
}

function InvoiceEditor({ onSaved }: { onSaved: (inv: any) => void }) {
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const [f, setF] = React.useState<any>({ clientName: "", clientEmail: "", clientPhone: "", address: "", dueDate: due, notes: "" });
  const [lines, setLines] = React.useState<any[]>([{ description: "", qty: 1, unitPrice: "" }]);
  const [taxRate, setTaxRate] = React.useState("0");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSaved(await api("/api/invoices", { body: { ...f, taxRate: Number(taxRate) || 0, lineItems: lines.map((l) => ({ description: l.description, qty: Number(l.qty) || 0, unitPrice: Number(l.unitPrice) || 0 })) } }));
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Customer name"><Input value={f.clientName} onChange={set("clientName")} required /></Field>
        <Field label="Due date"><Input type="date" value={f.dueDate} onChange={set("dueDate")} required /></Field>
        <Field label="Customer email"><Input type="email" value={f.clientEmail} onChange={set("clientEmail")} /></Field>
        <Field label="Customer phone"><Input value={f.clientPhone} onChange={set("clientPhone")} /></Field>
      </div>
      <Field label="Job address"><Input value={f.address} onChange={set("address")} /></Field>
      <LineItems lines={lines} setLines={setLines} taxRate={taxRate} setTaxRate={setTaxRate} />
      <Field label="Notes"><Textarea rows={2} value={f.notes} onChange={set("notes")} /></Field>
      <ErrorText>{error}</ErrorText>
      <div className="flex justify-end"><Button type="submit" busy={busy}>Save invoice</Button></div>
    </form>
  );
}

function InvoiceDetail({ inv: initial, canPayOnline, onClose }: { inv: any; canPayOnline: boolean; onClose: () => void }) {
  const [inv, setInv] = React.useState(initial);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [link, setLink] = React.useState(initial.publicToken ? `${location.origin}/i/${initial.publicToken}` : "");
  const [method, setMethod] = React.useState("Check");

  const act = async (key: string, fn: () => Promise<any>, message: string) => {
    setBusy(key);
    setError("");
    setOk("");
    try {
      const r = await fn();
      if (r?.invoice) setInv(r.invoice); else if (r?.id) setInv(r);
      if (r?.link) setLink(r.link);
      setOk(message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <Modal title={`Invoice ${inv.number}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap"><Badge>{inv.status}</Badge><span className="text-sm text-slate-400">Due {inv.dueDate}{inv.paidAt ? ` · Paid ${shortDate(inv.paidAt)} (${inv.paymentMethod})` : ""}</span></div>
        <p className="text-white font-semibold">{inv.clientName}</p>
        <table className="w-full text-sm">
          <tbody>
            {inv.lineItems.map((li: any, i: number) => (
              <tr key={i} className="border-b border-slate-800"><td className="py-2 text-slate-200">{li.description}</td><td className="py-2 text-right tabular-nums">{money(li.amount)}</td></tr>
            ))}
            {inv.tax ? <tr><td className="py-1 text-slate-400">Tax ({inv.taxRate}%)</td><td className="py-1 text-right">{money(inv.tax)}</td></tr> : null}
            <tr><td className="py-2 font-bold text-white">Total</td><td className="py-2 text-right font-bold text-white tabular-nums">{money(inv.total)}</td></tr>
          </tbody>
        </table>
        {(inv.status === "Draft" || inv.status === "Sent") && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button busy={busy === "email"} disabled={!inv.clientEmail} onClick={() => act("email", () => api(`/api/invoices/${inv.id}/send`, { body: { channel: "email" } }), `Emailed to ${inv.clientEmail}.`)}><Send className="h-4 w-4" />Email invoice</Button>
              <Button variant="secondary" busy={busy === "sms"} disabled={!inv.clientPhone} onClick={() => act("sms", () => api(`/api/invoices/${inv.id}/send`, { body: { channel: "sms" } }), "Texted to the customer.")}>Text link</Button>
              <Button variant="secondary" busy={busy === "link"} onClick={() => act("link", () => api(`/api/invoices/${inv.id}/send`, { body: { channel: "link" } }), "Link ready.")}>Get pay link</Button>
            </div>
            {!canPayOnline && <p className="text-xs text-slate-500">The link shows the invoice; a "Pay by card" button appears once Stripe is connected.</p>}
            <Card className="!p-4">
              <p className="text-sm font-semibold text-white mb-2">Got paid another way?</p>
              <div className="flex flex-wrap gap-2 items-end">
                <Select value={method} onChange={(e) => setMethod(e.target.value)} className="w-44" aria-label="Payment method">{["Check", "Cash", "Bank transfer", "Other"].map((m) => <option key={m}>{m}</option>)}</Select>
                <Button variant="secondary" busy={busy === "paid"} onClick={() => act("paid", () => api(`/api/invoices/${inv.id}`, { method: "PATCH", body: { markPaid: true, paymentMethod: method } }), "Marked as paid.")}>Mark paid</Button>
                <Button variant="ghost" busy={busy === "void"} onClick={() => act("void", () => api(`/api/invoices/${inv.id}`, { method: "PATCH", body: { void: true } }), "Invoice voided.")}>Void</Button>
              </div>
            </Card>
          </>
        )}
        {link && (
          <div className="flex gap-2 items-center">
            <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Invoice link" />
            <Button variant="secondary" aria-label="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(link); setOk("Link copied."); } catch { setOk("Select the link and copy it."); } }}><Copy className="h-4 w-4" /></Button>
            <a href={link} target="_blank" rel="noreferrer" className="text-orange-400" aria-label="Open invoice page"><ExternalLink className="h-4 w-4" /></a>
          </div>
        )}
        <ErrorText>{error}</ErrorText>
        {ok && <Notice tone="success">{ok}</Notice>}
      </div>
    </Modal>
  );
}
