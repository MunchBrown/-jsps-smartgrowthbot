// Account, company (org) and team management.
import { Router } from "express";
import { requireAuth, requireOrg, requireRole, orgIdOf } from "../auth";
import { store, paths, nowIso } from "../store";
import { randomToken } from "../crypto";
import { PLANS, planFor } from "../plans";
import { sendEmail } from "../integrations";
import { config, APP_NAME } from "../config";
import { str, email as emailField, oneOf } from "../validate";

const router = Router();
router.use(["/api/me", "/api/onboarding", "/api/invites", "/api/org", "/api/team"], requireAuth);

function publicOrg(org: any) {
  if (!org) return null;
  const { id, name, plan, subscription, profile, integrations, createdAt, ownerUid } = org;
  return {
    id,
    name,
    plan: plan || null,
    ownerUid,
    createdAt,
    profile: profile || {},
    integrations: integrations || {},
    subscription: {
      status: subscription?.status || "none",
      trialEnd: subscription?.trialEnd || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: !!subscription?.cancelAtPeriodEnd,
    },
  };
}

router.get("/api/me", async (req, res) => {
  const a = req.auth!;
  const invite = !a.orgId && a.email ? await store.get(paths.invite(a.email)) : null;
  let usage = null;
  if (a.orgId) {
    const month = new Date().toISOString().slice(0, 7);
    const leads = await store.list(paths.orgCol(a.orgId, "leads"), { where: [["createdMonth", month]] });
    usage = { month, leads: leads.length, leadLimit: planFor(a.org).leadsPerMonth };
  }
  res.json({
    user: { uid: a.uid, email: a.email, emailVerified: a.emailVerified, role: a.role || null },
    org: publicOrg(a.org),
    usage,
    pendingInvite: invite ? { orgName: invite.orgName, role: invite.role } : null,
    plans: Object.values(PLANS),
  });
});

// Create a company workspace for a newly registered owner.
router.post("/api/onboarding", async (req, res) => {
  const a = req.auth!;
  if (a.orgId) {
    res.status(409).json({ error: "You already belong to a company." });
    return;
  }
  const b = req.body || {};
  const name = str(b.companyName, "Company name", { required: true, max: 120 });
  const orgRef = randomToken(12);
  const org = {
    id: orgRef,
    name,
    ownerUid: a.uid,
    plan: null,
    createdAt: nowIso(),
    subscription: { status: "none" },
    profile: {
      ownerName: str(b.ownerName, "Your name", { max: 120 }),
      phone: str(b.phone, "Phone", { max: 40 }),
      email: a.email,
      address: str(b.address, "Address", { max: 200 }),
      serviceArea: str(b.serviceArea, "Service area", { max: 200 }),
      services: Array.isArray(b.services) ? b.services.slice(0, 20).map((s: any) => str(s, "Service", { max: 60 })) : [],
      timeZone: str(b.timeZone, "Time zone", { max: 60 }) || "America/New_York",
    },
    integrations: {},
  };
  await store.set(paths.org(orgRef), org, false);
  await store.set(paths.secrets(orgRef), { webhookSecret: randomToken(24) }, false);
  await store.set(paths.user(a.uid), { uid: a.uid, email: a.email, orgId: orgRef, role: "owner", name: org.profile.ownerName, createdAt: nowIso() }, false);
  res.status(201).json({ org: publicOrg(org) });
});

router.post("/api/invites/accept", async (req, res) => {
  const a = req.auth!;
  if (a.orgId) {
    res.status(409).json({ error: "You already belong to a company." });
    return;
  }
  if (!a.emailVerified) {
    res.status(403).json({ error: "Verify your email address first, then accept the invite.", code: "EMAIL_NOT_VERIFIED" });
    return;
  }
  const invite = await store.get(paths.invite(a.email));
  if (!invite) {
    res.status(404).json({ error: "No invite found for this email." });
    return;
  }
  const org = await store.get(paths.org(invite.orgId));
  if (!org) {
    await store.remove(paths.invite(a.email));
    res.status(404).json({ error: "That company no longer exists." });
    return;
  }
  const members = await store.list("users", { where: [["orgId", invite.orgId]] });
  if (members.length >= planFor(org).seats) {
    res.status(403).json({ error: "This company has used all its user seats. Ask the owner to upgrade." });
    return;
  }
  await store.set(paths.user(a.uid), { uid: a.uid, email: a.email, orgId: invite.orgId, role: invite.role || "member", createdAt: nowIso() }, false);
  await store.remove(paths.invite(a.email));
  res.json({ success: true });
});

