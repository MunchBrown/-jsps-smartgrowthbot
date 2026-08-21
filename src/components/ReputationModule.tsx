import React, { useState, useMemo } from "react";
import {
  Star, MessageSquare, Video, LayoutGrid, MapPin, Settings, Send,
  CheckCircle2, Sparkles, Filter, Search, Plus, ExternalLink, Copy,
  Check, RefreshCw, AlertCircle, Play, ShieldAlert, Smartphone, Mail,
  MessageCircle, QrCode, Globe, Clock, Bot, Sliders, ChevronRight,
  TrendingUp, Award, Layers, Eye, FileText, Download, Share2, ThumbsUp,
  Building2, Trash2, Edit3, X, Zap, Code
} from "lucide-react";
import {
  Review, VideoTestimonial, ReviewRequest, ReviewWidget,
  DirectoryListing, ReputationSettings
} from "../types";

// Initial Sample Data
const INITIAL_REVIEWS: Review[] = [
  {
    id: "REV-101",
    author: "Sarah Williams",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    platform: "Google",
    rating: 5,
    content: "Smart Growth Painting painted our entire 2-story interior home in York. Their crew leader Carlos was punctual, ultra-clean with drop cloths, and finished 1 day ahead of schedule! The Sherwin-Williams Duration finish looks flawless.",
    date: "2026-08-16",
    replied: true,
    replyText: "Thank you so much Sarah! It was a pleasure painting your home. Carlos and the crew loved working with you!",
    replyDate: "2026-08-16",
    sentiment: "Positive",
    projectType: "Residential Interior Repaint",
    aiSuggestedReply: "Thank you Sarah! Carlos and our interior crew are thrilled to hear you're loving your new Sherwin-Williams Duration finish!"
  },
  {
    id: "REV-102",
    author: "Robert Martinez (Keystone Office)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    platform: "Google",
    rating: 5,
    content: "Hired them for a commercial exterior repaint on our 8,500 sqft facility. High attention to moisture testing and surface prep. Extremely competitive commercial rate and professional project management.",
    date: "2026-08-14",
    replied: true,
    replyText: "Appreciate the trust Robert! Looking forward to assisting Keystone Commercial with future facility maintenance.",
    replyDate: "2026-08-14",
    sentiment: "Positive",
    projectType: "Commercial Exterior",
    aiSuggestedReply: "Thank you Robert! We're proud to serve Keystone Commercial Facilities with top-grade elastomeric coatings."
  },
  {
    id: "REV-103",
    author: "Jennifer Chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    platform: "Facebook",
    rating: 5,
    content: "Best painters in PA! They transformed our retail store overnight using zero-VOC Scuff-X paint so we didn't have to close during business hours.",
    date: "2026-08-11",
    replied: true,
    replyText: "Thank you Jennifer! Low-VOC night application is our specialty for retail clients.",
    replyDate: "2026-08-11",
    sentiment: "Positive",
    projectType: "Commercial Retail Refresh",
    aiSuggestedReply: "Thank you Jennifer! We're glad our low-VOC night-shift crew kept your retail doors open!"
  },
  {
    id: "REV-104",
    author: "Michael Vance",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    platform: "Yelp",
    rating: 4,
    content: "Great quality paint work on our deck and exterior wood siding. Minor delay on day 1 due to rain, but communicated clearly.",
    date: "2026-08-08",
    replied: false,
    sentiment: "Positive",
    projectType: "Deck & Siding Stain",
    aiSuggestedReply: "Thank you Michael! Weather can be tricky with exterior staining, but we're glad you're happy with the final result!"
  },
  {
    id: "REV-105",
    author: "Anonymous Competitor Bot",
    platform: "Google",
    rating: 1,
    content: "Fake review string test text 12345.",
    date: "2026-08-05",
    replied: false,
    isSpam: true,
    spamReason: "Bot pattern detected: repetitive text string with zero client record match.",
    sentiment: "Negative"
  }
];

