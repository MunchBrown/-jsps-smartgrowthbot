import React, { useState } from "react";
import { 
  Plus, Trash, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Check, 
  Settings, CreditCard, Users, Link2, Key, Database, Mail
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Estimator" | "Crew Leader" | "Painter";
  status: "Active" | "Pending";
}

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState<"profile" | "stripe" | "accounting" | "team" | "db">("profile");

  // Profile forms
  const [companyName, setCompanyName] = useState("Smart Growth Painting");
  const [companyPhone, setCompanyPhone] = useState("(717) 555-0140");
  const [companyEmail, setCompanyEmail] = useState("billing@smartgrowthpainting.com");
  const [companyAddress, setCompanyAddress] = useState("415 Pine Lane, York, PA 17401");

  // Stripe status
  const [stripeConnected, setStripeConnected] = useState(true);

  // Accounting QuickBooks
  const [qbConnected, setQbConnected] = useState(true);

  // Team state
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "1", name: "Mike Johnson", email: "mike@johnnysonspainting.com", role: "Owner", status: "Active" },
    { id: "2", name: "Carlos Rodriguez", email: "carlos@johnnysonspainting.com", role: "Crew Leader", status: "Active" },
    { id: "3", name: "Darryl Vance", email: "darryl@johnnysonspainting.com", role: "Crew Leader", status: "Active" },
    { id: "4", name: "Sarah Lindqvist", email: "sarah@johnnysonspainting.com", role: "Estimator", status: "Active" }
  ]);

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<any>("Painter");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const created: TeamMember = {
      id: "t-" + Date.now(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      status: "Pending"
    };

    setTeam([...team, created]);
    setNewMemberName("");
    setNewMemberEmail("");
  };

  const handleRemoveMember = (id: string) => {
    setTeam(team.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="settings-root">
      
      {/* Sub tabs nav */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-4">
        <div className="flex gap-2">
          {["profile", "stripe", "accounting", "team", "db"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${activeTab === tab ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {tab === "profile" && "🏢 Company Profile"}
              {tab === "stripe" && "💳 Stripe Merchant"}
              {tab === "accounting" && "🔌 QuickBooks Sync"}
              {tab === "team" && "👥 Team & Roles"}
              {tab === "db" && "💾 Database Admin"}
            </button>
          ))}
        </div>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4 max-w-xl mx-auto" id="settings-profile">
          <h3 className="font-extrabold text-white text-base">Company Registration Details</h3>
          <p className="text-xs text-slate-400">Manage painting firm physical address and contact details populated on PDF contracts.</p>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Painting Firm Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Contact Phone</label>
                <input 
                  type="text" 
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Corporate Billing Email</label>
              <input 
                type="email" 
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Physical Address</label>
              <input 
                type="text" 
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
              />
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition">
              Save Company Profile Info
            </button>
          </div>
        </div>
      )}

      {/* STRIPE MERCHANT TAB */}
      {activeTab === "stripe" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4 max-w-xl mx-auto" id="settings-stripe">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <h3 className="font-extrabold text-white text-base">Stripe Merchant Settlement Gateway</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              stripeConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"
            }`}>{stripeConnected ? "CONNECTED" : "DISCONNECTED"}</span>
          </div>

          <p className="text-xs text-slate-400">Collect immediate credit card deposits and full project invoices directly inside PDF proposals on-site with clients. Settlements deposit within 24 hours.</p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-mono">
            <div className="space-y-1">
              <span className="text-slate-500 block">CONNECTED ACCOUNT INDEX:</span>
              <strong className="text-white">acct_1H9F8XJK891M001Z</strong>
            </div>
            <button 
              onClick={() => setStripeConnected(!stripeConnected)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-1.5 px-3 rounded-lg text-[10px] font-bold font-mono transition"
            >
              {stripeConnected ? "Disconnect Gateway" : "Authorize Stripe Connection"}
            </button>
          </div>
        </div>
      )}

      {/* ACCOUNTING QUICKBOOKS TAB */}
      {activeTab === "accounting" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4 max-w-xl mx-auto" id="settings-accounting">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <h3 className="font-extrabold text-white text-base">QuickBooks / Xero Two-Way Sync</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              qbConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"
            }`}>{qbConnected ? "SYNC ENABLED" : "DISCONNECTED"}</span>
          </div>

          <p className="text-xs text-slate-400">Automatically synchronize invoice deposits, labor costs, and material line items with your accounting ledgers, fully eliminating manual spreadsheet entries.</p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-mono">
            <div className="space-y-1">
              <span className="text-slate-500 block">QB TWO-WAY PIPELINE:</span>
              <strong className="text-white">Active (Auto-syncs hourly)</strong>
            </div>
            <button 
              onClick={() => setQbConnected(!qbConnected)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-1.5 px-3 rounded-lg text-[10px] font-bold font-mono transition"
            >
              {qbConnected ? "Disable QuickBooks Sync" : "Enable QuickBooks Sync"}
            </button>
          </div>
        </div>
      )}

      {/* TEAM & ROLES TAB */}
      {activeTab === "team" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="settings-team">
          
          {/* Add member form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
            <h3 className="font-extrabold text-white text-base">Add New Team Member</h3>
            
            <form onSubmit={handleAddMember} className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Team Member Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Carlos Rodriguez"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Contractor Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="carlos@johnnysonspainting.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">System Role</label>
                <select 
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-855 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="Owner">Owner (Full Admin Access)</option>
                  <option value="Estimator">Estimator (Schedules & Quotes)</option>
                  <option value="Crew Leader">Crew Leader (Dispatch & QA checklist)</option>
                  <option value="Painter">Painter (GPS Clock-In only)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Send Invitation Email
              </button>
            </form>
          </div>

          {/* Members list */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-base text-left">Active Painting Staff Registry</h3>
              
              <div className="space-y-3.5 max-h-80 overflow-y-auto text-left">
                {team.map((member) => (
                  <div key={member.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">{member.name}</h4>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          member.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                        }`}>{member.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{member.email} • {member.role}</p>
                    </div>

                    {member.role !== "Owner" && (
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-500 hover:text-red-400"
                        title="Remove member"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* DATABASE RESET ADMIN TAB */}
      {activeTab === "db" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4 max-w-xl mx-auto" id="settings-db">
          <h3 className="font-extrabold text-white text-base">System Sandboxed Database Control</h3>
          <p className="text-xs text-slate-400">Restore or completely clear all client leads, quote estimations, dispatch crew records and financial invoices back to default benchmark values.</p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
            <span className="text-orange-400 font-mono font-bold block">✓ LOCAL SANDBOX RECOVERY READY</span>
            <p className="text-slate-400 leading-normal font-sans">Clicking the reset button immediately overwrites your current local React states with the full pre-populated contractor mock data.</p>
          </div>

          <button 
            onClick={() => {
              try {
                localStorage.clear();
              } catch (e) {
                console.warn("Storage clear blocked:", e);
              }
              window.location.reload();
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10"
          >
            <Database className="h-4 w-4" />
            <span>Reset Database Mock Data</span>
          </button>
        </div>
      )}

    </div>
  );
}
