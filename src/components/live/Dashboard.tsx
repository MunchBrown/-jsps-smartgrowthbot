import React from "react";
import { api, money, dateTime } from "../../lib/api";
import { useSession } from "../../lib/session";
import { PageHeader, Card, Stat, Badge, ErrorText, Spinner, Button, useLoad } from "./ui";

export default function Dashboard({ go }: { go: (tab: string, leadId?: string) => void }) {
  const { me } = useSession();
  const { data, error, loading } = useLoad(() => api<any>("/api/dashboard"), []);
  const integ = me?.org?.integrations || {};
  const setup = [
    { done: !!integ.vapi?.connected, label: "Connect your Vapi AI phone assistant" },
    { done: !!integ.twilio?.connected, label: "Connect Twilio for texts" },
    { done: !!integ.google?.connected, label: "Connect Google Calendar & Gmail" },
    { done: !!integ.stripeConnect?.chargesEnabled, label: "Connect Stripe to get paid online" },
  ];
  const todo = setup.filter((s) => !s.done);
  const sub = me?.org?.subscription;

  return (
    <div>
      <PageHeader title={`Welcome${me?.org?.profile?.ownerName ? ", " + me.org.profile.ownerName.split(" ")[0] : ""}`} subtitle={me?.org?.name} />
      {me?.org?.beta && sub?.status === "none" && (
        <p className="text-sm text-emerald-300 mb-4">Free beta access{me.org.beta.until ? ` until ${new Date(me.org.beta.until).toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : ""}.</p>
      )}
      {sub?.status === "trialing" && sub.trialEnd && (
        <p className="text-sm text-slate-400 mb-4">Free trial ends {new Date(sub.trialEnd).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.</p>
      )}
      {todo.length > 0 && (
        <Card className="mb-6">
          <p className="font-semibold text-white">Finish setting up ({setup.length - todo.length} of {setup.length} done)</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {setup.map((s) => (
              <li key={s.label} className={s.done ? "text-emerald-300 line-through decoration-emerald-700" : "text-slate-300"}>{s.done ? "✓" : "○"} {s.label}</li>
            ))}
          </ul>
          <Button className="mt-4" variant="secondary" onClick={() => go("settings")}>Open integrations</Button>
        </Card>
      )}
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Spinner /> : data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="New leads this month" value={data.leads.thisMonth} sub={me?.usage ? `of ${me.usage.leadLimit} on your plan` : undefined} />
            <Stat label="Open estimates" value={money(data.estimates.openValue)} sub={`${data.estimates.open} waiting on customers`} />
            <Stat label="Won (accepted)" value={money(data.estimates.acceptedValue)} sub={data.estimates.winRate != null ? `${data.estimates.winRate}% win rate` : "No decisions yet"} />
            <Stat label="Unpaid invoices" value={money(data.invoices.outstanding)} sub={data.invoices.overdue ? `${money(data.invoices.overdue)} overdue` : "Nothing overdue"} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4 mt-6">
            <Card>
              <div className="flex justify-between items-center mb-3"><p className="font-semibold text-white">Pipeline</p><Button variant="ghost" onClick={() => go("leads")}>All leads</Button></div>
              <div className="space-y-2">
                {Object.entries(data.leads.byStatus).map(([status, count]: any) => (
                  <div key={status} className="flex items-center gap-3 text-sm">
                    <span className="w-24"><Badge>{status}</Badge></span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${data.leads.total ? (count / data.leads.total) * 100 : 0}%` }} /></div>
                    <span className="w-8 text-right tabular-nums text-slate-300">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="flex justify-between items-center mb-3"><p className="font-semibold text-white">Coming up</p><Button variant="ghost" onClick={() => go("schedule")}>Schedule</Button></div>
              {!data.upcoming.length ? <p className="text-sm text-slate-500">No upcoming appointments.</p> : (
                <ul className="space-y-2 text-sm">
                  {data.upcoming.map((a: any) => <li key={a.id} className="flex justify-between gap-3"><span className="text-slate-200 truncate">{a.title}</span><span className="text-slate-400 whitespace-nowrap">{dateTime(a.start)}</span></li>)}
                </ul>
              )}
            </Card>
            <Card>
              <div className="flex justify-between items-center mb-3"><p className="font-semibold text-white">Newest leads</p></div>
              {!data.leads.recent.length ? <p className="text-sm text-slate-500">No leads yet.</p> : (
                <ul className="space-y-2 text-sm">
                  {data.leads.recent.map((l: any) => (
                    <li key={l.id}><button className="w-full flex justify-between gap-3 text-left cursor-pointer hover:text-orange-300" onClick={() => go("leads", l.id)}><span className="text-slate-200 truncate">{l.clientName}</span><Badge>{l.status}</Badge></button></li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <div className="flex justify-between items-center mb-3"><p className="font-semibold text-white">Recent AI calls</p><Button variant="ghost" onClick={() => go("inbox")}>Calls & texts</Button></div>
              {!data.recentCalls.length ? <p className="text-sm text-slate-500">No calls yet.</p> : (
                <ul className="space-y-2 text-sm">
                  {data.recentCalls.map((c: any) => <li key={c.id} className="text-slate-300 truncate">{c.callerName || c.phoneNumber} — {c.summary || c.status}</li>)}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
