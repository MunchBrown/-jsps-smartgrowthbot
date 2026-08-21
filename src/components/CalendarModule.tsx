import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, Users, CheckCircle2, AlertCircle, Plus,
  Search, Filter, SlidersHorizontal, ChevronDown, ChevronRight, X, Edit3,
  Trash2, Copy, Check, ExternalLink, Settings, Wrench, Building2, ListFilter,
  Eye, RefreshCw, Smartphone, Mail, ShieldAlert, Sparkles, MapPin, Phone,
  FileText, ArrowUpDown, Tag, ArrowRight, Grid, List, Layers, ShieldCheck
} from "lucide-react";
import {
  Appointment, ServiceMenuItem, RoomResource, EquipmentResource,
  CalendarPreference, StaffAvailability, CalendarConnection, SmartListOption
} from "../types";

// Default Initial Data
const INITIAL_PREFERENCES: CalendarPreference = {
  timeZone: "America/New_York (EST)",
  defaultDurationMins: 60,
  bufferMins: 15,
  autoConfirm: true,
  sendSmsReminders: true,
  sendEmailReminders: true,
  reminderNoticeHours: 24,
  allowClientCancellation: true,
  cancellationNoticeHours: 12
};

const INITIAL_CONNECTIONS: CalendarConnection[] = [
  {
    id: "conn-1",
    provider: "Google Calendar",
    accountEmail: "franchise.sales@paintingpro.ai",
    status: "Connected",
    lastSynced: "2 mins ago",
    twoWaySync: true
  },
  {
    id: "conn-2",
    provider: "Outlook",
    accountEmail: "estimates@paintingpro.ai",
    status: "Disconnected",
    lastSynced: "Never",
    twoWaySync: false
  },
  {
    id: "conn-3",
    provider: "Zoom",
    accountEmail: "johnny.sons@paintingpro.ai",
    status: "Connected",
    lastSynced: "1 hour ago",
    twoWaySync: true
  }
];

const INITIAL_SERVICES: ServiceMenuItem[] = [
  {
    id: "srv-1",
    title: "In-Home Residential Color Consultation & Estimate",
    category: "Estimating",
    durationMins: 60,
    price: 0,
    calendar: "Estimating",
    description: "Detailed on-site wall laser measure, surface prep analysis, and SW Duration color swatch match.",
    color: "#F97316"
  },
  {
    id: "srv-2",
    title: "Commercial Exterior On-Site Scope Walkthrough",
    category: "On-Site",
    durationMins: 90,
    price: 0,
    calendar: "Sales",
    description: "Multi-story commercial facility exterior walk with lift access assessment and substrate inspection.",
    requiredEquipment: "DeFelsko Moisture Meter",
    color: "#3B82F6"
  },
  {
    id: "srv-3",
    title: "Pre-Job Kickoff & Color Lock-In Walkthrough",
    category: "Consultation",
    durationMins: 45,
    price: 0,
    calendar: "Crew Dispatch",
    description: "On-site review with Crew Lead, home access code confirmation, and wall accent color signoff.",
    defaultRoom: "Design Studio A",
    color: "#10B981"
  },
  {
    id: "srv-4",
    title: "Final Quality Assurance & 100% Signoff Inspection",
    category: "Inspection",
    durationMins: 30,
    price: 0,
    calendar: "Quality Inspection",
    description: "Final walkthrough with customer, touch-up blue tape check, and warranty document delivery.",
    color: "#8B5CF6"
  }
];

const INITIAL_ROOMS: RoomResource[] = [
  {
    id: "room-1",
    name: "Main Showroom & Color Studio",
    location: "Suite 100 - HQ",
    capacity: 12,
    status: "Available",
    description: "Equipped with Sherwin-Williams lighting booth & wall coating samples."
  },
  {
    id: "room-2",
    name: "Design Studio A",
    location: "Suite 102 - HQ",
    capacity: 6,
    status: "Available",
    description: "Client color matching workstation with high-CRI color spectrum lighting."
  },
  {
    id: "room-3",
    name: "Executive Conference Room",
    location: "Suite 200 - HQ",
    capacity: 20,
    status: "In Use",
    description: "Commercial bid review presentation setup with 4K screen."
  }
];

const INITIAL_EQUIPMENT: EquipmentResource[] = [
  {
    id: "eq-1",
    name: "Graco Ultra Max II Airless Sprayer #1",
    category: "Sprayers",
    quantity: 2,
    serialNumber: "GRC-9981-PA",
    status: "Available"
  },
  {
    id: "eq-2",
    name: "DeFelsko PosiTector Moisture Meter",
    category: "Testing",
    quantity: 3,
    serialNumber: "DFS-402-PA",
    status: "Assigned"
  },
  {
    id: "eq-3",
    name: "ColorX Spectrophotometer Scanner",
    category: "Color Matching",
    quantity: 1,
    serialNumber: "CX-8810",
    status: "Available"
  },
  {
    id: "eq-4",
    name: "32ft Werner Fiberglass Extension Ladder",
    category: "Ladders",
    quantity: 4,
    serialNumber: "WRN-32FT-04",
    status: "Available"
  }
];