const INITIAL_VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: "VID-01",
    author: "Sarah Williams",
    companyName: "Homeowner - York PA",
    projectCompleted: "Full Interior Repaint (SW Duration)",
    rating: 5,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    durationSeconds: 42,
    transcript: "Hey everyone! I just wanted to show off the amazing job Smart Growth Painting did on our living room and kitchen walls. Zero mess, super friendly crew, and the paint finish is literally perfection!",
    date: "2026-08-15",
    approved: true,
    embedCode: `<iframe src="https://paintingpro.ai/embed/video/VID-01" width="360" height="640" frameborder="0"></iframe>`
  },
  {
    id: "VID-02",
    author: "David Thompson",
    companyName: "Thompson Construction Group",
    projectCompleted: "New Construction 4,500 SqFt Estate",
    rating: 5,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80",
    durationSeconds: 58,
    transcript: "As a general contractor, finding painters who hit deadlines without sacrificing quality is tough. PaintingPro AI handled 4,500 sqft in 4 days. Unbelievable efficiency.",
    date: "2026-08-10",
    approved: true,
    embedCode: `<iframe src="https://paintingpro.ai/embed/video/VID-02" width="360" height="640" frameborder="0"></iframe>`
  }
];

const INITIAL_REQUESTS: ReviewRequest[] = [
  {
    id: "REQ-2001",
    customerName: "Sarah Williams",
    channel: "SMS",
    recipient: "(717) 555-0142",
    sentAt: "2026-08-15 04:30 PM",
    status: "Review Left",
    reviewLeftRating: 5,
    jobName: "Interior Walls Repaint"
  },
  {
    id: "REQ-2002",
    customerName: "Bob Martinez",
    channel: "Email",
    recipient: "bmartinez@keystone.com",
    sentAt: "2026-08-14 11:15 AM",
    status: "Review Left",
    reviewLeftRating: 5,
    jobName: "Keystone Commercial Facility"
  },
  {
    id: "REQ-2003",
    customerName: "David Thompson",
    channel: "WhatsApp",
    recipient: "+17175550304",
    sentAt: "2026-08-16 02:00 PM",
    status: "Clicked",
    jobName: "Whispering Pines Construction"
  },
  {
    id: "REQ-2004",
    customerName: "Lisa Anderson",
    channel: "SMS",
    recipient: "(717) 555-0155",
    sentAt: "2026-08-16 05:00 PM",
    status: "Delivered",
    jobName: "Elmwood St Refresh"
  }
];

const INITIAL_WIDGETS: ReviewWidget[] = [
  {
    id: "wid-1",
    name: "Homepage Hero Star Carousel",
    type: "Carousel",
    minRatingFilter: 4,
    theme: "Dark",
    primaryColor: "#F97316",
    embedCode: `<script src="https://paintingpro.ai/widget.js" id="wid-1"></script>`
  },
  {
    id: "wid-2",
    name: "Commercial Bids Proof Badge",
    type: "Badge",
    minRatingFilter: 5,
    theme: "Light",
    primaryColor: "#10B981",
    embedCode: `<script src="https://paintingpro.ai/widget.js" id="wid-2"></script>`
  }
];

