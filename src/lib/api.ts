/**
 * Typed BFF API & OIDC Session Client for the DGIX Platform.
 */

const configuredBff =
  typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_BFF_URL === "string"
    ? process.env.NEXT_PUBLIC_BFF_URL.trim()
    : "";

export const BFF_BASE = (
  configuredBff
    ? configuredBff
    : typeof window !== "undefined"
      ? ""
      : (typeof process !== "undefined" && process.env.DGIX_INTERNAL_BFF_URL) || "http://127.0.0.1:18118"
).replace(/\/+$/, "");

export const SESSION_STORAGE_KEY = "dgix.bff.session.v2";
export const ULTIMATE_WORD_RE = /\bultimate\b/i;

export type PortalRole = "buyer" | "seller" | "staff";

export type DgixRole =
  | "dgix_admin"
  | "legal"
  | "reviewer"
  | "finance"
  | "council_member"
  | "advisor"
  | "auditor"
  | "partner_admin"
  | "pao"
  | "buyer";

export interface AuthActor {
  sub: string;
  username: string;
  email: string;
  full_name: string;
  portal_role: PortalRole;
  primary_dgix_role: string;
  roles: string[];
  partner_id?: string | null;
  buyer_id?: string | null;
  cell: string;
  mfa_level: string;
  title: string;
  company_name: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string | null;
  expires_in: number;
  expires_at?: number;
  user: AuthActor;
}

export class ApiError extends Error {
  status: number;
  title: string;
  detail: string;
  reasons: string[];

  constructor(status: number, title: string, detail: string, reasons: string[] = []) {
    super(detail || title || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.reasons = reasons;
  }
}

export function hasProhibitedUltimateWording(...values: (string | undefined | null)[]): boolean {
  return values.some((v) => Boolean(v && ULTIMATE_WORD_RE.test(v)));
}

export function syncRoleCookie(role: PortalRole | null): void {
  if (typeof document === "undefined") return;
  if (!role) {
    document.cookie = "dgix_role=; path=/; max-age=0; SameSite=Lax";
    return;
  }
  document.cookie = `dgix_role=${role}; path=/; max-age=86400; SameSite=Lax`;
}

export function loadStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.access_token || !parsed?.user?.sub) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    syncRoleCookie(null);
    return;
  }
  const withExpiry: AuthSession = {
    ...session,
    expires_at: session.expires_at ?? Date.now() + Math.max(30, session.expires_in - 20) * 1000,
  };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(withExpiry));
  syncRoleCookie(withExpiry.user.portal_role);
}

export function makeIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function parseErrorResponse(resp: Response): Promise<ApiError> {
  const ct = resp.headers.get("content-type") ?? "";
  if (ct.includes("json")) {
    try {
      const body = (await resp.json()) as Record<string, unknown>;
      const title = typeof body.title === "string" ? body.title : `HTTP ${resp.status}`;
      let detail = typeof body.detail === "string" ? body.detail : "";
      const reasons = Array.isArray(body.reasons)
        ? body.reasons.filter((r): r is string => typeof r === "string")
        : [];
      if (!detail && Array.isArray(body.errors) && body.errors.length > 0) {
        const first = body.errors[0] as Record<string, unknown>;
        const loc = Array.isArray(first.loc) ? first.loc.join(".") : "";
        const msg = typeof first.msg === "string" ? first.msg : "Invalid field";
        detail = loc ? `${loc}: ${msg}` : msg;
      }
      if (reasons.length > 0 && !detail.includes(reasons[0])) {
        detail = detail ? `${detail} (${reasons.join("; ")})` : reasons.join("; ");
      }
      return new ApiError(resp.status, title, detail || title, reasons);
    } catch {
      // fall through
    }
  }
  const raw = (await resp.text().catch(() => "")).trim();
  // Non-JSON replies come from a proxy or gateway (an HTML error page, or a bare 404/5xx when the
  // BFF isn't reachable). Never show that markup to people: give a readable message instead.
  const looksLikeMarkup = raw.startsWith("<") || raw.length > 160;
  const gateway = [404, 502, 503, 504].includes(resp.status);
  const detail =
    looksLikeMarkup || gateway || !raw
      ? gateway || looksLikeMarkup
        ? "The DGIX service can't be reached right now. Please try again shortly."
        : resp.statusText || `Request failed (${resp.status})`
      : raw;
  return new ApiError(resp.status, `HTTP ${resp.status}`, detail);
}

