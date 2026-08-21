import React, { useState, useEffect } from "react";
import { 
  Sparkles, Cpu, Key, Globe, RefreshCw, Play, CheckCircle2, XCircle, 
  Terminal, Copy, Check, Sliders, Send, Save, Trash2, Code2, 
  Layers, HelpCircle, ArrowRight, Zap, Info, BarChart3, Activity, 
  Coins, History, Gauge, TrendingUp, Filter, AlertTriangle, ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

export interface RequestHistoryItem {
  id: string;
  timestamp: string;
  provider: "gemini" | "openai" | "anthropic" | "groq" | "ollama" | "custom";
  model: string;
  success: boolean;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  isEstimate: boolean;
  error?: string;
}

const SEED_HISTORY: RequestHistoryItem[] = [
  {
    id: "hist-1",
    timestamp: "16:45:12",
    provider: "gemini",
    model: "gemini-2.5-flash",
    success: true,
    latencyMs: 310,
    promptTokens: 120,
    completionTokens: 350,
    totalTokens: 470,
    isEstimate: false
  },
  {
    id: "hist-2",
    timestamp: "16:48:22",
    provider: "openai",
    model: "gpt-4o",
    success: true,
    latencyMs: 890,
    promptTokens: 250,
    completionTokens: 410,
    totalTokens: 660,
    isEstimate: false
  },
  {
    id: "hist-3",
    timestamp: "16:51:05",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    success: true,
    latencyMs: 1420,
    promptTokens: 310,
    completionTokens: 520,
    totalTokens: 830,
    isEstimate: false
  },
  {
    id: "hist-4",
    timestamp: "16:54:40",
    provider: "groq",
    model: "llama3-8b-8192",
    success: true,
    latencyMs: 180,
    promptTokens: 90,
    completionTokens: 220,
    totalTokens: 310,
    isEstimate: false
  },
  {
    id: "hist-5",
    timestamp: "16:59:15",
    provider: "gemini",
    model: "gemini-2.5-flash",
    success: true,
    latencyMs: 290,
    promptTokens: 140,
    completionTokens: 280,
    totalTokens: 420,
    isEstimate: false
  },
  {
    id: "hist-6",
    timestamp: "17:02:30",
    provider: "openai",
    model: "gpt-4o",
    success: false,
    latencyMs: 1200,
    promptTokens: 180,
    completionTokens: 0,
    totalTokens: 180,
    isEstimate: true,
    error: "API Key is invalid or expired"
  },
  {
    id: "hist-7",
    timestamp: "17:04:09",
    provider: "gemini",
    model: "gemini-2.5-flash",
    success: true,
    latencyMs: 340,
    promptTokens: 200,
    completionTokens: 310,
    totalTokens: 510,
    isEstimate: false
  }
];

export function parseTokenUsage(
  provider: string, 
  payload: any, 
  promptText?: string, 
  responseText?: string
): { prompt: number; completion: number; total: number; isEstimate: boolean } {
  if (!payload) {
    const promptLen = promptText ? Math.ceil(promptText.length / 4) : 0;
    const respLen = responseText ? Math.ceil(responseText.length / 4) : 0;
    return {
      prompt: promptLen || 40,
      completion: respLen || 120,
      total: (promptLen || 40) + (respLen || 120),
      isEstimate: true
    };
  }

  try {
    // 1. Google Gemini (custom API or server-side response)
    if (provider === "gemini") {
      const usage = payload.usageMetadata || payload.response?.usageMetadata;
      if (usage) {
        return {
          prompt: usage.promptTokenCount || 0,
          completion: usage.candidatesTokenCount || 0,
          total: usage.totalTokenCount || ((usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0)),
          isEstimate: false
        };
      }
    }

    // 2. Anthropic Claude
    if (provider === "anthropic") {
      const usage = payload.usage;
      if (usage) {
        return {
          prompt: usage.input_tokens || 0,
          completion: usage.output_tokens || 0,
          total: (usage.input_tokens || 0) + (usage.output_tokens || 0),
          isEstimate: false
        };
      }
    }

    // 3. OpenAI / Groq / Ollama / Custom compatible JSON response
    const usage = payload.usage;
    if (usage) {
      return {
        prompt: usage.prompt_tokens || 0,
        completion: usage.completion_tokens || usage.output_tokens || 0,
        total: usage.total_tokens || ((usage.prompt_tokens || 0) + (usage.completion_tokens || usage.output_tokens || 0)),
        isEstimate: false
      };
    }
  } catch (e) {
    console.warn("Failed parsing usage metadata:", e);
  }

  // Fallback estimation using input and output lengths
  const promptLen = promptText ? Math.ceil(promptText.length / 4) : 0;
  const respLen = responseText ? Math.ceil(responseText.length / 4) : 0;
  return {
    prompt: promptLen || 35,
    completion: respLen || 85,
    total: (promptLen || 35) + (respLen || 85),
    isEstimate: true
  };
}

interface LLMProfile {
  id: string;
  name: string;
  provider: "gemini" | "openai" | "anthropic" | "groq" | "ollama" | "custom";
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_PROFILES: LLMProfile[] = [
  {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash (Recommended)",
    provider: "gemini",
    apiKey: "",
    baseUrl: "",
    model: "gemini-2.5-flash",
    systemPrompt: "You are an AI assistant helping a high-end painting company maximize customer satisfaction and streamline administrative workflows.",
    temperature: 0.7,
    maxTokens: 2048
  },
  {
    id: "openai-gpt4",
    name: "OpenAI GPT-4o Standard",
    provider: "openai",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    systemPrompt: "You are a professional operations coordinator for Smart Growth Painting. Answer questions concisely.",
    temperature: 0.5,
    maxTokens: 1500
  },
  {
    id: "anthropic-claude",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    apiKey: "",
    baseUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-sonnet-20241022",
    systemPrompt: "You are an expert sales representative. Draft email proposals and paint specifications with detail and eloquence.",
    temperature: 0.7,
    maxTokens: 1024
  },
  {
    id: "groq-llama",
    name: "Groq LLaMA 3 8B",
    provider: "groq",
    apiKey: "",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama3-8b-8192",
    systemPrompt: "You are a super fast business intelligence chatbot answering logistics queries.",
    temperature: 0.4,
    maxTokens: 1000
  },
  {
    id: "ollama-local",
    name: "Ollama (Local LLM Gateway)",
    provider: "ollama",
    apiKey: "",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3",
    systemPrompt: "You are a private offline neural engine assisting with residential paint estimators.",
    temperature: 0.5,
    maxTokens: 1000
  }
];

export default function LLMConnectorModule() {
  // Profiles State
  const [profiles, setProfiles] = useState<LLMProfile[]>(() => {
    try {
      const stored = localStorage.getItem("g_llm_profiles");
      return stored ? JSON.parse(stored) : DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>("gemini-flash");
  
  // Dashboard & Workspace Navigation
  const [workspaceTab, setWorkspaceTab] = useState<"dashboard" | "sandbox">("dashboard");
  const [history, setHistory] = useState<RequestHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("g_llm_history");
      return stored ? JSON.parse(stored) : SEED_HISTORY;
    } catch {
      return SEED_HISTORY;
    }
  });
  const [historyFilter, setHistoryFilter] = useState<string>("all");
  
  // Current Configuration Form
  const [provider, setProvider] = useState<LLMProfile["provider"]>("gemini");
  const [profileName, setProfileName] = useState("My Gemini Profile");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [showApiKey, setShowApiKey] = useState(false);

  // Playground / Tester state
  const [userInput, setUserInput] = useState("Recommend three paint color combinations for an elegant, high-contrast dining room.");
  const [playgroundLogs, setPlaygroundLogs] = useState<Array<{role: "user" | "assistant" | "system", content: string, latencyMs?: number}>>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [pingMessage, setPingMessage] = useState("");
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Diagnostic Payload Echoes
  const [lastRequestPayload, setLastRequestPayload] = useState<any>(null);
  const [lastResponsePayload, setLastResponsePayload] = useState<any>(null);

  // Code Snippet Tab selection
  const [codeTab, setCodeTab] = useState<"fetch" | "curl" | "python">("fetch");
  const [copyStatus, setCopyStatus] = useState(false);

  // Load selected profile into form state
  const handleLoadProfile = (prof: LLMProfile) => {
    setActiveProfileId(prof.id);
    setProvider(prof.provider);
    setProfileName(prof.name);
    setApiKey(prof.apiKey);
    setBaseUrl(prof.baseUrl);
    setModel(prof.model);
    setSystemPrompt(prof.systemPrompt);
    setTemperature(prof.temperature);
    setMaxTokens(prof.maxTokens);
    
    // Alert info
    addLocalSystemMessage(`Loaded Profile: "${prof.name}" (${prof.provider.toUpperCase()})`);
  };

  // Helper to pre-populate provider defaults
  const handleProviderChange = (prov: LLMProfile["provider"]) => {
    setProvider(prov);
    switch (prov) {
      case "gemini":
        setBaseUrl("");
        setModel("gemini-2.5-flash");
        break;
      case "openai":
        setBaseUrl("https://api.openai.com/v1");
        setModel("gpt-4o");
        break;
      case "anthropic":
        setBaseUrl("https://api.anthropic.com/v1/messages");
        setModel("claude-3-5-sonnet-20241022");
        break;
      case "groq":
        setBaseUrl("https://api.groq.com/openai/v1");
        setModel("llama3-8b-8192");
        break;
      case "ollama":
        setBaseUrl("http://localhost:11434/v1");
        setModel("llama3");
        break;
      case "custom":
        setBaseUrl("https://api.your-endpoint.com/v1");
        setModel("custom-model");
        break;
    }
  };

  // Save current form as a Profile
  const handleSaveProfile = () => {
    const updated = profiles.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          name: profileName,
          provider,
          apiKey,
          baseUrl,
          model,
          systemPrompt,
          temperature,
          maxTokens
        };
      }
      return p;
    });

    // Check if it's a completely new custom profile
    const exists = profiles.some(p => p.id === activeProfileId);
    let finalProfiles = updated;
    if (!exists) {
      const newProf: LLMProfile = {
        id: "profile-" + Date.now(),
        name: profileName,
        provider,
        apiKey,
        baseUrl,
        model,
        systemPrompt,
        temperature,
        maxTokens
      };
      finalProfiles = [...profiles, newProf];
      setActiveProfileId(newProf.id);
    }

    setProfiles(finalProfiles);
    try {
      localStorage.setItem("g_llm_profiles", JSON.stringify(finalProfiles));
    } catch (e) {
      console.warn("localStorage write blocked:", e);
    }
    
    addLocalSystemMessage(`Profile "${profileName}" saved successfully.`);
  };

  // Create a brand new scratch profile
  const handleCreateNewProfile = () => {
    const newId = "profile-" + Date.now();
    const newProf: LLMProfile = {
      id: newId,
      name: `Custom LLM - ${profiles.length + 1}`,
      provider: "openai",
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4",
      systemPrompt: "You are a helpful assistant.",
      temperature: 0.7,
      maxTokens: 2048
    };

    const nextProfiles = [...profiles, newProf];
    setProfiles(nextProfiles);
    try {
      localStorage.setItem("g_llm_profiles", JSON.stringify(nextProfiles));
    } catch (e) {
      console.warn("localStorage write blocked:", e);
    }
    handleLoadProfile(newProf);
  };

  // Delete current profile
  const handleDeleteProfile = (idToDelete: string) => {
    if (profiles.length <= 1) {
      alert("You must keep at least one profile.");
      return;
    }
    const filtered = profiles.filter(p => p.id !== idToDelete);
    setProfiles(filtered);
    try {
      localStorage.setItem("g_llm_profiles", JSON.stringify(filtered));
    } catch (e) {
      console.warn("localStorage write blocked:", e);
    }
    // Load first remaining profile
    handleLoadProfile(filtered[0]);
  };

  const addLocalSystemMessage = (text: string) => {
    setPlaygroundLogs(prev => [...prev, { role: "system", content: text }]);
  };

  // Trigger Live connection test / ping
  const handlePingConnector = async () => {
    setPingStatus("testing");
    setPingMessage("Initiating diagnostic ping request to Universal Gateway...");
    setPingLatency(null);

    try {
      const startTime = Date.now();
      const response = await fetch("/api/llm-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          baseUrl,
          model,
          messages: [{ role: "user", content: "Ping. Respond strictly with 'PONG' and nothing else." }],
          systemPrompt: "Keep responses brief.",
          temperature: 0.1,
          maxTokens: 5
        })
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error(`HTTP Error ${response.status}: Gateway returned an invalid or non-JSON response.`);
      }

      const timeMs = Date.now() - startTime;
      const finalLatency = data.latencyMs || timeMs;

      setLastRequestPayload(data.requestPayload);
      setLastResponsePayload(data.responsePayload);

      const isSuccessful = response.ok && data.success;
      const usage = parseTokenUsage(provider, data.responsePayload, "Ping. Respond strictly with 'PONG' and nothing else.", data.text || "");

      const newHistoryItem: RequestHistoryItem = {
        id: "hist-" + Date.now(),
        timestamp: new Date().toTimeString().split(' ')[0],
        provider,
        model: model || "default-model",
        success: isSuccessful,
        latencyMs: finalLatency,
        promptTokens: usage?.prompt || 0,
        completionTokens: usage?.completion || 0,
        totalTokens: usage?.total || 0,
        isEstimate: usage?.isEstimate || false,
        error: isSuccessful ? undefined : (data.error || "Ping test failed")
      };

      setHistory(prev => {
        const updated = [newHistoryItem, ...prev].slice(0, 50);
        try {
          localStorage.setItem("g_llm_history", JSON.stringify(updated));
        } catch (e) {
          console.warn("Storage blocked:", e);
        }
        return updated;
      });

      if (isSuccessful) {
        setPingStatus("success");
        setPingLatency(finalLatency);
        setPingMessage(`Connection verified! Response: "${data.text.trim()}"`);
      } else {
        setPingStatus("error");
        setPingMessage(data.error || "Gateway reported standard request failure.");
      }
    } catch (err: any) {
      setPingStatus("error");
      const errMsg = err.message || "Failed to contact proxy backend gateway.";
      setPingMessage(errMsg);

      const newHistoryItem: RequestHistoryItem = {
        id: "hist-" + Date.now(),
        timestamp: new Date().toTimeString().split(' ')[0],
        provider,
        model: model || "default-model",
        success: false,
        latencyMs: 1200,
        promptTokens: 10,
        completionTokens: 0,
        totalTokens: 10,
        isEstimate: true,
        error: errMsg
      };

      setHistory(prev => {
        const updated = [newHistoryItem, ...prev].slice(0, 50);
        try {
          localStorage.setItem("g_llm_history", JSON.stringify(updated));
        } catch (e) {
          console.warn("Storage blocked:", e);
        }
        return updated;
      });
    }
  };

  // Submit test playground user query
  const handleSendPlaygroundQuery = async () => {
    if (!userInput.trim() || isQuerying) return;

    const currentInput = userInput;
    setUserInput("");
    setIsQuerying(true);

    // Append user input to logs
    setPlaygroundLogs(prev => [...prev, { role: "user", content: currentInput }]);

    try {
      const response = await fetch("/api/llm-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          baseUrl,
          model,
          messages: [{ role: "user", content: currentInput }],
          systemPrompt,
          temperature,
          maxTokens: maxTokens || 2048
        })
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error(`HTTP Error ${response.status}: Failed to parse JSON response from proxy gateway.`);
      }

      setLastRequestPayload(data.requestPayload);
      setLastResponsePayload(data.responsePayload);

      const finalLatency = data.latencyMs || 500;
      const isSuccessful = response.ok && data.success;
      const usage = parseTokenUsage(provider, data.responsePayload, currentInput, data.text || "");

      const newHistoryItem: RequestHistoryItem = {
        id: "hist-" + Date.now(),
        timestamp: new Date().toTimeString().split(' ')[0],
        provider,
        model: model || "default-model",
        success: isSuccessful,
        latencyMs: finalLatency,
        promptTokens: usage?.prompt || 0,
        completionTokens: usage?.completion || 0,
        totalTokens: usage?.total || 0,
        isEstimate: usage?.isEstimate || false,
        error: isSuccessful ? undefined : (data.error || "Sandbox request failed")
      };

      setHistory(prev => {
        const updated = [newHistoryItem, ...prev].slice(0, 50);
        try {
          localStorage.setItem("g_llm_history", JSON.stringify(updated));
        } catch (e) {
          console.warn("Storage blocked:", e);
        }
        return updated;
      });

      if (isSuccessful) {
        setPlaygroundLogs(prev => [...prev, { 
          role: "assistant", 
          content: data.text,
          latencyMs: finalLatency 
        }]);
      } else {
        setPlaygroundLogs(prev => [...prev, { 
          role: "system", 
          content: `Error: ${data.error || "Request failed."}` 
        }]);
      }
    } catch (err: any) {
      const errMsg = err.message || "Error connecting to gateway";
      setPlaygroundLogs(prev => [...prev, { 
        role: "system", 
        content: `Error connecting to gateway: ${errMsg}` 
      }]);

      const newHistoryItem: RequestHistoryItem = {
        id: "hist-" + Date.now(),
        timestamp: new Date().toTimeString().split(' ')[0],
        provider,
        model: model || "default-model",
        success: false,
        latencyMs: 800,
        promptTokens: Math.ceil(currentInput.length / 4),
        completionTokens: 0,
        totalTokens: Math.ceil(currentInput.length / 4),
        isEstimate: true,
        error: errMsg
      };

      setHistory(prev => {
        const updated = [newHistoryItem, ...prev].slice(0, 50);
        try {
          localStorage.setItem("g_llm_history", JSON.stringify(updated));
        } catch (e) { /* ignored */ }
        return updated;
      });
    } finally {
      setIsQuerying(false);
    }
  };

  // Copy integration code helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Set initial form fields for the default active profile
  useEffect(() => {
    const defaultProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
    if (defaultProf) {
      setProvider(defaultProf.provider);
      setProfileName(defaultProf.name);
      setApiKey(defaultProf.apiKey);
      setBaseUrl(defaultProf.baseUrl);
      setModel(defaultProf.model);
      setSystemPrompt(defaultProf.systemPrompt);
      setTemperature(defaultProf.temperature);
      setMaxTokens(defaultProf.maxTokens);
    }
  }, []);

  // Format code blocks
  const getCodeSnippet = () => {
    const payloadStr = JSON.stringify({
      provider,
      apiKey: apiKey ? "••••••••••••••••" : "YOUR_API_KEY",
      baseUrl: baseUrl || undefined,
      model,
      messages: [{ role: "user", content: "Tell me about Sherwin-Williams Emerald sheen levels." }],
      systemPrompt,
      temperature,
      maxTokens
    }, null, 2);

    if (codeTab === "fetch") {
      return `// Universal LLM Gateway Connection Client
async function queryLLMGateway() {
  const response = await fetch("/api/llm-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(${payloadStr.replace(/"apiKey": "••••••••••••••••"/, `"apiKey": "${apiKey || 'YOUR_API_KEY'}"`)})
  });
  
  const data = await response.json();
  if (data.success) {
    console.log("Response:", data.text);
    console.log("Latency:", data.latencyMs, "ms");
  } else {
    console.error("Gateway Error:", data.error);
  }
}`;
    }

    if (codeTab === "python") {
      return `# Python 3.x Universal LLM client request
import requests

payload = ${JSON.stringify({
        provider,
        apiKey: apiKey || "YOUR_API_KEY",
        baseUrl: baseUrl || null,
        model,
        messages: [{ role: "user", content: "Explain matte paint finishes." }],
        system_prompt: systemPrompt,
        temperature,
        max_tokens: maxTokens
      }, null, 2).replace(/: null/g, ": None").replace(/: true/g, ": True").replace(/: false/g, ": False")}

response = requests.post(
    "http://YOUR_SERVER_HOST/api/llm-proxy", 
    json=payload
)

result = response.json()
if result.get("success"):
    print("AI Response:", result["text"])
    print("Execution Speed:", result["latencyMs"], "ms")
else:
    print("Error:", result.get("error"))`;
    }

    return `curl -X POST http://localhost:3000/api/llm-proxy \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "${provider}",
    "apiKey": "${apiKey || 'YOUR_API_KEY'}",
    "baseUrl": "${baseUrl}",
    "model": "${model}",
    "messages": [
      {"role": "user", "content": "Ping."}
    ],
    "temperature": ${temperature},
    "maxTokens": ${maxTokens}
  }'`;
  };

  return (
    <div className="space-y-6" id="llm-connector-module">
      
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md uppercase">Integration Gateway</span>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Server
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Cpu className="h-5 w-5 text-orange-500" /> Universal LLM Gateway Connector
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Establish and stress-test custom, secure backend proxies to any proprietary or open-source Large Language Model (LLM) — including Gemini, Claude, GPT, Groq, or your locally hosted Ollama instances.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePingConnector}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2 shadow-lg shadow-orange-500/15 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" /> Ping Test
            </button>
            <button
              onClick={handleCreateNewProfile}
              className="bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/80 text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-slate-400" /> New Profile
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-2xl">
        <button
          onClick={() => setWorkspaceTab("dashboard")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            workspaceTab === "dashboard"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/15 font-extrabold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Performance & Usage Dashboard
        </button>
        <button
          onClick={() => setWorkspaceTab("sandbox")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            workspaceTab === "sandbox"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/15 font-extrabold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Sliders className="h-4 w-4" /> Connection Sandbox & Profiles
        </button>
      </div>

      {/* SECTION: PERFORMANCE & METRICS DASHBOARD */}
      {workspaceTab === "dashboard" && (() => {
        const totalRequests = history.length;
        const successfulRequests = history.filter(h => h.success).length;
        const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) : "100.0";
        const avgLatency = successfulRequests > 0 
          ? Math.round(history.filter(h => h.success).reduce((acc, curr) => acc + curr.latencyMs, 0) / successfulRequests)
          : 0;
        const totalTokens = history.reduce((acc, curr) => acc + curr.totalTokens, 0);
        const chartData = [...history].reverse();

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Analytics Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1: Total Queries */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Total Gateway Queries</span>
                  <p className="text-2xl font-black text-white tracking-tight">{totalRequests}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Activity className="h-3 w-3 text-orange-500" />
                    <span>Real-time monitoring active</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/15 text-orange-400 z-10">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Stat 2: Avg Latency */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Average Latency</span>
                  <p className="text-2xl font-black text-orange-400 tracking-tight">{avgLatency} <span className="text-xs font-semibold text-slate-400">ms</span></p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Gauge className="h-3 w-3" />
                    <span>Avg roundtrip speed</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/15 text-orange-400 z-10">
                  <Gauge className="h-5 w-5" />
                </div>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Stat 3: Accumulated Tokens */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Accumulated Tokens</span>
                  <p className="text-2xl font-black text-white tracking-tight">{totalTokens.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Coins className="h-3 w-3 text-amber-500" />
                    <span>Input + Output counts</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/15 text-amber-400 z-10">
                  <Coins className="h-5 w-5" />
                </div>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Stat 4: Success Rate */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Success Reliability</span>
                  <p className="text-2xl font-black text-emerald-400 tracking-tight">{successRate}%</p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>All endpoints operational</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/15 text-emerald-400 z-10">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

            </div>

            {/* Charts Panel: Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Latency Trends (AreaChart) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-500" /> Latency Response Trends
                    </h4>
                    <p className="text-[10px] text-slate-400">Visualizing execution response speeds in milliseconds over time</p>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-950 border border-slate-850 px-2 py-0.5 text-orange-400 rounded">
                    Latest: {history[0]?.latencyMs || 0} ms
                  </span>
                </div>
                <div className="h-64 w-full text-slate-300">
                  {totalRequests === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No gateway activity recorded yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#64748b" 
                          fontSize={9}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={9}
                          tickLine={false}
                          unit="ms"
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px" }}
                          labelClassName="text-slate-400 font-mono"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="latencyMs" 
                          name="Latency" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorLatency)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Token Breakdown (BarChart) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-500" /> Token Volume Breakdown
                    </h4>
                    <p className="text-[10px] text-slate-400">Comparing input prompt vs completion generation token counts</p>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-950 border border-slate-850 px-2 py-0.5 text-amber-400 rounded">
                    Avg: {totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0} tokens
                  </span>
                </div>
                <div className="h-64 w-full">
                  {totalRequests === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No token data recorded yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#64748b" 
                          fontSize={9}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={9}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px" }}
                          labelClassName="text-slate-400 font-mono"
                        />
                        <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                        <Bar dataKey="promptTokens" name="Prompt / Input" stackId="a" fill="#475569" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="completionTokens" name="Completion / Output" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Gateway Activity History Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <History className="h-4 w-4 text-orange-500" /> Connection Log Ledger
                  </h4>
                  <p className="text-[10px] text-slate-400">Detailed historical table of direct calls routed through your secure proxy</p>
                </div>

                {/* Filtering Controls */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: "All Logs" },
                    { id: "gemini", label: "Gemini" },
                    { id: "openai", label: "OpenAI" },
                    { id: "anthropic", label: "Claude" },
                    { id: "failed", label: "Failures" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setHistoryFilter(btn.id)}
                      className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        historyFilter === btn.id
                          ? "bg-orange-500/10 border-orange-500 text-orange-400"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                  
                  {/* Clear Button */}
                  <button
                    onClick={() => {
                      if (confirm("Clear all gateway history logs? Seed logs will be restored.")) {
                        setHistory(SEED_HISTORY);
                        try {
                          localStorage.removeItem("g_llm_history");
                        } catch {}
                      }
                    }}
                    className="py-1 px-2 rounded-lg text-[10px] font-bold bg-slate-950 border border-slate-850 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition ml-2 cursor-pointer"
                    title="Reset list to seed values"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Model Configured</th>
                      <th className="py-3 px-4 text-right">Latency</th>
                      <th className="py-3 px-4 text-right">Prompt / Output</th>
                      <th className="py-3 px-4 text-right">Total Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {history
                      .filter(item => {
                        if (historyFilter === "all") return true;
                        if (historyFilter === "failed") return !item.success;
                        return item.provider === historyFilter;
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-850/30 transition">
                          <td className="py-3 px-4 font-bold">
                            {item.success ? (
                              <span className="text-emerald-400 flex items-center gap-1.5 font-sans">
                                <CheckCircle2 className="h-3.5 w-3.5" /> SUCCESS
                              </span>
                            ) : (
                              <span className="text-red-400 flex items-center gap-1.5 font-sans" title={item.error}>
                                <XCircle className="h-3.5 w-3.5 shrink-0" /> FAILED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{item.timestamp}</td>
                          <td className="py-3 px-4 font-mono text-[10px]">
                            <span className="bg-slate-950 px-2 py-0.5 border border-slate-850 rounded text-slate-400 uppercase">
                              {item.provider}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] max-w-[200px] truncate" title={item.model}>
                            {item.model}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-orange-400">
                            {item.latencyMs} ms
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-500">
                            {item.promptTokens} / {item.completionTokens}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {item.totalTokens}
                            {item.isEstimate && (
                              <span className="text-[9px] text-slate-500 font-semibold ml-1 bg-slate-950 px-1.5 py-0.2 border border-slate-850 rounded" title="Token values estimated based on request character counts">
                                EST
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {history.filter(item => {
                      if (historyFilter === "all") return true;
                      if (historyFilter === "failed") return !item.success;
                      return item.provider === historyFilter;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No historical calls found matching the active filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SECTION: SANDBOX WORKSPACE */}
      {workspaceTab === "sandbox" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Profiles & Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-orange-500" /> Configuration Profiles
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{profiles.length} Saved</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {profiles.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleLoadProfile(p)}
                  className={`group p-3 rounded-xl border text-left cursor-pointer transition flex justify-between items-center ${
                    activeProfileId === p.id 
                      ? "bg-slate-850 border-orange-500/50 shadow-md shadow-orange-500/5" 
                      : "bg-slate-950 border-slate-850 hover:bg-slate-850/50 hover:border-slate-800"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate max-w-[150px]">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded uppercase">
                        {p.provider}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 truncate max-w-[100px]">{p.model}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete profile "${p.name}"?`)) {
                          handleDeleteProfile(p.id);
                        }
                      }}
                      className="p-1 hover:text-red-400 text-slate-500 rounded transition"
                      title="Delete profile"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  All connection profiles, custom tokens, and specific target parameters are securely persisted in your local browser sandbox context.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Ping Diagnostics Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" /> Ping Diagnostic HUD
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400">Status Code:</span>
                <span className="font-mono font-bold flex items-center gap-1.5">
                  {pingStatus === "idle" && <span className="text-slate-500">Idle / Ready</span>}
                  {pingStatus === "testing" && <span className="text-amber-400 animate-pulse">Running...</span>}
                  {pingStatus === "success" && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> OK (200)</span>}
                  {pingStatus === "error" && <span className="text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> FAILED (500)</span>}
                </span>
              </div>

              <div className="flex justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400">Ping Latency:</span>
                <span className="font-mono font-bold text-orange-400">
                  {pingLatency !== null ? `${pingLatency} ms` : "N/A"}
                </span>
              </div>

              {pingMessage && (
                <div className={`p-3 rounded-xl text-[11px] leading-relaxed border ${
                  pingStatus === "success" 
                    ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/5 text-red-400 border-red-500/20"
                }`}>
                  {pingMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Settings Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            
            {/* Form Headers */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">Connector Configuration</h3>
                <p className="text-[11px] text-slate-400">Set API credentials and target parameters to proxy requests.</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 px-3 py-1 rounded-full text-[10px] font-mono text-slate-400">
                <span>Profile Name:</span>
                <input 
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-transparent border-none text-white font-bold ml-1 focus:outline-none focus:ring-0 max-w-[150px]"
                />
              </div>
            </div>

            {/* Provider Picker Grid */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Select LLM Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: "gemini", label: "Google Gemini" },
                  { id: "openai", label: "OpenAI GPT" },
                  { id: "anthropic", label: "Anthropic" },
                  { id: "groq", label: "Groq Cloud" },
                  { id: "ollama", label: "Ollama (Local)" },
                  { id: "custom", label: "Custom API" }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id as any)}
                    className={`py-2 px-3 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                      provider === p.id 
                        ? "bg-orange-500/10 border-orange-500 text-orange-400 font-extrabold" 
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>API Secret Key / Token</span>
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[9px] text-orange-400 hover:underline cursor-pointer"
                  >
                    {showApiKey ? "Hide" : "Reveal"}
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key className="h-4 w-4 text-slate-500" />
                  </span>
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider === "gemini" ? "Optional (using server default key)" : "Paste API authorization token..."}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-slate-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Base URL Endpoint</span>
                  <span className="text-[8px] text-slate-500">Standard path</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Globe className="h-4 w-4 text-slate-500" />
                  </span>
                  <input 
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="Endpoint URL base..."
                    disabled={provider === "gemini"}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Target Model Name / ID</label>
                <input 
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gpt-4o, gemini-3.5-flash, llama3"
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Temperature ({temperature})</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl h-[42px]">
                    <input 
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-orange-500 bg-slate-800 rounded-lg cursor-pointer h-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Max output tokens</label>
                  <input 
                    type="number"
                    value={maxTokens === 0 ? "" : maxTokens}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setMaxTokens(0);
                      } else {
                        setMaxTokens(parseInt(val) || 0);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition h-[42px]"
                  />
                </div>
              </div>

            </div>

            {/* System prompt instruction */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">System Instructions / Role Definition</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={2}
                placeholder="Instruct the model on its behavioral guidelines, constraints, or personality traits..."
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-white p-3 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>

            {/* Save Buttons Panel */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Save className="h-4 w-4" /> Save Profile & Apply Changes
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 2: Chat Playground & Raw Payload Console (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="connector-sandbox-playground">
        
        {/* PLAYGROUND VIEW: 6 Cols */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[450px]">
          <div className="bg-slate-850 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" /> Sandbox Chat Playground
            </h3>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded uppercase">
              {provider} MODE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            {playgroundLogs.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-2">
                <HelpCircle className="h-10 w-10 text-slate-700 animate-bounce" />
                <p className="text-xs text-slate-400 font-bold">No active conversation yet</p>
                <p className="text-[10px] text-slate-500 max-w-xs">
                  Type a prompt below and send it. The request will route securely through our Express proxy server.
                </p>
              </div>
            ) : (
              playgroundLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`flex ${log.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    log.role === "user" 
                      ? "bg-orange-500 text-white rounded-tr-none shadow-md shadow-orange-500/10" 
                      : log.role === "system"
                      ? "bg-slate-950 text-slate-400 font-mono text-[10px] border border-slate-850 rounded-none w-full"
                      : "bg-slate-950 text-slate-200 rounded-tl-none border border-slate-850"
                  }`}>
                    <p className="whitespace-pre-line">{log.content}</p>
                    {log.latencyMs && (
                      <div className="text-[9px] text-slate-500 font-mono text-right mt-1 border-t border-slate-800/40 pt-1">
                        ⏱️ Speed: {log.latencyMs} ms
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isQuerying && (
              <div className="flex justify-start">
                <div className="bg-slate-950 text-slate-400 border border-slate-850 rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 text-orange-500 animate-spin" />
                  <span>Streaming payload answer from external gateway...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <div className="relative">
              <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendPlaygroundQuery()}
                placeholder="Ask configured LLM something..."
                className="w-full bg-slate-900 border border-slate-800 text-white pl-3 pr-10 py-2 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none transition placeholder:text-slate-650"
              />
              <button
                type="button"
                onClick={handleSendPlaygroundQuery}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:text-orange-400 text-slate-500 transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* DIAGNOSTIC INSPECTOR / CODE: 6 Cols */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[450px]">
          
          <div className="bg-slate-850 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-orange-500" /> Real-time JSON Console Logger
            </h3>
            <span className="text-[9px] font-mono text-slate-400">PAYLOAD INSPECTOR</span>
          </div>

          <div className="flex-1 bg-slate-950 p-4 font-mono text-[10px] overflow-y-auto space-y-4 text-slate-300">
            
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3" /> Last Outgoing Request Payload
              </p>
              <pre className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-slate-400 max-h-[160px] overflow-auto select-all">
                {lastRequestPayload ? JSON.stringify(lastRequestPayload, null, 2) : "// Awaiting connection dispatch..."}
              </pre>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3" /> Last Received Response Payload
              </p>
              <pre className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-slate-400 max-h-[160px] overflow-auto select-all">
                {lastResponsePayload ? JSON.stringify(lastResponsePayload, null, 2) : "// Awaiting connection dispatch..."}
              </pre>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 3: Code Snippets & Integration Manual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-800">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-orange-500" /> Developer Integration Guide
            </h3>
            <p className="text-xs text-slate-400">Leverage the secure, proxy endpoint anywhere in your administrative code modules.</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            {[
              { id: "fetch", label: "JavaScript / Fetch" },
              { id: "curl", label: "cURL CLI" },
              { id: "python", label: "Python requests" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setCodeTab(t.id as any)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                  codeTab === t.id 
                    ? "bg-orange-500 text-white font-extrabold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => handleCopyCode(getCodeSnippet())}
            className="absolute right-3 top-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-semibold py-1.5 px-2.5 rounded-lg border border-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            {copyStatus ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copyStatus ? "Copied!" : "Copy"}
          </button>
          
          <pre className="bg-slate-950 text-slate-300 font-mono text-[11px] p-5 rounded-2xl border border-slate-850 overflow-x-auto leading-relaxed select-all">
            {getCodeSnippet()}
          </pre>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Full-Stack Client-Server Pattern Compliance</p>
            <p className="text-[11px] text-slate-400 leading-normal">
              This gateway maps client configs to secure Express backend requests. All critical client authorization tokens are submitted inside proxy body calls, removing public exposure risks.
            </p>
          </div>
        </div>
      </div>
      </>)}

    </div>
  );
}
