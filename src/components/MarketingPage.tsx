import React, { useState } from "react";
import { 
  Sparkles, CheckCircle2, Star, Play, ChevronRight, X, ArrowRight, Paintbrush, 
  TrendingUp, Clock, FileText, Check, ShieldAlert
} from "lucide-react";

interface MarketingPageProps {
  onStartTrial: () => void;
  onLogin: () => void;
}

export default function MarketingPage({ onStartTrial, onLogin }: MarketingPageProps) {
  const [demoOpen, setDemoOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const paintBrandLogos = [
    { name: "Sherwin-Williams", icon: "🎨" },
    { name: "Benjamin Moore", icon: "🖌️" },
    { name: "Behr Paints", icon: "✨" },
    { name: "PPG Paints", icon: "🏠" },
    { name: "Farrow & Ball", icon: "🏺" }
  ];

  const painPoints = [
    { id: 1, title: "Feast or famine lead flow every month", desc: "No predictability. Some weeks you have 5 projects, some weeks zero leads come in." },
    { id: 2, title: "Spending 3+ hours on every estimate", desc: "Scribbling on paper and manually typing quotes late at night when you're exhausted." },
    { id: 3, title: "Chasing payments for 60+ days", desc: "Texting and calling clients repeatedly just to get paid for a job completed weeks ago." },
    { id: 4, title: "Losing jobs to faster competitors", desc: "In this industry, the first contractor to text back and deliver a polished bid wins 72% of the time." },
    { id: 5, title: "No time for family or weekends", desc: "You started your painting business for freedom, but ended up trapped in a 70-hour office loop." },
    { id: 6, title: "Competing on HomeAdvisor for $89 leads", desc: "Fighting 5 other local painters for shared leads who only care about the absolute lowest bid." }
  ];

  const modulePreviews = [
    {
      title: "LeadFlow AI",
      desc: "Lead Gen & CRM",
      bullets: ["Automated Google Business Profile booster", "Predictive AI Lead Scoring (Hot/Warm/Cold)", "Smart SEO Content & Local Hangers Generator"]
    },
    {
      title: "QuoteGenius AI",
      desc: "Estimating & Proposals",
      bullets: ["AI Room-Photo Estimator & manual calculators", "High-margin automated up-sell builder", "Branded PDF contracts with digital signatures"]
    },
    {
      title: "ClientConnect AI",
      desc: "Unified Inbox & Chatbot",
      bullets: ["Integrated SMS, Email & Web-chat thread", "AI virtual receptionist captures leads 24/7", "Visual Drag-and-Drop Automation workflows"]
    },
    {
      title: "CrewOptimizer AI",
      desc: "Workforce & Quality",
      bullets: ["Interactive calendar with drag-and-drop", "GPS-verified Crew Clock In/Out timesheet", "Interactive before/after QA photo checklists"]
    },
    {
      title: "FinanceCommand AI",
      desc: "Financial Intelligence",
      bullets: ["90-day cash flow scenario forecasting", "One-click invoice payment collection via Stripe", "QuickBooks & Xero two-way sync integrations"]
    },
    {
      title: "BusinessOS AI",
      desc: "Analytics & SOPs",
      bullets: ["Standard Operating Procedure AI builder", "Comprehensive 0-100 business health index", "GPT-4 powered Weekly Growth Strategic Advisor"]
    }
  ];

  const pricingTiers = [
    {
      name: "STARTER",
      price: "$297",
      desc: "Perfect for solo painting contractors looking to automate initial client intake.",
      features: [
        "LeadFlow AI (Basic CRM)",
        "QuoteGenius AI (Basic Estimating)",
        "ClientConnect AI (Basic Inbox)",
        "1 Administrator / User Slot",
        "Up to 100 incoming leads / mo",
        "Standard Email Support"
      ],
      isPopular: false,
      cta: "Start Free 14-Day Trial"
    },
    {
      name: "PROFESSIONAL",
      price: "$697",
      desc: "The standard engine for growing residential and commercial painting companies.",
      features: [
        "Full LeadFlow + CRM + Campaigns",
        "Full QuoteGenius & standalone calculators",
        "Full ClientConnect AI unified platform",
        "FinanceCommand AI full dashboard",
        "5 Team / Crew administrator slots",
        "Up to 250 leads / mo capacity",
        "QuickBooks / Xero accounting sync"
      ],
      isPopular: true,
      cta: "Start Free 14-Day Trial"
    },
    {
      name: "PREMIUM",
      price: "$1,497",
      desc: "Unlocks workforce management and business-wide organizational automation.",
      features: [
        "Everything included in Professional tier",
        "CrewOptimizer AI (Full dispatch & scheduling)",
        "BusinessOS AI (Core advisor + SOP builder)",
        "15 Team / Crew administrator slots",
        "Up to 500 leads / mo capacity",
        "GPS timesheets + quality checklists",
        "Priority 24/7 Phone & Zoom Support"
      ],
      isPopular: false,
      cta: "Start Free 14-Day Trial"
    },
    {
      name: "ENTERPRISE",
      price: "$2,997",
      desc: "For multi-location painting franchises and massive commercial operations.",
      features: [
        "Fully unlocked system capabilities",
        "Unlimited Admin & Crew users",
        "Full customized AI models & system training",
        "White label customization options",
        "Dedicated Enterprise Success Account Manager",
        "API access & custom webhook hooks"
      ],
      isPopular: false,
      cta: "Contact Sales Department"
    }
  ];

  const testimonials = [
    {
      name: "Mike Johnson",
      company: "Smart Growth Painting",
      location: "York, PA",
      revenueBefore: "$380K/year",
      revenueAfter: "$1.2M/year",
      quote: "PaintingPro AI completely transformed my operations. What used to take me 4 hours of late-night bidding now takes me 5 minutes on my phone. The automated follow-up closes jobs while I sleep. My crews know exactly where to go, and I get paid instantly via credit card.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 5
    },
    {
      name: "Sarah Lindqvist",
      company: "Slick Finishes Inc.",
      location: "Seattle, WA",
      revenueBefore: "$240K/year",
      revenueAfter: "$680K/year",
      quote: "The lead scoring is creepily accurate. The AI chatbot qualifies our commercial inquiries, and the neighborhood hangers generator landed us three whole projects on the same block last month. I finally got my weekends back!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      rating: 5
    },
    {
      name: "Darryl Vance",
      company: "Vance Commercial Coatings",
      location: "Orlando, FL",
      revenueBefore: "$950K/year",
      revenueAfter: "$2.4M/year",
      quote: "Managing 15 painters on different job sites was a logistical nightmare. CrewOptimizer and the photo-based quality checklists solved this. The 90-day cash flow forecast alone saved us from a major inventory crunch last winter. Outstanding software.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      rating: 5
    }
  ];

  return (
    <div className="bg-[#0F172A] text-white min-h-screen font-sans" id="marketing-root">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto" id="marketing-header">
        <div className="flex items-center gap-3">
          <div className="bg-[#F97316] p-2.5 rounded-xl text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Paintbrush className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-1.5">
              PaintingPro <span className="text-orange-500 text-sm font-semibold bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">AI</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 block font-mono">FRANCHISE OS</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-semibold text-slate-300 hover:text-white transition px-4 py-2"
            id="btn-nav-login"
          >
            Sign In
          </button>
          <button 
            onClick={onStartTrial}
            className="text-sm font-bold bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 cursor-pointer"
            id="btn-nav-signup"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 overflow-hidden max-w-7xl mx-auto text-center" id="marketing-hero">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/3 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-4 py-1.5 rounded-full text-xs font-semibold text-orange-400 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The GoHighLevel Built Specifically for Painting Contractors</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight md:leading-none text-white max-w-3xl mx-auto">
            The AI-Powered Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Painting Companies</span>
          </h1>

          <p className="text-slate-400 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
            Stop losing jobs to competitors, stop chasing payments, and stop working 70-hour weeks. 
            PaintingPro AI automates your entire business so you can focus on what you love - painting and getting paid.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button 
              onClick={onStartTrial}
              className="w-full sm:w-auto bg-[#F97316] hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-base cursor-pointer"
              id="hero-cta-trial"
            >
              Start Free 14-Day Trial
              <ChevronRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-2xl transition border border-slate-700/80 flex items-center justify-center gap-2 text-base cursor-pointer"
              id="hero-cta-demo"
            >
              <Play className="h-5 w-5 text-orange-500 fill-orange-500" />
              Watch Demo
            </button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-orange-500" /> 178,000 Painting Contractors
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-orange-500" /> 4.9 Star Industry Rating
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-orange-500" /> SOC 2 Data Certified
            </span>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-700 bg-slate-900/80 p-3 shadow-2xl relative" id="marketing-mockup">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-90 z-10 rounded-3xl pointer-events-none" />
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 h-[380px] md:h-[500px] flex flex-col relative">
            {/* Fake OS top bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 font-mono">dashboard.paintingpro.ai</span>
              </div>
              <div className="text-orange-400 font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> LIVE DEMO VIEW
              </div>
            </div>
            {/* Fake layout */}
            <div className="flex-1 bg-slate-950 flex">
              {/* Sidebar */}
              <div className="w-48 bg-slate-900 border-r border-slate-800 p-4 space-y-3 hidden md:block text-left">
                <div className="h-6 w-32 bg-slate-800 rounded-lg animate-pulse" />
                <div className="space-y-2 pt-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-800 rounded-md" />
                      <div className="h-4 w-24 bg-slate-800 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-6 space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-6 w-48 bg-slate-800 rounded-lg" />
                    <div className="h-3 w-64 bg-slate-800 rounded-lg" />
                  </div>
                  <div className="h-9 w-24 bg-orange-500 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="h-3 w-20 bg-slate-800 rounded-md" />
                    <div className="h-7 w-28 bg-orange-500/20 text-orange-400 font-bold rounded-md flex items-center px-2 text-lg">$84,250</div>
                    <div className="h-3 w-32 bg-slate-800 rounded-md" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="h-3 w-20 bg-slate-800 rounded-md" />
                    <div className="h-7 w-28 bg-blue-500/20 text-blue-400 font-bold rounded-md flex items-center px-2 text-lg">47 Leads</div>
                    <div className="h-3 w-32 bg-slate-800 rounded-md" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="h-3 w-20 bg-slate-800 rounded-md" />
                    <div className="h-7 w-28 bg-emerald-500/20 text-emerald-400 font-bold rounded-md flex items-center px-2 text-lg">43% Wins</div>
                    <div className="h-3 w-32 bg-slate-800 rounded-md" />
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl h-48 space-y-3">
                  <div className="h-4 w-40 bg-slate-800 rounded-lg" />
                  <div className="h-3 w-full bg-slate-800 rounded-lg" />
                  <div className="h-3 w-full bg-slate-800 rounded-lg" />
                  <div className="h-3 w-2/3 bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          {/* Overlay Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button 
              onClick={onStartTrial}
              className="bg-[#F97316] hover:bg-orange-600 text-white font-bold p-5 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-7 w-7 text-white" />
              <span className="pr-2 font-bold">Launch Sandbox Operating System</span>
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-slate-950 border-y border-slate-800/80 py-10" id="social-proof-bar">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 text-center lg:text-left space-y-1">
            <p className="text-orange-500 font-mono text-xs font-black tracking-widest uppercase">TRUSTED PARTNER IN INDUSTRY</p>
            <h4 className="text-xl font-extrabold text-white">Works With Major Paint Brands</h4>
          </div>
          <div className="lg:col-span-8 flex flex-wrap justify-center lg:justify-between items-center gap-8">
            {paintBrandLogos.map((brand, i) => (
              <div key={i} className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition">
                <span className="text-2xl">{brand.icon}</span>
                <span className="text-sm font-black font-mono tracking-wider text-slate-300">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-center border-t border-slate-900 mt-10">
          <div className="p-4 space-y-1">
            <h5 className="text-3xl font-black text-orange-500">30-50 Leads</h5>
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">QUALIFIED LEADS GENERATED MONTHLY</p>
          </div>
          <div className="p-4 space-y-1">
            <h5 className="text-3xl font-black text-emerald-400">+$150,000</h5>
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">AVERAGE ANNUAL REVENUE INCREASE</p>
          </div>
          <div className="p-4 space-y-1">
            <h5 className="text-3xl font-black text-blue-400">4 Hours Saved</h5>
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">SAVED ON ESTIMATES & LOGISTICS DAILY</p>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12" id="marketing-painpoints">
        <div className="text-center space-y-2">
          <p className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">THE PAIN OF RUNNING A PAINTING FIRM</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">Does This Sound Familiar?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Residential and commercial painting is highly lucrative, but most contractors are trapped in outdated manual workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative group hover:border-red-500/30 transition">
              <div className="bg-red-500/10 text-red-400 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border border-red-500/20">
                <X className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-white text-base">{p.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Modules Preview Grid */}
      <section className="py-24 px-6 bg-slate-950 border-t border-slate-900" id="marketing-features">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <p className="text-orange-500 font-mono text-xs font-black tracking-widest uppercase">6 ENTERPRISE SUITES IN ONE BOX</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Everything You Need. One Platform.</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">Why pay $1,200/month for six different software licenses? PaintingPro AI unifies your entire business into one single dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modulePreviews.map((m, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl hover:border-orange-500/30 transition duration-300 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg text-orange-400 font-bold text-xs">
                    MOD 0{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">{m.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{m.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2 pt-2 border-t border-slate-800/60">
                  {m.bullets.map((bullet, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-orange-500 font-bold pt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16" id="marketing-pricing">
        <div className="text-center space-y-2">
          <p className="text-orange-500 font-mono text-xs font-black tracking-widest uppercase">TRANSPARENT ROBUST ROI PRICING</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">Simple Plans For Every Stage</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Select the operational package that fits your current team size and lead volume requirements. All plans include 14-day trial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-900 border p-6 rounded-3xl flex flex-col justify-between space-y-6 relative ${tier.isPopular ? "border-orange-500 shadow-xl shadow-orange-500/5 ring-1 ring-orange-500" : "border-slate-800"}`}
            >
              {tier.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                  ★ MOST POPULAR ★
                </span>
              )}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-black tracking-widest font-mono text-slate-400 uppercase">{tier.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-slate-400 font-mono">/mo</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed h-12">{tier.desc}</p>
                <div className="h-px bg-slate-800" />
                <ul className="space-y-2.5">
                  {tier.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={onStartTrial}
                className={`w-full font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer ${tier.isPopular ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-slate-950 border-t border-slate-900" id="marketing-testimonials">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <p className="text-orange-500 font-mono text-xs font-black tracking-widest uppercase">PROVEN REAL CONTRACTOR SUCCESS</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Before/After Revenue Results</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">Hear directly from painting company owners who escaped the manual loop and scaled their franchise operations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative">
                <div className="space-y-4">
                  <div className="flex gap-1 text-orange-500">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-orange-500" />)}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">"{t.quote}"</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-orange-500/30 object-cover" referrerPolicy="no-referrer" />
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-white text-xs">{t.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">{t.company} • {t.location}</p>
                    <div className="flex gap-2 text-[10px] font-mono pt-1">
                      <span className="text-red-400 line-through">{t.revenueBefore}</span>
                      <span className="text-emerald-400 font-bold">➜ {t.revenueAfter}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto" id="marketing-guarantee">
        <div className="bg-gradient-to-r from-orange-600/10 to-blue-600/10 border border-slate-800 p-8 rounded-3xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-mono font-black tracking-widest inline-block uppercase">
            100% NO-RISK CONTRACTOR INDEMNITY
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white">30-50 Qualified Leads Per Month - Guaranteed</h3>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            If you implement our automatic LeadFlow marketing suite and don't receive at least 30 verified booking requests 
            in your service area within your first 30 days, we will refund your subscription fully and pay your direct mail expenses. No questions asked.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-slate-950 border-t border-slate-900 text-center relative overflow-hidden" id="marketing-final-cta">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">Ready To Scale Your Painting Operations?</h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Join over 2,500+ successful painting business owners who expanded their cash flow, optimized their dispatch schedules, and claimed their personal freedom.
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput.trim()) {
                setSubscribed(true);
                setTimeout(() => {
                  onStartTrial();
                }, 1000);
              }
            }}
            className="flex flex-col sm:flex-row gap-3 pt-4 max-w-md mx-auto"
          >
            <input 
              type="email" 
              placeholder="Enter your contractor email..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 flex-1 focus:outline-none focus:border-orange-500 text-sm placeholder-slate-500"
            />
            <button 
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              {subscribed ? "Creating Trial account..." : "Get Started Free"}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 font-mono">14-Day Free Access • No Credit Card Required upfront • Instant Dashboard Sandbox Access</p>
        </div>
      </section>

      {/* Demo Video Modal */}
      {demoOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-3xl relative shadow-2xl">
            <button 
              onClick={() => setDemoOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full border border-slate-700 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-6 space-y-4">
              <h3 className="font-extrabold text-lg text-white">PaintingPro AI Overview Video</h3>
              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
                <Play className="h-16 w-16 text-orange-500" />
                <span className="absolute bottom-4 left-4 text-xs font-mono text-slate-500">[Demo Simulation Video Placeholder - 4 min 12 sec]</span>
              </div>
              <p className="text-xs text-slate-400">See how Carlos, Mike and other local contractors configure automated SMS, build Estimates using AI, and receive credit card client deposits instantly.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
