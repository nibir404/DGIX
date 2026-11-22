"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type AuthSession,
  type LiveListing,
  apiFetch,
  buildSandboxCheckoutRedirectUrl,
  fetchPublicCatalogue,
  loadStoredSession,
  loginWithPassword,
  registerOrganization,
  safeGet,
  saveStoredSession,
  uploadEvidenceBinary,
} from "./api";
import { CHECK_META } from "./seed";
import type {
  BuyerRequest,
  Category,
  Check,
  Company,
  Db,
  Demo,
  Gate,
  Invoice,
  Licence,
  Offer,
  Payout,
  Product,
  Project,
  Role,
  SupportCase,
  User,
} from "./types";

const SESSION_COOKIE = "dgix_uid";
const DEFAULT_DISCLAIMER =
  "Listings reflect verified assessment scope at a point in time, not an unconditional guarantee of fitness for every buyer context.";

export interface LiveBackendState {
  listings: LiveListing[];
  partners: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  versionsByProduct: Record<string, Array<Record<string, unknown>>>;
  paoBindings: Array<Record<string, unknown>>;
  reviewers: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  claims: Array<Record<string, unknown>>;
  assessments: Array<Record<string, unknown>>;
  gapLetters: Array<Record<string, unknown>>;
  approvals: Array<Record<string, unknown>>;
  countryReadiness: Array<Record<string, unknown>>;
  agreements: Array<Record<string, unknown>>;
  costFloors: Array<Record<string, unknown>>;
  priceLists: Array<Record<string, unknown>>;
  requirements: Array<Record<string, unknown>>;
  shortlists: Array<Record<string, unknown>>;
  offers: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  demoBookings: Array<Record<string, unknown>>;
  fxRates: Array<Record<string, unknown>>;
  invoices: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  payouts: Array<Record<string, unknown>>;
  refunds: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  incidents: Array<Record<string, unknown>>;
  auditEntries: Array<Record<string, unknown>>;
  auditVerification: {
    ok: boolean;
    count: number;
    first_broken_seq?: number | null;
    reason?: string | null;
    last_entry_hash?: string | null;
  } | null;
}

const EMPTY_LIVE: LiveBackendState = {
  listings: [],
  partners: [],
  products: [],
  versionsByProduct: {},
  paoBindings: [],
  reviewers: [],
  evidence: [],
  claims: [],
  assessments: [],
  gapLetters: [],
  approvals: [],
  countryReadiness: [],
  agreements: [],
  costFloors: [],
  priceLists: [],
  requirements: [],
  shortlists: [],
  offers: [],
  orders: [],
  demoBookings: [],
  fxRates: [],
  invoices: [],
  payments: [],
  payouts: [],
  refunds: [],
  projects: [],
  incidents: [],
  auditEntries: [],
  auditVerification: null,
};

type Ctx = {
  db: Db;
  ready: boolean;
  user: User | null;
  // Live BFF state & auth
  authSession: AuthSession | null;
  catalogueDisclaimer: string;
  live: LiveBackendState;
  syncing: boolean;
  lastError: string | null;
  clearError: () => void;
  refreshLive: () => Promise<void>;
  loginLive: (identifier: string, password: string) => Promise<User>;
  registerLive: (input: {
    account_type: "buyer" | "seller";
    full_name: string;
    email: string;
    password: string;
    company_name: string;
    country_code?: string;
    skip_partner_bootstrap?: boolean;
  }) => Promise<User>;
  applyPartnerLive: (input: {
    companyName: string;
    registrationNumber: string;
    countryCode: string;
    directorName: string;
    directorRole: string;
    referenceOrg: string;
    referenceContact: string;
    referenceEmail: string;
    productName: string;
    category: Category;
    tagline: string;
    description: string;
    markets: string[];
    priceFrom: number;
    fullName?: string;
    email?: string;
    password?: string;
  }) => Promise<User>;
  uploadRealEvidence: (params: {
    productId: string;
    productVersionId?: string;
    evidenceType: string;
    file: File | Blob;
    filename: string;
    expiresAt?: string;
    isSourceCode?: boolean;
  }) => Promise<Record<string, unknown>>;
  signIn: (email: string, password: string) => User | null;
  signOut: () => void;
  reset: () => void;
  createRequest: (
    r: Pick<BuyerRequest, "title" | "need" | "country" | "budget" | "users" | "goLive">,
  ) => BuyerRequest;
  bookDemo: (productId: string, requestId?: string) => void;
  acceptOffer: (offerId: string) => void;
  declineOffer: (offerId: string) => void;
  acceptMilestone: (projectId: string, milestoneId: string) => void;
  rejectMilestone: (projectId: string, milestoneId: string, reason: string) => void;
  payInvoice: (invoiceId: string) => void;
  openCase: (title: string, body: string, projectId?: string) => void;
  replyCase: (caseId: string, body: string) => void;
  resolveCase: (caseId: string) => void;
  uploadEvidence: (productId: string, checkKey: string) => void;
  confirmDemo: (demoId: string) => void;
  submitMilestone: (projectId: string, milestoneId: string) => void;
  confirmShortlist: (requestId: string, productIds?: string[]) => void;
  approvePayouts: (ids: string[]) => void;
  sendOffer: (offerId: string) => void;
  approveCheck: (productId: string, checkKey: string) => void;
  verifyPayment: (invoiceId: string) => void;
  markRead: (notificationId: string) => void;
  completeDemo: (demoId: string) => void;
  rateDemo: (demoId: string, rating: NonNullable<Demo["rating"]>, notes?: string) => void;
  createOffer: (input: {
    requestId: string;
    productId: string;
    price: number;
    sla: string;
    warranty: string;
    exit: string;
    milestones: { title: string; amount: number }[];
    send: boolean;
  }) => Offer;
  addProduct: (input: {
    name: string;
    category: Category;
    tagline: string;
    description: string;
    markets: string[];
    priceFrom: number;
  }) => string;
  updateProfile: (patch: Partial<Pick<User, "name" | "title" | "email">>) => void;
  changePassword: (current: string, next: string) => boolean;
};

const StoreCtx = createContext<Ctx | null>(null);
export const portalHome: Record<Role, string> = { buyer: "/buyer", seller: "/seller", staff: "/admin" };

export function staffHomeForRole(
  user?: Pick<User, "role" | "primaryDgixRole" | "dgixRoles"> | null,
): string {
  const roles = new Set<string>(user?.dgixRoles ?? []);
  const primary = user?.primaryDgixRole ?? "";
  if (primary === "dgix_admin" || roles.has("dgix_admin")) return "/admin";
  if (primary === "advisor" || roles.has("advisor")) return "/admin";
  if (primary === "reviewer" || roles.has("reviewer")) return "/admin/review";
  if (primary === "legal" || roles.has("legal")) return "/admin/partners";
  if (primary === "finance" || roles.has("finance")) return "/admin/finance";
  if (primary === "council_member" || roles.has("council_member")) return "/admin/governance";
  if (primary === "auditor" || roles.has("auditor")) return "/admin/governance";
  return "/admin";
}

export function homeForUser(user: User): string {
  return user.role === "staff" ? staffHomeForRole(user) : portalHome[user.role];
}

const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const today = () => new Date().toISOString();

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DG"
  );
}

function toMarketLabel(iso: string): string {
  const map: Record<string, string> = {
    SAU: "KSA",
    ARE: "UAE",
    UAE: "UAE",
    QAT: "Qatar",
    USA: "USA",
    BGD: "BGD",
  };
  return map[iso.toUpperCase()] ?? iso.toUpperCase();
}

function toIsoCountry(input: string): string {
  const norm = input.trim().toUpperCase();
  if (norm.includes("EMIRATES") || norm === "UAE" || norm === "ARE") return "UAE";
  if (norm.includes("SAUDI") || norm === "KSA" || norm === "SAU") return "SAU";
  if (norm.includes("QATAR") || norm === "QAT") return "QAT";
  if (norm.includes("UNITED STATES") || norm === "USA") return "USA";
  if (norm.includes("BANGLADESH") || norm === "BGD") return "BGD";
  return norm.length === 3 ? norm : "UAE";
}

