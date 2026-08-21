import React, { useState } from "react";
import { 
  Plus, Search, Filter, Sparkles, ChevronRight, X, Phone, Mail, MessageSquare, 
  Calendar, FileText, Send, CheckCircle2, TrendingUp, RefreshCw, AlertCircle, 
  Trash, ArrowRight, Star, Globe, ShieldCheck, MailCheck, MessageCircle, BarChart2
} from "lucide-react";
import { Lead, Campaign, Review } from "../types";
import { initialLeads, initialCampaigns, initialReviews } from "../sampleData";

interface LeadFlowModuleProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export default function LeadFlowModule({ leads, setLeads }: LeadFlowModuleProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "all" | "campaigns" | "seo" | "reviews" | "sources">("pipeline");

  // Kanban pipeline columns
  const pipelineColumns = [
    { id: "New", label: "NEW", color: "border-t-4 border-blue-500 bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400" },
    { id: "Contacted", label: "CONTACTED", color: "border-t-4 border-yellow-500 bg-yellow-500/5", badge: "bg-yellow-500/10 text-yellow-400" },
    { id: "Qualified", label: "QUALIFIED", color: "border-t-4 border-purple-500 bg-purple-500/5", badge: "bg-purple-500/10 text-purple-400" },
    { id: "Quoted", label: "QUOTED", color: "border-t-4 border-orange-500 bg-orange-500/5", badge: "bg-orange-500/10 text-orange-400" },
    { id: "Won", label: "WON", color: "border-t-4 border-emerald-500 bg-emerald-500/5", badge: "bg-emerald-500/10 text-emerald-400" },
    { id: "Lost", label: "LOST", color: "border-t-4 border-red-500 bg-red-500/5", badge: "bg-red-500/10 text-red-400" }
  ] as const;

  // Selected lead details slide-over
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0]);
  const [detailTab, setDetailTab] = useState<"overview" | "timeline" | "notes" | "estimates" | "files">("overview");
  
  // SEO tab states
  const [seoTopic, setSeoTopic] = useState("Shed prep and trim paint solutions");
  const [seoKeyword, setSeoKeyword] = useState("York PA cabinet refinishing");
  const [seoPlatform, setSeoPlatform] = useState<"blog" | "gpb">("gpb");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState("");
  const [copiedSeo, setCopiedSeo] = useState(false);

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Review reply simulation state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  // Add lead modal state
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string>("New");
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadType, setNewLeadType] = useState<"Residential" | "Commercial">("Residential");
  const [newLeadBudget, setNewLeadBudget] = useState("4500");
  const [newLeadSqft, setNewLeadSqft] = useState("1800");
  const [newLeadTimeline, setNewLeadTimeline] = useState("Next month");
  const [newLeadCondition, setNewLeadCondition] = useState("Good condition, needs standard prep");
  const [newLeadSource, setNewLeadSource] = useState("Google Ads");
  const [newLeadAddress, setNewLeadAddress] = useState("120 Market St, York, PA");
  const [leadScoringLoading, setLeadScoringLoading] = useState(false);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignType, setNewCampaignType] = useState<any>("Email");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;
    const camp: Campaign = {
      id: "camp-" + Date.now(),
      name: newCampaignName,
      type: newCampaignType,
      status: "Scheduled",
      sent: 0,
      delivered: 0,
      opened: 0,
      clicks: 0,
      leadsGenerated: 0,
      spend: 0
    };
    setCampaigns([camp, ...campaigns]);
    setNewCampaignName("");
    setCampaignModalOpen(false);
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName) return;
    setLeadScoringLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: newLeadName,
          phone: newLeadPhone || "(717) 555-0245",
          email: newLeadEmail || `${newLeadName.toLowerCase().replace(/\s/g, "")}@example.com`,
          clientType: newLeadType,
          budget: Number(newLeadBudget) || 4500,
          sqft: Number(newLeadSqft) || 1500,
          timeline: newLeadTimeline,
          condition: newLeadCondition,
          source: newLeadSource,
          address: newLeadAddress
        })
      });

      if (!res.ok) {
        throw new Error(`Lead submission HTTP error status: ${res.status}`);
      }
      const created = await res.json();

      setLeads([created, ...leads]);
      setSelectedLead(created);
      setAddLeadOpen(false);
      resetLeadForm();
    } catch (err) {
      console.error(err);
      // Fallback local creation if connection fails
      const created: Lead = {
        id: "lead-" + Date.now(),
        clientName: newLeadName,
        phone: newLeadPhone || "(717) 555-0245",
        email: newLeadEmail || `${newLeadName.toLowerCase().replace(/\s/g, "")}@example.com`,
        clientType: newLeadType,
        budget: Number(newLeadBudget) || 4500,
        sqft: Number(newLeadSqft) || 1500,
        timeline: newLeadTimeline,
        condition: newLeadCondition,
        status: targetColumn as any,
        score: Number(newLeadBudget) > 6000 ? 85 : 68,
        source: newLeadSource,
        address: newLeadAddress,
        createdAt: new Date().toISOString().split("T")[0],
        justification: "Lead scored using local heuristics (Gemini connection offline). Good revenue per sqft and timeline indications.",
        actionPlan: ["Follow up immediately via SMS", "Offer exterior power-wash bonus", "Confirm on-site survey time"]
      };
      setLeads([created, ...leads]);
      setSelectedLead(created);
      setAddLeadOpen(false);
      resetLeadForm();
    } finally {
      setLeadScoringLoading(false);
    }
  };

  const resetLeadForm = () => {
    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadEmail("");
    setNewLeadBudget("4500");
    setNewLeadSqft("1800");
    setNewLeadTimeline("Next month");
    setNewLeadAddress("120 Market St, York, PA");
  };

  const handleGenerateSEOContent = async () => {
    if (!seoTopic || !seoKeyword) return;
    setSeoLoading(true);
    setSeoResult("");
    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: seoTopic,
          keyword: seoKeyword,
          platform: seoPlatform
        })
      });
      if (!res.ok) {
        throw new Error(`SEO generator HTTP error status: ${res.status}`);
      }
      const data = await res.json();
      setSeoResult(data.content || "Failed to generate SEO optimized post.");
    } catch (err) {
      console.error(err);
      setSeoResult("Standard Local SEO post content: " + seoTopic + ". Optimized for keyword: " + seoKeyword + ". Full service prep guarantees long-lasting beauty.");
    } finally {
      setSeoLoading(false);
    }
  };

  const copySeoToClipboard = () => {
    navigator.clipboard.writeText(seoResult);
    setCopiedSeo(true);
    setTimeout(() => setCopiedSeo(false), 2000);
  };

  const handleReviewReply = (reviewId: string) => {
    const text = replyInputs[reviewId];
    if (!text) return;
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, replied: true, replyText: text } : r));
    setReplyInputs({ ...replyInputs, [reviewId]: "" });
  };

  const moveLeadStatus = async (leadId: string, newStatus: any) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }
  };

  // Calculations for pipeline headers
  const getColTotals = (status: string) => {
    const colLeads = leads.filter(l => l.status === status);
    const count = colLeads.length;
    const value = colLeads.reduce((acc, curr) => acc + curr.budget, 0);
    return { count, value };
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (l.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white pb-10" id="leadflow-ai-root">
      
      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-4" id="leadflow-subnav">
        <div className="flex gap-2">
          {["pipeline", "all", "campaigns", "seo", "reviews", "sources"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${activeTab === tab ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {tab === "pipeline" && "📋 Pipeline Board"}
              {tab === "all" && "👥 All Leads"}
              {tab === "campaigns" && "🚀 Marketing Campaigns"}
              {tab === "seo" && "✍️ AI Local SEO"}
              {tab === "reviews" && "⭐ Reviews Hub"}
              {tab === "sources" && "📊 Lead Sources"}
            </button>
          ))}
        </div>
        <button 
          onClick={() => { setTargetColumn("New"); setAddLeadOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Capture Lead</span>
        </button>
      </div>

      {/* PIPELINE VIEW */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4" id="view-pipeline">
          {pipelineColumns.map((col) => {
            const { count, value } = getColTotals(col.id);
            const colLeads = leads.filter(l => l.status === col.id);
            
            return (
              <div key={col.id} className={`p-3 rounded-2xl border border-slate-800 space-y-4 min-w-[180px] flex flex-col h-[650px] ${col.color}`}>
                {/* Column Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-[11px] font-sans tracking-wide text-white">{col.label}</h4>
                    <p className="text-[10px] text-slate-500 font-mono font-bold">${value.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${col.badge}`}>{count}</span>
                    <button 
                      onClick={() => { setTargetColumn(col.id); setAddLeadOpen(true); }}
                      className="text-slate-400 hover:text-white"
                      title="Add lead to column"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1" id={`column-leads-${col.id}`}>
                  {colLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`bg-slate-900 border border-slate-800 p-3.5 rounded-xl hover:border-orange-500/30 transition cursor-pointer space-y-2 group relative ${selectedLead?.id === lead.id ? "border-orange-500 ring-1 ring-orange-500/30" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-white text-xs truncate group-hover:text-orange-400 transition">{lead.clientName}</h5>
                        <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                          lead.score >= 85 ? "text-emerald-400 bg-emerald-500/10" :
                          lead.score >= 70 ? "text-orange-400 bg-orange-500/10" :
                          "text-slate-400 bg-slate-800"
                        }`}>
                          {lead.score}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate">{lead.address}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[9px] font-mono text-slate-500">
                        <span>{lead.clientType}</span>
                        <strong className="text-slate-300 font-semibold">${lead.budget.toLocaleString()}</strong>
                      </div>

                      {/* Micro pipeline controls to simulate drag and drop click actions */}
                      <div className="absolute right-2 top-1 opacity-0 group-hover:opacity-100 transition flex gap-1">
                        <select 
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => moveLeadStatus(lead.id, e.target.value as any)}
                          className="bg-slate-950 border border-slate-850 text-white rounded text-[8px] px-1 font-mono focus:outline-none"
                        >
                          {pipelineColumns.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="text-center py-12 text-[10px] text-slate-500 font-mono italic">
                      No leads in stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ALL LEADS TABLE VIEW */}
      {activeTab === "all" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4" id="view-all-leads">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-extrabold text-white text-base">All Lead Directory</h3>
              <p className="text-xs text-slate-400">Sort, query, and bulk manage your business contact index.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60 bg-slate-950 border border-slate-800 text-white rounded-xl py-2 pl-9 pr-4 text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl text-xs px-3 focus:outline-none"
              >
                <option value="All">All Stages</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Quoted">Quoted</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Client / Contact</th>
                  <th className="pb-3">Project Address</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Budget</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition cursor-pointer" onClick={() => setSelectedLead(l)}>
                    <td className="py-3">
                      <p className="font-bold text-white">{l.clientName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{l.phone} • {l.email}</p>
                    </td>
                    <td className="py-3 text-slate-300 text-xs">{l.address}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono font-bold bg-slate-850 px-2 py-0.5 rounded-md text-slate-400">{l.clientType}</span>
                    </td>
                    <td className="py-3 text-slate-300 font-semibold">${l.budget.toLocaleString()}</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400">{l.source}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                        l.status === "New" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        l.status === "Won" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        l.status === "Quoted" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                        l.status === "Contacted" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono">
                      <span className={`font-bold px-1.5 py-0.5 rounded ${l.score >= 85 ? "text-emerald-400 bg-emerald-500/5" : "text-orange-400 bg-orange-500/5"}`}>{l.score}</span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500">{l.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARKETING CAMPAIGNS VIEW */}
      {activeTab === "campaigns" && (
        <div className="space-y-6" id="view-campaigns">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Campaign Launchpad</h3>
              <p className="text-xs text-slate-400">Design SMS or Email dispatch sequences to local neighborhoods.</p>
            </div>
            <button 
              onClick={() => setCampaignModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md uppercase">{camp.type}</span>
                    <h4 className="font-extrabold text-white text-sm pt-1">{camp.name}</h4>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    camp.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}>{camp.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-950 rounded-xl border border-slate-850">
                  <div>
                    <p className="text-slate-500 text-[9px] font-mono">REACH</p>
                    <p className="text-xs font-bold text-white font-mono">{camp.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-mono">LEADS</p>
                    <p className="text-xs font-bold text-orange-400 font-mono">{camp.leadsGenerated}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-mono">SPENT</p>
                    <p className="text-xs font-bold text-emerald-400 font-mono">${camp.spend}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${camp.sent > 0 ? (camp.leadsGenerated / camp.sent) * 1000 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI LOCAL SEO DASHBOARD */}
      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-seo">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-left">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              AI Local SEO content generator
            </h3>
            <p className="text-xs text-slate-400">Generate fully optimized, search-safe, high-converting copy specifically formatted for Google Business Profiles or local blogs.</p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Focus Content Topic</label>
                <input 
                  type="text"
                  value={seoTopic}
                  onChange={(e) => setSeoTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Local Target Keyword</label>
                <input 
                  type="text"
                  value={seoKeyword}
                  onChange={(e) => setSeoKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button 
                  onClick={() => setSeoPlatform("gpb")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition border ${seoPlatform === "gpb" ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"}`}
                >
                  🏪 GOOGLE PROFILE (GPB)
                </button>
                <button 
                  onClick={() => setSeoPlatform("blog")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition border ${seoPlatform === "blog" ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"}`}
                >
                  📝 LOCAL BLOG POST
                </button>
              </div>

              <button 
                onClick={handleGenerateSEOContent}
                disabled={seoLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer"
              >
                {seoLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing local search indices...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Optimized Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/85">
                <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-wider">Optimized Content Output</h4>
                {seoResult && (
                  <button 
                    onClick={copySeoToClipboard}
                    className="text-[10px] font-mono font-bold text-orange-500 hover:text-orange-400 bg-orange-500/5 border border-orange-500/20 px-2 py-1 rounded"
                  >
                    {copiedSeo ? "Copied ✓" : "Copy to Clipboard"}
                  </button>
                )}
              </div>

              {seoResult ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans">
                  {seoResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-2">
                  <Globe className="h-10 w-10 text-slate-600 animate-pulse" />
                  <p className="text-xs font-mono italic">Waiting for SEO prompt submission...</p>
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/40 text-[10px] text-slate-500 flex items-center gap-2 mt-4 font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Output strictly adheres to regional local schema search metrics.</span>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS HUB MANAGER */}
      {activeTab === "reviews" && (
        <div className="space-y-6" id="view-reviews">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-500 text-[10px] font-mono">RATING INDEX</p>
              <h4 className="text-2xl font-black text-white">4.9 / 5.0</h4>
              <p className="text-[9px] text-slate-500 font-mono">Industry Leading Standard</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-500 text-[10px] font-mono">TOTAL REVIEWS</p>
              <h4 className="text-2xl font-black text-white">1,842</h4>
              <p className="text-[9px] text-emerald-400 font-mono font-bold">+18 This Week</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-500 text-[10px] font-mono">GOOGLE BOOST RATING</p>
              <h4 className="text-2xl font-black text-white">98%</h4>
              <p className="text-[9px] text-slate-500 font-mono">Highly Optimized Rank</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-500 text-[10px] font-mono">REPLY COMPLETION</p>
              <h4 className="text-2xl font-black text-white">92%</h4>
              <p className="text-[9px] text-slate-500 font-mono">Auto-Pilot Engaged</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-base">Reviews Feed</h3>
            
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white text-xs">{rev.author}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">{rev.date} • {rev.platform} Platform</p>
                    </div>
                    <div className="flex gap-0.5 text-orange-500">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-orange-500" />)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">"{rev.content}"</p>

                  {rev.replied ? (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex justify-between font-mono text-[9px] text-orange-400 font-bold">
                        <span>OWNER RESPONSE:</span>
                        <span>CONFIRMED SENT</span>
                      </div>
                      <p className="font-sans leading-relaxed">"{rev.replyText}"</p>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <input 
                        type="text"
                        placeholder="Type AI suggested response reply..."
                        value={replyInputs[rev.id] || ""}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [rev.id]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-orange-500"
                      />
                      <button 
                        onClick={() => handleReviewReply(rev.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEAD SOURCES ANALYSIS */}
      {activeTab === "sources" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6" id="view-sources">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base">Advertising Distribution Intel</h3>
            <p className="text-xs text-slate-400">Comparing acquisition cost against contract values per platform channel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { source: "Google Ads", count: 42, spend: 850, value: 52000, cac: 20 },
              { source: "Organic GBP", count: 28, spend: 120, value: 34500, cac: 4 },
              { source: "Referrals", count: 18, spend: 50, value: 22000, cac: 2.7 },
              { source: "Facebook Campaign", count: 12, spend: 400, value: 15200, cac: 33 }
            ].map((src, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-left">
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">{src.source}</span>
                <div className="space-y-1 pt-1 border-t border-slate-900">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Capture Count:</span>
                    <span className="text-white font-bold font-mono">{src.count} Leads</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Capital Spent:</span>
                    <span className="text-slate-300 font-mono">${src.spend}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Acquisition CAC:</span>
                    <span className="text-emerald-400 font-bold font-mono">${src.cac} / lead</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-900">
                    <span className="text-slate-400">Booked Value:</span>
                    <span className="text-orange-500 font-black font-mono">${src.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEAD DETAILS SLIDE-OVER */}
      {selectedLead && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between animate-slideIn" id="lead-slideover">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase">{selectedLead.status} Stage</span>
              <h3 className="font-extrabold text-white text-base">{selectedLead.clientName}</h3>
            </div>
            <button 
              onClick={() => setSelectedLead(null)}
              className="text-slate-400 hover:text-white bg-slate-900 p-1.5 border border-slate-850 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex bg-slate-950 border-b border-slate-800 text-xs text-slate-400" id="slideover-tabs">
            {["overview", "timeline", "notes", "estimates"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setDetailTab(tab as any)}
                className={`flex-1 py-2.5 font-mono font-bold tracking-wider text-center uppercase border-b-2 transition ${detailTab === tab ? "border-orange-500 text-white bg-slate-900" : "border-transparent text-slate-400 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Slide Over Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5" id="slideover-content">
            
            {/* OVERVIEW TAB */}
            {detailTab === "overview" && (
              <div className="space-y-5">
                
                {/* AI Score Card */}
                <div className="bg-gradient-to-r from-orange-600/10 to-blue-600/10 border border-slate-800 p-4 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-orange-400 tracking-wider uppercase">Predictive CRM AI Lead Score</span>
                    <span className="text-xs font-black text-white bg-orange-500/15 px-2 py-0.5 rounded-md border border-orange-500/20">{selectedLead.score} / 100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-850/40">
                      <span className="text-slate-500">Budget Fit:</span>
                      <strong className="text-emerald-400">92/100</strong>
                    </div>
                    <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-850/40">
                      <span className="text-slate-500">Timeline Urgency:</span>
                      <strong className="text-amber-400">80/100</strong>
                    </div>
                    <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-850/40">
                      <span className="text-slate-500">Area Property:</span>
                      <strong className="text-slate-300">75/100</strong>
                    </div>
                    <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-850/40">
                      <span className="text-slate-500">Contact Quality:</span>
                      <strong className="text-emerald-400">85/100</strong>
                    </div>
                  </div>

                  {selectedLead.justification && (
                    <p className="text-[10px] text-slate-400 leading-normal pt-2 border-t border-slate-800/60 font-sans">
                      {selectedLead.justification}
                    </p>
                  )}
                </div>

                {/* Contact details */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest font-mono">Contact Coordinates</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                      <span className="text-slate-500">Primary Phone:</span>
                      <strong className="text-white font-mono">{selectedLead.phone}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                      <span className="text-slate-500">Primary Email:</span>
                      <strong className="text-white font-mono">{selectedLead.email}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                      <span className="text-slate-500">Project Location:</span>
                      <strong className="text-white truncate max-w-[65%]">{selectedLead.address || "York, PA"}</strong>
                    </div>
                  </div>
                </div>

                {/* AI Action Plan */}
                {selectedLead.actionPlan && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest font-mono">AI Recommended Action Items</h4>
                    <ul className="space-y-1.5 text-xs">
                      {selectedLead.actionPlan.map((act, i) => (
                        <li key={i} className="flex gap-2 items-start bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                          <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-slate-300 leading-normal">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TIMELINE TAB */}
            {detailTab === "timeline" && (
              <div className="space-y-4">
                <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-6">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 bg-blue-500 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900" />
                    <p className="text-[10px] font-mono text-slate-500">June 29, 2:00 PM</p>
                    <h5 className="font-bold text-white text-xs">Incoming Lead Captured</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Captured via Google Search Ad landing page submission.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 bg-purple-500 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900" />
                    <p className="text-[10px] font-mono text-slate-500">June 29, 2:01 PM</p>
                    <h5 className="font-bold text-white text-xs">AI Lead Scored Successfully</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Evaluation categorized lead as high value with hot status.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 bg-yellow-500 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900" />
                    <p className="text-[10px] font-mono text-slate-500">June 29, 2:05 PM</p>
                    <h5 className="font-bold text-white text-xs">Welcome SMS Dispatch</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Automated introductory text sent to {selectedLead.phone}.</p>
                  </div>
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {detailTab === "notes" && (
              <div className="space-y-4">
                <textarea 
                  placeholder="Type important customer notes, color specs or site guidelines..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition">
                  Save Note to CRM Entry
                </button>
              </div>
            )}

            {/* ESTIMATES TAB */}
            {detailTab === "estimates" && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-white">#EST-2024-001 Draft</h5>
                    <p className="text-[10px] text-slate-500 font-mono">Value: ${selectedLead.budget.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded uppercase">DRAFT</span>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-850 font-bold py-2.5 px-3 rounded-xl text-xs transition flex justify-center items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Draft New Estimate</span>
                </button>
              </div>
            )}

          </div>

          {/* Quick Contact Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2.5">
            <a 
              href={`tel:${selectedLead.phone}`}
              className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl py-2.5 text-xs text-white font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Call</span>
            </a>
            <button 
              onClick={() => alert(`Opening text conversation with ${selectedLead.clientName}`)}
              className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl py-2.5 text-xs text-white font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-orange-400" />
              <span>SMS</span>
            </button>
            <a 
              href={`mailto:${selectedLead.email}`}
              className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl py-2.5 text-xs text-white font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>Email</span>
            </a>
          </div>

        </div>
      )}

      {/* ADD LEAD MODAL */}
      {addLeadOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-xl relative shadow-2xl">
            <button 
              onClick={() => setAddLeadOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full border border-slate-700 z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleAddLead} className="p-6 space-y-4 text-left">
              <div className="space-y-1 pb-2 border-b border-slate-800/80">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
                  Capture & Score New Painting Lead
                </h3>
                <p className="text-[11px] text-slate-500">Provide project specs for instant predictive scoring.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Customer Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="Mike Johnson"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Contact Phone</label>
                  <input 
                    type="text" 
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    placeholder="(717) 555-0140"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Customer Email</label>
                  <input 
                    type="email" 
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="mike@johnnysonspainting.com"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Project Category</label>
                  <select 
                    value={newLeadType}
                    onChange={(e) => setNewLeadType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Estimated Budget ($)</label>
                  <input 
                    type="number" 
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Calc Area (Sq Ft)</label>
                  <input 
                    type="number" 
                    value={newLeadSqft}
                    onChange={(e) => setNewLeadSqft(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Lead Channel Source</label>
                  <select 
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="Google Ads">Google Ads</option>
                    <option value="Organic Search">Organic Search</option>
                    <option value="Yelp / Reviews">Yelp / Reviews</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Full Project Location Address</label>
                <input 
                  type="text" 
                  value={newLeadAddress}
                  onChange={(e) => setNewLeadAddress(e.target.value)}
                  placeholder="e.g. 104 Main St, York PA"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Project Timeline</label>
                  <select 
                    value={newLeadTimeline}
                    onChange={(e) => setNewLeadTimeline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Next 2 weeks">Next 2 weeks</option>
                    <option value="Next month">Next month</option>
                    <option value="Flexible (next 2-3 months)">Flexible (next 2-3 months)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Surface Prep Condition</label>
                  <select 
                    value={newLeadCondition}
                    onChange={(e) => setNewLeadCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="Excellent condition, just color change">Excellent condition, just color change</option>
                    <option value="Good condition, needs standard prep">Good condition, needs standard prep</option>
                    <option value="Fair, minor drywall dings and scuffs">Fair, minor drywall dings and scuffs</option>
                    <option value="Flaking wood siding, requires extensive scraping">Flaking wood siding, requires extensive scraping</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={leadScoringLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer"
                >
                  {leadScoringLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>AI Model scoring lead metrics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Activate AI Lead Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {campaignModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => setCampaignModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full border border-slate-700 z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 text-left">
              <h3 className="font-extrabold text-white text-base border-b border-slate-800/80 pb-2">Launch Marketing Campaign</h3>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Campaign Title Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. West York Porch restoration discount"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Platform Channel</label>
                <select 
                  value={newCampaignType}
                  onChange={(e) => setNewCampaignType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                >
                  <option value="Email">Email Blast</option>
                  <option value="SMS">SMS Sequence</option>
                  <option value="Direct Mail">Direct Mail Postcards</option>
                  <option value="Google Ads">Google Search Ads</option>
                  <option value="Facebook Ads">Facebook Meta Ads</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  Schedule Campaign Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
