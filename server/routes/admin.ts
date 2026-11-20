// Platform-admin tools for the Smart Growth Bot operator: see every company
// and grant or remove free beta access (works without Stripe).
import { Router } from "express";
import { requireAuth, requirePlatformAdmin } from "../auth";
import { store, paths, nowIso } from "../store";
import { isPlanId, hasCompAccess } from "../plans";
import { num, ValidationError } from "../validate";

const router = Router();
router.use("/api/admin", requireAuth, requirePlatformAdmin);

router.get("/api/admin/orgs", async (_req, res) => {
  const [orgs, users] = await Promise.all([store.list("orgs"), store.list("users")]);
  const byUid = new Map(users.map((u) => [u.uid || u.id, u]));
  res.json(
    orgs.map((o) => ({
      id: o.id,
      name: o.name,
      ownerEmail: byUid.get(o.ownerUid)?.email || "",
      members: users.filter((u) => u.orgId === o.id).length,
      createdAt: o.createdAt,
      subscriptionStatus: o.subscription?.status || "none",
      plan: o.plan || null,
      beta: hasCompAccess(o) ? { plan: o.comp.plan, until: o.comp.until || null, grantedBy: o.comp.grantedBy } : null,
    })),
  );
});

router.post("/api/admin/orgs/:orgId/beta", async (req, res) => {
  const org = await store.get(paths.org(req.params.orgId));
  if (!org) {
    res.status(404).json({ error: "Company not found." });
    return;
  }
  const plan = req.body?.plan;
  if (!isPlanId(plan)) throw new ValidationError("Choose Starter, Professional or Premium.");
  const days = num(req.body?.days ?? 90, "Days", { min: 0, max: 730 });
  const until = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
  await store.set(paths.org(org.id), { comp: { active: true, plan, until, grantedBy: req.auth!.email, grantedAt: nowIso() } });
  res.json({ success: true, until });
});

router.delete("/api/admin/orgs/:orgId/beta", async (req, res) => {
  const org = await store.get(paths.org(req.params.orgId));
  if (!org) {
    res.status(404).json({ error: "Company not found." });
    return;
  }
  await store.set(paths.org(org.id), { comp: { active: false, endedAt: nowIso(), endedBy: req.auth!.email } });
  res.json({ success: true });
});

export default router;
