import React from "react";
import { Loader2, X } from "lucide-react";

// Shared building blocks for the live (real-data) screens. They follow the
// app's existing dark slate + orange look.

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold font-serif text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 min-w-0 ${className}`}>{children}</div>;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; busy?: boolean };
export function Button({ variant = "primary", busy, children, className = "", disabled, ...rest }: BtnProps) {
  const styles = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger: "bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/40",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300",
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${styles} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls = "w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((p, ref) => (
  <input ref={ref} {...p} className={`${inputCls} ${p.className || ""}`} />
));
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${inputCls} ${p.className || ""}`} />;
}
export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={`${inputCls} ${p.className || ""}`} />;
}

const badgeColors: Record<string, string> = {
  New: "bg-sky-500/15 text-sky-300", Contacted: "bg-indigo-500/15 text-indigo-300", Qualified: "bg-violet-500/15 text-violet-300",
  Quoted: "bg-amber-500/15 text-amber-300", Won: "bg-emerald-500/15 text-emerald-300", Lost: "bg-slate-600/30 text-slate-400",
  Draft: "bg-slate-600/30 text-slate-300", Sent: "bg-amber-500/15 text-amber-300", Accepted: "bg-emerald-500/15 text-emerald-300",
  Declined: "bg-red-500/15 text-red-300", Paid: "bg-emerald-500/15 text-emerald-300", Void: "bg-slate-600/30 text-slate-400",
  Scheduled: "bg-sky-500/15 text-sky-300", Completed: "bg-emerald-500/15 text-emerald-300", Canceled: "bg-slate-600/30 text-slate-400",
  Hot: "bg-red-500/15 text-red-300", Warm: "bg-amber-500/15 text-amber-300", Cold: "bg-sky-500/15 text-sky-300",
};
export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  const cls = badgeColors[tone || String(children)] || "bg-slate-700/40 text-slate-300";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${cls}`}>{children}</span>;
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{children}</p>;
}

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "success" | "warn" }) {
  const cls = {
    info: "bg-sky-500/10 border-sky-500/30 text-sky-200",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    warn: "bg-amber-500/10 border-amber-500/30 text-amber-200",
  }[tone];
  return <div className={`text-sm border rounded-lg px-3 py-2 ${cls}`}>{children}</div>;
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-10 justify-center">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
      <p className="text-white font-semibold">{title}</p>
      {children && <div className="text-sm text-slate-400 mt-2 max-w-md mx-auto">{children}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-start sm:items-center justify-center p-3 overflow-y-auto" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-slate-900 border border-slate-700 rounded-2xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-6 shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-white mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </Card>
  );
}

/** Small hook for loading data from the API with error + reload. */
export function useLoad<T>(loader: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const reload = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loader());
    } catch (e: any) {
      setError(e.message || "Couldn't load.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  React.useEffect(() => {
    reload();
  }, [reload]);
  return { data, setData, error, loading, reload };
}
