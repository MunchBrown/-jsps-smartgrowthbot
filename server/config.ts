// Central place for environment configuration. Every secret comes from the
// environment; nothing sensitive is committed to the repo.

export const APP_NAME = "Smart Growth Bot Painting AI";

const env = process.env;

export const config = {
  isProd: env.NODE_ENV === "production",
  port: Number(env.PORT || 3000),
  // Public URL of this app, used for links in emails/texts and OAuth callbacks.
  appUrl: (env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),

  // 32-byte key (64 hex chars or base64) used to encrypt per-company secrets
  // such as Twilio auth tokens, Vapi keys and Google refresh tokens.
  encryptionKey: env.ENCRYPTION_KEY || "",

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY || "",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
    connectWebhookSecret: env.STRIPE_CONNECT_WEBHOOK_SECRET || "",
    prices: {
      starter: env.STRIPE_PRICE_STARTER || "",
      professional: env.STRIPE_PRICE_PROFESSIONAL || "",
      premium: env.STRIPE_PRICE_PREMIUM || "",
    },
    trialDays: Number(env.TRIAL_DAYS || 14),
    // Optional platform fee on invoice payments, in basis points (100 = 1%).
    platformFeeBps: Number(env.PLATFORM_FEE_BPS || 0),
  },

  google: {
    clientId: env.GOOGLE_CLIENT_ID || "",
    clientSecret: env.GOOGLE_CLIENT_SECRET || "",
  },

  // Optional platform email sender used when a company has not connected Gmail.
  resend: {
    apiKey: env.RESEND_API_KEY || "",
    from: env.EMAIL_FROM || "",
  },

  // Local development / automated tests only. Refused in production.
  testAuth: env.ALLOW_TEST_AUTH === "1",
  memoryStore: env.DATA_STORE === "memory",
};

export function assertSafeConfig() {
  if (config.isProd) {
    if (config.testAuth) throw new Error("ALLOW_TEST_AUTH must never be enabled in production.");
    if (config.memoryStore) throw new Error("DATA_STORE=memory must never be used in production.");
    // Missing ENCRYPTION_KEY doesn't stop startup (so a first deploy can come up
    // before secrets are added), but every feature that stores secrets refuses
    // to run until it is set — see crypto.ts. /api/health reports it.
  }
}

/** Settings still missing in production, shown by /api/health. Names only, never values. */
export function missingSettings(): string[] {
  const required: [string, string][] = [
    ["APP_URL", process.env.APP_URL || ""],
    ["ENCRYPTION_KEY", config.encryptionKey],
    ["GEMINI_API_KEY", process.env.GEMINI_API_KEY || ""],
  ];
  return required.filter(([, v]) => !v).map(([k]) => k);
}
