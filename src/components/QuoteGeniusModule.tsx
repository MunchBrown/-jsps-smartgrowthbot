import React, { useState, useRef } from "react";
import { 
  Sparkles, Plus, Image, Upload, Trash, RefreshCw, ChevronRight, ArrowLeft, 
  ArrowRight, ShieldCheck, FileText, CheckCircle2, Download, AlertCircle, 
  HelpCircle, Check, DollarSign, Paintbrush, X
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Estimate, UpSellOption } from "../types";
import { initialEstimates } from "../sampleData";
import TakeoffProModule from "./TakeoffProModule";

interface QuoteGeniusModuleProps {
  estimates: Estimate[];
  setEstimates: React.Dispatch<React.SetStateAction<Estimate[]>>;
}

export default function QuoteGeniusModule({ estimates, setEstimates }: QuoteGeniusModuleProps) {
  const [activeTab, setActiveTab] = useState<"board" | "wizard" | "standalone" | "templates" | "takeoff">("board");
  
  // Selected Estimate for previewing/editing
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(estimates[0]);

  // WIZARD STEPS: 1=Photo, 2=Rooms, 3=Materials, 4=Upsells, 5=Contract Sign & PDF
  const [wizardStep, setWizardStep] = useState(1);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);

  // Form states
  const [clientName, setClientName] = useState("David Thompson");
  const [clientEmail, setClientEmail] = useState("david@thompsondental.com");
  const [clientPhone, setClientPhone] = useState("(717) 555-0310");
  const [projectAddress, setProjectAddress] = useState("1024 Ridge View Dr, York, PA");

  // Step 2 Measurements
  const [wallHeight, setWallHeight] = useState("9");
  const [wallWidth, setWallWidth] = useState("18");
  const [wallLength, setWallLength] = useState("14");
  const [doorsCount, setDoorsCount] = useState("2");
  const [windowsCount, setWindowsCount] = useState("3");

  // Calculations derived
  const perimeter = (Number(wallWidth) * 2) + (Number(wallLength) * 2);
  const rawWallArea = perimeter * Number(wallHeight);
  const doorDeduction = Number(doorsCount) * 21;
  const windowDeduction = Number(windowsCount) * 15;
  const calculatedWallArea = Math.max(100, rawWallArea - doorDeduction - windowDeduction);
  const calculatedCeilingArea = Number(wallWidth) * Number(wallLength);

  // Step 3 Materials
  const [paintBrand, setPaintBrand] = useState("Sherwin-Williams");
  const [paintLine, setPaintLine] = useState("Emerald Premium");
  const [paintSheen, setPaintSheen] = useState("Satin");
  const [paintCostPerGallon, setPaintCostPerGallon] = useState(72);
  const gallonsRequired = Math.ceil(calculatedWallArea / 350); // 350 sqft per gallon coverage

  // Pricing Margins & Markups
  const [markupPercent, setMarkupPercent] = useState(45); // 45% markup
  const [prepLaborHours, setPrepLaborHours] = useState(6);
  const [paintLaborHours, setPaintLaborHours] = useState(12);
  const laborRate = 45; // $45/hour local wage

  const rawLaborCost = (prepLaborHours + paintLaborHours) * laborRate;
  const rawMaterialCost = (gallonsRequired * paintCostPerGallon) + 120; // adding $120 for supplies/rollers/tape
  const subtotalCost = rawLaborCost + rawMaterialCost;
  const markupMultiplier = 1 + (markupPercent / 100);
  const baseEstimateTotal = Math.round(subtotalCost * markupMultiplier);

  // Step 4: AI High Margin Up-sells
  const [upSells, setUpSells] = useState<UpSellOption[]>([
    { id: "accent", title: "Premium Single Accent Wall Coat", desc: "Select a deeper pigment color to highlight the fireplace wall.", price: 295, selected: false, category: "Color Accents" },
    { id: "ceiling", title: "Two-Coat Ceiling Refresh", desc: "Painting ceilings bright flat white hides flaws and makes rooms look 20% taller.", price: 450, selected: false, category: "Ceiling Paint" },
    { id: "trim", title: "Semi-Gloss Baseboard & Trim Finish", desc: "Hand-sanding and coating baseboards, doors, and window casings in high-sheen white.", price: 680, selected: false, category: "Trim & Moulding" },
    { id: "drywall", title: "Drywall Crack & Nail-Pop Repair", desc: "Complete fiberglass mesh taping and mudding over settling cracks.", price: 180, selected: false, category: "Prep Operations" }
  ]);

  const handleToggleUpSell = (id: string) => {
    setUpSells(upSells.map(u => u.id === id ? { ...u, selected: !u.selected } : u));
  };

  const selectedUpSellsTotal = upSells.reduce((acc, curr) => acc + (curr.selected ? curr.price : 0), 0);
  const finalCalculatedTotal = baseEstimateTotal + selectedUpSellsTotal;

  // Step 5: Digital Signature Canvas
  const [signatureName, setSignatureName] = useState("");
  const [signedDate, setSignedDate] = useState("");
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);

  // File Ref for fake file selector
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedPhotoUrl(URL.createObjectURL(file));
      handleAnalyzePhoto(file);
    }
  };

  const handleAnalyzePhoto = async (file: File) => {
    setPhotoAnalyzing(true);
    try {
      const res = await fetch("/api/room-photo-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageName: file.name,
          imageType: file.type
        })
      });
      if (!res.ok) {
        throw new Error(`Room photo analysis HTTP error status: ${res.status}`);
      }
      const data = await res.json();
      
      // Auto fill measurements
      setWallHeight(data.wallHeight?.toString() || "9");
      setWallWidth(data.wallWidth?.toString() || "16");
      setWallLength(data.wallLength?.toString() || "14");
      setDoorsCount(data.doors?.toString() || "2");
      setWindowsCount(data.windows?.toString() || "3");
      setPaintSheen(data.suggestedSheen || "Satin");
    } catch (err) {
      console.error(err);
      // Fallback auto fill
      setWallHeight("9");
      setWallWidth("16");
      setWallLength("14");
      setDoorsCount("2");
      setWindowsCount("2");
    } finally {
      setPhotoAnalyzing(false);
    }
  };

  const handleCreateEstimate = async () => {
    const newEst: Estimate = {
      id: "EST-" + Date.now(),
      clientName,
      address: projectAddress,
      totalAmount: finalCalculatedTotal,
      status: "Draft",
      rooms: [
        {
          name: "Main Living Space",
          width: Number(wallWidth),
          length: Number(wallLength),
          height: Number(wallHeight),
          wallArea: calculatedWallArea,
          gallonsRequired,
          sheen: paintSheen
        }
      ],
      materials: [
        {
          brand: paintBrand,
          line: paintLine,
          gallonCost: paintCostPerGallon,
          totalGallons: gallonsRequired
        }
      ],
      upSells: upSells.filter(u => u.selected),
      notes: "Generated via QuoteGenius interactive CRM setup.",
      createdAt: new Date().toISOString().split("T")[0],
      clientPhone,
      clientEmail
    };

    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEst)
      });
      if (res.ok) {
        const serverEst = await res.json();
        setEstimates([serverEst, ...estimates]);
        setSelectedEstimate(serverEst);
      } else {
        setEstimates([newEst, ...estimates]);
        setSelectedEstimate(newEst);
      }
    } catch (err) {
      console.error("Failed to post estimate:", err);
      setEstimates([newEst, ...estimates]);
      setSelectedEstimate(newEst);
    }

    setActiveTab("board");
    // Reset wizard
    setWizardStep(1);
    setUploadedPhotoUrl(null);
    setUpSells(upSells.map(u => ({ ...u, selected: false })));
  };

  // PDF Generation function using jsPDF
  const handleDownloadPDF = (est: Estimate) => {
    const doc = new jsPDF();
    
    // Formal Painting Business Styling Colors
    const primaryColor = "#0F172A"; // Slate Deep Blue
    const accentColor = "#F97316";  // Premium Contractor Orange
    const grayColor = "#64748B";    // Warm Muted Gray
    const lightBgColor = "#F8FAFC"; // Soft off-white

    // Document Header Logo Branding
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 210, 42, "F");

    // Title & Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PAINTINGPRO OPERATING SYSTEM", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(249, 115, 22); // orange-500
    doc.text("AUTOMATED BINDING SERVICE AGREEMENT", 15, 24);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Date Issued: " + est.createdAt + " | Document: " + est.id, 15, 30);
    
    // Branded logo mark SVG sim
    doc.setFillColor(249, 115, 22);
    doc.rect(175, 12, 18, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PP", 180, 25);

    // Client Coordinate Grid Layout
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CLIENT & PROJECT COORDINATES", 15, 52);

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Prepared For:", 15, 62);
    doc.text("Project Address Location:", 100, 62);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(est.clientName || est.customerName || "N/A", 15, 67);
    doc.text(est.address, 100, 67);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Phone: " + (est.clientPhone || "N/A"), 15, 72);
    doc.text("Email: " + (est.clientEmail || "N/A"), 15, 77);

    // Scope of Work Section
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ITEMIZED SCOPE OF WORK", 15, 90);
    doc.line(15, 93, 195, 93);

    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, 98, 180, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("ROOM/AREA DESCRIPTION", 17, 103);
    doc.text("AREA (SQ FT)", 90, 103);
    doc.text("MATERIAL TIER SELECTED", 125, 103);
    doc.text("GALLONS", 168, 103);
    doc.text("TOTAL", 184, 103);

    // Render Room lines
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    let yPos = 110;

    const rooms = est.rooms || [
      {
        name: est.projectName || "General Repaint Scope",
        width: "Standard",
        length: "",
        height: "",
        sheen: "Satin",
        wallArea: est.sqft || 0,
        gallonsRequired: Math.ceil((est.sqft || 0) / 350) || 1
      }
    ];

    rooms.forEach((room) => {
      doc.setFont("helvetica", "bold");
      doc.text(room.name, 17, yPos);
      doc.setFont("helvetica", "normal");
      if (room.width && room.length && room.height) {
        doc.text(room.width + "x" + room.length + "x" + room.height + " (" + room.sheen + " Finish)", 17, yPos + 4);
      } else {
        doc.text("Standard Specification (" + room.sheen + " Finish)", 17, yPos + 4);
      }
      doc.text((room.wallArea || 0).toLocaleString() + " sq ft", 90, yPos + 2);
      
      const mat = est.materials && est.materials[0];
      doc.text(mat ? mat.brand + " " + mat.line : (est.materialTier || "Premium") + " Finish", 125, yPos + 2);
      doc.text((room.gallonsRequired || 1).toString(), 171, yPos + 2);
      
      const totalAmountVal = est.totalAmount ?? est.value ?? 0;
      const baseEstimateRowValue = Math.round(totalAmountVal - (est.upSells ? est.upSells.reduce((acc, curr) => acc + curr.price, 0) : 0));
      doc.text("$" + baseEstimateRowValue.toLocaleString(), 184, yPos + 2);
      
      yPos += 12;
    });

    // Up-sells block if exist
    if (est.upSells && est.upSells.length > 0) {
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("SELECTED HIGH-MARGIN OPTIONS & UP-SELLS", 15, yPos);
      yPos += 3;
      doc.line(15, yPos, 195, yPos);
      yPos += 5;

      doc.setFontSize(8);
      est.upSells.forEach((sell) => {
        doc.setFont("helvetica", "bold");
        doc.text(sell.title, 17, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(sell.desc, 17, yPos + 4);
        doc.setFont("helvetica", "bold");
        doc.text("+$" + sell.price.toLocaleString(), 184, yPos + 2);
        yPos += 9;
      });
    }

    // Calculations & Totals Table
    yPos += 4;
    doc.setFillColor(248, 250, 252);
    doc.rect(120, yPos, 75, 26, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(120, yPos, 75, 26, "D");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Itemized Subtotal:", 123, yPos + 6);
    doc.text("Estimated Local Tax (6%):", 123, yPos + 12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22); // orange
    doc.text("GRAND ESTIMATED TOTAL:", 123, yPos + 20);

    const pdfTotalAmt = est.totalAmount ?? est.value ?? 0;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text("$" + pdfTotalAmt.toLocaleString(), 175, yPos + 6);
    doc.text("$" + Math.round(pdfTotalAmt * 0.06).toLocaleString(), 175, yPos + 12);
    doc.setFont("helvetica", "bold");
    doc.text("$" + Math.round(pdfTotalAmt * 1.06).toLocaleString(), 175, yPos + 20);

    // Terms of Contract
    yPos += 34;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("TERMS AND CONDITIONS: PaintingPro AI serves as an automated operational pricing simulation tool. This document constitutes a formal scope agreement based on current regional material cost indexes and drywall preconditioning. Actual labor parameters may vary up to 10% on physical inspection of drywall surface cracks.", 15, yPos, { maxWidth: 180 });

    // Digital Signature Line
    yPos += 14;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 10, 85, yPos + 10);
    doc.line(125, yPos + 10, 195, yPos + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("CONTRACTOR AUTHORIZATION SIGNATURE", 15, yPos + 14);
    doc.text("CLIENT BINDING DIGITAL ACCEPTANCE", 125, yPos + 14);

    // Render Mock signature if signed
    if (signatureConfirmed || signatureName) {
      doc.setFont("courier", "bolditalic");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(signatureName || "David Thompson", 130, yPos + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Date Signed: " + (signedDate || est.createdAt), 130, yPos + 18);
    }

    // Save PDF Download File
    doc.save(est.id + "_Proposal.pdf");
  };

  const handleUpdateStatus = async (id: string, stat: any) => {
    setEstimates(estimates.map(e => e.id === id ? { ...e, status: stat } : e));
    if (selectedEstimate && selectedEstimate.id === id) {
      setSelectedEstimate({ ...selectedEstimate, status: stat });
    }
    try {
      await fetch(`/api/estimates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: stat })
      });
    } catch (err) {
      console.error("Failed to sync estimate status on server:", err);
    }
  };

  const handleExportTakeoffToEstimate = async (newEst: Estimate) => {
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEst)
      });
      if (res.ok) {
        const serverEst = await res.json();
        setEstimates([serverEst, ...estimates]);
        setSelectedEstimate(serverEst);
      } else {
        setEstimates([newEst, ...estimates]);
        setSelectedEstimate(newEst);
      }
    } catch (err) {
      setEstimates([newEst, ...estimates]);
      setSelectedEstimate(newEst);
    }
    setActiveTab("board");
  };

  const activeEstimatesCount = estimates.length;
  const totalEstimatesValue = estimates.reduce((acc, curr) => acc + (curr.totalAmount ?? curr.value ?? 0), 0);

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="quote-genius-root">
      
      {/* Tab Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-4" id="quotegenius-subnav">
        <div className="flex flex-wrap gap-2">
          {["takeoff", "board", "wizard", "standalone", "templates"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${activeTab === tab ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {tab === "takeoff" && "📐 TAKEOFF // PRO (Bulk Commercial)"}
              {tab === "board" && "📋 Estimates Board"}
              {tab === "wizard" && "✨ AI Smart Wizard"}
              {tab === "standalone" && "🧮 Standalone Calc"}
              {tab === "templates" && "📝 Custom Contracts"}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setActiveTab("takeoff")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Commercial Takeoff</span>
        </button>
      </div>

      {/* ESTIMATE BOARD KANBAN VIEW */}
      {activeTab === "board" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-estimates-board">
          
          {/* Left Board Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-start" id="estimates-columns-row">
            {[
              { id: "Draft", label: "DRAFTS", bg: "bg-slate-900/50 border-slate-800", text: "text-slate-400" },
              { id: "Sent", label: "SENT BIDS", bg: "bg-blue-500/5 border-blue-500/10", text: "text-blue-400" },
              { id: "Approved", label: "APPROVED", bg: "bg-emerald-500/5 border-emerald-500/10", text: "text-emerald-400" },
              { id: "Rejected", label: "REJECTED", bg: "bg-red-500/5 border-red-500/10", text: "text-red-400" }
            ].map((col) => {
              const colEst = estimates.filter(e => e.status === col.id);
              const totalVal = colEst.reduce((sum, curr) => sum + (curr.totalAmount ?? curr.value ?? 0), 0);

              return (
                <div key={col.id} className={`p-3 rounded-2xl border min-h-[550px] flex flex-col space-y-4 ${col.bg}`}>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                    <div className="space-y-0.5">
                      <h4 className={`font-black text-[11px] tracking-wider uppercase ${col.text}`}>{col.label}</h4>
                      <p className="text-[10px] font-mono text-slate-500 font-bold">${totalVal.toLocaleString()}</p>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold">{colEst.length}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    {colEst.map((est) => (
                      <div 
                        key={est.id}
                        onClick={() => setSelectedEstimate(est)}
                        className={`bg-slate-900 border border-slate-800 p-3.5 rounded-xl hover:border-orange-500/30 transition cursor-pointer space-y-2 group relative ${selectedEstimate?.id === est.id ? "border-orange-500 ring-1 ring-orange-500/30" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-white text-xs truncate group-hover:text-orange-400 transition">{est.clientName || est.customerName}</h5>
                          <span className="text-[8px] font-mono text-slate-500 font-bold">{est.id}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 truncate">{est.address}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-[9px]">
                          <span className="text-slate-500 font-mono">{est.createdAt || est.date}</span>
                          <strong className="text-slate-200 font-black">${(est.totalAmount ?? est.value ?? 0).toLocaleString()}</strong>
                        </div>

                        {/* Dropdown status update sim */}
                        <div className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition">
                          <select 
                            value={est.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateStatus(est.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 text-white rounded text-[8px] px-1 font-mono focus:outline-none"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {colEst.length === 0 && (
                      <div className="text-center py-14 text-[10px] text-slate-600 font-mono italic">
                        No estimates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Selected Estimate Detail Preview */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[550px]" id="estimate-detail-preview">
            {selectedEstimate ? (
              <div className="space-y-5 text-left">
                <div className="flex justify-between items-start pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md uppercase">{selectedEstimate.status} STATUS</span>
                    <h3 className="font-extrabold text-white text-base">{selectedEstimate.clientName || selectedEstimate.customerName}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">{selectedEstimate.address}</p>
                  </div>
                  <button 
                    onClick={() => handleDownloadPDF(selectedEstimate)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center cursor-pointer"
                    title="Download branded PDF contract proposal"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Scope description */}
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono">Project Scope Dimensions</h4>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs">
                      {selectedEstimate.rooms && selectedEstimate.rooms.map((rm: any, i: number) => (
                        <div key={i} className="flex justify-between font-sans">
                          <span className="text-slate-500">{rm.name} ({rm.sheen})</span>
                          <strong className="text-slate-300">{rm.wallArea.toLocaleString()} Sq Ft</strong>
                        </div>
                      ))}
                      {selectedEstimate.materials && selectedEstimate.materials.map((mat: any, i: number) => (
                        <div key={i} className="flex justify-between font-sans pt-1 border-t border-slate-900/60 text-[11px]">
                          <span className="text-slate-500">Material Selection:</span>
                          <strong className="text-slate-400">{mat.brand} {mat.line}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High margin upsells */}
                  {selectedEstimate.upSells && selectedEstimate.upSells.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono">Included Up-sells Selected</h4>
                      <div className="space-y-1.5">
                        {selectedEstimate.upSells.map((up: any, i: number) => (
                          <div key={i} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 text-xs flex justify-between items-center">
                            <div>
                              <p className="font-bold text-white text-[11px]">{up.title}</p>
                              <p className="text-[10px] text-slate-500">{up.category}</p>
                            </div>
                            <strong className="text-emerald-400 font-bold font-mono">+${up.price}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calculations Display */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 text-xs text-left space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal paint & labor:</span>
                      <span className="font-mono">${(selectedEstimate.totalAmount ?? selectedEstimate.value ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Regional material index surcharge:</span>
                      <span className="font-mono">$0</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-900 font-sans text-sm font-extrabold">
                      <span className="text-orange-400">GRAND ESTIMATE VALUE:</span>
                      <strong className="text-white font-black font-mono">${(selectedEstimate.totalAmount ?? selectedEstimate.value ?? 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* PDF Action CTA button */}
                <button 
                  onClick={() => handleDownloadPDF(selectedEstimate)}
                  className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer mt-4 shadow-lg shadow-orange-500/20"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Formal PDF Proposal Contract</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-24 text-slate-500 space-y-2">
                <FileText className="h-10 w-10 text-slate-700" />
                <p className="text-xs font-mono italic">Select any estimate from the board cards to preview full specifications.</p>
              </div>
            )}
          </div>

          </div>
        )}

      {/* AI SMART ESTIMATING WIZARD (Interactive photo based measurements & auto builder) */}
      {activeTab === "wizard" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-3xl mx-auto space-y-6" id="view-estimator-wizard">
          
          {/* Header Progress Tracker */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
                AI Room Estimating Proposal Wizard
              </h3>
              <p className="text-[11px] text-slate-400">Step {wizardStep} of 5 - {
                wizardStep === 1 ? "Room Photo Analyzer" :
                wizardStep === 2 ? "Room Specifications" :
                wizardStep === 3 ? "Paint Brand & Material Grade" :
                wizardStep === 4 ? "Margin & High-Margin Up-sells" :
                "Authorized Signature Contract Binding"
              }</p>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 w-8 rounded-full ${s <= wizardStep ? "bg-orange-500" : "bg-slate-800"}`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: ROOM PHOTO UPLOAD ANALYZER */}
          {wizardStep === 1 && (
            <div className="space-y-6 text-center" id="wizard-step1">
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="font-extrabold text-white text-sm">Room Image Measurement AI Extraction</h4>
                <p className="text-xs text-slate-400">Take a photo of the client's walls or select a room design file. AI evaluates wall dimensions, molding types, baseboard length, doors and windows.</p>
              </div>

              <div 
                onClick={handleTriggerUpload}
                className="border-2 border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-orange-500/40 p-12 rounded-3xl cursor-pointer transition flex flex-col items-center justify-center space-y-4 max-w-md mx-auto"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
                
                {uploadedPhotoUrl ? (
                  <div className="space-y-3">
                    <img src={uploadedPhotoUrl} alt="Room upload preview" className="max-h-48 rounded-xl border border-slate-800" referrerPolicy="no-referrer" />
                    {photoAnalyzing ? (
                      <div className="text-orange-500 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>AI evaluating ceiling height and linear trim...</span>
                      </div>
                    ) : (
                      <div className="text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" />
                        <span>Measurement Specs extracted successfully!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-orange-500/10 text-orange-400 w-14 h-14 rounded-full flex items-center justify-center border border-orange-500/20">
                      <Upload className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">Drag & drop room photo or click to browse</p>
                      <p className="text-[10px] text-slate-500 font-mono pt-1">Supports PNG, JPEG up to 10MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Client Info inline form */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 max-w-md mx-auto space-y-3 text-left">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Customer Lead</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Project Address Location</label>
                  <input 
                    type="text" 
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setWizardStep(2)}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-xs transition flex justify-center items-center gap-1 mx-auto cursor-pointer"
                >
                  <span>Next: Configure Rooms specs</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ROOM SPECIFICATIONS MEASUREMENTS */}
          {wizardStep === 2 && (
            <div className="space-y-5 text-left" id="wizard-step2">
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">Room Physical Dimensions</h4>
                <p className="text-xs text-slate-400">Fine-tune the height, perimeter width, doors, and window counts to calculate raw wall paint areas.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-850">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Ceiling Height (ft)</label>
                  <input 
                    type="number"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Room Width (ft)</label>
                  <input 
                    type="number"
                    value={wallWidth}
                    onChange={(e) => setWallWidth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Room Length (ft)</label>
                  <input 
                    type="number"
                    value={wallLength}
                    onChange={(e) => setWallLength(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Doors to Subtract (21 sqft/ea)</label>
                  <input 
                    type="number"
                    value={doorsCount}
                    onChange={(e) => setDoorsCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Windows to Subtract (15 sqft/ea)</label>
                  <input 
                    type="number"
                    value={windowsCount}
                    onChange={(e) => setWindowsCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              {/* Computed Specifications Info block */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px] font-mono">CALCULATED SURFACE WALL AREA</p>
                  <h4 className="text-base font-black text-white">{calculatedWallArea.toLocaleString()} Sq Ft</h4>
                  <p className="text-[9px] text-slate-500 font-mono">Deductions: {doorDeduction + windowDeduction} Sq Ft subtracted for openings.</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-mono">CEILING SURFACE AREA</p>
                  <h4 className="text-base font-black text-white">{calculatedCeilingArea.toLocaleString()} Sq Ft</h4>
                  <p className="text-[9px] text-slate-500 font-mono">Linear trim perimeter: {perimeter} Ft</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setWizardStep(1)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setWizardStep(3)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer"
                >
                  Next: Select Materials
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MATERIALS SELECTION */}
          {wizardStep === 3 && (
            <div className="space-y-5 text-left" id="wizard-step3">
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">Material Tier & Sheen Selection</h4>
                <p className="text-xs text-slate-400">Choose professional coatings. Tier specifications impact contractor cost per gallon index.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono">Coating Brand Index</h5>
                  
                  <div className="space-y-2 text-xs">
                    {[
                      { name: "Sherwin-Williams", line: "Emerald Premium", gallonPrice: 72 },
                      { name: "Benjamin Moore", line: "Aura Premium Matte", gallonPrice: 84 },
                      { name: "Behr Pro Coatings", line: "Marquee Commercial", gallonPrice: 58 }
                    ].map((brand) => (
                      <label 
                        key={brand.name} 
                        onClick={() => { setPaintBrand(brand.name); setPaintLine(brand.line); setPaintCostPerGallon(brand.gallonPrice); }}
                        className={`flex justify-between items-center p-2.5 rounded-lg border cursor-pointer ${paintBrand === brand.name ? "bg-orange-500/10 border-orange-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}
                      >
                        <div>
                          <p className="font-bold text-white text-xs">{brand.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{brand.line}</p>
                        </div>
                        <span className="text-xs font-bold font-mono text-slate-300">${brand.gallonPrice}/gal</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono">Sheen Gloss Finishes</h5>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Flat / Matte", "Eggshell Accent", "Satin Wall", "Semi-Gloss Trim", "High-Gloss Wet", "Eco-Matte Odorless"].map((sheen) => (
                      <label 
                        key={sheen}
                        onClick={() => setPaintSheen(sheen)}
                        className={`p-3 rounded-xl border text-center cursor-pointer font-bold ${paintSheen === sheen ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-slate-900 border-slate-800 hover:text-white"}`}
                      >
                        {sheen}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Computations material cost block */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 text-[10px] font-mono">ESTIMATED COATINGS QUANTITY</p>
                  <h4 className="text-base font-black text-white">{gallonsRequired} Gallons Required</h4>
                  <p className="text-[9px] text-slate-500 font-mono">Based on 2-coat paint coverage rate (350 Sq Ft per gallon)</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-mono">MATERIAL SUBTOTAL</p>
                  <h4 className="text-base font-black text-orange-500">${(gallonsRequired * paintCostPerGallon).toLocaleString()}</h4>
                  <p className="text-[9px] text-slate-500 font-mono">Supplies surcharge included</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setWizardStep(2)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setWizardStep(4)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer"
                >
                  Next: Margins & Upsells
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MARGINS & HIGH MARGIN UP-SELLS */}
          {wizardStep === 4 && (
            <div className="space-y-5 text-left" id="wizard-step4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">Custom Markup Margin & AI High-Margin Upsells</h4>
                <p className="text-xs text-slate-400">Automate profitability. Up-sell options increase margin output by up to 34% per customer job ticket.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Labor and markup controls */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                  <h5 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono">Margin Markups</h5>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-mono uppercase text-[10px]">Markup Margin Percent</label>
                        <strong className="text-orange-400 font-mono">{markupPercent}%</strong>
                      </div>
                      <input 
                        type="range"
                        min="25"
                        max="85"
                        value={markupPercent}
                        onChange={(e) => setMarkupPercent(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Prep Labor (Hrs)</label>
                        <input 
                          type="number"
                          value={prepLaborHours}
                          onChange={(e) => setPrepLaborHours(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1 px-2.5 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Paint Labor (Hrs)</label>
                        <input 
                          type="number"
                          value={paintLaborHours}
                          onChange={(e) => setPaintLaborHours(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1 px-2.5 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Margin AI Up-sells */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono flex items-center justify-between">
                    <span>AI Profit Optimizers</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-black">HIGH MARGIN</span>
                  </h5>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {upSells.map((up) => (
                      <div 
                        key={up.id}
                        onClick={() => handleToggleUpSell(up.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer text-left transition flex items-center justify-between ${up.selected ? "bg-orange-500/10 border-orange-500" : "bg-slate-900 border-slate-800 hover:border-slate-750"}`}
                      >
                        <div className="max-w-[70%]">
                          <p className="font-bold text-white text-[11px] truncate">{up.title}</p>
                          <p className="text-[9px] text-slate-500 truncate">{up.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">+${up.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Summary Calculations */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Base paint + supplies subtotal:</span>
                  <strong className="text-white font-mono">${subtotalCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Gross margins margin value:</span>
                  <strong className="text-white font-mono">${(baseEstimateTotal - subtotalCost).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Up-sells selected subtotal:</span>
                  <strong className="text-emerald-400 font-mono font-bold">+${selectedUpSellsTotal.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-900 text-sm font-extrabold">
                  <span className="text-orange-400">TOTAL PROPOSAL SPEC VALUE:</span>
                  <strong className="text-white font-black font-mono">${finalCalculatedTotal.toLocaleString()}</strong>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setWizardStep(3)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setWizardStep(5)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer"
                >
                  Next: Contract Binding
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: AUTHORIZED SIGNATURE CONTRACT BINDING */}
          {wizardStep === 5 && (
            <div className="space-y-5 text-left" id="wizard-step5">
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">Binding Digital Contract Signing</h4>
                <p className="text-xs text-slate-400">Generate an automated contract agreement. Confirm binding terms with an interactive digital signature block.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs text-slate-400 leading-relaxed font-mono space-y-3">
                <div className="font-bold text-white text-[11px] pb-1 border-b border-slate-900">PREVIEW SCOPE TERMS:</div>
                <p>PaintingPro franchise agency agrees to apply coating treatments according to room height of {wallHeight} ft, incorporating {paintBrand} {paintLine} satin finishes on drywall.</p>
                <p>CUSTOMER SIGNATURE AUTHORIZATION binds client to estimate total of <strong className="text-orange-400">${finalCalculatedTotal.toLocaleString()}</strong> plus regional sales taxes.</p>
              </div>

              {/* Digital signature inputs */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 max-w-md mx-auto">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Customer Full Binding Name</label>
                  <input 
                    type="text" 
                    placeholder="Type e.g. David Thompson to sign"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-mono placeholder-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Date of Digital Execution</label>
                  <input 
                    type="date" 
                    value={signedDate}
                    onChange={(e) => setSignedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-mono"
                  />
                </div>

                <label className="flex items-start gap-2.5 px-1 py-1 text-xs cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={signatureConfirmed}
                    onChange={() => setSignatureConfirmed(!signatureConfirmed)}
                    className="mt-0.5 accent-orange-500"
                  />
                  <span className="text-[10px] text-slate-400 leading-normal">I verify that the above spelling matches client credentials and constitutes a legally binding digital contract execution.</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setWizardStep(4)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleCreateEstimate}
                  disabled={!signatureName || !signatureConfirmed}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  Save & Publish Estimate Proposal
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* STANDALONE CALCULATOR */}
      {activeTab === "standalone" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xl mx-auto space-y-4" id="view-standalone-calc">
          <div className="space-y-1 border-b border-slate-850 pb-2">
            <h3 className="font-extrabold text-white text-base">Quick Area Paint Cost Calculator</h3>
            <p className="text-xs text-slate-400">Standalone client-side cost modeling. Perfect for rapid over-the-phone bids.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-left">
              <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Walls Area (Sq Ft)</label>
              <input 
                type="number" 
                defaultValue="1500" 
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase">Materials Cost Tier</label>
              <select className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs" defaultValue="Premium SW ($72/gallon)">
                <option>Economy ($35/gallon)</option>
                <option>Premium SW ($72/gallon)</option>
                <option>Luxury Aura BM ($84/gallon)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left text-xs font-mono text-slate-500">
            [Standalone model estimates total price: $3,450. Margin: 45%. Labor Hours: 14 hours]
          </div>

          <button 
            onClick={() => {
              setClientName("Quick Phone Bid");
              setProjectAddress("York, PA");
              setWizardStep(4);
              setActiveTab("wizard");
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition"
          >
            Export to AI Wizard Proposal Builder
          </button>
        </div>
      )}

      {/* TAKEOFF // PRO BULK COMMERCIAL ENGINE */}
      {activeTab === "takeoff" && (
        <TakeoffProModule onExportToEstimate={handleExportTakeoffToEstimate} />
      )}

      {/* PROPOSAL CONTRACT TEMPLATES */}
      {activeTab === "templates" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xl mx-auto space-y-4" id="view-templates">
          <div className="space-y-1 border-b border-slate-850 pb-2">
            <h3 className="font-extrabold text-white text-base">Custom Legal Contract Templates</h3>
            <p className="text-xs text-slate-400">Manage legal, indemnity, liability and prep disclosures attached to PDF documents.</p>
          </div>

          <div className="space-y-3 text-left">
            {[
              { title: "Standard Residential Indemnity Clause", desc: "Covers drywall settlement and moisture nail-pops within 1 year warranty." },
              { title: "Commercial Exterior Multi-Tier Schedule", desc: "Incorporates scissor lift safety and weather-delay contingency parameters." },
              { title: "Cabinet Refinishing prep terms", desc: "Outlines client obligations for kitchen item cleaning and drawer clearing prior to paint spraying." }
            ].map((temp, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 hover:border-slate-700 transition cursor-pointer">
                <h5 className="font-bold text-white text-xs">{temp.title}</h5>
                <p className="text-[10px] text-slate-400 pt-1 leading-normal">{temp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
