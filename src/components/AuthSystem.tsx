import React, { useState } from "react";
import { 
  Paintbrush, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, Eye, EyeOff, 
  CreditCard, ShieldCheck, Mail, Calendar, Users, DollarSign 
} from "lucide-react";

interface AuthSystemProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialMode?: "login" | "register";
}

export default function AuthSystem({ onSuccess, onCancel, initialMode = "login" }: AuthSystemProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "verify">(initialMode);
  const [step, setStep] = useState(1); // Onboarding Steps (1-5)

  // Auth form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // STEP 1: Company Info
  const [companyName, setCompanyName] = useState("Smart Growth Painting");
  const [companyPhone, setCompanyPhone] = useState("(717) 555-0140");
  const [companyAddress, setCompanyAddress] = useState("415 Pine Lane");
  const [companyCity, setCompanyCity] = useState("York");
  const [companyState, setCompanyState] = useState("PA");
  const [companyZip, setCompanyZip] = useState("17401");

  // STEP 2: Business Details
  const [servicesOffered, setServicesOffered] = useState<string[]>([
    "Residential Interior", "Residential Exterior"
  ]);
  const [serviceArea, setServiceArea] = useState("25 mile radius");
  const [teamSize, setTeamSize] = useState("1-5 Painters");

  // STEP 3: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState("PROFESSIONAL");

  // STEP 4: Fake Payment details
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("342");

  const servicesList = [
    "Residential Interior", "Residential Exterior", "Commercial Interior", 
    "Commercial Exterior", "Cabinet Refinishing", "Deck Staining", "Wallpaper Removal", "Pressure Washing"
  ];

  const handleToggleService = (srv: string) => {
    if (servicesOffered.includes(srv)) {
      setServicesOffered(servicesOffered.filter(s => s !== srv));
    } else {
      setServicesOffered([...servicesOffered, srv]);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    // Simulate validation
    if (password.length < 5) {
      setErrorMsg("Password must be at least 5 characters.");
      return;
    }
    onSuccess();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMode("verify");
  };

  return (
    <div className="bg-[#0F172A] text-white min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 relative font-sans" id="auth-root">
      {/* Background ambient radial gradients */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-3 cursor-pointer" onClick={onCancel}>
          <div className="bg-[#F97316] p-2.5 rounded-xl text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Paintbrush className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              PaintingPro <span className="text-orange-500 text-xs font-semibold bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">AI</span>
            </span>
            <span className="text-[9px] tracking-widest text-slate-400 block font-mono">FRANCHISE OS</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          
          {/* 1. LOGIN MODE */}
          {mode === "login" && (
            <div className="space-y-6" id="view-login">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">Log in to manage your painting business dashboard</p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Contractor Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mike@johnnysonspainting.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 text-sm placeholder-slate-600"
                  />
                </div>

                <div className="space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Secure Password</label>
                    <button 
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-400"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:border-orange-500 text-sm placeholder-slate-700"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-orange-500/20 cursor-pointer flex justify-center items-center gap-1.5"
                >
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-900 text-slate-500">Don't have an account?</span>
              </div>

              <button 
                onClick={() => setMode("register")}
                className="w-full bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold py-3 px-4 rounded-xl text-sm transition"
              >
                Create Free 14-Day Trial Account
              </button>
            </div>
          )}

          {/* 2. FORGOT PASSWORD MODE */}
          {mode === "forgot" && (
            <div className="space-y-6" id="view-forgot">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">Reset Password</h2>
                <p className="text-xs text-slate-400">We will dispatch an automated verification link to your email</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Contractor Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mike@johnnysonspainting.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 text-sm placeholder-slate-600"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition"
                >
                  Dispatch Verification Email
                </button>
              </form>

              <button 
                onClick={() => setMode("login")}
                className="w-full text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </button>
            </div>
          )}

          {/* 3. EMAIL VERIFICATION MODE */}
          {mode === "verify" && (
            <div className="space-y-6 text-center" id="view-verify">
              <div className="bg-orange-500/10 text-orange-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
                <Mail className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Verify Your Email</h2>
                <p className="text-xs text-slate-400">
                  We sent an automated verification link to <strong className="text-slate-200">{email || "your email"}</strong>.
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-500 leading-relaxed font-mono">
                [Sandbox Sim: Click below to bypass email confirmation step]
              </div>
              <button 
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setPassword("demo123");
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition"
              >
                Confirm Verification (Bypass Sandbox)
              </button>
            </div>
          )}

          {/* 4. MULTI-STEP REGISTER ONBOARDING WIZARD */}
          {mode === "register" && (
            <div className="space-y-6" id="view-onboarding">
              <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Onboarding Setup</h3>
                  <p className="text-[10px] text-slate-400">Step {step} of 5</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-orange-500" : "bg-slate-800"}`}
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: Company Info */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn" id="onboarding-step1">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">Contractor Company Information</h4>
                    <p className="text-slate-500 text-[11px]">Tell us about your painting business registration.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Painting Firm Name</label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Brush & Co. Painting"
                        className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Business Phone Number</label>
                      <input 
                        type="text" 
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        placeholder="e.g. (206) 555-PROS"
                        className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Street Address</label>
                      <input 
                        type="text" 
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="e.g. 104 Main St"
                        className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">City</label>
                        <input 
                          type="text" 
                          value={companyCity}
                          onChange={(e) => setCompanyCity(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">State</label>
                        <input 
                          type="text" 
                          value={companyState}
                          onChange={(e) => setCompanyState(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">ZIP</label>
                        <input 
                          type="text" 
                          value={companyZip}
                          onChange={(e) => setCompanyZip(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1"
                  >
                    Next: Business Details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Business Details */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn" id="onboarding-step2">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">Services & Operational Profile</h4>
                    <p className="text-slate-500 text-[11px]">Select your primary service areas and crew structure.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Services Offered</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-850 p-2 rounded-xl bg-slate-950">
                        {servicesList.map((srv) => (
                          <label key={srv} className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-900 rounded-lg cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={servicesOffered.includes(srv)}
                              onChange={() => handleToggleService(srv)}
                              className="accent-orange-500"
                            />
                            <span>{srv}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Service Radius Area</label>
                        <select 
                          value={serviceArea}
                          onChange={(e) => setServiceArea(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                        >
                          <option>15 mile radius</option>
                          <option>25 mile radius</option>
                          <option>50 mile radius</option>
                          <option>Statewide operations</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Active Team Size</label>
                        <select 
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm"
                        >
                          <option>Solo Contractor</option>
                          <option>1-5 Painters</option>
                          <option>6-15 Painters</option>
                          <option>16-50 Painters</option>
                          <option>50+ Large Enterprise</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep(1)}
                      className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1"
                    >
                      Next: Choose Plan
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Plan Selection */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn" id="onboarding-step3">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">Select Your Operational Plan</h4>
                    <p className="text-slate-500 text-[11px]">All plans begin with a 14-day fully simulated trial period.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: "STARTER", price: "$297/mo", label: "Solo CRM & Bidding" },
                      { id: "PROFESSIONAL", price: "$697/mo", label: "Full CRM + QuickBooks (Favored)" },
                      { id: "PREMIUM", price: "$1,497/mo", label: "Crew Optimizer + Advisor" },
                      { id: "ENTERPRISE", price: "$2,997/mo", label: "Franchise White Label" }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`border p-4 rounded-2xl cursor-pointer transition text-left relative ${selectedPlan === plan.id ? "bg-orange-500/10 border-orange-500" : "bg-slate-950 border-slate-850 hover:border-slate-700"}`}
                      >
                        {selectedPlan === plan.id && (
                          <div className="absolute top-2 right-2 bg-orange-500 p-0.5 rounded-full">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">{plan.id}</span>
                        <h5 className="font-bold text-white text-sm">{plan.price}</h5>
                        <p className="text-[10px] text-slate-400">{plan.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep(2)}
                      className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setStep(4)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1"
                    >
                      Next: Payment Guarantee
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Payment Details */}
              {step === 4 && (
                <div className="space-y-4 animate-fadeIn" id="onboarding-step4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">Payment Details (Sandbox Mock)</h4>
                    <p className="text-slate-500 text-[11px]">No charge occurs during your initial 14-day simulated trial.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-left">
                    <div className="flex justify-between text-xs pb-2 border-b border-slate-900 font-mono">
                      <span className="text-slate-400">Selected Plan:</span>
                      <span className="text-orange-400 font-bold">{selectedPlan} Trial</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Cardholder Name</label>
                      <input 
                        type="text" 
                        defaultValue="Mike Johnson"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Credit Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 pl-9 text-xs font-mono"
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Expiration Date</label>
                        <input 
                          type="text" 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">CVC Code</label>
                        <input 
                          type="password" 
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono text-left">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Secure 256-bit SSL encrypted Stripe verification channel.</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep(3)}
                      className="bg-slate-800 hover:bg-slate-750 text-white font-bold p-3 rounded-xl text-xs transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setStep(5)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5"
                    >
                      Authorize Trial Activation
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Success & Redirect */}
              {step === 5 && (
                <div className="space-y-6 text-center animate-fadeIn" id="onboarding-step5">
                  <div className="bg-emerald-500/10 text-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Sparkles className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-white text-lg">Trial Account Activated!</h4>
                    <p className="text-slate-400 text-xs">
                      Congratulations! Your PaintingPro AI instance for <strong className="text-slate-200">{companyName}</strong> is ready.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left text-xs space-y-1 font-mono text-slate-500">
                    <div>• Instance: York, PA Cluster 01</div>
                    <div>• Package: {selectedPlan} Sandbox</div>
                    <div>• CRM Database: Provisioned (15 Demo Leads)</div>
                  </div>

                  <button 
                    onClick={onSuccess}
                    className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5"
                  >
                    Open Business Operating System
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {step < 5 && (
                <button 
                  onClick={() => setMode("login")}
                  className="w-full text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  Already registered? Sign In
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
