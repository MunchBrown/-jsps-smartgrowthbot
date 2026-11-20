import React from "react";
import { signOut } from "firebase/auth";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { auth } from "./lib/firebase";
import { api } from "./lib/api";
import { SessionProvider, useSession } from "./lib/session";
import type { Estimate, Lead, Project } from "./types";
import { initialLeads, initialProjects } from "./sampleData";

import MarketingPage from "./components/MarketingPage";
import { AuthScreen, VerifyEmailScreen } from "./components/live/AuthScreens";
import { OnboardingScreen, InviteScreen, ChoosePlanScreen } from "./components/live/Gates";
import { Terms, Privacy, MessagingPolicy } from "./components/live/Legal";
import { BrandMark, APP_NAME } from "./components/live/Brand";
import { Spinner, Button, ErrorText } from "./components/live/ui";
import PreviewFrame from "./components/live/PreviewFrame";
import Dashboard from "./components/live/Dashboard";
import Leads from "./components/live/Leads";
import Schedule from "./components/live/Schedule";
import Estimates from "./components/live/Estimates";
import Invoices from "./components/live/Invoices";
import Inbox from "./components/live/Inbox";
import Settings from "./components/live/Settings";
import PlatformAdmin from "./components/live/PlatformAdmin";

// Existing AI tools (live) and modules that still run on sample data (preview).
import QuoteGeniusModule from "./components/QuoteGeniusModule";
import BusinessOSModule from "./components/BusinessOSModule";
import GovContractingModule from "./components/GovContractingModule";
import LeadFlowModule from "./components/LeadFlowModule";
import ReputationModule from "./components/ReputationModule";
import AIFunnelBuilderModule from "./components/AIFunnelBuilderModule";
import ClientConnectModule from "./components/ClientConnectModule";
import AIPhoneSystemModule from "./components/AIPhoneSystemModule";
import CrewOptimizerModule from "./components/CrewOptimizerModule";
import FinanceCommandModule from "./components/FinanceCommandModule";