let refreshInFlight: Promise<AuthSession | null> | null = null;

async function ensureFreshToken(): Promise<string | null> {
  const session = loadStoredSession();
  if (!session) return null;
  const expiresAt = session.expires_at ?? 0;
  if (expiresAt > Date.now() + 10_000) {
    return session.access_token;
  }
  if (!session.refresh_token) {
    return session.access_token;
  }
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const resp = await fetch(`${BFF_BASE}/bff/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
        if (!resp.ok) {
          return null;
        }
        const refreshed = (await resp.json()) as AuthSession;
        saveStoredSession(refreshed);
        return refreshed;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  const next = await refreshInFlight;
  return next?.access_token ?? session.access_token;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  rawBody?: BodyInit;
  contentType?: string;
  headers?: Record<string, string>;
  auth?: boolean;
  idempotent?: boolean;
}

export async function apiFetch<T = unknown>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    rawBody,
    contentType,
    headers: extraHeaders,
    auth = true,
    idempotent = false,
  } = opts;

  const url = path.startsWith("http") ? path : `${BFF_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extraHeaders ?? {}),
  };

  if (auth) {
    const token = await ensureFreshToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  if (idempotent && !headers["Idempotency-Key"]) {
    headers["Idempotency-Key"] = makeIdempotencyKey();
  }

  let payload: BodyInit | undefined = rawBody;
  if (body !== undefined && rawBody === undefined) {
    headers["Content-Type"] = contentType ?? "application/json";
    payload = typeof body === "string" ? body : JSON.stringify(body);
  } else if (contentType) {
    headers["Content-Type"] = contentType;
  }

  let resp = await fetch(url, { method, headers, body: payload });

  if (resp.status === 401 && auth) {
    const cur = loadStoredSession();
    if (cur?.refresh_token) {
      // Force refresh by zeroing expires_at
      saveStoredSession({ ...cur, expires_at: 0 });
      const freshToken = await ensureFreshToken();
      if (freshToken && freshToken !== cur.access_token) {
        headers.Authorization = `Bearer ${freshToken}`;
        resp = await fetch(url, { method, headers, body: payload });
      }
    }
  }

  if (!resp.ok) {
    throw await parseErrorResponse(resp);
  }
  if (resp.status === 204) {
    return undefined as T;
  }
  const text = await resp.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function safeGet<T>(path: string, fallback: T, auth = true): Promise<T> {
  try {
    return await apiFetch<T>(path, { method: "GET", auth });
  } catch {
    return fallback;
  }
}

/* ---------- Auth BFF Endpoints ---------- */

export async function loginWithPassword(identifier: string, password: string): Promise<AuthSession> {
  const session = await apiFetch<AuthSession>("/bff/auth/login", {
    method: "POST",
    auth: false,
    body: { identifier, password },
  });
  saveStoredSession(session);
  return session;
}

export async function registerOrganization(input: {
  account_type: "buyer" | "seller";
  full_name: string;
  email: string;
  password: string;
  company_name?: string;
  phone_number?: string;
  dial_code?: string;
  entity_type?: "INDIVIDUAL" | "COMPANY";
  country_code?: string;
  trade_license_ref?: string;
  skip_partner_bootstrap?: boolean;
}): Promise<AuthSession> {
  const session = await apiFetch<AuthSession>("/bff/auth/register", {
    method: "POST",
    auth: false,
    body: {
      ...input,
      company_name: input.company_name || input.full_name,
      country_code: input.country_code ?? "BGD",
      entity_type: input.entity_type ?? "COMPANY",
      phone_number: input.phone_number ?? "",
      dial_code: input.dial_code ?? "+880",
    },
  });
  saveStoredSession(session);
  return session;
}

export async function submitPublicInquiry(input: {
  mode: "buy" | "sell";
  full_name: string;
  email: string;
  company: string;
  country: string;
  need: string;
}): Promise<{ status: string; reference: string; requirement_id?: string | null }> {
  return apiFetch<{ status: string; reference: string; requirement_id?: string | null }>(
    "/bff/v1/public/inquiries",
    {
      method: "POST",
      auth: Boolean(loadStoredSession()),
      body: input,
    },
  );
}

/* ---------- Public Catalogue & Evidence Binary Helpers ---------- */

export interface PublicCatalogueResponse {
  disclaimer: string;
  count: number;
  listings: LiveListing[];
}

export interface LiveListing {
  listing_id: string;
  product_id: string;
  product_version_id: string;
  partner_id: string;
  country_code: string;
  edition: string;
  title: string;
  description: string;
  category: string;
  capabilities: string[];
  classification: "globally_ready" | "pilot_eligible";
  classification_badge: string;
  readiness_score: number | null;
  disclaimer: string;
  claims_snapshot: Array<{
    claim_id?: string | null;
    statement: string;
    label: "certified" | "verified" | "declared" | "inferred" | "estimated" | string;
    evidence_id?: string | null;
  }>;
  display_metadata: Record<string, unknown>;
  approval_record_id: string;
  agreement_id: string;
  price_list_id: string;
  unit_price: string | number;
  currency: string;
  status: string;
  suspension_reason?: string | null;
  published_at: string;
}

export async function fetchPublicCatalogue(params?: {
  country_code?: string;
  category?: string;
  classification?: string;
}): Promise<PublicCatalogueResponse> {
  const qs = new URLSearchParams();
  if (params?.country_code) qs.set("country_code", params.country_code);
  if (params?.category) qs.set("category", params.category);
  if (params?.classification) qs.set("classification", params.classification);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return safeGet<PublicCatalogueResponse>(
    `/bff/v1/public/listings${query}`,
    {
      disclaimer:
        "Listings reflect verified assessment scope at a point in time, not an unconditional guarantee of fitness for every buyer context.",
      count: 0,
      listings: [],
    },
    false,
  );
}

export async function uploadEvidenceBinary(params: {
  productVersionId: string;
  evidenceType: string;
  file: File | Blob;
  filename: string;
  expiresAt?: string;
  isSourceCode?: boolean;
  partnerId?: string;
}): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams({
    product_version_id: params.productVersionId,
    evidence_type: params.evidenceType,
    filename: params.filename,
  });
  if (params.expiresAt) qs.set("expires_at", params.expiresAt);
  if (params.isSourceCode) qs.set("is_source_code", "true");
  if (params.partnerId) qs.set("partner_id", params.partnerId);

  return apiFetch<Record<string, unknown>>(`/bff/v1/evidence/upload?${qs.toString()}`, {
    method: "POST",
    rawBody: params.file,
    contentType: params.file.type || "application/octet-stream",
  });
}

export async function downloadEvidenceBlob(evidenceId: string, fallbackName = "evidence.pdf"): Promise<void> {
  const token = await ensureFreshToken();
  const resp = await fetch(`${BFF_BASE}/bff/v1/evidence/${evidenceId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!resp.ok) {
    throw await parseErrorResponse(resp);
  }
  const blob = await resp.blob();
  const cd = resp.headers.get("content-disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(cd);
  const name = match?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildSandboxCheckoutRedirectUrl(
  sandboxCheckoutUrl: string,
  returnUrl?: string,
): string {
  const ret =
    returnUrl ??
    (typeof window !== "undefined" ? `${window.location.origin}/buyer/billing` : "http://localhost:3000/buyer/billing");
  const normalized = sandboxCheckoutUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1):18118\/checkout\//i, "/checkout/");
  const sep = normalized.includes("?") ? "&" : "?";
  return `${normalized}${sep}return_url=${encodeURIComponent(ret)}`;
}