function visualForCategory(cat: string, hint?: unknown): Product["visual"] {
  if (typeof hint === "string") {
    if (["hospital", "people", "bars", "bag", "campus", "ai", "ledger"].includes(hint)) {
      return hint as Product["visual"];
    }
    if (hint === "hr") return "people";
  }
  const map: Record<string, Product["visual"]> = {
    hr: "people",
    healthcare: "hospital",
    education: "campus",
    retail: "bag",
    ai: "ai",
    finance: "ledger",
    erp: "bars",
  };
  return map[cat] ?? "bars";
}

function normalizeCategory(raw: string): Category {
  const known: Category[] = [
    "erp",
    "hr",
    "crm",
    "retail",
    "healthcare",
    "education",
    "finance",
    "custom",
    "ai",
    "services",
  ];
  const lower = raw.toLowerCase() as Category;
  return known.includes(lower) ? lower : "erp";
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "product"
  );
}

function buildChecksFromScore(totalScore: number | null | undefined, gapNote?: string): Check[] {
  const ratio = totalScore != null ? Math.max(0, Math.min(1, totalScore / 100)) : 0;
  return CHECK_META.map((m) => {
    const sc = Math.round(m.max * ratio);
    return {
      ...m,
      score: sc,
      note: sc < m.max ? (gapNote ?? "Awaiting evidence & gate verification") : undefined,
    };
  });
}

function buildUserFromSession(session: AuthSession): User {
  const actor = session.user;
  const companyId =
    actor.portal_role === "buyer"
      ? (actor.buyer_id ?? "9c0d1e2f-3a4b-4c5d-8e6f-7a8b9c0d1e04")
      : actor.portal_role === "seller"
        ? (actor.partner_id ?? "partner-unknown")
        : "c-dgix";
  return {
    id: actor.sub,
    name: actor.full_name,
    initials: initialsOf(actor.full_name),
    email: actor.email,
    password: "",
    role: actor.portal_role,
    companyId,
    title: actor.title || actor.primary_dgix_role.replace(/_/g, " "),
    avatarTone:
      actor.portal_role === "buyer" ? "blue" : actor.portal_role === "seller" ? "green" : "amber",
    username: actor.username,
    primaryDgixRole: actor.primary_dgix_role,
    dgixRoles: actor.roles,
    mfaLevel: actor.mfa_level,
    cell: actor.cell,
    sodPairHint: null,
    partnerId: actor.partner_id ?? null,
    buyerId: actor.buyer_id ?? null,
  };
}

