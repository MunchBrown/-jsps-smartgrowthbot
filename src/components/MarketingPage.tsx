import React from "react";
import { Check, PhoneCall, MessageSquare, CalendarCheck, FileSignature, CreditCard, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { BrandMark, APP_NAME } from "./live/Brand";

interface MarketingPageProps {
  onStartTrial: () => void;
  onLogin: () => void;
  onLegal?: (path: string) => void;
}

const steps = [
  { icon: Sparkles, title: "Lead comes in", desc: "From your website form, a phone call to your AI line, a text, or you add it. AI scores it Hot, Warm or Cold." },
  { icon: PhoneCall, title: "AI follows up fast", desc: "One click and your Vapi assistant calls the lead, or send a text from your Twilio number. Summaries and transcripts land on the lead." },
  { icon: CalendarCheck, title: "Visit gets booked", desc: "Book the estimate visit and it drops straight onto your Google Calendar." },
  { icon: FileSignature, title: "Estimate accepted online", desc: "Send a clean estimate by email or text. The customer accepts with their name on their phone." },
  { icon: CreditCard, title: "You get paid", desc: "Turn it into a deposit or final invoice. Customers pay by card and the money goes to your Stripe account." },
];

const live = [
  "Lead list with AI lead scoring and full call/text history",
  "One-click AI calls through your own Vapi assistant",
  "Two-way texting through your Twilio number, with STOP opt-outs handled",
  "Hosted 'request an estimate' form with a consent checkbox",
  "Estimates with line items, AI-written scope of work and online acceptance",
  "Invoices with card payments via Stripe, deposits and mark-as-paid",
  "Google Calendar booking and sending from your Gmail",
  "AI room-photo measurements, SOP builder and business advisor",
  "Team accounts with owner, admin and member roles",
];

const plans = [
  { name: "Starter", price: 297, blurb: "For an owner-operator running the office alone.", features: ["1 user", "100 new leads a month", "Everything in the core workflow", "AI calls & texts (your Vapi/Twilio)", "Online invoice payments"] },
  { name: "Professional", price: 697, blurb: "For growing crews with an office manager or estimator.", features: ["Up to 5 users", "250 new leads a month", "Everything in Starter", "More daily AI requests", "Owner, admin and member roles"], popular: true },
  { name: "Premium", price: 1497, blurb: "For multi-crew companies with a full office.", features: ["Up to 15 users", "500 new leads a month", "Everything in Professional", "Highest daily AI allowance", "Priority email support"] },
];

const faqs = [
  { q: "What do I need besides this app?", a: "For AI calls you need a Vapi account with an assistant and a phone number. For texting, a Twilio account and number registered for business texting (A2P 10DLC). For card payments, a Stripe account, which you can create during setup. Google Calendar and Gmail are optional. You pay those providers directly at their own rates." },
  { q: "Is AI calling legal?", a: "Yes, with the right consent. Calls that use an AI voice and marketing texts need the customer's prior written consent under the TCPA. The app records consent on every lead, collects it on your web form, and blocks AI calls and texts to leads without it. Read our Messaging & AI Calling Policy for the details." },
  { q: "How does the free trial work?", a: "Every plan starts with a 14-day free trial. A card is required. Cancel before the trial ends in Settings → Billing and you won't be charged; otherwise the monthly plan starts automatically." },
  { q: "Who owns my data?", a: "You do. Each company's data is kept separate, connection keys are encrypted, and you can ask for an export or deletion anytime." },
  { q: "What are the 'Preview' screens?", a: "A few modules — reviews, funnel builder, crew optimizer, government contracting and others — still run on sample data. They're clearly labeled, can't change your real records, and are coming soon." },
];

export default function MarketingPage({ onStartTrial, onLogin, onLegal }: MarketingPageProps) {
  const legal = (p: string) => (e: React.MouseEvent) => {
    if (onLegal) {
      e.preventDefault();
      onLegal(p);
    }
  };
  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen font-sans">
      <header className="border-b border-slate-900 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0"><BrandMark /></div>
          <div className="flex items-center gap-2">
            <button onClick={onLogin} className="text-sm text-slate-300 hover:text-white px-2 sm:px-3 py-2 whitespace-nowrap cursor-pointer">Sign in</button>
            <button onClick={onStartTrial} className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer"><span className="hidden sm:inline">Start free trial</span><span className="sm:hidden">Free trial</span></button>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-8 pt-16 pb-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-orange-400 text-xs font-bold tracking-widest uppercase">Built by a working painting contractor in York, PA</p>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mt-4 leading-tight text-balance">The AI front office for painting companies</h1>
          <p className="text-lg text-slate-400 mt-5 max-w-2xl mx-auto text-pretty">
            Answer every lead fast, book estimate visits, send estimates customers accept on their phone, and get paid by card — without living in the office.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onStartTrial} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer">Start your 14-day free trial <ArrowRight className="h-4 w-4" /></button>
            <a href="#pricing" className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-6 py-3 rounded-xl">See pricing</a>
          </div>
          <p className="text-xs text-slate-500 mt-3">Card required · cancel anytime before the trial ends</p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-14 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white text-center">From first call to paid invoice</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-10">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <s.icon className="h-6 w-6 text-orange-400" />
                <p className="text-[11px] text-slate-500 mt-3">Step {i + 1}</p>
                <h3 className="text-white font-semibold">{s.title}</h3>
                <p className="text-sm text-slate-400 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-14 border-t border-slate-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">What's in it today</h2>
            <p className="text-slate-400 mt-3">Everything on this list works now. Features still in development are labeled "Preview" inside the app.</p>
            <div className="mt-6 flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              <p className="text-sm text-slate-300">Consent tracking is built in: AI calls and texts are blocked until a lead's written consent is recorded, and STOP replies are honored automatically.</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {live.map((f) => (
              <li key={f} className="flex gap-2.5 text-slate-200"><Check className="h-5 w-5 text-orange-400 shrink-0" />{f}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="px-4 md:px-8 py-14 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white text-center">Simple monthly pricing</h2>
          <p className="text-slate-400 text-center mt-2">Every plan includes a 14-day free trial. Vapi, Twilio and Stripe fees are billed by those providers.</p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {plans.map((p) => (
              <div key={p.name} className={`bg-slate-900 border rounded-2xl p-6 flex flex-col ${p.popular ? "border-orange-500" : "border-slate-800"}`}>
                {p.popular && <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">Most popular</span>}
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{p.blurb}</p>
                <p className="mt-4"><span className="text-4xl font-bold text-white tabular-nums">${p.price.toLocaleString()}</span><span className="text-slate-400">/month</span></p>
                <ul className="mt-5 space-y-2 text-sm flex-1">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />{f}</li>)}
                </ul>
                <button onClick={onStartTrial} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl cursor-pointer">Start free trial</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-14 border-t border-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white text-center">Questions</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 group">
                <summary className="text-white font-semibold cursor-pointer list-none flex justify-between gap-3">{f.q}<span className="text-orange-400 group-open:rotate-45 transition">+</span></summary>
                <p className="text-slate-400 mt-3 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 border-t border-slate-900 text-center">
        <h2 className="text-2xl md:text-4xl font-bold font-serif text-white text-balance">Stop losing jobs to whoever calls back first</h2>
        <button onClick={onStartTrial} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer">Start your free trial</button>
      </section>

      <footer className="border-t border-slate-900 px-4 py-6 text-center text-xs text-slate-500 flex flex-wrap gap-x-5 gap-y-2 justify-center">
        <span>© {new Date().getFullYear()} {APP_NAME}</span>
        <a href="/terms" onClick={legal("/terms")} className="hover:text-slate-300">Terms of Service</a>
        <a href="/privacy" onClick={legal("/privacy")} className="hover:text-slate-300">Privacy Policy</a>
        <a href="/messaging-policy" onClick={legal("/messaging-policy")} className="hover:text-slate-300">Messaging &amp; AI Calling Policy</a>
      </footer>
    </div>
  );
}
