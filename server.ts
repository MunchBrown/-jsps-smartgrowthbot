// Smart Growth Bot Painting AI — server entry point.
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config, assertSafeConfig, APP_NAME, missingSettings } from "./server/config";
import { requireAuth, requireOrg, requireSubscription } from "./server/auth";
import { planFor } from "./server/plans";
import { ValidationError } from "./server/validate";
import { IntegrationError } from "./server/integrations";
import accountRouter from "./server/routes/account";
import billingRouter, { stripeWebhookRouter } from "./server/routes/billing";
import integrationsRouter from "./server/routes/integrations";
import adminRouter from "./server/routes/admin";
import publicRouter from "./server/routes/public";
import aiRouter from "./server/routes/ai";
import coreRouter, { NotFound } from "./server/routes/core";

assertSafeConfig();

export const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: config.isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.firebaseapp.com"],
            frameSrc: ["'self'", "https://*.firebaseapp.com"],
            formAction: ["'self'", "https://checkout.stripe.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  }),
);

// 1. Stripe webhooks need the raw body, so they go before any JSON parser.
app.use(stripeWebhookRouter);

// 2. Public pages and partner webhooks (each brings its own body parser).
app.use(publicRouter);

// 3. Everything else speaks JSON.
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_req, res) => {
  const missing = missingSettings();
  res.json({ status: missing.length ? "needs-setup" : "ok", service: APP_NAME, missing, time: new Date().toISOString() });
});

// General API rate limit per IP (generous; protects against abuse).
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.use(accountRouter);
app.use(billingRouter);
app.use(integrationsRouter);
app.use(adminRouter);

// AI tools: signed-in, subscribed companies only, with a daily allowance per company.
const aiUsage = new Map<string, { day: string; count: number }>();
function aiAllowance(req: express.Request, res: express.Response, next: express.NextFunction) {
  const orgId = req.auth!.orgId!;
  const day = new Date().toISOString().slice(0, 10);
  const entry = aiUsage.get(orgId);
  const current = entry && entry.day === day ? entry : { day, count: 0 };
  const limit = planFor(req.auth!.org).aiRequestsPerDay;
  if (current.count >= limit) {
    res.status(429).json({ error: `You've used today's ${limit} AI requests on your plan. It resets at midnight UTC.` });
    return;
  }
  current.count++;
  aiUsage.set(orgId, current);
  next();
}
const AI_PATHS = [
  "/seo", "/score-lead", "/upsells", "/chat", "/sop", "/advisor", "/phone/receptionist", "/phone/optimize-script",
  "/phone/generate-summary", "/strategic-advisor", "/generate-sop", "/room-photo-estimate", "/gov/opportunities",
  "/gov/generate-proposal", "/ai/complete", "/llm-proxy",
];
const aiGate = express.Router();
aiGate.use((req, _res, next) => (AI_PATHS.includes(req.path) ? next() : next("router")));
aiGate.use(requireAuth, requireOrg, requireSubscription, aiAllowance, aiRouter);
app.use("/api", aiGate);

// Local development/testing only (refused in production by assertSafeConfig):
// lets an automated browser test skip Stripe checkout.
if (config.testAuth && !config.isProd) {
  app.post("/api/dev/activate", requireAuth, requireOrg, async (req, res) => {
    const { store, paths } = await import("./server/store");
    await store.set(paths.org(req.auth!.orgId!), { plan: "professional", subscription: { status: "trialing", trialEnd: new Date(Date.now() + 14 * 86400000).toISOString() } });
    res.json({ ok: true });
  });
}

app.use(coreRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Central error handler: friendly messages for known errors, generic for the rest.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof NotFound) return res.status(404).json({ error: err.message });
  if (err instanceof IntegrationError) return res.status(err.status).json({ error: err.message });
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "That upload is too large." });
  if (err?.type?.startsWith?.("Stripe")) {
    console.error("[stripe]", err.message);
    return res.status(502).json({ error: `Stripe: ${err.message}` });
  }
  const status = Number(err?.status) || 500;
  if (status >= 500) console.error("[server]", err);
  res.status(status).json({ error: status >= 500 ? "Something went wrong on our side. Please try again." : err.message });
});

async function bootstrap() {
  if (!config.isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false, maxAge: "1h" }));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`[${APP_NAME}] listening on http://localhost:${config.port}`);
  });
}

if (process.env.NO_LISTEN !== "1") {
  bootstrap().catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
}
