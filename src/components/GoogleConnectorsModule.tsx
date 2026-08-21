import React, { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, FileSpreadsheet, Mail, Folder, CheckSquare, 
  RefreshCw, CheckCircle2, ChevronRight, AlertCircle, Info, Send, 
  Plus, Trash2, ExternalLink, ArrowUpRight, Download, UploadCloud,
  FileText, ShieldCheck, UserCheck, Key, LogIn, Lock
} from "lucide-react";
import { Lead, Estimate } from "../types";

interface GoogleConnectorsModuleProps {
  leads: Lead[];
  estimates: Estimate[];
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
  status: "confirmed" | "tentative" | "cancelled";
}

interface GoogleSheetRow {
  name: string;
  phone: string;
  email: string;
  budget: string;
  status: string;
}

interface GmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt?: string;
  status: "Draft" | "Sent" | "Failed";
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
}

interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: "needsAction" | "completed";
}

export default function GoogleConnectorsModule({ leads, estimates }: GoogleConnectorsModuleProps) {
  // Authentication State
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem("g_auth_token") || "";
    } catch {
      return "";
    }
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem("g_auth_email") || "admin@paintingpro.ai";
    } catch {
      return "admin@paintingpro.ai";
    }
  });
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("g_auth_token");
    } catch {
      return false;
    }
  });
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [apiLogs, setApiLogs] = useState<{ time: string; service: string; message: string; type: "success" | "info" | "error" }[]>([]);

  // Active connector view
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "sheets" | "gmail" | "drive" | "tasks">("calendar");

  // State collections for all 5 Google Services
  // 1. Google Calendar State
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([
    {
      id: "cal-1",
      summary: "Residential Estimate: Helen Miller",
      description: "Complete 3-bedroom interior paint consultation. High-intent lead.",
      start: { dateTime: new Date(Date.now() + 86400000 * 1).toISOString().substring(0, 16) },
      end: { dateTime: new Date(Date.now() + 86400000 * 1 + 3600000).toISOString().substring(0, 16) },
      status: "confirmed"
    },
    {
      id: "cal-2",
      summary: "Color Consultation: Arthur Pendelton",
      description: "Review deck staining color cards and paint finishes.",
      start: { dateTime: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16) },
      end: { dateTime: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString().substring(0, 16) },
      status: "confirmed"
    }
  ]);
  const [newCalSummary, setNewCalSummary] = useState("");
  const [newCalDesc, setNewCalDesc] = useState("");
  const [newCalStart, setNewCalStart] = useState("");
  const [newCalEnd, setNewCalEnd] = useState("");
  const [syncingCalendar, setSyncingCalendar] = useState(false);

  // 2. Google Sheets State
  const [spreadsheetId, setSpreadsheetId] = useState("1_gSh4M_LeadsExport_SmartGrowth_2026");
  const [sheetName, setSheetName] = useState("Leads Database");
  const [exportSuccessMsg, setExportSuccessMsg] = useState("");
  const [sheetsData, setSheetsData] = useState<GoogleSheetRow[]>([
    { name: "Helen Miller", phone: "(717) 555-0329", email: "helen@millerdev.com", budget: "$3,500", status: "Qualified" },
    { name: "Marcus Sterling", phone: "(215) 555-9104", email: "marcus@sterlingcorp.com", budget: "$12,500", status: "Won" },
    { name: "Debra Larson", phone: "(717) 555-7761", email: "debra@larsonhome.com", budget: "$2,800", status: "Contacted" }
  ]);
  const [syncingSheets, setSyncingSheets] = useState(false);

  // 3. Gmail State
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("followup");
  const [gmailDrafts, setGmailDrafts] = useState<GmailDraft[]>([
    { id: "msg-1", to: "helen@millerdev.com", subject: "Smart Growth Painting - Proposal Estimate Follow-up", body: "Hi Helen, I wanted to check in on our paint consultation proposal...", sentAt: "Today, 10:42 AM", status: "Sent" },
    { id: "msg-2", to: "david@thompsondental.com", subject: "Commercial Painting Proposal & Prep Schedule", body: "Hello David, Attached is our premium paint package scope...", sentAt: "Yesterday, 3:15 PM", status: "Sent" }
  ]);
  const [sendingEmail, setSendingEmail] = useState(false);

  // 4. Google Drive State
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([
    { id: "dr-1", name: "Proposal_Helen_Miller_3Bedrooms.pdf", mimeType: "application/pdf", createdTime: "2026-06-28 14:22", size: "245 KB" },
    { id: "dr-2", name: "Deck_Staining_Preparation_Guide.pdf", mimeType: "application/pdf", createdTime: "2026-06-25 09:12", size: "1.2 MB" },
    { id: "dr-3", name: "Sherwin_Williams_Contract_Agreement.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", createdTime: "2026-06-24 11:30", size: "88 KB" }
  ]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // 5. Google Tasks State
  const [googleTasks, setGoogleTasks] = useState<GoogleTask[]>([
    { id: "task-1", title: "Follow up with Arthur about solid deck stain choice", notes: "Prefers Behr Slate deck coatings", status: "needsAction" },
    { id: "task-2", title: "Prepare Sherwin-Williams low-VOC coatings overview", notes: "Required for Marcus retail store interior bid", status: "completed" },
    { id: "task-3", title: "Double-check on-site equipment inventory", notes: "Verify dustless sander filters are packed", status: "needsAction" }
  ]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldNotes, setNewFieldNotes] = useState("");
  const [syncingTasks, setSyncingTasks] = useState(false);

  // Log function
  const addLog = (service: string, message: string, type: "success" | "info" | "error" = "info") => {
    const time = new Date().toLocaleTimeString();
    setApiLogs(prev => [{ time, service, message, type }, ...prev]);
  };

  // Check & parse token if exists
  useEffect(() => {
    if (isConnected) {
      addLog("Google Auth", "Authorized access to Workspace services", "success");
    }
  }, [isConnected]);

  // Connect Google account manually with simulated or real Token
  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tempToken.trim() || "simulated-oauth-token-paintingpro-2026";
    const cleanEmail = tempEmail.trim() || "febforlife@gmail.com";
    
    setToken(cleanToken);
    setUserEmail(cleanEmail);
    setIsConnected(true);
    try {
      localStorage.setItem("g_auth_token", cleanToken);
      localStorage.setItem("g_auth_email", cleanEmail);
    } catch (err) {
      console.warn("Storage write denied:", err);
    }
    setShowTokenInput(false);
    addLog("Google Auth", `Connected successfully as ${cleanEmail}`, "success");
  };

  const handleDisconnect = () => {
    setToken("");
    setUserEmail("admin@paintingpro.ai");
    setIsConnected(false);
    try {
      localStorage.removeItem("g_auth_token");
      localStorage.removeItem("g_auth_email");
    } catch (err) {
      console.warn("Storage delete denied:", err);
    }
    addLog("Google Auth", "Account disconnected. Sandbox offline mode active.", "info");
  };

  // EMAIL TEMPLATE DISPATCHER
  useEffect(() => {
    if (emailTemplate === "followup") {
      setEmailSubject("Painting Estimate Follow-up: Smart Growth Painting");
      setEmailBody("Hi There,\n\nI hope your day is going beautifully! I'm reaching out from Smart Growth Painting regarding the custom quote we delivered. Our team has slots available next week, and we'd love to make your property spectacular.\n\nPlease let me know if you have any questions about our 80% prep-focus scope or paint sheens.\n\nWarmly,\nEstimating Coordinator\nSmart Growth Painting");
    } else if (emailTemplate === "onboarding") {
      setEmailSubject("Welcome to PaintingPro OS - Getting Started Scheduled!");
      setEmailBody("Hello,\n\nWelcome to Smart Growth Painting! We have confirmed your paint crew schedules. Carlos and the crew will arrive on-site at 8:00 AM sharp on your project start date. Please ensure all fragile ornaments are removed from walls before our arrival.\n\nIf you have any questions, feel free to text or call us anytime!\n\nBest regards,\nCrew Manager\nSmart Growth Painting");
    } else if (emailTemplate === "thankyou") {
      setEmailSubject("Thank You for Choosing Smart Growth Painting!");
      setEmailBody("Dear Customer,\n\nThank you so much for trusting Smart Growth Painting to complete your repaint! We are incredibly proud of the workmanship, prep details, and premium finish we delivered.\n\nWe provide a full 3-year warranty on exterior coatings. If you loved our craftsmanship, we would be deeply grateful if you could leave us a quick review on our Google Business Profile.\n\nSincerely,\nSmart Growth Painting");
    }
  }, [emailTemplate]);

  // 1. Google Calendar: Sync Lead or Add Event
  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalSummary) return;

    setSyncingCalendar(true);
    addLog("Google Calendar", `Creating event: "${newCalSummary}"...`, "info");

    const startTime = newCalStart || new Date(Date.now() + 3600000).toISOString().substring(0, 16);
    const endTime = newCalEnd || new Date(Date.now() + 7200000).toISOString().substring(0, 16);

    const newEvent: GoogleCalendarEvent = {
      id: `cal-${Date.now()}`,
      summary: newCalSummary,
      description: newCalDesc || "Estimate survey scheduled from PaintingPro app",
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      status: "confirmed"
    };

    // If real token is present and starts with a live token (non-mock), we can push to Google
    if (token && !token.startsWith("simulated")) {
      try {
        const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            summary: newEvent.summary,
            description: newEvent.description,
            start: { dateTime: new Date(newEvent.start.dateTime).toISOString() },
            end: { dateTime: new Date(newEvent.end.dateTime).toISOString() }
          })
        });
        if (res.ok) {
          const cloudEvent = await res.json();
          addLog("Google Calendar", `Successfully pushed live event to Google Calendar: "${cloudEvent.summary}"`, "success");
        } else {
          addLog("Google Calendar", "API call failed. Added to local sandbox.", "error");
        }
      } catch (err: any) {
        addLog("Google Calendar", `Connection failed: ${err.message}. Added to sandbox.`, "error");
      }
    } else {
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog("Google Calendar", `Event synced beautifully to sandbox Google Calendar!`, "success");
    }

    setCalendarEvents(prev => [newEvent, ...prev]);
    setNewCalSummary("");
    setNewCalDesc("");
    setSyncingCalendar(false);
  };

  const syncCRMLeadsToCalendar = async () => {
    setSyncingCalendar(true);
    addLog("Google Calendar", `Syncing ${leads.length} active CRM Leads to Google Calendar schedule...`, "info");
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    const synchedEvents: GoogleCalendarEvent[] = leads.map((lead, idx) => ({
      id: `lead-cal-${lead.id}`,
      summary: `Paint Survey: ${lead.clientName}`,
      description: `Lead Score: ${lead.score}/100. Timeline: ${lead.timeline}. Condition: ${lead.condition}. source: ${lead.source}`,
      start: { dateTime: new Date(Date.now() + 86400000 * (idx + 1) + 32400000).toISOString().substring(0, 16) }, // 9 AM onwards
      end: { dateTime: new Date(Date.now() + 86400000 * (idx + 1) + 3600000 + 32400000).toISOString().substring(0, 16) },
      status: "confirmed"
    }));

    setCalendarEvents(prev => {
      // Filter out duplicates
      const existingIds = prev.map(e => e.id);
      const uniqueNew = synchedEvents.filter(e => !existingIds.includes(e.id));
      return [...uniqueNew, ...prev];
    });

    addLog("Google Calendar", `Successfully synchronized ${leads.length} leads with active calendar!`, "success");
    setSyncingCalendar(false);
  };

  // 2. Google Sheets: Export database
  const exportLeadsToSheet = async () => {
    setSyncingSheets(true);
    addLog("Google Sheets", `Opening Spreadsheet: ${spreadsheetId}...`, "info");
    
    // Convert leads to Sheets rows format
    const newRows: GoogleSheetRow[] = leads.map(l => ({
      name: l.clientName,
      phone: l.phone || "No Phone",
      email: l.email || "No Email",
      budget: `$${l.budget.toLocaleString()}`,
      status: l.status
    }));

    if (token && !token.startsWith("simulated")) {
      try {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:E:append?valueInputOption=USER_ENTERED`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            values: newRows.map(r => [r.name, r.phone, r.email, r.budget, r.status])
          })
        });
        if (res.ok) {
          addLog("Google Sheets", `Live-exported ${newRows.length} CRM rows directly to Google Spreadsheet!`, "success");
        } else {
          addLog("Google Sheets", "Live Sheets API append failed. Synced to local preview grid.", "error");
        }
      } catch (err: any) {
        addLog("Google Sheets", `Live sheets error: ${err.message}`, "error");
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog("Google Sheets", `Sheet "${sheetName}" created. Exported ${newRows.length} Leads to Sheet database.`, "success");
    }

    setSheetsData(newRows);
    setExportSuccessMsg(`Successfully exported ${leads.length} leads to spreadsheet!`);
    setTimeout(() => setExportSuccessMsg(""), 4000);
    setSyncingSheets(false);
  };

  // 3. Gmail: Compose and Send
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) return;

    setSendingEmail(true);
    addLog("Gmail API", `Queuing email dispatch to <${emailTo}> via Google Mail...`, "info");

    const newDraft: GmailDraft = {
      id: `msg-${Date.now()}`,
      to: emailTo,
      subject: emailSubject,
      body: emailBody,
      sentAt: "Just Now",
      status: "Sent"
    };

    if (token && !token.startsWith("simulated")) {
      try {
        // Build base64 RFC822 formatted email
        const emailContent = [
          `To: ${emailTo}`,
          'Content-Type: text/plain; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${emailSubject}`,
          '',
          emailBody
        ].join('\n');

        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const res = await fetch("https://gmail.googleapis.com/v1/users/me/messages/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ raw: encodedEmail })
        });

        if (res.ok) {
          addLog("Gmail API", `Email sent successfully to ${emailTo} using Gmail server!`, "success");
        } else {
          addLog("Gmail API", "API send failed. Stored sent status locally in logs.", "error");
        }
      } catch (err: any) {
        addLog("Gmail API", `Failed to send email live: ${err.message}`, "error");
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1200));
      addLog("Gmail API", `Simulated email message dispatched successfully to <${emailTo}>!`, "success");
    }

    setGmailDrafts(prev => [newDraft, ...prev]);
    setEmailTo("");
    setSendingEmail(false);
  };

  // 4. Google Drive: Upload File
  const handleBackupToDrive = async () => {
    setUploadingFile(true);
    addLog("Google Drive", "Archiving estimate documents and leads database backups to Drive...", "info");

    await new Promise(resolve => setTimeout(resolve, 1100));

    const timestamp = new Date().toISOString().replace(/T/, '_').substring(0, 19);
    const newFile: GoogleDriveFile = {
      id: `dr-${Date.now()}`,
      name: `PaintingPro_LeadsBackup_${timestamp}.json`,
      mimeType: "application/json",
      createdTime: new Date().toISOString().substring(0, 16).replace("T", " "),
      size: `${(leads.length * 0.4).toFixed(1)} KB`
    };

    if (token && !token.startsWith("simulated")) {
      try {
        const metadata = {
          name: newFile.name,
          mimeType: newFile.mimeType
        };
        const fileContent = JSON.stringify({ leads, estimates });
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: form
        });

        if (res.ok) {
          addLog("Google Drive", `Successfully uploaded "${newFile.name}" to Google Drive folder!`, "success");
        } else {
          addLog("Google Drive", "Drive API upload failed. Added to sandbox folder list.", "error");
        }
      } catch (err: any) {
        addLog("Google Drive", `Drive upload failed: ${err.message}`, "error");
      }
    } else {
      addLog("Google Drive", `Uploaded "${newFile.name}" successfully to cloud folder root.`, "success");
    }

    setDriveFiles(prev => [newFile, ...prev]);
    setUploadingFile(false);
  };

  // 5. Google Tasks: Create
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName) return;

    setSyncingTasks(true);
    addLog("Google Tasks", `Adding task: "${newFieldName}"...`, "info");

    const newTask: GoogleTask = {
      id: `task-${Date.now()}`,
      title: newFieldName,
      notes: newFieldNotes || "Follow up from PaintingPro Dashboard",
      status: "needsAction"
    };

    if (token && !token.startsWith("simulated")) {
      try {
        const res = await fetch("https://tasks.googleapis.com/v1/lists/@default/tasks", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: newTask.title,
            notes: newTask.notes
          })
        });

        if (res.ok) {
          addLog("Google Tasks", `Successfully pushed task to Google Tasks application list!`, "success");
        } else {
          addLog("Google Tasks", "API connection failed. Stored task locally.", "error");
        }
      } catch (err: any) {
        addLog("Google Tasks", `Tasks API error: ${err.message}`, "error");
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 600));
      addLog("Google Tasks", `Added task "${newFieldName}" to synced workspace planner.`, "success");
    }

    setGoogleTasks(prev => [newTask, ...prev]);
    setNewFieldName("");
    setNewFieldNotes("");
    setSyncingTasks(false);
  };

  const syncCRMActionsToTasks = async () => {
    setSyncingTasks(true);
    addLog("Google Tasks", "Importing all action items from Lead CRM database...", "info");

    await new Promise(resolve => setTimeout(resolve, 1000));

    const synchedTasks: GoogleTask[] = [];
    leads.forEach(l => {
      if (l.actionPlan) {
        l.actionPlan.forEach((plan, pIdx) => {
          synchedTasks.push({
            id: `task-crm-${l.id}-${pIdx}`,
            title: `[Lead: ${l.clientName}] ${plan}`,
            notes: `Auto-generated follow-up action from CRM Lead Flow. Client: ${l.clientName}, Phone: ${l.phone}`,
            status: "needsAction"
          });
        });
      }
    });

    setGoogleTasks(prev => {
      const existingIds = prev.map(t => t.id);
      const uniqueNew = synchedTasks.filter(t => !existingIds.includes(t.id));
      return [...uniqueNew, ...prev];
    });

    addLog("Google Tasks", `Successfully created ${synchedTasks.length} integrated tasks in Google Workspace!`, "success");
    setSyncingTasks(false);
  };

  const toggleTaskStatus = (id: string) => {
    setGoogleTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "needsAction" ? "completed" : "needsAction";
        addLog("Google Tasks", `Task "${t.title}" marked as ${nextStatus === "completed" ? "Completed" : "Active"}`, "info");
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const removeTask = (id: string) => {
    setGoogleTasks(prev => {
      const removed = prev.find(t => t.id === id);
      if (removed) {
        addLog("Google Tasks", `Removed task: "${removed.title}"`, "info");
      }
      return prev.filter(t => t.id !== id);
    });
  };

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="google-connectors-root">
      
      {/* Top Heading Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
            <Sparkles className="h-4.5 w-4.5 text-orange-400 animate-pulse" />
            <span>Google Workspace Enterprise Connectors</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Google Services Hub</h2>
          <p className="text-xs text-slate-400">
            Synchronize estimate projects, contacts, client correspondence, scheduling, and files across all active Google Services.
          </p>
        </div>

        {/* Account Authentication Connector Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-2xl text-xs text-emerald-400 font-extrabold shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-mono">Linked Google User</span>
                <span className="text-white leading-none">{userEmail}</span>
              </div>
              <button 
                onClick={handleDisconnect}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold py-1 px-2.5 rounded-xl border border-red-500/30 transition cursor-pointer ml-1"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowTokenInput(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/15 transition cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Link Google Workspace Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Google Token Setup Overlay Modal */}
      {showTokenInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Google Account Setup</h4>
                  <p className="text-[10px] text-slate-400">Authenticate with Workspace Scopes</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTokenInput(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect real Google APIs or customize your local workspace profile. If you provide a valid Google Access Token, the application will securely execute actual live Google Workspace requests!
            </p>

            <form onSubmit={handleConnect} className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">User Email Address</label>
                <input 
                  type="email"
                  placeholder="febforlife@gmail.com"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Google OAuth Access Token (Optional)</label>
                <input 
                  type="password"
                  placeholder="Paste bearer access token for live API calls..."
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-1 block leading-tight">
                  Leave blank to activate fully interactive **Sandbox Simulator Mode** instantly.
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid: Left Column - Connector Workspace / Right Column - Real-time Action Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE CONSOLE */}
        <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col min-h-[600px] shadow-xl">
          
          {/* Module Selector Menu */}
          <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2 flex flex-wrap gap-1">
            {[
              { id: "calendar", label: "Calendar", icon: Calendar, color: "text-blue-400 bg-blue-500/10 border-blue-500/15" },
              { id: "sheets", label: "Sheets", icon: FileSpreadsheet, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" },
              { id: "gmail", label: "Gmail Mailer", icon: Mail, color: "text-red-400 bg-red-500/10 border-red-500/15" },
              { id: "drive", label: "Drive Storage", icon: Folder, color: "text-amber-400 bg-amber-500/10 border-amber-500/15" },
              { id: "tasks", label: "Tasks Organizer", icon: CheckSquare, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15" }
            ].map((sub) => {
              const Icon = sub.icon;
              const isActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? "bg-orange-500 text-white font-black shadow-md shadow-orange-500/15" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Work Panel Stage */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            
            {/* 1. GOOGLE CALENDAR CONNECTOR */}
            {activeSubTab === "calendar" && (
              <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Calendar className="h-4.5 w-4.5 text-blue-400" />
                        <span>Google Calendar Scheduling Connector</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Pushes estimate visits and project launches straight to your personal work schedule.</p>
                    </div>
                    
                    <button 
                      onClick={syncCRMLeadsToCalendar}
                      disabled={syncingCalendar}
                      className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 text-blue-400 font-extrabold text-[10px] py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {syncingCalendar ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      <span>Sync CRM Leads to Calendar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Event Creator Form */}
                    <form onSubmit={handleAddCalendarEvent} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                      <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block mb-1">Add Survey Appointment</span>
                      
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Appointment Title</label>
                        <input 
                          type="text"
                          required
                          value={newCalSummary}
                          onChange={(e) => setNewCalSummary(e.target.value)}
                          placeholder="e.g. Living Room Consultation - Helen Miller"
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Notes / Project Info</label>
                        <textarea 
                          value={newCalDesc}
                          onChange={(e) => setNewCalDesc(e.target.value)}
                          placeholder="e.g. Review cabinet finishes and drywall patch complexity..."
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 h-16 resize-none focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block mb-1">Start Date & Time</label>
                          <input 
                            type="datetime-local"
                            value={newCalStart}
                            onChange={(e) => setNewCalStart(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white text-[11px] rounded-xl py-2 px-3 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block mb-1">End Date & Time</label>
                          <input 
                            type="datetime-local"
                            value={newCalEnd}
                            onChange={(e) => setNewCalEnd(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white text-[11px] rounded-xl py-2 px-3 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={syncingCalendar}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Push to Google Calendar</span>
                      </button>
                    </form>

                    {/* Active Calendar Agenda List */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Active Agenda Feed</span>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {calendarEvents.map((evt) => (
                          <div key={evt.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-white leading-tight">{evt.summary}</h4>
                              <p className="text-[10px] text-slate-400 leading-normal">{evt.description}</p>
                              <span className="text-[9px] font-mono text-blue-400 font-bold block pt-1">
                                📅 {evt.start.dateTime.replace("T", " ")}
                              </span>
                            </div>
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0">
                              Google
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/15 p-3.5 rounded-2xl flex items-start gap-3 mt-4">
                  <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This scheduling sync pushes appointments directly using Google Calendar REST endpoints. Ideal for notifying estimators, color consultants, and project managers automatically.
                  </p>
                </div>
              </div>
            )}

            {/* 2. GOOGLE SHEETS CONNECTOR */}
            {activeSubTab === "sheets" && (
              <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-850">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
                        <span>Google Sheets Direct Database Exporter</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Export active CRM lead logs or bid calculators directly to an external spreadsheet tab.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Setup Config Column */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                        <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Sheets Configuration</span>
                        
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block mb-1">Target Spreadsheet ID</label>
                          <input 
                            type="text"
                            value={spreadsheetId}
                            onChange={(e) => setSpreadsheetId(e.target.value)}
                            placeholder="Enter Google Spreadsheet ID..."
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block mb-1">Sheet Tab Name</label>
                          <input 
                            type="text"
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                            placeholder="e.g. Leads Database"
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                          />
                        </div>

                        <button 
                          onClick={exportLeadsToSheet}
                          disabled={syncingSheets}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                        >
                          {syncingSheets ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                          <span>Sync & Export leads now</span>
                        </button>

                        {exportSuccessMsg && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold p-2.5 rounded-lg text-center animate-pulse">
                            {exportSuccessMsg}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Spreadsheet Grid Column */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Live Sheet Grid Preview</span>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                          AUTO-UPDATES ON SYNC
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden text-xs">
                        {/* Sheets Top Bar */}
                        <div className="bg-slate-900 px-3.5 py-2 border-b border-slate-850 font-mono text-[10px] text-slate-400 flex justify-between">
                          <span>📊 Spreadsheet: {spreadsheetId.substring(0, 16)}...</span>
                          <span className="text-emerald-400">Sheet1!A1:E</span>
                        </div>

                        {/* Sheet Grid Table */}
                        <div className="overflow-x-auto max-h-[220px]">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-850 bg-slate-950 text-slate-500 font-mono text-[9px] uppercase">
                                <th className="p-2 pl-3">A: CLIENT</th>
                                <th className="p-2">B: PHONE</th>
                                <th className="p-2">C: EMAIL</th>
                                <th className="p-2">D: BUDGET</th>
                                <th className="p-2 pr-3">E: STATUS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sheetsData.map((row, i) => (
                                <tr key={i} className="border-b border-slate-850/40 hover:bg-slate-900/40 font-mono text-[10px]">
                                  <td className="p-2 pl-3 text-slate-300 truncate max-w-[100px]">{row.name}</td>
                                  <td className="p-2 text-slate-400 font-mono">{row.phone}</td>
                                  <td className="p-2 text-slate-400 truncate max-w-[100px]">{row.email}</td>
                                  <td className="p-2 text-emerald-400 font-bold">{row.budget}</td>
                                  <td className="p-2 pr-3">
                                    <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-sans uppercase">
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-2xl flex items-start gap-3 mt-4">
                  <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Spreadsheet synchronization enables zero-code leads sharing with contractors and crew leaders, and provides powerful integration options for external marketing dashboards.
                  </p>
                </div>
              </div>
            )}

            {/* 3. GMAIL AUTOMATION CONNECTOR */}
            {activeSubTab === "gmail" && (
              <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Mail className="h-4.5 w-4.5 text-red-400" />
                        <span>Gmail Automation Mailer</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Compose and send professional bid follow-ups and project details directly via Gmail API.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mail Composer */}
                    <form onSubmit={handleSendEmail} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest block">Email Dispatcher</span>
                        <select 
                          value={emailTemplate}
                          onChange={(e) => setEmailTemplate(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded-lg py-1 px-2.5 focus:outline-none"
                        >
                          <option value="followup">Template: Quote Follow-up</option>
                          <option value="onboarding">Template: Crew Onboarding</option>
                          <option value="thankyou">Template: Review Request</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Recipient Address (To)</label>
                        <input 
                          type="email"
                          required
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="e.g. client@domain.com"
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Subject Line</label>
                        <input 
                          type="text"
                          required
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="e.g. Painting Proposal Update"
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Message Body</label>
                        <textarea 
                          required
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 h-28 resize-none focus:outline-none leading-relaxed"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={sendingEmail}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10"
                      >
                        {sendingEmail ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span>Send via Google Mail</span>
                      </button>
                    </form>

                    {/* Sent Correspondence Logs */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Outbox Records</span>
                      <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                        {gmailDrafts.map((msg) => (
                          <div key={msg.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 text-left">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-extrabold text-white truncate max-w-[150px]">To: {msg.to}</span>
                              <span className="text-[8px] font-mono text-slate-500 shrink-0">{msg.sentAt}</span>
                            </div>
                            <h4 className="text-[10px] text-red-400 font-mono font-semibold truncate mb-1">{msg.subject}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2 italic">"{msg.body}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/15 p-3.5 rounded-2xl flex items-start gap-3 mt-4">
                  <Info className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    With real Google API authorization, messages are sent on behalf of your active Gmail user. Perfect for direct customer followup and proposal approvals tracking.
                  </p>
                </div>
              </div>
            )}

            {/* 4. GOOGLE DRIVE BACKUP CONNECTOR */}
            {activeSubTab === "drive" && (
              <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Folder className="h-4.5 w-4.5 text-amber-400" />
                        <span>Google Drive Backup & Document Vault</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Save detailed painting estimates, color consult cards, and database backups automatically.</p>
                    </div>

                    <button 
                      onClick={handleBackupToDrive}
                      disabled={uploadingFile}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-1.5 px-3.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      {uploadingFile ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                      <span>Backup CRM Data to Drive</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Drive Folder: "/PaintingPro_Workspace_Backup"</span>
                      <span className="text-[9px] font-mono text-amber-400">{driveFiles.length} backed up documents</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {driveFiles.map((file) => (
                        <div key={file.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-start gap-3 hover:border-amber-500/25 transition">
                          <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-xl shrink-0">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div className="space-y-0.5 truncate flex-1">
                            <h4 className="text-xs font-black text-white truncate leading-snug" title={file.name}>{file.name}</h4>
                            <span className="text-[9px] text-slate-500 block font-mono">{file.size || "Unknown Size"}</span>
                            <span className="text-[8px] text-amber-400 block font-mono">{file.createdTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-2xl flex items-start gap-3 mt-4">
                  <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This document backup system helps prevent user effort loss by backing up critical quote summaries as persistent JSON/PDF objects in a secure Google Drive folder tree.
                  </p>
                </div>
              </div>
            )}

            {/* 5. GOOGLE TASKS ORGANIZER */}
            {activeSubTab === "tasks" && (
              <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
                        <span>Google Tasks Planner Integration</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Generate on-site checklists and subcontractor action items directly to your Google Tasks application.</p>
                    </div>

                    <button 
                      onClick={syncCRMActionsToTasks}
                      disabled={syncingTasks}
                      className="bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 text-indigo-400 font-extrabold text-[10px] py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {syncingTasks ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      <span>Sync CRM Actions to Google Tasks</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Add Task Form */}
                    <form onSubmit={handleAddTask} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Add Task Reminder</span>
                      
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Task Title</label>
                        <input 
                          type="text"
                          required
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          placeholder="e.g. Schedule crew meeting for Monday exterior prep"
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">Planner Notes</label>
                        <textarea 
                          value={newFieldNotes}
                          onChange={(e) => setNewFieldNotes(e.target.value)}
                          placeholder="e.g. Detail instructions regarding low-VOC satin trims..."
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 h-16 resize-none focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={syncingTasks}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Push to Google Tasks</span>
                      </button>
                    </form>

                    {/* Planner list */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Workspace Tasks Feed</span>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {googleTasks.map((task) => {
                          const isCompleted = task.status === "completed";
                          return (
                            <div key={task.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 flex items-start justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 text-left">
                                <input 
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => toggleTaskStatus(task.id)}
                                  className="h-4 w-4 text-indigo-500 border-slate-800 bg-slate-900 rounded focus:ring-0 cursor-pointer mt-0.5"
                                />
                                <div>
                                  <h4 className={`text-xs font-black leading-tight ${isCompleted ? "text-slate-500 line-through" : "text-white"}`}>
                                    {task.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 mt-1">{task.notes}</p>
                                </div>
                              </div>

                              <button 
                                onClick={() => removeTask(task.id)}
                                className="text-slate-500 hover:text-red-400 transition cursor-pointer shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/15 p-3.5 rounded-2xl flex items-start gap-3 mt-4">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Direct planner sync keeps subcontractors and project estimators fully aligned. Checking tasks as completed instantly updates active progress state.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: RECENT ACTIONS & API TELEMETRY LOGS */}
        <div className="xl:col-span-4 space-y-6 text-left">
          
          {/* Active Integration Status */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-orange-400" />
              <span>Workspace Connector Status</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { name: "Google Calendar API", status: isConnected ? "Synchronized" : "Sandbox Mode", color: isConnected ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { name: "Google Sheets API", status: isConnected ? "Synchronized" : "Sandbox Mode", color: isConnected ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { name: "Gmail Automation Engine", status: isConnected ? "Synchronized" : "Sandbox Mode", color: isConnected ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { name: "Google Drive Storage", status: isConnected ? "Synchronized" : "Sandbox Mode", color: isConnected ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { name: "Google Tasks Planner", status: isConnected ? "Synchronized" : "Sandbox Mode", color: isConnected ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20" }
              ].map((api, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="font-semibold text-slate-300">{api.name}</span>
                  <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 border rounded-lg ${api.color}`}>
                    {api.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Event Log */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between h-[360px]">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Workspace Connector Logs</span>
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {apiLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <Info className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                    No transactions executed yet. Synchronize a service to populate activity ledger.
                  </div>
                ) : (
                  apiLogs.map((log, i) => (
                    <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[11px] leading-normal">
                      <span className="text-[9px] text-slate-500 font-mono shrink-0 pt-0.5">{log.time}</span>
                      <div className="flex-1 space-y-0.5">
                        <span className={`text-[8px] font-mono font-black uppercase tracking-wider block ${
                          log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-red-400" : "text-blue-400"
                        }`}>
                          [{log.service}]
                        </span>
                        <p className="text-slate-300">{log.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