const INITIAL_AVAILABILITY: StaffAvailability[] = [
  { dayOfWeek: "Monday", enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: "Tuesday", enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: "Wednesday", enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: "Thursday", enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: "Friday", enabled: true, startTime: "08:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
  { dayOfWeek: "Saturday", enabled: true, startTime: "09:00", endTime: "14:00" },
  { dayOfWeek: "Sunday", enabled: false, startTime: "09:00", endTime: "12:00" }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "APT-1001",
    title: "In-Home Residential Color Estimate - Sarah Williams",
    contactName: "Sarah Williams",
    contactPhone: "(717) 555-0142",
    contactEmail: "sarah.williams@outlook.com",
    serviceId: "srv-1",
    serviceName: "In-Home Residential Color Consultation & Estimate",
    status: "Confirmed",
    date: "2026-08-18",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    calendar: "Estimating",
    owner: "Dave Miller",
    roomId: "room-2",
    roomName: "Design Studio A",
    equipmentId: "eq-3",
    equipmentName: "ColorX Spectrophotometer Scanner",
    location: "124 Hillside Dr, York, PA",
    notes: "Client interested in SW Duration Eg-Shel interior walls & trim touch-ups.",
    price: 0,
    createdAt: "2026-08-15"
  },
  {
    id: "APT-1002",
    title: "Commercial Exterior Scope Measure - Keystone Office",
    contactName: "Bob Martinez",
    contactPhone: "(717) 555-0189",
    contactEmail: "bmartinez@keystone.com",
    serviceId: "srv-2",
    serviceName: "Commercial Exterior On-Site Scope Walkthrough",
    status: "Upcoming",
    date: "2026-08-18",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    calendar: "Sales",
    owner: "Sarah Jenkins",
    equipmentId: "eq-2",
    equipmentName: "DeFelsko PosiTector Moisture Meter",
    location: "840 Highland Ave, York, PA",
    notes: "Requires moisture testing on stucco exterior before high-durability elastomeric quote.",
    price: 0,
    createdAt: "2026-08-16"
  },
  {
    id: "APT-1003",
    title: "Pre-Job Kickoff - Chen Enterprises Retail Refresh",
    contactName: "Jennifer Chen",
    contactPhone: "(717) 555-0211",
    contactEmail: "jchen@chenenterprises.com",
    serviceId: "srv-3",
    serviceName: "Pre-Job Kickoff & Color Lock-In Walkthrough",
    status: "Pending",
    date: "2026-08-19",
    startTime: "02:00 PM",
    endTime: "02:45 PM",
    calendar: "Crew Dispatch",
    owner: "Carlos Rodriguez",
    roomId: "room-3",
    roomName: "Executive Conference Room",
    location: "24 Market St, York, PA",
    notes: "Lock in retail access hours and low-VOC Scuff-X paint order.",
    price: 0,
    createdAt: "2026-08-16"
  },
  {
    id: "APT-1004",
    title: "Final QA Inspection - Thompson Residence",
    contactName: "David Thompson",
    contactPhone: "(717) 555-0304",
    contactEmail: "dthompson@constructpa.com",
    serviceId: "srv-4",
    serviceName: "Final Quality Assurance & 100% Signoff Inspection",
    status: "Completed",
    date: "2026-08-16",
    startTime: "04:00 PM",
    endTime: "04:30 PM",
    calendar: "Quality Inspection",
    owner: "Dave Miller",
    location: "411 Whispering Pines Rd, York, PA",
    notes: "Delivered 10-year warranty documents and collected final 50% invoice payment.",
    price: 0,
    createdAt: "2026-08-12"
  },
  {
    id: "APT-1005",
    title: "Residential Estimate Consultation - Lisa Anderson",
    contactName: "Lisa Anderson",
    contactPhone: "(717) 555-0155",
    contactEmail: "lisa.anderson@yahoo.com",
    serviceId: "srv-1",
    serviceName: "In-Home Residential Color Consultation & Estimate",
    status: "Cancelled",
    date: "2026-08-17",
    startTime: "01:00 PM",
    endTime: "02:00 PM",
    calendar: "Estimating",
    owner: "Sarah Jenkins",
    location: "120 Elmwood St, York, PA",
    notes: "Client rescheduled due to out-of-town travel. Follow up on Monday.",
    price: 0,
    createdAt: "2026-08-14"
  }
];

