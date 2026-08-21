import React, { useState, useEffect } from "react";
import { 
  Wifi, WifiOff, RefreshCw, AlertTriangle, Image as ImageIcon, CheckCircle2, 
  Trash, Play, Pause, Zap, Check, ChevronRight, Layers, FileText, Database, 
  Sparkles, ShieldAlert, Cpu, Eye, CloudLightning, HelpCircle, HardDrive, 
  ArrowUpRight, AlertCircle, RefreshCcw, Laptop, HardDriveDownload
} from "lucide-react";

// Types for Conflict Resolution
interface ConflictField {
  fieldName: string;
  label: string;
  deviceValue: string | number;
  cloudValue: string | number;
  selectedValue: "device" | "cloud" | "custom";
  customValue?: string | number;
}

interface SyncConflict {
  id: string;
  itemType: "Estimate" | "Project";
  recordId: string;
  title: string;
  lastUpdatedDevice: string; // e.g. "Estimator Sarah on-site"
  lastUpdatedCloud: string;  // e.g. "Admin Mike at Office HQ"
  deviceTimestamp: string;
  cloudTimestamp: string;
  fields: ConflictField[];
  resolved: boolean;
  resolvedWinner?: "device" | "cloud" | "merged";
}

// Types for Media Sync Queue
interface MediaFile {
  id: string;
  name: string;
  sizeBytes: number;
  compressedSize: number;
  isCompressed: boolean;
  progress: number; // 0 to 100
  status: "pending" | "compressing" | "uploading" | "paused" | "failed" | "completed";
  previewUrl: string;
  chunkCount: number;
  chunksUploaded: number;
  failedChunks: number[]; // indices of chunks that dropped and need retry
}