const INITIAL_LISTINGS: DirectoryListing[] = [
  {
    id: "list-1",
    platform: "Google Business Profile",
    status: "Synced",
    napConsistencyScore: 100,
    address: "100 Franchise Way, York, PA 17401",
    phone: "(717) 555-PAINT",
    website: "https://smartgrowth.paintingpro.ai",
    reviewsCount: 148,
    avgRating: 4.9,
    lastSynced: "10 mins ago"
  },
  {
    id: "list-2",
    platform: "Apple Maps",
    status: "Synced",
    napConsistencyScore: 100,
    address: "100 Franchise Way, York, PA 17401",
    phone: "(717) 555-PAINT",
    website: "https://smartgrowth.paintingpro.ai",
    reviewsCount: 32,
    avgRating: 5.0,
    lastSynced: "1 hour ago"
  },
  {
    id: "list-3",
    platform: "Bing Places",
    status: "Synced",
    napConsistencyScore: 95,
    address: "100 Franchise Way, York, PA 17401",
    phone: "(717) 555-PAINT",
    website: "https://smartgrowth.paintingpro.ai",
    reviewsCount: 18,
    avgRating: 4.8,
    lastSynced: "2 hours ago"
  },
  {
    id: "list-4",
    platform: "Yelp",
    status: "Action Required",
    napConsistencyScore: 88,
    address: "100 Franchise Way, York, PA 17401",
    phone: "(717) 555-PAINT",
    website: "https://smartgrowth.paintingpro.ai",
    reviewsCount: 24,
    avgRating: 4.8,
    lastSynced: "1 day ago"
  }
];

const INITIAL_SETTINGS: ReputationSettings = {
  reviewsAiEnabled: true,
  waitTimeMins: 0,
  dripMode: true,
  aiTone: "Professional & Grateful",
  autoRespondMinRating: 4,
  customReviewLink: "https://paintingpro.ai/r/smart-growth-painting",
  smsTemplate: "Hi {ClientName}, thanks for choosing Smart Growth Painting! Could you take 30 seconds to share your feedback? {ReviewLink}",
  emailSubject: "How did we do? Share your feedback with Smart Growth Painting!",
  emailTemplate: "Hello {ClientName},\n\nThank you for trusting us with your {ProjectName}. We would love it if you could leave a brief Google review.\n\nClick here: {ReviewLink}",
  whatsAppTemplate: "Hi {ClientName}! Smart Growth Painting here. Hope you love your fresh paint! Leave us a quick star rating here: {ReviewLink}",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://paintingpro.ai/r/smart-growth-painting",
  googleProfileConnected: true,
  googleProfileAccount: "franchise.sales@paintingpro.ai (Location ID: #PA-YORK-99)",
  facebookConnected: true
};

