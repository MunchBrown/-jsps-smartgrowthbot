import React, { useState } from "react";
import { 
  Sparkles, Briefcase, Settings, DollarSign, Layers, Plus, Trash, Check, CheckCircle2,
  TrendingUp, Award, Send, RefreshCw, Star, Copy, FileText, UserCheck, ChevronRight,
  LogOut, Menu, X, Users, MessageSquare, Bot, Scale, ShieldAlert, ShieldCheck
} from "lucide-react";
import { Lead, Estimate, Project } from "./types";
import { initialLeads, initialEstimates, initialProjects } from "./sampleData";

// Import custom sub-modules
import MarketingPage from "./components/MarketingPage";
import AuthSystem from "./components/AuthSystem";
import MainDashboard from "./components/MainDashboard";
import LeadFlowModule from "./components/LeadFlowModule";
import QuoteGeniusModule from "./components/QuoteGeniusModule";
import ClientConnectModule from "./components/ClientConnectModule";
import CrewOptimizerModule from "./components/CrewOptimizerModule";
import FinanceCommandModule from "./components/FinanceCommandModule";
import BusinessOSModule from "./components/BusinessOSModule";
import SettingsModule from "./components/SettingsModule";
import AIPhoneSystemModule from "./components/AIPhoneSystemModule";
import GoogleConnectorsModule from "./components/GoogleConnectorsModule";
import LLMConnectorModule from "./components/LLMConnectorModule";
import AIFunnelBuilderModule from "./components/AIFunnelBuilderModule";
import GovContractingModule from "./components/GovContractingModule";
import OfflineSyncModule from "./components/OfflineSyncModule";
import CalendarModule from "./components/CalendarModule";
import ReputationModule from "./components/ReputationModule";


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to logged-in state so they can instantly interact
  const [authMode, setAuthMode] = useState<"login" | "register" | "marketing">("marketing");
  
  // Shared database collections across modules
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [estimates, setEstimates] = useState<Estimate[]>(initialEstimates);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  React.useEffect(() => {
    const fetchLiveDatabase = async () => {
      try {
        const [leadsRes, estimatesRes, projectsRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/estimates"),
          fetch("/api/projects")
        ]);
        if (leadsRes.ok) {
          const lData = await leadsRes.json();
          if (lData && Array.isArray(lData.leads)) {
            setLeads(lData.leads);
          }
        }
        if (estimatesRes.ok) {
          const eData = await estimatesRes.json();
          if (Array.isArray(eData)) {
            setEstimates(eData);
          }
        }
        if (projectsRes.ok) {
          const pData = await projectsRes.json();
          if (Array.isArray(pData)) {
            setProjects(pData);
          }
        }
      } catch (err) {
        console.error("Live database connection warning:", err);
      }
    };
    fetchLiveDatabase();
  }, []);

  // Active portal sidebar/tab selection
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Onboarding wizard completion info
  const [companyName] = useState("Smart Growth Painting");

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setAuthMode("marketing");
    setActiveTab("dashboard");
  };

  const handleStartTrial = () => {
    setAuthMode("register");
  };

  const handleLoginClick = () => {
    setAuthMode("login");
  };

  // Stitches the navigation target changes from MainDashboard quick actions
  const handleNavigateFromDashboard = (moduleName: string) => {
    if (moduleName === "leadflow") setActiveTab("leadflow");
    if (moduleName === "quotegenius") setActiveTab("quotegenius");
    if (moduleName === "clientconnect") setActiveTab("clientconnect");
    if (moduleName === "crewoptimizer") setActiveTab("crewoptimizer");
    if (moduleName === "financecommand") setActiveTab("financecommand");
    if (moduleName === "businessos") setActiveTab("businessos");
    if (moduleName === "settings") setActiveTab("settings");
  };

  const handleQuickActionFromDashboard = (actionType: string) => {
    if (actionType === "new-lead") {
      setActiveTab("leadflow");
    } else if (actionType === "new-estimate") {
      setActiveTab("quotegenius");
    } else if (actionType === "dispatch") {
      setActiveTab("crewoptimizer");
    }
  };

  // RENDER PRE-AUTHENTICATION LANDING OR AUTH FORMS
  if (!isAuthenticated) {
    if (authMode === "marketing") {
      return (
        <MarketingPage 
          onStartTrial={handleStartTrial} 
          onLogin={handleLoginClick} 
        />
      );
    }

    return (
      <AuthSystem 
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => setAuthMode("marketing")}
        initialMode={authMode === "register" ? "register" : "login"}
      />
    );
  }

  // RENDER MAIN AUTHENTICATED SaaS PORTAL CONSOLE
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400" id="portal-frame-root">
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4" id="portal-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/10 font-serif font-black text-xl">
            P
          </div>
          <div className="text-left">
            <h1 className="text-lg md:text-xl font-bold font-serif text-white tracking-tight leading-none">PaintingPro AI</h1>
            <p className="text-[9px] uppercase tracking-wider text-orange-400 font-bold font-mono mt-0.5">Enterprise Franchise Operating System</p>
          </div>
        </div>

        {/* Action badge & Signout */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">{companyName}</span>
          </div>

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-orange-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout containing Left bento sidebar & center content stage */}
      <div className="flex-1 flex flex-col lg:flex-row h-full" id="portal-body-wrapper">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 space-y-2 shrink-0">
          <div className="px-3 pb-3 hidden lg:block">
            <p className="text-[9px] font-mono font-black text-slate-500 tracking-widest uppercase">System Core Modules</p>
          </div>

          <nav className="space-y-1" id="portal-sidebar-nav">
            {[
              { id: "dashboard", label: "📊 Main Dashboard" },
              { id: "leadflow", label: "🎯 LeadFlow CRM" },
              { id: "reputation", label: "⭐ Reputation & Reviews" },
              { id: "calendar", label: "📅 Calendars & Scheduling" },
              { id: "funnelbuilder", label: "🚀 AI Funnel Builder" },
              { id: "quotegenius", label: "📋 Quote Genius" },
              { id: "govcontract", label: "🏛️ Gov Contracting" },
              { id: "clientconnect", label: "📬 Client Connect" },
              { id: "aiphone", label: "📞 AI Phone System" },
              { id: "googleconnect", label: "☁️ Google Connectors" },
              { id: "llmconnect", label: "🔌 LLM Gateway" },
              { id: "crewoptimizer", label: "👥 Crew Optimizer" },
              { id: "financecommand", label: "💵 Finance Command" },
              { id: "businessos", label: "📈 Business OS" },
              { id: "offlinesync", label: "📡 Offline & Media Sync" },
              { id: "settings", label: "⚙️ System Settings" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/15 font-black" 
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 text-white" />}
              </button>
            ))}
          </nav>

          {/* Quick status report footer in sidebar */}
          <div className="pt-6 border-t border-slate-800/60 mt-6 px-3 space-y-2 hidden lg:block">
            <span className="text-[8px] font-mono text-slate-500 block">SYSTEM STATUS REPORT</span>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>CLOUD INTEGRATION ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Primary Content Stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950" id="portal-content-viewport">
          
          {/* TAB 1: Main Dashboard */}
          {activeTab === "dashboard" && (
            <MainDashboard 
              leads={leads}
              projects={projects}
              onNavigate={handleNavigateFromDashboard}
              onQuickAction={handleQuickActionFromDashboard}
            />
          )}

          {/* TAB 2: LeadFlow CRM */}
          {activeTab === "leadflow" && (
            <LeadFlowModule 
              leads={leads}
              setLeads={setLeads}
            />
          )}

          {/* TAB 2.1: Reputation & Reviews */}
          {activeTab === "reputation" && (
            <ReputationModule />
          )}

          {/* TAB 2.2: Calendars & Appointments */}

          {activeTab === "calendar" && (
            <CalendarModule />
          )}

          {/* TAB 2.5: AI Funnel Builder */}

          {activeTab === "funnelbuilder" && (
            <AIFunnelBuilderModule 
              leads={leads}
              setLeads={setLeads}
            />
          )}

          {/* TAB 3: Quote Genius */}
          {activeTab === "quotegenius" && (
            <QuoteGeniusModule 
              estimates={estimates}
              setEstimates={setEstimates}
            />
          )}

          {/* TAB 3.5: Gov Contracting */}
          {activeTab === "govcontract" && (
            <GovContractingModule />
          )}

          {/* TAB 4: Client Connect */}
          {activeTab === "clientconnect" && (
            <ClientConnectModule />
          )}

          {/* TAB 4.5: AI Phone System */}
          {activeTab === "aiphone" && (
            <AIPhoneSystemModule leads={leads} setLeads={setLeads} />
          )}

          {/* TAB 4.6: Google Connectors */}
          {activeTab === "googleconnect" && (
            <GoogleConnectorsModule leads={leads} estimates={estimates} />
          )}

          {/* TAB 4.7: LLM Gateway Connector */}
          {activeTab === "llmconnect" && (
            <LLMConnectorModule />
          )}

          {/* TAB 5: Crew Optimizer */}
          {activeTab === "crewoptimizer" && (
            <CrewOptimizerModule 
              projects={projects}
              setProjects={setProjects}
            />
          )}

          {/* TAB 6: Finance Command */}
          {activeTab === "financecommand" && (
            <FinanceCommandModule />
          )}

          {/* TAB 7: Business OS */}
          {activeTab === "businessos" && (
            <BusinessOSModule />
          )}

          {/* TAB 7.5: Offline & Media Sync */}
          {activeTab === "offlinesync" && (
            <OfflineSyncModule />
          )}

          {/* TAB 8: Settings */}
          {activeTab === "settings" && (
            <SettingsModule />
          )}

        </main>
      </div>

      {/* Earthy Cosmic Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-center shrink-0" id="portal-footer">
        <p className="text-[10px] text-slate-500">
          © {new Date().getFullYear()} PaintingPro AI™ Franchise Edition • Secure Cloud Native Operational Workspace
        </p>
      </footer>

    </div>
  );
}
