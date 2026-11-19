export type PlanId = "starter" | "professional" | "premium";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  seats: number;
  leadsPerMonth: number;
  aiRequestsPerDay: number;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: { id: "starter", name: "Starter", priceMonthly: 297, seats: 1, leadsPerMonth: 100, aiRequestsPerDay: 100 },
  professional: { id: "professional", name: "Professional", priceMonthly: 697, seats: 5, leadsPerMonth: 250, aiRequestsPerDay: 300 },
  premium: { id: "premium", name: "Premium", priceMonthly: 1497, seats: 15, leadsPerMonth: 500, aiRequestsPerDay: 800 },
};

export function isPlanId(v: any): v is PlanId {
  return v === "starter" || v === "professional" || v === "premium";
}

// Subscription statuses that keep the workspace usable.
export const ACCESS_STATUSES = new Set(["trialing", "active", "past_due"]);

/**
 * Free beta access granted by a platform admin. Works without Stripe and
 * expires on compUntil (if set).
 */
export function hasCompAccess(org: any): boolean {
  const c = org?.comp;
  if (!c?.active) return false;
  return !c.until || Date.parse(c.until) > Date.now();
}

export function hasAccess(org: any): boolean {
  return ACCESS_STATUSES.has(org?.subscription?.status) || hasCompAccess(org);
}

export function planFor(org: any): Plan {
  // A paid subscription's plan wins; otherwise use the beta plan if one is active.
  const paid = ACCESS_STATUSES.has(org?.subscription?.status);
  const id = !paid && hasCompAccess(org) ? org.comp.plan : org?.plan;
  return PLANS[isPlanId(id) ? id : "starter"];
}
