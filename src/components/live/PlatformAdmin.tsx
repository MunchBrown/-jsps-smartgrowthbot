import React from "react";
import { api, shortDate } from "../../lib/api";
import { useSession } from "../../lib/session";
import { PageHeader, Badge, Button, Select, ErrorText, Notice, Spinner, Empty, useLoad } from "./ui";

// Operator-only: every company on the platform, with free beta access controls.
export default function PlatformAdmin() {
  const { refresh } = useSession();
  const { data, error, loading, reload } = useLoad(() => api<any[]>("/api/admin/orgs"), []);
  const [msg, setMsg] = React.useState("");
  const [err, setErr] = React.useState("");

  return (
    <div>
      <PageHeader title="Platform admin" subtitle="Every company on Smart Growth Bot. Give beta companies free access without Stripe." />
      <div className="space-y-2 mb-4"><ErrorText>{error || err}</ErrorText>{msg && <Notice tone="success">{msg}</Notice>}</div>
      {loading && !data ? <Spinner /> : !data?.length ? <Empty title="No companies yet" /> : (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Company</th><th className="text-left p-3">Owner</th><th className="text-left p-3">Users</th><th className="text-left p-3">Billing</th><th className="text-left p-3">Beta access</th><th className="text-left p-3">Created</th></tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <Row key={o.id} o={o} onDone={async (m) => { setErr(""); setMsg(m); await reload(); refresh(); }} onError={(m) => { setMsg(""); setErr(m); }} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ o, onDone, onError }: { o: any; key?: string; onDone: (m: string) => void; onError: (m: string) => void }) {
  const [plan, setPlan] = React.useState(o.beta?.plan || "professional");
  const [days, setDays] = React.useState("90");
  const [busy, setBusy] = React.useState("");
  const run = async (key: string, fn: () => Promise<any>, m: string) => {
    setBusy(key);
    try {
      await fn();
      onDone(m);
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy("");
    }
  };
  return (
    <tr className="border-t border-slate-800 align-top">
      <td className="p-3 text-white font-medium">{o.name}</td>
      <td className="p-3 text-slate-400">{o.ownerEmail}</td>
      <td className="p-3 text-slate-400 tabular-nums">{o.members}</td>
      <td className="p-3"><Badge tone={["active", "trialing"].includes(o.subscriptionStatus) ? "Won" : "Draft"}>{o.subscriptionStatus.replace("_", " ")}</Badge></td>
      <td className="p-3">
        {o.beta ? (
          <div className="space-y-1.5">
            <Badge tone="Won">{o.beta.plan}{o.beta.until ? ` until ${shortDate(o.beta.until)}` : " · no end date"}</Badge>
            <div><Button variant="ghost" busy={busy === "end"} onClick={() => run("end", () => api(`/api/admin/orgs/${o.id}/beta`, { method: "DELETE" }), `Beta access removed for ${o.name}.`)}>Remove</Button></div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={plan} onChange={(e) => setPlan(e.target.value)} className="!w-36" aria-label="Beta plan">
              <option value="starter">Starter</option><option value="professional">Professional</option><option value="premium">Premium</option>
            </Select>
            <Select value={days} onChange={(e) => setDays(e.target.value)} className="!w-32" aria-label="Beta length">
              <option value="30">30 days</option><option value="90">90 days</option><option value="180">6 months</option><option value="0">No end date</option>
            </Select>
            <Button busy={busy === "grant"} onClick={() => run("grant", () => api(`/api/admin/orgs/${o.id}/beta`, { body: { plan, days: Number(days) } }), `${o.name} now has free ${plan} access.`)}>Give beta access</Button>
          </div>
        )}
      </td>
      <td className="p-3 text-slate-400 whitespace-nowrap">{shortDate(o.createdAt)}</td>
    </tr>
  );
}
