import React from "react";
import { signOut } from "firebase/auth";
import { Check } from "lucide-react";
import { auth } from "../../lib/firebase";
import { api, money } from "../../lib/api";
import { useSession, isAdmin } from "../../lib/session";
import { AuthShell } from "./AuthScreens";
import { BrandMark } from "./Brand";
import { Button, Field, Input, ErrorText, Notice } from "./ui";

export function OnboardingScreen() {
  const { refresh, user } = useSession();
  const [form, setForm] = React.useState({
    companyName: "",
    ownerName: user?.displayName || "",
    phone: "",
    serviceArea: "",
    address: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/onboarding", {
        body: { ...form, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York", services: ["Interior painting", "Exterior painting", "Commercial painting", "Cabinets", "Drywall repair"] },
      });
      await refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-xl font-bold">Set up your painting company</h1>
      <p className="text-sm text-slate-400 mt-1">This is what your customers will see on estimates and invoices.</p>
      <form onSubmit={submit} className="space-y-4 mt-6">
        <Field label="Company name"><Input value={form.companyName} onChange={set("companyName")} required maxLength={120} /></Field>
        <Field label="Your name"><Input value={form.ownerName} onChange={set("ownerName")} maxLength={120} /></Field>
        <Field label="Business phone"><Input value={form.phone} onChange={set("phone")} inputMode="tel" maxLength={40} /></Field>
        <Field label="Business address"><Input value={form.address} onChange={set("address")} maxLength={200} /></Field>
        <Field label="Service area" hint="For example: York, Lancaster and Harrisburg, PA"><Input value={form.serviceArea} onChange={set("serviceArea")} maxLength={200} /></Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" busy={busy} className="w-full py-2.5">Continue</Button>
      </form>
      <Button variant="ghost" className="w-full mt-3" onClick={() => signOut(auth)}>Sign out</Button>
    </AuthShell>
  );
}

export function InviteScreen() {
  const { me, refresh } = useSession();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [declined, setDeclined] = React.useState(false);
  if (declined) return <OnboardingScreen />;
  const accept = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/invites/accept", { body: {} });
      await refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell>
      <h1 className="text-xl font-bold">Join {me?.pendingInvite?.orgName}</h1>
      <p className="text-sm text-slate-400 mt-2">You've been invited to join this company's workspace as {me?.pendingInvite?.role === "admin" ? "an admin" : "a team member"}.</p>
      <div className="space-y-3 mt-6">
        <ErrorText>{error}</ErrorText>
        <Button className="w-full" busy={busy} onClick={accept}>Join the team</Button>
        <Button className="w-full" variant="secondary" onClick={() => setDeclined(true)}>Set up my own company instead</Button>
      </div>
    </AuthShell>
  );
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["1 user", "100 new leads a month", "Leads, estimates, scheduling and invoices", "AI calls & texts with your Vapi / Twilio", "Online invoice payments"],
  professional: ["Up to 5 users", "250 new leads a month", "Everything in Starter", "More daily AI requests", "Owner, admin and member roles"],
  premium: ["Up to 15 users", "500 new leads a month", "Everything in Professional", "Highest daily AI allowance", "Priority email support"],
};

export function ChoosePlanScreen({ notice }: { notice?: string }) {
  const { me } = useSession();
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const admin = isAdmin(me);
  const status = me?.org?.subscription.status;
  const lapsed = status && status !== "none";

  const choose = async (plan: string) => {
    setBusy(plan);
    setError("");
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { body: { plan } });
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setBusy("");
    }
  };
  const portal = async () => {
    setBusy("portal");
    try {
      const { url } = await api<{ url: string }>("/api/billing/portal", { body: {} });
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setBusy("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <BrandMark />
          <Button variant="ghost" onClick={() => signOut(auth)}>Sign out</Button>
        </div>
        <h1 className="text-3xl font-bold font-serif mt-10 text-balance">
          {lapsed ? "Your subscription needs attention" : `Choose a plan for ${me?.org?.name}`}
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          {lapsed
            ? `Your subscription is ${status?.replace("_", " ")}. Update billing to get back into your workspace — your data is safe.`
            : "Every plan starts with a 14-day free trial. Cancel anytime before it ends and you won't be charged."}
        </p>
        <div className="mt-4 space-y-3 max-w-2xl">
          {notice && <Notice tone="warn">{notice}</Notice>}
          {!admin && <Notice>Only the account owner or an admin can manage billing. Ask them to start the plan.</Notice>}
          <ErrorText>{error}</ErrorText>
        </div>
        {lapsed && admin && me?.org?.subscription.status !== "canceled" ? (
          <Button className="mt-6" busy={busy === "portal"} onClick={portal}>Update billing</Button>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {me?.plans.map((p) => (
              <div key={p.id} className={`bg-slate-900 border rounded-2xl p-6 flex flex-col ${p.id === "professional" ? "border-orange-500" : "border-slate-800"}`}>
                {p.id === "professional" && <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">Most popular</span>}
                <h2 className="text-lg font-bold">{p.name}</h2>
                <p className="mt-2"><span className="text-3xl font-bold tabular-nums">{money(p.priceMonthly).replace(".00", "")}</span><span className="text-slate-400">/month</span></p>
                <ul className="mt-5 space-y-2 text-sm text-slate-300 flex-1">
                  {PLAN_FEATURES[p.id].map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" disabled={!admin} busy={busy === p.id} onClick={() => choose(p.id)}>
                  {lapsed ? "Restart subscription" : "Start 14-day free trial"}
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-6">Prices in USD. Card required to start the trial; billed monthly after the trial. Promo codes can be entered at checkout.</p>
      </div>
    </div>
  );
}
