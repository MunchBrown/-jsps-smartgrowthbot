import React, { useState, useEffect } from "react";
import {
  Layers, Plus, Trash2, Copy, Save, FileText, Download, Sparkles,
  Calculator, Check, Edit3, ArrowRight, ShieldCheck, RefreshCw,
  Info, AlertTriangle, TrendingUp, DollarSign, Building2, ChevronDown,
  Sliders, ArrowUpRight, CheckCircle2, Package, Clock, Eye
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Estimate } from "../types";

export interface TakeoffRow {
  id: string;
  name: string;
  category: "Wall" | "Ceiling" | "Trim" | "Door" | "Window" | "Custom";
  qtyMultiplier: number;
  
  // Dimensions
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  sqftOverride?: number;
  lfOverride?: number;
  
  // Deductions for Walls
  doorsCount: number;
  doorDeductSqft: number; // default 21 sqft per door face
  windowsCount: number;
  windowDeductSqft: number; // default 15 sqft per window
  
  // Surface & Material
  surfaceType: "Drywall" | "Wood/MDF" | "Hollow Metal" | "Concrete Block" | "Stucco/Exterior" | "Steel/Decking";
  paintBrand: string;
  paintLine: string;
  paintSheen: string;
  paintCostPerGal: number;
  coverageRateSqftPerGal: number;
  
  // Coats & Primer
  includePrimer: boolean;
  primerCostPerGal: number;
  primerCoverageRate: number;
  coats: number;
  wasteFactorPercent: number;
  
  // Labor Engine
  productionRate: number;
  productionRateUnit: "sf/hr" | "lf/hr" | "hrs/unit";
  laborRatePerHour: number;
}

export interface TakeoffProject {
  id: string;
  projectName: string;
  clientName: string;
  buildingType: "Hotel / Hospitality" | "Commercial Office" | "Retail Warehouse" | "Multi-Family Residential" | "Medical Facility" | "Custom Commercial";
  address: string;
  createdAt: string;
  updatedAt: string;
  
  laborRatePerHour: number;
  markupPercent: number;
  sundriesPercent: number;
  equipmentRentalCost: number;
  
  rows: TakeoffRow[];
  notes?: string;
}

// Pre-packaged Commercial Industry Templates
export const TAKEOFF_TEMPLATES: TakeoffProject[] = [
  {
    id: "template-hotel-100",
    projectName: "100-Room Hotel Repaint Spec (Hilton Garden Inn)",
    clientName: "Horizon Hospitality Group",
    buildingType: "Hotel / Hospitality",
    address: "450 Patriot Parkway, York, PA",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    laborRatePerHour: 48,
    markupPercent: 35,
    sundriesPercent: 6,
    equipmentRentalCost: 850,
    notes: "High-throughput commercial bulk takeoff based on typical 400 sqft guestroom assembly repeated 100x.",
    rows: [
      {
        id: "row-h1",
        name: "Guestroom Standard Bedroom Walls (Type A)",
        category: "Wall",
        qtyMultiplier: 100,
        lengthFt: 18,
        widthFt: 14,
        heightFt: 9,
        doorsCount: 2,
        doorDeductSqft: 21,
        windowsCount: 1,
        windowDeductSqft: 24,
        surfaceType: "Drywall",
        paintBrand: "Sherwin-Williams",
        paintLine: "ProMar 200 Zero VOC",
        paintSheen: "Eg-Shel",
        paintCostPerGal: 46,
        coverageRateSqftPerGal: 350,
        includePrimer: true,
        primerCostPerGal: 32,
        primerCoverageRate: 300,
        coats: 2,
        wasteFactorPercent: 10,
        productionRate: 180,
        productionRateUnit: "sf/hr",
        laborRatePerHour: 48
      },
      {
        id: "row-h2",
        name: "Guestroom Ceilings",
        category: "Ceiling",
        qtyMultiplier: 100,
        lengthFt: 18,
        widthFt: 14,
        heightFt: 9,
        doorsCount: 0,
        doorDeductSqft: 0,
        windowsCount: 0,
        windowDeductSqft: 0,
        surfaceType: "Drywall",
        paintBrand: "Sherwin-Williams",
        paintLine: "Promar Ceiling Flat",
        paintSheen: "Flat",
        paintCostPerGal: 38,
        coverageRateSqftPerGal: 350,
        includePrimer: false,
        primerCostPerGal: 30,
        primerCoverageRate: 300,
        coats: 1,
        wasteFactorPercent: 8,
        productionRate: 220,
        productionRateUnit: "sf/hr",
        laborRatePerHour: 48
      },
      {
        id: "row-h3",
        name: "Entry & Bathroom Baseboard Trim",
        category: "Trim",
        qtyMultiplier: 100,
        lengthFt: 18,
        widthFt: 14,
        heightFt: 0,
        lfOverride: 64,
        doorsCount: 0,
        doorDeductSqft: 0,
        windowsCount: 0,
        windowDeductSqft: 0,
        surfaceType: "Wood/MDF",
        paintBrand: "Sherwin-Williams",
        paintLine: "ProClassic Waterborne Acrylic-Alkyd",
        paintSheen: "Semi-Gloss",
        paintCostPerGal: 58,
        coverageRateSqftPerGal: 400,
        includePrimer: false,
        primerCostPerGal: 35,
        primerCoverageRate: 300,
        coats: 2,
        wasteFactorPercent: 10,
        productionRate: 75,
        productionRateUnit: "lf/hr",
        laborRatePerHour: 48
      },
      {
        id: "row-h4",
        name: "Solid Core Guestroom Entry Doors (2-Sides)",
        category: "Door",
        qtyMultiplier: 100,
        lengthFt: 0,
        widthFt: 0,
        heightFt: 0,
        doorsCount: 1,
        doorDeductSqft: 0,
        windowsCount: 0,
        windowDeductSqft: 0,
        surfaceType: "Hollow Metal",
        paintBrand: "Benjamin Moore",
        paintLine: "Ultra Spec HP DTM Acrylic",
        paintSheen: "Semi-Gloss",
        paintCostPerGal: 62,
        coverageRateSqftPerGal: 350,
        includePrimer: true,
        primerCostPerGal: 42,
        primerCoverageRate: 320,
        coats: 2,
        wasteFactorPercent: 12,
        productionRate: 0.45,
        productionRateUnit: "hrs/unit",
        laborRatePerHour: 48
      }
    ]
  },
  {
    id: "template-office-building",
    projectName: "2-Story Medical Office Building Takeoff",
    clientName: "Keystone Real Estate Partners",
    buildingType: "Commercial Office",
    address: "1200 Commerce Way, Harrisburg, PA",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    laborRatePerHour: 50,
    markupPercent: 38,
    sundriesPercent: 5,
    equipmentRentalCost: 1200,
    notes: "Medical suite repaint including anti-microbial latex paint and epoxy trim.",
    rows: [
      {
        id: "row-o1",
        name: "Suite Partition Walls & Exam Rooms",
        category: "Wall",
        qtyMultiplier: 18,
        lengthFt: 22,
        widthFt: 16,
        heightFt: 10,
        doorsCount: 2,
        doorDeductSqft: 21,
        windowsCount: 2,
        windowDeductSqft: 18,
        surfaceType: "Drywall",
        paintBrand: "Sherwin-Williams",
        paintLine: "Harmony Anti-Microbial Interior",
        paintSheen: "Eg-Shel",
        paintCostPerGal: 54,
        coverageRateSqftPerGal: 350,
        includePrimer: true,
        primerCostPerGal: 36,
        primerCoverageRate: 300,
        coats: 2,
        wasteFactorPercent: 10,
        productionRate: 160,
        productionRateUnit: "sf/hr",
        laborRatePerHour: 50
      },
      {
        id: "row-o2",
        name: "Main Corridor & Waiting Area Accent Walls",
        category: "Wall",
        qtyMultiplier: 4,
        lengthFt: 60,
        widthFt: 10,
        heightFt: 10,
        doorsCount: 6,
        doorDeductSqft: 21,
        windowsCount: 4,
        windowDeductSqft: 25,
        surfaceType: "Drywall",
        paintBrand: "Benjamin Moore",
        paintLine: "Scuff-X High Durability",
        paintSheen: "Eggshell",
        paintCostPerGal: 68,
        coverageRateSqftPerGal: 380,
        includePrimer: false,
        primerCostPerGal: 40,
        primerCoverageRate: 300,
        coats: 2,
        wasteFactorPercent: 10,
        productionRate: 140,
        productionRateUnit: "sf/hr",
        laborRatePerHour: 50
      },
      {
        id: "row-o3",
        name: "Hollow Metal Door Frames",
        category: "Door",
        qtyMultiplier: 42,
        lengthFt: 0,
        widthFt: 0,
        heightFt: 0,
        doorsCount: 1,
        doorDeductSqft: 0,
        windowsCount: 0,
        windowDeductSqft: 0,
        surfaceType: "Hollow Metal",
        paintBrand: "Sherwin-Williams",
        paintLine: "Pro Industrial DTM Acrylic",
        paintSheen: "Semi-Gloss",
        paintCostPerGal: 65,
        coverageRateSqftPerGal: 350,
        includePrimer: true,
        primerCostPerGal: 45,
        primerCoverageRate: 300,
        coats: 2,
        wasteFactorPercent: 10,
        productionRate: 0.35,
        productionRateUnit: "hrs/unit",
        laborRatePerHour: 50
      }
    ]
  }
];

