import { initializeApp, getApps, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

// Firebase Admin initialisation.
// - On Google Cloud Run in the same project, Application Default Credentials work automatically.
// - Elsewhere, set FIREBASE_SERVICE_ACCOUNT to the service-account JSON (raw or base64).
// - FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST are honoured for local testing.

let app: App | null = null;

function webConfig(): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
  } catch {
    return {};
  }
}
const projectIdFromWebConfig = (): string | undefined => webConfig().projectId;

function getApp(): App {
  if (app) return app;
  if (getApps().length) return (app = getApps()[0]!);
  const projectId = process.env.FIREBASE_PROJECT_ID || projectIdFromWebConfig();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const json = JSON.parse(raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
    app = initializeApp({ credential: cert(json), projectId: json.project_id || projectId });
  } else if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    app = initializeApp({ projectId });
  } else {
    app = initializeApp({ credential: applicationDefault(), projectId });
  }
  return app;
}

let db: Firestore | null = null;
export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp(), process.env.FIRESTORE_DATABASE_ID || webConfig().firestoreDatabaseId || "(default)");
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
}

export function getAdminAuth(): Auth {
  return getAuth(getApp());
}