const INITIAL_SMART_LISTS: SmartListOption[] = [
  {
    id: "smart-1",
    name: "Default All Active",
    description: "All upcoming, pending and confirmed appointments",
    filters: {}
  },
  {
    id: "smart-2",
    name: "Today's On-Site Estimates",
    description: "Estimating calendar appointments scheduled for today",
    filters: { calendar: "Estimating" }
  },
  {
    id: "smart-3",
    name: "High-Value Commercial Calls",
    description: "Sales calendar appointments for commercial clients",
    filters: { calendar: "Sales" }
  },
  {
    id: "smart-4",
    name: "Pending Confirmation",
    description: "Appointments awaiting client or manager approval",
    filters: { status: "Pending" }
  },
  {
    id: "smart-5",
    name: "Cancelled & Follow-up Needed",
    description: "Cancelled appointments needing re-engagement",
    filters: { status: "Cancelled" }
  }
];

export default function CalendarModule() {
  // Main Module Tab Navigation
  const [activeTab, setActiveTab] = useState<
    "appointments" | "preferences" | "availability" | "connections" | "services" | "rooms" | "equipment"
  >("appointments");

  // State Management
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("paintingpro_appointments");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [services, setServices] = useState<ServiceMenuItem[]>(INITIAL_SERVICES);
  const [rooms, setRooms] = useState<RoomResource[]>(INITIAL_ROOMS);
  const [equipment, setEquipment] = useState<EquipmentResource[]>(INITIAL_EQUIPMENT);
  const [preferences, setPreferences] = useState<CalendarPreference>(INITIAL_PREFERENCES);
  const [availability, setAvailability] = useState<StaffAvailability[]>(INITIAL_AVAILABILITY);
  const [connections, setConnections] = useState<CalendarConnection[]>(INITIAL_CONNECTIONS);
  const [smartLists, setSmartLists] = useState<SmartListOption[]>(INITIAL_SMART_LISTS);

  // Appointments Sub-filters
  const [appointmentViewStatus, setAppointmentViewStatus] = useState<"Upcoming" | "Cancelled" | "All" | "CalendarGrid">("Upcoming");
  const [activeSmartListId, setActiveSmartListId] = useState<string>("smart-1");
  const [searchQuery, setSearchQuery] = useState("");

  // Advanced Filters State (Counts active filters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCalendar, setFilterCalendar] = useState<string>("All");
  const [filterOwner, setFilterOwner] = useState<string>("All");
  const [filterRoom, setFilterRoom] = useState<string>("All");
  const [filterEquipment, setFilterEquipment] = useState<string>("All");
  const [filterDateRange, setFilterDateRange] = useState<string>("All");

  // Sort By State
  const [sortBy, setSortBy] = useState<"time_asc" | "time_desc" | "title" | "contact" | "status">("time_asc");

  // Manage Columns State
  const [showManageColumnsModal, setShowManageColumnsModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    title: true,
    contact: true,
    status: true,
    time: true,
    calendar: true,
    owner: true,
    room: false,
    equipment: false
  });

  // Customize List Modal
  const [showCustomizeListModal, setShowCustomizeListModal] = useState(false);
  const [newSmartListName, setNewSmartListName] = useState("");
  const [newSmartListDesc, setNewSmartListDesc] = useState("");

  // New Appointment / Booking Modal
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Modals for Resources
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showNewEquipmentModal, setShowNewEquipmentModal] = useState(false);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Persist appointments locally
  React.useEffect(() => {
    localStorage.setItem("paintingpro_appointments", JSON.stringify(appointments));
  }, [appointments]);

  // Load from server if endpoint exists
  React.useEffect(() => {
    const fetchServerAppointments = async () => {
      try {
        const res = await fetch("/api/appointments");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAppointments(data);
          }
        }
      } catch (err) {
        // Fallback local
      }
    };
    fetchServerAppointments();
  }, []);

  // Compute Active Advanced Filters Count
  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;
    if (filterCalendar !== "All") count++;
    if (filterOwner !== "All") count++;
    if (filterRoom !== "All") count++;
    if (filterEquipment !== "All") count++;
    if (filterDateRange !== "All") count++;
    return count;
  }, [filterCalendar, filterOwner, filterRoom, filterEquipment, filterDateRange]);

  // Filtered Appointments Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. View Status Filter
      if (appointmentViewStatus === "Upcoming") {
        if (apt.status === "Cancelled") return false;
      } else if (appointmentViewStatus === "Cancelled") {
        if (apt.status !== "Cancelled") return false;
      }

      // 2. Search Query (Title or Contact Name/Phone/Email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = apt.title.toLowerCase().includes(q);
        const matchContact = apt.contactName.toLowerCase().includes(q) ||
          apt.contactPhone.toLowerCase().includes(q) ||
          apt.contactEmail.toLowerCase().includes(q);
        if (!matchTitle && !matchContact) return false;
      }

      // 3. Smart List Filter
      const currentSmartList = smartLists.find(s => s.id === activeSmartListId);
      if (currentSmartList && currentSmartList.filters) {
        if (currentSmartList.filters.status && apt.status !== currentSmartList.filters.status) return false;
        if (currentSmartList.filters.calendar && apt.calendar !== currentSmartList.filters.calendar) return false;
      }

      // 4. Advanced Filters
      if (filterCalendar !== "All" && apt.calendar !== filterCalendar) return false;
      if (filterOwner !== "All" && apt.owner !== filterOwner) return false;
      if (filterRoom !== "All" && apt.roomId !== filterRoom) return false;
      if (filterEquipment !== "All" && apt.equipmentId !== filterEquipment) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "time_asc") {
        return (a.date + a.startTime).localeCompare(b.date + b.startTime);
      } else if (sortBy === "time_desc") {
        return (b.date + b.startTime).localeCompare(a.date + a.startTime);
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "contact") {
        return a.contactName.localeCompare(b.contactName);
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [appointments, appointmentViewStatus, searchQuery, activeSmartListId, smartLists, filterCalendar, filterOwner, filterRoom, filterEquipment, sortBy]);

  // Appointment Actions
  const handleSaveAppointment = async (aptData: Partial<Appointment>) => {
    let updatedList: Appointment[] = [];
    if (editingAppointment) {
      const updated = { ...editingAppointment, ...aptData };
      updatedList = appointments.map(a => a.id === updated.id ? updated : a);
      showToast(`Updated appointment: "${updated.title}"`);
    } else {
      const newApt: Appointment = {
        id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
        title: aptData.title || "New Appointment",
        contactName: aptData.contactName || "Client Name",
        contactPhone: aptData.contactPhone || "(717) 555-0100",
        contactEmail: aptData.contactEmail || "client@email.com",
        serviceId: aptData.serviceId,
        serviceName: aptData.serviceName || "In-Home Residential Color Estimate",
        status: aptData.status || "Upcoming",
        date: aptData.date || new Date().toISOString().split("T")[0],
        startTime: aptData.startTime || "09:00 AM",
        endTime: aptData.endTime || "10:00 AM",
        calendar: aptData.calendar as any || "Estimating",
        owner: aptData.owner || "Dave Miller",
        roomId: aptData.roomId,
        roomName: aptData.roomName,
        equipmentId: aptData.equipmentId,
        equipmentName: aptData.equipmentName,
        location: aptData.location || "Client Address",
        notes: aptData.notes || "",
        price: aptData.price || 0,
        createdAt: new Date().toISOString().split("T")[0]
      };
      updatedList = [newApt, ...appointments];
      showToast(`Scheduled new appointment: "${newApt.title}"`);
    }

    setAppointments(updatedList);
    setShowNewAppointmentModal(false);
    setEditingAppointment(null);

    // Sync to backend
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aptData)
      });
    } catch (e) {
      // local fallback
    }
  };

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    showToast(`Appointment status updated to ${status}`);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
    showToast("Appointment deleted");
  };

  // Smart List Save
  const handleSaveCustomizeList = () => {
    if (!newSmartListName.trim()) return;
    const newSmart: SmartListOption = {
      id: `smart-${Date.now()}`,
      name: newSmartListName.trim(),
      description: newSmartListDesc || "Custom saved view",
      filters: {
        calendar: filterCalendar !== "All" ? filterCalendar : undefined,
        status: filterCalendar !== "All" ? filterCalendar : undefined,
      }
    };
    setSmartLists([...smartLists, newSmart]);
    setActiveSmartListId(newSmart.id);
    setShowCustomizeListModal(false);
    setNewSmartListName("");
    setNewSmartListDesc("");
    showToast(`Saved custom smart list: "${newSmart.name}"`);
  };

  return (
    <div className="space-y-6 text-white font-sans" id="calendar-module-root">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange-500 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Real-Time Scheduling Engine
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Google & Outlook 2-Way Sync
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              CALENDARS <span className="text-orange-500">//</span> APPOINTMENTS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Centralized appointment booking, equipment allocation, room management, customizable smart lists, and multi-calendar availability controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingAppointment(null);
                setShowNewAppointmentModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3" id="calendar-primary-tabs">
        {[
          { id: "appointments", label: "🗓️ Appointments", badge: appointments.length },
          { id: "preferences", label: "⚙️ Preferences" },
          { id: "availability", label: "🕒 Availability" },
          { id: "connections", label: "🔌 Connections", badge: connections.filter(c => c.status === "Connected").length },
          { id: "services", label: "📋 Service Menu", badge: services.length },
          { id: "rooms", label: "🏢 Rooms", badge: rooms.length },
          { id: "equipment", label: "🧰 Equipment", badge: equipment.length }
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
      {/* TAB 1: APPOINTMENTS VIEW */}
      {/* ========================================================================= */}
      {activeTab === "appointments" && (
        <div className="space-y-4" id="appointments-view-wrapper">
          
          {/* Status Filter Sub-Tabs & View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {[
                { id: "Upcoming", label: "Upcoming", count: appointments.filter(a => a.status !== "Cancelled").length },
                { id: "Cancelled", label: "Cancelled", count: appointments.filter(a => a.status === "Cancelled").length },
                { id: "All", label: "All Appointments", count: appointments.length },
                { id: "CalendarGrid", label: "📅 Grid View" }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setAppointmentViewStatus(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    appointmentViewStatus === pill.id
                      ? "bg-slate-800 text-orange-400 border border-orange-500/40 shadow"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <span>{pill.label}</span>
                  {pill.count !== undefined && (
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                      {pill.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Smart List & Customize List Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Smart List:</span>
              <select
                value={activeSmartListId}
                onChange={(e) => setActiveSmartListId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-orange-400 font-bold focus:border-orange-500 focus:outline-none"
              >
                {smartLists.map(sl => (
                  <option key={sl.id} value={sl.id}>
                    ✨ {sl.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowCustomizeListModal(true)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                <span>Customize list</span>
              </button>
            </div>
          </div>

          {/* Search, Advanced Filters (1), Sort By (1), Manage Columns Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            
            {/* Search by title / contact */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by title, contact name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Advanced Filters ( 1 ) Toggle */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                  showAdvancedFilters || activeAdvancedFilterCount > 0
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/40"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-orange-400" />
                  <span>Advanced filters</span>
                </span>
                <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  ( {activeAdvancedFilterCount || 1} )
                </span>
              </button>
            </div>

            {/* Sort by ( 1 ) Dropdown */}
            <div className="md:col-span-3 flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Sort by:</span>
              <div className="relative w-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:border-orange-500 focus:outline-none pr-6"
                >
                  <option value="time_asc">Appointment Time (Earliest)</option>
                  <option value="time_desc">Appointment Time (Latest)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="contact">Contact Name (A-Z)</option>
                  <option value="status">Status</option>
                </select>
                <span className="absolute right-2 top-2 text-orange-400 text-[10px] font-bold pointer-events-none">
                  ( 1 )
                </span>
              </div>
            </div>

            {/* Manage columns button */}
            <div className="md:col-span-2">
              <button
                onClick={() => setShowManageColumnsModal(true)}
                className="w-full bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manage columns</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Expandable Drawer */}
          {showAdvancedFilters && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Calendar Type</label>
                <select
                  value={filterCalendar}
                  onChange={(e) => setFilterCalendar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Calendars</option>
                  <option value="Estimating">Estimating</option>
                  <option value="Sales">Sales</option>
                  <option value="Crew Dispatch">Crew Dispatch</option>
                  <option value="Quality Inspection">Quality Inspection</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Appointment Owner</label>
                <select
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Staff / Owners</option>
                  <option value="Dave Miller">Dave Miller</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Carlos Rodriguez">Carlos Rodriguez</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Allocated Room</label>
                <select
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Rooms</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Allocated Equipment</label>
                <select
                  value={filterEquipment}
                  onChange={(e) => setFilterEquipment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Equipment</option>
                  {equipment.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setFilterCalendar("All");
                    setFilterOwner("All");
                    setFilterRoom("All");
                    setFilterEquipment("All");
                    setFilterDateRange("All");
                  }}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* GRID VIEW VS LIST VIEW */}
          {appointmentViewStatus === "CalendarGrid" ? (
            /* Interactive Calendar Month Grid View */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-orange-400" />
                  <span>August 2026 Schedule</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">5 Appointments Booked</span>
              </div>

              {/* 7-Day Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2 uppercase tracking-wider">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>

              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const dayApts = appointments.filter(a => a.date === dateStr);

                  return (
                    <div
                      key={dayNum}
                      className={`min-h-[90px] bg-slate-950/80 border rounded-xl p-2 flex flex-col justify-between transition ${
                        dayNum === 18 ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-mono ${dayNum === 18 ? "text-orange-400 font-black" : "text-slate-400"}`}>
                          {dayNum}
                        </span>
                        {dayNum === 18 && (
                          <span className="text-[8px] bg-orange-500 text-white font-bold px-1 rounded">TODAY</span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1">
                        {dayApts.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              setEditingAppointment(apt);
                              setShowNewAppointmentModal(true);
                            }}
                            className={`p-1 rounded text-[9px] font-bold truncate cursor-pointer hover:scale-102 transition ${
                              apt.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                              apt.status === "Upcoming" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                              apt.status === "Cancelled" ? "bg-red-500/20 text-red-300 line-through" :
                              "bg-amber-500/20 text-amber-300"
                            }`}
                            title={`${apt.startTime} - ${apt.title}`}
                          >
                            {apt.startTime} {apt.contactName}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* APPOINTMENTS DATA TABLE */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      {visibleColumns.id && <th className="p-3 w-16">#</th>}
                      {visibleColumns.title && <th className="p-3">Title</th>}
                      {visibleColumns.contact && <th className="p-3">Contact</th>}
                      {visibleColumns.status && <th className="p-3 text-center">Status</th>}
                      {visibleColumns.time && <th className="p-3">Appointment time</th>}
                      {visibleColumns.calendar && <th className="p-3">Calendar</th>}
                      {visibleColumns.owner && <th className="p-3">Appointment owner</th>}
                      {visibleColumns.room && <th className="p-3">Allocated Room</th>}
                      {visibleColumns.equipment && <th className="p-3">Allocated Equipment</th>}
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-500">
                          No appointments match the current view and filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-850/60 transition">
                          
                          {/* # (ID) */}
                          {visibleColumns.id && (
                            <td className="p-3 font-mono text-slate-500 text-[11px]">{apt.id}</td>
                          )}

                          {/* Title */}
                          {visibleColumns.title && (
                            <td className="p-3">
                              <span className="font-bold text-white block">{apt.title}</span>
                              <span className="text-[10px] text-slate-400 truncate block max-w-xs">{apt.serviceName}</span>
                            </td>
                          )}

                          {/* Contact */}
                          {visibleColumns.contact && (
                            <td className="p-3">
                              <span className="font-bold text-slate-200 block">{apt.contactName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{apt.contactPhone}</span>
                            </td>
                          )}

                          {/* Status */}
                          {visibleColumns.status && (
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                apt.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                apt.status === "Upcoming" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                apt.status === "Pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                apt.status === "Completed" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                                "bg-red-500/20 text-red-400 border border-red-500/30 line-through"
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                          )}

                          {/* Appointment time */}
                          {visibleColumns.time && (
                            <td className="p-3 font-mono">
                              <span className="text-white block font-bold">{apt.date}</span>
                              <span className="text-orange-400 text-[10px] block">{apt.startTime} - {apt.endTime}</span>
                            </td>
                          )}

                          {/* Calendar */}
                          {visibleColumns.calendar && (
                            <td className="p-3">
                              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {apt.calendar}
                              </span>
                            </td>
                          )}

                          {/* Appointment owner */}
                          {visibleColumns.owner && (
                            <td className="p-3 text-slate-300 font-bold text-xs">
                              {apt.owner}
                            </td>
                          )}

                          {/* Allocated Room */}
                          {visibleColumns.room && (
                            <td className="p-3 text-slate-400 text-xs">
                              {apt.roomName || "—"}
                            </td>
                          )}

                          {/* Allocated Equipment */}
                          {visibleColumns.equipment && (
                            <td className="p-3 text-slate-400 text-xs">
                              {apt.equipmentName || "—"}
                            </td>
                          )}

                          {/* Row Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingAppointment(apt);
                                  setShowNewAppointmentModal(true);
                                }}
                                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                                title="Edit Appointment"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {apt.status !== "Cancelled" && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Cancelled")}
                                  className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition"
                                  title="Cancel Appointment"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PREFERENCES */}
      {/* ========================================================================= */}
      {activeTab === "preferences" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <span>Scheduling Preferences & Rules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure timezones, default slot durations, notification triggers, and client cancellation policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Operating Time Zone</label>
              <select
                value={preferences.timeZone}
                onChange={(e) => setPreferences({ ...preferences, timeZone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="America/New_York (EST)">America/New_York (Eastern - EST)</option>
                <option value="America/Chicago (CST)">America/Chicago (Central - CST)</option>
                <option value="America/Denver (MST)">America/Denver (Mountain - MST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (Pacific - PST)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Default Appointment Duration</label>
              <select
                value={preferences.defaultDurationMins}
                onChange={(e) => setPreferences({ ...preferences, defaultDurationMins: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Buffer Time Between Appointments</label>
              <select
                value={preferences.bufferMins}
                onChange={(e) => setPreferences({ ...preferences, bufferMins: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value={0}>No Buffer (Back-to-back)</option>
                <option value={10}>10 Minutes Travel/Prep</option>
                <option value={15}>15 Minutes Standard</option>
                <option value={30}>30 Minutes Extended</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Confirm Online Bookings</span>
                <span className="text-[10px] text-slate-400 block">Instantly confirm without manual review</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoConfirm}
                onChange={(e) => setPreferences({ ...preferences, autoConfirm: e.target.checked })}
                className="w-4 h-4 accent-orange-500"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">SMS Reminder Notifications</span>
                <span className="text-[10px] text-slate-400 block">Send automatic text message reminders</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.sendSmsReminders}
                onChange={(e) => setPreferences({ ...preferences, sendSmsReminders: e.target.checked })}
                className="w-4 h-4 accent-orange-500"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Email Confirmation & Invites</span>
                <span className="text-[10px] text-slate-400 block">Attach calendar .ics file to emails</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.sendEmailReminders}
                onChange={(e) => setPreferences({ ...preferences, sendEmailReminders: e.target.checked })}
                className="w-4 h-4 accent-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => showToast("Preferences saved successfully!")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AVAILABILITY */}
      {/* ========================================================================= */}
      {activeTab === "availability" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Staff Working Hours & Weekly Availability</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Set default working windows and lunch break slots for automated online booking availability.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            {availability.map((day, idx) => (
              <div key={day.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => {
                      const updated = [...availability];
                      updated[idx].enabled = e.target.checked;
                      setAvailability(updated);
                    }}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className={`text-xs font-bold ${day.enabled ? "text-white" : "text-slate-500 line-through"}`}>
                    {day.dayOfWeek}
                  </span>
                </div>

                {day.enabled ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Hours:</span>
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => {
                        const updated = [...availability];
                        updated[idx].startTime = e.target.value;
                        setAvailability(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs font-mono"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => {
                        const updated = [...availability];
                        updated[idx].endTime = e.target.value;
                        setAvailability(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs font-mono"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-italic">Unavailable / Closed</span>
                )}

              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => showToast("Weekly availability saved!")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Save Schedule
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONNECTIONS */}
      {/* ========================================================================= */}
      {activeTab === "connections" && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <ExternalLink className="w-5 h-5 text-orange-500" />
              <span>External Calendar Integrations</span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronize two-way appointments with Google Workspace, Microsoft 365, Apple iCal, and Zoom meeting links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connections.map((conn) => (
              <div key={conn.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{conn.provider}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      conn.status === "Connected" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                    }`}>
                      {conn.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 truncate">{conn.accountEmail}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Last synced: {conn.lastSynced}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">2-Way Sync</span>
                  <button
                    onClick={() => {
                      setConnections(connections.map(c => c.id === conn.id ? {
                        ...c,
                        status: c.status === "Connected" ? "Disconnected" : "Connected",
                        lastSynced: "Just now"
                      } : c));
                      showToast(`Updated ${conn.provider} connection`);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      conn.status === "Connected" ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {conn.status === "Connected" ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SERVICE MENU */}
      {/* ========================================================================= */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Bookable Services Menu</h2>
              <p className="text-xs text-slate-400">Services offered during online client scheduling</p>
            </div>
            <button
              onClick={() => setShowNewServiceModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${srv.color}20`, color: srv.color, border: `1px solid ${srv.color}40` }}>
                    {srv.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">{srv.durationMins} mins</span>
                </div>

                <h3 className="font-bold text-white text-sm">{srv.title}</h3>
                <p className="text-xs text-slate-400">{srv.description}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Calendar: <strong className="text-slate-200">{srv.calendar}</strong></span>
                  <span>Price: <strong className="text-emerald-400">${srv.price}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ROOMS */}
      {/* ========================================================================= */}
      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Room & Facility Resources</h2>
              <p className="text-xs text-slate-400">Manage physical rooms allocated to appointments</p>
            </div>
            <button
              onClick={() => setShowNewRoomModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map((rm) => (
              <div key={rm.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{rm.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rm.status === "Available" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {rm.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{rm.description}</p>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Location: {rm.location}</span>
                  <span>Cap: <strong className="text-white">{rm.capacity}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: EQUIPMENT */}
      {/* ========================================================================= */}
      {activeTab === "equipment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Equipment & Gear Resources</h2>
              <p className="text-xs text-slate-400">Manage tools and sprayers reserved for on-site appointments</p>
            </div>
            <button
              onClick={() => setShowNewEquipmentModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipment.map((eq) => (
              <div key={eq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{eq.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    eq.status === "Available" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {eq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">Serial: {eq.serialNumber}</p>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Category: {eq.category}</span>
                  <span>Quantity: <strong className="text-white">{eq.quantity}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MANAGE COLUMNS MODAL */}
      {/* ========================================================================= */}
      {showManageColumnsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-400" />
                <span>Manage Visible Table Columns</span>
              </h3>
              <button onClick={() => setShowManageColumnsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {[
                { key: "id", label: "# (Appointment ID)" },
                { key: "title", label: "Title & Service Name" },
                { key: "contact", label: "Contact (Name & Phone)" },
                { key: "status", label: "Status Badge" },
                { key: "time", label: "Appointment Time & Date" },
                { key: "calendar", label: "Calendar Name" },
                { key: "owner", label: "Appointment Owner / Staff" },
                { key: "room", label: "Allocated Room" },
                { key: "equipment", label: "Allocated Equipment" }
              ].map((col) => (
                <label key={col.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  <input
                    type="checkbox"
                    checked={(visibleColumns as any)[col.key]}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowManageColumnsModal(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Apply Columns
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CUSTOMIZE LIST MODAL */}
      {/* ========================================================================= */}
      {showCustomizeListModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                <span>Save New Custom Smart List</span>
              </h3>
              <button onClick={() => setShowCustomizeListModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Smart List Title</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Commercial Walkthroughs"
                  value={newSmartListName}
                  onChange={(e) => setNewSmartListName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief view purpose..."
                  value={newSmartListDesc}
                  onChange={(e) => setNewSmartListDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowCustomizeListModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomizeList}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Save Smart List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: NEW / EDIT APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
                <span>{editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}</span>
              </h3>
              <button onClick={() => setShowNewAppointmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveAppointment({
                  title: form.title.value,
                  contactName: form.contactName.value,
                  contactPhone: form.contactPhone.value,
                  contactEmail: form.contactEmail.value,
                  date: form.date.value,
                  startTime: form.startTime.value,
                  endTime: form.endTime.value,
                  calendar: form.calendar.value,
                  owner: form.owner.value,
                  roomId: form.roomId.value,
                  equipmentId: form.equipmentId.value,
                  status: form.status.value,
                  location: form.location.value,
                  notes: form.notes.value
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-300 block mb-1">Appointment Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingAppointment?.title || "Residential Color Consultation"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Contact Name</label>
                  <input
                    name="contactName"
                    type="text"
                    required
                    defaultValue={editingAppointment?.contactName || "Client Name"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Phone</label>
                  <input
                    name="contactPhone"
                    type="text"
                    defaultValue={editingAppointment?.contactPhone || "(717) 555-0100"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email</label>
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={editingAppointment?.contactEmail || "client@email.com"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={editingAppointment?.date || "2026-08-18"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Start Time</label>
                  <input
                    name="startTime"
                    type="text"
                    defaultValue={editingAppointment?.startTime || "09:00 AM"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">End Time</label>
                  <input
                    name="endTime"
                    type="text"
                    defaultValue={editingAppointment?.endTime || "10:00 AM"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Calendar</label>
                  <select
                    name="calendar"
                    defaultValue={editingAppointment?.calendar || "Estimating"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Estimating">Estimating</option>
                    <option value="Sales">Sales</option>
                    <option value="Crew Dispatch">Crew Dispatch</option>
                    <option value="Quality Inspection">Quality Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Appointment Owner</label>
                  <select
                    name="owner"
                    defaultValue={editingAppointment?.owner || "Dave Miller"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Dave Miller">Dave Miller</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Carlos Rodriguez">Carlos Rodriguez</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingAppointment?.status || "Upcoming"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Allocate Room</label>
                  <select
                    name="roomId"
                    defaultValue={editingAppointment?.roomId || ""}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">None / On-Site Client Address</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Allocate Equipment</label>
                  <select
                    name="equipmentId"
                    defaultValue={editingAppointment?.equipmentId || ""}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">None / Standard Toolkit</option>
                    {equipment.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Address / Location</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={editingAppointment?.location || "124 Hillside Dr, York, PA"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Notes / Instructions</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingAppointment?.notes || ""}
                  placeholder="Special instructions, gate codes, or client requests..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {editingAppointment ? "Save Changes" : "Book Appointment"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Resource Modals (Service, Room, Equipment) */}
      {showNewServiceModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Bookable Service</h3>
            <input id="newSrvTitle" placeholder="Service Title" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
            <input id="newSrvMins" type="number" placeholder="Duration (Minutes)" defaultValue={60} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewServiceModal(false)} className="px-3 py-2 text-xs text-slate-400">Cancel</button>
              <button
                onClick={() => {
                  const title = (document.getElementById("newSrvTitle") as any).value || "New Consultation";
                  const mins = parseInt((document.getElementById("newSrvMins") as any).value) || 60;
                  setServices([...services, {
                    id: `srv-${Date.now()}`,
                    title,
                    category: "Consultation",
                    durationMins: mins,
                    price: 0,
                    calendar: "Estimating",
                    description: "Custom service consultation",
                    color: "#F97316"
                  }]);
                  setShowNewServiceModal(false);
                  showToast("Service added to menu");
                }}
                className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Create Service
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewRoomModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Room Resource</h3>
            <input id="newRmName" placeholder="Room Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
            <input id="newRmCap" type="number" placeholder="Capacity" defaultValue={8} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewRoomModal(false)} className="px-3 py-2 text-xs text-slate-400">Cancel</button>
              <button
                onClick={() => {
                  const name = (document.getElementById("newRmName") as any).value || "New Room";
                  const capacity = parseInt((document.getElementById("newRmCap") as any).value) || 8;
                  setRooms([...rooms, {
                    id: `room-${Date.now()}`,
                    name,
                    location: "Main HQ",
                    capacity,
                    status: "Available",
                    description: "Newly added facility room"
                  }]);
                  setShowNewRoomModal(false);
                  showToast("Room added");
                }}
                className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Add Room
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewEquipmentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Equipment Resource</h3>
            <input id="newEqName" placeholder="Equipment Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
            <input id="newEqSerial" placeholder="Serial Number" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewEquipmentModal(false)} className="px-3 py-2 text-xs text-slate-400">Cancel</button>
              <button
                onClick={() => {
                  const name = (document.getElementById("newEqName") as any).value || "New Equipment";
                  const serialNumber = (document.getElementById("newEqSerial") as any).value || "SN-1001";
                  setEquipment([...equipment, {
                    id: `eq-${Date.now()}`,
                    name,
                    category: "General Tools",
                    quantity: 1,
                    serialNumber,
                    status: "Available"
                  }]);
                  setShowNewEquipmentModal(false);
                  showToast("Equipment added");
                }}
                className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