// ---- Company profile --------------------------------------------------------
router.patch("/api/org", requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const b = req.body || {};
  const patch: any = {};
  if (b.name !== undefined) patch.name = str(b.name, "Company name", { required: true, max: 120 });
  if (b.profile && typeof b.profile === "object") {
    const p = b.profile;
    patch.profile = {};
    for (const [k, max] of Object.entries({ ownerName: 120, phone: 40, email: 200, address: 200, serviceArea: 200, timeZone: 60, website: 200, licenseNumber: 80 })) {
      if (p[k] !== undefined) patch.profile[k] = str(p[k], k, { max: max as number });
    }
    if (Array.isArray(p.services)) patch.profile.services = p.services.slice(0, 20).map((s: any) => str(s, "Service", { max: 60 }));
  }
  await store.set(paths.org(orgIdOf(req)), patch);
  res.json({ org: publicOrg(await store.get(paths.org(orgIdOf(req)))) });
});

// ---- Team -------------------------------------------------------------------
router.get("/api/team", requireOrg, async (req, res) => {
  const orgId = orgIdOf(req);
  const [members, invites] = await Promise.all([
    store.list("users", { where: [["orgId", orgId]] }),
    store.list("invites", { where: [["orgId", orgId]] }),
  ]);
  res.json({
    members: members.map((m) => ({ uid: m.uid || m.id, email: m.email, name: m.name || "", role: m.role })),
    invites: invites.map((i) => ({ email: i.email, role: i.role, createdAt: i.createdAt })),
    seats: planFor(req.auth!.org).seats,
  });
});

router.post("/api/team/invite", requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const orgId = orgIdOf(req);
  const org = req.auth!.org;
  const inviteEmail = emailField(req.body?.email, "Email", { required: true });
  const role = oneOf(req.body?.role || "member", ["admin", "member"], "Role");
  const existingUser = (await store.list("users", { where: [["email", inviteEmail]] }))[0];
  if (existingUser?.orgId) {
    res.status(409).json({ error: "That person already belongs to a company." });
    return;
  }
  const [members, invites] = await Promise.all([
    store.list("users", { where: [["orgId", orgId]] }),
    store.list("invites", { where: [["orgId", orgId]] }),
  ]);
  if (members.length + invites.length >= planFor(org).seats) {
    res.status(403).json({ error: `Your ${planFor(org).name} plan includes ${planFor(org).seats} user seat(s). Upgrade to add more people.` });
    return;
  }
  await store.set(paths.invite(inviteEmail), { email: inviteEmail, orgId, orgName: org.name, role, invitedBy: req.auth!.uid, createdAt: nowIso() }, false);
  let emailed = false;
  try {
    await sendEmail(orgId, {
      to: inviteEmail,
      subject: `${org.name} invited you to ${APP_NAME}`,
      text: `${org.name} added you to their ${APP_NAME} workspace.\n\nCreate your account with this email address (${inviteEmail}) at ${config.appUrl} and you'll join the team automatically.`,
      fromName: org.name,
    });
    emailed = true;
  } catch {
    // The invite still works; the owner can share the link themselves.
  }
  res.status(201).json({ success: true, emailed, signupUrl: config.appUrl });
});

router.delete("/api/team/invites/:email", requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const inv = await store.get(paths.invite(req.params.email));
  if (inv?.orgId === orgIdOf(req)) await store.remove(paths.invite(req.params.email));
  res.json({ success: true });
});

router.delete("/api/team/:uid", requireOrg, requireRole("owner", "admin"), async (req, res) => {
  const target = await store.get(paths.user(req.params.uid));
  if (!target || target.orgId !== orgIdOf(req)) {
    res.status(404).json({ error: "Team member not found." });
    return;
  }
  if (target.role === "owner") {
    res.status(400).json({ error: "The account owner can't be removed." });
    return;
  }
  await store.set(paths.user(req.params.uid), { orgId: null, role: null });
  res.json({ success: true });
});


export default router;
