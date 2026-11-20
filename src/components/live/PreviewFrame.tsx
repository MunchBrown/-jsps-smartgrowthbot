import React from "react";
import { FlaskConical } from "lucide-react";
import { setPreviewMode } from "../../lib/api";

/**
 * Wraps a module that still runs on sample data. Shows a clear banner and
 * blocks it from changing real records while it's open.
 */
export default function PreviewFrame({ name, children }: { name: string; children: React.ReactNode }) {
  React.useEffect(() => {
    setPreviewMode(true);
    return () => setPreviewMode(false);
  }, []);
  return (
    <div>
      <div role="note" className="mb-5 flex gap-3 items-start bg-amber-500/10 border border-amber-500/40 text-amber-100 rounded-xl px-4 py-3 text-sm">
        <FlaskConical className="h-5 w-5 shrink-0 text-amber-300 mt-0.5" />
        <p>
          <strong>{name} is a preview.</strong> It shows sample data, and nothing you do here sends messages, charges cards or changes your real
          leads, estimates or invoices. It's here so you can see what's coming.
        </p>
      </div>
      {children}
    </div>
  );
}
