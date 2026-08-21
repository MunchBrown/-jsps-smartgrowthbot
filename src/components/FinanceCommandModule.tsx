import React, { useState } from "react";
import { 
  Sparkles, DollarSign, TrendingUp, Calendar, ArrowUpRight, Check, X, FileText, 
  Send, ShieldCheck, RefreshCw, AlertCircle, TrendingDown, Eye, Plus, Scale
} from "lucide-react";
import { Invoice } from "../types";
import { initialInvoices } from "../sampleData";

export default function FinanceCommandModule() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  // Cash flow projection interactive states
  const [collectionDays, setCollectionDays] = useState(30); // 30 days average terms
  const [aiAutopilotActive, setAiAutopilotActive] = useState(true); // Speeds up cash flows by 12 days
  const [expandedCrewCount, setExpandedCrewCount] = useState(0); // Add crews (increases material costs & labor but raises revenue)

  // Subtotal calculations
  const totalReceivables = invoices.filter(i => i.status !== "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidMTD = invoices.filter(i => i.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);

  // Scenario impact calculations
  const speedImpact = aiAutopilotActive ? 12 : 0;
  const daysSaved = (30 - collectionDays) + speedImpact;
  
  // Custom interactive projections:
  // Day 0: $45,000 (starting balance)
  // Day 30: $62,000 + (daysSaved * 500) + (expandedCrewCount * 12000)
  // Day 60: $84,000 + (daysSaved * 900) + (expandedCrewCount * 25000)
  // Day 90: $115,000 + (daysSaved * 1500) + (expandedCrewCount * 42000)
  const balanceD0 = 45000;
  const balanceD30 = Math.round(52000 + (daysSaved * 400) + (expandedCrewCount * 8000));
  const balanceD60 = Math.round(74000 + (daysSaved * 800) + (expandedCrewCount * 18000));
  const balanceD90 = Math.round(105000 + (daysSaved * 1200) + (expandedCrewCount * 32000));

  // Invoice creation form states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invClientName, setInvClientName] = useState("");
  const [invAmount, setInvAmount] = useState("3500");
  const [invDueDate, setInvDueDate] = useState("2026-07-15");

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName) return;

    const created: Invoice = {
      id: "INV-2026-" + (invoices.length + 101),
      clientName: invClientName,
      amount: Number(invAmount),
      dueDate: invDueDate,
      status: "Sent"
    };

    setInvoices([created, ...invoices]);
    setInvoiceModalOpen(false);
    setInvClientName("");
    setInvAmount("3500");
  };

  const handleMarkAsPaid = (id: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: "Paid" } : inv));
  };

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="finance-command-root">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="finance-kpis">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left space-y-2 relative overflow-hidden group hover:border-orange-500/20 transition">
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Gross MTD Paid</span>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-2xl font-black text-white">${totalPaidMTD.toLocaleString()}</h4>
            <span className="text-emerald-400 text-xs font-bold font-mono">+18%</span>
          </div>
          <p className="text-[10px] text-slate-500">Locked Stripe deposits processed.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left space-y-2 relative overflow-hidden group hover:border-orange-500/20 transition">
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Accounts Receivable</span>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-2xl font-black text-orange-400">${totalReceivables.toLocaleString()}</h4>
            <span className="text-slate-500 text-xs font-mono font-bold">Uncollected</span>
          </div>
          <p className="text-[10px] text-slate-500">Outstanding client invoices sent.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left space-y-2 relative overflow-hidden group hover:border-orange-500/20 transition">
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Average Painting Job Ticket</span>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-2xl font-black text-white">$6,450</h4>
            <span className="text-emerald-400 text-xs font-bold font-mono">+12%</span>
          </div>
          <p className="text-[10px] text-slate-500">Up-sell optimizations increased average ticket size.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left space-y-2 relative overflow-hidden group hover:border-orange-500/20 transition">
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Estimated 90-Day Liquidity</span>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-2xl font-black text-emerald-400">${balanceD90.toLocaleString()}</h4>
            <span className="text-emerald-400 text-xs font-bold font-mono">Projected</span>
          </div>
          <p className="text-[10px] text-slate-500">Calculated scenario reserves.</p>
        </div>
      </div>

      {/* ROW 2: 90-DAY CASH FLOW FORECAST SCENARIO SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cashflow-forecasting">
        
        {/* Scenario Controls Left */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Scale className="h-5 w-5 text-orange-500" />
                Operational Scenario Simulator
              </h3>
              <p className="text-xs text-slate-400">Toggle business adjustments to see their direct mathematical impact on your 90-day cash flow curve.</p>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-4">
              
              {/* Collection Terms Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-mono">Invoice terms duration:</span>
                  <strong className="text-orange-400 font-mono">{collectionDays} Days Avg</strong>
                </div>
                <input 
                  type="range"
                  min="7"
                  max="45"
                  value={collectionDays}
                  onChange={(e) => setCollectionDays(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* AI Autopilot text reminders Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">AI SMS Invoice Autopilot</span>
                  <p className="text-[9px] text-slate-500 leading-normal">Auto-remind outstanding balances. Speeds up cash intake by 12 days.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiAutopilotActive}
                  onChange={() => setAiAutopilotActive(!aiAutopilotActive)}
                  className="accent-orange-500 w-4 h-4 rounded shrink-0"
                />
              </label>

              {/* Hire new crew members */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Hire/Expand Active Crews</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((crew) => (
                    <button 
                      key={crew}
                      onClick={() => setExpandedCrewCount(crew)}
                      className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition ${
                        expandedCrewCount === crew ? "bg-orange-500/15 border-orange-500 text-orange-400" : "bg-slate-950 border-slate-850 text-slate-500 hover:text-white"
                      }`}
                    >
                      {crew === 0 ? "Baseline" : `+${crew} Crew`}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 text-[10px] font-mono text-slate-500 leading-normal space-y-1">
            <span className="text-emerald-400 font-bold block">✓ OPTIMIZATION SCORE: {daysSaved + (expandedCrewCount * 15)}/100</span>
            <span>Scenario speeds collection cycle to only {30 - daysSaved} days. Outstanding accounts receivable decreases by 32%.</span>
          </div>
        </div>

        {/* Projections line Chart Right */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <div className="text-left">
              <h3 className="font-extrabold text-white text-base">90-Day Liquidity Runway</h3>
              <p className="text-xs text-slate-400">Projected cash balances based on active scenarios.</p>
            </div>
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Projected Cash</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Conservative</span>
            </div>
          </div>

          <div className="h-64 w-full relative pt-4 flex flex-col justify-between">
            {/* Custom SVG Line Chart coordinates mapping:
                D0: $45K, D30: D30, D60: D60, D90: D90
            */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-4 border-b border-l border-slate-800 pl-12 pr-4">
              <div className="w-full border-t border-slate-800/30" />
              <div className="w-full border-t border-slate-800/30" />
              <div className="w-full border-t border-slate-800/30" />
              <div className="w-full border-t border-slate-800/30" />
            </div>

            {/* SVG Content rendering line */}
            <div className="w-full h-48 pl-12 pr-4 relative z-10">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Projected Line */}
                <path 
                  d={`M 0,${180 - (balanceD0 / 1200)} L 200,${180 - (balanceD30 / 1200)} L 400,${180 - (balanceD60 / 1200)} L 600,${180 - (balanceD90 / 1200)}`} 
                  fill="none" 
                  stroke="#F97316" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
                
                {/* Conservative Baseline Line */}
                <path 
                  d="M 0,140 L 200,135 L 400,120 L 600,105" 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4"
                />

                {/* Glowing points */}
                <circle cx="200" cy={180 - (balanceD30 / 1200)} r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="400" cy={180 - (balanceD60 / 1200)} r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="600" cy={180 - (balanceD90 / 1200)} r="4.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Labels */}
            <div className="flex justify-between pl-12 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              <span>Day 0 (MTD)</span>
              <span>Day 30</span>
              <span>Day 60</span>
              <span>Day 90 (Projected runway)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 3: INVOICES MANAGER TABLE */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4" id="invoices-manager">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b border-slate-800/60">
          <div className="text-left">
            <h3 className="font-extrabold text-white text-base">Invoices Ledger</h3>
            <p className="text-xs text-slate-400">Log client payments, send digital statements and track uncollected receipts.</p>
          </div>
          <button 
            onClick={() => setInvoiceModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Invoice</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Invoice ID</th>
                <th className="pb-3">Client Prospect</th>
                <th className="pb-3">Invoiced Value</th>
                <th className="pb-3">Statement Due Date</th>
                <th className="pb-3">Payment Status</th>
                <th className="pb-3 text-right">Receipt Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-800/60 text-left">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850/40 transition">
                  <td className="py-3 font-mono font-bold text-slate-400">{inv.id}</td>
                  <td className="py-3 font-extrabold text-white">{inv.clientName}</td>
                  <td className="py-3 font-mono text-slate-200 font-bold">${inv.amount.toLocaleString()}</td>
                  <td className="py-3 font-mono text-slate-400">{inv.dueDate}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      inv.status === "Overdue" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {inv.status !== "Paid" ? (
                      <button 
                        onClick={() => handleMarkAsPaid(inv.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2 rounded text-[10px] transition cursor-pointer"
                      >
                        Log Stripe Deposit
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono italic">Deposit Cleared ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => setInvoiceModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full border border-slate-700 z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-left">
              <h3 className="font-extrabold text-white text-base border-b border-slate-800/80 pb-2">Generate Billing Statement Invoice</h3>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Customer Billing Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. David Thompson"
                  value={invClientName}
                  onChange={(e) => setInvClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Invoiced Balance ($)</label>
                  <input 
                    type="number" 
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Terms Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  Publish Stripe Invoice Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
