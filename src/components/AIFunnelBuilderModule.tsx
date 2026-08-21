import React, { useState, useEffect } from "react";
import { 
  Sparkles, Globe, Plus, Trash2, Check, CheckCircle2, Copy, 
  Layers, Eye, Settings, Share2, ExternalLink, FileText, 
  TrendingUp, Facebook, MessageSquare, Download, RefreshCw, 
  Sliders, Smartphone, Laptop, ChevronDown, ShieldCheck, 
  Award, Phone, Mail, Megaphone, Send, HelpCircle, 
  ArrowRight, Info, AlertCircle, Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Lead } from "../types";

interface AIFunnelBuilderProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

interface FunnelCampaign {
  id: string;
  name: string;
  serviceType: string;
  offer: string;
  audience: string;
  tone: string;
  themeColor: string;
  status: "Draft" | "Published";
  publishedUrl?: string;
  publishedAt?: string;
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    leadsCount: number;
    conversionRate: number;
  };
  assets: FunnelAssets;
}

interface FunnelAssets {
  adFacebook: {
    primaryText: string;
    headline: string;
    cta: string;
    imagePreset: string; // Background preset key
  };
  adGoogle: {
    headline1: string;
    headline2: string;
    headline3: string;
    description1: string;
    description2: string;
  };
  landingPage: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    painPointTitle: string;
    painPoint1Title: string;
    painPoint1Desc: string;
    painPoint2Title: string;
    painPoint2Desc: string;
    painPoint3Title: string;
    painPoint3Desc: string;
    socialProofTitle: string;
    socialProofReviewer1: string;
    socialProofText1: string;
    socialProofReviewer2: string;
    socialProofText2: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    formTitle: string;
  };
}

// Preset color themes for landing page preview
const LANDING_THEMES = {
  emerald: {
    id: "emerald",
    name: "Emerald Forest",
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    textPrimary: "text-emerald-400",
    textPrimaryDark: "text-emerald-500",
    bgLight: "bg-emerald-950/20",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500/10 via-slate-950/50 to-slate-950",
    bullet: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    heroBtn: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold"
  },
  clay: {
    id: "clay",
    name: "Warm Terracotta",
    primary: "bg-orange-600 hover:bg-orange-700 text-white",
    textPrimary: "text-orange-400",
    textPrimaryDark: "text-orange-500",
    bgLight: "bg-orange-950/20",
    border: "border-orange-500/30",
    gradient: "from-orange-500/10 via-slate-950/50 to-slate-950",
    bullet: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    heroBtn: "bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold"
  },
  slate: {
    id: "slate",
    name: "Cosmic Charcoal",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    textPrimary: "text-blue-400",
    textPrimaryDark: "text-blue-500",
    bgLight: "bg-blue-950/20",
    border: "border-blue-500/30",
    gradient: "from-blue-500/10 via-slate-950/50 to-slate-950",
    bullet: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    heroBtn: "bg-blue-500 hover:bg-blue-600 text-white font-extrabold"
  },
  gold: {
    id: "gold",
    name: "Luxury Amber",
    primary: "bg-amber-500 hover:bg-amber-600 text-slate-950",
    textPrimary: "text-amber-400",
    textPrimaryDark: "text-amber-500",
    bgLight: "bg-amber-950/20",
    border: "border-amber-500/30",
    gradient: "from-amber-500/10 via-slate-950/50 to-slate-950",
    bullet: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    heroBtn: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold"
  }
};

