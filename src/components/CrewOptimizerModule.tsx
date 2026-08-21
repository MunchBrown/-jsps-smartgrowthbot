import React, { useState } from "react";
import { 
  Users, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Sparkles, Plus, 
  Trash, ChevronRight, X, UserCheck, RefreshCw, AlertCircle, Play, Eye, Upload
} from "lucide-react";
import { Project, Crew } from "../types";
import { initialCrews } from "../sampleData";

interface CrewOptimizerModuleProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function CrewOptimizerModule({ projects, setProjects }: CrewOptimizerModuleProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "crews" | "timesheets" | "quality">("calendar");

  // Crew state
  const [crews, setCrews] = useState<Crew[]>(initialCrews);

  // Calendar week view state (Monday - Sunday)
  const [calendarDate, setCalendarDate] = useState("July 2026");
  const calendarDays = [
    { name: "Mon", date: "29", fullDate: "2026-06-29" },
    { name: "Tue", date: "30", fullDate: "2026-06-30" },
    { name: "Wed", date: "01", fullDate: "2026-07-01" },
    { name: "Thu", date: "02", fullDate: "2026-07-02" },
    { name: "Fri", date: "03", fullDate: "2026-07-03" },
    { name: "Sat", date: "04", fullDate: "2026-07-04" },
    { name: "Sun", date: "05", fullDate: "2026-07-05" }
  ];

  // Selected Project for details or checklist QA
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0]);

  // Checklist item toggle state
  const [checklistItems, setChecklistItems] = useState([
    { id: "c1", task: "Drywall pre-sanding and nail patching completed", checked: true },
    { id: "c2", task: "Baseboards, windows and floors taped and covered", checked: true },
    { id: "c3", task: "First interior prime-coat spray applied", checked: true },
    { id: "c4", task: "Second finish-coat satin treatment applied", checked: false },
    { id: "c5", task: "Quality assurance walk-through inspection with owner", checked: false },
    { id: "c6", task: "Taping removal and full site dust vacuuming", checked: false }
  ]);

  const handleToggleChecklist = (id: string) => {
    setChecklistItems(checklistItems.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  // Dispatch details modal state
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [selectedCrewForDispatch, setSelectedCrewForDispatch] = useState("Carlos Rodriguez");

  const handleTriggerDispatch = (proj: Project) => {
    setTargetProject(proj);
    setDispatchOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (!targetProject) return;
    setProjects(projects.map(p => p.id === targetProject.id ? { ...p, crewAssigned: [selectedCrewForDispatch], status: "Scheduled" } : p));
    setDispatchOpen(false);
  };

  return (
    <div className="space-y-6 text-white pb-10 font-sans" id="crew-optimizer-root">
      
      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-3 gap-4">
        <div className="flex gap-2">
          {["calendar", "crews", "timesheets", "quality"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${activeTab === tab ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {tab === "calendar" && "📅 Dispatch Calendar"}
              {tab === "crews" && "👥 Crews & Leaders"}
              {tab === "timesheets" && "🕒 GPS Timesheets"}
              {tab === "quality" && "⭐ Quality QA Checklists"}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-mono">
          SYSTEM GPS DISPATCH LOCK: <span className="text-emerald-400 font-bold">SECURED ON-SITE</span>
        </div>
      </div>

      {/* DISPATCH CALENDAR WEEKLY VIEW */}
      {activeTab === "calendar" && (
        <div className="space-y-6" id="view-dispatch-calendar">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center bg-slate-950/80">
            <div className="text-left space-y-0.5">
              <h4 className="font-extrabold text-white text-base">Crew Dispatch Calendar Schedule</h4>
              <p className="text-xs text-slate-400">Weekly calendar view showing active and scheduled crew site allocations.</p>
            </div>
            <span className="text-sm font-black font-mono bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">{calendarDate}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-stretch">
            {calendarDays.map((day) => {
              // Find projects scheduled or starting on this day (or mock-assign them for high fidelity calendar feel)
              const projectsOnDay = projects.filter(p => p.startDate === day.fullDate || (day.name === "Mon" && p.status === "Active"));
              
              return (
                <div key={day.date} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 flex flex-col min-h-[350px]">
                  <div className="text-center pb-2 border-b border-slate-800/80">
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">{day.name}</p>
                    <h5 className="text-lg font-black text-white">{day.date}</h5>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {projectsOnDay.map((proj) => (
                      <div 
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className={`bg-slate-950 p-2.5 rounded-xl border border-slate-850 hover:border-orange-500/30 transition text-left cursor-pointer space-y-1.5 relative group ${selectedProject?.id === proj.id ? "border-orange-500" : ""}`}
                      >
                        <h6 className="font-extrabold text-white text-[11px] truncate">{proj.name}</h6>
                        <p className="text-[9px] text-slate-500 truncate">{proj.address}</p>
                        
                        {/* Crew tags */}
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-900">
                          {proj.crewAssigned.map((cr, idx) => (
                            <span key={idx} className="text-[8px] font-mono bg-slate-900 text-orange-400 font-bold px-1 rounded truncate max-w-full">
                              {cr}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {projectsOnDay.length === 0 && (
                      <div className="text-center py-20 text-[9px] text-slate-600 font-mono italic">
                        No projects scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREWS & LEADERS LIST VIEW */}
      {activeTab === "crews" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="view-crews-list">
          {crews.map((crew) => {
            // Find active projects for this crew
            const activeProj = projects.find(p => p.crewAssigned.includes(crew.leader) && p.status === "Active");

            return (
              <div key={crew.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-white text-base">{crew.leader} Crew</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Team size: {crew.membersCount} Certified Painters</p>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    crew.status === "On-site" ? "bg-emerald-500/10 text-emerald-400" :
                    crew.status === "Dispatched" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                  }`}>{crew.status}</span>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-xs text-slate-400 uppercase tracking-widest font-mono">Active Site Assignment</h5>
                  {activeProj ? (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
                      <h6 className="font-extrabold text-white text-xs truncate">{activeProj.name}</h6>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{activeProj.address}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center text-xs text-slate-600 font-mono italic">
                      No active on-site job. Ready for dispatch assignment.
                    </div>
                  )}
                </div>

                {/* Dispatch Call action */}
                {!activeProj && (
                  <button 
                    onClick={() => handleTriggerDispatch(projects.find(p => p.crewAssigned.length === 0) || projects[0])}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition"
                  >
                    Dispatch Crew To Job site
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* GPS TIMESHEETS VIEW */}
      {activeTab === "timesheets" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6" id="view-timesheets">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base">GPS Clock In/Out Timesheets</h3>
            <p className="text-xs text-slate-400">Comparing real-time crew smartphone punch coordinates against project site address coordinates.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Crew Leader</th>
                  <th className="pb-3">Active Job Site</th>
                  <th className="pb-3">Clock In</th>
                  <th className="pb-3">Clock Out</th>
                  <th className="pb-3">Total Hrs</th>
                  <th className="pb-3 text-right">GPS Match Check</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {[
                  { leader: "Carlos Rodriguez", job: "Residential Walls Refresh", in: "7:00 AM", out: "4:30 PM", hours: "9.5 hrs", gpsMatch: true, coords: "40.0544, -76.3122" },
                  { leader: "Sarah Lindqvist", job: "West York Dentist Office", in: "8:00 AM", out: "5:00 PM", hours: "9.0 hrs", gpsMatch: true, coords: "39.9626, -76.7277" },
                  { leader: "Darryl Vance", job: "York Historic Siding prep", in: "7:15 AM", out: "Still on site", hours: "Pending", gpsMatch: true, coords: "39.9654, -76.7320" }
                ].map((sheet, i) => (
                  <tr key={i} className="hover:bg-slate-850/40 transition">
                    <td className="py-3 font-bold text-white">{sheet.leader} Crew</td>
                    <td className="py-3 text-slate-300">{sheet.job}</td>
                    <td className="py-3 font-mono text-slate-400">{sheet.in}</td>
                    <td className="py-3 font-mono text-slate-400">{sheet.out}</td>
                    <td className="py-3 font-bold font-mono text-slate-200">{sheet.hours}</td>
                    <td className="py-3 text-right font-mono">
                      <div className="flex justify-end items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">GPS: {sheet.coords}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          sheet.gpsMatch ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>MATCHED ✓</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUALITY QA CHECKLISTS VIEW */}
      {activeTab === "quality" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-quality">
          
          {/* Left Checklist Selector */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
            <h3 className="font-extrabold text-white text-base">Select Project Active QA Checklist</h3>
            
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div 
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left space-y-1.5 ${selectedProject?.id === proj.id ? "bg-orange-500/10 border-orange-500" : "bg-slate-950 border-slate-850 hover:border-slate-700"}`}
                >
                  <h5 className="font-extrabold text-white text-xs truncate">{proj.name}</h5>
                  <p className="text-[10px] text-slate-400 truncate">{proj.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Checklist Items & Photos */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" id="checklist-item-manager">
            {selectedProject ? (
              <div className="space-y-6 text-left">
                <div className="pb-3 border-b border-slate-800/80 flex justify-between items-center bg-slate-900">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">QA AUDIT MODE</span>
                    <h4 className="font-extrabold text-white text-sm">{selectedProject.name}</h4>
                  </div>
                  <span className="text-xs font-bold text-orange-500 font-mono">6 Stage Checklist</span>
                </div>

                {/* Checklist controls */}
                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <label 
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-850 cursor-pointer select-none"
                    >
                      <input 
                        type="checkbox" 
                        checked={item.checked}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="mt-0.5 accent-orange-500 w-4 h-4 shrink-0 rounded"
                      />
                      <span className={`text-xs ${item.checked ? "text-slate-500 line-through" : "text-slate-300"}`}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Before/After Photo mocks */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-slate-400 uppercase tracking-widest font-mono">Job Site Before / After Photo Audit</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-850 bg-slate-950 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 relative h-36">
                      <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80" alt="Before" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40" referrerPolicy="no-referrer" />
                      <span className="relative z-10 text-[10px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded text-red-400 uppercase">BEFORE PREP</span>
                    </div>
                    <div className="border-2 border-dashed border-slate-800 bg-slate-950/60 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 h-36 cursor-pointer hover:border-orange-500/30 transition">
                      <Upload className="h-6 w-6 text-slate-600" />
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">UPLOAD AFTER PHOTO</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-24 text-slate-500 space-y-2">
                <Users className="h-10 w-10 text-slate-700 animate-pulse" />
                <p className="text-xs font-mono italic">Select any project to launch the interactive Quality Check audit console.</p>
              </div>
            )}

            {/* QA confirmation block */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/40 text-[10px] text-slate-500 flex items-center gap-2 mt-4 font-mono text-left">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>QA certifications locks in automatically upon completion of final signature.</span>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH CONFIRMATION MODAL */}
      {dispatchOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => setDispatchOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full border border-slate-700 z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 space-y-4 text-left">
              <h3 className="font-extrabold text-white text-base border-b border-slate-800/80 pb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500 animate-bounce" />
                Dispatch Crew to Site Assignment
              </h3>

              <div className="space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Target Project Job</span>
                <h5 className="font-bold text-white text-xs">{targetProject?.name}</h5>
                <p className="text-[10px] text-slate-400 truncate">{targetProject?.address}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Select Available Crew Leader</label>
                <select 
                  value={selectedCrewForDispatch}
                  onChange={(e) => setSelectedCrewForDispatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-orange-500 font-sans"
                >
                  <option value="Carlos Rodriguez">Carlos Rodriguez Crew (4 Painters)</option>
                  <option value="Sarah Lindqvist">Sarah Lindqvist Crew (2 Painters)</option>
                  <option value="Darryl Vance">Darryl Vance Crew (5 Painters)</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleConfirmDispatch}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  Confirm GPS Dispatch Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
