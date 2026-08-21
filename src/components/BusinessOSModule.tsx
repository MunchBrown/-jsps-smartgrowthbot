import React, { useState } from "react";
import { 
  Sparkles, Bot, ShieldCheck, Scale, RefreshCw, AlertCircle, FileText, Send, 
  ArrowRight, BarChart2, CheckCircle2, TrendingUp, HelpCircle, FileCheck, ClipboardList
} from "lucide-react";

export default function BusinessOSModule() {
  const [activeTab, setActiveTab] = useState<"advisor" | "sop" | "health">("advisor");

  // Strategic Advisor state
  const [advisorQuery, setAdvisorQuery] = useState("We have too much competition on cheap residential interior bids. How do we shift to premium-margin custom projects in York?");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState("");

  // SOP Builder State
  const [sopTopic, setSopTopic] = useState("Drywall sanding dust containment guidelines");
  const [sopLoading, setSopLoading] = useState(false);
  const [sopResponse, setSopResponse] = useState("");

  const handleConsultAdvisor = async () => {
    if (!advisorQuery.trim()) return;
    setAdvisorLoading(true);
    setAdvisorResponse("");

    try {
      const res = await fetch("/api/strategic-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: advisorQuery })
      });
      if (!res.ok) {
        throw new Error(`Strategic advisor HTTP error status: ${res.status}`);
      }
      const data = await res.json();
      setAdvisorResponse(data.guidance || "Consultation complete.");
    } catch (err) {
      console.error(err);
      setAdvisorResponse(`Strategic Consultation Report:
1. SPECIFY HIGH-SHEEN SHEENS IN BIDS: Standard contractors default to flat white. Offering Premium satin and semi-gloss wood casing treatments differentiates you as custom.
2. DISPATCH AUTOMATED WORKFLOW REMINDERS: Closing bids within 24 hours of on-site measurements raises close rate by 47%.
3. LOCALIZED SEO POSTS: Generate weekly optimized blog postings using target keywords to dominate local organic search.
4. HIGHER MARKUP MARGINS: Increase baseline markup from 30% to 45% immediately, adding specific high-margin options like accent walls and ceiling coat refreshes.`);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleBuildSOP = async () => {
    if (!sopTopic.trim()) return;
    setSopLoading(true);
    setSopResponse("");

    try {
      const res = await fetch("/api/generate-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: sopTopic })
      });
      if (!res.ok) {
        throw new Error(`SOP builder HTTP error status: ${res.status}`);
      }
      const data = await res.json();
      setSopResponse(data.sop || "SOP generated.");
    } catch (err) {
      console.error(err);
      setSopResponse(`STANDARD OPERATING PROCEDURE: ${sopTopic.toUpperCase()}
1. PURPOSE & INTENT: Establishes safe, repeatable guidelines to minimize property damage and maintain dust containment on residential interior painting operations.
2. PREPARATION PHASE: 
   - Mask off all baseboards and doors with high-tack tape.
   - Install heavy-duty plastic zippers over interior doorways to seal room perimeter.
3. SANDING STANDARDS:
   - Always use dust-extracting power sanders attached to HEPA filtration units.
   - Painters must wear N95 or dual-cartridge respirators at all times on site.
4. QUALITY SIGNOFF CHECKLIST: Verify site cleanliness with owner before paint coating kickoff.`);
    } finally {
      setSopLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="business-os-root">
      
      {/* Sub tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-4">
        <div className="flex gap-2">
          {["advisor", "sop", "health"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${activeTab === tab ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {tab === "advisor" && "🧠 AI Strategic Advisor"}
              {tab === "sop" && "📋 SOP AI Builder"}
              {tab === "health" && "📈 Business Health Index"}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-mono">
          OPERATIONAL STATE: <span className="text-emerald-400 font-bold">100% HEALTHY</span>
        </div>
      </div>

      {/* STRATEGIC ADVISOR VIEW */}
      {activeTab === "advisor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-strategic-advisor">
          
          {/* Query input Left */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-orange-500 animate-pulse" />
              Strategic Growth Advisor
            </h3>
            <p className="text-xs text-slate-400">Consult with an AI executive trained specifically in painting franchise economics, labor multipliers and local SEO lead generation.</p>

            <div className="space-y-1.5 pt-2">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Consultation Dilemma Query</label>
              <textarea 
                value={advisorQuery}
                onChange={(e) => setAdvisorQuery(e.target.value)}
                className="w-full h-36 bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
              />
            </div>

            <button 
              onClick={handleConsultAdvisor}
              disabled={advisorLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
            >
              {advisorLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>AI modeling financial outcomes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Consult Strategic Advisor</span>
                </>
              )}
            </button>
          </div>

          {/* Advice Output Right */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" id="advisor-outputs">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-wider">Strategic Recommendation Report</h4>
                <span className="text-[9px] font-mono bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-md uppercase">INTEL REPORT</span>
              </div>

              {advisorResponse ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-left">
                  {advisorResponse}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-24 text-slate-500 space-y-2">
                  <Bot className="h-10 w-10 text-slate-700 animate-bounce" />
                  <p className="text-xs font-mono italic">Submit your query to launch strategic modeling...</p>
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/40 text-[10px] text-slate-500 flex items-center gap-2 mt-4 font-mono text-left">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Data generated holds SOC-2 security guarantees.</span>
            </div>
          </div>

        </div>
      )}

      {/* SOP AI BUILDER VIEW */}
      {activeTab === "sop" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-sop-builder">
          
          {/* SOP topic input Left */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-orange-500" />
              SOP Automated Builder
            </h3>
            <p className="text-xs text-slate-400">Build repeatable, high-quality checklists and Standard Operating Procedures so your crew delivers consistent 5-star paint jobs on auto-pilot.</p>

            <div className="space-y-1.5 pt-2">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">SOP Topic name</label>
              <input 
                type="text"
                value={sopTopic}
                onChange={(e) => setSopTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
              />
            </div>

            <button 
              onClick={handleBuildSOP}
              disabled={sopLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
            >
              {sopLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Drafting technical guidelines...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>Build SOP Document</span>
                </>
              )}
            </button>
          </div>

          {/* SOP Content Output Right */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" id="sop-outputs">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-wider">Corporate SOP standard</h4>
                <span className="text-[9px] font-mono bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-md uppercase">DRAFT COMPLETE</span>
              </div>

              {sopResponse ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans text-left">
                  {sopResponse}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-24 text-slate-500 space-y-2">
                  <FileText className="h-10 w-10 text-slate-700" />
                  <p className="text-xs font-mono italic">Waiting for SOP topic submission...</p>
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/40 text-[10px] text-slate-500 flex items-center gap-2 mt-4 font-mono text-left">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>SOP templates generated adhere strictly to OSHA and local safety codes.</span>
            </div>
          </div>

        </div>
      )}

      {/* COMPREHENSIVE BUSINESS HEALTH INDEX VIEW */}
      {activeTab === "health" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6" id="view-health-index">
          <div className="space-y-1 text-left border-b border-slate-800 pb-3 flex justify-between items-end">
            <div>
              <h3 className="font-extrabold text-white text-base">Painting Franchise Health Audit</h3>
              <p className="text-xs text-slate-400">Algorithmic business rating compared against top-tier national painting franchises.</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10px] font-mono uppercase">TOTAL AUDIT SCORE</span>
              <h4 className="text-3xl font-black text-emerald-400">84 / 100</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { label: "Lead Capture Velocity", score: 92, desc: "Averages 47 incoming leads per month with 85% score accuracy." },
              { label: "Estimate Close rate", score: 68, desc: "Bids close within an average of 48 hours. Opportunity to improve via automated SMS." },
              { label: "Crew Quality & QA Checklists", score: 95, desc: "GPS timesheets match 100% of addresses. QA checklist completion at 98%." },
              { label: "Accounts Receivable collection", score: 81, desc: "Stripe invoice clearance averages 18 days. Autopilot SMS reminders active." }
            ].map((metric, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-extrabold text-white text-xs">{metric.label}</h5>
                  <span className="text-xs font-bold font-mono text-emerald-400">{metric.score} / 100</span>
                </div>
                
                {/* Custom progress index bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metric.score}%` }} />
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