function useRoute() {
  const [path, setPath] = React.useState(location.pathname);
  React.useEffect(() => {
    const onPop = () => setPath(location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = React.useCallback((p: string) => {
    history.pushState(null, "", p);
    setPath(p.split("?")[0]);
    window.scrollTo(0, 0);
  }, []);
  return { path, navigate };
}

function Root() {
  const { user, me, loading, error, refresh } = useSession();
  const { path, navigate } = useRoute();

  if (path === "/terms") return <Terms onBack={() => navigate("/")} />;
  if (path === "/privacy") return <Privacy onBack={() => navigate("/")} />;
  if (path === "/messaging-policy") return <MessagingPolicy onBack={() => navigate("/")} />;

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Spinner label="Loading Smart Growth Bot…" /></div>;
  }

  if (!user) {
    if (path === "/login" || path === "/signup") {
      return <React.Fragment key={path}><AuthScreen initialMode={path === "/signup" ? "register" : "login"} onBack={() => navigate("/")} onLegal={navigate} /></React.Fragment>;
    }
    return <MarketingPage onStartTrial={() => navigate("/signup")} onLogin={() => navigate("/login")} onLegal={navigate} />;
  }

  if (!auth.currentUser?.emailVerified) {
    return <VerifyEmailScreen email={user.email || ""} onVerified={refresh} />;
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-3 text-center">
          <ErrorText>{error || "We couldn't load your account."}</ErrorText>
          <div className="flex gap-2 justify-center"><Button onClick={refresh}>Try again</Button><Button variant="ghost" onClick={() => signOut(auth)}>Sign out</Button></div>
        </div>
      </div>
    );
  }

  if (!me.org) return me.pendingInvite ? <InviteScreen /> : <OnboardingScreen />;

  if (!me.org.hasAccess) {
    const params = new URLSearchParams(location.search);
    return <ChoosePlanScreen notice={params.get("billing") === "canceled" ? "Checkout was canceled. Pick a plan whenever you're ready." : params.get("billing") === "success" ? "Payment received — your workspace will unlock in a few seconds. Refresh if it doesn't." : undefined} />;
  }

  return <Portal />;
}

type TabId =
  | "dashboard" | "leads" | "schedule" | "estimates" | "invoices" | "inbox"
  | "quotegenius" | "businessos" | "govcontract"
  | "p-leadflow" | "p-reputation" | "p-funnel" | "p-clientconnect" | "p-phone" | "p-crew" | "p-finance"
  | "settings" | "admin";

const NAV: { section: string; items: [TabId, string][]; preview?: boolean }[] = [
  { section: "Run the business", items: [["dashboard", "Dashboard"], ["leads", "Leads"], ["schedule", "Schedule"], ["estimates", "Estimates"], ["invoices", "Invoices"], ["inbox", "Calls & texts"]] },
  { section: "AI tools", items: [["quotegenius", "Quote Genius (photo estimator)"], ["businessos", "Business OS (SOPs & advisor)"]] },
  {
    section: "Preview — sample data",
    preview: true,
    items: [["govcontract", "Gov contracting"], ["p-leadflow", "Pipeline board"], ["p-reputation", "Reviews & reputation"], ["p-funnel", "Funnel builder"], ["p-clientconnect", "Unified inbox"], ["p-phone", "AI phone lab"], ["p-crew", "Crew optimizer"], ["p-finance", "Finance command"]],
  },
];

function Portal() {
  const { me } = useSession();
  const initialTab = (new URLSearchParams(location.search).get("tab") as TabId) || "dashboard";
  const [tab, setTab] = React.useState<TabId>(initialTab);
  const [focusLead, setFocusLead] = React.useState<string | undefined>();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(tab.startsWith("p-") || tab === "govcontract");

  // Quote Genius saves to the real estimates list.
  const [estimates, setEstimates] = React.useState<Estimate[]>([]);
  React.useEffect(() => {
    if (tab === "quotegenius") api<Estimate[]>("/api/estimates").then(setEstimates).catch(() => setEstimates([]));
  }, [tab]);
  // Preview modules get their own sample data so they never touch real records.
  const [sampleLeads, setSampleLeads] = React.useState<Lead[]>(initialLeads);
  const [sampleProjects, setSampleProjects] = React.useState<Project[]>(initialProjects);

  const go = (t: string, leadId?: string) => {
    setTab(t as TabId);
    if (leadId) setFocusLead(leadId);
    setMenuOpen(false);
    window.scrollTo(0, 0);
    if (location.search) history.replaceState(null, "", "/");
  };

  const sub = me?.org?.subscription;
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button className="lg:hidden text-slate-300 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <BrandMark size="sm" />
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <span className="hidden md:block text-xs text-slate-400 truncate max-w-[220px]">{me?.org?.name}</span>
          <button onClick={() => signOut(auth)} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-1.5 px-3 rounded-xl text-xs cursor-pointer">
            <LogOut className="h-3.5 w-3.5 text-orange-500" />Sign out
          </button>
        </div>
      </header>
      {sub?.status === "past_due" && (
        <div className="bg-red-500/15 border-b border-red-500/40 text-red-100 text-sm px-4 py-2 text-center">
          Your last payment failed. <button className="underline cursor-pointer" onClick={() => go("settings")}>Update billing</button> to keep your workspace active.
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <aside className={`${menuOpen ? "block" : "hidden"} lg:block w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 shrink-0`}>
          <nav className="space-y-5" aria-label="Main">
            {NAV.map((group) => (
              <div key={group.section}>
                {group.preview ? (
                  <button onClick={() => setShowPreview(!showPreview)} className="w-full flex items-center justify-between px-3 pb-1.5 text-[10px] font-bold text-slate-500 tracking-widest uppercase cursor-pointer" aria-expanded={showPreview}>
                    {group.section}<ChevronDown className={`h-3.5 w-3.5 transition ${showPreview ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-500 tracking-widest uppercase">{group.section}</p>
                )}
                {(!group.preview || showPreview) && group.items.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    aria-current={tab === id ? "page" : undefined}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${tab === id ? "bg-orange-500 text-white font-semibold" : group.preview ? "text-slate-500 hover:text-slate-200 hover:bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
            <button onClick={() => go("settings")} aria-current={tab === "settings" ? "page" : undefined} className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer ${tab === "settings" ? "bg-orange-500 text-white font-semibold" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>Settings</button>
            {me?.user.platformAdmin && (
              <button onClick={() => go("admin")} aria-current={tab === "admin" ? "page" : undefined} className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer ${tab === "admin" ? "bg-orange-500 text-white font-semibold" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>Platform admin</button>
            )}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-8">
          {tab === "dashboard" && <Dashboard go={go} />}
          {tab === "leads" && <Leads focusLeadId={focusLead} onFocusHandled={() => setFocusLead(undefined)} />}
          {tab === "schedule" && <Schedule />}
          {tab === "estimates" && <Estimates onOpenInvoices={() => go("invoices")} />}
          {tab === "invoices" && <Invoices />}
          {tab === "inbox" && <Inbox onOpenLead={(id) => go("leads", id)} />}
          {tab === "settings" && <Settings />}
          {tab === "admin" && me?.user.platformAdmin && <PlatformAdmin />}

          {tab === "quotegenius" && <QuoteGeniusModule estimates={estimates} setEstimates={setEstimates} />}
          {tab === "businessos" && <BusinessOSModule />}
          {tab === "govcontract" && <PreviewFrame name="Gov contracting"><GovContractingModule /></PreviewFrame>}

          {tab === "p-leadflow" && <PreviewFrame name="The pipeline board"><LeadFlowModule leads={sampleLeads} setLeads={setSampleLeads} /></PreviewFrame>}
          {tab === "p-reputation" && <PreviewFrame name="Reviews & reputation"><ReputationModule /></PreviewFrame>}
          {tab === "p-funnel" && <PreviewFrame name="The funnel builder"><AIFunnelBuilderModule leads={sampleLeads} setLeads={setSampleLeads} /></PreviewFrame>}
          {tab === "p-clientconnect" && <PreviewFrame name="The unified inbox"><ClientConnectModule /></PreviewFrame>}
          {tab === "p-phone" && <PreviewFrame name="The AI phone lab"><AIPhoneSystemModule leads={sampleLeads} setLeads={setSampleLeads} /></PreviewFrame>}
          {tab === "p-crew" && <PreviewFrame name="Crew optimizer"><CrewOptimizerModule projects={sampleProjects} setProjects={setSampleProjects} /></PreviewFrame>}
          {tab === "p-finance" && <PreviewFrame name="Finance command"><FinanceCommandModule /></PreviewFrame>}
        </main>
      </div>

      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-4 text-center text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 justify-center">
        <span>© {new Date().getFullYear()} {APP_NAME}</span>
        <a href="/terms" className="hover:text-slate-300">Terms</a>
        <a href="/privacy" className="hover:text-slate-300">Privacy</a>
        <a href="/messaging-policy" className="hover:text-slate-300">Messaging policy</a>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Root />
    </SessionProvider>
  );
}