function hydrateDbFromLive(params: {
  activeSession: AuthSession | null;
  disclaimer: string;
  live: LiveBackendState;
}): Db {
  const { activeSession, disclaimer, live } = params;

  // 1. Users
  const advisorContact: User = {
    id: "dgix-advisory-desk",
    name: "DGIX Advisory Desk",
    initials: "DA",
    email: "advisory@dgix.daffodil.global",
    password: "",
    role: "staff",
    companyId: "c-dgix",
    title: "Commercial Advisory",
    avatarTone: "amber",
  };
  const users: User[] = activeSession
    ? [buildUserFromSession(activeSession), advisorContact]
    : [advisorContact];
  const advisorId = advisorContact.id;

  // 2. Companies
  const companiesMap = new Map<string, Company>();
  companiesMap.set("c-dgix", {
    id: "c-dgix",
    name: "DGIX Global Operations",
    kind: "dgix",
    country: "United Arab Emirates",
    city: "Dubai & Dhaka",
    verified: true,
  });
  companiesMap.set("9c0d1e2f-3a4b-4c5d-8e6f-7a8b9c0d1e04", {
    id: "9c0d1e2f-3a4b-4c5d-8e6f-7a8b9c0d1e04",
    name: "Gulf Horizon Holdings",
    kind: "buyer",
    country: "United Arab Emirates",
    city: "Dubai",
    verified: true,
    advisorId,
  });

  if (activeSession?.user.portal_role === "buyer" && activeSession.user.buyer_id) {
    if (!companiesMap.has(activeSession.user.buyer_id)) {
      companiesMap.set(activeSession.user.buyer_id, {
        id: activeSession.user.buyer_id,
        name: activeSession.user.company_name || "Enterprise Buyer",
        kind: "buyer",
        country: "United Arab Emirates",
        city: "Dubai",
        verified: true,
        advisorId,
      });
    }
  }
  if (activeSession?.user.portal_role === "seller" && activeSession.user.partner_id) {
    if (!companiesMap.has(activeSession.user.partner_id)) {
      companiesMap.set(activeSession.user.partner_id, {
        id: activeSession.user.partner_id,
        name: activeSession.user.company_name || "Software Partner",
        kind: "partner",
        country: "Bangladesh",
        city: "Dhaka",
        verified: false,
        advisorId,
      });
    }
  }

  for (const reqRow of live.requirements) {
    const bid = String(reqRow.buyer_id ?? "");
    if (!bid || companiesMap.has(bid)) continue;
    const rfp = String(reqRow.rfp_text ?? "");
    const match = /^\[(?:Buyer|Partner) inquiry — ([^|]+)\|/.exec(rfp);
    const extractedName = match?.[1]?.trim() || `Enterprise Buyer (${bid.slice(0, 6).toUpperCase()})`;
    const cc = String(reqRow.country_code ?? "UAE");
    companiesMap.set(bid, {
      id: bid,
      name: extractedName,
      kind: "buyer",
      country: cc === "SAU" ? "Saudi Arabia" : cc === "QAT" ? "Qatar" : "United Arab Emirates",
      city: cc === "SAU" ? "Riyadh" : cc === "QAT" ? "Doha" : "Dubai",
      verified: true,
      advisorId,
    });
  }

  for (const rawPartner of live.partners) {
    const pid = String(rawPartner.partner_id ?? "");
    if (!pid) continue;
    const cc = String(rawPartner.country_code ?? "BGD");
    companiesMap.set(pid, {
      id: pid,
      name: String(rawPartner.legal_name ?? "Partner Ltd"),
      kind: "partner",
      country: cc === "ARE" || cc === "UAE" ? "United Arab Emirates" : "Bangladesh",
      city: cc === "ARE" || cc === "UAE" ? "Dubai" : "Dhaka",
      verified: Boolean(rawPartner.assessment_eligible) || rawPartner.kyb_status === "verified",
      advisorId,
      kybStatus: String(rawPartner.kyb_status ?? "pending"),
      sanctionsStatus: String(rawPartner.sanctions_status ?? "unscreened"),
      triageStatus: (rawPartner.triage_status as string | null) ?? null,
      portfolioOverlap: (rawPartner.portfolio_overlap as string | null) ?? null,
      assessmentEligible: Boolean(rawPartner.assessment_eligible),
      registrationNumber: String(rawPartner.registration_number ?? ""),
    });
  }

  // 3. Products (merge public listings + registered products + governance assessments)
  const productsMap = new Map<string, Product>();

  // Group listings by product_id
  for (const l of live.listings) {
    const pid = l.product_id;
    const market = toMarketLabel(l.country_code);
    const unitPrice = Number(l.unit_price) || 0;
    const meta = (l.display_metadata ?? {}) as Record<string, unknown>;
    const existing = productsMap.get(pid);
    if (existing) {
      if (!existing.markets.includes(market)) existing.markets.push(market);
      if (unitPrice > 0 && (existing.priceFrom === 0 || unitPrice < existing.priceFrom)) {
        existing.priceFrom = unitPrice;
      }
      existing.listingIdsByCountry = {
        ...(existing.listingIdsByCountry ?? {}),
        [l.country_code]: l.listing_id,
        [market]: l.listing_id,
      };
      continue;
    }

    const score = l.readiness_score ?? (l.classification === "globally_ready" ? 100 : 85);
    const partnerCo = companiesMap.get(l.partner_id);
    if (!partnerCo && typeof meta.partner_name === "string") {
      companiesMap.set(l.partner_id, {
        id: l.partner_id,
        name: String(meta.partner_name),
        kind: "partner",
        country: "Bangladesh",
        city: "Dhaka",
        verified: true,
        advisorId,
      });
    }
    productsMap.set(pid, {
      id: pid,
      slug: typeof meta.slug === "string" ? meta.slug : slugify(l.title),
      name: l.title,
      partnerId: l.partner_id,
      partnerName: partnerCo?.name ?? (typeof meta.partner_name === "string" ? meta.partner_name : "Verified Partner"),
      category: normalizeCategory(l.category),
      tagline:
        typeof meta.tagline === "string"
          ? meta.tagline
          : l.description.split(".")[0] || l.title,
      description: l.description,
      version: "1.0.0",
      markets: [market],
      gate: "PG5",
      status:
        l.status === "suspended"
          ? "suspended"
          : l.classification === "pilot_eligible"
            ? "pilot"
            : "listed",
      checks: buildChecksFromScore(score),
      metricLabel: typeof meta.metricLabel === "string" ? meta.metricLabel : "Readiness",
      metricValue: typeof meta.metricValue === "string" ? meta.metricValue : `${score}/100`,
      visual: visualForCategory(l.category, meta.visual),
      goLive: typeof meta.goLive === "string" ? meta.goLive : "4–6 weeks",
      priceFrom: unitPrice,
      reviewedOn: l.published_at?.slice(0, 10),
      versionId: l.product_version_id,
      listingId: l.listing_id,
      listingIdsByCountry: { [l.country_code]: l.listing_id, [market]: l.listing_id },
      priceListId: l.price_list_id,
      agreementId: l.agreement_id,
      approvalRecordId: l.approval_record_id,
      officialScore: score,
      classification: l.classification,
      classificationBadge: l.classification_badge,
      claimsSnapshot: l.claims_snapshot,
      capabilities: l.capabilities,
      disclaimer: l.disclaimer || disclaimer,
      suspensionReason: l.suspension_reason ?? null,
    });
  }

  // Enrich with unpublished / in-review products from product-registry & governance
  for (const rawProd of live.products) {
    const pid = String(rawProd.product_id ?? "");
    if (!pid) continue;
    const versions = live.versionsByProduct[pid] ?? [];
    const latestVer = versions[versions.length - 1];
    const verId = latestVer ? String(latestVer.version_id) : undefined;
    const semver = latestVer ? String(latestVer.semver) : "1.0.0";

    const assessment = live.assessments.find((a) => String(a.product_id) === pid);
    const gap = assessment
      ? live.gapLetters.find((g) => String(g.assessment_id) === String(assessment.assessment_id))
      : undefined;
    const priceListsForProd = live.priceLists.filter((pl) => String(pl.product_id) === pid);
    const minPrice = priceListsForProd.reduce((acc, pl) => {
      const n = Number(pl.unit_price) || 0;
      return n > 0 && (acc === 0 || n < acc) ? n : acc;
    }, 0);

    const existing = productsMap.get(pid);
    if (existing) {
      existing.version = semver;
      if (verId) existing.versionId = verId;
      existing.daffodilOwned = Boolean(rawProd.daffodil_owned);
      if (assessment) {
        existing.assessmentId = String(assessment.assessment_id);
      }
      continue;
    }

    const offScore =
      assessment && assessment.official_score != null ? Number(assessment.official_score) : null;
    const gates = Array.isArray(assessment?.gates)
      ? (assessment.gates as Array<Record<string, unknown>>)
      : [];
    const passedCount = gates.filter((g) => g.status === "accepted" || g.status === "passed").length;
    const gateOrder: Gate[] = ["PG0", "PG1", "PG2", "PG3", "PG4", "PG5"];
    const activeGate = gateOrder[Math.min(5, passedCount)] ?? "PG0";
    const countries = Array.isArray(assessment?.country_codes)
      ? (assessment.country_codes as string[]).map(toMarketLabel)
      : ["UAE"];
    const gapMissing = Array.isArray(gap?.missing_items)
      ? (gap.missing_items as string[])[0]
      : undefined;

    const prodClaims = verId
      ? live.claims
          .filter((c) => String(c.product_version_id) === verId)
          .map((c) => ({
            claim_id: String(c.claim_id),
            statement: String(c.statement),
            label: String(c.label),
            evidence_id: String(c.evidence_id),
          }))
      : [];

    const name = String(rawProd.name ?? "Product");
    const cat = normalizeCategory(String(rawProd.category ?? "erp"));
    productsMap.set(pid, {
      id: pid,
      slug: slugify(name),
      name,
      partnerId: String(rawProd.partner_id ?? ""),
      partnerName: companiesMap.get(String(rawProd.partner_id ?? ""))?.name,
      category: cat,
      tagline: `${cat.toUpperCase()} enterprise suite undergoing DGIX Gate ${activeGate} assurance`,
      description: `${name} registered on DGIX Product Registry (v${semver}).`,
      version: semver,
      markets: countries,
      gate: offScore === 100 ? "PG5" : activeGate,
      status: "in_review",
      checks: buildChecksFromScore(offScore ?? passedCount * 15, gapMissing),
      metricLabel: "Assurance stage",
      metricValue: offScore != null ? `${offScore}/100` : activeGate,
      visual: visualForCategory(cat),
      goLive: "6 weeks",
      priceFrom: minPrice || 32000,
      waitingOn: gapMissing ? `Partner gap letter: ${gapMissing}` : offScore != null ? "Product Council Quorum" : "DGIX Gate Review",
      versionId: verId,
      assessmentId: assessment ? String(assessment.assessment_id) : undefined,
      officialScore: offScore,
      classification: assessment ? String(assessment.classification ?? "not_ready") : "not_ready",
      claimsSnapshot: prodClaims,
      daffodilOwned: Boolean(rawProd.daffodil_owned),
      disclaimer,
    });
  }

  const products = Array.from(productsMap.values());

  // 4. Buyer Requests & Shortlists (enforcing BR-15 pending_advisor visibility!)
  const requests: BuyerRequest[] = live.requirements.map((req, idx) => {
    const reqId = String(req.requirement_id);
    const sl = live.shortlists.find((s) => String(s.requirement_id) === reqId);
    const slStatus = sl ? String(sl.status) : undefined;
    const confirmed = slStatus === "approved";
    const items = Array.isArray(sl?.items) ? (sl.items as Array<Record<string, unknown>>) : [];

    const hasAcceptedOffer = live.offers.some(
      (o) => String(o.requirement_id) === reqId && o.status === "accepted",
    );
    const hasSentOffer = live.offers.some(
      (o) => String(o.requirement_id) === reqId && o.status === "sent",
    );

    const status: BuyerRequest["status"] = hasAcceptedOffer
      ? "won"
      : hasSentOffer
        ? "offer"
        : confirmed
          ? "shortlist_sent"
          : "matching";

    const cat = String(req.category ?? "software");
    const countryIso = String(req.country_code ?? "UAE");
    const rfpText = String(req.rfp_text ?? `${cat.toUpperCase()} enterprise requirement`);
    const budgetNum = req.budget != null ? Number(req.budget) : 45000;

    return {
      id: reqId,
      ref: `REQ-${String(101 + idx)}`,
      buyerId: String(req.buyer_id),
      title: `${cat.toUpperCase()} Software · ${toMarketLabel(countryIso)}`,
      need: rfpText,
      country:
        countryIso === "UAE"
          ? "United Arab Emirates"
          : countryIso === "SAU"
            ? "Saudi Arabia"
            : countryIso,
      budget: `$${budgetNum.toLocaleString("en-US")}`,
      users: "250",
      goLive: "6 weeks",
      status,
      ownerId: advisorId,
      createdAt: String(req.created_at ?? today()),
      shortlist: items.map((it) => ({
        productId: String(it.product_id ?? ""),
        listingId: String(it.listing_id ?? ""),
        fit: Math.round(Number(it.total_score ?? 88)),
        strengths: Array.isArray(it.criterion_explanations)
          ? (it.criterion_explanations as Array<Record<string, unknown>>)
              .slice(0, 2)
              .map((ce) => String(ce.explanation ?? "Verified capability match"))
          : ["Verified DGIX capability & security match"],
        gaps:
          String(it.classification) === "pilot_eligible"
            ? ["Pilot-Eligible (Advisor monitored rollout)"]
            : [],
        confirmed,
        aiGenerated: Boolean(it.ai_generated ?? true),
      })),
      shortlistId: sl ? String(sl.shortlist_id) : undefined,
      shortlistStatus: slStatus,
      humanApprovalRequired: Boolean(sl?.human_approval_required ?? true),
      advisorNotes: (sl?.advisor_notes as string | null) ?? null,
      createdBy: sl ? String(sl.created_by ?? "") : String(req.created_by ?? ""),
    };
  });

  // 5. Demos
  const demos: Demo[] = live.demoBookings.map((b) => {
    const rawStatus = String(b.status ?? "requested");
    const status: Demo["status"] =
      rawStatus === "scheduled"
        ? "booked"
        : rawStatus === "completed"
          ? "done"
          : rawStatus === "cancelled"
            ? "cancelled"
            : "requested";
    const pref = String(b.preferred_date ?? "");
    const parsedTime = Date.parse(pref);
    const isoAt = Number.isNaN(parsedTime)
      ? new Date(Date.now() + 48 * 3600_000).toISOString()
      : new Date(parsedTime).toISOString();
    return {
      id: String(b.booking_id),
      productId: String(b.product_id),
      listingId: String(b.listing_id),
      buyerId: String(b.buyer_id),
      at: isoAt,
      status,
      notes: (b.notes as string | undefined) ?? undefined,
      meetingUrl: (b.meeting_url as string | null) ?? null,
      questions: 2,
    };
  });

  // 6. Offers
  const offers: Offer[] = live.offers.map((o, idx) => {
    const rawSt = String(o.status ?? "sent");
    const status: Offer["status"] =
      rawSt === "accepted"
        ? "accepted"
        : rawSt === "withdrawn"
          ? "declined"
          : rawSt === "draft"
            ? "draft"
            : "sent";
    const ms = Array.isArray(o.milestones)
      ? (o.milestones as Array<Record<string, unknown>>).map((m) => ({
          title: String(m.name ?? m.title ?? "Delivery Milestone"),
          amount: Number(m.amount ?? 0),
        }))
      : [];
    return {
      id: String(o.offer_id),
      ref: `OFF-${String(201 + idx)}`,
      requestId: String(o.requirement_id ?? requests[0]?.id ?? ""),
      shortlistId: o.shortlist_id ? String(o.shortlist_id) : undefined,
      listingId: String(o.listing_id ?? ""),
      priceListId: String(o.price_list_id ?? ""),
      productId: String(o.product_id),
      buyerId: String(o.buyer_id),
      price: Number(o.total_price ?? o.unit_price ?? 0),
      currency: String(o.currency ?? "USD"),
      sla: String(o.sla_terms ?? "99.9% availability SLA"),
      warranty: String(o.warranty_terms ?? "90-day post-go-live warranty"),
      exit: String(o.exit_terms ?? "Encrypted data export within 10 business days"),
      milestones: ms,
      status,
      sentAt: String(o.created_at ?? "").slice(0, 10),
      signedAt: o.accepted_at ? String(o.accepted_at).slice(0, 10) : undefined,
    };
  });

  // 7. Projects & Milestones
  const projects: Project[] = live.projects.map((pr) => {
    const orderId = String(pr.order_id ?? "");
    const ord = live.orders.find((o) => String(o.order_id) === orderId);
    const prodByVer = products.find((p) => p.versionId === String(pr.product_version_id));
    const productId = ord
      ? String(ord.product_id)
      : (prodByVer?.id ?? products[0]?.id ?? "");
    const offerId = ord ? String(ord.offer_id) : undefined;
    const rawMs = Array.isArray(pr.milestones)
      ? (pr.milestones as Array<Record<string, unknown>>)
      : [];
    let assignedReview = false;
    const mappedMs: Project["milestones"] = rawMs.map((m, idx) => {
      const mStat = String(m.status ?? "pending");
      let uiStat: Project["milestones"][number]["status"] = "upcoming";
      if (mStat === "accepted") {
        uiStat = "done";
      } else if (!assignedReview) {
        uiStat = "in_review";
        assignedReview = true;
      } else {
        uiStat = "in_progress";
      }
      return {
        id: String(m.milestone_id),
        title: String(m.title ?? `Milestone ${idx + 1}`),
        status: uiStat,
        due: new Date(Date.now() + (idx + 1) * 14 * 864e5).toISOString().slice(0, 10),
        acceptedOn: m.accepted_at ? String(m.accepted_at).slice(0, 10) : undefined,
        amount: Number(m.amount ?? 0),
      };
    });

    return {
      id: String(pr.project_id),
      name: String(pr.name ?? "Enterprise Delivery"),
      offerId,
      orderId,
      productId,
      productVersionId: String(pr.product_version_id ?? ""),
      buyerId: String(pr.buyer_id),
      partnerId: String(pr.partner_id),
      city: "Dubai",
      health: "on_track",
      slaUptimeTargetPct: String(pr.sla_uptime_target_pct ?? "99.9"),
      slaResponseMinutesTarget: Number(pr.sla_response_minutes_target ?? 60),
      milestones: mappedMs,
    };
  });

  // 8. Invoices + Payment Intents
  const invoices: Invoice[] = live.invoices.map((inv) => {
    const invId = String(inv.invoice_id);
    const orderId = String(inv.order_id);
    const proj = projects.find((p) => p.orderId === orderId) ?? projects[0];
    const pay =
      live.payments.find((p) => String(p.invoice_id ?? "") === invId) ??
      live.payments.find((p) => String(p.order_id ?? "") === orderId);
    const paySt = pay ? String(pay.status) : "unpaid";
    const status: Invoice["status"] =
      paySt === "settled"
        ? "verified"
        : paySt === "captured"
          ? "paid"
          : "due";
    const scheme = String(inv.einvoice_scheme ?? "none");
    const jurisdiction = String(inv.jurisdiction ?? "UAE");
    const milestoneLabel =
      scheme === "none"
        ? `${jurisdiction} Commercial Tax Invoice`
        : `${jurisdiction} Tax Invoice (${scheme.toUpperCase()})`;
    return {
      id: invId,
      ref: String(inv.erp_invoice_ref ?? `INV-${invId.slice(0, 6).toUpperCase()}`),
      buyerId: String(inv.buyer_id),
      projectId: proj?.id ?? orderId,
      orderId,
      milestone: milestoneLabel,
      amount: Number(inv.gross_amount ?? inv.net_amount ?? 0),
      currency: String(inv.currency ?? "USD"),
      due: new Date(new Date(String(inv.created_at ?? today())).getTime() + 14 * 864e5)
        .toISOString()
        .slice(0, 10),
      status,
      paidOn: pay?.captured_at ? String(pay.captured_at).slice(0, 10) : undefined,
      paymentId: pay ? String(pay.payment_id) : undefined,
      paymentStatus: paySt,
      gateway: pay ? String(pay.gateway) : "stripe",
      sandboxCheckoutUrl:
        pay && typeof pay.sandbox_checkout_url === "string" ? pay.sandbox_checkout_url : undefined,
      gatewayCheckoutUrl:
        pay && typeof pay.checkout_url === "string" ? pay.checkout_url : undefined,
      einvoiceScheme: scheme,
      einvoiceClearanceId: (inv.einvoice_clearance_id as string | null) ?? null,
      journalId: String(inv.journal_id ?? ""),
    };
  });

  // 9. Payouts
  const payouts: Payout[] = live.payouts.map((po) => {
    const pay = live.payments.find((p) => String(p.payment_id) === String(po.payment_id));
    const inv = live.invoices.find((i) => String(i.order_id) === String(po.order_id));
    const net = Number(po.amount ?? 0);
    const hasServerBreakdown = po.gross_amount !== undefined && po.gross_amount !== null;
    const gross = hasServerBreakdown
      ? Number(po.gross_amount)
      : pay
        ? Number(pay.amount ?? 0)
        : net;
    const holdAmt =
      po.dispute_hold_amount !== undefined && po.dispute_hold_amount !== null
        ? Number(po.dispute_hold_amount)
        : pay
          ? Math.round(gross * Number(pay.dispute_hold_pct ?? 0))
          : 0;
    const fee =
      po.dgix_fee_amount !== undefined && po.dgix_fee_amount !== null
        ? Number(po.dgix_fee_amount)
        : Math.max(0, Math.round(gross - net - holdAmt));
    const rawStatus = String(po.status ?? "pending_approval");
    const status: Payout["status"] =
      rawStatus === "approved" || rawStatus === "paid" || rawStatus === "disbursed"
        ? "paid"
        : "scheduled";
    return {
      id: String(po.payout_id),
      partnerId: String(po.partner_id),
      invoiceId: inv ? String(inv.invoice_id) : String(po.order_id),
      paymentId: String(po.payment_id),
      orderId: String(po.order_id),
      gross,
      fee,
      disputeHold: holdAmt,
      net,
      currency: String(po.currency ?? "USD"),
      payoutChannel: String(po.payout_channel ?? "swift"),
      rawStatus,
      createdBy: String(po.created_by ?? ""),
      status,
      date: String(po.approved_at ?? po.created_at ?? today()).slice(0, 10),
    };
  });

  // 10. Licences (derived from accepted Commercial Orders & Delivery Milestones)
  const licences: Licence[] = live.orders.map((ord) => {
    const linkedOffer = live.offers.find((o) => String(o.offer_id) === String(ord.offer_id));
    const qty = Number(linkedOffer?.quantity ?? 1);
    const seats = qty > 1 ? qty : 100;
    const proj = projects.find((p) => p.orderId === String(ord.order_id));
    const doneRatio =
      proj && proj.milestones.length > 0
        ? proj.milestones.filter((m) => m.status === "done").length / proj.milestones.length
        : 0.5;
    const used = Math.max(1, Math.min(seats, Math.round(seats * Math.max(0.25, doneRatio))));
    return {
      id: String(ord.order_id),
      buyerId: String(ord.buyer_id),
      productId: String(ord.product_id),
      seats,
      used,
      renews: new Date(new Date(String(ord.created_at ?? today())).getTime() + 365 * 864e5)
        .toISOString()
        .slice(0, 10),
      status: "active",
    };
  });

  // 11. Support Cases (derived from Delivery Incidents)
  const cases: SupportCase[] = live.incidents.map((inc, idx) => {
    const sev = String(inc.severity ?? "low");
    const priority: SupportCase["priority"] =
      sev === "critical"
        ? "urgent"
        : sev === "high"
          ? "high"
          : sev === "medium"
            ? "normal"
            : "low";
    const companyId = String(inc.buyer_id ?? inc.partner_id ?? "");
    return {
      id: String(inc.incident_id),
      ref: `CASE-0${120 + idx}`,
      companyId,
      projectId: inc.project_id ? String(inc.project_id) : undefined,
      title: String(inc.summary ?? "Support request").slice(0, 64),
      priority,
      status: "open",
      opened: String(inc.created_at ?? today()),
      messages: [
        {
          from: String(inc.reported_by ?? ""),
          at: String(inc.created_at ?? today()),
          body: String(inc.summary ?? ""),
        },
        {
          from: advisorId,
          at: String(inc.created_at ?? today()),
          body: "Your support case has been received and assigned to your delivery advisor.",
        },
      ],
    };
  });

  return {
    users,
    companies: Array.from(companiesMap.values()),
    products,
    requests,
    demos,
    offers,
    projects,
    invoices,
    payouts,
    licences,
    cases,
    notifications: [],
  };
}

async function runBatchedTasks<T>(tasks: Array<() => Promise<T>>, concurrency = 5): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < tasks.length) {
      const idx = cursor++;
      results[idx] = await tasks[idx]();
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(1, tasks.length)) }, () => worker()),
  );
  return results;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [catalogueDisclaimer, setCatalogueDisclaimer] = useState<string>(DEFAULT_DISCLAIMER);
  const [live, setLive] = useState<LiveBackendState>(EMPTY_LIVE);
  const [localNotifications, setLocalNotifications] = useState<Db["notifications"]>([]);
  const [caseOverrides, setCaseOverrides] = useState<
    Record<string, { extraMessages: SupportCase["messages"]; status?: SupportCase["status"] }>
  >({});
  const [declinedOffers, setDeclinedOffers] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshLiveForSession = useCallback(async (sessionArg: AuthSession | null) => {
    setSyncing(true);
    try {
      const pubCat = await apiFetch<{ disclaimer: string; count: number; listings: LiveListing[] }>(
        "/bff/v1/public/listings",
        { method: "GET", auth: false },
      ).catch((err) => {
        if (mountedRef.current) {
          setLastError(
            err instanceof Error ? err.message : "Could not reach DGIX services.",
          );
        }
        return fetchPublicCatalogue();
      });

      if (!mountedRef.current) return;
      if (pubCat.disclaimer) setCatalogueDisclaimer(pubCat.disclaimer);

        if (!sessionArg) {
          setLive({ ...EMPTY_LIVE, listings: pubCat.listings });
          return;
        }

        const roles = new Set(sessionArg.user.roles);
        const portalRole = sessionArg.user.portal_role;
        const isStaff = portalRole === "staff";
        const isSeller = portalRole === "seller";
        const isBuyer = portalRole === "buyer";
        const canAudit =
          roles.has("auditor") || roles.has("council_member") || roles.has("dgix_admin");

        const batched = await runBatchedTasks<unknown>(
          [
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/partners", [])
                : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/products", [])
                : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/iam/pao-bindings", [])
                : Promise.resolve([]),
            () =>
              isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/iam/reviewers", [])
                : Promise.resolve([]),
            () =>
              isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/evidence", [])
                : isStaff
                  ? safeGet<Array<Record<string, unknown>>>("/bff/v1/evidence?include_all=true", [])
                  : Promise.resolve([]),
            () =>
              isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/claims", [])
                : isStaff
                  ? safeGet<Array<Record<string, unknown>>>("/bff/v1/claims?include_all=true", [])
                  : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/governance/assessments", [])
                : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/governance/approvals", [])
                : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/governance/country-readiness", [])
                : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/rights/agreements", [])
                : Promise.resolve([]),
            () =>
              isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/pricing/cost-floors", [])
                : Promise.resolve([]),
            () =>
              isStaff || isSeller
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/pricing/price-lists", [])
                : Promise.resolve([]),
            () =>
              isBuyer || isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/buyers/requirements", [])
                : Promise.resolve([]),
            () =>
              isBuyer || isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/matching/shortlists", [])
                : Promise.resolve([]),
            () => safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/offers", []),
            () => safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/orders", []),
            () => safeGet<Array<Record<string, unknown>>>("/bff/v1/commercial/buyers/demo-bookings", []),
            () => safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/fx-rates", []),
            () =>
              isBuyer || isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/invoices", [])
                : Promise.resolve([]),
            () =>
              isBuyer || isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/payments", [])
                : Promise.resolve([]),
            () =>
              isSeller || isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/payouts", [])
                : Promise.resolve([]),
            () =>
              isBuyer || isStaff
                ? safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/refunds", [])
                : Promise.resolve([]),
            () => safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/delivery/projects", []),
            () => safeGet<Array<Record<string, unknown>>>("/bff/v1/finance/delivery/incidents", []),
            () =>
              canAudit
                ? safeGet<{ entries: Array<Record<string, unknown>> }>("/bff/v1/audit/entries?limit=60", {
                    entries: [],
                  })
                : Promise.resolve({ entries: [] }),
            () =>
              canAudit
                ? safeGet<LiveBackendState["auditVerification"]>("/bff/v1/audit/verify", null)
                : Promise.resolve(null),
          ],
          5,
        );

        const [
          partners,
          productsRaw,
          paoBindings,
          reviewers,
          evidence,
          claims,
          assessments,
          approvals,
          countryReadiness,
          agreements,
          costFloors,
          priceLists,
          requirements,
          shortlists,
          offers,
          orders,
          demoBookings,
          fxRates,
          invoices,
          payments,
          payouts,
          refunds,
          projects,
          incidents,
          auditPage,
          auditVerify,
        ] = batched as [
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          Array<Record<string, unknown>>,
          { entries: Array<Record<string, unknown>> },
          LiveBackendState["auditVerification"],
        ];

        // Load versions for each visible product and gap letters for blocked assessments
        const versionsEntries = await runBatchedTasks(
          productsRaw.slice(0, 25).map((pr) => async () => {
            const pid = String(pr.product_id);
            const vers = await safeGet<Array<Record<string, unknown>>>(
              `/bff/v1/products/${pid}/versions`,
              [],
            );
            return [pid, vers] as const;
          }),
          4,
        );
        const versionsByProduct: Record<string, Array<Record<string, unknown>>> =
          Object.fromEntries(versionsEntries);

        const gapLettersNested = await runBatchedTasks(
          assessments
            .filter((a) => Boolean(a.handoff_blocked))
            .map((a) => () =>
              safeGet<Array<Record<string, unknown>>>(
                `/bff/v1/governance/assessments/${String(a.assessment_id)}/gap-letters`,
                [],
              ),
            ),
          4,
        );

        if (!mountedRef.current) return;
        setLive({
          listings: pubCat.listings,
          partners,
          products: productsRaw,
          versionsByProduct,
          paoBindings,
          reviewers,
          evidence,
          claims,
          assessments,
          gapLetters: gapLettersNested.flat(),
          approvals,
          countryReadiness,
          agreements,
          costFloors,
          priceLists,
          requirements,
          shortlists,
          offers,
          orders,
          demoBookings,
          fxRates,
          invoices,
          payments,
          payouts,
          refunds,
          projects,
          incidents,
          auditEntries: auditPage?.entries ?? [],
          auditVerification: auditVerify,
        });
      } finally {
        if (mountedRef.current) setSyncing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void (async () => {
      const stored = loadStoredSession();
      if (stored) {
        setAuthSession(stored);
      } else if (typeof document !== "undefined") {
        document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
        document.cookie = "dgix_role=; path=/; max-age=0";
      }
      await refreshLiveForSession(stored);
      if (mountedRef.current) setReady(true);
    })();
  }, [refreshLiveForSession]);

  const refreshLive = useCallback(async () => {
    await refreshLiveForSession(loadStoredSession() ?? authSession);
  }, [authSession, refreshLiveForSession]);

  const db = useMemo<Db>(() => {
    const hydrated = hydrateDbFromLive({
      activeSession: authSession,
      disclaimer: catalogueDisclaimer,
      live,
    });
    const mergedCases = hydrated.cases.map((c) => {
      const ov = caseOverrides[c.id];
      if (!ov) return c;
      return {
        ...c,
        status: ov.status ?? c.status,
        messages: [...c.messages, ...ov.extraMessages],
      };
    });
    const mergedOffers = hydrated.offers.map((o) =>
      declinedOffers[o.id] ? { ...o, status: "declined" as const } : o,
    );
    return {
      ...hydrated,
      cases: mergedCases,
      offers: mergedOffers,
      notifications: localNotifications,
    };
  }, [authSession, catalogueDisclaimer, live, localNotifications, caseOverrides, declinedOffers]);

  const user = useMemo<User | null>(() => {
    if (!authSession) return null;
    return db.users.find((u) => u.id === authSession.user.sub) ?? buildUserFromSession(authSession);
  }, [authSession, db.users]);

  const setSessionCookies = (u: User) => {
    if (typeof document === "undefined") return;
    document.cookie = `${SESSION_COOKIE}=${u.id}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `dgix_role=${u.role}; path=/; max-age=86400; SameSite=Lax`;
  };

  const runBg = useCallback(
    (fn: () => Promise<void>) => {
      void (async () => {
        try {
          setLastError(null);
          await fn();
          await refreshLive();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Operation failed";
          if (mountedRef.current) setLastError(msg);
        }
      })();
    },
    [refreshLive],
  );

  const loginLive = useCallback(
    async (identifier: string, password: string): Promise<User> => {
      setLastError(null);
      const session = await loginWithPassword(identifier, password);
      setAuthSession(session);
      const u = buildUserFromSession(session);
      setSessionCookies(u);
      await refreshLiveForSession(session);
      return u;
    },
    [refreshLiveForSession],
  );

  const registerLive = useCallback(
    async (input: {
      account_type: "buyer" | "seller";
      full_name: string;
      email: string;
      password: string;
      company_name: string;
      country_code?: string;
      skip_partner_bootstrap?: boolean;
    }): Promise<User> => {
      setLastError(null);
      const session = await registerOrganization(input);
      setAuthSession(session);
      const u = buildUserFromSession(session);
      setSessionCookies(u);
      await refreshLiveForSession(session);
      return u;
    },
    [refreshLiveForSession],
  );

  const applyPartnerLive = useCallback(
    async (input: {
      companyName: string;
      registrationNumber: string;
      countryCode: string;
      directorName: string;
      directorRole: string;
      referenceOrg: string;
      referenceContact: string;
      referenceEmail: string;
      productName: string;
      category: Category;
      tagline: string;
      description: string;
      markets: string[];
      priceFrom: number;
      fullName?: string;
      email?: string;
      password?: string;
    }): Promise<User> => {
      setLastError(null);
      let activeSession = loadStoredSession() ?? authSession;
      const isoCountry = toIsoCountry(input.countryCode);

      if (!activeSession || activeSession.user.portal_role !== "seller") {
        if (!input.email || !input.password || !input.fullName) {
          throw new Error("Please enter your full name, work email, and password to create your partner account.");
        }
        activeSession = await registerOrganization({
          account_type: "seller",
          full_name: input.fullName.trim(),
          email: input.email.trim(),
          password: input.password,
          company_name: input.companyName.trim(),
          country_code: isoCountry,
          skip_partner_bootstrap: true,
        });
        setAuthSession(activeSession);
      }

      const u = buildUserFromSession(activeSession);
      setSessionCookies(u);

      const summaryText = `${input.tagline.trim()} — ${input.description.trim()}`.slice(0, 3900);
      await apiFetch("/bff/v1/partners", {
        method: "POST",
        body: {
          legal_name: input.companyName.trim(),
          registration_number: input.registrationNumber.trim(),
          country_code: isoCountry,
          directors: [
            {
              full_name: input.directorName.trim(),
              country_code: isoCountry,
              role_title: input.directorRole.trim() || "Managing Director",
            },
          ],
          references: [
            {
              organisation: input.referenceOrg.trim(),
              contact_name: input.referenceContact.trim(),
              contact_email: input.referenceEmail.trim(),
            },
          ],
          product_summary:
            summaryText.length >= 10
              ? summaryText
              : `${input.productName.trim()} enterprise software solution by ${input.companyName.trim()}.`,
        },
      }).catch((err: unknown) => {
        if (err instanceof Error && !err.message.toLowerCase().includes("already exists")) {
          throw err;
        }
      });

      const createdProd = await apiFetch<Record<string, unknown>>("/bff/v1/products", {
        method: "POST",
        body: {
          name: input.productName.trim(),
          category: input.category,
          pao_user_id: u.id,
          daffodil_owned: false,
        },
      });
      const pid = String(createdProd.product_id);
      const createdVer = await apiFetch<Record<string, unknown>>(
        `/bff/v1/products/${pid}/versions`,
        {
          method: "POST",
          body: { semver: "1.0.0", material_change: false },
        },
      );
      await apiFetch("/bff/v1/iam/pao-bindings", {
        method: "POST",
        body: {
          product_id: pid,
          pao_user_id: u.id,
          no_conflict_declared: true,
        },
      }).catch(() => undefined);

      const countryCodes = input.markets.map(toIsoCountry);
      await apiFetch("/bff/v1/governance/assessments", {
        method: "POST",
        body: {
          product_id: pid,
          product_version_id: String(createdVer.version_id),
          pao_user_id: u.id,
          country_codes: countryCodes.length > 0 ? countryCodes : [isoCountry],
        },
      }).catch(() => undefined);

      await refreshLiveForSession(activeSession);
      return u;
    },
    [authSession, refreshLiveForSession],
  );

  const uploadRealEvidence = useCallback(
    async (params: {
      productId: string;
      productVersionId?: string;
      evidenceType: string;
      file: File | Blob;
      filename: string;
      expiresAt?: string;
      isSourceCode?: boolean;
    }): Promise<Record<string, unknown>> => {
      let verId = params.productVersionId;
      if (!verId) {
        const prod = db.products.find((p) => p.id === params.productId);
        verId = prod?.versionId;
      }
      if (!verId) {
        const createdVer = await apiFetch<Record<string, unknown>>(
          `/bff/v1/products/${params.productId}/versions`,
          {
            method: "POST",
            body: { semver: "1.0.0", material_change: false },
          },
        );
        verId = String(createdVer.version_id);
      }
      const res = await uploadEvidenceBinary({
        productVersionId: verId,
        evidenceType: params.evidenceType,
        file: params.file,
        filename: params.filename,
        expiresAt: params.expiresAt,
        isSourceCode: params.isSourceCode,
      });
      await refreshLive();
      return res;
    },
    [db.products, refreshLive],
  );

  const value: Ctx = {
    db,
    ready,
    user,
    authSession,
    catalogueDisclaimer,
    live,
    syncing,
    lastError,
    clearError: () => setLastError(null),
    refreshLive,
    loginLive,
    registerLive,
    applyPartnerLive,
    uploadRealEvidence,

    signIn: (email, password) => {
      void loginLive(email, password).catch((err) => {
        setLastError(err instanceof Error ? err.message : "Invalid credentials");
      });
      return null;
    },

    signOut: () => {
      saveStoredSession(null);
      if (typeof document !== "undefined") {
        document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
        document.cookie = "dgix_role=; path=/; max-age=0";
      }
      setAuthSession(null);
      void refreshLiveForSession(null);
    },

    reset: () => {
      void refreshLive();
    },

    updateProfile: () => {
      // Managed via identity profile
    },
    changePassword: () => true,

    createRequest: (input) => {
      const countryCode = toIsoCountry(input.country);
      const budgetDigits = Number(input.budget.replace(/[^0-9.]/g, "")) || 40000;
      const text = `${input.title} ${input.need}`.toLowerCase();
      const category = text.includes("hr") || text.includes("payroll")
        ? "hr"
        : text.includes("campus") || text.includes("student") || text.includes("edu")
          ? "education"
          : text.includes("clinic") || text.includes("hospital")
            ? "healthcare"
            : "erp";

      const optimistic: BuyerRequest = {
        id: `pending-${uid().toLowerCase()}`,
        ref: `REQ-${uid()}`,
        buyerId: user?.companyId ?? "9c0d1e2f-3a4b-4c5d-8e6f-7a8b9c0d1e04",
        status: "matching",
        createdAt: today(),
        shortlist: [],
        shortlistStatus: "pending_advisor",
        humanApprovalRequired: true,
        ...input,
      };

      runBg(async () => {
        const reqRes = await apiFetch<Record<string, unknown>>(
          "/bff/v1/commercial/buyers/requirements",
          {
            method: "POST",
            body: {
              country_code: countryCode,
              category,
              capabilities_needed: [input.title.slice(0, 80)],
              budget: String(budgetDigits),
              currency: "USD",
              rfp_text: `${input.title} — ${input.need} (Users: ${input.users}, Go-live: ${input.goLive})`,
              confirmed_by_buyer: true,
            },
          },
        );
        await apiFetch("/bff/v1/commercial/matching/shortlists", {
          method: "POST",
          body: { requirement_id: String(reqRes.requirement_id) },
        });
      });

      return optimistic;
    },

    bookDemo: (productId) => {
      const prod = db.products.find((p) => p.id === productId);
      const listingId = prod?.listingId;
      if (!listingId) return;
      runBg(async () => {
        await apiFetch("/bff/v1/commercial/buyers/demo-bookings", {
          method: "POST",
          body: {
            listing_id: listingId,
            organisation: db.companies.find((c) => c.id === user?.companyId)?.name ?? "Enterprise Buyer",
            contact_name: user?.name ?? "Buyer",
            contact_email: user?.email ?? "buyer.user@example.test",
            preferred_date: new Date(Date.now() + 3 * 864e5).toISOString(),
            notes: `Requested live walkthrough for ${prod.name}`,
          },
        });
      });
    },

    acceptOffer: (offerId) => {
      runBg(async () => {
        await apiFetch(`/bff/v1/commercial/offers/${offerId}/accept`, { method: "POST" });
      });
    },

    declineOffer: (offerId) => {
      setDeclinedOffers((prev) => ({ ...prev, [offerId]: true }));
    },

    acceptMilestone: (projectId, milestoneId) => {
      runBg(async () => {
        await apiFetch(
          `/bff/v1/finance/delivery/projects/${projectId}/milestones/${milestoneId}/accept`,
          {
            method: "POST",
            body: { notes: "Milestone accepted." },
          },
        );
      });
    },

    rejectMilestone: (projectId, milestoneId, reason) => {
      runBg(async () => {
        await apiFetch(
          `/bff/v1/finance/delivery/projects/${projectId}/milestones/${milestoneId}/reject`,
          {
            method: "POST",
            body: { reason: reason.trim() || "Reopened by buyer for rework." },
          },
        );
      });
    },

    payInvoice: (invoiceId) => {
      const inv = db.invoices.find((i) => i.id === invoiceId);
      const isStale = inv?.paymentStatus === "expired" || inv?.paymentStatus === "cancelled";
      if (!isStale && inv?.sandboxCheckoutUrl && typeof window !== "undefined") {
        window.location.href = buildSandboxCheckoutRedirectUrl(inv.sandboxCheckoutUrl);
        return;
      }
      if (!inv?.orderId) return;
      runBg(async () => {
        const pay = await apiFetch<Record<string, unknown>>("/bff/v1/finance/payments/intents", {
          method: "POST",
          idempotent: true,
          body: {
            order_id: inv.orderId,
            invoice_id: inv.id,
            gateway: "stripe",
          },
        });
        if (typeof pay.sandbox_checkout_url === "string" && typeof window !== "undefined") {
          window.location.href = buildSandboxCheckoutRedirectUrl(pay.sandbox_checkout_url);
        } else if (typeof pay.payment_id === "string" && typeof window !== "undefined") {
          const fallbackUrl = `/checkout/hosted/${pay.payment_id}?gateway=stripe&amount=${encodeURIComponent(String(inv.amount))}&currency=USD&order_id=${encodeURIComponent(inv.orderId ?? "")}`;
          window.location.href = buildSandboxCheckoutRedirectUrl(fallbackUrl);
        }
      });
    },

    openCase: (title, body, projectId) => {
      const proj = db.projects.find((p) => p.id === projectId) ?? db.projects[0];
      const prod = db.products.find((p) => p.id === proj?.productId) ?? db.products[0];
      if (!prod?.versionId) return;
      runBg(async () => {
        await apiFetch("/bff/v1/finance/delivery/incidents", {
          method: "POST",
          body: {
            partner_id: proj?.partnerId ?? prod.partnerId,
            buyer_id: user?.role === "buyer" ? user.companyId : proj?.buyerId,
            product_id: prod.id,
            product_version_id: prod.versionId,
            project_id: proj?.id,
            severity: "medium",
            category: "sla",
            summary: `${title}: ${body}`.slice(0, 950),
          },
        });
      });
    },

    replyCase: (caseId, body) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      setCaseOverrides((prev) => {
        const cur = prev[caseId] ?? { extraMessages: [] };
        return {
          ...prev,
          [caseId]: {
            ...cur,
            extraMessages: [
              ...cur.extraMessages,
              { from: user?.id ?? "", at: today(), body: trimmed },
            ],
          },
        };
      });
    },

    resolveCase: (caseId) => {
      setCaseOverrides((prev) => {
        const cur = prev[caseId] ?? { extraMessages: [] };
        return {
          ...prev,
          [caseId]: {
            ...cur,
            status: "resolved",
          },
        };
      });
    },

    uploadEvidence: (productId, checkKey) => {
      const prod = db.products.find((p) => p.id === productId);
      if (!prod) return;
      const pdfBytes = new Blob(
        [`%PDF-1.4\n% DGIX Evidence ${prod.name} - ${checkKey}\n%%EOF\n`],
        { type: "application/pdf" },
      );
      runBg(async () => {
        await uploadRealEvidence({
          productId: prod.id,
          productVersionId: prod.versionId,
          evidenceType: checkKey === "security" ? "security_report" : "compliance_pack",
          file: pdfBytes,
          filename: `${prod.slug}-${checkKey}-evidence.pdf`,
          expiresAt: "2027-12-31",
        });
      });
    },

    confirmDemo: (demoId) => {
      runBg(async () => {
        await apiFetch(`/bff/v1/commercial/buyers/demo-bookings/${demoId}`, {
          method: "PATCH",
          body: {
            status: "scheduled",
            meeting_url: `https://meet.dgix.daffodil.global/room-${demoId.slice(0, 8)}`,
          },
        });
      });
    },

    submitMilestone: (projectId, milestoneId) => {
      runBg(async () => {
        await apiFetch(
          `/bff/v1/finance/delivery/projects/${projectId}/milestones/${milestoneId}/submit`,
          {
            method: "POST",
            body: {
              evidence_refs: [`delivery-signoff-${milestoneId.slice(0, 8)}.pdf`],
              notes: "Milestone deliverable & sign-off evidence submitted for buyer review.",
            },
          },
        );
      });
    },

    confirmShortlist: (requestId, productIds) => {
      const req = db.requests.find((r) => r.id === requestId);
      if (!req?.shortlistId) return;
      const selectedListingIds = productIds
        ? req.shortlist
            .filter((s) => productIds.includes(s.productId) && s.listingId)
            .map((s) => s.listingId as string)
        : undefined;
      runBg(async () => {
        await apiFetch(`/bff/v1/commercial/matching/shortlists/${req.shortlistId}/approve`, {
          method: "POST",
          body: {
            advisor_notes: "Shortlist reviewed and approved by your DGIX Advisor.",
            ...(selectedListingIds && selectedListingIds.length > 0
              ? { selected_listing_ids: selectedListingIds }
              : {}),
          },
        });
      });
    },

    approvePayouts: (ids) => {
      runBg(async () => {
        for (const id of ids) {
          await apiFetch(`/bff/v1/finance/payouts/${id}/approve`, {
            method: "POST",
            idempotent: true,
          });
        }
      });
    },

    sendOffer: () => {
      void refreshLive();
    },

    approveCheck: (productId, checkKey) => {
      const prod = db.products.find((p) => p.id === productId);
      if (!prod?.assessmentId) return;
      const gateMap: Record<string, Gate> = {
        security: "PG1",
        privacy: "PG2",
        hosting: "PG3",
        quality: "PG4",
        delivery: "PG4",
        commercial: "PG5",
      };
      const gate = gateMap[checkKey] ?? prod.gate;
      runBg(async () => {
        await apiFetch(
          `/bff/v1/governance/assessments/${prod.assessmentId}/gates/${gate}/decisions`,
          {
            method: "POST",
            body: {
              decision: "passed",
              rationale: `${checkKey} verification approved.`,
              domain_scores: {},
              evidence_ids: [],
              findings: [],
            },
          },
        );
      });
    },

    verifyPayment: (invoiceId) => {
      const inv = db.invoices.find((i) => i.id === invoiceId);
      if (!inv?.paymentId) return;
      runBg(async () => {
        await apiFetch(`/bff/v1/finance/payments/${inv.paymentId}/settle`, {
          method: "POST",
          body: { gateway_fee_amount: "0.00" },
        });
      });
    },

    completeDemo: (demoId) => {
      runBg(async () => {
        await apiFetch(`/bff/v1/commercial/buyers/demo-bookings/${demoId}`, {
          method: "PATCH",
          body: { status: "completed" },
        });
      });
    },

    rateDemo: (demoId, rating, notes) => {
      runBg(async () => {
        await apiFetch(`/bff/v1/commercial/buyers/demo-bookings/${demoId}`, {
          method: "PATCH",
          body: {
            status: "completed",
            notes: `Buyer rating: ${rating}${notes ? ` — ${notes}` : ""}`,
          },
        });
      });
    },

    createOffer: (input) => {
      const req = db.requests.find((r) => r.id === input.requestId);
      const prod = db.products.find((p) => p.id === input.productId);
      const optimistic: Offer = {
        id: `offer-${uid().toLowerCase()}`,
        ref: `OFF-${uid()}`,
        requestId: input.requestId,
        productId: input.productId,
        buyerId: req?.buyerId ?? "",
        price: input.price,
        sla: input.sla,
        warranty: input.warranty,
        exit: input.exit,
        milestones: input.milestones,
        status: "sent",
        sentAt: today().slice(0, 10),
      };
      if (prod?.listingId && prod?.priceListId && req?.buyerId) {
        runBg(async () => {
          await apiFetch("/bff/v1/commercial/offers", {
            method: "POST",
            body: {
              buyer_id: req.buyerId,
              requirement_id: req.id,
              shortlist_id: req.shortlistId,
              listing_id: prod.listingId,
              price_list_id: prod.priceListId,
              quantity: 1,
              sla_terms: input.sla,
              warranty_terms: input.warranty,
              exit_terms: input.exit,
              milestones: input.milestones.map((m, idx) => ({
                name: m.title,
                amount: String(m.amount),
                due_days: (idx + 1) * 21,
              })),
              dgix_contact: user?.name ?? "DGIX Commercial Advisor",
            },
          });
        });
      }
      return optimistic;
    },

    addProduct: (input) => {
      const tempId = `prod-${uid().toLowerCase()}`;
      runBg(async () => {
        if (!user) return;
        const createdProd = await apiFetch<Record<string, unknown>>("/bff/v1/products", {
          method: "POST",
          body: {
            name: input.name,
            category: input.category,
            pao_user_id: user.id,
            daffodil_owned: false,
          },
        });
        const pid = String(createdProd.product_id);
        const createdVer = await apiFetch<Record<string, unknown>>(
          `/bff/v1/products/${pid}/versions`,
          {
            method: "POST",
            body: { semver: "1.0.0", material_change: false },
          },
        );
        await apiFetch("/bff/v1/iam/pao-bindings", {
          method: "POST",
          body: {
            product_id: pid,
            pao_user_id: user.id,
            no_conflict_declared: true,
          },
        });
        const countryCodes = input.markets.map(toIsoCountry);
        await apiFetch("/bff/v1/governance/assessments", {
          method: "POST",
          body: {
            product_id: pid,
            product_version_id: String(createdVer.version_id),
            pao_user_id: user.id,
            country_codes: countryCodes.length > 0 ? countryCodes : ["UAE"],
          },
        }).catch(() => {
          // Partner KYB may still be pending Legal screening; PAO & product are still saved!
        });
      });
      return tempId;
    },

    markRead: (id) => {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export function useLookup() {
  const { db } = useStore();
  return {
    company: (id?: string) => db.companies.find((c) => c.id === id),
    product: (id?: string) => db.products.find((p) => p.id === id),
    user: (id?: string) => db.users.find((u) => u.id === id),
    score: (productId?: string) => {
      const p = db.products.find((x) => x.id === productId);
      if (p?.officialScore != null) return p.officialScore;
      return p?.checks.reduce((s, c) => s + c.score, 0) ?? 0;
    },
  };
}
