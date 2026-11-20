import { auth } from "./firebase";

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  return { Authorization: `Bearer ${await user.getIdToken()}` };
}

/** Calls the Smart Growth Bot API as the signed-in user. Throws ApiError with a readable message. */
export async function api<T = any>(path: string, opts: { method?: string; body?: any } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeader()) };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await nativeFetch(path, {
      method: opts.method || (opts.body !== undefined ? "POST" : "GET"),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your internet connection.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status}).`, res.status, data.code);
  return data as T;
}

const nativeFetch: typeof fetch = window.fetch.bind(window);

// Paths that change real company records. While a "Preview" screen is open,
// writes to these are blocked so sample screens can't alter real data.
const PROTECTED_WRITES = /^\/api\/(leads|estimates|appointments|invoices|team|org|integrations|billing)(\/|$|\?)/;
let previewMode = false;
export function setPreviewMode(on: boolean) {
  previewMode = on;
}

/**
 * The original modules call fetch("/api/...") directly. This wrapper adds the
 * signed-in user's token to those same-origin API calls.
 */
export function installAuthenticatedFetch() {
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const sameOriginApi = url.startsWith("/api/") || url.startsWith(`${location.origin}/api/`);
    if (!sameOriginApi) return nativeFetch(input as any, init);
    const path = url.replace(location.origin, "");
    const method = (init?.method || "GET").toUpperCase();
    if (previewMode && method !== "GET" && PROTECTED_WRITES.test(path)) {
      return new Response(JSON.stringify({ error: "Preview screens use sample data and can't change your real records." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const headers = new Headers(init?.headers || {});
    for (const [k, v] of Object.entries(await authHeader())) headers.set(k, v);
    return nativeFetch(input as any, { ...init, headers });
  };
}

export const money = (n: number | undefined | null) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n) || 0);

export const shortDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

export const dateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
