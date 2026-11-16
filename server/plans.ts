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

export function planFor(org: any): Plan {
  return PLANS[isPlanId(org?.plan) ? org.plan : "starter"];
}
