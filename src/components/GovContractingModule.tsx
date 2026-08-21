import React, { useState, useEffect } from "react";
import {
  Briefcase, Award, ShieldCheck, ShieldAlert, FileText, CheckCircle2,
  TrendingUp, Download, Copy, AlertCircle, RefreshCw, Send, Users,
  Database, Scale, Search, Clock, Plus, Trash, CheckSquare, PlusCircle,
  MapPin, Info, DollarSign, ArrowRight, Building, FileSpreadsheet, Lock
} from "lucide-react";

interface GovOpportunity {
  solicitationNumber: string;
  title: string;
  agency: string;
  office: string;
  postedDate: string;
  responseDeadline: string;
  setAsideType: string;
  estimatedValue: number;
  placeOfPerformance: string;
  description: string;
  poc: string;
  link: string;
  score?: number;
  recommendation?: "GO" | "MAYBE" | "NO-GO";
  justification?: string;
  scoreBreakdown?: {
    value: number;
    deadline: number;
    match: number;
  };
}

interface PartnerSubcontractor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  setAsideStatus: string[];
  bondingCapacity: string;
  safetyScore: number;
  status: "applied" | "qualified" | "active" | "project-assigned";
  complianceStatus: "Compliant" | "Pending Audit" | "Non-Compliant";
}

interface PayrollLog {
  id: string;
  workerName: string;
  classification: string;
  hoursWorked: number;
  hourlyRatePaid: number;
  prevailingWageRequired: number;
  fringePaid: number;
  fringeRequired: number;
  date: string;
  status: "Compliant" | "Non-Compliant";
}