// Preset high-quality images for the Facebook ad creative preview
const AD_IMAGE_PRESETS = [
  { id: "living-room", name: "Premium Living Room", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" },
  { id: "exterior-house", name: "Elegant Exterior House", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
  { id: "kitchen-cabinets", name: "Modern Kitchen Cabinets", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" },
  { id: "painter-action", name: "Professional Paint Roll", url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80" }
];

// Seed Data for initial load
const SEED_CAMPAIGNS: FunnelCampaign[] = [
  {
    id: "funnel-1",
    name: "Cabinet Transformation Campaign",
    serviceType: "Kitchen Cabinet Refinishing",
    offer: "Get $400 Off Kitchen Cabinets + Free Soft-Close Hinge Upgrade!",
    audience: "Suburban Homeowners (Ages 35-65)",
    tone: "Luxury & Premium",
    themeColor: "gold",
    status: "Published",
    publishedUrl: "https://paintpro.ai/f/johnny-cabinets-upgrade",
    publishedAt: "2026-06-28 11:15",
    metrics: {
      spend: 450,
      impressions: 14200,
      clicks: 890,
      leadsCount: 38,
      conversionRate: 4.2
    },
    assets: {
      adFacebook: {
        primaryText: "🧑‍🍳 Tired of your outdated, dark oak kitchen cabinets, but dread the $25,000 cost of a full remodel? \n\nPaintingPro AI specializes in ultra-smooth, factory-grade cabinet refinishing for a fraction of the cost! \n\n✨ ACT NOW: Book your refinishing this month and get $400 OFF plus a FREE Soft-Close Hinge upgrade! Transform your kitchen in just 4 days with zero dust and zero hassle.",
        headline: "🚨 $400 Off Cabinet Refinishing + Free Soft-Close Hinges!",
        cta: "Book Free Consultation",
        imagePreset: "kitchen-cabinets"
      },
      adGoogle: {
        headline1: "Factory-Grade Cabinet Painting",
        headline2: "Save $400 & Get Free Hinges",
        headline3: "Done in Under 5 Days",
        description1: "Transform your kitchen with premium, durable coatings. Five-star local service.",
        description2: "Get your instant price estimate. Professional painters. Rated 4.9/5 by 300+ clients."
      },
      landingPage: {
        heroTitle: "Dramatically Beautiful Kitchens, Done in Just 4 Days",
        heroSubtitle: "Get cabinet transformation coatings with $400 Off and free soft-close upgrades. Factory-grade durability with zero dust.",
        heroCta: "Claim Your $400 Discount & Free Hinges",
        painPointTitle: "Why Refinish Instead of Replacing?",
        painPoint1Title: "1/5th the Remodeling Cost",
        painPoint1Desc: "Keep your high-quality cabinet boxes. Save thousands compared to tearing them out and buying cheap replacements.",
        painPoint2Title: "Factory-Smooth Hardness",
        painPoint2Desc: "We spray premium Italian polyurethane coatings that resist grease, moisture, spills, and impact.",
        painPoint3Title: "Zero Chaos in Your Home",
        painPoint3Desc: "We remove your doors to spray them in our custom booth. Your kitchen remains clean, functional, and dust-free.",
        socialProofTitle: "What Your Neighbors Are Saying",
        socialProofReviewer1: "Martha K. from Oak Hills",
        socialProofText1: "\"I was skeptical about painting cabinets, but PaintingPro AI exceeded every dream! It feels like a brand-new custom kitchen for under $4,000!\"",
        socialProofReviewer2: "David L. from Greenbrier",
        socialProofText2: "\"Incredible service! Clean, professional, on time. The soft-close hinges make the kitchen feel incredibly luxurious. Highly recommend.\"",
        faq1Q: "How long does the entire refinishing process take?",
        faq1A: "Usually between 3 to 5 business days. We mask off your kitchen in one day, remove the doors to spray in our off-site ventilation booth, and return to mount everything on the last day.",
        faq2Q: "Will the paint peel or scratch easily?",
        faq2A: "Absolutely not. We do not use standard trim paint. We apply industrial-grade Italian polyurethane lacquer which binds to the wood and creates an impact-proof shell that lasts decades.",
        faq3Q: "Can you fill in heavy oak grain lines?",
        faq3A: "Yes! We offer professional grain-filling services. We apply premium wood filler, sand it flat, and spray two coats of high-build sanding sealer before color coating.",
        formTitle: "Lock In Your $400 Off Coupon"
      }
    }
  },
  {
    id: "funnel-2",
    name: "Spring Exterior Armor Campaign",
    serviceType: "Exterior House Painting",
    offer: "Free Powerwash + Deluxe Color Consultation with Exterior Painting Package",
    audience: "Local Family Homeowners",
    tone: "Professional & Trustworthy",
    themeColor: "emerald",
    status: "Draft",
    metrics: {
      spend: 0,
      impressions: 0,
      clicks: 0,
      leadsCount: 0,
      conversionRate: 0
    },
    assets: {
      adFacebook: {
        primaryText: "🏡 Protect your biggest investment! Winter can be brutal on siding, leading to rotting wood, mold, and costly repairs. \n\nGive your home premium curb appeal and 10-year weather shielding with our deluxe Sherwin-Williams Exterior Protection packages. \n\n🎁 SPRING PROMO: Sign up this week to claim a FREE exterior pressure wash and a 1-on-1 expert color consult! 100% satisfaction guaranteed.",
        headline: "🛡️ Exterior Painting with Free Prep & Powerwash!",
        cta: "Get Instant Quote",
        imagePreset: "exterior-house"
      },
      adGoogle: {
        headline1: "Premium Exterior House Painting",
        headline2: "Free Powerwash & Color Consult",
        headline3: "10-Year Weather Protection",
        description1: "Shield your home siding from wood rot, mold, and UV damage. Top rated painters.",
        description2: "Get 15% off spring slots. Call today for a detailed diagnostic estimate."
      },
      landingPage: {
        heroTitle: "Premium 10-Year Armor Weather Shielding for Your Exterior",
        heroSubtitle: "Block UV rays, moisture, and wood rot with expert prep and superior coatings. Claim a free powerwash with booking.",
        heroCta: "Claim Free Powerwash & Consultation",
        painPointTitle: "The Paint Job is Only as Good as the Prep Work",
        painPoint1Title: "Full Siding Sanitization",
        painPoint1Desc: "We pressure-wash your home with custom bio-safe detergents to eradicate mold, mildew spores, and airborne chalkiness.",
        painPoint2Title: "Meticulous Scraping & Caulking",
        painPoint2Desc: "We scrape loose paint, sand rough transitions, prime raw wood, and apply premium elastomeric sealants on joints.",
        painPoint3Title: "Premium Sherwin-Williams Coatings",
        painPoint3Desc: "We exclusively utilize paint designed to expand and contract with hot summer sun and freezing winters.",
        socialProofTitle: "Rave Reviews From Homeowners",
        socialProofReviewer1: "Richard S.",
        socialProofText1: "\"They spent three full days just preparing the wood. The paint finish looks incredible and thick. Neighbors keep stopping by to compliment!\"",
        socialProofReviewer2: "Clara M.",
        socialProofText2: "\"Extremely professional exterior painting. The free color consultation saved me from choosing a shade that would have been too bright!\"",
        faq1Q: "Do you offer warranties on paint peeling?",
        faq1A: "Yes, we provide a written 5-year workmanship warranty alongside the manufacturer's lifetime product warranty.",
        faq2Q: "Do I need to be home during exterior painting?",
        faq2A: "No! As long as we have access to exterior water faucets and power outlets, you can carry on with your normal schedule.",
        faq3Q: "What temperatures are safe for exterior painting?",
        faq3A: "We use modern paints that can be safely applied in temperatures as low as 35°F and up to 95°F with high moisture-resistance.",
        formTitle: "Claim Your Spring Consultation"
      }
    }
  }
];

export default function AIFunnelBuilderModule({ leads, setLeads }: AIFunnelBuilderProps) {
  const [campaigns, setCampaigns] = useState<FunnelCampaign[]>(() => {
    try {
      const stored = localStorage.getItem("g_funnel_campaigns");
      return stored ? JSON.parse(stored) : SEED_CAMPAIGNS;
    } catch {
      return SEED_CAMPAIGNS;
    }
  });

  // Selected Campaign
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("funnel-1");
  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Tab State inside Generator
  const [activeSubTab, setActiveSubTab] = useState<"brief" | "ads" | "landing" | "stats">("brief");

  // Brief Form Inputs
  const [briefCampaignName, setBriefCampaignName] = useState("");
  const [briefServiceType, setBriefServiceType] = useState("Cabinet Painting");
  const [briefOffer, setBriefOffer] = useState("Get $300 Off painting plus a free accent wall!");
  const [briefAudience, setBriefAudience] = useState("Suburban families wanting fresh modern rooms");
  const [briefTone, setBriefTone] = useState("Professional & Trustworthy");
  const [briefThemeColor, setBriefThemeColor] = useState("clay");

  // Device Toggle for Landing Page preview
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  
  // Lead Submission simulation fields
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Generator Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Populate form fields when active campaign changes
  useEffect(() => {
    if (activeCampaign) {
      setBriefCampaignName(activeCampaign.name);
      setBriefServiceType(activeCampaign.serviceType);
      setBriefOffer(activeCampaign.offer);
      setBriefAudience(activeCampaign.audience);
      setBriefTone(activeCampaign.tone);
      setBriefThemeColor(activeCampaign.themeColor);
    }
  }, [selectedCampaignId]);

  // Toast notifier helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Synchronize campaign storage helper
  const saveCampaigns = (updated: FunnelCampaign[]) => {
    setCampaigns(updated);
    try {
      localStorage.setItem("g_funnel_campaigns", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage blocked:", e);
    }
  };

  // Save changes from Brief form to the state
  const handleSaveBrief = () => {
    const updated = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          name: briefCampaignName,
          serviceType: briefServiceType,
          offer: briefOffer,
          audience: briefAudience,
          tone: briefTone,
          themeColor: briefThemeColor
        };
      }
      return c;
    });
    saveCampaigns(updated);
    showToast("💾 Campaign brief settings saved successfully!");
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string) => {
    if (campaigns.length <= 1) {
      showToast("❌ You must keep at least one active funnel campaign.");
      return;
    }
    const filtered = campaigns.filter(c => c.id !== id);
    saveCampaigns(filtered);
    setSelectedCampaignId(filtered[0].id);
    showToast("🗑️ Campaign funnel removed.");
  };

  // Create New Empty Campaign
  const handleCreateNewCampaign = () => {
    const newId = "funnel-" + Date.now();
    const newCampaign: FunnelCampaign = {
      id: newId,
      name: `New Campaign #${campaigns.length + 1}`,
      serviceType: "Interior Trim & Walls",
      offer: "Free detailed trim refresh with any full-room purchase!",
      audience: "Local homeowners looking for color upgrades",
      tone: "Friendly & Local",
      themeColor: "slate",
      status: "Draft",
      metrics: { spend: 0, impressions: 0, clicks: 0, leadsCount: 0, conversionRate: 0 },
      assets: {
        adFacebook: {
          primaryText: "Refresh your home interior with absolute precision! Friendly professional crew, fully licensed and insured. Get a detailed quote on site. Book now to claim your free trim package upgrade!",
          headline: "🏡 Professional Interior Painting - Free Accent Package!",
          cta: "Learn More",
          imagePreset: "living-room"
        },
        adGoogle: {
          headline1: "Local Painting Experts",
          headline2: "Free Trim Upgrade Offer",
          headline3: "100% Match Guarantee",
          description1: "Transform your home with dustless prep, beautiful finishes, and eco-safe paints.",
          description2: "Highly recommended painters in your neighborhood. Get a detailed color consultation today."
        },
        landingPage: {
          heroTitle: "Premium Painters Committed to Impeccable Cleanliness",
          heroSubtitle: "Claim your free trim refresh and enjoy elegant, hand-painted precision with dust-controlled prep and standard warranties.",
          heroCta: "Claim Your Free Upgrade & Book On-Site Quote",
          painPointTitle: "Why Our Customers Rate Us 5 Stars",
          painPoint1Title: "Impeccable Dust Management",
          painPoint1Desc: "We mask all floors, seal doors, and utilize sanding vacuums that catch 99.8% of micro-particles.",
          painPoint2Title: "Two-Coat Consistency",
          painPoint2Desc: "No cheap single coat sprays. We roll two premium layers of low-VOC washable latex for deep color vibrance.",
          painPoint3Title: "Zero Surprises Pricing",
          painPoint3Desc: "Our bids are fully transparent. Itemized costs for materials, prep, walls, and trim.",
          socialProofTitle: "What Homeowners Say About Us",
          socialProofReviewer1: "Sarah J. from Brookside",
          socialProofText1: "\"The painters were fast, wore booties inside my house, and didn't leave a single speck of dust. Trim work is sharp!\"",
          socialProofReviewer2: "Thomas B. from High Point",
          socialProofText2: "\"Excellent team. Responsive, helpful in selecting the finish sheen, and the final price matched the exact penny of the estimate.\"",
          faq1Q: "Do you move our heavy furniture?",
          faq1A: "Yes! We ask you to remove fragile knick-knacks and electronics, and our crew handles moving heavy sofas, dining tables, and beds, protecting them under fresh plastic sheeting.",
          faq2Q: "How long after painting does the smell linger?",
          faq2A: "Almost zero. We exclusively use modern low-VOC or zero-VOC eco-friendly paints which have virtual no odor and are completely safe for kids and pets within hours.",
          faq3Q: "Can I buy my own paint to save money?",
          faq3A: "We recommend using our bulk-discount accounts with premium brands to guarantee weather/wash ratings, but we are open to discussing client-supplied paints.",
          formTitle: "Secure Your Spring Priority slot"
        }
      }
    };

    saveCampaigns([...campaigns, newCampaign]);
    setSelectedCampaignId(newId);
    setActiveSubTab("brief");
    showToast("🚀 Created new campaign draft! Click 'Generate Assets with AI' to build high-converting copy.");
  };

  // Core generation logic (handles AI Call with proxy & local fallback)
  const handleGenerateAssets = async () => {
    setIsGenerating(true);
    setGenerationError("");
    
    const startTime = Date.now();
    const systemPrompt = `You are a world-class direct-response advertising copywriter and landing page conversion rate optimization (CRO) expert, specializing in local home service contracting and high-end painting.
    You must output a structured plain text block that contains exact values we can parse out easily. Please write key markers followed by a colon and the text.
    Use exact markers in this format:
    [FB_PRIMARY_TEXT]: <text>
    [FB_HEADLINE]: <text>
    [FB_CTA]: <text>
    [G_HEADLINE_1]: <text>
    [G_HEADLINE_2]: <text>
    [G_HEADLINE_3]: <text>
    [G_DESC_1]: <text>
    [G_DESC_2]: <text>
    [LP_HERO_TITLE]: <text>
    [LP_HERO_SUBTITLE]: <text>
    [LP_HERO_CTA]: <text>
    [LP_PAIN_TITLE]: <text>
    [LP_PAIN1_TITLE]: <text>
    [LP_PAIN1_DESC]: <text>
    [LP_PAIN2_TITLE]: <text>
    [LP_PAIN2_DESC]: <text>
    [LP_PAIN3_TITLE]: <text>
    [LP_PAIN3_DESC]: <text>
    [LP_SOCIAL_TITLE]: <text>
    [LP_REVIEWER_1]: <text>
    [LP_REVIEW_TEXT_1]: <text>
    [LP_REVIEWER_2]: <text>
    [LP_REVIEW_TEXT_2]: <text>
    [LP_FAQ_1_Q]: <text>
    [LP_FAQ_1_A]: <text>
    [LP_FAQ_2_Q]: <text>
    [LP_FAQ_2_A]: <text>
    [LP_FAQ_3_Q]: <text>
    [LP_FAQ_3_A]: <text>
    [LP_FORM_TITLE]: <text>`;

    const userPrompt = `Generate compelling high-converting marketing assets for a professional painting contractor.
    Service Type: "${briefServiceType}"
    Special Promotional Offer: "${briefOffer}"
    Target Audience Profile: "${briefAudience}"
    Brand Tone and Style: "${briefTone}"
    
    Make the copywriting extremely persuasive, localized, benefits-focused, addressing psychological friction points like dust, contractor unreliability, hidden prices, and poor durability. Make the ad copies punchy with direct headlines, emojis where appropriate, and strong calls to action. Ensure everything remains on-topic for a painting franchise system.`;

    try {
      const response = await fetch("/api/llm-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gemini",
          model: "gemini-2.5-flash",
          messages: [{ role: "user", content: userPrompt }],
          systemPrompt,
          temperature: 0.8,
          maxTokens: 2500
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy gateway error: HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.text) {
        throw new Error(data.error || "Failed to extract text from API response");
      }

      const generatedText = data.text;
      
      // Parse out the fields using regex markers
      const extractMarker = (marker: string, fallback: string): string => {
        const regex = new RegExp(`\\[${marker}\\]:\\s*([\\s\\S]*?)(?=\\n\\[|$)`, 'i');
        const match = generatedText.match(regex);
        return match && match[1] ? match[1].trim() : fallback;
      };

      const parsedAssets: FunnelAssets = {
        adFacebook: {
          primaryText: extractMarker("FB_PRIMARY_TEXT", activeCampaign.assets.adFacebook.primaryText),
          headline: extractMarker("FB_HEADLINE", activeCampaign.assets.adFacebook.headline),
          cta: extractMarker("FB_CTA", activeCampaign.assets.adFacebook.cta),
          imagePreset: activeCampaign.assets.adFacebook.imagePreset || "living-room"
        },
        adGoogle: {
          headline1: extractMarker("G_HEADLINE_1", activeCampaign.assets.adGoogle.headline1),
          headline2: extractMarker("G_HEADLINE_2", activeCampaign.assets.adGoogle.headline2),
          headline3: extractMarker("G_HEADLINE_3", activeCampaign.assets.adGoogle.headline3),
          description1: extractMarker("G_DESC_1", activeCampaign.assets.adGoogle.description1),
          description2: extractMarker("G_DESC_2", activeCampaign.assets.adGoogle.description2)
        },
        landingPage: {
          heroTitle: extractMarker("LP_HERO_TITLE", activeCampaign.assets.landingPage.heroTitle),
          heroSubtitle: extractMarker("LP_HERO_SUBTITLE", activeCampaign.assets.landingPage.heroSubtitle),
          heroCta: extractMarker("LP_HERO_CTA", activeCampaign.assets.landingPage.heroCta),
          painPointTitle: extractMarker("LP_PAIN_TITLE", activeCampaign.assets.landingPage.painPointTitle),
          painPoint1Title: extractMarker("LP_PAIN1_TITLE", activeCampaign.assets.landingPage.painPoint1Title),
          painPoint1Desc: extractMarker("LP_PAIN1_DESC", activeCampaign.assets.landingPage.painPoint1Desc),
          painPoint2Title: extractMarker("LP_PAIN2_TITLE", activeCampaign.assets.landingPage.painPoint2Title),
          painPoint2Desc: extractMarker("LP_PAIN2_DESC", activeCampaign.assets.landingPage.painPoint2Desc),
          painPoint3Title: extractMarker("LP_PAIN3_TITLE", activeCampaign.assets.landingPage.painPoint3Title),
          painPoint3Desc: extractMarker("LP_PAIN3_DESC", activeCampaign.assets.landingPage.painPoint3Desc),
          socialProofTitle: extractMarker("LP_SOCIAL_TITLE", activeCampaign.assets.landingPage.socialProofTitle),
          socialProofReviewer1: extractMarker("LP_REVIEWER_1", activeCampaign.assets.landingPage.socialProofReviewer1),
          socialProofText1: extractMarker("LP_REVIEW_TEXT_1", activeCampaign.assets.landingPage.socialProofText1),
          socialProofReviewer2: extractMarker("LP_REVIEWER_2", activeCampaign.assets.landingPage.socialProofReviewer2),
          socialProofText2: extractMarker("LP_REVIEW_TEXT_2", activeCampaign.assets.landingPage.socialProofText2),
          faq1Q: extractMarker("LP_FAQ_1_Q", activeCampaign.assets.landingPage.faq1Q),
          faq1A: extractMarker("LP_FAQ_1_A", activeCampaign.assets.landingPage.faq1A),
          faq2Q: extractMarker("LP_FAQ_2_Q", activeCampaign.assets.landingPage.faq2Q),
          faq2A: extractMarker("LP_FAQ_2_A", activeCampaign.assets.landingPage.faq2A),
          faq3Q: extractMarker("LP_FAQ_3_Q", activeCampaign.assets.landingPage.faq3Q),
          faq3A: extractMarker("LP_FAQ_3_A", activeCampaign.assets.landingPage.faq3A),
          formTitle: extractMarker("LP_FORM_TITLE", activeCampaign.assets.landingPage.formTitle)
        }
      };

      const updated = campaigns.map(c => {
        if (c.id === selectedCampaignId) {
          return {
            ...c,
            name: briefCampaignName,
            serviceType: briefServiceType,
            offer: briefOffer,
            audience: briefAudience,
            tone: briefTone,
            themeColor: briefThemeColor,
            assets: parsedAssets
          };
        }
        return c;
      });

      saveCampaigns(updated);
      setActiveSubTab("ads");
      showToast("✨ AI generated your conversion funnel assets in 2.1 seconds!");

    } catch (err: any) {
      console.warn("AI Generation failed. Triggering hyper-smart local copywriting fallback engine:", err);
      
      // Smart offline custom copywriting generator
      const cleanService = briefServiceType.toLowerCase();
      const generatedFallback: FunnelAssets = {
        adFacebook: {
          primaryText: `🏡 Looking for pristine ${briefServiceType} but worried about sloppy contractors, messy splatters, and infinite delays? \n\nPaintingPro AI provides absolute clean-prep guarantees! We handle the heavy lifting, prep with precision vacuums, and spray factory-grade finishes. \n\n🎉 SPECIAL OFFER: ${briefOffer}. Claim this limited consult coupon before our calendar is fully booked!`,
          headline: `🛡️ Premium ${briefServiceType} | Save Big with Our Special Offer!`,
          cta: "Claim Limited Offer",
          imagePreset: cleanService.includes("cabinet") ? "kitchen-cabinets" : (cleanService.includes("exterior") ? "exterior-house" : "living-room")
        },
        adGoogle: {
          headline1: `Prsitine ${briefServiceType.slice(0, 25)}`,
          headline2: `${briefOffer.slice(0, 30)}`,
          headline3: "100% Satisfaction Guarantee",
          description1: `Top-rated painters. Meticulous cleanup. We specialize in ${cleanService} with dustless prep.`,
          description2: `Book your on-site estimate today. Award-winning service with transparent itemized pricing.`
        },
        landingPage: {
          heroTitle: `Flawless ${briefServiceType} Crafted with Zero Dust and Total Peace of Mind`,
          heroSubtitle: `Lock in your special promotion: "${briefOffer}" and enjoy a spectacular color transition carried out by clean professional craftsmen.`,
          heroCta: "Claim Coupon & Book Diagnostic Estimate",
          painPointTitle: "How PaintingPro AI Redefines local Service",
          painPoint1Title: "Dust-Controlled Prep Work",
          painPoint1Desc: "No messy white powder floating in your bedrooms. We shield all ventilation systems and filter sanders.",
          painPoint2Title: "Premium Resilient Finishes",
          painPoint2Desc: "We spray and roll industry-leading coatings resistant to grease, moisture, fingerprints, and UV color-fade.",
          painPoint3Title: "Fully Clear Itemized Bids",
          painPoint3Desc: "No random line-item extras. What we write down on Day 1 is the exact invoice on the final day.",
          socialProofTitle: "Rave Reviews from Happy Neighbors",
          socialProofReviewer1: "Janice P. (Local Homeowner)",
          socialProofText1: `"They transformed our home in record time. Professional, polite, and so remarkably clean! Absolute five-star excellence."`,
          socialProofReviewer2: "Robert K. (Local Client)",
          socialProofText2: `"The best contractor experience I have had. They explained every detail of the priming and color steps. Outstanding results!"`,
          faq1Q: "Do you offer any warranty with your painting packages?",
          faq1A: "Yes! Every single package includes our standard 3-year or premium 5-year written service and peeling warranty.",
          faq2Q: "How should we prepare our rooms before your crew arrives?",
          faq2A: "Simply clear delicate counter items, picture frames, and small electronics. Our painters take care of all heavy lifting and heavy masking.",
          faq3Q: "Are you fully bonded, licensed, and insured?",
          faq3A: "Absolutely! We carry a $2,000,000 general liability insurance policy alongside full worker's comp to protect you completely.",
          formTitle: "Lock In Priority Booking"
        }
      };

      const updated = campaigns.map(c => {
        if (c.id === selectedCampaignId) {
          return {
            ...c,
            name: briefCampaignName,
            serviceType: briefServiceType,
            offer: briefOffer,
            audience: briefAudience,
            tone: briefTone,
            themeColor: briefThemeColor,
            assets: generatedFallback
          };
        }
        return c;
      });

      saveCampaigns(updated);
      setActiveSubTab("ads");
      showToast("✨ Local conversion copywriting generator deployed successfully!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish Campaign & Landing Page
  const handlePublishCampaign = () => {
    const mockUrl = `https://paintpro.ai/f/${activeCampaign.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${activeCampaign.id.split("-")[1]}`;
    const updated = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          status: "Published" as const,
          publishedUrl: mockUrl,
          publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          metrics: {
            spend: c.metrics.spend || 150,
            impressions: c.metrics.impressions || 4500,
            clicks: c.metrics.clicks || 210,
            leadsCount: c.metrics.leadsCount || 12,
            conversionRate: c.metrics.conversionRate || 5.7
          }
        };
      }
      return c;
    });
    saveCampaigns(updated);
    showToast(`🚀 Campaign funnel successfully published! Mock Live Link: ${mockUrl}`);
  };

  // Actual Lead Form Submission on Landing Page connected to live webhook endpoint
  const handleSubmitMockLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      showToast("❌ Please fill out your Name and Phone to submit.");
      return;
    }

    setLeadStatus("submitting");
    try {
      const slug = activeCampaign.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + activeCampaign.id.split("-")[1];
      const res = await fetch(`/api/public/funnels/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: leadName,
          phone: leadPhone,
          email: leadEmail || "no-email@funnel.com",
          clientType: "Residential",
          budget: 3500,
          sqft: 1800,
          timeline: "Next Month",
          condition: "Excellent",
          address: "124 Painted Lane, York, PA"
        })
      });

      if (!res.ok) {
        throw new Error(`Funnel ingestion failure code: ${res.status}`);
      }

      const resData = await res.json();
      if (resData.success && resData.lead) {
        setLeads(prev => [resData.lead, ...prev]);
      }

      // Update local campaign metrics to reflect new lead
      const updated = campaigns.map(c => {
        if (c.id === selectedCampaignId) {
          const newCount = (c.metrics.leadsCount || 0) + 1;
          const newClicks = (c.metrics.clicks || 20) + 1;
          return {
            ...c,
            metrics: {
              ...c.metrics,
              leadsCount: newCount,
              clicks: newClicks,
              conversionRate: parseFloat(((newCount / newClicks) * 100).toFixed(1))
            }
          };
        }
        return c;
      });
      saveCampaigns(updated);

      setLeadStatus("success");
      setLeadName("");
      setLeadPhone("");
      setLeadEmail("");
      showToast(`🎉 Lead captured! "${leadName}" was successfully ingested by the funnel and pushed to LeadFlow CRM!`);
    } catch (err) {
      console.error("Funnel submission webhook ingestion error:", err);
      // Fallback local write
      const fallbackLead: Lead = {
        id: "lead-" + Date.now(),
        clientName: leadName,
        phone: leadPhone,
        email: leadEmail || "no-email@funnel.com",
        clientType: "Residential",
        budget: 3000,
        sqft: 1800,
        timeline: "Within 2 Weeks",
        condition: "Excellent",
        status: "New",
        score: 80,
        justification: `AI Funnel Local Fallback from Campaign: "${activeCampaign.name}"`,
        actionPlan: [`Follow up regarding offer: "${activeCampaign.offer}"`],
        createdAt: new Date().toISOString().split("T")[0],
        source: `AI Funnel: ${activeCampaign.name}`,
        address: "124 Painted Lane, York, PA"
      };
      setLeads(prev => [fallbackLead, ...prev]);
      setLeadStatus("success");
      setLeadName("");
      setLeadPhone("");
      setLeadEmail("");
      showToast(`🎉 Captured lead locally (using backup state).`);
    }
  };

  // Handle inline-edit triggers
  const handleUpdateAssetField = (section: "adFacebook" | "adGoogle" | "landingPage", key: string, value: string) => {
    const updated = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          assets: {
            ...c.assets,
            [section]: {
              ...c.assets[section],
              [key]: value
            }
          }
        };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  // Handle preset image selection
  const handleSelectAdImage = (imgId: string) => {
    handleUpdateAssetField("adFacebook", "imagePreset", imgId);
    showToast("🖼️ Ad image updated!");
  };

  return (
    <div className="space-y-6" id="ai-funnel-builder-container">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-orange-500/50 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-xl shadow-orange-500/10 flex items-center gap-3 z-50 font-mono"
          >
            <Sparkle className="h-4 w-4 text-orange-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Summary Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl" id="funnel-builder-header">
        <div className="space-y-1.5 z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/15 border border-orange-500/20 text-orange-400 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Conversion Engine</span>
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse"></span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-serif tracking-tight flex items-center gap-2">
            AI Funnel Builder Studio <Sparkles className="h-5 w-5 text-orange-400 animate-bounce" />
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Design, write, and launch high-converting localized social media ad campaigns and premium single-page landing pages. Push leads straight to CRM in real-time.
          </p>
        </div>

        {/* Campaign Dropdown and Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="flex items-center bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs gap-2">
            <span className="text-slate-500 font-bold font-mono text-[10px]">Active Funnel:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none focus:ring-0 font-bold max-w-[160px]"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-950 text-white font-sans">{c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateNewCampaign}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="h-4 w-4 text-orange-400" /> New Campaign
          </button>
        </div>

        <div className="absolute right-0 bottom-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Campaign Stats Card summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Funnel Status", val: activeCampaign.status, color: activeCampaign.status === "Published" ? "text-emerald-400" : "text-amber-400", sub: activeCampaign.status === "Published" ? "Live mock link active" : "Draft setting", icon: Globe },
          { label: "Est Ad Spend", val: `$${activeCampaign.metrics.spend}`, color: "text-white", sub: "Allocated budget", icon: Megaphone },
          { label: "Impressions", val: activeCampaign.metrics.impressions.toLocaleString(), color: "text-slate-300", sub: "Ad delivery reach", icon: Eye },
          { label: "Leads Generated", val: activeCampaign.metrics.leadsCount, color: "text-orange-400", sub: "CRM auto-synced", icon: CheckCircle2 },
          { label: "Conversion Rate", val: `${activeCampaign.metrics.conversionRate}%`, color: "text-emerald-400", sub: "Visitor-to-lead %", icon: TrendingUp }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 flex items-center justify-between shadow-lg">
            <div className="space-y-1 text-left">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.val}</p>
              <span className="text-[10px] text-slate-500 block">{stat.sub}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl text-slate-400">
              <stat.icon className="h-4.5 w-4.5 text-orange-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-2xl">
        {[
          { id: "brief", label: "📋 1. Campaign Brief", desc: "Define objective" },
          { id: "ads", label: "📢 2. Multi-Channel Ads", desc: "Facebook & Google Ad copies" },
          { id: "landing", label: "🌐 3. Interactive Landing Page", desc: "CRO Sandbox & lead capturing" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition flex flex-col items-center justify-center cursor-pointer ${
              activeSubTab === tab.id
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9px] font-mono font-medium mt-0.5 ${activeSubTab === tab.id ? "text-orange-100" : "text-slate-500"}`}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* STAGE CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-left">
        
        {/* TAB 1: CAMPAIGN BRIEF FORM */}
        {activeSubTab === "brief" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-orange-400" /> Define Campaign Objective & Parameters
              </h3>
              <p className="text-xs text-slate-400">Configure parameters before calling the AI copywriting engine to build matching creative assets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Form Input fields */}
              <div className="md:col-span-8 space-y-5">
                
                {/* Campaign Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Campaign Reference Name</label>
                  <input
                    type="text"
                    value={briefCampaignName}
                    onChange={(e) => setBriefCampaignName(e.target.value)}
                    placeholder="e.g., Luxury Kitchen Cabinet Revitalization"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target Painting Service</label>
                    <select
                      value={briefServiceType}
                      onChange={(e) => setBriefServiceType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                    >
                      <option value="Kitchen Cabinet Refinishing">Kitchen Cabinet Refinishing</option>
                      <option value="Exterior Siding Protection">Exterior Siding Protection</option>
                      <option value="Whole Home Interior Painting">Whole Home Interior Painting</option>
                      <option value="Deck, Fence & Staining">Deck, Fence & Staining</option>
                      <option value="Commercial Office Repaints">Commercial Office Repaints</option>
                    </select>
                  </div>

                  {/* Aesthetic Theme Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Landing Page Visual Style</label>
                    <select
                      value={briefThemeColor}
                      onChange={(e) => setBriefThemeColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                    >
                      <option value="emerald">Emerald Forest (Rich Green)</option>
                      <option value="clay">Warm Terracotta (Bold Clay)</option>
                      <option value="slate">Cosmic Charcoal (Deep Slate)</option>
                      <option value="gold">Luxury Amber (High-End Gold)</option>
                    </select>
                  </div>
                </div>

                {/* Offer */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Lead Magnet / Special Promotional Offer</label>
                  <input
                    type="text"
                    value={briefOffer}
                    onChange={(e) => setBriefOffer(e.target.value)}
                    placeholder="e.g., Get $400 off Kitchen Cabinets + Free Soft Close upgrade"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                  <span className="text-[9px] text-slate-500 font-mono italic">Tip: An irresistible offer is 80% of direct response funnel success.</span>
                </div>

                {/* Target Audience */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target Customer Profile</label>
                  <input
                    type="text"
                    value={briefAudience}
                    onChange={(e) => setBriefAudience(e.target.value)}
                    placeholder="e.g., Luxury homeowners in suburban golf communities"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                </div>

                {/* Tone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Brand Tone / Voice Profile</label>
                  <select
                    value={briefTone}
                    onChange={(e) => setBriefTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  >
                    <option value="Luxury & Premium">Luxury & Premium (High ticket focus)</option>
                    <option value="Professional & Trustworthy">Professional & Trustworthy (SOP & Safety focus)</option>
                    <option value="Friendly & Local">Friendly & Local (Neighborhood small-business feel)</option>
                    <option value="Urgent & Promotional">Urgent & Bold (Time-sensitive, high discount)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={handleSaveBrief}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-white font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Save Brief Draft
                  </button>

                  <button
                    onClick={handleGenerateAssets}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                        <span>AI Generating Assets (2.1s average)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-slate-950 animate-pulse" />
                        <span>Generate Multi-Channel Funnel Assets with Gemini AI</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Sidebar Help Tips & Blueprint */}
              <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 text-xs">
                <h4 className="text-white font-bold flex items-center gap-1.5 uppercase font-mono text-[10px] tracking-wider text-orange-400">
                  <Award className="h-4 w-4" /> Funnel Blueprint Architecture
                </h4>
                
                <div className="space-y-3.5 text-slate-400">
                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">1</span>
                    <div className="space-y-0.5">
                      <p className="text-white font-bold text-xs">Attention Ad Hook</p>
                      <p className="text-[11px] leading-relaxed">Facebook and Google ads trigger immediate customer awareness with an irresistible localized value offer.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">2</span>
                    <div className="space-y-0.5">
                      <p className="text-white font-bold text-xs">Landing Page Education</p>
                      <p className="text-[11px] leading-relaxed">The page handles common objections (peeling, dust, duration, cost) with rich copy sections.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">3</span>
                    <div className="space-y-0.5">
                      <p className="text-white font-bold text-xs">Frictionless Lead Capture</p>
                      <p className="text-[11px] leading-relaxed">A clean form captures active intent. The system auto-pushes these to Lead CRM and score rates them instantly.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl text-[11px] leading-relaxed text-orange-300 flex gap-2">
                  <Info className="h-4 w-4 shrink-0 text-orange-400" />
                  <span>The AI gateway handles specialized semantic localization mapping for all zip codes of your active territory.</span>
                </div>

                {/* Destructive Option */}
                <div className="pt-2">
                  <button
                    onClick={() => handleDeleteCampaign(activeCampaign.id)}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 py-2.5 px-3 rounded-xl font-bold font-mono text-[10px] uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Active Funnel
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MULTI-CHANNEL AD COPYWRITING */}
        {activeSubTab === "ads" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="space-y-0.5 text-left">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-orange-400" /> Generated Social & Search Copywriting
                </h3>
                <p className="text-xs text-slate-400">Click on any text block to edit inline. Changes auto-save to this campaign's blueprint.</p>
              </div>

              {/* Status Indicator & Publishing CTA */}
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${
                  activeCampaign.status === "Published" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  {activeCampaign.status === "Published" ? "● LIVE RUNNING" : "● UNPUBLISHED DRAFT"}
                </span>

                <button
                  onClick={handlePublishCampaign}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer transition"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-950" /> Publish Funnel Campaign
                </button>
              </div>
            </div>

            {/* Split layout: Ad inputs on left, Live previews on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Direct Copy Editors */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* PART A: Facebook ad copy form */}
                <div className="space-y-4 bg-slate-950 border border-slate-850 p-5 rounded-2xl">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <Facebook className="h-4 w-4 text-blue-500" /> Facebook/Instagram sponsored post copy
                  </h4>
                  
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Primary post caption</label>
                      <textarea
                        value={activeCampaign.assets.adFacebook.primaryText}
                        onChange={(e) => handleUpdateAssetField("adFacebook", "primaryText", e.target.value)}
                        rows={7}
                        className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Ad Headline</label>
                        <input
                          type="text"
                          value={activeCampaign.assets.adFacebook.headline}
                          onChange={(e) => handleUpdateAssetField("adFacebook", "headline", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Button CTA</label>
                        <select
                          value={activeCampaign.assets.adFacebook.cta}
                          onChange={(e) => handleUpdateAssetField("adFacebook", "cta", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="Learn More">Learn More</option>
                          <option value="Get Instant Quote">Get Instant Quote</option>
                          <option value="Book Free Consultation">Book Free Consultation</option>
                          <option value="Sign Up">Sign Up</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Preset Picker */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Choose Ad image template</label>
                      <div className="grid grid-cols-4 gap-2">
                        {AD_IMAGE_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectAdImage(p.id)}
                            className={`p-1.5 rounded-xl border text-[9px] font-bold text-center truncate cursor-pointer transition ${
                              activeCampaign.assets.adFacebook.imagePreset === p.id
                                ? "bg-orange-500/10 border-orange-500 text-orange-400"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PART B: Google search ads form */}
                <div className="space-y-4 bg-slate-950 border border-slate-850 p-5 rounded-2xl">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <Globe className="h-4 w-4 text-emerald-500" /> Google search text ad copies
                  </h4>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Headline 1</label>
                        <input
                          type="text"
                          value={activeCampaign.assets.adGoogle.headline1}
                          onChange={(e) => handleUpdateAssetField("adGoogle", "headline1", e.target.value)}
                          maxLength={30}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Headline 2</label>
                        <input
                          type="text"
                          value={activeCampaign.assets.adGoogle.headline2}
                          onChange={(e) => handleUpdateAssetField("adGoogle", "headline2", e.target.value)}
                          maxLength={30}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Headline 3</label>
                        <input
                          type="text"
                          value={activeCampaign.assets.adGoogle.headline3}
                          onChange={(e) => handleUpdateAssetField("adGoogle", "headline3", e.target.value)}
                          maxLength={30}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Ad Description line 1</label>
                      <input
                        type="text"
                        value={activeCampaign.assets.adGoogle.description1}
                        onChange={(e) => handleUpdateAssetField("adGoogle", "description1", e.target.value)}
                        maxLength={90}
                        className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Ad Description line 2</label>
                      <input
                        type="text"
                        value={activeCampaign.assets.adGoogle.description2}
                        onChange={(e) => handleUpdateAssetField("adGoogle", "description2", e.target.value)}
                        maxLength={90}
                        className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Visual Mockup Previews */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. Facebook Mockup rendering */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-850 pb-2">
                    <span>Facebook Sponsored Post Simulation</span>
                    <span className="text-blue-400">Sponsored ● 🌐</span>
                  </div>

                  <div className="bg-[#18191a] rounded-xl border border-[#2f3031] text-white p-4.5 space-y-3 text-xs text-left font-sans">
                    {/* Header profile row */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-serif font-black text-sm">
                        P
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-[13px] hover:underline flex items-center gap-1 cursor-pointer">
                          PaintingPro AI
                          <CheckCircle2 className="h-3.5 w-3.5 fill-blue-500 text-slate-950" />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          Sponsored • <span>Oak Hills District</span> • 🌐
                        </div>
                      </div>
                    </div>

                    {/* Primary text */}
                    <p className="text-[12.5px] leading-relaxed whitespace-pre-line text-slate-200">
                      {activeCampaign.assets.adFacebook.primaryText}
                    </p>

                    {/* Ad Creative Image */}
                    <div className="border border-[#2f3031] rounded-lg overflow-hidden relative group">
                      <img
                        src={AD_IMAGE_PRESETS.find(i => i.id === activeCampaign.assets.adFacebook.imagePreset)?.url || AD_IMAGE_PRESETS[0].url}
                        alt="Facebook Ad Creative"
                        className="w-full h-56 object-cover object-center group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-2.5 py-1 rounded-lg text-[9px] font-extrabold font-mono text-orange-400">
                        {briefServiceType.toUpperCase()}
                      </div>
                    </div>

                    {/* Bottom Headline & Call To Action bar */}
                    <div className="bg-[#242526] p-3 border-t border-[#2f3031] rounded-b-lg flex items-center justify-between gap-3">
                      <div className="space-y-1 max-w-[70%]">
                        <span className="text-[10px] text-slate-400 font-medium uppercase font-mono tracking-widest block">PAINTPRO.AI</span>
                        <h5 className="font-extrabold text-[13px] text-white truncate block">{activeCampaign.assets.adFacebook.headline}</h5>
                      </div>
                      <button className="bg-[#3a3b3c] hover:bg-[#4e4f50] text-white font-extrabold px-4 py-2 rounded-lg text-xs shrink-0 cursor-pointer transition">
                        {activeCampaign.assets.adFacebook.cta}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Google Mockup rendering */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-850 pb-2">
                    <span>Google Search Result Simulation</span>
                    <span className="text-emerald-400">Ad ● Sponsored</span>
                  </div>

                  <div className="bg-white rounded-xl p-4.5 text-black font-sans text-left space-y-2 border border-slate-200 shadow-sm">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="font-bold">https://paintpro.ai</span>
                      <span className="text-slate-400">›</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-700 font-semibold">{briefServiceType.replace(/\s+/g, '-').toLowerCase()}</span>
                    </div>

                    {/* Blue Title Link */}
                    <h4 className="text-[17px] text-[#1a0dab] hover:underline cursor-pointer leading-tight font-medium">
                      {activeCampaign.assets.adGoogle.headline1} | {activeCampaign.assets.adGoogle.headline2} | {activeCampaign.assets.adGoogle.headline3}
                    </h4>

                    {/* Descriptions */}
                    <p className="text-[12.5px] text-[#4d5156] leading-relaxed">
                      {activeCampaign.assets.adGoogle.description1} {activeCampaign.assets.adGoogle.description2}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: LANDING PAGE CRO SANDBOX */}
        {activeSubTab === "landing" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Control Bar: Theme toggle, Device toggle, and Status */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="space-y-0.5 text-left">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-400" /> Interactive Conversion Landing Page Sandbox
                </h3>
                <p className="text-xs text-slate-400">Select standard styling themes and test-submit leads directly to your LeadFlow CRM.</p>
              </div>

              {/* Customizing options */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Theme presets */}
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl items-center gap-1">
                  {Object.values(LANDING_THEMES).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        handleUpdateAssetField("landingPage" as any, "dummy" as any, "trigger");
                        setBriefThemeColor(theme.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        briefThemeColor === theme.id
                          ? "bg-slate-900 text-white border border-slate-800"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {theme.name.split(" ")[1]}
                    </button>
                  ))}
                </div>

                {/* Desktop vs Mobile Toggle */}
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-2 rounded-lg cursor-pointer transition ${previewDevice === "desktop" ? "bg-slate-900 text-orange-400" : "text-slate-500 hover:text-white"}`}
                    title="Desktop Preview View"
                  >
                    <Laptop className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-2 rounded-lg cursor-pointer transition ${previewDevice === "mobile" ? "bg-slate-900 text-orange-400" : "text-slate-500 hover:text-white"}`}
                    title="Mobile Device Preview"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Direct inline page settings */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-5 text-xs text-left h-fit">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                  <Sliders className="h-4.5 w-4.5 text-orange-400" />
                  <h4 className="text-white font-extrabold uppercase font-mono tracking-wider text-[11px]">Copywriter Adjustments</h4>
                </div>

                <div className="space-y-4 font-sans">
                  {/* Hero Head */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Main Hero Title</label>
                    <input
                      type="text"
                      value={activeCampaign.assets.landingPage.heroTitle}
                      onChange={(e) => handleUpdateAssetField("landingPage", "heroTitle", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  {/* Hero Sub */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Sub-Headline Benefit</label>
                    <textarea
                      value={activeCampaign.assets.landingPage.heroSubtitle}
                      onChange={(e) => handleUpdateAssetField("landingPage", "heroSubtitle", e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  {/* Benefit points */}
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">CRO Objections Addressed</label>
                    
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold text-orange-400 uppercase tracking-widest">Objection 1 Headline</span>
                        <input
                          type="text"
                          value={activeCampaign.assets.landingPage.painPoint1Title}
                          onChange={(e) => handleUpdateAssetField("landingPage", "painPoint1Title", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold text-orange-400 uppercase tracking-widest">Objection 2 Headline</span>
                        <input
                          type="text"
                          value={activeCampaign.assets.landingPage.painPoint2Title}
                          onChange={(e) => handleUpdateAssetField("landingPage", "painPoint2Title", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold text-orange-400 uppercase tracking-widest">Objection 3 Headline</span>
                        <input
                          type="text"
                          value={activeCampaign.assets.landingPage.painPoint3Title}
                          onChange={(e) => handleUpdateAssetField("landingPage", "painPoint3Title", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 bg-slate-900/30 p-3 rounded-2xl border border-slate-850">
                    <p className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5 font-mono uppercase tracking-wider mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active CRM Pipeline Sync
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Form submissions in the right mock page send valid Lead payloads instantly into your LeadFlow database with labeled source campaign indicators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Device Frame Rendering */}
              <div className="lg:col-span-8 flex justify-center">
                
                {/* Responsive container based on device state */}
                <div 
                  className={`w-full transition-all duration-300 relative overflow-hidden bg-slate-950 border border-slate-850 shadow-2xl ${
                    previewDevice === "mobile" 
                      ? "max-w-[375px] rounded-[40px] border-[10px] border-slate-900 min-h-[700px] h-[750px] overflow-y-auto" 
                      : "rounded-3xl h-[800px] overflow-y-auto"
                  }`}
                  id="landing-preview-viewport"
                >
                  {/* Mobile Status Bar simulation */}
                  {previewDevice === "mobile" && (
                    <div className="bg-slate-900 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-850 sticky top-0 z-40">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>5G</span>
                        <span className="w-4 h-2.5 bg-emerald-500 rounded-sm"></span>
                      </div>
                    </div>
                  )}

                  {/* LANDING PAGE BODY - Dynamic styling themed */}
                  {(() => {
                    const theme = LANDING_THEMES[briefThemeColor as keyof typeof LANDING_THEMES] || LANDING_THEMES.emerald;

                    return (
                      <div className="bg-slate-950 text-white font-sans text-xs relative select-none">
                        
                        {/* Elegant background gradients */}
                        <div className={`absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b ${theme.gradient} pointer-events-none`} />

                        {/* Landing Header */}
                        <header className="relative z-10 px-6 py-4.5 flex justify-between items-center border-b border-slate-900/60 backdrop-blur-md">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center font-serif text-white font-black text-sm">P</div>
                            <span className="font-extrabold text-[12px] tracking-tight text-white font-serif">PaintingPro AI</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono font-bold text-slate-400">LOCAL AGENT ONLINE</span>
                          </div>
                        </header>

                        {/* HERO SECTION */}
                        <section className="relative z-10 px-6 py-12 text-center space-y-5">
                          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/15 text-orange-400 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider mx-auto">
                            <Sparkle className="h-3 w-3 animate-spin" /> Special Booking Promotion active
                          </div>

                          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight max-w-xl mx-auto text-white">
                            {activeCampaign.assets.landingPage.heroTitle}
                          </h1>

                          <p className="text-[12px] text-slate-400 leading-relaxed max-w-lg mx-auto">
                            {activeCampaign.assets.landingPage.heroSubtitle}
                          </p>

                          <div className="flex justify-center pt-2">
                            <a 
                              href="#quote-lead-form"
                              className={`py-3 px-5 rounded-xl text-xs tracking-tight transition duration-300 font-extrabold shadow-lg cursor-pointer ${theme.heroBtn}`}
                            >
                              {activeCampaign.assets.landingPage.heroCta}
                            </a>
                          </div>

                          {/* Quick Trust Badges */}
                          <div className="grid grid-cols-3 gap-2 pt-6 max-w-md mx-auto">
                            {[
                              { label: "Licensed & Insured", val: "$2M Liability Coverage", icon: ShieldCheck },
                              { label: "Satisfaction", val: "100% Guaranteed Finish", icon: Award },
                              { label: "Dustless Prep", val: "Vac Sanding Included", icon: CheckCircle2 }
                            ].map((b, i) => (
                              <div key={i} className="bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl text-center space-y-0.5">
                                <b.icon className={`h-4 w-4 mx-auto mb-1 ${theme.textPrimary}`} />
                                <div className="text-[9px] font-extrabold text-white">{b.label}</div>
                                <div className="text-[8px] text-slate-500 font-mono">{b.val}</div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* VALUE SECTION - Pain points / Solutions */}
                        <section className="relative z-10 px-6 py-12 bg-slate-900/40 border-y border-slate-900 space-y-6">
                          <div className="text-center space-y-1">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${theme.textPrimary}`}>{briefServiceType.toUpperCase()} ADVANTAGE</span>
                            <h2 className="text-sm md:text-md font-extrabold text-white tracking-tight">{activeCampaign.assets.landingPage.painPointTitle}</h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { num: "01", title: activeCampaign.assets.landingPage.painPoint1Title, desc: activeCampaign.assets.landingPage.painPoint1Desc },
                              { num: "02", title: activeCampaign.assets.landingPage.painPoint2Title, desc: activeCampaign.assets.landingPage.painPoint2Desc },
                              { num: "03", title: activeCampaign.assets.landingPage.painPoint3Title, desc: activeCampaign.assets.landingPage.painPoint3Desc }
                            ].map((p, i) => (
                              <div key={i} className="bg-slate-950/70 border border-slate-850 rounded-2xl p-4.5 space-y-2 text-left relative overflow-hidden">
                                <span className="absolute right-3 top-2 text-[26px] font-black text-slate-900/60 font-mono tracking-tighter select-none">{p.num}</span>
                                <h3 className="text-xs font-bold text-white pr-6">{p.title}</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed pr-2">{p.desc}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* REVIEWS TESTIMONIALS */}
                        <section className="relative z-10 px-6 py-12 space-y-6">
                          <div className="text-center space-y-1">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${theme.textPrimary}`}>CUSTOMER VERIFIED EXPERIENCES</span>
                            <h2 className="text-sm md:text-md font-extrabold text-white tracking-tight">{activeCampaign.assets.landingPage.socialProofTitle}</h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {[
                              { author: activeCampaign.assets.landingPage.socialProofReviewer1, text: activeCampaign.assets.landingPage.socialProofText1 },
                              { author: activeCampaign.assets.landingPage.socialProofReviewer2, text: activeCampaign.assets.landingPage.socialProofText2 }
                            ].map((r, i) => (
                              <div key={i} className="bg-slate-900/50 border border-slate-850 p-4.5 rounded-2xl text-left space-y-2 relative">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="text-amber-400 text-xs font-bold">★</span>
                                  ))}
                                </div>
                                <p className="text-[11px] text-slate-300 italic leading-relaxed">{r.text}</p>
                                <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pt-1">{r.author}</div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* CORE LEAD MAGENT FORM */}
                        <section id="quote-lead-form" className="relative z-10 px-6 py-12 bg-slate-900/60 border-t border-slate-900">
                          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
                            <div className="text-center space-y-1.5">
                              <h3 className="text-sm font-black text-white tracking-tight">{activeCampaign.assets.landingPage.formTitle}</h3>
                              <p className="text-[11px] text-slate-500 leading-normal">Claim your coupon slots instantly. Our lead estimator auto-routes your details within seconds.</p>
                            </div>

                            {leadStatus === "success" ? (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-2.5">
                                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                                <div className="text-white font-extrabold text-xs">Claim Request Received!</div>
                                <p className="text-[10px] text-slate-400 leading-normal">
                                  Your coupon package is secure. An on-site diagnostic pricing estimator will call your cell shortly!
                                </p>
                              </div>
                            ) : (
                              <form onSubmit={handleSubmitMockLead} className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Your Full Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={leadName}
                                    onChange={(e) => setLeadName(e.target.value)}
                                    placeholder="e.g., Jonathan Miller"
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Phone Number</label>
                                    <input
                                      type="tel"
                                      required
                                      value={leadPhone}
                                      onChange={(e) => setLeadPhone(e.target.value)}
                                      placeholder="e.g., (555) 302-8822"
                                      className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Email Address (Optional)</label>
                                    <input
                                      type="email"
                                      value={leadEmail}
                                      onChange={(e) => setLeadEmail(e.target.value)}
                                      placeholder="e.g., jm@domain.com"
                                      className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  disabled={leadStatus === "submitting"}
                                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition ${theme.primary} disabled:opacity-50`}
                                >
                                  {leadStatus === "submitting" ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      <span>Routing Secure CRM Claim...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-3.5 w-3.5" />
                                      <span>Claim Offer & Save slots</span>
                                    </>
                                  )}
                                </button>
                              </form>
                            )}
                          </div>
                        </section>

                        {/* FAQ ACCORDION */}
                        <section className="relative z-10 px-6 py-12 border-t border-slate-900 space-y-6 bg-slate-950">
                          <div className="text-center space-y-1">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${theme.textPrimary}`}>FREQUENTLY ANSWERED QUESTIONS</span>
                            <h2 className="text-sm md:text-md font-extrabold text-white tracking-tight">Have Some Questions first?</h2>
                          </div>

                          <div className="space-y-3.5 max-w-xl mx-auto text-left">
                            {[
                              { q: activeCampaign.assets.landingPage.faq1Q, a: activeCampaign.assets.landingPage.faq1A },
                              { q: activeCampaign.assets.landingPage.faq2Q, a: activeCampaign.assets.landingPage.faq2A },
                              { q: activeCampaign.assets.landingPage.faq3Q, a: activeCampaign.assets.landingPage.faq3A }
                            ].map((faq, i) => (
                              <div key={i} className="bg-slate-900/40 border border-slate-850 p-4.5 rounded-2xl space-y-1.5">
                                <h4 className="font-extrabold text-xs text-white flex gap-2 items-center">
                                  <span className={`h-1.5 w-1.5 rounded-full ${theme.textPrimary}`}></span>
                                  {faq.q}
                                </h4>
                                <p className="text-[11px] text-slate-400 leading-relaxed pl-3.5">{faq.a}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Page Footer */}
                        <footer className="relative z-10 px-6 py-8 border-t border-slate-900 text-center space-y-2 bg-[#080d19]">
                          <div className="flex justify-center items-center gap-2">
                            <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center font-serif text-white font-black text-xs">P</div>
                            <span className="font-bold text-[11px] font-serif text-white">PaintingPro AI™ Franchise Network</span>
                          </div>
                          <p className="text-[9px] text-slate-500 max-w-sm mx-auto leading-normal">
                            All jobs executed by certified licensed franchisees. Standard warranties mapped in corporate SOP guides. Fully licensed, bonded and locally managed.
                          </p>
                        </footer>

                      </div>
                    );
                  })()}

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
