import type { Request, Response, NextFunction } from "express";
import { getAdminAuth } from "./firebase";
import { config } from "./config";
import { store, paths } from "./store";
import { ACCESS_STATUSES } from "./plans";

export type Role = "owner" | "admin" | "member";

export interface AuthContext {
  uid: string;
  email: string;
  emailVerified: boolean;
  orgId?: string;
  role?: Role;
  org?: any;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

async function verifyToken(token: string): Promise<{ uid: string; email: string; emailVerified: boolean }> {
  if (config.testAuth && !config.isProd && token.startsWith("test:")) {
    // Local automated tests only: "test:<uid>:<email>"
    const [, uid, email] = token.split(":");
    return { uid, email, emailVerified: true };
  }
  const decoded = await getAdminAuth().verifyIdToken(token);
  return { uid: decoded.uid, email: (decoded.email || "").toLowerCase(), emailVerified: !!decoded.email_verified };
}

/** Verifies the Firebase ID token and loads the user's company membership. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "Please sign in." });
    return;
  }
  try {
    const user = await verifyToken(token);
    const ctx: AuthContext = { ...user };
    const userDoc = await store.get(paths.user(user.uid));
    if (userDoc?.orgId) {
      const org = await store.get(paths.org(userDoc.orgId));
      if (org) {
        ctx.orgId = userDoc.orgId;
        ctx.role = userDoc.role || "member";
        ctx.org = org;
      }
    }
    req.auth = ctx;
    next();
  } catch (err) {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

export function requireOrg(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.orgId) {
    res.status(403).json({ error: "Finish setting up your company first.", code: "NO_ORG" });
    return;
  }
  next();
}

export function requireSubscription(req: Request, res: Response, next: NextFunction) {
  const status = req.auth?.org?.subscription?.status;
  if (!ACCESS_STATUSES.has(status)) {
    res.status(402).json({ error: "Start your free trial or update billing to continue.", code: "NO_SUBSCRIPTION" });
    return;
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.role || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: "Only the account owner or an admin can do that." });
      return;
    }
    next();
  };
}

/** Narrow helper for handlers that run after requireOrg. */
export function orgIdOf(req: Request): string {
  return req.auth!.orgId!;
}
