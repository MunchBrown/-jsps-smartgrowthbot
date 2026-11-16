import { store, paths, nowIso } from "./store";
import { str, email as emailField, num, oneOf, ValidationError } from "./validate";
import { toE164 } from "./integrations";
import { planFor } from "./plans";
import { scoreLead } from "./leadScore";

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Quoted", "Won", "Lost"] as const;

export function cleanLeadInput(b: any, partial = false) {
  const out: any = {};
  const set = (k: string, v: any) => {
    if (!partial || b[k] !== undefined) out[k] = v;
  };
  set("clientName", str(b.clientName, "Customer name", { required: !partial, max: 120 }));
  set("phone", str(b.phone, "Phone", { max: 40 }));
  set("email", emailField(b.email, "Email"));
  set("clientType", b.clientType === undefined && partial ? undefined : oneOf(b.clientType || "Residential", ["Residential", "Commercial", "Government"], "Customer type"));
  set("address", str(b.address, "Address", { max: 200 }));
  set("budget", num(b.budget, "Budget", { min: 0, max: 100_000_000 }));
  set("sqft", num(b.sqft, "Square feet", { min: 0, max: 10_000_000 }));
  set("timeline", str(b.timeline, "Timeline", { max: 120 }));
  set("condition", str(b.condition, "Condition", { max: 500 }));
  set("projectDescription", str(b.projectDescription, "Project", { max: 2000 }));
  set("source", str(b.source, "Source", { max: 80 }));
  set("notes", str(b.notes, "Notes", { max: 5000 }));
  if (b.status !== undefined) out.status = oneOf(b.status, LEAD_STATUSES, "Status");
  if (out.phone !== undefined) {
    out.phoneE164 = out.phone ? toE164(out.phone) : "";
  }
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

export async function monthlyLeadCount(orgId: string) {
  const month = new Date().toISOString().slice(0, 7);
  return (await store.list(paths.orgCol(orgId, "leads"), { where: [["createdMonth", month]] })).length;
}

/**
 * Creates a lead for a company, enforcing the plan's monthly limit and
 * scoring it with AI when available.
 */
export async function createLead(orgId: string, org: any, input: any, extra: Record<string, any> = {}) {
  if (!input.phone && !input.email) throw new ValidationError("Add a phone number or email so you can reach this customer.");
  const limit = planFor(org).leadsPerMonth;
  if ((await monthlyLeadCount(orgId)) >= limit) {
    throw new ValidationError(`You've reached this month's ${limit}-lead limit on the ${planFor(org).name} plan. Upgrade in Settings → Billing.`);
  }
  const now = nowIso();
  const lead: any = {
    clientType: "Residential",
    status: "New",
    source: "Manual",
    ...input,
    ...extra,
    score: null,
    createdAt: now,
    updatedAt: now,
    createdMonth: now.slice(0, 7),
  };
  const ai = await scoreLead(lead);
  if (ai) Object.assign(lead, ai);
  const id = await store.add(paths.orgCol(orgId, "leads"), lead);
  return { ...lead, id };
}

export async function findLeadByPhone(orgId: string, phoneE164: string) {
  if (!phoneE164) return null;
  const rows = await store.list(paths.orgCol(orgId, "leads"), { where: [["phoneE164", phoneE164]], limit: 1 });
  return rows[0] || null;
}
