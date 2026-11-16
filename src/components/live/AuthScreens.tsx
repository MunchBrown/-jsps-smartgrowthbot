import React from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification,
  updateProfile, signOut,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { BrandMark } from "./Brand";
import { Button, Field, Input, ErrorText, Notice } from "./ui";

function friendly(err: any): string {
  const code = String(err?.code || "");
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "That email and password don't match.";
  if (code.includes("email-already-in-use")) return "An account with that email already exists. Sign in instead.";
  if (code.includes("weak-password")) return "Use a stronger password (at least 8 characters).";
  if (code.includes("invalid-email")) return "That doesn't look like an email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a few minutes and try again.";
  if (code.includes("network")) return "Can't reach the sign-in service. Check your connection.";
  if (code.includes("operation-not-allowed")) return "Email sign-in isn't enabled for this app yet.";
  return err?.message || "Something went wrong. Try again.";
}

export function AuthShell({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center py-10 px-4">
      <button onClick={onBack} className="mb-8 cursor-pointer" aria-label="Back to home"><BrandMark /></button>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">{children}</div>
    </div>
  );
}

export function AuthScreen({ initialMode, onBack, onLegal }: { initialMode: "login" | "register"; onBack: () => void; onLegal: (p: string) => void }) {
  const [mode, setMode] = React.useState<"login" | "register" | "forgot">(initialMode);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === "register") {
        if (password.length < 8) throw { message: "Use at least 8 characters for your password." };
        if (!agree) throw { message: "Please accept the Terms of Service and Privacy Policy." };
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
        await sendEmailVerification(cred.user).catch(() => {});
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setSent("If an account exists for that email, a reset link is on its way.");
      }
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell onBack={onBack}>
      <h1 className="text-xl font-bold">
        {mode === "login" ? "Sign in" : mode === "register" ? "Start your free trial" : "Reset your password"}
      </h1>
      <p className="text-sm text-slate-400 mt-1">
        {mode === "register" ? "Create your account, then set up your company." : mode === "forgot" ? "We'll email you a reset link." : "Welcome back."}
      </p>
      <form onSubmit={submit} className="space-y-4 mt-6">
        {mode === "register" && (
          <Field label="Your name">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={120} />
          </Field>
        )}
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </Field>
        {mode !== "forgot" && (
          <Field label="Password" hint={mode === "register" ? "At least 8 characters." : undefined}>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} />
          </Field>
        )}
        {mode === "register" && (
          <label className="flex gap-2 items-start text-xs text-slate-400">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            <span>
              I agree to the{" "}
              <button type="button" className="text-orange-400 underline cursor-pointer" onClick={() => onLegal("/terms")}>Terms of Service</button> and{" "}
              <button type="button" className="text-orange-400 underline cursor-pointer" onClick={() => onLegal("/privacy")}>Privacy Policy</button>.
            </span>
          </label>
        )}
        <ErrorText>{error}</ErrorText>
        {sent && <Notice tone="success">{sent}</Notice>}
        <Button type="submit" busy={busy} className="w-full py-2.5">
          {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-400 space-y-2 text-center">
        {mode === "login" && (
          <>
            <p><button className="text-orange-400 cursor-pointer" onClick={() => setMode("forgot")}>Forgot password?</button></p>
            <p>New here? <button className="text-orange-400 cursor-pointer" onClick={() => setMode("register")}>Create an account</button></p>
          </>
        )}
        {mode !== "login" && (
          <p>Already have an account? <button className="text-orange-400 cursor-pointer" onClick={() => setMode("login")}>Sign in</button></p>
        )}
      </div>
    </AuthShell>
  );
}

export function VerifyEmailScreen({ email, onVerified }: { email: string; onVerified: () => Promise<void> }) {
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [error, setError] = React.useState("");
  const resend = async () => {
    setError("");
    setMsg("");
    try {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      setMsg("Sent. Check your inbox and spam folder.");
    } catch (e) {
      setError(friendly(e));
    }
  };
  const check = async () => {
    setBusy(true);
    setError("");
    try {
      await auth.currentUser?.reload();
      if (!auth.currentUser?.emailVerified) {
        setError("We haven't seen the confirmation yet. Click the link in the email, then try again.");
        return;
      }
      await auth.currentUser.getIdToken(true);
      await onVerified();
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell>
      <h1 className="text-xl font-bold">Confirm your email</h1>
      <p className="text-sm text-slate-400 mt-2">We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it, then come back here.</p>
      <div className="space-y-3 mt-6">
        <ErrorText>{error}</ErrorText>
        {msg && <Notice tone="success">{msg}</Notice>}
        <Button className="w-full" busy={busy} onClick={check}>I've confirmed my email</Button>
        <Button className="w-full" variant="secondary" onClick={resend}>Resend the email</Button>
        <Button className="w-full" variant="ghost" onClick={() => signOut(auth)}>Use a different account</Button>
      </div>
    </AuthShell>
  );
}
