import React from "react";
import { Plus, Trash2, Send, Copy, Receipt, Sparkles, ExternalLink } from "lucide-react";
import { api, money, shortDate } from "../../lib/api";
import { PageHeader, Card, Button, Field, Input, Textarea, Select, Badge, ErrorText, Notice, Spinner, Empty, Modal, useLoad } from "./ui";

type Line = { description: string; qty: number | string; unitPrice: number | string };

export function LineItems({ lines, setLines, taxRate, setTaxRate }: { lines: Line[]; setLines: (l: Line[]) => void; taxRate: string; setTaxRate: (v: string) => void }) {
  const update = (i: number, k: keyof Line, v: string) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const subtotal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);
  const tax = (subtotal * (Number(taxRate) || 0)) / 100;
  return (
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-[1fr_80px_120px_100px_32px] gap-2 text-[11px] text-slate-500 uppercase tracking-wider">
        <span>Item</span><span>Qty</span><span>Price</span><span className="text-right">Amount</span><span />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_80px_120px_100px_32px] gap-2 items-center">
          <Input className="col-span-2 sm:col-span-1" placeholder="e.g. Walls & ceilings — 3 bedrooms" value={l.description} onChange={(e) => update(i, "description", e.target.value)} required maxLength={300} aria-label="Item description" />
          <Input type="number" min={0} step="any" value={l.qty} onChange={(e) => update(i, "qty", e.target.value)} aria-label="Quantity" />
          <Input type="number" min={0} step="0.01" value={l.unitPrice} onChange={(e) => update(i, "unitPrice", e.target.value)} required aria-label="Unit price" />
          <span className="text-right text-sm text-slate-300 tabular-nums">{money((Number(l.qty) || 0) * (Number(l.unitPrice) || 0))}</span>
          <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} className="text-slate-500 hover:text-red-400 disabled:opacity-30 cursor-pointer justify-self-end" aria-label="Remove line"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => setLines([...lines, { description: "", qty: 1, unitPrice: "" }])}><Plus className="h-4 w-4" />Add line</Button>
      <div className="flex flex-col items-end gap-1 text-sm pt-2 border-t border-slate-800">
        <span className="text-slate-400">Subtotal <span className="tabular-nums text-slate-200 ml-3">{money(subtotal)}</span></span>
        <span className="text-slate-400 flex items-center gap-2">Tax %<Input type="number" min={0} max={25} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="!w-20 !py-1" aria-label="Tax rate percent" /><span className="tabular-nums text-slate-200">{money(tax)}</span></span>
        <span className="text-white font-bold text-base">Total <span className="tabular-nums ml-3">{money(subtotal + tax)}</span></span>
      </div>
    </div>
  );
}

