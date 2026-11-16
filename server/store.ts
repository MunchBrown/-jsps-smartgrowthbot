// Data access layer. Production uses Cloud Firestore through the Firebase
// Admin SDK (which bypasses client security rules — the browser never talks
// to Firestore directly). A memory backend exists only for local tests.
import { config } from "./config";
import { getFirestoreDb } from "./firebase";
import { randomToken } from "./crypto";

export type Where = [field: string, value: any];

export interface ListOptions {
  where?: Where[];
  orderBy?: string; // sorted newest-first in memory after the query
  limit?: number;
}

export interface Store {
  get(path: string): Promise<any | null>;
  set(path: string, data: any, merge?: boolean): Promise<void>;
  /** Creates a document only if it does not exist. Returns false if it already existed. */
  create(path: string, data: any): Promise<boolean>;
  remove(path: string): Promise<void>;
  add(collectionPath: string, data: any): Promise<string>;
  list(collectionPath: string, opts?: ListOptions): Promise<any[]>;
}

function sortAndLimit(rows: any[], opts?: ListOptions) {
  const field = opts?.orderBy || "createdAt";
  rows.sort((a, b) => String(b[field] ?? "").localeCompare(String(a[field] ?? "")));
  return opts?.limit ? rows.slice(0, opts.limit) : rows;
}

class FirestoreStore implements Store {
  private get db() {
    return getFirestoreDb();
  }
  async get(path: string) {
    const snap = await this.db.doc(path).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }
  async set(path: string, data: any, merge = true) {
    await this.db.doc(path).set(stripUndefined(data), { merge });
  }
  async create(path: string, data: any) {
    try {
      await this.db.doc(path).create(stripUndefined(data));
      return true;
    } catch (err: any) {
      if (err?.code === 6 || /already exists/i.test(String(err?.message))) return false;
      throw err;
    }
  }
  async remove(path: string) {
    await this.db.doc(path).delete();
  }
  async add(collectionPath: string, data: any) {
    const id = randomToken(12);
    await this.db.doc(`${collectionPath}/${id}`).set(stripUndefined({ ...data, id }));
    return id;
  }
  async list(collectionPath: string, opts?: ListOptions) {
    let q: FirebaseFirestore.Query = this.db.collection(collectionPath);
    for (const [field, value] of opts?.where || []) q = q.where(field, "==", value);
    const snap = await q.limit(2000).get();
    return sortAndLimit(snap.docs.map((d) => ({ id: d.id, ...d.data() })), opts);
  }
}

class MemoryStore implements Store {
  private docs = new Map<string, any>();
  async get(path: string) {
    const d = this.docs.get(path);
    return d ? { id: path.split("/").pop(), ...structuredClone(d) } : null;
  }
  async set(path: string, data: any, merge = true) {
    const prev = merge ? this.docs.get(path) || {} : {};
    this.docs.set(path, deepMerge(prev, stripUndefined(structuredClone(data))));
  }
  async create(path: string, data: any) {
    if (this.docs.has(path)) return false;
    this.docs.set(path, stripUndefined(structuredClone(data)));
    return true;
  }
  async remove(path: string) {
    this.docs.delete(path);
  }
  async add(collectionPath: string, data: any) {
    const id = randomToken(12);
    await this.set(`${collectionPath}/${id}`, { ...data, id }, false);
    return id;
  }
  async list(collectionPath: string, opts?: ListOptions) {
    const prefix = collectionPath + "/";
    const rows: any[] = [];
    for (const [path, d] of this.docs) {
      if (!path.startsWith(prefix) || path.slice(prefix.length).includes("/")) continue;
      if ((opts?.where || []).every(([f, v]) => getField(d, f) === v)) {
        rows.push({ id: path.slice(prefix.length), ...structuredClone(d) });
      }
    }
    return sortAndLimit(rows, opts);
  }
}

function getField(obj: any, dotted: string) {
  return dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function deepMerge(a: any, b: any): any {
  if (typeof a !== "object" || a === null || Array.isArray(a)) return b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = typeof v === "object" && v !== null && !Array.isArray(v) ? deepMerge(a[k], v) : v;
  }
  return out;
}

export function stripUndefined<T>(v: T): T {
  if (Array.isArray(v)) return v.map(stripUndefined) as any;
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    const out: any = {};
    for (const [k, val] of Object.entries(v)) if (val !== undefined) out[k] = stripUndefined(val);
    return out;
  }
  return v;
}

export const store: Store = config.memoryStore ? new MemoryStore() : new FirestoreStore();

// Paths ---------------------------------------------------------------------
export const paths = {
  user: (uid: string) => `users/${uid}`,
  org: (orgId: string) => `orgs/${orgId}`,
  orgCol: (orgId: string, col: string) => `orgs/${orgId}/${col}`,
  orgDoc: (orgId: string, col: string, id: string) => `orgs/${orgId}/${col}/${id}`,
  secrets: (orgId: string) => `orgSecrets/${orgId}`,
  invite: (email: string) => `invites/${email.toLowerCase()}`,
  publicToken: (token: string) => `publicTokens/${token}`,
  stripeEvent: (id: string) => `stripeEvents/${id}`,
};

export const nowIso = () => new Date().toISOString();
