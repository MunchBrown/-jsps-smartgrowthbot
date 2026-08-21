import React, { useState } from "react";
import { 
  Users, Calendar, DollarSign, TrendingUp, Sparkles, Plus, CheckCircle2, 
  Clock, ArrowUpRight, MessageCircle, FileText, Send, ChevronRight, UserCheck, Trash
} from "lucide-react";
import { Lead, Project } from "../types";
import { monthlyRevenueData, leadSourcesData } from "../sampleData";

interface MainDashboardProps {
  leads: Lead[];
  projects: Project[];
  onNavigate: (module: string) => void;
  onQuickAction: (actionType: string) => void;
}

export default function MainDashboard({ leads, projects, onNavigate, onQuickAction }: MainDashboardProps) {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  // Filter won leads for active projects calculation
  const activeProjectsCount = projects.filter(p => p.status === "Active").length;
  const totalPipelineValue = projects.reduce((acc, curr) => acc + (curr.status !== "Completed" ? curr.contractValue : 0), 0);
  
  // Calculate conversion rate
  const wonLeads = leads.filter(l => l.status === "Won").length;
  const totalProcessedLeads = leads.filter(l => l.status === "Won" || l.status === "Lost").length || 1;
  const calculatedConvRate = Math.round((wonLeads / totalProcessedLeads) * 100) || 43;

  // Static Activity Feed Data
  const activityFeed = [
    { id: 1, text: "New lead from Google Ads - Sarah Williams - $4,500 interior walls", time: "15 mins ago", type: "lead", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { id: 2, text: "Estimate #EST-2024-004 accepted by David Thompson ($12,500 value)", time: "2 hours ago", type: "estimate", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { id: 3, text: "Payment received $3,750 from David Thompson for Invoice #INV-2024-101", time: "4 hours ago", type: "payment", color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { id: 4, text: "Review request automated trigger dispatched to Lisa Anderson", time: "1 day ago", type: "automation", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { id: 5, text: "Carlos Rodriguez crew clocked in at 411 Whispering Pines Rd (GPS verified)", time: "1 day ago", type: "workforce", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { id: 6, text: "Review generated - 5 Stars from Eleanor Vance on Google Business Profile", time: "2 days ago", type: "review", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" }
  ];

  return (
    <div className="space-y-6 text-white pb-10" id="main-dashboard-root">
      
      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-row">
        
        {/* KPI CARD 1: Total Leads */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-orange-500/20 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Total Leads This Month</span>
            <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-xl border border-blue-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{leads.length}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +23%
            </span>
          </div>
          <div className="pt-2 h-10 w-full" id="sparkline-leads">
            {/* Custom SVG Sparkline */}
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path 
                d="M 0,15 Q 15,5 30,12 T 60,3 T 80,10 T 100,5" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M 0,15 Q 15,5 30,12 T 60,3 T 80,10 T 100,5 L 100,20 L 0,20 Z" 
                fill="url(#grad-leads)" 
                opacity="0.1"
              />
              <defs>
                <linearGradient id="grad-leads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* KPI CARD 2: Active Projects */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-orange-500/20 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="bg-orange-500/10 text-orange-400 p-2.5 rounded-xl border border-orange-500/20">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white">{activeProjectsCount}</span>
            <span className="text-xs text-slate-400 font-mono pt-1">
              Pipeline: <strong className="text-orange-500">${totalPipelineValue.toLocaleString()}</strong>
            </span>
          </div>
          {/* Custom SVG progress mini-indicator */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeProjectsCount / 8) * 100}%` }} />
          </div>
        </div>

        {/* KPI CARD 3: Revenue MTD */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-orange-500/20 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Revenue This Month</span>
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">$84,250</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +31%
            </span>
          </div>
          <div className="pt-2 h-10 w-full" id="sparkline-revenue">
            {/* Custom SVG Mini Bar Chart */}
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <g fill="#10B981" opacity="0.6">
                <rect x="2" y="14" width="8" height="6" rx="1" />
                <rect x="14" y="10" width="8" height="10" rx="1" />
                <rect x="26" y="12" width="8" height="8" rx="1" />
                <rect x="38" y="8" width="8" height="12" rx="1" />
                <rect x="50" y="5" width="8" height="15" rx="1" />
                <rect x="62" y="7" width="8" height="13" rx="1" />
                <rect x="74" y="4" width="8" height="16" rx="1" />
                <rect x="86" y="2" width="8" height="18" rx="1" />
              </g>
            </svg>
          </div>
        </div>

        {/* KPI CARD 4: Conversion Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-orange-500/20 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
            <div className="bg-purple-500/10 text-purple-400 p-2.5 rounded-xl border border-purple-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-white">{calculatedConvRate}%</span>
            <span className="text-[10px] text-slate-400 font-mono bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">
              Avg: 20%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${calculatedConvRate}%` }} />
          </div>
        </div>

      </div>

      {/* ROW 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-row">
        
        {/* Left: Revenue Trend Line Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">Annual Revenue Trajectory</h3>
              <p className="text-xs text-slate-400">Comparing gross revenue intake vs production labor/materials expenses.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Expenses</span>
            </div>
          </div>

          <div className="h-64 w-full relative pt-4 flex flex-col justify-between">
            {/* Custom SVG Line Chart with Grid lines and hover effect */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-4 border-b border-l border-slate-800 pl-8 pr-2">
              <div className="w-full border-t border-slate-800/40" />
              <div className="w-full border-t border-slate-800/40" />
              <div className="w-full border-t border-slate-800/40" />
              <div className="w-full border-t border-slate-800/40" />
              <div className="w-full border-t border-slate-800/40" />
            </div>

            {/* SVG Content */}
            <div className="w-full h-48 pl-8 pr-2 relative z-10">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Revenue Line */}
                <path 
                  d="M 0,160 L 54,150 L 108,140 L 162,155 L 216,165 L 270,160 L 324,130 L 378,120 L 432,95 L 486,70 L 540,55 L 600,40" 
                  fill="none" 
                  stroke="#F97316" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
                {/* Expenses Line */}
                <path 
                  d="M 0,180 L 54,175 L 108,172 L 162,178 L 216,182 L 270,183 L 324,165 L 378,160 L 432,142 L 486,130 L 540,120 L 600,110" 
                  fill="none" 
                  stroke="#64748B" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
                
                {/* Data point glowing rings */}
                <circle cx="540" cy="55" r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="600" cy="40" r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Labels */}
            <div className="flex justify-between pl-8 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              {monthlyRevenueData.map((d, i) => (
                <span key={i}>{d.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Lead Source Pie/Donut Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base">Lead Generation Sources</h3>
            <p className="text-xs text-slate-400">Analyzing the best advertising distribution channels.</p>
          </div>

          <div className="flex justify-center items-center h-40 relative">
            {/* Custom SVG Donut Chart */}
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1E293B" strokeWidth="3.5" />
              {/* Google Ads Segment (42%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.5" strokeDasharray="42 58" strokeDashoffset="25" />
              {/* Organic Search (28%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="28 72" strokeDashoffset="83" />
              {/* Yelp / Reviews (15%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="55" />
              {/* Referrals (10%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="40" />
              {/* Facebook Ads (5%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeDasharray="5 95" strokeDashoffset="30" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-white">47</span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Total Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {leadSourcesData.map((src, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                <span className="text-slate-400 truncate">{src.name} ({src.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 3: TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-tables-row">
        
        {/* Left: Recent Leads */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">Recent Incoming Leads</h3>
              <p className="text-xs text-slate-400">Newly captured prospect registrations awaiting dispatch.</p>
            </div>
            <button 
              onClick={() => onNavigate("LeadFlow AI")}
              className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-0.5"
            >
              Pipeline CRM <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto" id="dashboard-leads-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Budget</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {leads.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3">
                      <p className="font-bold text-white">{l.clientName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{l.phone}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono font-bold bg-slate-850 px-2 py-0.5 rounded-md text-slate-300">
                        {l.clientType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-semibold">${l.budget.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                        l.status === "New" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        l.status === "Won" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        l.status === "Quoted" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                        l.status === "Qualified" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono">
                      <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                        l.score >= 85 ? "text-emerald-400 bg-emerald-500/5" :
                        l.score >= 70 ? "text-orange-400 bg-orange-500/5" :
                        "text-slate-400"
                      }`}>{l.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Upcoming Schedule */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">Dispatch Schedule</h3>
              <p className="text-xs text-slate-400">Active projects crew allocations for the upcoming week.</p>
            </div>
            <button 
              onClick={() => onNavigate("CrewOptimizer AI")}
              className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-0.5"
            >
              Scheduler <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3" id="dashboard-schedule-list">
            {projects.slice(0, 3).map((proj) => (
              <div key={proj.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition flex justify-between items-start">
                <div className="space-y-1 max-w-[65%]">
                  <h4 className="font-bold text-white text-xs truncate">{proj.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{proj.address}</p>
                  <p className="text-[9px] font-mono text-slate-500">Kickoff: {proj.startDate}</p>
                </div>
                <div className="text-right space-y-2">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                    proj.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    proj.status === "Scheduled" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-slate-800 text-slate-400"
                  }`}>
                    {proj.status}
                  </span>
                  
                  {/* Crew Avatars */}
                  <div className="flex justify-end -space-x-1.5 overflow-hidden">
                    {proj.crewAssigned.map((crew, idx) => (
                      <div 
                        key={idx} 
                        title={crew}
                        className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-950 text-[9px] flex items-center justify-center font-bold text-slate-300"
                      >
                        {crew.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 4: ACTIVITY FEED */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4" id="dashboard-activity-feed">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
          <div>
            <h3 className="font-extrabold text-white text-base">Platform Activity Intel Feed</h3>
            <p className="text-xs text-slate-400">Real-time automation logs and dispatch telemetry.</p>
          </div>
          <span className="text-[9px] font-mono text-slate-500">PULSE STATE: AUTOMATION SECURE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
          {activityFeed.map((act) => (
            <div key={act.id} className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${act.color}`}>
              <p className="leading-normal font-medium">{act.text}</p>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5 text-[9px] font-mono">
                <span className="uppercase tracking-widest opacity-80">{act.type}</span>
                <span className="opacity-60">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTION FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-40" id="quick-action-widget">
        {quickMenuOpen && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 mb-3 w-48 text-left animate-slideUp relative">
            <h5 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase pb-1.5 border-b border-slate-800">Quick Actions</h5>
            <button 
              onClick={() => { onQuickAction("newLead"); setQuickMenuOpen(false); }}
              className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 px-2.5 py-1.5 rounded-lg transition flex items-center gap-2"
            >
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span>+ New Lead</span>
            </button>
            <button 
              onClick={() => { onQuickAction("newEstimate"); setQuickMenuOpen(false); }}
              className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 px-2.5 py-1.5 rounded-lg transition flex items-center gap-2"
            >
              <FileText className="h-3.5 w-3.5 text-orange-400" />
              <span>+ New Estimate</span>
            </button>
            <button 
              onClick={() => { onQuickAction("newCustomer"); setQuickMenuOpen(false); }}
              className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 px-2.5 py-1.5 rounded-lg transition flex items-center gap-2"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>+ New Customer</span>
            </button>
            <button 
              onClick={() => { onQuickAction("scheduleCrew"); setQuickMenuOpen(false); }}
              className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 px-2.5 py-1.5 rounded-lg transition flex items-center gap-2"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Schedule Crew</span>
            </button>
          </div>
        )}
        <button 
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-4.5 rounded-full shadow-2xl transition transform hover:rotate-90 flex items-center justify-center cursor-pointer"
          title="Quick Add Menu"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

    </div>
  );
}
