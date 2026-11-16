import React from "react";
import { PhoneIncoming, PhoneOutgoing, MessageSquare } from "lucide-react";
import { api, dateTime } from "../../lib/api";
import { PageHeader, Card, ErrorText, Spinner, Empty, useLoad } from "./ui";

export default function Inbox({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const { data, error, loading } = useLoad(async () => {
    const [calls, messages] = await Promise.all([api<any[]>("/api/calls"), api<any[]>("/api/messages")]);
    return [
      ...calls.map((c) => ({ kind: "call" as const, at: c.createdAt, item: c })),
      ...messages.map((m) => ({ kind: "msg" as const, at: m.createdAt, item: m })),
    ].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }, []);

  return (
    <div>
      <PageHeader title="Calls & texts" subtitle="Every AI call and text conversation, newest first. Click one to open the lead." />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Spinner /> : !data?.length ? (
        <Empty title="No calls or texts yet">
          Connect Vapi and Twilio in Settings → Integrations. Inbound callers and texters become leads automatically.
        </Empty>
      ) : (
        <div className="grid gap-2">
          {data.map((row, i) => {
            const it: any = row.item;
            const Icon = row.kind === "msg" ? MessageSquare : it.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
            return (
              <button key={i} onClick={() => it.leadId && onOpenLead(it.leadId)} disabled={!it.leadId} className="text-left w-full cursor-pointer disabled:cursor-default">
                <Card className="!p-4 hover:border-slate-700">
                  <div className="flex gap-3 items-start">
                    <Icon className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium">
                        {row.kind === "msg"
                          ? `${it.direction === "inbound" ? "Text from" : "Text to"} ${it.from || it.to}`
                          : `${it.direction === "inbound" ? "Inbound call from" : "AI call to"} ${it.callerName || it.phoneNumber}`}
                        <span className="text-xs text-slate-500 font-normal ml-2">{dateTime(row.at)}</span>
                      </p>
                      <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{row.kind === "msg" ? it.body : it.summary || it.status}</p>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