export default function OfflineSyncModule() {
  // Network simulation state
  const [networkState, setNetworkState] = useState<"wifi" | "spotty" | "offline">("spotty");
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [autoCompress, setAutoCompress] = useState(true);

  // Sound chime helper
  const playSyncChime = (type: "success" | "error" | "click") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220.00, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.12); // D3
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  // Seeding Conflicts
  const [conflicts, setConflicts] = useState<SyncConflict[]>([
    {
      id: "conf-1",
      itemType: "Estimate",
      recordId: "EST-4029",
      title: "Living Room Accent & Porch Prep",
      lastUpdatedDevice: "Estimator Sarah (iPad On-Site)",
      lastUpdatedCloud: "Admin Mike (Office Web-Console)",
      deviceTimestamp: "Today, 3:12 PM",
      cloudTimestamp: "Today, 3:15 PM",
      resolved: false,
      fields: [
        { fieldName: "value", label: "Quoted Price ($)", deviceValue: 4500, cloudValue: 4200, selectedValue: "device" },
        { fieldName: "materialTier", label: "Paint Premium Tier", deviceValue: "Ultra (Sherwin Emerald)", cloudValue: "Premium (Sherwin Duration)", selectedValue: "cloud" },
        { fieldName: "laborHours", label: "Target Labor Hours", deviceValue: 32, cloudValue: 24, selectedValue: "device" },
        { fieldName: "prepComplexity", label: "Prep Complexity Factor", deviceValue: "High (Lead scrapings)", cloudValue: "Medium (Standard wash)", selectedValue: "device" }
      ]
    },
    {
      id: "conf-2",
      itemType: "Project",
      recordId: "PROJ-808",
      title: "Historical Victorian Lead Encapsulation",
      lastUpdatedDevice: "Crew Lead Carlos (iPhone)",
      lastUpdatedCloud: "System Automated Webhook",
      deviceTimestamp: "Today, 1:40 PM",
      cloudTimestamp: "Today, 1:52 PM",
      resolved: false,
      fields: [
        { fieldName: "status", label: "Job Progress Phase", deviceValue: "On Hold (Moisture level > 18%)", cloudValue: "Active (Scheduled Start)", selectedValue: "device" },
        { fieldName: "margin", label: "SOP Margin Buffer", deviceValue: 38, cloudValue: 45, selectedValue: "cloud" },
        { fieldName: "crewAssigned", label: "On-Site Dispatch Crew", deviceValue: "Carlos + Mike + Apprentice", cloudValue: "Carlos Only", selectedValue: "device" }
      ]
    }
  ]);

  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(conflicts[0]);

  // Seeding Media Sync Queue
  const [mediaQueue, setMediaQueue] = useState<MediaFile[]>([
    {
      id: "med-1",
      name: "porch_rot_inspection_highres.jpg",
      sizeBytes: 6500000, // 6.5 MB
      compressedSize: 520000, // 520 KB
      isCompressed: true,
      progress: 0,
      status: "pending",
      previewUrl: "https://images.unsplash.com/photo-1595841696660-1d8c03996f61?auto=format&fit=crop&w=400&q=80",
      chunkCount: 20,
      chunksUploaded: 0,
      failedChunks: []
    },
    {
      id: "med-2",
      name: "victorian_west_trim_scraping_detail.jpg",
      sizeBytes: 8900000, // 8.9 MB
      compressedSize: 712000, // 712 KB
      isCompressed: false,
      progress: 0,
      status: "pending",
      previewUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
      chunkCount: 30,
      chunksUploaded: 0,
      failedChunks: []
    },
    {
      id: "med-3",
      name: "completed_living_room_coats_after.jpg",
      sizeBytes: 4200000, // 4.2 MB
      compressedSize: 340000, // 340 KB
      isCompressed: true,
      progress: 100,
      status: "completed",
      previewUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
      chunkCount: 15,
      chunksUploaded: 15,
      failedChunks: []
    }
  ]);

  // Sync logs terminal feed
  const [logs, setLogs] = useState<string[]>([
    "[17:30:12] Operational Database Sync initialized.",
    "[17:31:05] Warning: Connection entered low bandwidth limit (Simulating 3G Spotty).",
    "[17:32:15] Detected 2 un-synchronized conflicts originating from parallel offline saves."
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  // Change network state and trigger log feedback
  const handleNetworkChange = (state: "wifi" | "spotty" | "offline") => {
    playSyncChime("click");
    setNetworkState(state);
    if (state === "wifi") {
      addLog("Network status: High-Speed Wifi/5G restored. Uncapped media bandwidth.");
    } else if (state === "spotty") {
      addLog("Network status: Intermittent 3G Job-site active. 25% random chunk drop simulator active.");
    } else {
      addLog("Network status: Offline Mode. Parallel changes will lock into device IndexedDB storage.");
    }
  };

  // Run media upload simulation ticks
  useEffect(() => {
    if (networkState === "offline") {
      // Pause any active uploads if network turns offline
      setMediaQueue(prev => {
        const hasActive = prev.some(m => m.status === "uploading" || m.status === "compressing");
        if (!hasActive) return prev;
        return prev.map(m => {
          if (m.status === "uploading" || m.status === "compressing") {
            return { ...m, status: "failed" };
          }
          return m;
        });
      });
      return;
    }

    const hasActive = mediaQueue.some(m => m.status === "uploading" || m.status === "compressing");
    if (!hasActive) return;

    const interval = setInterval(() => {
      setMediaQueue(prev => {
        const activeUpload = prev.find(m => m.status === "uploading" || m.status === "compressing");
        if (!activeUpload) return prev;

        return prev.map(item => {
          if (item.id !== activeUpload.id) return item;

          // Handle browser-side image compression simulator first
          if (item.status === "compressing") {
            const nextIsCompressed = true;
            addLog(`Compressed ${item.name} from ${(item.sizeBytes / 1024 / 1024).toFixed(1)}MB to ${(item.compressedSize / 1024).toFixed(0)}KB (92% saved)`);
            return {
              ...item,
              isCompressed: nextIsCompressed,
              status: "uploading",
              progress: 5
            };
          }

          if (item.status === "uploading") {
            const currentChunk = item.chunksUploaded;
            const totalChunks = item.chunkCount;

            // Check if we reached the end
            if (currentChunk >= totalChunks) {
              playSyncChime("success");
              addLog(`Success: Media file ${item.name} synced fully to the cloud bucket!`);
              return {
                ...item,
                status: "completed",
                progress: 100,
                chunksUploaded: totalChunks
              };
            }

            // Determine simulation speed based on wifi vs spotty 3G
            let chunkStep = 1;
            let isPacketDrop = false;

            if (networkState === "spotty") {
              // Simulate 20% drop on spotty network
              isPacketDrop = Math.random() < 0.22;
            }

            if (isPacketDrop) {
              const nextFailedChunks = [...item.failedChunks, currentChunk];
              addLog(`⚠️ Packet Drop! Chunk #${currentChunk + 1} of ${totalChunks} failed over spotty 3G. Retrying instantly...`);
              return {
                ...item,
                failedChunks: nextFailedChunks,
                // Don't advance chunk index on packet drop
              };
            } else {
              const nextChunks = Math.min(totalChunks, currentChunk + chunkStep);
              const nextProgress = Math.round((nextChunks / totalChunks) * 100);
              
              // If it was previously failed, clear the fail flag for that index
              const nextFailed = item.failedChunks.filter(c => c !== currentChunk);

              return {
                ...item,
                chunksUploaded: nextChunks,
                progress: nextProgress,
                failedChunks: nextFailed
              };
            }
          }

          return item;
        });
      });
    }, 700);

    return () => {
      clearInterval(interval);
    };
  }, [networkState, mediaQueue.map(m => m.status).join(",")]);

  // Start syncing a media queue item
  const handleStartMediaSync = (id: string) => {
    if (networkState === "offline") {
      playSyncChime("error");
      addLog("Cannot sync media: No internet connection! Please switch network to Online/Spotty.");
      return;
    }

    playSyncChime("click");
    setMediaQueue(prev => prev.map(m => {
      if (m.id === id) {
        addLog(`Initiated photo sync flow for ${m.name}`);
        const needsCompression = autoCompress && !m.isCompressed;
        return {
          ...m,
          status: needsCompression ? "compressing" : "uploading",
          progress: needsCompression ? 0 : 5,
          chunksUploaded: 0,
          failedChunks: []
        };
      }
      return m;
    }));
  };

  // Pause a media queue item
  const handlePauseMediaSync = (id: string) => {
    playSyncChime("click");
    setMediaQueue(prev => prev.map(m => {
      if (m.id === id) {
        addLog(`Paused sync stream for ${m.name}`);
        return { ...m, status: "paused" };
      }
      return m;
    }));
  };

  // Add new simulated photo to the queue
  const handleAddNewPhotoToQueue = () => {
    const randomPhotos = [
      { name: "prep_dustless_sanding_cabinet.jpg", size: 7300000, compressedSize: 580000, preview: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80" },
      { name: "deck_sealer_waterproofing_before.jpg", size: 9500000, compressedSize: 780000, preview: "https://images.unsplash.com/photo-1595841696660-1d8c03996f61?auto=format&fit=crop&w=400&q=80" },
      { name: "historical_trim_glaze_coat.jpg", size: 5800000, compressedSize: 490000, preview: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80" }
    ];

    const pick = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
    const newId = "med-" + Date.now();
    const newFile: MediaFile = {
      id: newId,
      name: pick.name,
      sizeBytes: pick.size,
      compressedSize: pick.compressedSize,
      isCompressed: false,
      progress: 0,
      status: "pending",
      previewUrl: pick.preview,
      chunkCount: 22,
      chunksUploaded: 0,
      failedChunks: []
    };

    setMediaQueue(prev => [newFile, ...prev]);
    addLog(`📸 Captured new on-site photo: ${pick.name} (${(pick.size / 1024 / 1024).toFixed(1)} MB). Stored in local cache queue.`);
    playSyncChime("success");
  };

  // Handle Field Selection for Conflict Resolution
  const handleSelectConflictField = (conflictId: string, fieldName: string, source: "device" | "cloud" | "custom", customVal?: any) => {
    playSyncChime("click");
    setConflicts(prev => prev.map(c => {
      if (c.id !== conflictId) return c;
      const updatedFields = c.fields.map(f => {
        if (f.fieldName !== fieldName) return f;
        return {
          ...f,
          selectedValue: source,
          customValue: customVal !== undefined ? customVal : f.customValue
        };
      });
      return { ...c, fields: updatedFields };
    }));

    // Stay updated on the selectedConflict screen state
    setTimeout(() => {
      setSelectedConflict(prev => {
        if (!prev || prev.id !== conflictId) return prev;
        const updatedFields = prev.fields.map(f => {
          if (f.fieldName !== fieldName) return f;
          return {
            ...f,
            selectedValue: source,
            customValue: customVal !== undefined ? customVal : f.customValue
          };
        });
        return { ...prev, fields: updatedFields };
      });
    }, 10);
  };

  // Perform Final Conflict Resolution Commit
  const handleResolveConflictCommit = (conflictId: string) => {
    const target = conflicts.find(c => c.id === conflictId);
    if (!target) return;

    // Compile resolved data
    const resolvedPayload: any = {};
    target.fields.forEach(f => {
      if (f.selectedValue === "device") {
        resolvedPayload[f.fieldName] = f.deviceValue;
      } else if (f.selectedValue === "cloud") {
        resolvedPayload[f.fieldName] = f.cloudValue;
      } else {
        resolvedPayload[f.fieldName] = f.customValue || f.deviceValue;
      }
    });

    playSyncChime("success");
    addLog(`Resolved: Conflict for ${target.itemType} ${target.recordId} successfully merged. Resolved fields written securely to both cloud storage & local device DB.`);
    
    // Mark conflict as resolved
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, resolved: true, resolvedWinner: "merged" };
      }
      return c;
    }));

    // Clear selected state
    setSelectedConflict(null);
  };

  // Quick action: Accept all local changes or cloud changes instantly
  const handleInstantResolveAll = (conflictId: string, winner: "device" | "cloud") => {
    playSyncChime("success");
    const target = conflicts.find(c => c.id === conflictId);
    if (!target) return;

    addLog(`Instant Override: Accepted all fields from ${winner === "device" ? "Device A" : "Cloud B"} for ${target.itemType} ${target.recordId}.`);
    
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { 
          ...c, 
          resolved: true, 
          resolvedWinner: winner,
          fields: c.fields.map(f => ({ ...f, selectedValue: winner })) 
        };
      }
      return c;
    }));

    setSelectedConflict(null);
  };

  // Master synchronization trigger
  const handleTriggerGlobalSync = () => {
    if (networkState === "offline") {
      playSyncChime("error");
      addLog("Global Sync aborted: Device is in Cave Mode (Offline). Turn on connectivity to push updates.");
      return;
    }

    setIsSyncingAll(true);
    addLog("⚡ Executing Master Cloud-to-Device Sync Pipeline...");
    playSyncChime("click");

    setTimeout(() => {
      // Auto-upload any pending media
      setMediaQueue(prev => prev.map(m => {
        if (m.status === "pending" || m.status === "failed") {
          return { ...m, status: autoCompress && !m.isCompressed ? "compressing" : "uploading" };
        }
        return m;
      }));

      setIsSyncingAll(false);
      addLog("✓ Local client storage schema matched 100% to Cloud DB. All offline metadata queued and running.");
    }, 1500);
  };

  return (
    <div className="space-y-8 text-white font-sans text-left" id="offline-sync-root">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/10 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
              High-Fidelity Offline Engine
            </span>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 uppercase ${
              networkState === "wifi" ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" :
              networkState === "spotty" ? "bg-amber-950/40 text-amber-400 border-amber-500/20" :
              "bg-red-950/40 text-red-400 border-red-500/20"
            }`}>
              {networkState === "wifi" ? <Wifi className="h-3 w-3 animate-pulse" /> : 
               networkState === "spotty" ? <CloudLightning className="h-3 w-3 text-amber-400 animate-bounce" /> : 
               <WifiOff className="h-3 w-3" />}
              {networkState === "wifi" ? "Perfect Wifi (5G)" :
               networkState === "spotty" ? "Spotty Job-Site (3G)" : "Cave Mode (Offline)"}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif tracking-tight text-white mt-1">Smart Conflict Resolution & Photo Sync</h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
            Contractors suffer from zero service in crawlspaces or remote historic properties. Resolve multi-device sync collisions and stream large job photos dynamically using micro-packet retries.
          </p>
        </div>

        {/* Global Sync Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button 
            onClick={handleTriggerGlobalSync}
            disabled={isSyncingAll}
            className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-orange-500/15"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span>{isSyncingAll ? "Synchronizing..." : "Trigger Global Sync"}</span>
          </button>
        </div>
      </div>

      {/* Network simulator controls panel */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/15">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Network Bandwidth Simulator</h4>
            <p className="text-[11px] text-slate-400">Shift connectivity status manually to preview how the app automatically queues and recovers data.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => handleNetworkChange("wifi")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              networkState === "wifi" ? "bg-orange-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>Perfect 5G</span>
          </button>
          <button
            onClick={() => handleNetworkChange("spotty")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              networkState === "spotty" ? "bg-orange-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <CloudLightning className="h-3.5 w-3.5" />
            <span>Spotty 3G (22% Drop)</span>
          </button>
          <button
            onClick={() => handleNetworkChange("offline")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              networkState === "offline" ? "bg-orange-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <WifiOff className="h-3.5 w-3.5" />
            <span>Cave Mode (Offline)</span>
          </button>
        </div>
      </div>

      {/* Main split grid: Left = Conflict Desk, Right = Photo Stream Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Deep Conflict resolution desk (8 cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">Data Sync Desk</span>
                <h3 className="text-base font-bold text-white font-serif mt-0.5">Bid Edit Collision Control</h3>
              </div>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20 px-2.5 py-1 rounded-full font-extrabold">
                {conflicts.filter(c => !c.resolved).length} Unresolved Collisions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 items-stretch min-h-[420px]">
              
              {/* Conflict selector menu (4 cols) */}
              <div className="md:col-span-4 p-3.5 space-y-2 bg-slate-950/20 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-black block px-1">COLLISION QUEUE</span>
                  
                  {conflicts.map(c => (
                    <div
                      key={c.id}
                      onClick={() => !c.resolved && setSelectedConflict(c)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition relative ${
                        c.resolved 
                          ? "bg-slate-900/30 border-slate-850 opacity-60" 
                          : selectedConflict?.id === c.id
                          ? "bg-slate-850 border-orange-500/30 text-white" 
                          : "bg-slate-900/50 border-slate-850 hover:bg-slate-850/50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          {c.itemType}
                        </span>
                        {c.resolved ? (
                          <span className="text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="h-2 w-2" />
                            SYNCED
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-white truncate mt-1.5">{c.recordId}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.title}</p>
                    </div>
                  ))}
                </div>

                {/* Local storage status indicators */}
                <div className="bg-slate-900/85 p-3 rounded-xl border border-slate-850 space-y-2 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>IndexedDB Store:</span>
                    <strong className="text-white">Active</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache payload:</span>
                    <strong className="text-orange-400">12.5 KB</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 text-[9px]">
                    <span>Last local commit:</span>
                    <span className="text-slate-500">2 mins ago</span>
                  </div>
                </div>
              </div>

              {/* Conflict resolution details (8 cols) */}
              <div className="md:col-span-8 p-5 flex flex-col justify-between">
                {selectedConflict ? (
                  <div className="space-y-4">
                    
                    {/* Header meta */}
                    <div className="border-b border-slate-800 pb-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono font-bold">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>COLLISION DETECTED ON RECORD: {selectedConflict.recordId}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white mt-1">{selectedConflict.title}</h4>
                      <p className="text-[10px] text-slate-500">
                        Two distinct versions were created offline. Field-by-field differences mapped below. Choose which payload to commit.
                      </p>
                    </div>

                    {/* Field-by-field diff comparison table */}
                    <div className="space-y-2.5">
                      
                      {/* Column label row */}
                      <div className="grid grid-cols-12 gap-2 text-[8px] font-mono font-extrabold text-slate-500 uppercase tracking-wider pb-1">
                        <div className="col-span-4">FIELD COMPARISON</div>
                        <div className="col-span-4">DEVICE A (ON-SITE)</div>
                        <div className="col-span-4">CLOUD B (OFFICE HQ)</div>
                      </div>

                      {/* Fields */}
                      {selectedConflict.fields.map(field => {
                        const isDeviceSelected = field.selectedValue === "device";
                        const isCloudSelected = field.selectedValue === "cloud";
                        
                        return (
                          <div 
                            key={field.fieldName}
                            className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/80 grid grid-cols-12 gap-2 items-center text-xs hover:border-slate-800 transition"
                          >
                            <div className="col-span-4 text-left">
                              <span className="block font-bold text-white text-[11px]">{field.label}</span>
                              <span className="font-mono text-[8px] text-slate-500 uppercase">{field.fieldName}</span>
                            </div>

                            {/* Device A Value Choice */}
                            <button
                              type="button"
                              onClick={() => handleSelectConflictField(selectedConflict.id, field.fieldName, "device")}
                              className={`col-span-4 p-2 rounded-lg text-left border transition text-[10px] sm:text-xs overflow-hidden truncate ${
                                isDeviceSelected 
                                  ? "bg-orange-500/10 border-orange-500/40 text-orange-300 font-extrabold" 
                                  : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                <span className="text-[8px] text-slate-500 uppercase font-mono">Device A</span>
                              </div>
                              <span className="font-mono">{field.deviceValue}</span>
                            </button>

                            {/* Cloud B Value Choice */}
                            <button
                              type="button"
                              onClick={() => handleSelectConflictField(selectedConflict.id, field.fieldName, "cloud")}
                              className={`col-span-4 p-2 rounded-lg text-left border transition text-[10px] sm:text-xs overflow-hidden truncate ${
                                isCloudSelected 
                                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-extrabold" 
                                  : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span className="text-[8px] text-slate-500 uppercase font-mono">Cloud B</span>
                              </div>
                              <span className="font-mono">{field.cloudValue}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Instant Overrides & Meta timestamps */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-400 font-mono">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-850/80 space-y-0.5">
                        <span className="text-slate-500 block text-[8px] uppercase font-bold">Device Saved Timestamp:</span>
                        <span className="text-slate-300 font-bold">{selectedConflict.deviceTimestamp}</span>
                        <span className="text-[8px] text-slate-500 block truncate">{selectedConflict.lastUpdatedDevice}</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-850/80 space-y-0.5">
                        <span className="text-slate-500 block text-[8px] uppercase font-bold">Cloud Saved Timestamp:</span>
                        <span className="text-slate-300 font-bold">{selectedConflict.cloudTimestamp}</span>
                        <span className="text-[8px] text-slate-500 block truncate">{selectedConflict.lastUpdatedCloud}</span>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                      
                      {/* Batch Overrides */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleInstantResolveAll(selectedConflict.id, "device")}
                          className="flex-1 sm:flex-none text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-850 text-orange-400 border border-orange-500/20 py-1.5 px-2.5 rounded-lg transition"
                        >
                          Accept Device A Fully
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInstantResolveAll(selectedConflict.id, "cloud")}
                          className="flex-1 sm:flex-none text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-indigo-500/20 py-1.5 px-2.5 rounded-lg transition"
                        >
                          Accept Cloud B Fully
                        </button>
                      </div>

                      {/* Solve action */}
                      <button
                        type="button"
                        onClick={() => handleResolveConflictCommit(selectedConflict.id)}
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-2 px-5 rounded-xl transition flex items-center justify-center gap-1 shadow-lg shadow-orange-500/15"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Commit Resolved Merge</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-12 space-y-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Check className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white">All Data Collisions Resolved!</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Any other data changes will synchronize automatically under your active network rules. Select another record if available.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Local storage / database admin metrics diagnostics */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Database className="h-4 w-4 text-orange-400" />
              <span>Offline Cache Diagnostic Health</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[9px] font-mono uppercase font-bold">Unsynced Edits</span>
                <strong className="text-white text-base font-mono">0</strong>
                <span className="text-[8px] text-emerald-400 block mt-0.5">Clean Cache</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[9px] font-mono uppercase font-bold">Media in Queue</span>
                <strong className="text-white text-base font-mono">
                  {mediaQueue.filter(m => m.status !== "completed").length} Files
                </strong>
                <span className="text-[8px] text-orange-400 block mt-0.5">Pending upload</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[9px] font-mono uppercase font-bold">Retry Fail Limit</span>
                <strong className="text-white text-base font-mono">5 Attempts</strong>
                <span className="text-[8px] text-slate-500 block mt-0.5">Exponential backoff</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[9px] font-mono uppercase font-bold">Conflict State</span>
                <strong className="text-white text-base font-mono">
                  {conflicts.filter(c => !c.resolved).length} Pending
                </strong>
                <span className="text-[8px] text-red-400 block mt-0.5">Requires resolution</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Spotty Media Photo Sync (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block">Media Pipeline</span>
                <h3 className="text-base font-bold text-white font-serif mt-0.5">Job-Site Photo Sync</h3>
              </div>

              {/* Compression Toggle option */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[8px] font-mono font-bold text-slate-500 pl-2 uppercase">Auto-Compress</span>
                <button
                  type="button"
                  onClick={() => setAutoCompress(!autoCompress)}
                  className={`w-9 h-5 rounded-full transition relative ${
                    autoCompress ? "bg-orange-500" : "bg-slate-800"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    autoCompress ? "right-0.5" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Job-site photos verify lead containment and final coating QA. Uploading raw 8MB photos over spotty connections is impossible. Compression and chunked micro-packet streams bypass connection drops.
            </p>

            {/* Media items container list */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {mediaQueue.map(media => {
                const isUploading = media.status === "uploading";
                const isCompleted = media.status === "completed";
                const isFailed = media.status === "failed";
                const isCompressing = media.status === "compressing";

                return (
                  <div 
                    key={media.id}
                    className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-3 hover:border-slate-800 transition text-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Image Preview & Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
                          {media.previewUrl ? (
                            <img 
                              src={media.previewUrl} 
                              alt="Job-Site Preview" 
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div className="text-left min-w-0">
                          <h4 className="font-bold text-white text-xs truncate max-w-[140px] sm:max-w-[180px]">{media.name}</h4>
                          <p className="text-[10px] font-mono text-slate-500">
                            {media.isCompressed ? (
                              <span className="text-emerald-400 font-bold">
                                Compressed to {(media.compressedSize / 1024).toFixed(0)} KB ({(media.sizeBytes / 1024 / 1024).toFixed(1)} MB Original)
                              </span>
                            ) : (
                              <span>{(media.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isUploading && (
                          <button
                            onClick={() => handlePauseMediaSync(media.id)}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-300 p-2 rounded-lg border border-slate-800"
                            title="Pause Sync Stream"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {(media.status === "pending" || media.status === "paused" || isFailed) && (
                          <button
                            onClick={() => handleStartMediaSync(media.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg"
                            title="Start Sync Stream"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-emerald-400 font-mono text-[9px] font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>SYNCED</span>
                          </span>
                        )}
                        {isCompressing && (
                          <span className="text-orange-400 font-mono text-[9px] font-bold bg-orange-950/40 border border-orange-500/20 px-2 py-1 rounded animate-pulse">
                            COMPRESSING...
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Progress tracking bar */}
                    {!isCompleted && media.status !== "pending" && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            {isCompressing ? "Local browser compression run..." : `Syncing Packets: ${media.chunksUploaded}/${media.chunkCount} sent`}
                          </span>
                          <span className="font-bold text-white">{media.progress}%</span>
                        </div>
                        
                        {/* Progressive visual bar */}
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              isFailed ? "bg-red-500" : isCompressing ? "bg-orange-400 animate-pulse" : "bg-orange-500"
                            }`}
                            style={{ width: `${media.progress}%` }}
                          />
                        </div>

                        {/* HIGH TECHNICAL FIDELITY: Interactive Chunk Packet Grid */}
                        {isUploading && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">
                              Live Segment Streams (Packet View):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {Array.from({ length: media.chunkCount }).map((_, idx) => {
                                const isSent = idx < media.chunksUploaded;
                                const isCurrent = idx === media.chunksUploaded;
                                const isDropped = media.failedChunks.includes(idx);

                                return (
                                  <span 
                                    key={idx}
                                    className={`w-3.5 h-3.5 rounded-sm border transition-all text-[8px] font-mono font-bold flex items-center justify-center ${
                                      isSent 
                                        ? "bg-orange-500/20 border-orange-500 text-orange-400" 
                                        : isDropped 
                                        ? "bg-red-950 border-red-500 text-red-400 animate-pulse"
                                        : isCurrent 
                                        ? "bg-white border-white text-slate-950 animate-ping"
                                        : "bg-slate-900 border-slate-800 text-slate-700"
                                    }`}
                                    title={`Packet Chunk #${idx + 1}`}
                                  >
                                    {isDropped ? "!" : idx + 1}
                                  </span>
                                );
                              })}
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 block mt-0.5">
                              * White node active. Red signifies spotty drops with instant auto-retry protocols.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between gap-2.5">
              <button
                onClick={handleAddNewPhotoToQueue}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="h-4 w-4 text-orange-400 animate-pulse" />
                <span>Simulate Camera Photo Upload</span>
              </button>
            </div>

          </div>

          {/* Sync logging feed terminal style */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-widest">
                Local Database Sync Log
              </h4>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] font-mono text-slate-500 hover:text-slate-300 transition"
              >
                Clear Terminal
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 overflow-y-auto font-mono text-[10px] space-y-1.5 text-left text-orange-400">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-slate-900 pb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-700 text-center py-6">Terminal empty. Waiting for network sync operations...</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
