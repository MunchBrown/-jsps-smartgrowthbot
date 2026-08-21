import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, Mic, Play, Check, X, AlertCircle, 
  Sparkles, MessageSquare, Volume2, VolumeX, List, RefreshCw, Calendar, FileText, 
  Search, ArrowRight, CheckCircle2, ChevronRight, User, Settings, Info, BarChart3, Clock,
  Sliders, Plus, Activity, Star
} from "lucide-react";
import { Lead } from "../types";

interface AIPhoneSystemModuleProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

interface CallLog {
  id: string;
  contactName: string;
  phone: string;
  direction: "Inbound" | "Outbound";
  status: "Completed" | "Missed" | "In Progress" | "Failed";
  date: string;
  duration: string;
  summary?: string;
  leadQualified?: boolean;
  transcript?: { sender: "AI Receptionist" | "Caller" | "Client"; text: string }[];
  actionItems?: string[];
}

export default function AIPhoneSystemModule({ leads, setLeads }: AIPhoneSystemModuleProps) {
  // Scripts and Options
  const [activeScriptId, setActiveScriptId] = useState("script-professional");
  const [scripts, setScripts] = useState([
    {
      id: "script-professional",
      title: "Sophie - Polished Receptionist",
      tone: "Professional & Welcoming",
      content: "Hello! Thank you for calling Smart Growth Painting, where preparation is 80% of a masterpiece. My name is Sophie, your AI Assistant. How can I make your property look beautiful today?"
    },
    {
      id: "script-urgent",
      title: "Sarah - Rapid Booking Closer",
      tone: "Urgent & Direct",
      content: "Hi! Thanks for calling Smart Growth Painting! This is Sarah. We are currently booking residential exterior estimates for next week with a 10% seasonal discount. Let's get your project scheduled! What is the address of the property you'd like painted?"
    },
    {
      id: "script-warm",
      title: "Marcus - Warm Consultant",
      tone: "Friendly & Educational",
      content: "Hi there! Welcome to Smart Growth Painting. This is Marcus. We specialize in eco-friendly low-VOC finishes and premium cabinetry coatings. Are you looking to refresh your home's interior, or do you have a commercial project in mind?"
    }
  ]);

  const [customScript, setCustomScript] = useState("");
  const [scriptTone, setScriptTone] = useState("Polished & Conversational");
  const [optimizingScript, setOptimizingScript] = useState(false);

  // Active Call State
  const [activeCallLine, setActiveCallLine] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [callDirection, setCallDirection] = useState<"Inbound" | "Outbound">("Inbound");
  const [callContactName, setCallContactName] = useState("Mr. Robert Chen");
  const [callPhoneNumber, setCallPhoneNumber] = useState("(717) 555-0182");
  const [callLeadId, setCallLeadId] = useState<string | null>(null);
  
  // Audio Speech Synthesis Toggle
  const [isMuted, setIsMuted] = useState(false);

  // Persona selections for Inbound simulation
  const inboundPersonas = [
    {
      id: "p1",
      name: "Helen Miller",
      phone: "(717) 555-0329",
      scenario: "Wants a complete 3-bedroom interior repaint before moving in next month. High intent.",
      initialUtterance: "Hello, yes! I'm moving into a new home in York next month and I need to get three bedrooms repainted before the furniture arrives. Do you have availability for an estimate this week?"
    },
    {
      id: "p2",
      name: "Marcus Sterling",
      phone: "(215) 555-9104",
      scenario: "Commercial shop owner asking if you do night shifts for retail store exterior siding.",
      initialUtterance: "Hi, I own a retail shop downtown and need the exterior trim painted. But we can't have painters blocking our entrance during business hours. Do you do overnight painting?"
    },
    {
      id: "p3",
      name: "Debra Larson",
      phone: "(717) 555-7761",
      scenario: "Confused customer asking about the difference between Satin and Semi-Gloss for trim.",
      initialUtterance: "Hello! My contractor told me to pick the paint finish for my kitchen cabinets and baseboards. I have no idea what the difference between Satin and Semi-Gloss is. Can you explain that?"
    },
    {
      id: "p4",
      name: "Spam Caller / Solicitor",
      phone: "(800) 555-0199",
      scenario: "SEO Salesman trying to sell page rank services. Should be rejected by AI receptionist.",
      initialUtterance: "Hello, is the owner of the painting company available? I am calling from Google Maps SEO Boost and I noticed your listing is not verified in local maps..."
    }
  ];
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(0);

  // Outbound options
  const [selectedLeadForOutbound, setSelectedLeadForOutbound] = useState<string>("");
  const [outboundCampaignTopic, setOutboundCampaignTopic] = useState("Estimate Follow-up");
  const outboundCampaigns = [
    { topic: "Estimate Follow-up", pitch: "Hi, I am calling on behalf of Smart Growth Painting regarding the interior repaint quote we sent over on Friday. We wanted to see if you had any questions on the premium package or the prep scope?" },
    { topic: "Summer Exterior Discount", pitch: "Hi! This is the automated coordinator for Smart Growth Painting. We are reaching out because we have two open slots for exterior siding painting in your neighborhood next week, which qualifies you for a 15% discount on materials." },
    { topic: "Warranty Check-In", pitch: "Hello! Our records show we completed your home painting project about 1 year ago. We're doing a quick check-in to make sure the exterior siding is holding up beautifully and your finish is still perfect." }
  ];

  // Conversation turns in active call
  const [callTranscript, setCallTranscript] = useState<{ sender: "AI Receptionist" | "Caller" | "Client"; text: string }[]>([]);
  const [userSpeechInput, setUserSpeechInput] = useState("");
  const [aiIsResponding, setAiIsResponding] = useState(false);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Post-call AI analysis outputs
  const [callAnalysis, setCallAnalysis] = useState<{
    summary?: string;
    leadQualified?: boolean;
    actionItems?: string[];
  } | null>(null);
  const [analyzingCall, setAnalyzingCall] = useState(false);
  const [syncedToCRM, setSyncedToCRM] = useState(false);

  // Call Logs Database (seeded with realistic items)
  const [logs, setLogs] = useState<CallLog[]>([
    {
      id: "CALL-2026-901",
      contactName: "Arthur Pendelton",
      phone: "(717) 555-0149",
      direction: "Inbound",
      status: "Completed",
      date: "Today, 11:20 AM",
      duration: "1m 32s",
      summary: "Customer called inquiring about deck staining and power washing services. AI explained preparation requirements (sanding and drying cycles) and successfully booked an onsite estimate for Thursday morning.",
      leadQualified: true,
      actionItems: ["Schedule onsite estimator for Thursday, 10:00 AM", "Pre-send deck staining care guide PDF"],
      transcript: [
        { sender: "AI Receptionist", text: "Hello! Thank you for calling Smart Growth Painting. My name is Sophie. How can I make your property beautiful today?" },
        { sender: "Caller", text: "Hi, do you guys do deck wood restoration or staining? Our deck is starting to peel." },
        { sender: "AI Receptionist", text: "Yes, we certainly do! We specialize in deep wood cleaning, sanding, and applying premium solid or semi-transparent stains. Would you like to schedule a quick visual consultation?" },
        { sender: "Caller", text: "Yes please, this Thursday works best." }
      ]
    },
    {
      id: "CALL-2026-902",
      contactName: "Sarah Lindqvist (Estimator Outreach)",
      phone: "(717) 555-0140",
      direction: "Outbound",
      status: "Completed",
      date: "Today, 09:45 AM",
      duration: "2m 15s",
      summary: "Automated outbound follow-up on outstanding Quote #EST-2024-002. Customer confirmed receipt but requested to delay start to next month due to landscaping work. AI logged delay reason.",
      leadQualified: true,
      actionItems: ["Snooze estimate task for 3 weeks", "Mark customer notes in LeadFlow CRM"],
      transcript: [
        { sender: "AI Receptionist", text: "Hello, this is Sophie calling on behalf of Smart Growth Painting regarding your recent residential painting quote. I was checking in to see if you had any questions about our scope of work?" },
        { sender: "Caller", text: "Oh yes, the quote looks fine. We just had a delay with our landscape graders. Can we push the start date to late July?" },
        { sender: "AI Receptionist", text: "Absolutely, we can accommodate that! I will update our schedule and follow up with you in three weeks to finalize a firm start date." }
      ]
    },
    {
      id: "CALL-2026-903",
      contactName: "Unknown Robocall",
      phone: "(855) 321-0988",
      direction: "Inbound",
      status: "Failed",
      date: "Yesterday, 4:12 PM",
      duration: "0m 12s",
      summary: "Spam telemarketer offering commercial insurance list brokerage. System automatically filtered call out and disconnected.",
      leadQualified: false,
      actionItems: ["Block phone number from routing pool"],
      transcript: [
        { sender: "AI Receptionist", text: "Hello! Thank you for calling Smart Growth Painting. How can I help you?" },
        { sender: "Caller", text: "Hi, is the business owner available? We are offering discount general liability insurance..." }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState<"All" | "Inbound" | "Outbound">("All");
  const [selectedLogDetail, setSelectedLogDetail] = useState<CallLog | null>(logs[0]);

  // Statistics calculation
  const totalCalls = logs.length + 15; // Simulated historical pool
  const avgDuration = "1m 48s";
  const qualifiedLeadsBooked = logs.filter(l => l.leadQualified).length + 8;
  const answerRate = "99.2%";

  // Speak using browser Text-to-Speech
  const speakText = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Find an elegant female/male english voice if available
    const voices = window.speechSynthesis.getVoices();
    const desiredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha") || v.lang.startsWith("en"));
    if (desiredVoice) utterance.voice = desiredVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Scroll active call chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [callTranscript, aiIsResponding]);

  // Handle active timer
  useEffect(() => {
    if (activeCallLine === "connected") {
      setCallDurationSec(0);
      durationTimerRef.current = setInterval(() => {
        setCallDurationSec(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [activeCallLine]);

  // Convert duration number to format
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  // Trigger outbound or inbound ringing
  const startSimulation = (direction: "Inbound" | "Outbound") => {
    setCallDirection(direction);
    setSyncedToCRM(false);
    setCallAnalysis(null);
    setCallTranscript([]);
    
    if (direction === "Inbound") {
      const persona = inboundPersonas[selectedPersonaIdx];
      setCallContactName(persona.name);
      setCallPhoneNumber(persona.phone);
      setCallLeadId(null);
    } else {
      // Outbound from Leads
      const matchedLead = leads.find(l => l.id === selectedLeadForOutbound);
      if (matchedLead) {
        setCallContactName(matchedLead.clientName);
        setCallPhoneNumber(matchedLead.phone || "(717) 555-0100");
        setCallLeadId(matchedLead.id);
      } else {
        setCallContactName("Jane Miller (Lead Prospect)");
        setCallPhoneNumber("(717) 555-0199");
        setCallLeadId(null);
      }
    }
    setActiveCallLine("ringing");
  };

  // Answer call
  const answerCallSim = async () => {
    setActiveCallLine("connected");
    const activeScriptText = scripts.find(s => s.id === activeScriptId)?.content || customScript || "Hello! Thank you for calling Smart Growth Painting.";
    
    if (callDirection === "Inbound") {
      // Inbound: AI speaks the greeting first
      setCallTranscript([
        { sender: "AI Receptionist", text: activeScriptText }
      ]);
      speakText(activeScriptText);

      // Auto trigger persona speaking after 2 seconds
      setTimeout(() => {
        const persona = inboundPersonas[selectedPersonaIdx];
        setCallTranscript(prev => [
          ...prev,
          { sender: "Caller", text: persona.initialUtterance }
        ]);
      }, 2500);

    } else {
      // Outbound: AI initiates the call, Client picks up, AI speaks campaign pitch
      setCallTranscript([
        { sender: "Client", text: "Hello? Who's calling?" }
      ]);
      
      setTimeout(() => {
        const campaignPitch = outboundCampaigns.find(c => c.topic === outboundCampaignTopic)?.pitch 
          || "Hello! This is Sophie from Smart Growth Painting checking in regarding your estimate.";
        setCallTranscript(prev => [
          ...prev,
          { sender: "AI Receptionist", text: campaignPitch }
        ]);
        speakText(campaignPitch);
      }, 1500);
    }
  };

  // Handle user response submit in simulator (simulating the interlocutor talking)
  const submitSpeechSim = async () => {
    if (!userSpeechInput.trim()) return;
    
    const userUtterance = userSpeechInput.trim();
    setUserSpeechInput("");
    
    // Add speech turn
    setCallTranscript(prev => [
      ...prev,
      { sender: callDirection === "Inbound" ? "Caller" : "Client", text: userUtterance }
    ]);

    setAiIsResponding(true);

    try {
      const activeScriptText = scripts.find(s => s.id === activeScriptId)?.content || customScript || "Greet professionally";
      
      // Feed full transcript turns formatted for API
      const messagesPayload = callTranscript.map(t => ({
        role: t.sender === "AI Receptionist" ? "model" : "user",
        content: t.text
      }));
      // Append the newest message
      messagesPayload.push({
        role: "user",
        content: userUtterance
      });

      const res = await fetch("/api/phone/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesPayload,
          script: activeScriptText,
          callType: callDirection.toLowerCase(),
          contactName: callContactName,
          companyName: "Smart Growth Painting"
        })
      });

      if (!res.ok) throw new Error("Failed to contact receptionist agent.");
      const data = await res.json();
      
      setCallTranscript(prev => [
        ...prev,
        { sender: "AI Receptionist", text: data.text }
      ]);
      speakText(data.text);
    } catch (err) {
      console.error(err);
      const fallbackMsg = "Thank you for sharing that. I will note down all details so our estimators can follow up promptly.";
      setCallTranscript(prev => [
        ...prev,
        { sender: "AI Receptionist", text: fallbackMsg }
      ]);
      speakText(fallbackMsg);
    } finally {
      setAiIsResponding(false);
    }
  };

  // Pre-fill user responses based on current turns
  const suggestionPrompts = callDirection === "Inbound" 
    ? [
        "Yes, I would like to schedule a free onsite survey for Friday morning at 9am.",
        "Could you explain the difference between your Premium and Ultra packages?",
        "Do you provide a warranty for exterior trim woodwork painting?",
        "No thanks, I was just looking for a general price estimate."
      ]
    : [
        "Ah yes! The estimate looked high compared to another company, but I prefer your thorough prep work. Can you do a 5% discount?",
        "I'm ready to approve. When is the earliest your crew can start?",
        "Please take me off your call list, we decided to postpone the paint job."
      ];

  // Disconnect & Generate Summary
  const hangUpCall = async () => {
    setActiveCallLine("ended");
    setAnalyzingCall(true);

    try {
      // Map transcript format
      const transcriptFormatted = callTranscript.map(t => ({
        sender: t.sender,
        text: t.text
      }));

      if (transcriptFormatted.length === 0) {
        setAnalyzingCall(false);
        return;
      }

      const res = await fetch("/api/phone/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptFormatted })
      });

      if (!res.ok) throw new Error("Failed to summarize call.");
      const data = await res.json();
      
      setCallAnalysis(data);

      // Save call log in database
      const newLogId = `CALL-2026-${Math.floor(Math.random() * 900) + 100}`;
      const newLog: CallLog = {
        id: newLogId,
        contactName: callContactName,
        phone: callPhoneNumber,
        direction: callDirection,
        status: "Completed",
        date: "Just Now",
        duration: formatDuration(callDurationSec),
        summary: data.summary,
        leadQualified: data.leadQualified,
        actionItems: data.actionItems,
        transcript: callTranscript
      };

      setLogs(prev => [newLog, ...prev]);
      setSelectedLogDetail(newLog);

    } catch (err) {
      console.error(err);
      // Fallback analysis
      const fallbackAnalysis = {
        summary: `AI Call completed with ${callContactName}. Conversation logged details about painting schedules and general interest.`,
        leadQualified: true,
        actionItems: ["Assign estimator for prompt contact", "Record call transcript to customer file"]
      };
      setCallAnalysis(fallbackAnalysis);

      const newLog: CallLog = {
        id: `CALL-2026-${Math.floor(Math.random() * 900) + 100}`,
        contactName: callContactName,
        phone: callPhoneNumber,
        direction: callDirection,
        status: "Completed",
        date: "Just Now",
        duration: formatDuration(callDurationSec),
        summary: fallbackAnalysis.summary,
        leadQualified: fallbackAnalysis.leadQualified,
        actionItems: fallbackAnalysis.actionItems,
        transcript: callTranscript
      };
      setLogs(prev => [newLog, ...prev]);
      setSelectedLogDetail(newLog);
    } finally {
      setAnalyzingCall(false);
    }
  };

  // Sync to CRM
  const syncToCRMHandler = () => {
    if (!callAnalysis) return;
    setSyncedToCRM(true);

    // Update real CRM Leads if a matching lead exists
    if (callLeadId) {
      setLeads(prevLeads => prevLeads.map(l => {
        if (l.id === callLeadId) {
          return {
            ...l,
            status: "Contacted",
            actionPlan: callAnalysis.actionItems 
              ? [...(l.actionPlan || []), ...callAnalysis.actionItems] 
              : l.actionPlan,
            justification: `${l.justification || ""}\n[AI Call Summary]: ${callAnalysis.summary}`.trim()
          };
        }
        return l;
      }));
    } else {
      // Create a brand new lead in CRM from this inbound call if qualified!
      const newLeadId = `LEAD-IN-${Date.now()}`;
      const newLead: Lead = {
        id: newLeadId,
        clientName: callContactName,
        phone: callPhoneNumber,
        email: `${callContactName.toLowerCase().replace(/[^a-z]/g, "") || "client"}@example.com`,
        clientType: "Residential",
        budget: 3500,
        sqft: 1500,
        timeline: "Next 30 days",
        condition: "Normal prep",
        status: "Contacted",
        score: callAnalysis.leadQualified ? 85 : 40,
        justification: `Automatically created via AI Receptionist Call. ${callAnalysis.summary}`,
        actionPlan: callAnalysis.actionItems || ["Perform site survey walkthrough"],
        createdAt: new Date().toISOString().split("T")[0],
        source: "AI Phone System"
      };
      setLeads(prev => [newLead, ...prev]);
    }
  };

  // Optimize script greeting using AI
  const runOptimizeScript = async () => {
    if (optimizingScript) return;
    const baseScript = scripts.find(s => s.id === activeScriptId)?.content || "";
    if (!baseScript && !customScript) return;

    setOptimizingScript(true);
    try {
      const res = await fetch("/api/phone/optimize-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: customScript || baseScript,
          tone: scriptTone,
          companyName: "Smart Growth Painting"
        })
      });

      if (!res.ok) throw new Error("Failed to optimize script.");
      const data = await res.json();
      
      setCustomScript(data.optimizedScript);
      // Select the custom script tab to show optimized output
      setActiveScriptId("script-custom");
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizingScript(false);
    }
  };

  // Set the custom script text field to the active template if custom is clicked first time
  useEffect(() => {
    if (activeScriptId === "script-custom" && !customScript) {
      setCustomScript(scripts[0].content);
    }
  }, [activeScriptId]);

  // Filters logs
  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.phone.includes(searchQuery) ||
                          (l.summary && l.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDirection = filterDirection === "All" || l.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="ai-phone-root">
      {/* Top Heading Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
            <Sparkles className="h-4.5 w-4.5 text-orange-400 animate-pulse" />
            <span>AI Voice Automation Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">AI Phone System & Receptionist</h2>
          <p className="text-xs text-slate-400">Automate inbound customer qualification and outbound campaigns with realistic conversational AI voice agents.</p>
        </div>

        {/* Audio synthesis toggle */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
            isMuted 
              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15" 
              : "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/15"
          }`}
          title="Toggle Receptionist Voice Audio"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span>{isMuted ? "MUTE VOICE SYNTH" : "VOICE PLAYBACK ACTIVE"}</span>
        </button>
      </div>

      {/* Top Statistics Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Simulated Calls</span>
            <strong className="text-lg font-black text-white">{totalCalls}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">AI Answer Rate</span>
            <strong className="text-lg font-black text-emerald-400">{answerRate}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Avg Call Duration</span>
            <strong className="text-lg font-black text-white">{avgDuration}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Qualified CRM Leads</span>
            <strong className="text-lg font-black text-amber-400">+{qualifiedLeadsBooked}</strong>
          </div>
        </div>
      </div>

      {/* Main Core Workstations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE LINE & CALL SIMULATOR (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Active Calling Simulation Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-950/20">
            {/* Screen Header */}
            <div className="bg-slate-950/60 border-b border-slate-800 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${activeCallLine !== "idle" ? "bg-orange-500 animate-pulse" : "bg-slate-600"}`}></span>
                <span className="text-xs font-mono font-black text-slate-300 uppercase">ACTIVE PHONE LINE SIMULATOR</span>
              </div>
              {activeCallLine === "connected" && (
                <div className="bg-orange-500/15 text-orange-400 border border-orange-500/25 text-[10px] font-mono font-black px-2 py-0.5 rounded-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                  <span>LIVE • {formatDuration(callDurationSec)}</span>
                </div>
              )}
            </div>

            {/* Simulated Handset Screen */}
            <div className="p-6 flex flex-col justify-between min-h-[460px] bg-gradient-to-b from-slate-900 to-slate-950">
              
              {/* IDLE STATE */}
              {activeCallLine === "idle" && (
                <div className="my-auto text-center max-w-sm mx-auto space-y-5">
                  <div className="h-20 w-20 mx-auto rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Phone className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-200">Phone Terminal is Idle</h4>
                    <p className="text-xs text-slate-400 mt-1">Select an inbound caller profile or pick an outbound lead to launch a simulated interactive AI Voice reception conversation.</p>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => startSimulation("Inbound")}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer"
                    >
                      <PhoneIncoming className="h-4 w-4" />
                      <span>Simulate Inbound</span>
                    </button>
                    <button 
                      onClick={() => startSimulation("Outbound")}
                      className="bg-slate-850 hover:bg-slate-850 border border-slate-750 text-slate-200 font-extrabold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PhoneOutgoing className="h-4 w-4 text-orange-400" />
                      <span>Simulate Outbound</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RINGING STATE */}
              {activeCallLine === "ringing" && (
                <div className="my-auto text-center max-w-sm mx-auto space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25 scale-150"></div>
                    <div className="h-24 w-24 mx-auto rounded-full bg-orange-500 border-4 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 relative z-10">
                      {callDirection === "Inbound" ? <PhoneIncoming className="h-10 w-10 animate-bounce" /> : <PhoneOutgoing className="h-10 w-10 animate-pulse" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-extrabold text-orange-400 tracking-widest uppercase">
                      {callDirection === "Inbound" ? "INCOMING AI CALL SIMULATION" : "DIALING OUTBOUND CAMPAIGN..."}
                    </span>
                    <h3 className="text-xl font-black text-white">{callContactName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{callPhoneNumber}</p>
                  </div>

                  {callDirection === "Inbound" && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-left text-[11px] text-slate-400">
                      <span className="font-mono font-extrabold text-orange-400 block mb-1">Scenario/Motif:</span>
                      {inboundPersonas[selectedPersonaIdx].scenario}
                    </div>
                  )}

                  <div className="flex gap-4 justify-center pt-2">
                    <button 
                      onClick={() => setActiveCallLine("idle")}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold py-2.5 px-6 rounded-xl text-xs transition hover:bg-red-500/15 cursor-pointer"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={answerCallSim}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 px-8 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>{callDirection === "Inbound" ? "Answer Call" : "Client Answers"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CONNECTED STATE */}
              {activeCallLine === "connected" && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {/* Active Line Contact header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-850 flex items-center justify-center text-orange-400 font-serif font-black text-sm">
                        {callContactName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-extrabold text-white leading-none">{callContactName}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{callPhoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Audio Visualizer Waves */}
                      <div className="flex items-end gap-1 h-5 px-2">
                        {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2].map((h, i) => (
                          <span 
                            key={i} 
                            style={{ height: aiIsResponding ? `${h * 4}px` : "2px" }}
                            className="w-0.5 bg-orange-400 rounded-full transition-all duration-300 animate-pulse"
                          />
                        ))}
                      </div>

                      <button 
                        onClick={hangUpCall}
                        className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition shadow-lg shadow-red-500/15 cursor-pointer"
                        title="Hang Up"
                      >
                        <PhoneOff className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Transcript Scroll Area */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto max-h-[250px] p-3 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-3.5 scrollbar-thin text-left"
                  >
                    {callTranscript.map((turn, idx) => {
                      const isAi = turn.sender === "AI Receptionist";
                      return (
                        <div key={idx} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className={`text-[8px] font-mono uppercase tracking-widest ${isAi ? "text-orange-400 font-black" : "text-blue-400"}`}>
                              {turn.sender}
                            </span>
                          </div>
                          <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                            isAi 
                              ? "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none" 
                              : "bg-orange-500 text-white font-medium rounded-tr-none"
                          }`}>
                            {turn.text}
                          </div>
                        </div>
                      );
                    })}

                    {aiIsResponding && (
                      <div className="flex flex-col items-start">
                        <span className="text-[8px] font-mono text-orange-400 font-black mb-1">AI Receptionist is speaking...</span>
                        <div className="bg-slate-900 text-slate-400 border border-slate-800/80 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulated interactive input turn */}
                  <div className="pt-2">
                    <div className="bg-slate-950 p-2 rounded-2xl border border-slate-850 flex items-center gap-2">
                      <input 
                        type="text"
                        value={userSpeechInput}
                        onChange={(e) => setUserSpeechInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitSpeechSim()}
                        placeholder={callDirection === "Inbound" ? "Type caller's speech reply..." : "Type client's speech reaction..."}
                        className="flex-1 bg-transparent border-none text-white text-xs px-3 focus:outline-none"
                      />
                      <button 
                        onClick={submitSpeechSim}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2 px-4 rounded-xl text-[10px] transition shrink-0 cursor-pointer"
                      >
                        Speak Turn
                      </button>
                    </div>

                    {/* Speech response suggestion helper */}
                    <div className="mt-3 text-left">
                      <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase block mb-1.5 px-1">Or Select a Response Option to simulate conversation:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                        {suggestionPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setUserSpeechInput(prompt);
                            }}
                            className="bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-300 text-[10px] py-1 px-2.5 rounded-lg border border-slate-800 text-left transition truncate max-w-full cursor-pointer"
                          >
                            "{prompt}"
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ENDED STATE (POST CALL AI ANALYSIS) */}
              {activeCallLine === "ended" && (
                <div className="text-left space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-white">Call Disconnected</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Call duration: <strong className="text-orange-400">{formatDuration(callDurationSec)}</strong> • Full log saved.</p>
                    </div>
                    <button 
                      onClick={() => setActiveCallLine("idle")}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-extrabold text-[10px] py-1.5 px-3.5 rounded-xl transition cursor-pointer"
                    >
                      Clear Terminal
                    </button>
                  </div>

                  {analyzingCall ? (
                    <div className="p-8 text-center space-y-3">
                      <RefreshCw className="h-8 w-8 text-orange-400 animate-spin mx-auto" />
                      <p className="text-xs text-slate-400">AI Receptionist analyzing conversation transcript, classifying lead intent and compiling action plan items...</p>
                    </div>
                  ) : callAnalysis ? (
                    <div className="space-y-4">
                      
                      {/* Analysis Card */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                          <span className="text-[10px] font-mono font-black text-slate-500 uppercase">AI DIALOGUE INSIGHT SUMMARY</span>
                          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md uppercase ${
                            callAnalysis.leadQualified 
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                              : "bg-red-500/15 text-red-400 border border-red-500/20"
                          }`}>
                            {callAnalysis.leadQualified ? "Qualified Lead Booked" : "Unqualified / Low Intent"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "{callAnalysis.summary}"
                        </p>

                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <span className="text-[10px] font-mono font-extrabold text-orange-400 block uppercase">GENERATED CRM FOLLOW-UP TASKS:</span>
                          <div className="space-y-1.5">
                            {callAnalysis.actionItems?.map((act, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                <Check className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sync actions */}
                      <div className="flex gap-3">
                        <button 
                          disabled={syncedToCRM}
                          onClick={syncToCRMHandler}
                          className={`flex-1 font-extrabold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                            syncedToCRM 
                              ? "bg-slate-900 text-slate-500 border border-slate-850" 
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/15"
                          }`}
                        >
                          {syncedToCRM ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <RefreshCw className="h-4 w-4" />}
                          <span>{syncedToCRM ? "SYNCED TO CRM LEADS" : "APPLY TASKS & SYNC TO CRM"}</span>
                        </button>
                      </div>

                    </div>
                  ) : null}

                </div>
              )}
            </div>
          </div>

          {/* Interactive Trigger Setup Panel */}
          {activeCallLine === "idle" && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-orange-400" />
                <span>Simulate Call Controller & Scenarios</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Inbound selector */}
                <div className="space-y-2 p-3.5 bg-slate-950 rounded-2xl border border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-300">1. Set Inbound Caller</span>
                    <span className="text-[8px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded">INCOMING</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Pick a prospective client profile to dial in.</p>
                  
                  <select 
                    value={selectedPersonaIdx}
                    onChange={(e) => setSelectedPersonaIdx(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    {inboundPersonas.map((p, idx) => (
                      <option key={p.id} value={idx}>{p.name} ({p.phone})</option>
                    ))}
                  </select>

                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-850 text-[10px] text-slate-400 italic">
                    "{inboundPersonas[selectedPersonaIdx].scenario}"
                  </div>
                </div>

                {/* Outbound selector */}
                <div className="space-y-2 p-3.5 bg-slate-950 rounded-2xl border border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-300">2. Set Outbound Lead</span>
                    <span className="text-[8px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">OUTGOING</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Connects directly to your LeadFlow CRM database.</p>

                  <select 
                    value={selectedLeadForOutbound}
                    onChange={(e) => setSelectedLeadForOutbound(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="">-- Choose CRM Lead --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.clientName} ({l.phone || "No phone"})</option>
                    ))}
                  </select>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase block">Outbound Pitch Topic:</span>
                    <select 
                      value={outboundCampaignTopic}
                      onChange={(e) => setOutboundCampaignTopic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-1.5 px-3 text-[11px] focus:outline-none"
                    >
                      {outboundCampaigns.map((c, i) => (
                        <option key={i} value={c.topic}>{c.topic}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI SCRIPT OPTIMIZER & CALL LOGS (5 cols) */}
        <div className="xl:col-span-5 space-y-6 text-left">
          
          {/* AI Receptionist Voice Script Customizer */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-orange-400" />
                  <span>Receptionist Voice Script</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Define greetings, company pitches and behavior scripts.</p>
              </div>

              <span className="text-[9px] font-mono font-black text-slate-500 uppercase">ACTIVE CONFIG</span>
            </div>

            {/* Script Tab selection */}
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl">
              {scripts.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveScriptId(s.id)}
                  className={`py-1.5 px-1 rounded-lg text-[9px] font-bold text-center transition truncate cursor-pointer ${
                    activeScriptId === s.id 
                      ? "bg-orange-500 text-white font-extrabold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={s.title}
                >
                  {s.id === "script-professional" ? "Sophie" : s.id === "script-urgent" ? "Sarah" : "Marcus"}
                </button>
              ))}
              <button
                onClick={() => setActiveScriptId("script-custom")}
                className={`py-1.5 px-1 rounded-lg text-[9px] font-bold text-center transition cursor-pointer ${
                  activeScriptId === "script-custom" 
                    ? "bg-orange-500 text-white font-extrabold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Custom Script
              </button>
            </div>

            {/* Script editing workspace */}
            <div className="space-y-3">
              {activeScriptId !== "script-custom" ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/80 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Persona: <strong>{scripts.find(s => s.id === activeScriptId)?.title}</strong></span>
                    <span className="text-[9px] text-orange-400 uppercase font-mono font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                      {scripts.find(s => s.id === activeScriptId)?.tone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{scripts.find(s => s.id === activeScriptId)?.content}"
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea 
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    placeholder="Enter greeting voice prompt read by the AI receptionist..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">Write the custom reception script for Smart Growth Painting. Keep it natural and spoken-friendly.</p>
                </div>
              )}

              {/* AI Optimization section */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2">
                <span className="text-[9px] font-mono font-extrabold text-orange-400 block uppercase">OPTIMIZE SCRIPT WITH GEMINI AI:</span>
                <div className="flex gap-2">
                  <select 
                    value={scriptTone}
                    onChange={(e) => setScriptTone(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="Polished & Conversational">Polished & Conversational</option>
                    <option value="High-End Premium & Formal">High-End Premium & Formal</option>
                    <option value="Warm, Family-Owned & Local">Warm, Family-Owned & Local</option>
                    <option value="High Conversion Sales Pitch">High Conversion Sales Closer</option>
                  </select>

                  <button 
                    disabled={optimizingScript}
                    onClick={runOptimizeScript}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-750 hover:border-orange-500/30 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {optimizingScript ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-400" /> : <Sparkles className="h-3.5 w-3.5 text-orange-400" />}
                    <span>Optimize</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Call Logs Database */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col min-h-[350px]">
            {/* Header */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-black text-slate-300 uppercase">TELEPHONY CALL REGISTRY</h3>
              <div className="flex gap-1.5">
                {["All", "Inbound", "Outbound"].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setFilterDirection(dir as any)}
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition cursor-pointer ${
                      filterDirection === dir 
                        ? "bg-orange-500 text-white font-extrabold" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-slate-850">
              {filteredLogs.length === 0 ? (
                <p className="text-xs text-slate-500 p-6 text-center italic">No call logs found matching your filters.</p>
              ) : (
                filteredLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLogDetail(log)}
                    className={`w-full text-left p-3.5 flex justify-between items-center transition cursor-pointer ${
                      selectedLogDetail?.id === log.id 
                        ? "bg-slate-850/60" 
                        : "hover:bg-slate-850/20"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-white">{log.contactName}</span>
                        <span className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded ${
                          log.direction === "Inbound" 
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/10" 
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                        }`}>
                          {log.direction}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{log.summary || "No summary available."}</p>
                      <span className="text-[8px] font-mono text-slate-500 block">{log.date} • Duration: {log.duration}</span>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Selected Log Detailed Drawer Modal */}
      {selectedLogDetail && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-left space-y-4">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black bg-orange-500/10 text-orange-400 border border-orange-500/25 px-2 py-0.5 rounded uppercase">
                {selectedLogDetail.direction} CALL LOG REPORT
              </span>
              <h3 className="font-black text-white text-base">{selectedLogDetail.contactName}</h3>
              <p className="text-[10px] text-slate-500 font-mono">{selectedLogDetail.phone} • Date: {selectedLogDetail.date} • Duration: {selectedLogDetail.duration}</p>
            </div>
            
            <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-lg border ${
              selectedLogDetail.leadQualified 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {selectedLogDetail.leadQualified ? "Qualified Lead Booked" : "Unqualified / General Inquiry"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Summary & Action Items */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase block">AI TRANSCRIPT SUMMARY:</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850/80 italic">
                  "{selectedLogDetail.summary}"
                </p>
              </div>

              {selectedLogDetail.actionItems && selectedLogDetail.actionItems.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-extrabold text-orange-400 block uppercase">GENERATED FOLLOW-UP ACTIONS:</span>
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850/80">
                    {selectedLogDetail.actionItems.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Complete Transcript Logs */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase block">FULL PHONE TRANSCRIPT DIALOGUE:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/80 max-h-[160px] overflow-y-auto space-y-2.5 scrollbar-thin">
                {selectedLogDetail.transcript?.map((t, idx) => {
                  const isAi = t.sender === "AI Receptionist";
                  return (
                    <div key={idx} className="text-[11px] leading-relaxed">
                      <strong className={isAi ? "text-orange-400 font-mono" : "text-blue-400 font-mono"}>
                        {t.sender}:
                      </strong>{" "}
                      <span className="text-slate-300">{t.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