interface TakeoffProModuleProps {
  onExportToEstimate?: (estimate: Estimate) => void;
}

export default function TakeoffProModule({ onExportToEstimate }: TakeoffProModuleProps) {
  // Current Active Takeoff Project
  const [project, setProject] = useState<TakeoffProject>(() => {
    const saved = localStorage.getItem("paintingpro_takeoff_project");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return TAKEOFF_TEMPLATES[0];
  });

  const [savedProjects, setSavedProjects] = useState<TakeoffProject[]>(() => {
    const saved = localStorage.getItem("paintingpro_takeoff_saved_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return TAKEOFF_TEMPLATES;
  });

  const [activeTab, setActiveTab] = useState<"takeoff" | "summary" | "rates" | "saved">("takeoff");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(project.rows[0]?.id || null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Auto-save project locally
  useEffect(() => {
    localStorage.setItem("paintingpro_takeoff_project", JSON.stringify(project));
  }, [project]);

  // Sync with server if available
  useEffect(() => {
    const loadServerTakeoffs = async () => {
      try {
        const res = await fetch("/api/takeoffs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSavedProjects(data);
          }
        }
      } catch (err) {
        // Fallback local
      }
    };
    loadServerTakeoffs();
  }, []);

  // Calculation Engine helpers per row
  const computeRowStats = (r: TakeoffRow, masterLaborRate: number) => {
    const Q = Math.max(1, r.qtyMultiplier || 1);
    
    // 1. Gross & Net Surface area calculation
    let rawUnitArea = 0;
    if (r.category === "Wall") {
      if (r.sqftOverride && r.sqftOverride > 0) {
        rawUnitArea = r.sqftOverride;
      } else {
        const perimeter = (r.lengthFt * 2) + (r.widthFt * 2);
        rawUnitArea = perimeter * (r.heightFt || 9);
      }
    } else if (r.category === "Ceiling") {
      rawUnitArea = r.sqftOverride && r.sqftOverride > 0 ? r.sqftOverride : (r.lengthFt * r.widthFt);
    } else if (r.category === "Trim") {
      const lf = r.lfOverride && r.lfOverride > 0 ? r.lfOverride : ((r.lengthFt * 2) + (r.widthFt * 2));
      rawUnitArea = lf * 0.5; // normalized ~0.5 ft width for trim surface math
    } else if (r.category === "Door") {
      rawUnitArea = (r.doorsCount || 1) * 21; // 21 sqft per door face
    } else if (r.category === "Window") {
      rawUnitArea = (r.windowsCount || 1) * 15; // 15 sqft per window frame
    } else {
      rawUnitArea = r.sqftOverride || 100;
    }

    // Auto opening deduction for walls
    let unitDeduction = 0;
    if (r.category === "Wall") {
      unitDeduction = ((r.doorsCount || 0) * (r.doorDeductSqft || 21)) + ((r.windowsCount || 0) * (r.windowDeductSqft || 15));
    }

    const netUnitArea = Math.max(0, rawUnitArea - unitDeduction);
    const totalGrossArea = rawUnitArea * Q;
    const totalDeductionArea = unitDeduction * Q;
    const totalNetArea = netUnitArea * Q;

    // Linear feet & unit count calculations
    const totalLF = r.category === "Trim" ? (r.lfOverride && r.lfOverride > 0 ? r.lfOverride : ((r.lengthFt * 2) + (r.widthFt * 2))) * Q : 0;
    const totalUnits = (r.category === "Door" ? (r.doorsCount || 1) : r.category === "Window" ? (r.windowsCount || 1) : 1) * Q;

    // 2. Full Paint & Material Math
    const finishCoats = Math.max(1, r.coats || 2);
    const wasteMultiplier = 1 + ((r.wasteFactorPercent || 10) / 100);

    let finishSqftDemand = 0;
    if (r.category === "Trim") {
      finishSqftDemand = totalLF * finishCoats;
    } else if (r.category === "Door" || r.category === "Window") {
      finishSqftDemand = totalUnits * 21 * finishCoats;
    } else {
      finishSqftDemand = totalNetArea * finishCoats;
    }

    const finishCoverage = Math.max(100, r.coverageRateSqftPerGal || 350);
    const rawFinishGallons = finishSqftDemand / finishCoverage;
    const finishGallons = Math.ceil(rawFinishGallons * wasteMultiplier);
    const finishMaterialCost = finishGallons * (r.paintCostPerGal || 45);

    let primerGallons = 0;
    let primerMaterialCost = 0;
    if (r.includePrimer) {
      let primerDemand = 0;
      if (r.category === "Trim") primerDemand = totalLF;
      else if (r.category === "Door" || r.category === "Window") primerDemand = totalUnits * 21;
      else primerDemand = totalNetArea;
      
      const primerCoverage = Math.max(100, r.primerCoverageRate || 300);
      primerGallons = Math.ceil((primerDemand / primerCoverage) * wasteMultiplier);
      primerMaterialCost = primerGallons * (r.primerCostPerGal || 30);
    }

    const totalRowMaterialCost = finishMaterialCost + primerMaterialCost;

    // 3. Labor Engine
    const laborRate = r.laborRatePerHour || masterLaborRate || 48;
    let laborHours = 0;

    if (r.productionRateUnit === "sf/hr") {
      const prodRate = Math.max(10, r.productionRate || 150);
      laborHours = finishSqftDemand / prodRate;
    } else if (r.productionRateUnit === "lf/hr") {
      const prodRate = Math.max(10, r.productionRate || 60);
      laborHours = (totalLF * finishCoats) / prodRate;
    } else if (r.productionRateUnit === "hrs/unit") {
      const prodRate = Math.max(0.05, r.productionRate || 0.35);
      laborHours = totalUnits * finishCoats * prodRate;
    } else {
      laborHours = finishSqftDemand / 150;
    }

    const totalRowLaborCost = laborHours * laborRate;

    return {
      Q,
      totalGrossArea,
      totalDeductionArea,
      totalNetArea,
      totalLF,
      totalUnits,
      finishGallons,
      finishMaterialCost,
      primerGallons,
      primerMaterialCost,
      totalRowMaterialCost,
      laborHours,
      totalRowLaborCost,
      totalRowDirectCost: totalRowMaterialCost + totalRowLaborCost
    };
  };

  // Summary Totals calculation
  const projectSummary = React.useMemo(() => {
    let sumGrossArea = 0;
    let sumDeductionArea = 0;
    let sumNetArea = 0;
    let sumFinishGallons = 0;
    let sumPrimerGallons = 0;
    let sumMaterialCost = 0;
    let sumLaborHours = 0;
    let sumLaborCost = 0;

    project.rows.forEach(r => {
      const stats = computeRowStats(r, project.laborRatePerHour);
      sumGrossArea += stats.totalGrossArea;
      sumDeductionArea += stats.totalDeductionArea;
      sumNetArea += stats.totalNetArea;
      sumFinishGallons += stats.finishGallons;
      sumPrimerGallons += stats.primerGallons;
      sumMaterialCost += stats.totalRowMaterialCost;
      sumLaborHours += stats.laborHours;
      sumLaborCost += stats.totalRowLaborCost;
    });

    // Sundries cost
    const sundriesCost = Math.round(sumMaterialCost * ((project.sundriesPercent || 5) / 100));
    const totalMaterialsWithSundries = sumMaterialCost + sundriesCost;

    const directCost = totalMaterialsWithSundries + sumLaborCost + (project.equipmentRentalCost || 0);
    const markupAmount = Math.round(directCost * ((project.markupPercent || 35) / 100));
    const totalBidPrice = Math.round(directCost + markupAmount);
    
    const pricePerSqFt = sumNetArea > 0 ? (totalBidPrice / sumNetArea) : 0;
    const grossProfitPercent = totalBidPrice > 0 ? Math.round((markupAmount / totalBidPrice) * 100) : 0;

    // Crew day estimation (assuming 4-person crew @ 8 hrs/day = 32 man-hours/day)
    const crewDaysNeeded = Math.ceil((sumLaborHours / 32) * 10) / 10;

    return {
      sumGrossArea,
      sumDeductionArea,
      sumNetArea,
      sumFinishGallons,
      sumPrimerGallons,
      totalGallons: sumFinishGallons + sumPrimerGallons,
      sumMaterialCost,
      sundriesCost,
      totalMaterialsWithSundries,
      sumLaborHours: Math.round(sumLaborHours * 10) / 10,
      sumLaborCost: Math.round(sumLaborCost),
      directCost: Math.round(directCost),
      markupAmount,
      totalBidPrice,
      pricePerSqFt: pricePerSqFt.toFixed(2),
      grossProfitPercent,
      crewDaysNeeded
    };
  }, [project]);

  // Handle adding a new row
  const handleAddRow = (cat: TakeoffRow["category"]) => {
    const newRow: TakeoffRow = {
      id: "row-" + Date.now(),
      name: `New ${cat} Scope Item`,
      category: cat,
      qtyMultiplier: 1,
      lengthFt: 20,
      widthFt: 15,
      heightFt: 9,
      doorsCount: cat === "Wall" ? 2 : (cat === "Door" ? 1 : 0),
      doorDeductSqft: 21,
      windowsCount: cat === "Wall" ? 2 : (cat === "Window" ? 1 : 0),
      windowDeductSqft: 15,
      surfaceType: cat === "Door" ? "Hollow Metal" : (cat === "Trim" ? "Wood/MDF" : "Drywall"),
      paintBrand: "Sherwin-Williams",
      paintLine: cat === "Trim" ? "ProClassic Semi-Gloss" : "ProMar 200 Eg-Shel",
      paintSheen: cat === "Trim" ? "Semi-Gloss" : (cat === "Ceiling" ? "Flat" : "Eg-Shel"),
      paintCostPerGal: 48,
      coverageRateSqftPerGal: 350,
      includePrimer: true,
      primerCostPerGal: 32,
      primerCoverageRate: 300,
      coats: 2,
      wasteFactorPercent: 10,
      productionRate: cat === "Trim" ? 75 : (cat === "Door" || cat === "Window" ? 0.35 : 160),
      productionRateUnit: cat === "Trim" ? "lf/hr" : (cat === "Door" || cat === "Window" ? "hrs/unit" : "sf/hr"),
      laborRatePerHour: project.laborRatePerHour || 48
    };

    setProject({
      ...project,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: [...project.rows, newRow]
    });
    setSelectedRowId(newRow.id);
  };

  const handleDuplicateRow = (id: string) => {
    const r = project.rows.find(x => x.id === id);
    if (!r) return;
    const duplicated: TakeoffRow = {
      ...r,
      id: "row-" + Date.now(),
      name: `${r.name} (Copy)`
    };
    setProject({
      ...project,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: [...project.rows, duplicated]
    });
    setSelectedRowId(duplicated.id);
  };

  const handleDeleteRow = (id: string) => {
    setProject({
      ...project,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: project.rows.filter(x => x.id !== id)
    });
    if (selectedRowId === id) {
      setSelectedRowId(project.rows.find(x => x.id !== id)?.id || null);
    }
  };

  const handleUpdateRow = (id: string, updates: Partial<TakeoffRow>) => {
    setProject({
      ...project,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: project.rows.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const handleLoadTemplate = (tpl: TakeoffProject) => {
    const loaded: TakeoffProject = {
      ...tpl,
      id: "takeoff-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    };
    setProject(loaded);
    setSelectedRowId(loaded.rows[0]?.id || null);
    setActiveTab("takeoff");
    setSaveSuccessMsg(`Loaded template: "${tpl.projectName}"`);
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleSaveProjectToServer = async () => {
    try {
      const res = await fetch("/api/takeoffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const savedData = await res.json();
        setSaveSuccessMsg("✅ Takeoff project successfully saved to server & local storage!");
        setSavedProjects(prev => {
          const exists = prev.some(p => p.id === savedData.id);
          return exists ? prev.map(p => p.id === savedData.id ? savedData : p) : [savedData, ...prev];
        });
      } else {
        // Fallback local list update
        setSavedProjects(prev => {
          const exists = prev.some(p => p.id === project.id);
          return exists ? prev.map(p => p.id === project.id ? project : p) : [project, ...prev];
        });
        setSaveSuccessMsg("✅ Saved locally to persistent storage.");
      }
    } catch (err) {
      setSavedProjects(prev => {
        const exists = prev.some(p => p.id === project.id);
        return exists ? prev.map(p => p.id === project.id ? project : p) : [project, ...prev];
      });
      setSaveSuccessMsg("✅ Saved locally to persistent storage.");
    }
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  // Convert Takeoff directly to QuoteGenius Estimate!
  const handleExportToEstimate = () => {
    const estimateObj: Estimate = {
      id: `EST-TK-${Date.now()}`,
      clientName: project.clientName || "Commercial Client",
      customerName: project.clientName || "Commercial Client",
      projectName: project.projectName,
      address: project.address,
      sqft: projectSummary.sumNetArea,
      status: "Draft",
      value: projectSummary.totalBidPrice,
      totalAmount: projectSummary.totalBidPrice,
      createdAt: new Date().toISOString().split("T")[0],
      laborHours: projectSummary.sumLaborHours,
      materialCost: projectSummary.totalMaterialsWithSundries,
      details: `Commercial Takeoff Bid generated for ${project.projectName} (${project.buildingType}). Total Net Area: ${projectSummary.sumNetArea.toLocaleString()} sf across ${project.rows.length} assembly groups. Includes auto opening deductions, waste factors, and crew production rates.`,
      rooms: project.rows.map(r => {
        const stats = computeRowStats(r, project.laborRatePerHour);
        return {
          name: `${r.name} (x${r.qtyMultiplier})`,
          width: r.widthFt,
          length: r.lengthFt,
          height: r.heightFt,
          sheen: r.paintSheen,
          wallArea: stats.totalNetArea,
          gallonsRequired: stats.finishGallons + stats.primerGallons
        };
      }),
      materials: project.rows.map(r => {
        const stats = computeRowStats(r, project.laborRatePerHour);
        return {
          brand: r.paintBrand,
          line: r.paintLine,
          finish: r.paintSheen,
          gallonCost: r.paintCostPerGal,
          totalGallons: stats.finishGallons + stats.primerGallons,
          cost: stats.totalRowMaterialCost
        };
      })
    };

    if (onExportToEstimate) {
      onExportToEstimate(estimateObj);
    }
    setSaveSuccessMsg("🚀 Successfully exported Takeoff into QuoteGenius Estimate Proposal!");
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  // PDF Export using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("TAKEOFF // PRO COMMERCIAL BID REPORT", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(249, 115, 22); // Orange accent
    doc.text("BULK QUANTITY & PRODUCTION ENGINE PROPOSAL", 14, 25);

    doc.setTextColor(148, 163, 184);
    doc.text(`Project: ${project.projectName}  |  Date: ${project.updatedAt}`, 14, 32);

    // Client section
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 46, 182, 22, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 46, 182, 22, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("CLIENT / BUILDING COORDINATES:", 18, 53);
    doc.setFont("helvetica", "normal");
    doc.text(`Client: ${project.clientName}`, 18, 60);
    doc.text(`Address: ${project.address}`, 100, 60);
    doc.text(`Type: ${project.buildingType}`, 18, 65);

    // Assembly Table Header
    let y = 76;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ITEMIZED ASSEMBLY TAKE-OFF BREAKDOWN", 14, y);
    y += 5;

    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("ASSEMBLY DESCRIPTION", 16, y + 5);
    doc.text("QTY", 82, y + 5);
    doc.text("NET SQFT", 96, y + 5);
    doc.text("GALLONS", 125, y + 5);
    doc.text("LABOR HRS", 150, y + 5);
    doc.text("DIRECT COST", 175, y + 5);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    project.rows.forEach((r) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      const s = computeRowStats(r, project.laborRatePerHour);
      
      const truncateName = r.name.length > 36 ? r.name.substring(0, 34) + "..." : r.name;
      doc.setFont("helvetica", "bold");
      doc.text(truncateName, 16, y);
      doc.setFont("helvetica", "normal");
      doc.text(`x${s.Q}`, 82, y);
      doc.text(`${s.totalNetArea.toLocaleString()} sf`, 96, y);
      doc.text(`${s.finishGallons + s.primerGallons} gal`, 125, y);
      doc.text(`${Math.round(s.laborHours)} hrs`, 150, y);
      doc.text(`$${Math.round(s.totalRowDirectCost).toLocaleString()}`, 175, y);

      y += 6;
    });

    // Summary Box
    y += 8;
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 182, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("COMMERCIAL BID FINANCIAL SUMMARY", 20, y + 10);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Net Surface Area: ${projectSummary.sumNetArea.toLocaleString()} Sq Ft`, 20, y + 18);
    doc.text(`Total Paint & Primer Demand: ${projectSummary.totalGallons} Gallons`, 20, y + 25);
    doc.text(`Total Labor Hours: ${projectSummary.sumLaborHours} hrs (${projectSummary.crewDaysNeeded} Crew Days)`, 20, y + 32);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(249, 115, 22);
    doc.text(`TOTAL BIDING PRICE: $${projectSummary.totalBidPrice.toLocaleString()}`, 105, y + 18);

    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text(`Unit Price Sanity: $${projectSummary.pricePerSqFt} / sq ft`, 105, y + 26);
    doc.text(`Gross Profit Margin: ${projectSummary.grossProfitPercent}% ($${projectSummary.markupAmount.toLocaleString()})`, 105, y + 32);

    doc.save(`${project.projectName.replace(/[^a-z0-9]/gi, "_")}_Takeoff_Bid.pdf`);
  };

  const activeRow = project.rows.find(r => r.id === selectedRowId) || project.rows[0];

  return (
    <div className="space-y-6 text-white font-sans" id="takeoff-pro-root">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                <Calculator className="w-3 h-3" /> Commercial Takeoff Engine
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
                Persistent Sync Active
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              TAKEOFF <span className="text-orange-500">//</span> PRO
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Bulk quantity multiplier engine, automatic door/window opening deductions, material coverage math, & crew labor rates purpose-built for commercial painting bids.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveProjectToServer}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save Project</span>
            </button>
            <button
              onClick={handleExportToEstimate}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Export to Estimate</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Print PDF Proposal</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs & KPI Quick Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7 flex flex-wrap gap-2">
          {[
            { id: "takeoff", label: "📐 Takeoff Matrix", desc: "Bulk Row Entry" },
            { id: "summary", label: "📊 Live Bid Summary", desc: "Labor + Material + Profit" },
            { id: "rates", label: "⚙️ Master Rate Config", desc: "Production & Coverage" },
            { id: "saved", label: "📁 Saved Projects & Templates", desc: "Load & Manage" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex flex-col items-start gap-0.5 border ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border-slate-800"
              }`}
            >
              <span className="font-bold">{tab.label}</span>
              <span className={`text-[10px] ${activeTab === tab.id ? "text-orange-100" : "text-slate-500"}`}>{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Quick KPI Bar */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Bid Price</span>
            <span className="text-xl font-black text-orange-400">${projectSummary.totalBidPrice.toLocaleString()}</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Net SqFt</span>
            <span className="text-sm font-bold text-white">{projectSummary.sumNetArea.toLocaleString()} sf</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Labor Hrs</span>
            <span className="text-sm font-bold text-emerald-400">{projectSummary.sumLaborHours} hrs</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">$/SqFt</span>
            <span className="text-sm font-bold text-slate-200">${projectSummary.pricePerSqFt}</span>
          </div>
        </div>
      </div>

      {/* MAIN TAB 1: TAKEOFF MATRIX (BULK ROW ENTRY) */}
      {activeTab === "takeoff" && (
        <div className="space-y-6">
          
          {/* Project Details Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Name</label>
              <input
                type="text"
                value={project.projectName}
                onChange={(e) => setProject({ ...project, projectName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Client Name</label>
              <input
                type="text"
                value={project.clientName}
                onChange={(e) => setProject({ ...project, clientName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Building Category</label>
              <select
                value={project.buildingType}
                onChange={(e) => setProject({ ...project, buildingType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-orange-500 focus:outline-none"
              >
                <option value="Hotel / Hospitality">Hotel / Hospitality</option>
                <option value="Commercial Office">Commercial Office</option>
                <option value="Retail Warehouse">Retail Warehouse</option>
                <option value="Multi-Family Residential">Multi-Family Residential</option>
                <option value="Medical Facility">Medical Facility</option>
                <option value="Custom Commercial">Custom Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Address / Site</label>
              <input
                type="text"
                value={project.address}
                onChange={(e) => setProject({ ...project, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Assembly Add Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-orange-400" /> Add Assembly Row:
              </span>
              {(["Wall", "Ceiling", "Trim", "Door", "Window", "Custom"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => handleAddRow(cat)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>+ {cat}</span>
                </button>
              ))}
            </div>

            <span className="text-xs font-medium text-slate-400">
              Total Rows: <strong className="text-white">{project.rows.length}</strong> Assemblies
            </span>
          </div>

          {/* BULK TAKEOFF MATRIX TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <th className="p-3">Assembly Scope Item</th>
                    <th className="p-3 text-center">Cat</th>
                    <th className="p-3 text-center bg-orange-500/10 text-orange-400">Qty Multiplier</th>
                    <th className="p-3 text-center">Dimensions (L x W x H)</th>
                    <th className="p-3 text-center text-blue-400">Deductions (Dr / Wn)</th>
                    <th className="p-3 text-center text-emerald-400">Net SqFt</th>
                    <th className="p-3 text-center">Coats</th>
                    <th className="p-3 text-center">Paint / Gal Cost</th>
                    <th className="p-3 text-center">Prod Rate</th>
                    <th className="p-3 text-right">Labor Hrs</th>
                    <th className="p-3 text-right">Row Direct Cost</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {project.rows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-500">
                        No assemblies added yet. Click an assembly button above to create one or load a commercial template!
                      </td>
                    </tr>
                  ) : (
                    project.rows.map((row) => {
                      const stats = computeRowStats(row, project.laborRatePerHour);
                      const isSelected = selectedRowId === row.id;

                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedRowId(row.id)}
                          className={`transition cursor-pointer ${
                            isSelected ? "bg-slate-800/80 border-l-4 border-l-orange-500" : "hover:bg-slate-850/50"
                          }`}
                        >
                          {/* Name */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleUpdateRow(row.id, { name: e.target.value })}
                              className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-xs text-white font-bold w-full focus:border-orange-500 focus:outline-none"
                            />
                          </td>

                          {/* Category Badge */}
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.category === "Wall" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                              row.category === "Ceiling" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                              row.category === "Trim" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              row.category === "Door" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                              "bg-slate-800 text-slate-300"
                            }`}>
                              {row.category}
                            </span>
                          </td>

                          {/* Quantity Multiplier */}
                          <td className="p-3 text-center bg-orange-500/5">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-slate-500 font-mono text-[11px]">x</span>
                              <input
                                type="number"
                                min={1}
                                value={row.qtyMultiplier}
                                onChange={(e) => handleUpdateRow(row.id, { qtyMultiplier: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="w-14 bg-slate-950 border border-orange-500/50 rounded text-center py-1 text-xs text-orange-400 font-bold focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* Dimensions */}
                          <td className="p-3 text-center">
                            {row.category === "Wall" || row.category === "Ceiling" || row.category === "Trim" ? (
                              <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-slate-300">
                                <input
                                  type="number"
                                  value={row.lengthFt}
                                  onChange={(e) => handleUpdateRow(row.id, { lengthFt: parseFloat(e.target.value) || 0 })}
                                  className="w-10 bg-slate-950 border border-slate-800 rounded text-center py-0.5 text-xs text-white"
                                  title="Length (ft)"
                                />
                                <span>x</span>
                                <input
                                  type="number"
                                  value={row.widthFt}
                                  onChange={(e) => handleUpdateRow(row.id, { widthFt: parseFloat(e.target.value) || 0 })}
                                  className="w-10 bg-slate-950 border border-slate-800 rounded text-center py-0.5 text-xs text-white"
                                  title="Width (ft)"
                                />
                                {row.category === "Wall" && (
                                  <>
                                    <span>x</span>
                                    <input
                                      type="number"
                                      value={row.heightFt}
                                      onChange={(e) => handleUpdateRow(row.id, { heightFt: parseFloat(e.target.value) || 0 })}
                                      className="w-10 bg-slate-950 border border-slate-800 rounded text-center py-0.5 text-xs text-white"
                                      title="Height (ft)"
                                    />
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Count Based</span>
                            )}
                          </td>

                          {/* Opening Deductions */}
                          <td className="p-3 text-center">
                            {row.category === "Wall" ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center gap-1 text-[10px]">
                                  <span className="text-slate-400">Dr:</span>
                                  <input
                                    type="number"
                                    value={row.doorsCount}
                                    onChange={(e) => handleUpdateRow(row.id, { doorsCount: parseInt(e.target.value) || 0 })}
                                    className="w-8 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white"
                                  />
                                  <span className="text-slate-400 ml-1">Wn:</span>
                                  <input
                                    type="number"
                                    value={row.windowsCount}
                                    onChange={(e) => handleUpdateRow(row.id, { windowsCount: parseInt(e.target.value) || 0 })}
                                    className="w-8 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white"
                                  />
                                </div>
                                <span className="text-[9px] text-blue-400 font-mono">
                                  -{stats.totalDeductionArea.toLocaleString()} sf deducted
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          {/* Net SqFt */}
                          <td className="p-3 text-center font-bold text-emerald-400 font-mono">
                            {stats.totalNetArea.toLocaleString()} sf
                          </td>

                          {/* Coats & Primer */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <select
                                value={row.coats}
                                onChange={(e) => handleUpdateRow(row.id, { coats: parseInt(e.target.value) || 2 })}
                                className="bg-slate-950 border border-slate-800 rounded text-xs text-white font-bold py-0.5 px-1 focus:outline-none"
                              >
                                <option value={1}>1 Coat</option>
                                <option value={2}>2 Coats</option>
                                <option value={3}>3 Coats</option>
                              </select>
                              {row.includePrimer && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold" title="Includes Primer Coat">
                                  +P
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Paint & Gal Cost */}
                          <td className="p-3 text-center font-mono text-[11px]">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-0.5">
                                <span className="text-slate-500">$</span>
                                <input
                                  type="number"
                                  value={row.paintCostPerGal}
                                  onChange={(e) => handleUpdateRow(row.id, { paintCostPerGal: parseFloat(e.target.value) || 0 })}
                                  className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white"
                                />
                                <span className="text-slate-400 text-[10px]">/gal</span>
                              </div>
                              <span className="text-[9px] text-slate-400">
                                {stats.finishGallons + stats.primerGallons} gal needed
                              </span>
                            </div>
                          </td>

                          {/* Production Rate */}
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <input
                                type="number"
                                value={row.productionRate}
                                onChange={(e) => handleUpdateRow(row.id, { productionRate: parseFloat(e.target.value) || 1 })}
                                className="w-14 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white font-mono"
                              />
                              <span className="text-[9px] text-slate-400">{row.productionRateUnit}</span>
                            </div>
                          </td>

                          {/* Labor Hours */}
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {Math.round(stats.laborHours)} hrs
                          </td>

                          {/* Row Direct Cost */}
                          <td className="p-3 text-right font-mono font-black text-white">
                            ${Math.round(stats.totalRowDirectCost).toLocaleString()}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDuplicateRow(row.id)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                                title="Duplicate Row Assembly"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
                                title="Delete Assembly Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETAILED ROW INSPECTOR & EDITING DRAWER FOR SELECTED ROW */}
          {activeRow && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-orange-400" />
                  <h3 className="font-bold text-white text-sm">
                    Detailed Assembly Inspector: <span className="text-orange-400 font-mono">{activeRow.name}</span>
                  </h3>
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 font-mono">
                    Qty Multiplier: x{activeRow.qtyMultiplier}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Calculated Row Direct Cost: <strong className="text-white font-mono">${Math.round(computeRowStats(activeRow, project.laborRatePerHour).totalRowDirectCost).toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Surface & Deductions Config */}
                <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" /> Surface & Opening Deduction
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Surface Type</label>
                    <select
                      value={activeRow.surfaceType}
                      onChange={(e) => handleUpdateRow(activeRow.id, { surfaceType: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Drywall">Drywall (Interior Walls & Ceilings)</option>
                      <option value="Wood/MDF">Wood / MDF Trim & Baseboards</option>
                      <option value="Hollow Metal">Hollow Metal Doors & Frames</option>
                      <option value="Concrete Block">Concrete Block / CMU</option>
                      <option value="Stucco/Exterior">Stucco / Masonry Exterior</option>
                      <option value="Steel/Decking">Structural Steel / High Bay Decking</option>
                    </select>
                  </div>

                  {activeRow.category === "Wall" && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Door Deduct (sf/door)</label>
                        <input
                          type="number"
                          value={activeRow.doorDeductSqft}
                          onChange={(e) => handleUpdateRow(activeRow.id, { doorDeductSqft: parseFloat(e.target.value) || 21 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Window Deduct (sf/window)</label>
                        <input
                          type="number"
                          value={activeRow.windowDeductSqft}
                          onChange={(e) => handleUpdateRow(activeRow.id, { windowDeductSqft: parseFloat(e.target.value) || 15 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-400 font-mono space-y-1">
                    <div className="flex justify-between">
                      <span>Gross Area per Unit:</span>
                      <span className="text-white font-bold">{computeRowStats(activeRow, project.laborRatePerHour).totalGrossArea / Math.max(1, activeRow.qtyMultiplier)} sf</span>
                    </div>
                    <div className="flex justify-between text-blue-400">
                      <span>Deductions per Unit:</span>
                      <span>-{computeRowStats(activeRow, project.laborRatePerHour).totalDeductionArea / Math.max(1, activeRow.qtyMultiplier)} sf</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                      <span>Net Area (x{activeRow.qtyMultiplier} Units):</span>
                      <span>{computeRowStats(activeRow, project.laborRatePerHour).totalNetArea.toLocaleString()} sf</span>
                    </div>
                  </div>
                </div>

                {/* Paint Material Specs */}
                <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-amber-400" /> Paint Coating Specs
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={activeRow.paintBrand}
                        onChange={(e) => handleUpdateRow(activeRow.id, { paintBrand: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Product Line</label>
                      <input
                        type="text"
                        value={activeRow.paintLine}
                        onChange={(e) => handleUpdateRow(activeRow.id, { paintLine: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Coverage (sf/gal)</label>
                      <input
                        type="number"
                        value={activeRow.coverageRateSqftPerGal}
                        onChange={(e) => handleUpdateRow(activeRow.id, { coverageRateSqftPerGal: parseFloat(e.target.value) || 350 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Waste Factor (%)</label>
                      <input
                        type="number"
                        value={activeRow.wasteFactorPercent}
                        onChange={(e) => handleUpdateRow(activeRow.id, { wasteFactorPercent: parseFloat(e.target.value) || 10 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`primer-${activeRow.id}`}
                      checked={activeRow.includePrimer}
                      onChange={(e) => handleUpdateRow(activeRow.id, { includePrimer: e.target.checked })}
                      className="rounded accent-orange-500"
                    />
                    <label htmlFor={`primer-${activeRow.id}`} className="text-xs text-slate-300 font-bold cursor-pointer">
                      Include Dedicated Primer Coat ($32/gal)
                    </label>
                  </div>
                </div>

                {/* Labor Engine Specs */}
                <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Crew Labor Engine
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Production Speed</label>
                      <input
                        type="number"
                        value={activeRow.productionRate}
                        onChange={(e) => handleUpdateRow(activeRow.id, { productionRate: parseFloat(e.target.value) || 1 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Speed Unit</label>
                      <select
                        value={activeRow.productionRateUnit}
                        onChange={(e) => handleUpdateRow(activeRow.id, { productionRateUnit: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="sf/hr">sf / hour</option>
                        <option value="lf/hr">lf / hour</option>
                        <option value="hrs/unit">hrs / unit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Crew Labor Rate ($/hr)</label>
                    <input
                      type="number"
                      value={activeRow.laborRatePerHour}
                      onChange={(e) => handleUpdateRow(activeRow.id, { laborRatePerHour: parseFloat(e.target.value) || project.laborRatePerHour })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400 font-mono space-y-1">
                    <div className="flex justify-between">
                      <span>Calculated Hours:</span>
                      <span className="text-emerald-400 font-bold">{Math.round(computeRowStats(activeRow, project.laborRatePerHour).laborHours * 10) / 10} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Row Labor Cost:</span>
                      <span className="text-white font-bold">${Math.round(computeRowStats(activeRow, project.laborRatePerHour).totalRowLaborCost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Live Row Math Stacked Summary */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-2">
                      Assembly Cost Stack
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Finish Paint:</span>
                        <span className="font-mono text-white">${Math.round(computeRowStats(activeRow, project.laborRatePerHour).finishMaterialCost)}</span>
                      </div>
                      {activeRow.includePrimer && (
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">Primer Coat:</span>
                          <span className="font-mono text-white">${Math.round(computeRowStats(activeRow, project.laborRatePerHour).primerMaterialCost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Direct Labor:</span>
                        <span className="font-mono text-emerald-400">${Math.round(computeRowStats(activeRow, project.laborRatePerHour).totalRowLaborCost)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Direct Assembly Cost</span>
                    <span className="text-xl font-black text-white font-mono">
                      ${Math.round(computeRowStats(activeRow, project.laborRatePerHour).totalRowDirectCost).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* MAIN TAB 2: LIVE BID SUMMARY & VISUAL ANALYTICS */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Contract Price</span>
              <span className="text-3xl font-black text-orange-400 font-mono">${projectSummary.totalBidPrice.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Includes direct costs + {project.markupPercent}% markup</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Net Surface Area</span>
              <span className="text-3xl font-black text-white font-mono">{projectSummary.sumNetArea.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></span>
              <span className="text-[11px] text-blue-400 block mt-1">Gross: {projectSummary.sumGrossArea.toLocaleString()} sf (-{projectSummary.sumDeductionArea.toLocaleString()} sf openings)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Labor Hours</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{projectSummary.sumLaborHours} <span className="text-sm font-normal text-slate-400">hrs</span></span>
              <span className="text-[11px] text-emerald-400/80 block mt-1">~{projectSummary.crewDaysNeeded} Crew Days (4-person crew)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Paint & Primer</span>
              <span className="text-3xl font-black text-amber-400 font-mono">{projectSummary.totalGallons} <span className="text-sm font-normal text-slate-400">gallons</span></span>
              <span className="text-[11px] text-amber-300 block mt-1">{projectSummary.sumFinishGallons} gal finish + {projectSummary.sumPrimerGallons} gal primer</span>
            </div>
          </div>

          {/* Sanity Check Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Commercial $/SqFt Sanity Benchmark</h4>
                <p className="text-xs text-slate-400">
                  Current Bid Rate: <strong className="text-orange-400 font-mono text-sm">${projectSummary.pricePerSqFt} / sq ft</strong> (Commercial interior repaint range: $0.85 – $3.50/sf)
                </p>
              </div>
            </div>

            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-4 py-2 rounded-xl">
              ✅ Bid rate within healthy commercial profitability window
            </span>
          </div>

          {/* Stacked Cost Breakdown & Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-400" /> Commercial Bid Financial Stack
            </h3>

            {/* Visual Stacked Bar */}
            <div className="space-y-2">
              <div className="h-6 w-full bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800">
                <div
                  style={{ width: `${(projectSummary.totalMaterialsWithSundries / projectSummary.totalBidPrice) * 100}%` }}
                  className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  title="Materials & Sundries"
                >
                  Materials ({Math.round((projectSummary.totalMaterialsWithSundries / projectSummary.totalBidPrice) * 100)}%)
                </div>
                <div
                  style={{ width: `${(projectSummary.sumLaborCost / projectSummary.totalBidPrice) * 100}%` }}
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  title="Direct Labor"
                >
                  Labor ({Math.round((projectSummary.sumLaborCost / projectSummary.totalBidPrice) * 100)}%)
                </div>
                {project.equipmentRentalCost > 0 && (
                  <div
                    style={{ width: `${(project.equipmentRentalCost / projectSummary.totalBidPrice) * 100}%` }}
                    className="bg-blue-500 h-full flex items-center justify-center text-[10px] font-bold text-white"
                    title="Equipment Rental"
                  >
                    Equip
                  </div>
                )}
                <div
                  style={{ width: `${(projectSummary.markupAmount / projectSummary.totalBidPrice) * 100}%` }}
                  className="bg-orange-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  title="Gross Profit Margin"
                >
                  Margin ({projectSummary.grossProfitPercent}%)
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Materials & Supplies: <strong>${projectSummary.totalMaterialsWithSundries.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Labor Cost: <strong>${projectSummary.sumLaborCost.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Equipment / Lift: <strong>${project.equipmentRentalCost.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>Gross Profit Margin: <strong>${projectSummary.markupAmount.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Itemized Bid Summary Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Cost Category</th>
                    <th className="p-3">Basis / Volume</th>
                    <th className="p-3 text-right">Subtotal Amount</th>
                    <th className="p-3 text-right">% of Total Bid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-white">Paint & Primer Coatings</td>
                    <td className="p-3 text-slate-400">{projectSummary.totalGallons} total gallons required</td>
                    <td className="p-3 text-right font-mono text-white">${projectSummary.sumMaterialCost.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{Math.round((projectSummary.sumMaterialCost / projectSummary.totalBidPrice) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">Sundries & Consumables</td>
                    <td className="p-3 text-slate-400">{project.sundriesPercent}% allowance on paint cost</td>
                    <td className="p-3 text-right font-mono text-white">${projectSummary.sundriesCost.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{Math.round((projectSummary.sundriesCost / projectSummary.totalBidPrice) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">Direct Painting Crew Labor</td>
                    <td className="p-3 text-slate-400">{projectSummary.sumLaborHours} man-hours @ ${project.laborRatePerHour}/hr</td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-bold">${projectSummary.sumLaborCost.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{Math.round((projectSummary.sumLaborCost / projectSummary.totalBidPrice) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">Equipment & Scaffolding Rental</td>
                    <td className="p-3 text-slate-400">Lifts, pressure washers, masking units</td>
                    <td className="p-3 text-right font-mono text-blue-400">${project.equipmentRentalCost.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{Math.round((project.equipmentRentalCost / projectSummary.totalBidPrice) * 100)}%</td>
                  </tr>
                  <tr className="bg-slate-950 font-bold">
                    <td className="p-3 text-orange-400">Overhead & Gross Profit Markup</td>
                    <td className="p-3 text-slate-400">{project.markupPercent}% markup on direct costs</td>
                    <td className="p-3 text-right font-mono text-orange-400 text-sm font-black">${projectSummary.markupAmount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-orange-400">{projectSummary.grossProfitPercent}%</td>
                  </tr>
                  <tr className="bg-slate-950/80 font-black text-sm text-white">
                    <td className="p-4" colSpan={2}>TOTAL COMMERCIAL BID PROPOSAL PRICE</td>
                    <td className="p-4 text-right font-mono text-orange-400 text-base" colSpan={2}>
                      ${projectSummary.totalBidPrice.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* MAIN TAB 3: MASTER RATE CONFIGURATION */}
      {activeTab === "rates" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" /> Master Commercial Rate Controls
              </h3>
              <p className="text-xs text-slate-400">Every rate is fully editable to match your exact crew wages, production speeds, and profit margin expectations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Financial Margins */}
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Financial & Markup Defaults</h4>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Master Crew Labor Rate ($/hr)</label>
                <input
                  type="number"
                  value={project.laborRatePerHour}
                  onChange={(e) => setProject({ ...project, laborRatePerHour: parseFloat(e.target.value) || 48 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Gross Profit Markup (%)</label>
                <input
                  type="number"
                  value={project.markupPercent}
                  onChange={(e) => setProject({ ...project, markupPercent: parseFloat(e.target.value) || 35 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Sundries & Consumables (%)</label>
                <input
                  type="number"
                  value={project.sundriesPercent}
                  onChange={(e) => setProject({ ...project, sundriesPercent: parseFloat(e.target.value) || 5 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Equipment / Scaffolding Rental ($)</label>
                <input
                  type="number"
                  value={project.equipmentRentalCost}
                  onChange={(e) => setProject({ ...project, equipmentRentalCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Crew Production Benchmark Guidelines */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 col-span-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Standard Commercial Crew Production Benchmarks</h4>
              <p className="text-xs text-slate-400 mb-2">Reference standards for commercial crew speeds incorporated into assembly calculations:</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="font-bold text-white block">Cut & Roll Walls</span>
                  <span className="text-emerald-400 font-mono text-xs">150 – 200 sqft / hour</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">2 painters: 1 cutter, 1 roller</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="font-bold text-white block">Airless Spray Walls / Ceilings</span>
                  <span className="text-emerald-400 font-mono text-xs">350 – 500 sqft / hour</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Includes back-rolling setup</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="font-bold text-white block">Baseboards & Trim</span>
                  <span className="text-amber-400 font-mono text-xs">60 – 90 linear feet / hour</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Brush cut-in application</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="font-bold text-white block">Hollow Metal Doors & Frames</span>
                  <span className="text-blue-400 font-mono text-xs">0.30 – 0.50 hours / door</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Light sand & roller coat</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MAIN TAB 4: SAVED PROJECTS & COMMERCIAL TEMPLATES */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" /> Pre-Packaged Commercial Assembly Templates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TAKEOFF_TEMPLATES.map(tpl => (
                <div key={tpl.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 inline-block mb-1">
                      {tpl.buildingType}
                    </span>
                    <h4 className="font-bold text-white text-sm">{tpl.projectName}</h4>
                    <p className="text-xs text-slate-400 mt-1">{tpl.notes}</p>
                    <div className="text-[11px] text-slate-500 mt-2 font-mono">
                      {tpl.rows.length} Assembly Rows  |  Default Rate: ${tpl.laborRatePerHour}/hr
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadTemplate(tpl)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition cursor-pointer"
                  >
                    Load Template into Takeoff Engine
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Projects List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Your Saved Takeoff Projects ({savedProjects.length})
            </h3>

            <div className="space-y-2">
              {savedProjects.map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{p.projectName}</h4>
                    <p className="text-[11px] text-slate-400">{p.clientName} &bull; {p.address}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProject(p);
                      setSelectedRowId(p.rows[0]?.id || null);
                      setActiveTab("takeoff");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-700 transition"
                  >
                    Open Takeoff
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