export default function ReputationModule() {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "requests" | "reviews" | "videotestimonials" | "widgets" | "listings" | "settings"
  >("overview");

  // Settings Sub-tab State
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "ai" | "link" | "sms" | "email" | "whatsapp" | "qr" | "spam" | "integrations"
  >("ai");

  // Module State
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>(INITIAL_VIDEO_TESTIMONIALS);
  const [requests, setRequests] = useState<ReviewRequest[]>(INITIAL_REQUESTS);
  const [widgets, setWidgets] = useState<ReviewWidget[]>(INITIAL_WIDGETS);
  const [listings, setListings] = useState<DirectoryListing[]>(INITIAL_LISTINGS);
  const [settings, setSettings] = useState<ReputationSettings>(INITIAL_SETTINGS);

  // Review Sub-filters
  const [starFilter, setStarFilter] = useState<number | 0>(0);
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Popups State
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showNewVideoModal, setShowNewVideoModal] = useState(false);
  const [showNewWidgetModal, setShowNewWidgetModal] = useState(false);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Toast Notification
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Filtered Reviews Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      if (starFilter > 0 && rev.rating !== starFilter) return false;
      if (platformFilter !== "All" && rev.platform !== platformFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAuthor = rev.author.toLowerCase().includes(q);
        const matchContent = rev.content.toLowerCase().includes(q);
        if (!matchAuthor && !matchContent) return false;
      }
      return true;
    });
  }, [reviews, starFilter, platformFilter, searchQuery]);

  // Handle Reply Submit
  const handlePostReply = (id: string, text: string) => {
    setReviews(reviews.map(r => r.id === id ? {
      ...r,
      replied: true,
      replyText: text,
      replyDate: new Date().toISOString().split("T")[0]
    } : r));
    setReplyingReview(null);
    setReplyText("");
    showToast("Review reply published successfully!");
  };

  // Handle AI Auto Reply All
  const handleAiAutoReplyAll = () => {
    const unreplied = reviews.filter(r => !r.replied && !r.isSpam);
    if (unreplied.length === 0) {
      showToast("All eligible reviews are already replied to!");
      return;
    }
    setReviews(reviews.map(r => (!r.replied && !r.isSpam) ? {
      ...r,
      replied: true,
      replyText: r.aiSuggestedReply || "Thank you for your feedback!",
      replyDate: new Date().toISOString().split("T")[0]
    } : r));
    showToast(`AI Auto-Replied to ${unreplied.length} pending reviews in Drip Mode!`);
  };

  // Handle Send New Review Request
  const handleSendRequest = (name: string, channel: "SMS" | "Email" | "WhatsApp", recipient: string, job: string) => {
    const newReq: ReviewRequest = {
      id: `REQ-${Math.floor(2000 + Math.random() * 8000)}`,
      customerName: name,
      channel,
      recipient,
      sentAt: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: "Delivered",
      jobName: job
    };
    setRequests([newReq, ...requests]);
    setShowNewRequestModal(false);
    showToast(`Review request sent to ${name} via ${channel}!`);
  };

  return (
    <div className="space-y-6 text-white font-sans" id="reputation-module-root">
      
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange-500 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> 5-Star Reputation & Review Engine
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                settings.reviewsAiEnabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400"
              }`}>
                <Bot className="w-3 h-3" />
                <span>Reviews AI: {settings.reviewsAiEnabled ? `Active (${settings.waitTimeMins} Mins Wait // Drip Mode)` : "Disabled"}</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              REPUTATION <span className="text-orange-500">//</span> REVIEWS & VIDEO TESTIMONIALS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Automated review collection via SMS, Email, & WhatsApp, AI response automation, video testimonials collection, website widgets, and local directory listings sync.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Review Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3" id="reputation-primary-tabs">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "requests", label: "📬 Requests", badge: requests.length },
          { id: "reviews", label: "💬 Reviews", badge: reviews.length },
          { id: "videotestimonials", label: "🎥 Video Testimonials", tag: "NEW", badge: videoTestimonials.length },
          { id: "widgets", label: "🧩 Widgets", badge: widgets.length },
          { id: "listings", label: "🗺️ Listings", badge: listings.length },
          { id: "settings", label: "⚙️ Settings" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === tab.id
                ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            {tab.tag && (
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                {tab.tag}
              </span>
            )}
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6" id="reputation-overview">
          
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">4.9</span>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">Based on 148 Verified Client Reviews</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request Conversion</span>
                <Send className="w-5 h-5 text-orange-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">68.4%</span>
                <span className="text-xs text-emerald-400 font-bold">↑ +5.2%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">SMS & Email review completion rate</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviews AI Drip</span>
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">100%</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Active</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Wait time: {settings.waitTimeMins} mins // Drip Mode ON</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Testimonials</span>
                <Video className="w-5 h-5 text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{videoTestimonials.length}</span>
                <span className="text-xs text-purple-400 font-bold">Approved for Web</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Embedded on website quote pages</p>
            </div>

          </div>

          {/* Directory Platforms Breakdown */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-400" />
                <span>Connected Review Channels & Star Scores</span>
              </span>
              <button
                onClick={() => setActiveTab("listings")}
                className="text-xs text-orange-400 hover:underline font-bold"
              >
                Manage All Directory Listings →
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Google Business Profile", rating: 4.9, reviews: 148, icon: "🌐", status: "Synced", color: "text-blue-400" },
                { name: "Facebook Pages", rating: 5.0, reviews: 34, icon: "📘", status: "Synced", color: "text-indigo-400" },
                { name: "Yelp Business", rating: 4.8, reviews: 24, icon: "🔴", status: "Action Required", color: "text-red-400" },
                { name: "Houzz Pro", rating: 5.0, reviews: 12, icon: "🏠", status: "Synced", color: "text-emerald-400" }
              ].map((plat) => (
                <div key={plat.name} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{plat.icon}</span>
                      <span>{plat.name}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      plat.status === "Synced" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {plat.status}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-amber-400">{plat.rating} ★</span>
                    <span className="text-xs text-slate-400 font-mono">{plat.reviews} reviews</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stream of Recent Client Reviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>Recent Client Reviews Feed</span>
              </h3>
              <button
                onClick={() => setActiveTab("reviews")}
                className="text-xs text-orange-400 hover:underline font-bold"
              >
                View & Reply All Reviews ({reviews.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {rev.avatar ? (
                        <img src={rev.avatar} className="w-7 h-7 rounded-full object-cover" alt={rev.author} />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          {rev.author.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-xs text-white block">{rev.author}</span>
                        <span className="text-[10px] text-slate-400">{rev.platform} • {rev.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>

                  {rev.replied && (
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Published Owner Response ({rev.replyDate})
                      </span>
                      <p className="text-slate-300 italic">{rev.replyText}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Review Request Campaigns</h2>
              <p className="text-xs text-slate-400">Track SMS, Email, & WhatsApp review invitation delivery and completion rates</p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Send New Request</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <th className="p-3"># Request ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Job Name</th>
                    <th className="p-3">Sent At</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Rating Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-850/60 transition">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{req.id}</td>
                      <td className="p-3 font-bold text-white">{req.customerName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                          req.channel === "SMS" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                          req.channel === "Email" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {req.channel === "SMS" && <Smartphone className="w-3 h-3" />}
                          {req.channel === "Email" && <Mail className="w-3 h-3" />}
                          {req.channel === "WhatsApp" && <MessageCircle className="w-3 h-3" />}
                          <span>{req.channel}</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{req.recipient}</td>
                      <td className="p-3 text-slate-300">{req.jobName}</td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">{req.sentAt}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === "Review Left" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          req.status === "Clicked" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          req.status === "Opened" ? "bg-blue-500/20 text-blue-400" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-400">
                        {req.reviewLeftRating ? `${req.reviewLeftRating} ★` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REVIEWS */}
      {/* ========================================================================= */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          
          {/* Controls & Search Toolbar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reviews by client or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Star Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Stars:</span>
              {[0, 5, 4, 3, 2, 1].map(stars => (
                <button
                  key={stars}
                  onClick={() => setStarFilter(stars)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    starFilter === stars
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {stars === 0 ? "All Stars" : `${stars} ★`}
                </button>
              ))}
            </div>

            {/* AI Auto-Reply All Button */}
            <button
              onClick={handleAiAutoReplyAll}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Bot className="w-4 h-4" />
              <span>AI Auto-Reply All ({reviews.filter(r => !r.replied && !r.isSpam).length})</span>
            </button>
          </div>

          {/* Reviews Stream */}
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                No reviews match your current filter search.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div key={rev.id} className={`bg-slate-900 border rounded-2xl p-5 space-y-3 shadow-lg ${
                  rev.isSpam ? "border-red-500/40 bg-red-950/10" : "border-slate-800"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {rev.avatar ? (
                        <img src={rev.avatar} className="w-9 h-9 rounded-full object-cover" alt={rev.author} />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-200">
                          {rev.author.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{rev.author}</span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                            {rev.platform}
                          </span>
                          {rev.isSpam && (
                            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Flagged Spam
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{rev.date} • {rev.projectType || "Painting Customer"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                      <span className="text-xs text-white ml-1 font-mono">{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed pl-12">{rev.content}</p>

                  {/* Reply Section */}
                  {rev.replied ? (
                    <div className="ml-12 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published Response ({rev.replyDate})
                        </span>
                        <button
                          onClick={() => {
                            setReplyingReview(rev);
                            setReplyText(rev.replyText || "");
                          }}
                          className="text-[10px] text-slate-400 hover:text-white font-bold"
                        >
                          Edit Reply
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{rev.replyText}"</p>
                    </div>
                  ) : (
                    <div className="ml-12 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Suggested: "{rev.aiSuggestedReply?.slice(0, 55)}..."</span>
                      </div>
                      <button
                        onClick={() => {
                          setReplyingReview(rev);
                          setReplyText(rev.aiSuggestedReply || "");
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer w-fit"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Reply with AI</span>
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VIDEO TESTIMONIALS (NEW) */}
      {/* ========================================================================= */}
      {activeTab === "videotestimonials" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-purple-500/30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  NEW FEATURE // VIDEO REVIEWS
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                <span>Video Testimonial Collection Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Collect 30-60 second client video recordings directly from smartphones. Auto-generate transcripts and embed onto your quote proposal pages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://paintingpro.ai/video-record/johnny-sons");
                  showToast("Copied Video Recording Share Link!");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Share Link</span>
              </button>
              <button
                onClick={() => setShowNewVideoModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video Testimonial</span>
              </button>
            </div>
          </div>

          {/* Video Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoTestimonials.map((vid) => (
              <div key={vid.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black group border border-slate-800">
                  <img src={vid.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80" alt={vid.author} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </a>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    0:{vid.durationSeconds}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{vid.author}</h3>
                      <p className="text-xs text-slate-400">{vid.companyName} • {vid.projectCompleted}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      {Array.from({ length: vid.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-3 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> AI Auto-Transcript:
                    </span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">"{vid.transcript}"</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={vid.approved}
                      onChange={(e) => {
                        setVideoTestimonials(videoTestimonials.map(v => v.id === vid.id ? { ...v, approved: e.target.checked } : v));
                        showToast(e.target.checked ? "Approved for Web Widget!" : "Removed from Web Widget");
                      }}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-xs text-slate-300 font-bold">Approved for Website</span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vid.embedCode);
                      showToast("Copied HTML Embed Code!");
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Copy Embed Code</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WIDGETS */}
      {/* ========================================================================= */}
      {activeTab === "widgets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Embeddable Website Review Widgets</h2>
              <p className="text-xs text-slate-400">Display 5-star Google & Yelp reviews on your website and proposal pages</p>
            </div>
            <button
              onClick={() => setShowNewWidgetModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Widget</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.map((wid) => (
              <div key={wid.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{wid.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Type: {wid.type} • Min Rating: {wid.minRatingFilter}★</p>
                  </div>
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                    Theme: {wid.theme}
                  </span>
                </div>

                {/* Live Preview Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Google Reviews</span>
                      <span className="text-amber-400 font-bold">4.9 ★★★★★</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Verified Badge</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"Finished 1 day ahead of schedule! Sherwin-Williams Duration finish looks flawless."</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wid.embedCode);
                      showToast("Copied Widget Script Code!");
                    }}
                    className="bg-slate-800 hover:bg-slate-750 text-orange-400 border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script Code</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LISTINGS */}
      {/* ========================================================================= */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Local Directory Listings & NAP Sync</h2>
              <p className="text-xs text-slate-400">Sync Name, Address, Phone, and Hours across local maps & search engines</p>
            </div>
            <button
              onClick={() => showToast("Triggered local directory refresh scan!")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync All Directory Listings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((list) => (
              <div key={list.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{list.platform}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    list.status === "Synced" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {list.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  <p>📍 {list.address}</p>
                  <p>📞 {list.phone}</p>
                  <p>🌐 {list.website}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>NAP Match: <strong className="text-emerald-400">{list.napConsistencyScore}%</strong></span>
                  <span>{list.reviewsCount} reviews ({list.avgRating} ★)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SETTINGS & SUB-FEATURES */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <span>Reputation & Review Settings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure Reviews AI response delay, shortlinks, SMS/Email/WhatsApp templates, QR codes, spam filters, and Google Business Profile connections.
            </p>
          </div>

          {/* Settings Sub-Navigation Bar */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3" id="settings-sub-tabs">
            {[
              { id: "ai", label: "🤖 Reviews AI" },
              { id: "link", label: "🔗 Review Link" },
              { id: "sms", label: "📱 SMS Requests" },
              { id: "email", label: "📧 Email Requests" },
              { id: "whatsapp", label: "💬 WhatsApp Requests" },
              { id: "qr", label: "🔲 Reviews QR" },
              { id: "spam", label: "🚫 Spam Reviews" },
              { id: "integrations", label: "🔌 Integrations & Google Connect" }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSettingsTab(sub.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeSettingsTab === sub.id
                    ? "bg-slate-800 text-orange-400 border-orange-500/40"
                    : "text-slate-400 hover:text-white border-transparent"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SUB-SETTING 1: REVIEWS AI */}
          {activeSettingsTab === "ai" && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">Enable Reviews AI Automation</span>
                  <span className="text-xs text-slate-400 block">Automatically craft and publish personalized owner replies</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reviewsAiEnabled}
                  onChange={(e) => setSettings({ ...settings, reviewsAiEnabled: e.target.checked })}
                  className="w-5 h-5 accent-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Wait time before responding</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.waitTimeMins}
                      onChange={(e) => setSettings({ ...settings, waitTimeMins: parseInt(e.target.value) || 0 })}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                    />
                    <span className="text-xs font-bold text-slate-400">Mins</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Delay before auto-publishing responses to simulate human review</p>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white block">Respond to Reviews - Drip Mode</span>
                    <span className="text-[10px] text-slate-400 block">Stagger replies gradually to prevent spam triggers</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dripMode}
                    onChange={(e) => setSettings({ ...settings, dripMode: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">AI Brand Tone & Style</label>
                  <select
                    value={settings.aiTone}
                    onChange={(e) => setSettings({ ...settings, aiTone: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Professional & Grateful">Professional & Grateful</option>
                    <option value="Warm & Friendly">Warm & Friendly</option>
                    <option value="Formal Commercial">Formal Commercial</option>
                    <option value="Casual">Casual & Approachable</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Auto-Respond Star Threshold</label>
                  <select
                    value={settings.autoRespondMinRating}
                    onChange={(e) => setSettings({ ...settings, autoRespondMinRating: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value={5}>5 Stars Only</option>
                    <option value={4}>4 Stars and Above</option>
                    <option value={3}>3 Stars and Above</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* SUB-SETTING 2: REVIEW LINK */}
          {activeSettingsTab === "link" && (
            <div className="space-y-4 max-w-2xl animate-fadeIn">
              <label className="text-xs font-bold text-slate-300 block">Direct Google Review Shortlink</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.customReviewLink}
                  onChange={(e) => setSettings({ ...settings, customReviewLink: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-orange-400 font-mono focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(settings.customReviewLink);
                    showToast("Copied shortlink to clipboard!");
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-SETTING 3: SMS REQUESTS */}
          {activeSettingsTab === "sms" && (
            <div className="space-y-4 max-w-2xl animate-fadeIn">
              <label className="text-xs font-bold text-slate-300 block">SMS Review Request Message Template</label>
              <textarea
                rows={4}
                value={settings.smsTemplate}
                onChange={(e) => setSettings({ ...settings, smsTemplate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Available tags: {'{ClientName}'}, {'{ProjectName}'}, {'{ReviewLink}'}</p>
            </div>
          )}

          {/* SUB-SETTING 4: EMAIL REQUESTS */}
          {activeSettingsTab === "email" && (
            <div className="space-y-4 max-w-2xl animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={settings.emailSubject}
                  onChange={(e) => setSettings({ ...settings, emailSubject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email Body Content</label>
                <textarea
                  rows={5}
                  value={settings.emailTemplate}
                  onChange={(e) => setSettings({ ...settings, emailTemplate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SUB-SETTING 5: WHATSAPP REQUESTS */}
          {activeSettingsTab === "whatsapp" && (
            <div className="space-y-4 max-w-2xl animate-fadeIn">
              <label className="text-xs font-bold text-slate-300 block">WhatsApp Review Message Template</label>
              <textarea
                rows={4}
                value={settings.whatsAppTemplate}
                onChange={(e) => setSettings({ ...settings, whatsAppTemplate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}

          {/* SUB-SETTING 6: REVIEWS QR */}
          {activeSettingsTab === "qr" && (
            <div className="space-y-4 max-w-md animate-fadeIn">
              <label className="text-xs font-bold text-slate-300 block">Printable Review QR Code</label>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center gap-4">
                <img src={settings.qrCodeUrl} className="w-48 h-48 rounded-xl bg-white p-2" alt="Review QR Code" />
                <p className="text-xs text-slate-400 text-center">Scan to leave a 5-star Google review instantly!</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => showToast("Downloaded PNG QR Code!")}
                    className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SETTING 7: SPAM REVIEWS */}
          {activeSettingsTab === "spam" && (
            <div className="space-y-4 max-w-2xl animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Automated Spam Review Queue & Google Dispute Generator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Flagged reviews with zero matched client records or bot text patterns are queued here for Google policy removal disputes.
              </p>

              {reviews.filter(r => r.isSpam).map(spam => (
                <div key={spam.id} className="bg-red-950/20 border border-red-500/40 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{spam.author} ({spam.platform})</span>
                    <span className="text-[10px] text-red-400 font-bold">1 ★ Fake Review</span>
                  </div>
                  <p className="text-xs text-slate-300">{spam.content}</p>
                  <p className="text-[10px] text-red-300 font-mono">Reason: {spam.spamReason}</p>
                  <button
                    onClick={() => showToast("Generated Google Dispute Removal Letter!")}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Google Removal Dispute</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUB-SETTING 8: INTEGRATIONS & CONNECT GOOGLE BUSINESS PROFILE */}
          {activeSettingsTab === "integrations" && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              
              {/* Connect Google Business Profile Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    <div>
                      <h3 className="font-bold text-white text-sm">Connect Google Business Profile</h3>
                      <p className="text-xs text-slate-400">Enable 2-way Google reviews import & AI automated responses</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                    Connected
                  </span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl text-xs font-mono text-slate-300">
                  Account: {settings.googleProfileAccount}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => showToast("Google Business Profile Synced!")}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Sync Now
                  </button>
                </div>
              </div>

              {/* Other Integrations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Facebook Business Page</span>
                  <span className="text-xs text-emerald-400 font-bold">Connected</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Yelp for Business API</span>
                  <span className="text-xs text-amber-400 font-bold">Action Required</span>
                </div>
              </div>

            </div>
          )}

          {/* Save Settings Button */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => showToast("Reputation & Review settings saved!")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Save All Settings
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SEND NEW REVIEW REQUEST */}
      {/* ========================================================================= */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-orange-500" />
                <span>Send Review Request</span>
              </h3>
              <button onClick={() => setShowNewRequestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSendRequest(
                  form.customerName.value,
                  form.channel.value,
                  form.recipient.value,
                  form.jobName.value
                );
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-300 block mb-1">Customer Name</label>
                <input name="customerName" required defaultValue="Sarah Williams" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Channel</label>
                <select name="channel" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="SMS">SMS Text Message</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Recipient (Phone or Email)</label>
                <input name="recipient" required defaultValue="(717) 555-0142" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Job / Project Reference</label>
                <input name="jobName" required defaultValue="Interior Walls Repaint" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowNewRequestModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPLY TO REVIEW MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-orange-500" />
                <span>Reply to Review - {replyingReview.author}</span>
              </h3>
              <button onClick={() => setReplyingReview(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
              "{replyingReview.content}"
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Your Response</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setReplyingReview(null)} className="px-3 py-2 text-xs text-slate-400">Cancel</button>
              <button
                onClick={() => handlePostReply(replyingReview.id, replyText)}
                className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Publish Response
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