export function EstimateEditor({ lead, onSaved, onCancel }: { lead?: any; onSaved: (est: any) => void; onCancel?: () => void }) {
  const [f, setF] = React.useState<any>({
    clientName: lead?.clientName || "", clientEmail: lead?.email || "", clientPhone: lead?.phone || "", address: lead?.address || "",
    projectType: lead?.projectDescription?.slice(0, 120) || "", scope: "", notes: "", validDays: 30,
  });
  const [lines, setLines] = React.useState<Line[]>([{ description: "", qty: 1, unitPrice: "" }]);
  const [taxRate, setTaxRate] = React.useState("0");
  const [busy, setBusy] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const draftScope = async () => {
    setAiBusy(true);
    setError("");
    try {
      const r = await api<{ text: string }>("/api/ai/complete", {
        body: {
          systemPrompt: "You write clear, professional scopes of work for a painting contractor's customer estimate. Plain text, short numbered sections (Prep, Paint, Clean-up, Exclusions). No prices. Under 220 words.",
          prompt: `Project: ${f.projectType || "painting project"}\nAddress: ${f.address || "n/a"}\nCustomer notes: ${lead?.projectDescription || "none"}\nLine items: ${lines.map((l) => l.description).filter(Boolean).join("; ") || "none yet"}`,
          temperature: 0.4,
        },
      });
      setF((cur: any) => ({ ...cur, scope: r.text.trim() }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const est = await api("/api/estimates", {
        body: { ...f, leadId: lead?.id, taxRate: Number(taxRate) || 0, lineItems: lines.map((l) => ({ description: l.description, qty: Number(l.qty) || 0, unitPrice: Number(l.unitPrice) || 0 })) },
      });
      onSaved(est);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Customer name"><Input value={f.clientName} onChange={set("clientName")} required /></Field>
        <Field label="Project"><Input value={f.projectType} onChange={set("projectType")} placeholder="e.g. Exterior repaint — 2-story colonial" /></Field>
        <Field label="Customer email"><Input type="email" value={f.clientEmail} onChange={set("clientEmail")} /></Field>
        <Field label="Customer phone"><Input value={f.clientPhone} onChange={set("clientPhone")} /></Field>
      </div>
      <Field label="Project address"><Input value={f.address} onChange={set("address")} /></Field>
      <LineItems lines={lines} setLines={setLines} taxRate={taxRate} setTaxRate={setTaxRate} />
      <Field label="Scope of work (shown to the customer)">
        <Textarea rows={6} value={f.scope} onChange={set("scope")} maxLength={8000} />
      </Field>
      <Button type="button" variant="secondary" busy={aiBusy} onClick={draftScope}><Sparkles className="h-4 w-4" />Draft scope with AI</Button>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Notes / terms"><Textarea rows={2} value={f.notes} onChange={set("notes")} placeholder="e.g. 30% deposit to schedule; balance on completion" /></Field>
        <Field label="Valid for (days)"><Input type="number" min={1} max={365} value={f.validDays} onChange={set("validDays")} /></Field>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" busy={busy}>Save estimate</Button>
      </div>
    </form>
  );
}

export default function Estimates({ onOpenInvoices }: { onOpenInvoices: () => void }) {
  const [creating, setCreating] = React.useState(false);
  const [open, setOpen] = React.useState<any>(null);
  const { data, error, loading, reload } = useLoad(() => api<any[]>("/api/estimates"), []);
  return (
    <div>
      <PageHeader title="Estimates" subtitle="Send a link your customer can accept online." actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" />New estimate</Button>} />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Spinner /> : !data?.length ? (
        <Empty title="No estimates yet">Create one here or from a lead. The AI estimator in Quote Genius also saves here.</Empty>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Estimate</th><th className="text-left p-3">Customer</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Created</th></tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} onClick={() => setOpen(e)} className="border-t border-slate-800 hover:bg-slate-900/70 cursor-pointer">
                  <td className="p-3 font-mono text-xs text-slate-300">{e.number || e.id}</td>
                  <td className="p-3"><p className="text-white font-medium">{e.clientName}</p><p className="text-xs text-slate-500 truncate max-w-[240px]">{e.projectType}</p></td>
                  <td className="p-3 text-right tabular-nums text-white">{money(e.total ?? e.totalAmount)}</td>
                  <td className="p-3"><Badge>{e.status}</Badge>{e.viewedAt && e.status === "Sent" && <span className="text-[11px] text-slate-500 ml-2">viewed</span>}</td>
                  <td className="p-3 text-slate-400">{shortDate(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {creating && <Modal title="New estimate" onClose={() => setCreating(false)} wide><EstimateEditor onSaved={(est) => { setCreating(false); reload(); setOpen(est); }} onCancel={() => setCreating(false)} /></Modal>}
      {open && <EstimateDetail est={open} onClose={() => { setOpen(null); reload(); }} onInvoiced={() => { setOpen(null); onOpenInvoices(); }} />}
    </div>
  );
}

function EstimateDetail({ est: initial, onClose, onInvoiced }: { est: any; onClose: () => void; onInvoiced: () => void }) {
  const [est, setEst] = React.useState(initial);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const [link, setLink] = React.useState(initial.publicToken ? `${location.origin}/e/${initial.publicToken}` : "");
  const [ok, setOk] = React.useState("");
  const [deposit, setDeposit] = React.useState("30");

  const send = async (channel: string) => {
    setBusy(channel);
    setError("");
    setOk("");
    try {
      const r = await api<any>(`/api/estimates/${est.id}/send`, { body: { channel } });
      setEst(r.estimate);
      setLink(r.link);
      setOk(channel === "link" ? "Link ready — copy it below." : channel === "email" ? `Emailed to ${est.clientEmail}.` : "Texted to the customer.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setOk("Link copied.");
    } catch {
      setOk("Select the link and copy it.");
    }
  };
  const invoice = async () => {
    setBusy("inv");
    setError("");
    try {
      await api(`/api/estimates/${est.id}/invoice`, { body: { depositPercent: Number(deposit) } });
      onInvoiced();
    } catch (e: any) {
      setError(e.message);
      setBusy("");
    }
  };
  const del = async () => {
    if (busy !== "confirm") { setBusy("confirm"); return; }
    setBusy("del");
    try { await api(`/api/estimates/${est.id}`, { method: "DELETE" }); onClose(); } catch (e: any) { setError(e.message); setBusy(""); }
  };

  return (
    <Modal title={`Estimate ${est.number || ""}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2"><Badge>{est.status}</Badge>{est.acceptedName && <span className="text-sm text-emerald-300">Accepted by {est.acceptedName} on {shortDate(est.acceptedAt)}</span>}</div>
        <p className="text-white font-semibold">{est.clientName} <span className="text-slate-400 font-normal">{est.projectType ? `· ${est.projectType}` : ""}</span></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {(est.lineItems || []).map((li: any, i: number) => (
                <tr key={i} className="border-b border-slate-800"><td className="py-2 text-slate-200">{li.description}</td><td className="py-2 text-slate-400 text-right">{li.qty} × {money(li.unitPrice)}</td><td className="py-2 text-right tabular-nums text-white">{money(li.amount)}</td></tr>
              ))}
              {est.tax ? <tr><td className="py-1 text-slate-400" colSpan={2}>Tax ({est.taxRate}%)</td><td className="py-1 text-right tabular-nums">{money(est.tax)}</td></tr> : null}
              <tr><td className="py-2 font-bold text-white" colSpan={2}>Total</td><td className="py-2 text-right font-bold text-white tabular-nums">{money(est.total)}</td></tr>
            </tbody>
          </table>
        </div>
        {est.scope && <details><summary className="text-sm text-slate-400 cursor-pointer">Scope of work</summary><p className="text-sm text-slate-300 whitespace-pre-wrap mt-2">{est.scope}</p></details>}

        {est.status !== "Accepted" && est.status !== "Declined" && (
          <div className="flex flex-wrap gap-2">
            <Button busy={busy === "email"} onClick={() => send("email")} disabled={!est.clientEmail}><Send className="h-4 w-4" />Email to customer</Button>
            <Button variant="secondary" busy={busy === "sms"} onClick={() => send("sms")} disabled={!est.clientPhone}>Text link</Button>
            <Button variant="secondary" busy={busy === "link"} onClick={() => send("link")}>Get share link</Button>
          </div>
        )}
        {link && (
          <div className="flex gap-2 items-center">
            <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Customer link" />
            <Button variant="secondary" onClick={copy} aria-label="Copy link"><Copy className="h-4 w-4" /></Button>
            <a href={link} target="_blank" rel="noreferrer" className="text-orange-400" aria-label="Open customer page"><ExternalLink className="h-4 w-4" /></a>
          </div>
        )}
        {est.status === "Accepted" && (
          <Card className="!p-4 space-y-3">
            <p className="text-sm text-white font-semibold">Next: send an invoice</p>
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Invoice amount"><Select value={deposit} onChange={(e) => setDeposit(e.target.value)} className="w-44">
                {["10", "25", "30", "33", "50", "100"].map((p) => <option key={p} value={p}>{p === "100" ? "Full amount" : `${p}% deposit`}</option>)}
              </Select></Field>
              <Button busy={busy === "inv"} onClick={invoice}><Receipt className="h-4 w-4" />Create invoice</Button>
            </div>
          </Card>
        )}
        <ErrorText>{error}</ErrorText>
        {ok && <Notice tone="success">{ok}</Notice>}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <Button variant="danger" busy={busy === "del"} onClick={del}><Trash2 className="h-4 w-4" />{busy === "confirm" ? "Click again to delete" : "Delete"}</Button>
        </div>
      </div>
    </Modal>
  );
}
