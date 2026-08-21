import React, { useState, useEffect } from "react";
import { 
  Sparkles, Search, MessageSquare, Phone, Mail, Send, Bot, Check, ShieldAlert, 
  RefreshCw, AlertCircle, Trash, Play, User, Menu, X, Star, Calendar, FileText, ChevronRight, Plus,
  Globe, Wrench, Home, Volume2, HardDrive, Link, Zap, ExternalLink, HelpCircle, ArrowRight, ShieldCheck,
  CheckCircle2, Sliders, Layers, Facebook, Instagram, MessageCircle, Settings, Clipboard, Shield
} from "lucide-react";

interface Thread {
  id: string;
  name: string;
  channel: string; // "SMS" | "Email" | "Web-chat" | "Yelp" | "Angi" | "Google Business Profile" | "Thumbtack" | "Facebook" | "Instagram" | "Voicemail";
  lastMsg: string;
  time: string;
  unread: boolean;
  starred: boolean;
  phone: string;
  email: string;
  budget: number;
  status: "New" | "Contacted" | "Won" | "Estimating";
  originalChannel: string;
  isPivoted?: boolean;
  location?: string;
}

interface AutoReplyDirective {
  channel: string;
  enabled: boolean;
  directive: string;
}

export default function ClientConnectModule() {
  const [activeTab, setActiveTab] = useState<"inbox" | "receptionist" | "automation" | "integrations">("inbox");

  // Web Audio chime for incoming lead simulator
  const playIncomingChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      // Elegant high-fidelity double-chime (C5 then E5)
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Browser audio blocked or not supported:", e);
    }
  };

  // High-fidelity pre-seeded omnichannel threads
  const [threads, setThreads] = useState<Thread[]>([
    { id: "t1", name: "Sarah Williams", channel: "SMS", lastMsg: "Can you guys start this Thursday? I want to get the front porch done.", time: "15 mins ago", unread: true, starred: true, phone: "(717) 555-0145", email: "sarah@gmail.com", budget: 4500, status: "Contacted", originalChannel: "SMS" },
    { id: "t2", name: "David Thompson", channel: "Email", lastMsg: "Contract is fully signed. Please send over the deposit invoice.", time: "2 hours ago", unread: false, starred: true, phone: "(717) 555-0310", email: "david@thompsondental.com", budget: 12500, status: "Won", originalChannel: "Email" },
    { id: "t3", name: "Eleanor Vance", channel: "Web-chat", lastMsg: "Do you offer cabinet refinishing or only walls?", time: "2 days ago", unread: false, starred: false, phone: "(717) 555-0450", email: "eleanor.v@vancedev.com", budget: 2800, status: "New", originalChannel: "Web-chat" },
    { id: "t4", name: "Marcus Brody", channel: "Yelp", lastMsg: "Need a quote to paint our restaurant front exterior. Needs to be done overnight to avoid shutting down operations.", time: "3 hours ago", unread: true, starred: false, phone: "(415) 555-0987", email: "m.brody@brodygrill.com", budget: 9500, status: "New", originalChannel: "Yelp", location: "Martinsburg, WV" },
    { id: "t5", name: "Regina King", channel: "Angi", lastMsg: "Need lead-paint encapsulation on historical wood trim for a Victorian home. Do you have SSPC training?", time: "Yesterday", unread: false, starred: true, phone: "(202) 555-1212", email: "rking@historicpreservation.org", budget: 18000, status: "Estimating", originalChannel: "Angi", location: "Harpers Ferry, WV" },
    { id: "t6", name: "Alex Mercer", channel: "Google Business Profile", lastMsg: "Hey! Saw your Google listing. Do you guys paint brick houses or does that seal in moisture?", time: "5 hours ago", unread: true, starred: false, phone: "(301) 555-4321", email: "alex.mercer99@gmail.com", budget: 6200, status: "New", originalChannel: "Google Business Profile", location: "Frederick, MD" },
    { id: "t7", name: "Samantha Cole", channel: "Thumbtack", lastMsg: "Need bedroom wallpaper removal and smooth skim coating, plus painting of 3 rooms.", time: "1 day ago", unread: false, starred: false, phone: "(540) 555-7766", email: "samantha.c@gmail.com", budget: 3200, status: "Contacted", originalChannel: "Thumbtack", location: "Winchester, VA" },
    { id: "t8", name: "Thomas Wayne", channel: "Voicemail", lastMsg: "[AI Transcript] Hello, yes, this is Thomas. I have an estate house in Berkeley County that needs full power-wash and 2 coats of paint. Please call me.", time: "10 mins ago", unread: true, starred: true, phone: "(607) 555-0912", email: "twayne@wayneenterprises.com", budget: 15000, status: "New", originalChannel: "Voicemail" }
  ]);

  const [selectedThread, setSelectedThread] = useState<Thread>(threads[0]);
  const [filterMode, setFilterMode] = useState<"all" | "unread" | "starred">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "direct" | "directories" | "search-social" | "calls">("all");

  // Message history mapping
  const [messages, setMessages] = useState<{ [key: string]: any[] }>({
    t1: [
      { sender: "customer", text: "Hello! I saw your Google listing and want to paint my living room.", time: "10:30 AM", channel: "SMS" },
      { sender: "ai-assistant", text: "Hi Sarah! Welcome to PaintingPro. I scored your project details. We would love to help. What is your estimated timeline?", time: "10:31 AM", channel: "AI Reply" },
      { sender: "customer", text: "Can you guys start this Thursday? I want to get the front porch done.", time: "10:45 AM", channel: "SMS" }
    ],
    t2: [
      { sender: "customer", text: "I reviewed the estimate for the commercial office suite.", time: "Yesterday, 3:00 PM", channel: "Email" },
      { sender: "contractor", text: "Sounds great, David. Let me know if you need any adjustments to the Sherwin-Williams Emerald trim choice.", time: "Yesterday, 3:15 PM", channel: "Email" },
      { sender: "customer", text: "Contract is fully signed. Please send over the deposit invoice.", time: "Today, 11:30 AM", channel: "Email" }
    ],
    t3: [
      { sender: "customer", text: "Hi, I have a quick cabinet painting question.", time: "June 27, 4:00 PM", channel: "Web-chat" },
      { sender: "ai-assistant", text: "Hi Eleanor! Yes, we specialize in kitchen cabinet dustless refinishing using durable lacquer coatings. How many cabinet doors do you have?", time: "June 27, 4:02 PM", channel: "AI Reply" },
      { sender: "customer", text: "Do you offer cabinet refinishing or only walls?", time: "June 27, 4:15 PM", channel: "Web-chat" }
    ],
    t4: [
      { sender: "customer", text: "Hi, I'm looking for an industrial-grade painter for my restaurant front in Martinsburg.", time: "3 hours ago", channel: "Yelp" },
      { sender: "customer", text: "Need a quote to paint our restaurant front exterior. Needs to be done overnight to avoid shutting down operations.", time: "3 hours ago", channel: "Yelp" }
    ],
    t5: [
      { sender: "customer", text: "Hello, I am looking to get our 1890 Victorian home in Harpers Ferry painted.", time: "Yesterday", channel: "Angi" },
      { sender: "contractor", text: "We love historical properties! Yes, we have certified Lead-Safe EPA practices and painters trained in SSPC-SP2 wood scraper preps.", time: "Yesterday", channel: "Angi" },
      { sender: "customer", text: "Need lead-paint encapsulation on historical wood trim for a Victorian home. Do you have SSPC training?", time: "Yesterday", channel: "Angi" }
    ],
    t6: [
      { sender: "customer", text: "Hey! Saw your Google listing. Do you guys paint brick houses or does that seal in moisture?", time: "5 hours ago", channel: "Google Business Profile" }
    ],
    t7: [
      { sender: "customer", text: "Hi Samantha here, found you on Thumbtack.", time: "1 day ago", channel: "Thumbtack" },
      { sender: "contractor", text: "Hi Samantha! We can certainly help with wallpaper removal. We use steam-dissolve stripping.", time: "1 day ago", channel: "Thumbtack" },
      { sender: "customer", text: "Need bedroom wallpaper removal and smooth skim coating, plus painting of 3 rooms.", time: "1 day ago", channel: "Thumbtack" }
    ],
    t8: [
      { sender: "customer", text: "[Incoming Call System Node: Recording Attached]", time: "10 mins ago", channel: "Voicemail" },
      { sender: "customer", text: "Hello, yes, this is Thomas Wayne. I have an estate house in Berkeley County that needs full power-wash and 2 coats of paint. Please call me back.", time: "10 mins ago", channel: "Voicemail" }
    ]
  });

  const [typedReply, setTypedReply] = useState("");
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [replyMethod, setReplyMethod] = useState<"channel" | "pivot-sms" | "pivot-email">("channel");

  // Channel pivot form state
  const [pivotPhone, setPivotPhone] = useState("");
  const [pivotEmail, setPivotEmail] = useState("");
  const [isPivoting, setIsPivoting] = useState(false);

  // Auto-Reply Directives state
  const [directives, setDirectives] = useState<AutoReplyDirective[]>( [
    { channel: "Google Business Profile", enabled: true, directive: "Acknowledge the brick or siding questions. Invite them to direct SMS. Emphasize that brick requires mineral silicate paints to let the brick breathe." },
    { channel: "Yelp", enabled: true, directive: "Provide rapid-fire assistance. Focus on professional SSPC coating standards. Offer a soft starting exterior painting price guideline of $3,500 - $8,000 to filter serious inquiries." },
    { channel: "Angi", enabled: true, directive: "Acknowledge historic structural rules (EPA Lead-Safe RRP certification, wet glaze scraping). Request photos to provide a precise past performance quotation." },
    { channel: "Thumbtack", enabled: false, directive: "Highlight local 100% customer satisfaction ratings, dustless cabinet sanding, and suggest booking an in-person estimate." },
    { channel: "Facebook / Instagram", enabled: true, directive: "Be casual but professional. Show photos or offer to share case studies of local WV/VA residential transformations." },
    { channel: "Voicemail / Transcripts", enabled: true, directive: "Generate an instant SMS reply acknowledging their voice message, citing their specific transcribed requests, and booking them." }
  ]);

  // Receptionist general prompt
  const [receptionistPrompt, setReceptionistPrompt] = useState(
    "You are a highly efficient, multi-channel AI Receptionist for PaintingPro AI. Guard customer conversations across Yelp, Angi, Google, Facebook, SMS, and Email. Always cross-reference SSPC preps and regional Davis-Bacon compliance. Your key goal is to capture high-quality project specifications, schedule estimators, and pivot third-party directory leads to direct SMS lines to bypass lead commission fees."
  );

  // Connected Sources integrations state
  const [integrations, setIntegrations] = useState([
    { id: "google", name: "Google Business Profile", type: "Search", status: "Connected", detail: "Place ID: ChIJ-92uE8Lbt4kR, 3 reviews queued", lastSync: "10 mins ago" },
    { id: "yelp", name: "Yelp Connect", type: "Directory", status: "Connected", detail: "Webhook active: /webhooks/yelp, Secret active", lastSync: "1 hour ago" },
    { id: "angi", name: "Angi Leads Portal", type: "Directory", status: "Disconnected", detail: "Awaiting OAuth token matching", lastSync: "Never" },
    { id: "thumbtack", name: "Thumbtack Instant Match", type: "Directory", status: "Connected", detail: "Max lead budget: $200/week configured", lastSync: "4 hours ago" },
    { id: "meta", name: "Meta Pages (FB & IG)", type: "Social", status: "Connected", detail: "Page ID: 10837264849, Access Token verified", lastSync: "12 mins ago" },
    { id: "webchat", name: "Custom Web Widget", type: "Direct", status: "Connected", detail: "Active snippet script loaded on host", lastSync: "Live" },
    { id: "twilio", name: "Twilio Direct SMS", type: "Direct", status: "Connected", detail: "System Phone: (717) 555-0100 verified", lastSync: "Live" }
  ]);

  const [showConnectModal, setShowConnectModal] = useState<any>(null);
  const [authCredential, setAuthCredential] = useState("");
  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);

  // New simulated lead pool
  const simulatedLeadPool = [
    {
      name: "Marcus Vance",
      channel: "Yelp",
      lastMsg: "Need a high-performance floor coating for a 3-car garage. Epoxy or polyaspartic preferred. When can we start?",
      phone: "(304) 555-8833",
      email: "mvance@gmail.com",
      budget: 3500,
      location: "Martinsburg, WV"
    },
    {
      name: "Helen Ross",
      channel: "Angi",
      lastMsg: "Hi! Looking for a painter to do 14 interior doors and kitchen cabinetry dustless lacquer finishing. Needs a quick turnaround.",
      phone: "(703) 555-1212",
      email: "helen@rosscorp.org",
      budget: 4200,
      location: "Fairfax, VA"
    },
    {
      name: "Clarissa Harlowe",
      channel: "Google Business Profile",
      lastMsg: "Do you offer zero-VOC paints? We have severe asthma in the house and need safe interior acrylic coatings.",
      phone: "(240) 555-3211",
      email: "clarissa.h@outlook.com",
      budget: 5800,
      location: "Hagerstown, MD"
    },
    {
      name: "Robert Chen",
      channel: "Instagram",
      lastMsg: "Saw your beautiful historical Victorian trim photos on Instagram! Do you paint outdoor decks and restore weathered timber?",
      phone: "(540) 555-9090",
      email: "rchen@chenproperties.com",
      budget: 7500,
      location: "Winchester, VA"
    },
    {
      name: "Gary Simmons",
      channel: "Thumbtack",
      lastMsg: "Thumbtack Instant Match: Drywall repairs and full repaint of a double height entryway hall. Needs high scaffolding.",
      phone: "(304) 555-4422",
      email: "gary.simmons@hotmail.com",
      budget: 2900,
      location: "Charles Town, WV"
    }
  ];

  // Lead injection simulation
  const handleSimulateLead = () => {
    // Select random lead
    const randomLeadData = simulatedLeadPool[Math.floor(Math.random() * simulatedLeadPool.length)];
    const newId = "sim-" + Date.now();
    
    const newThread: Thread = {
      id: newId,
      name: randomLeadData.name,
      channel: randomLeadData.channel,
      lastMsg: randomLeadData.lastMsg,
      time: "Just now",
      unread: true,
      starred: false,
      phone: randomLeadData.phone,
      email: randomLeadData.email,
      budget: randomLeadData.budget,
      status: "New",
      originalChannel: randomLeadData.channel,
      location: randomLeadData.location
    };

    setThreads(prev => [newThread, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newId]: [
        { sender: "customer", text: randomLeadData.lastMsg, time: "Just now", channel: randomLeadData.channel }
      ]
    }));

    setSelectedThread(newThread);
    playIncomingChime();
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "SMS": return <MessageSquare className="h-3.5 w-3.5 text-teal-400" />;
      case "Email": return <Mail className="h-3.5 w-3.5 text-indigo-400" />;
      case "Web-chat": return <MessageCircle className="h-3.5 w-3.5 text-orange-400" />;
      case "Yelp": return <Sparkles className="h-3.5 w-3.5 text-rose-500" />;
      case "Angi": return <Home className="h-3.5 w-3.5 text-yellow-500" />;
      case "Google Business Profile": return <Globe className="h-3.5 w-3.5 text-sky-400" />;
      case "Thumbtack": return <Wrench className="h-3.5 w-3.5 text-blue-500" />;
      case "Facebook": return <Facebook className="h-3.5 w-3.5 text-blue-600" />;
      case "Instagram": return <Instagram className="h-3.5 w-3.5 text-pink-500" />;
      case "Voicemail": return <Volume2 className="h-3.5 w-3.5 text-amber-500" />;
      default: return <MessageSquare className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getChannelBadgeStyles = (channel: string) => {
    switch (channel) {
      case "SMS": return "bg-teal-950/40 text-teal-400 border-teal-500/20";
      case "Email": return "bg-indigo-950/40 text-indigo-400 border-indigo-500/20";
      case "Web-chat": return "bg-orange-950/40 text-orange-400 border-orange-500/20";
      case "Yelp": return "bg-rose-950/40 text-rose-400 border-rose-500/20";
      case "Angi": return "bg-yellow-950/40 text-yellow-400 border-yellow-500/20";
      case "Google Business Profile": return "bg-sky-950/40 text-sky-400 border-sky-500/20";
      case "Thumbtack": return "bg-blue-950/40 text-blue-400 border-blue-500/20";
      case "Voicemail": return "bg-amber-950/40 text-amber-400 border-amber-500/20";
      default: return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedReply.trim()) return;

    const threadId = selectedThread.id;
    const isPivotedReply = replyMethod !== "channel";
    const resolvedChannel = isPivotedReply 
      ? (replyMethod === "pivot-sms" ? "Direct SMS" : "Direct Email") 
      : selectedThread.channel;

    const newMsg = {
      sender: "contractor",
      text: typedReply,
      time: "Just now",
      channel: resolvedChannel
    };

    setMessages({
      ...messages,
      [threadId]: [...(messages[threadId] || []), newMsg]
    });

    setThreads(threads.map(t => 
      t.id === threadId 
        ? { ...t, lastMsg: typedReply, time: "Just now", unread: false, channel: resolvedChannel } 
        : t
    ));

    // Update selected thread model so UI stays in sync
    setSelectedThread(prev => ({
      ...prev,
      lastMsg: typedReply,
      time: "Just now",
      channel: resolvedChannel
    }));

    setTypedReply("");
  };

  // Channel direct pivoting
  const handleTriggerPivot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pivotPhone && !pivotEmail) return;

    const updatedPhone = pivotPhone || selectedThread.phone;
    const updatedEmail = pivotEmail || selectedThread.email;

    setThreads(threads.map(t => 
      t.id === selectedThread.id 
        ? { 
            ...t, 
            phone: updatedPhone, 
            email: updatedEmail, 
            channel: "SMS", 
            isPivoted: true 
          } 
        : t
    ));

    setMessages(prev => ({
      ...prev,
      [selectedThread.id]: [
        ...(prev[selectedThread.id] || []),
        { 
          sender: "system", 
          text: `⚡ Lead successfully pivoted from ${selectedThread.channel} to Direct Direct SMS channels. Welcome sequence initiated. Direct SMS line established: ${updatedPhone}`, 
          time: "Just now", 
          channel: "System Alert" 
        },
        { 
          sender: "ai-assistant", 
          text: `Hi ${selectedThread.name}! This is Carlos from Smart Growth Painting. Moving our chat here to text directly about your $${selectedThread.budget.toLocaleString()} painting estimate. Is this phone line best for SMS?`, 
          time: "Just now", 
          channel: "Direct SMS" 
        }
      ]
    }));

    setSelectedThread(prev => ({
      ...prev,
      phone: updatedPhone,
      email: updatedEmail,
      channel: "SMS",
      isPivoted: true
    }));

    setIsPivoting(false);
    setPivotPhone("");
    setPivotEmail("");
  };

  const handleAISuggestReply = async () => {
    setAiSuggesting(true);
    const threadId = selectedThread.id;
    const history = messages[threadId] || [];

    // Get active directive for this thread's source
    const targetSource = selectedThread.originalChannel;
    const activeDirectiveObj = directives.find(d => targetSource.includes(d.channel) || d.channel.includes(targetSource));
    const customPromptGuideline = activeDirectiveObj?.directive || receptionistPrompt;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Respond to the customer's last message using this specific channel directive: "${customPromptGuideline}". Keep it brief, professional, and address the customer by name if known.`,
          systemInstruction: receptionistPrompt,
          history: history.map(m => ({
            role: m.sender === "customer" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`Chat quick reply error status: ${res.status}`);
      }

      const data = await res.json();
      setTypedReply(data.reply || "Awaiting suggestion...");
    } catch (err) {
      console.error(err);
      
      // High-fidelity fallback based on channel and directive
      if (selectedThread.originalChannel === "Yelp") {
        setTypedReply(`Hi ${selectedThread.name}! This is Carlos from Smart Growth Painting. I saw your Yelp request about the overnight front exterior quote. Under SSPC standards, overnight metal/masonry painting is highly feasible. Our standard commercial exterior projects range between $4,500 and $9,500 depending on prep. Shall we set up an estimator visits to inspect the brick on-site?`);
      } else if (selectedThread.originalChannel === "Google Business Profile") {
        setTypedReply(`Hi ${selectedThread.name}! Thanks for reaching out via our Google Profile. Excellent question on brick houses. We always utilize breathable premium mineral silicate coatings to avoid trapping interior vapor moisture in the brick. Let's schedule an estimator to look at your brickwork this week!`);
      } else if (selectedThread.originalChannel === "Angi") {
        setTypedReply(`Hi ${selectedThread.name}, thank you for contacting us via Angi. Since this is an 1890 Victorian home, we adhere strictly to EPA Lead-Safe RRP wood scraping rules and wet-misting paint containment. We carry full project bonding up to $650k. Could you send over any photos of the trim?`);
      } else {
        setTypedReply(`Hi ${selectedThread.name}! Thanks for reaching out. Based on your $${selectedThread.budget.toLocaleString()} budget, we have Carlos's crew ready next week. Shall we align a precise direct SMS or calendar booking link for a physical survey?`);
      }
    } finally {
      setAiSuggesting(false);
    }
  };

  // Toggle Auto-Reply enabled state
  const handleToggleDirective = (channelName: string) => {
    setDirectives(directives.map(d => d.channel === channelName ? { ...d, enabled: !d.enabled } : d));
  };

  const handleUpdateDirectiveText = (channelName: string, newText: string) => {
    setDirectives(directives.map(d => d.channel === channelName ? { ...d, directive: newText } : d));
  };

  // Handle OAuth integrations
  const handleTriggerConnect = (integration: any) => {
    setShowConnectModal(integration);
    setAuthCredential("");
  };

  const handleSaveIntegration = () => {
    if (!showConnectModal) return;
    setIntegrations(integrations.map(int => 
      int.id === showConnectModal.id 
        ? { ...int, status: "Connected", detail: "OAuth Active & Verified", lastSync: "Just now" } 
        : int
    ));
    setShowConnectModal(null);
  };

  // Filter threads by criteria and category
  const filteredThreadsByOrigin = threads.filter(t => {
    if (sourceFilter === "direct") return ["SMS", "Email", "Web-chat"].includes(t.channel) || t.isPivoted;
    if (sourceFilter === "directories") return ["Yelp", "Angi", "Thumbtack"].includes(t.channel);
    if (sourceFilter === "search-social") return ["Google Business Profile", "Facebook", "Instagram"].includes(t.channel);
    if (sourceFilter === "calls") return t.channel === "Voicemail";
    return true;
  });

  const finalFilteredThreads = filteredThreadsByOrigin.filter(t => {
    if (filterMode === "unread") return t.unread;
    if (filterMode === "starred") return t.starred;
    return true;
  });

  const isThirdPartyOriginal = ["Yelp", "Angi", "Thumbtack", "Google Business Profile", "Instagram", "Facebook"].includes(selectedThread.originalChannel);

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-8 text-white text-left font-sans" id="client-connect-root">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500/10 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
              Omnichannel Lead System
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              9 SOURCES SYNCED
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">Unified Communications Center</h2>
          <p className="text-slate-400 text-xs mt-1">
            Genuinely unify leads from Google, Yelp, Angi, Socials, Voicemail and SMS in one single screen. Prevent directory fees with Direct Pivots.
          </p>
        </div>

        {/* Lead Injection Simulator & Sync */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleSimulateLead}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-orange-500/15"
          >
            <Zap className="h-3.5 w-3.5 animate-bounce" />
            <span>Simulate Lead Intake</span>
          </button>
        </div>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-4">
        <div className="flex gap-2">
          {[
            { id: "inbox", label: "📬 Unified Lead Inbox" },
            { id: "receptionist", label: "🤖 AI Channel Directives" },
            { id: "automation", label: "⚡ Workflows" },
            { id: "integrations", label: "🔌 Connected Sources" }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-wider ${
                activeTab === tab.id 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB 1: UNIFIED INBOX ==================== */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch h-[680px]" id="view-unified-inbox">
          
          {/* Thread List Sidebar Panel */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
            
            {/* Header filters */}
            <div className="p-3.5 border-b border-slate-800/80 space-y-3 bg-slate-950">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-white text-[10px] font-mono uppercase tracking-wider">Inbox Threads</span>
                <span className="text-[9px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-bold">
                  {threads.filter(t => t.unread).length} Unread
                </span>
              </div>

              {/* Source Filters */}
              <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                {[
                  { id: "all", label: "All Sources" },
                  { id: "direct", label: "Direct (SMS/Email)" },
                  { id: "search-social", label: "Google/Social" },
                  { id: "directories", label: "Yelp/Angi/TT" },
                  { id: "calls", label: "Voicemails" }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSourceFilter(filter.id as any)}
                    className={`py-1 rounded px-1 text-center font-bold border transition ${
                      sourceFilter === filter.id 
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                        : "bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300"
                    } ${filter.id === "all" ? "col-span-2" : "col-span-1"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 text-[9px] font-mono border-t border-slate-900 pt-2">
                <button 
                  onClick={() => setFilterMode("all")}
                  className={`flex-1 py-1 rounded border ${filterMode === "all" ? "text-orange-400 font-bold" : "text-slate-500"}`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setFilterMode("unread")}
                  className={`flex-1 py-1 rounded border ${filterMode === "unread" ? "text-orange-400 font-bold" : "text-slate-500"}`}
                >
                  UNREAD
                </button>
                <button 
                  onClick={() => setFilterMode("starred")}
                  className={`flex-1 py-1 rounded border ${filterMode === "starred" ? "text-orange-400 font-bold" : "text-slate-500"}`}
                >
                  STARRED
                </button>
              </div>
            </div>

            {/* List scroll */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-900">
              {finalFilteredThreads.length > 0 ? (
                finalFilteredThreads.map((thread) => (
                  <div 
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-3 rounded-xl transition cursor-pointer text-left space-y-2 relative border ${
                      selectedThread.id === thread.id 
                        ? "bg-slate-900 border-slate-800" 
                        : "bg-transparent border-transparent hover:bg-slate-900/30"
                    }`}
                  >
                    {thread.unread && (
                      <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}

                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 max-w-[80%]">
                        <h5 className="font-extrabold text-white text-xs truncate">{thread.name}</h5>
                        <div className="flex items-center gap-1.5">
                          {getChannelIcon(thread.originalChannel)}
                          <span className="text-[8px] font-mono text-slate-400 tracking-wider uppercase truncate">
                            {thread.originalChannel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 shrink-0">{thread.time}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal truncate">{thread.lastMsg}</p>
                    
                    {thread.isPivoted && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1 rounded">
                        <Zap className="h-2 w-2 shrink-0" />
                        DIRECT PIVOTED
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-600 text-xs">No active threads matching filter.</div>
              )}
            </div>
          </div>

          {/* Active Chat Conversation Area */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between h-full overflow-hidden">
            
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-850 bg-slate-950/80 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{selectedThread.name}</h4>
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${getChannelBadgeStyles(selectedThread.originalChannel)}`}>
                    {getChannelIcon(selectedThread.originalChannel)}
                    {selectedThread.originalChannel}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 font-mono">
                  Origin: <strong className="text-slate-300">{selectedThread.location || "Local State Area"}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const starredVal = !selectedThread.starred;
                    setThreads(threads.map(t => t.id === selectedThread.id ? { ...t, starred: starredVal } : t));
                    setSelectedThread(prev => ({ ...prev, starred: starredVal }));
                  }}
                  className="text-slate-400 hover:text-white bg-slate-900 p-2 border border-slate-850 rounded-xl"
                >
                  <Star className={`h-3.5 w-3.5 ${selectedThread.starred ? "fill-orange-500 text-orange-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
              
              {/* Directory Fee Commission Alert */}
              {isThirdPartyOriginal && !selectedThread.isPivoted && (
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                    <ShieldAlert className="h-4 w-4" />
                    <span>THIRD-PARTY PLATFORM COMMISSION ALERT</span>
                  </div>
                  <p>
                    {selectedThread.originalChannel} leads are subject to high booking commissions (up to 15%) or pay-per-contact click fees. Securely pivot <b>{selectedThread.name}</b> to direct SMS or Email channels to save on referral overhead!
                  </p>
                  <button 
                    onClick={() => setIsPivoting(true)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer uppercase"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Pivot to Direct SMS Now</span>
                  </button>
                </div>
              )}

              {/* Pivot Form overlay inside box */}
              {isPivoting && (
                <form onSubmit={handleTriggerPivot} className="bg-slate-900 border border-orange-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">Establish Direct Pipeline</span>
                    <button type="button" onClick={() => setIsPivoting(false)} className="text-slate-500 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-slate-500 uppercase">Confirm Phone (Direct SMS)</label>
                      <input 
                        type="text" 
                        value={pivotPhone}
                        onChange={(e) => setPivotPhone(e.target.value)}
                        placeholder={selectedThread.phone || "(717) 555-xxxx"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs focus:outline-none text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-slate-500 uppercase">Confirm Email (Estimates Direct)</label>
                      <input 
                        type="text" 
                        value={pivotEmail}
                        onChange={(e) => setPivotEmail(e.target.value)}
                        placeholder={selectedThread.email || "customer@gmail.com"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs focus:outline-none text-white"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                  >
                    Send Direct Onboarding Text & Close Channel
                  </button>
                </form>
              )}

              {/* Chat bubbles list */}
              {(messages[selectedThread.id] || []).map((msg, idx) => {
                const isMe = msg.sender === "contractor" || msg.sender === "ai-assistant";
                const isSys = msg.sender === "system";
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
                    
                    {!isSys && (
                      <div className="flex gap-1.5 items-center font-mono text-[8px] text-slate-500">
                        <span className="uppercase">{msg.sender === "ai-assistant" ? "🤖 AI Receptionist Autopilot" : msg.sender}</span>
                        <span>•</span>
                        <span className="uppercase">{msg.channel || selectedThread.channel}</span>
                      </div>
                    )}

                    {isSys ? (
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "ai-assistant" 
                          ? "bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-tl-none" 
                          : isMe 
                          ? "bg-orange-500 text-white rounded-tr-none" 
                          : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                    )}
                    
                    {!isSys && <span className="text-[8px] font-mono text-slate-600">{msg.time}</span>}
                  </div>
                );
              })}
            </div>

            {/* Reply Input Panel */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 bg-slate-950 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                
                {/* Method selector */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReplyMethod("channel")}
                    className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-mono ${
                      replyMethod === "channel" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Reply via API
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyMethod("pivot-sms")}
                    className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-mono ${
                      replyMethod === "pivot-sms" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Direct SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyMethod("pivot-email")}
                    className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-mono ${
                      replyMethod === "pivot-email" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Direct Email
                  </button>
                </div>

                {/* AI Draft Suggest Button */}
                <button 
                  type="button"
                  onClick={handleAISuggestReply}
                  disabled={aiSuggesting}
                  className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 py-1.5 px-3 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {aiSuggesting ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>AI Analysing Directives...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-3.5 w-3.5 animate-pulse" />
                      <span>Get Suggested AI Reply</span>
                    </>
                  )}
                </button>
              </div>

              {/* Actual Input */}
              <div className="relative flex gap-2">
                <input 
                  type="text"
                  placeholder={
                    replyMethod === "channel" 
                      ? `Type responsive reply via ${selectedThread.originalChannel}...`
                      : replyMethod === "pivot-sms"
                      ? `Pivot outbound to ${selectedThread.phone || "selected contact SMS"}...`
                      : `Pivot outbound to ${selectedThread.email || "selected contact Email"}...`
                  }
                  value={typedReply}
                  onChange={(e) => setTypedReply(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
                <button 
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* CRM Profile Sidebar Panel */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 text-left flex flex-col justify-between h-full">
            <div className="space-y-4 overflow-y-auto">
              <div className="pb-3 border-b border-slate-850">
                <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-bold">Local CRM Profile</span>
                <h5 className="font-extrabold text-white text-xs mt-0.5">Automated Lead Record</h5>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-1">
                  <p className="text-slate-500 text-[8px] font-mono uppercase">Full Name</p>
                  <h5 className="font-bold text-white text-xs">{selectedThread.name}</h5>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-1">
                  <p className="text-slate-500 text-[8px] font-mono uppercase">Direct Phone Line</p>
                  <h5 className="font-bold text-white text-xs font-mono">{selectedThread.phone || "Awaiting pivot capture"}</h5>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-1">
                  <p className="text-slate-500 text-[8px] font-mono uppercase">Email Address</p>
                  <h5 className="font-bold text-white text-xs font-mono truncate">{selectedThread.email || "Awaiting pivot capture"}</h5>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <p className="text-slate-500 text-[8px] font-mono uppercase">Target Budget</p>
                    <h5 className="font-bold text-orange-400 text-xs">${selectedThread.budget.toLocaleString()}</h5>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <p className="text-slate-500 text-[8px] font-mono uppercase">Job Status</p>
                    <span className="text-[9px] font-mono font-bold text-slate-300 block mt-0.5 uppercase">
                      {selectedThread.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee matrix visualization on sidebar */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 text-[10px] space-y-1.5">
                <span className="block font-mono text-[8px] text-slate-500 uppercase font-black">Platform Cost Overhead</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Originated:</span>
                  <span className="text-white font-mono">{selectedThread.originalChannel}</span>
                </div>
                <div className="flex justify-between border-t border-slate-850 pt-1">
                  <span className="text-slate-400">Platform Referral Fee:</span>
                  <span className={`font-mono font-bold ${selectedThread.isPivoted ? "text-emerald-400" : "text-rose-400"}`}>
                    {selectedThread.isPivoted ? "$0.00 (Direct)" : `$${(selectedThread.budget * 0.15).toFixed(0)} (15% est)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-850 pt-3">
              <button 
                onClick={() => alert(`Bid estimate of $${selectedThread.budget} initialized in Quote Genius CRM.`)}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-300 font-semibold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-orange-400" />
                <span>Initialize Estimate Sheet</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: RECEPTIONIST & AUTO-REPLY MATRIX ==================== */}
      {activeTab === "receptionist" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-receptionist">
          
          {/* Left panel instructions config */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Bot className="h-5 w-5 text-orange-500 animate-pulse" />
                Global AI Agent Guard Config
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              The Virtual Receptionist analyzes incoming web-chats, directory requests, and direct emails. When enabled, it drafts responsive messages aligning with custom regulatory preps.
            </p>

            <div className="space-y-1 pt-2">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Master Receptionist System Prompt</label>
              <textarea 
                value={receptionistPrompt}
                onChange={(e) => setReceptionistPrompt(e.target.value)}
                className="w-full h-44 bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
              />
            </div>

            <button 
              onClick={() => alert("Master AI Assistant guidelines updated successfully!")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition uppercase"
            >
              Save Master Agent Directives
            </button>
          </div>

          {/* Right channel-specific Auto-Reply directives board */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-wider">Source-Specific Auto-Reply Matrix</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fine-tune training variables depending on where the lead was captured.</p>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {directives.map((dir, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{dir.channel}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={dir.enabled}
                        onChange={() => handleToggleDirective(dir.channel)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                  </div>

                  <textarea
                    value={dir.directive}
                    onChange={(e) => handleUpdateDirectiveText(dir.channel, e.target.value)}
                    className="w-full h-16 bg-slate-950 border border-slate-850 text-slate-300 rounded-lg p-2.5 text-xs focus:outline-none"
                    placeholder="Enter prompt guidelines specific to this channel..."
                  />
                </div>
              ))}
            </div>

            <div className="text-right pt-2">
              <button 
                onClick={() => alert("Source prompt guidelines updated. Suggestions will now parse channel matrix rules!")}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
              >
                Sync Source-Specific Matrix
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 3: AUTOMATION SEQUENCES ==================== */}
      {activeTab === "automation" && (
        <div className="space-y-6" id="view-automations">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Automatic Omnichannel Sequences</h3>
              <p className="text-xs text-slate-400">Design automated autopilot triggers for estimate follow-ups, invoice receipts and thank-yous.</p>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer">
              <Plus className="h-4 w-4 text-slate-950" />
              <span>Create Sequence Flow</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Immediate Intake Sequence", desc: "Triggers on new web-chat capture or Yelp message. Dispatches direct auto-welcome SMS and schedules estimator follow-up call.", active: true, actions: 3 },
              { title: "Directory Pivot Sequence", desc: "Triggers when a third-party lead is pivoted. Auto-removes them from directory contact queues and establishes a direct Twilio direct SMS conversation.", active: true, actions: 2 },
              { title: "Estimate 24-Hour Follow Up", desc: "Auto-pilot follow-up. Sends an email or text if the initial estimate remains sent and draft for more than 24 hours.", active: true, actions: 2 },
              { title: "Invoice Paid Thank You Blast", desc: "Automated review solicitor. Requests Google Business Profile 5-Star feedback post-payment on completed commercial projects.", active: false, actions: 4 }
            ].map((flow, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-white text-sm">{flow.title}</h4>
                  
                  {/* Toggle Active status */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={flow.active}
                      className="sr-only peer"
                      readOnly 
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{flow.desc}</p>

                {/* Bento workflow actions list */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase bg-slate-900 p-2 rounded-lg border border-slate-850">
                  <Play className="h-3.5 w-3.5 text-orange-400 fill-orange-400 shrink-0" />
                  <span>CONTAINS {flow.actions} ACTION BLOCKS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: CONNECTED SOURCES ==================== */}
      {activeTab === "integrations" && (
        <div className="space-y-6" id="view-integrations">
          
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
            <h3 className="font-extrabold text-white text-base">🔌 Lead Acquisition API Integrations</h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify Webhook addresses and OAuth tokens. Keep channels synchronized to pull every incoming directory or phone lead into your master inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((int) => (
              <div key={int.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-mono font-bold text-orange-400 bg-orange-950/40 border border-orange-500/10 px-2 py-0.5 rounded-md uppercase">
                        {int.type} Source
                      </span>
                      <h4 className="font-extrabold text-white text-sm mt-1.5">{int.name}</h4>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      int.status === "Connected" 
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-950/40 text-rose-400 border border-rose-500/20 animate-pulse"
                    }`}>
                      {int.status === "Connected" ? "● Active Sync" : "○ Disconnected"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    {int.detail}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-3">
                  <span>Last Checked: {int.lastSync}</span>
                  
                  {int.status === "Connected" ? (
                    <button 
                      onClick={() => alert(`${int.name} connection remains healthy. Sycned with endpoint.`)}
                      className="text-orange-400 font-bold hover:underline"
                    >
                      Diagnose Endpoint
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleTriggerConnect(int)}
                      className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold px-3 py-1 rounded-lg text-[10px]"
                    >
                      Connect Account
                    </button>
                  )}
                </div>

              </div>
            ))}

            {/* Custom Chat Widget Embed Copy Tool Card */}
            <div className="bg-slate-950 border border-orange-500/20 p-5 rounded-2xl space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md uppercase">
                  Website Embedding
                </span>
                <h4 className="font-extrabold text-white text-sm mt-1">Copy Web Chat Script</h4>
                <p className="text-xs text-slate-400">Embed this light lightweight HTML5 web-chat widget on your homepage or Squarespace site to pipe leads directly into the unified portal.</p>
                
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 font-mono text-[9px] text-slate-300 select-all overflow-x-auto whitespace-nowrap">
                  {`<!-- PaintingPro Inbox Capture -->\n<script src="https://cdn.paintingpro.ai/widget.js?id=UEI18H37KA84"></script>`}
                </div>
              </div>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`<script src="https://cdn.paintingpro.ai/widget.js?id=UEI18H37KA84"></script>`);
                  setWebhookUrlCopied(true);
                  setTimeout(() => setWebhookUrlCopied(false), 2000);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Clipboard className="h-3.5 w-3.5 text-orange-400" />
                <span>{webhookUrlCopied ? "Copied Widget Tag!" : "Copy Embed Script"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Source Wizard Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-left">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest block font-bold">Secure OAuth Sync</span>
                <h4 className="text-base font-serif font-bold text-white mt-1">Connect {showConnectModal.name}</h4>
              </div>
              <button 
                onClick={() => setShowConnectModal(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              By connecting your {showConnectModal.name} credentials, PaintingPro AI will install a secure webhook listener that transcribes incoming user inquiries straight to this console.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Provider Access Token or Login Key</label>
              <input 
                type="password"
                value={authCredential}
                onChange={(e) => setAuthCredential(e.target.value)}
                placeholder="E.g., pk_live_83b38c..."
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] text-slate-500 font-mono space-y-1">
              <span className="block text-slate-400 font-bold">Authorized Redirect URL</span>
              <span className="block text-slate-400 truncate">https://api.paintingpro.ai/auth/{showConnectModal.id}/callback</span>
            </div>

            <div className="pt-3 flex gap-2.5">
              <button 
                onClick={() => setShowConnectModal(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveIntegration}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2 rounded-xl text-xs transition"
              >
                Verify & Sync API
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