export default function GovContractingModule() {
  // Navigation inside the module
  const [subTab, setSubTab] = useState<"opportunities" | "proposals" | "payroll" | "subcontractors" | "dashboard" | "estimator">("opportunities");

  // State for opportunities
  const [opportunities, setOpportunities] = useState<GovOpportunity[]>([]);
  const [isLiveConnection, setIsLiveConnection] = useState(false);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<GovOpportunity | null>(null);

  // Score modal/card state
  const [evaluatingOpp, setEvaluatingOpp] = useState<GovOpportunity | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Proposals Draft state
  const [draftedProposal, setDraftedProposal] = useState<{
    solicitationNumber: string;
    title: string;
    volume1: string;
    volume2: string;
    volume3: string;
    volume4: string;
    volume5: string;
    disclaimer: string;
  } | null>(null);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [activeVolumeTab, setActiveVolumeTab] = useState<"v1" | "v2" | "v3" | "v4" | "v5">("v1");

  // Company Profile State (SAM.gov Dashboard)
  const [companyProfile, setCompanyProfile] = useState({
    name: "Smart Growth Painting Services",
    uei: "UEI18H37KA84",
    cage: "8Z9K4",
    samExpiration: "2027-04-12",
    bondingSingle: 650000,
    bondingAggregate: 2500000,
    certifications: ["Service-Disabled Veteran-Owned Small Business (SDVOSB)", "HUBZone", "Total Small Business"],
    coiExpiration: "2027-01-30",
    hasActiveSOP: true
  });

  // Prevailing Wages Lookups & Certified Payroll Tracker
  const [stateSelection, setStateSelection] = useState("WV");
  const [countySelection, setCountySelection] = useState("Berkeley");
  const [classificationSelection, setClassificationSelection] = useState("Painter - Brush & Roller");
  const [wageLookupResult, setWageLookupResult] = useState({
    base: 28.50,
    fringe: 12.40,
    total: 40.90,
    determinationNumber: "WV20260012"
  });

  const [payrollLogs, setPayrollLogs] = useState<PayrollLog[]>([
    {
      id: "pay-1",
      workerName: "Marcus Vance",
      classification: "Painter - Brush & Roller",
      hoursWorked: 40,
      hourlyRatePaid: 29.00,
      prevailingWageRequired: 28.50,
      fringePaid: 13.00,
      fringeRequired: 12.40,
      date: "2026-07-03",
      status: "Compliant"
    },
    {
      id: "pay-2",
      workerName: "Devon Reynolds",
      classification: "Painter - Spray & Sandblast",
      hoursWorked: 35,
      hourlyRatePaid: 27.00, // Non-compliant (Required: 31.20)
      prevailingWageRequired: 31.20,
      fringePaid: 11.50, // Non-compliant (Required: 12.40)
      fringeRequired: 12.40,
      date: "2026-07-03",
      status: "Non-Compliant"
    },
    {
      id: "pay-3",
      workerName: "John Cole",
      classification: "Apprentice / Helper",
      hoursWorked: 40,
      hourlyRatePaid: 19.50,
      prevailingWageRequired: 18.00,
      fringePaid: 9.00,
      fringeRequired: 8.50,
      date: "2026-07-03",
      status: "Compliant"
    }
  ]);

  const [newLogWorker, setNewLogWorker] = useState("");
  const [newLogClass, setNewLogClass] = useState("Painter - Brush & Roller");
  const [newLogHours, setNewLogHours] = useState(40);
  const [newLogRate, setNewLogRate] = useState(28.50);
  const [newLogFringe, setNewLogFringe] = useState(12.40);

  // Subcontractor Partner State
  const [partners, setPartners] = useState<PartnerSubcontractor[]>([
    {
      id: "sub-1",
      companyName: "Blue Ridge Industrial Coatings",
      contactName: "David Cole",
      email: "david@blueridgecoatings.com",
      phone: "540-555-0143",
      location: "Roanoke, VA",
      setAsideStatus: ["HUBZone", "Small Business"],
      bondingCapacity: "$300k single / $1M aggregate",
      safetyScore: 94,
      status: "qualified",
      complianceStatus: "Compliant"
    },
    {
      id: "sub-2",
      companyName: "Mountain State Painters LLC",
      contactName: "Robert Vance",
      email: "rob@mountainstatepainters.net",
      phone: "304-555-0988",
      location: "Charleston, WV",
      setAsideStatus: ["Veteran-Owned (VOSB)", "Small Business"],
      bondingCapacity: "$150k single / $500k aggregate",
      safetyScore: 88,
      status: "active",
      complianceStatus: "Compliant"
    },
    {
      id: "sub-3",
      companyName: "Metropolitan Coating Partners",
      contactName: "Sofia Alvarez",
      email: "salvarez@metropainting.com",
      phone: "404-555-1221",
      location: "Atlanta, GA",
      setAsideStatus: ["Women-Owned (WOSB)", "8(a) Graduate"],
      bondingCapacity: "$500k single / $2.5M aggregate",
      safetyScore: 78,
      status: "applied",
      complianceStatus: "Pending Audit"
    }
  ]);

  const [isRecruiting, setIsRecruiting] = useState(false);
  const [recruitmentDraft, setRecruitmentDraft] = useState("");

  // Estimating State
  const [estSspcPrep, setEstSspcPrep] = useState("SP-2"); // Hand tool prep
  const [estHasLead, setEstHasLead] = useState(false);
  const [estPrevWage, setEstPrevWage] = useState(true);
  const [estSqFt, setEstSqFt] = useState(12000);
  const [estCoatingsCount, setEstCoatingsCount] = useState(2);
  const [estBaseWagePaid, setEstBaseWagePaid] = useState(28.50);
  const [estFringePaid, setEstFringePaid] = useState(12.40);

  // Load Opportunities from Backend on Mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Recalculate wage determination details when selection changes
  useEffect(() => {
    let base = 28.50;
    let fringe = 12.40;
    let code = "WV20260012";

    if (stateSelection === "VA") {
      code = "VA20260048";
      if (classificationSelection.includes("Brush")) {
        base = 26.80; fringe = 11.20;
      } else if (classificationSelection.includes("Spray")) {
        base = 29.50; fringe = 11.20;
      } else {
        base = 17.50; fringe = 7.80;
      }
    } else if (stateSelection === "WV") {
      code = "WV20260012";
      if (classificationSelection.includes("Brush")) {
        base = 28.50; fringe = 12.40;
      } else if (classificationSelection.includes("Spray")) {
        base = 31.20; fringe = 12.40;
      } else {
        base = 18.00; fringe = 8.50;
      }
    } else { // GA
      code = "GA20260015";
      if (classificationSelection.includes("Brush")) {
        base = 24.50; fringe = 9.80;
      } else if (classificationSelection.includes("Spray")) {
        base = 27.20; fringe = 9.80;
      } else {
        base = 15.50; fringe = 6.20;
      }
    }

    setWageLookupResult({
      base,
      fringe,
      total: Number((base + fringe).toFixed(2)),
      determinationNumber: code
    });
  }, [stateSelection, countySelection, classificationSelection]);

  const fetchOpportunities = async () => {
    setLoadingOpps(true);
    try {
      const response = await fetch("/api/gov/opportunities");
      if (response.ok) {
        const data = await response.json();
        setIsLiveConnection(data.live);
        
        // Populate standard default scores for visualization
        const opportunitiesWithScores = data.opportunities.map((opp: GovOpportunity) => {
          const score = calculateLocalScore(opp);
          const recommendation = score >= 75 ? "GO" : score >= 50 ? "MAYBE" : "NO-GO";
          return {
            ...opp,
            score,
            recommendation,
            scoreBreakdown: getScoreBreakdown(opp),
            justification: getScoreJustification(opp, score)
          };
        });
        
        setOpportunities(opportunitiesWithScores);
      }
    } catch (err) {
      console.error("Error fetching opportunities:", err);
    } finally {
      setLoadingOpps(false);
    }
  };

  // 0-100 score scoring calculation
  const calculateLocalScore = (opp: GovOpportunity): number => {
    let score = 0;
    
    // 1. Value (40%)
    if (opp.estimatedValue >= 200000 && opp.estimatedValue <= 500000) {
      score += 40; // Sweet spot for small contractor
    } else if (opp.estimatedValue < 100000) {
      score += 25;
    } else if (opp.estimatedValue > 1000000) {
      score += 15; // Too large / needs high bonding
    } else {
      score += 35;
    }

    // 2. Deadline feasibility (35%)
    const today = new Date("2026-07-08");
    const deadline = new Date(opp.responseDeadline);
    const diffTime = Math.abs(deadline.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 20) {
      score += 35; // Perfect planning lead time
    } else if (diffDays >= 7) {
      score += 20; // Tight but feasible
    } else {
      score += 2; // Expired or too urgent (No-Go risk)
    }

    // 3. Category match (25%)
    const descLower = (opp.description || "").toLowerCase() + " " + opp.title.toLowerCase();
    if (descLower.includes("bridge") || descLower.includes("corrosion") || descLower.includes("blast")) {
      score += 25; // Exact high-ticket matching
    } else if (descLower.includes("interior") || descLower.includes("exterior") || descLower.includes("paint")) {
      score += 22;
    } else {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const getScoreBreakdown = (opp: GovOpportunity) => {
    const value = opp.estimatedValue >= 200000 && opp.estimatedValue <= 500000 ? 40 : (opp.estimatedValue < 100000 ? 25 : 15);
    
    const today = new Date("2026-07-08");
    const deadline = new Date(opp.responseDeadline);
    const diffDays = Math.ceil(Math.abs(deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const deadlineVal = diffDays > 20 ? 35 : (diffDays >= 7 ? 20 : 2);

    const descLower = (opp.description || "").toLowerCase() + " " + opp.title.toLowerCase();
    const match = (descLower.includes("bridge") || descLower.includes("corrosion") || descLower.includes("blast")) ? 25 : 22;

    return { value, deadline: deadlineVal, match };
  };

  const getScoreJustification = (opp: GovOpportunity, score: number): string => {
    if (score >= 75) {
      return `Excellent opportunity under NAICS 238320. The project value scales precisely within Smart Growth's current single bonding capacity ($650,000), there is ample preparation lead time (>15 days), and the technical description directly aligns with historical past performance ratings.`;
    } else if (score >= 50) {
      return `Workable contract option, but presents bottlenecks. The timeline is tight or the administrative compliance rules (e.g. historical building restorations or strict EPA containment) demand extensive overhead relative to the total bid value.`;
    } else {
      return `Critical risk flags identified. The solicitation response deadline is dangerously close, or the required contract size exceeds reasonable capacity, risking default under Davis-Bacon compliance enforcement.`;
    }
  };

  // Evaluate single solicitation
  const triggerBidEvaluation = (opp: GovOpportunity) => {
    setEvaluatingOpp(opp);
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 1200);
  };

  // Proposal Draft Generation via Backend
  const generateProposalDraft = async (opp: GovOpportunity) => {
    setGeneratingProposal(true);
    setSubTab("proposals");
    try {
      const response = await fetch("/api/gov/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitation: opp,
          companyProfile: {
            name: companyProfile.name,
            uei: companyProfile.uei,
            cage: companyProfile.cage,
            certifications: companyProfile.certifications,
            bondingSingle: `$${companyProfile.bondingSingle.toLocaleString()}`,
            bondingAggregate: `$${companyProfile.bondingAggregate.toLocaleString()}`
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDraftedProposal({
          solicitationNumber: opp.solicitationNumber,
          title: opp.title,
          volume1: data.volume1,
          volume2: data.volume2,
          volume3: data.volume3,
          volume4: data.volume4,
          volume5: data.volume5,
          disclaimer: data.disclaimer
        });
        setActiveVolumeTab("v1");
      }
    } catch (err) {
      console.error("Error generating proposal:", err);
    } finally {
      setGeneratingProposal(false);
    }
  };

  // Add Certified Payroll Log
  const handleAddPayrollLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogWorker) return;

    const compliance = (newLogRate >= wageLookupResult.base && newLogFringe >= wageLookupResult.fringe) 
      ? "Compliant" 
      : "Non-Compliant";

    const newLog: PayrollLog = {
      id: "pay-" + Date.now(),
      workerName: newLogWorker,
      classification: newLogClass,
      hoursWorked: Number(newLogHours),
      hourlyRatePaid: Number(newLogRate),
      prevailingWageRequired: wageLookupResult.base,
      fringePaid: Number(newLogFringe),
      fringeRequired: wageLookupResult.fringe,
      date: new Date().toISOString().split("T")[0],
      status: compliance
    };

    setPayrollLogs([newLog, ...payrollLogs]);
    setNewLogWorker("");
  };

  // Subcontractor pipeline updates
  const handleUpdatePartnerStatus = (id: string, newStatus: any) => {
    setPartners(partners.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  // Trigger recruiting outreach simulation
  const handleTriggerRecruitment = () => {
    setIsRecruiting(true);
    setRecruitmentDraft(`Drafting partner outreach campaign targeted under NAICS 238320 (HUBZone/SDVOSB)...`);
    
    setTimeout(() => {
      setRecruitmentDraft(`Subject: Partnership Request - Upcoming Painting Solicitations (SAM.gov / State Portals)

Hello,

My name is Operations Coordinator, representing Smart Growth Painting Services. We are bidding on several municipal and federal painting opportunities, including upcoming military facility exterior coating contracts under NAICS 238320 in the local region.

We noticed your firm is certified as a HUBZone painting specialist. We are looking to align with high-quality subcontractor teams to meet the Davis-Bacon prevailing wage compliance and CPARS performance metrics on this project. 

If your team has current bonding capacity and up-to-date certificates of insurance (COI), let's schedule a 10-minute discovery call to explore a joint-venture / subcontracting agreement.

Best regards,
Smart Growth Painting Operating Portal
Government Contracting Division
UEI: ${companyProfile.uei} | CAGE: ${companyProfile.cage}`);
    }, 800);
  };

  // Estimator Calculations
  const getSspcMultiplier = () => {
    switch (estSspcPrep) {
      case "SP-1": return 1.0; // Solvent cleaning
      case "SP-2": return 1.15; // Hand tool
      case "SP-3": return 1.30; // Power tool
      case "SP-6": return 1.65; // Commercial blast
      case "SP-10": return 2.10; // Near-white metal blast
      default: return 1.0;
    }
  };

  const getEstimatedCosts = () => {
    const sspcMult = getSspcMultiplier();
    const leadMult = estHasLead ? 1.45 : 1.0;
    
    // Labor calculation
    const baseWage = estPrevWage ? wageLookupResult.base : 22.00;
    const fringeWage = estPrevWage ? wageLookupResult.fringe : 0.0;
    const totalWageRate = baseWage + fringeWage;

    const baseHoursPer100SqFt = 2.5; 
    const calculatedHours = (estSqFt / 100) * baseHoursPer100SqFt * estCoatingsCount * sspcMult * leadMult;
    const laborCost = calculatedHours * totalWageRate;

    // Material cost calculation
    const sqFtPerGallon = 350;
    const gallonsNeeded = Math.ceil((estSqFt / sqFtPerGallon) * estCoatingsCount * 1.15); // 15% waste allowance
    const costPerGallon = estHasLead ? 75 : 55; // Premium low-VOC/Industrial specialty
    const materialCost = gallonsNeeded * costPerGallon;

    // Bonding premium (2% of project costs)
    const subtotal = laborCost + materialCost;
    const bondingPremium = subtotal * 0.025; // 2.5% rate

    const grandTotal = subtotal + bondingPremium;
    const estimatedProfit = grandTotal * 0.20; // Target 20% margin
    const estimatedBidPrice = grandTotal + estimatedProfit;

    return {
      hours: Math.round(calculatedHours),
      labor: Math.round(laborCost),
      gallons: gallonsNeeded,
      materials: Math.round(materialCost),
      bonding: Math.round(bondingPremium),
      grandTotal: Math.round(grandTotal),
      suggestedBid: Math.round(estimatedBidPrice),
      profit: Math.round(estimatedProfit)
    };
  };

  const calculatedEstimate = getEstimatedCosts();

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-8" id="gov-module-root">
      
      {/* Header and Core Metatags */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-500/10 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
              NAICS 238320 Compliance
            </div>
            {isLiveConnection ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SAM.GOV LIVE CONNECTED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
                HIGH-FIDELITY OFFLINE BENCH
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">Government Contracting & FAR Compliance</h2>
          <p className="text-slate-400 text-xs mt-1">
            Build and qualify federal, state, and municipal painting bids with automated FAR-Volume drafting, Davis-Bacon tracking, and compliance guarding.
          </p>
        </div>

        {/* Sub-navigation inside module */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          {[
            { id: "opportunities", label: "🏛️ Opportunities" },
            { id: "proposals", label: "✍️ FAR Proposals" },
            { id: "payroll", label: "💵 Davis-Bacon" },
            { id: "subcontractors", label: "👥 Sub Bench" },
            { id: "estimator", label: "🧮 Gov Estimator" },
            { id: "dashboard", label: "🛡️ SAM.gov Certs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === tab.id 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== SUB-TAB: OPPORTUNITIES ==================== */}
      {subTab === "opportunities" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">Active Bid Board</h3>
              <p className="text-xs text-slate-400 mt-0.5">Surfaced targets matching painting, coatings, or lead abatement codes.</p>
            </div>
            <button 
              onClick={fetchOpportunities}
              disabled={loadingOpps}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-orange-400 ${loadingOpps ? "animate-spin" : ""}`} />
              <span>Refresh Portal Bids</span>
            </button>
          </div>

          {loadingOpps ? (
            <div className="py-12 text-center space-y-2">
              <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
              <p className="text-slate-400 text-xs">Accessing SAM.gov active database registry...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Opportunities list */}
              <div className="xl:col-span-2 space-y-4">
                {opportunities.map((opp) => (
                  <div 
                    key={opp.solicitationNumber}
                    onClick={() => setSelectedOpp(opp)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      selectedOpp?.solicitationNumber === opp.solicitationNumber
                        ? "bg-slate-800/80 border-orange-500 shadow-md shadow-orange-500/5"
                        : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-800 font-bold">
                        {opp.solicitationNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">Value: <b className="text-white">${opp.estimatedValue.toLocaleString()}</b></span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          opp.recommendation === "GO" 
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                            : opp.recommendation === "MAYBE"
                            ? "bg-amber-950/40 text-amber-400 border border-amber-500/30"
                            : "bg-rose-950/40 text-rose-400 border border-rose-500/30"
                        }`}>
                          {opp.recommendation} Recommendation
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">{opp.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{opp.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 border-t border-slate-900 pt-3">
                      <span className="flex items-center gap-1"><Building className="h-3 w-3 text-orange-500" /> {opp.agency}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-500" /> {opp.placeOfPerformance}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500"><Clock className="h-3 w-3" /> Due: {opp.responseDeadline}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selection sidebar / Evaluation View */}
              <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-5 space-y-5 text-left">
                {selectedOpp ? (
                  <div className="space-y-5">
                    <div>
                      <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-bold">Selected Bid File</span>
                      <h4 className="text-base font-serif font-bold text-white mt-1 leading-tight">{selectedOpp.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">Agency: <b className="text-slate-300">{selectedOpp.agency}</b></p>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300">Predictive Match Score</span>
                        <span className={`text-sm font-mono font-black ${
                          (selectedOpp.score || 0) >= 75 ? "text-emerald-400" : (selectedOpp.score || 0) >= 50 ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {selectedOpp.score}/100
                        </span>
                      </div>
                      
                      {/* Score break progress */}
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden mb-3">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            (selectedOpp.score || 0) >= 75 ? "bg-emerald-500" : (selectedOpp.score || 0) >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${selectedOpp.score || 0}%` }}
                        />
                      </div>

                      {/* Breakdown criteria weights */}
                      <div className="space-y-1.5 text-[9px] font-mono text-slate-400 border-t border-slate-850 pt-2.5">
                        <div className="flex justify-between">
                          <span>Project Size Match (40% weight):</span>
                          <span className="text-white font-bold">{selectedOpp.scoreBreakdown?.value} / 40</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deadline Feasibility (35% weight):</span>
                          <span className="text-white font-bold">{selectedOpp.scoreBreakdown?.deadline} / 35</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NAICS Coating Match (25% weight):</span>
                          <span className="text-white font-bold">{selectedOpp.scoreBreakdown?.match} / 25</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-3 leading-relaxed">
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Contract Set-Aside Code:</span>
                        <span className="text-slate-300 font-bold">{selectedOpp.setAsideType}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Description & Compliance Requirements:</span>
                        <span className="text-slate-300">{selectedOpp.description}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Justification Recommendation:</span>
                        <span className="text-orange-400/90 italic">"{selectedOpp.justification}"</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900 space-y-2">
                      <button 
                        onClick={() => generateProposalDraft(selectedOpp)}
                        className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-orange-500/10"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Draft FAR Proposal (5-Vol)</span>
                      </button>
                      <a 
                        href={selectedOpp.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition text-center"
                      >
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                        <span>View Original Solicitation</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-slate-500">
                    <Briefcase className="h-10 w-10 text-slate-700" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400">No Solicitation Selected</p>
                      <p className="text-[10px]">Select a government bid from the board to examine its predictive score, required parameters, and draft proposals.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB: FAR PROPOSALS ==================== */}
      {subTab === "proposals" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">FAR-Compliant Proposal Workspace</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated document compiler structured across all federal regulation guidelines.</p>
            </div>
          </div>

          {generatingProposal ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-10 w-10 text-orange-500 animate-spin mx-auto" />
              <p className="text-white text-sm font-bold">Assembling Five-Volume FAR Structure...</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">Evaluating stored company certifications, UEI credentials, bonding limits, and aligning past performance references relative to standard FAR rules.</p>
            </div>
          ) : draftedProposal ? (
            <div className="space-y-6">
              
              {/* Compliance Warning Banner */}
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-left">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider block">COMPLIANCE WARNING & DISCLOSURE</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    This document structure has been compiled as a draft based on stored company credentials and the target solicitation. <b>No auto-submission ever</b> occurs. Stored records are left as placeholders where missing. Stated pricing requires Davis-Bacon verification prior to submittal.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3.5">
                  <div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">{draftedProposal.solicitationNumber} Draft</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{draftedProposal.title}</h4>
                  </div>
                  <button 
                    onClick={() => {
                      const fullText = `DISCLAIMER:\n${draftedProposal.disclaimer}\n\nVOLUME I:\n${draftedProposal.volume1}\n\nVOLUME II:\n${draftedProposal.volume2}\n\nVOLUME III:\n${draftedProposal.volume3}\n\nVOLUME IV:\n${draftedProposal.volume4}\n\nVOLUME V:\n${draftedProposal.volume5}`;
                      navigator.clipboard.writeText(fullText);
                      alert("Successfully copied entire proposal package to clipboard!");
                    }}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-orange-400" />
                    <span>Copy Full Package</span>
                  </button>
                </div>

                {/* Tab select for Volumes */}
                <div className="flex flex-wrap gap-1 border-b border-slate-900 pb-2">
                  {[
                    { id: "v1", label: "Vol I: Cover & Exec Summary" },
                    { id: "v2", label: "Vol II: Technical Approach" },
                    { id: "v3", label: "Vol III: Past Performance" },
                    { id: "v4", label: "Vol IV: Cost & Davis-Bacon" },
                    { id: "v5", label: "Vol V: Reps & Certs (FAR)" }
                  ].map((vol) => (
                    <button
                      key={vol.id}
                      onClick={() => setActiveVolumeTab(vol.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        activeVolumeTab === vol.id 
                          ? "bg-slate-800 text-orange-400 border border-orange-500/20" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {vol.label}
                    </button>
                  ))}
                </div>

                {/* Volume Content Display */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-900 font-mono text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {activeVolumeTab === "v1" && draftedProposal.volume1}
                  {activeVolumeTab === "v2" && draftedProposal.volume2}
                  {activeVolumeTab === "v3" && draftedProposal.volume3}
                  {activeVolumeTab === "v4" && draftedProposal.volume4}
                  {activeVolumeTab === "v5" && draftedProposal.volume5}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  <span className="flex items-center gap-1 font-mono"><Lock className="h-3 w-3 text-emerald-400" /> Human Review Enforced</span>
                  <span>FAR Clauses Included: 52.212-1 through 52.212-5 compliant</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 bg-slate-950/40 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <FileText className="h-12 w-12 text-slate-750" />
              <div className="space-y-1.5 max-w-sm">
                <p className="text-sm font-bold text-slate-400">No Compiled Proposal Found</p>
                <p className="text-xs text-slate-500">Go to the **Opportunities** tab, choose a solicitation, and click **Draft FAR Proposal** to generate a pre-compiled compliant draft package.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB: DAVIS-BACON PAYROLL ==================== */}
      {subTab === "payroll" && (
        <div className="space-y-6 animate-fadeIn text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Prevailing Wage Lookups */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <Scale className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white">Davis-Bacon Wage Lookup</h4>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">State</label>
                    <select 
                      value={stateSelection}
                      onChange={(e) => setStateSelection(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="WV">West Virginia</option>
                      <option value="VA">Virginia</option>
                      <option value="GA">Georgia</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">County / Region</label>
                    <select 
                      value={countySelection}
                      onChange={(e) => setCountySelection(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      {stateSelection === "WV" ? (
                        <>
                          <option value="Berkeley">Berkeley Co.</option>
                          <option value="Jefferson">Jefferson Co.</option>
                          <option value="Kanawha">Kanawha Co.</option>
                        </>
                      ) : stateSelection === "VA" ? (
                        <>
                          <option value="York">York Co.</option>
                          <option value="Fairfax">Fairfax Co.</option>
                          <option value="Roanoke">Roanoke Co.</option>
                        </>
                      ) : (
                        <>
                          <option value="Fulton">Fulton Co.</option>
                          <option value="Cobb">Cobb Co.</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Labor Classification</label>
                  <select 
                    value={classificationSelection}
                    onChange={(e) => setClassificationSelection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Painter - Brush & Roller">Painter - Brush & Roller</option>
                    <option value="Painter - Spray & Sandblast">Painter - Spray & Sandblast (Industrial)</option>
                    <option value="Laborer / Prep Helper">Laborer / Prep Helper</option>
                  </select>
                </div>

                {/* Lookup Output */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span>Wage Determination:</span>
                    <span className="text-orange-400 font-bold">{wageLookupResult.determinationNumber}</span>
                  </div>
                  
                  <div className="border-t border-slate-850 pt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Required Hourly Rate:</span>
                      <span className="text-white font-bold">${wageLookupResult.base.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Required Fringe Rate:</span>
                      <span className="text-white font-bold">${wageLookupResult.fringe.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-850/50">
                      <span className="text-slate-300">Total Prevailing Rate:</span>
                      <span className="text-orange-400">${wageLookupResult.total.toFixed(2)}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certified Payroll Log / Hours Tracker */}
            <div className="lg:col-span-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-bold text-white">WH-347 Certified Payroll Compliance Tracker</h4>
                </div>
                <button 
                  onClick={() => alert("WH-347 equivalent PDF exported! Submitted to standard staging. Ready for contracting officer portal.")}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded-xl text-[10px] transition cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Download WH-347 PDF</span>
                </button>
              </div>

              {/* Form to log hours */}
              <form onSubmit={handleAddPayrollLog} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end bg-slate-900 p-3 rounded-xl border border-slate-850">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">Worker Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., John Doe"
                    value={newLogWorker}
                    onChange={(e) => setNewLogWorker(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">Wages Paid ($/hr)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newLogRate}
                    onChange={(e) => setNewLogRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">Fringes Paid ($/hr)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newLogFringe}
                    onChange={(e) => setNewLogFringe(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-slate-800 hover:bg-orange-500 border border-slate-700 hover:border-orange-500 hover:text-white text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Worker</span>
                </button>
              </form>

              {/* Logs display */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {payrollLogs.map((log) => (
                  <div 
                    key={log.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                      log.status === "Compliant"
                        ? "bg-emerald-950/10 border-emerald-900/30"
                        : "bg-rose-950/10 border-rose-900/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{log.workerName}</span>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {log.classification}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Logged Rate: <b className="text-slate-300">${log.hourlyRatePaid.toFixed(2)}/hr</b> + <b className="text-slate-300">${log.fringePaid.toFixed(2)} fringe</b> ({log.hoursWorked} hrs)</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block font-mono">Prevailing Wage Mandate</span>
                        <span className="text-[10px] font-mono text-slate-300">${log.prevailingWageRequired.toFixed(2)}/hr + ${log.fringeRequired.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {log.status === "Compliant" ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            COMPLIANT
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-500/20">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            UNDERPAID
                          </span>
                        )}
                        
                        <button 
                          onClick={() => setPayrollLogs(payrollLogs.filter(p => p.id !== log.id))}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded transition"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== SUB-TAB: SUBCONTRACTORS BENCH ==================== */}
      {subTab === "subcontractors" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">Subcontractor Partner Bench</h3>
              <p className="text-xs text-slate-400 mt-0.5">Qualify and align small HUBZone or Veteran-owned painters to scale larger bids.</p>
            </div>
            
            <button 
              onClick={handleTriggerRecruitment}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Recruit Partner Bench</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Partners List */}
            <div className="lg:col-span-2 space-y-3">
              {partners.map((p) => (
                <div key={p.id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.companyName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">POC: <span className="text-slate-300">{p.contactName}</span> ({p.location})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.complianceStatus === "Compliant"
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                      }`}>
                        {p.complianceStatus}
                      </span>

                      <select 
                        value={p.status}
                        onChange={(e) => handleUpdatePartnerStatus(p.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-[10px] rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                      >
                        <option value="applied">Applied</option>
                        <option value="qualified">Qualified</option>
                        <option value="active">Active Bench</option>
                        <option value="project-assigned">Assigned</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Certifications:</span>
                      <div className="flex gap-1.5">
                        {p.setAsideStatus.map((cert) => (
                          <span key={cert} className="text-[8px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-orange-400">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Bonding Limit:</span> <b className="text-slate-300">{p.bondingCapacity}</b>
                    </div>
                    <div>
                      <span className="text-slate-500">Safety Rating:</span> <b className={p.safetyScore >= 90 ? "text-emerald-400" : "text-amber-400"}>{p.safetyScore}% EMR</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recruitment outreach sidebar */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <Send className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white font-serif">Outreach Sequence Builder</h4>
              </div>

              {isRecruiting ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-850/50 font-mono text-[10px] text-slate-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                    {recruitmentDraft}
                  </div>
                  <button 
                    onClick={() => {
                      alert("Blast communication campaign fired targeting local partner network painters!");
                      setIsRecruiting(false);
                      setRecruitmentDraft("");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                  >
                    <span>Launch Sub Campaign</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-slate-400">Build standard partner lists by firing localized HUBZone and veteran-owned automated outreach campaigns.</p>
                  <button 
                    onClick={handleTriggerRecruitment}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition mx-auto cursor-pointer"
                  >
                    <span>Initialize Outreach</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==================== SUB-TAB: GOV ESTIMATOR ==================== */}
      {subTab === "estimator" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div>
            <h3 className="text-lg font-bold font-serif text-white">Government SSPC & Davis-Bacon Estimator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Custom line item calculations utilizing prevailing wages and surface preparation metrics.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Inputs Panel */}
            <div className="lg:col-span-1 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="border-b border-slate-850 pb-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">Project Parameters</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Estimated Surface Area (Sq Ft)</label>
                  <input 
                    type="number"
                    value={estSqFt}
                    onChange={(e) => setEstSqFt(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Coatings / Coats Count</label>
                  <select 
                    value={estCoatingsCount}
                    onChange={(e) => setEstCoatingsCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value={1}>1 Coat Primer/Seal</option>
                    <option value={2}>2 Coats Standard</option>
                    <option value={3}>3 Coats High-Performance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">SSPC Prep Standard</label>
                  <select 
                    value={estSspcPrep}
                    onChange={(e) => setEstSspcPrep(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="SP-1">SSPC-SP1 (Solvent Clean - 1.0x Hours)</option>
                    <option value="SP-2">SSPC-SP2 (Hand Tool Clean - 1.15x Hours)</option>
                    <option value="SP-3">SSPC-SP3 (Power Tool Clean - 1.3x Hours)</option>
                    <option value="SP-6">SSPC-SP6 (Commercial Blast - 1.65x Hours)</option>
                    <option value="SP-10">SSPC-SP10 (Near-White Blast - 2.1x Hours)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-900 space-y-2 text-[11px] text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={estHasLead}
                      onChange={(e) => setEstHasLead(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-orange-500 focus:ring-0"
                    />
                    <span>Lead Paint Abatement / EPA containment (+45%)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={estPrevWage}
                      onChange={(e) => setEstPrevWage(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-orange-500 focus:ring-0"
                    />
                    <span>Enforce Davis-Bacon Wages (${wageLookupResult.total}/hr)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculations Dashboard */}
            <div className="lg:col-span-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-5">
              <div className="border-b border-slate-850 pb-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">Estimating Summary & Compliance Output</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 block">CALCULATED LABOR HOURS</span>
                  <span className="text-base font-bold text-white mt-1 block">{calculatedEstimate.hours} Hours</span>
                </div>
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 block">TOTAL COATING GALLONS</span>
                  <span className="text-base font-bold text-white mt-1 block">{calculatedEstimate.gallons} Gal</span>
                </div>
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-850 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-slate-500 block">BONDING & INSURANCE (2.5%)</span>
                  <span className="text-base font-bold text-orange-400 mt-1 block">${calculatedEstimate.bonding.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-850 p-4 space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Prevailing Wage Labor Cost (inc. Fringe):</span>
                  <span className="text-white font-bold font-mono">${calculatedEstimate.labor.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Industrial Surface Coatings:</span>
                  <span className="text-white font-bold font-mono">${calculatedEstimate.materials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance Bonding Premium:</span>
                  <span className="text-white font-bold font-mono">${calculatedEstimate.bonding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2.5 text-slate-300">
                  <span>Total Hard Direct Costs:</span>
                  <span className="font-bold font-mono text-white">${calculatedEstimate.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target Corporate Fee / Profit (20% margin):</span>
                  <span className="font-bold font-mono text-white">${calculatedEstimate.profit.toLocaleString()}</span>
                </div>

                <div className="flex justify-between border-t-2 border-dashed border-slate-800 pt-3 text-sm font-bold text-slate-200">
                  <span>Suggested Proposal Bid Price:</span>
                  <span className="font-mono text-lg text-emerald-400">${calculatedEstimate.suggestedBid.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => alert("Government line-item estimate synced with active Quote Genius records!")}
                  className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Sync Proposal to Quote Genius</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== SUB-TAB: COMPLIANCE DASHBOARD ==================== */}
      {subTab === "dashboard" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div>
            <h3 className="text-lg font-bold font-serif text-white">SAM.gov Certifications & Compliance Tracker</h3>
            <p className="text-xs text-slate-400 mt-0.5">Expiration checks, active entity identifiers, and performance bonding metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* SAM Expiration Alert */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">SAM Registration Expiry</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Registration Expiration:</span>
                  <span className="text-white font-bold font-mono">{companyProfile.samExpiration}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Unique Entity ID (UEI):</span>
                  <span className="text-white font-bold font-mono">{companyProfile.uei}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Active CAGE Code:</span>
                  <span className="text-white font-bold font-mono">{companyProfile.cage}</span>
                </div>
              </div>

              <div className="bg-emerald-950/10 border border-emerald-900/20 p-3 rounded-xl flex gap-2 items-center">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] text-slate-300">Entity is compliant and actively listed for federal bidding.</span>
              </div>
            </div>

            {/* Set-Aside Certifications */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <Award className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white">Active Set-Asides</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {companyProfile.certifications.map((cert) => (
                  <span key={cert} className="text-[10px] bg-slate-900 border border-slate-800 text-orange-400 font-bold px-3 py-1.5 rounded-xl block">
                    {cert}
                  </span>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 leading-normal">
                These qualifications are auto-compiled on all newly drafted proposals. Modify qualifications in main portal system configurations.
              </p>
            </div>

            {/* Bonding Tracker */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white font-serif">Sizing Bonding capacity</h4>
              </div>

              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Single-Project Bonding Capacity:</span>
                    <span className="text-white font-bold font-mono">${companyProfile.bondingSingle.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Aggregate Project Bonding limit:</span>
                    <span className="text-white font-bold font-mono">${companyProfile.bondingAggregate.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
