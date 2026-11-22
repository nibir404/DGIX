export type Role = "buyer" | "seller" | "staff";

export type User = {
  id: string;
  name: string;
  initials: string;
  email: string;
  password: string; // seed fallback only; live auth uses Keycloak OIDC via BFF
  role: Role;
  companyId: string;
  title: string;
  avatarTone: "amber" | "green" | "blue" | "rose" | "violet";
  photo?: string;
  // Live Keycloak / DGIX RBAC metadata
  username?: string;
  primaryDgixRole?: string;
  dgixRoles?: string[];
  mfaLevel?: string;
  cell?: string;
  sodPairHint?: string | null;
  partnerId?: string | null;
  buyerId?: string | null;
};

export type Company = {
  id: string;
  name: string;
  kind: "buyer" | "partner" | "dgix";
  country: string;
  city: string;
  verified: boolean;
  advisorId?: string;
  kybStatus?: string;
  sanctionsStatus?: string;
  triageStatus?: string | null;
  portfolioOverlap?: string | null;
  assessmentEligible?: boolean;
  registrationNumber?: string;
};

export type CheckKey =
  | "quality"
  | "evidence"
  | "security"
  | "legal"
  | "pricing"
  | "support"
  | "readiness"
  | "docs";

export type Check = {
  key: CheckKey;
  label: string;
  max: number;
  score: number;
  note?: string;
};

export type Gate = "PG0" | "PG1" | "PG2" | "PG3" | "PG4" | "PG5";

export type Category =
  | "erp"
  | "hr"
  | "crm"
  | "retail"
  | "healthcare"
  | "education"
  | "finance"
  | "custom"
  | "ai"
  | "services";

export type ClaimBadgeItem = {
  claim_id?: string | null;
  statement: string;
  label: "certified" | "verified" | "declared" | "inferred" | "estimated" | string;
  evidence_id?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  partnerId: string;
  partnerName?: string;
  category: Category;
  tagline: string;
  description: string;
  version: string;
  markets: string[];
  gate: Gate;
  status: "listed" | "in_review" | "pilot" | "suspended";
  checks: Check[];
  metricLabel: string;
  metricValue: string;
  visual: "hospital" | "people" | "bars" | "bag" | "campus" | "ai" | "ledger";
  goLive: string;
  priceFrom: number;
  waitingOn?: string;
  reviewedOn?: string;
  // Live DGIX Governance & Commercial fields
  versionId?: string;
  listingId?: string;
  listingIdsByCountry?: Record<string, string>;
  priceListId?: string;
  agreementId?: string;
  approvalRecordId?: string;
  assessmentId?: string;
  officialScore?: number | null;
  classification?: "globally_ready" | "pilot_eligible" | "not_ready" | string;
  classificationBadge?: string;
  claimsSnapshot?: ClaimBadgeItem[];
  capabilities?: string[];
  disclaimer?: string;
  supportSummary?: string;
  knownLimits?: string;
  daffodilOwned?: boolean;
  suspensionReason?: string | null;
};

export type RequestStatus = "draft" | "matching" | "shortlist_sent" | "demo" | "offer" | "won" | "closed";

export type BuyerRequest = {
  id: string;
  ref: string;
  buyerId: string;
  title: string;
  need: string;
  country: string;
  budget: string;
  users: string;
  goLive: string;
  status: RequestStatus;
  ownerId?: string;
  createdAt: string;
  dueAt?: string;
  shortlist: {
    productId: string;
    listingId?: string;
    fit: number;
    gaps: string[];
    strengths: string[];
    confirmed: boolean;
    aiGenerated?: boolean;
  }[];
  // Live BR-15 shortlist approval metadata
  shortlistId?: string;
  shortlistStatus?: "pending_advisor" | "approved" | string;
  humanApprovalRequired?: boolean;
  advisorNotes?: string | null;
  createdBy?: string;
};

export type Demo = {
  id: string;
  requestId?: string;
  productId: string;
  listingId?: string;
  buyerId: string;
  at: string;
  status: "requested" | "booked" | "done" | "cancelled";
  notes?: string;
  meetingUrl?: string | null;
  questions: number;
  rating?: "Not for us" | "Maybe" | "Strong fit";
};

export type Offer = {
  id: string;
  ref: string;
  requestId: string;
  shortlistId?: string;
  listingId?: string;
  priceListId?: string;
  productId: string;
  buyerId: string;
  price: number;
  currency?: string;
  sla: string;
  warranty: string;
  exit: string;
  milestones: { title: string; amount: number }[];
  status: "draft" | "sent" | "accepted" | "declined";
  rating?: string;
  sentAt?: string;
  signedAt?: string;
};

export type MilestoneStatus = "done" | "in_review" | "in_progress" | "upcoming";

export type Project = {
  id: string;
  name: string;
  offerId?: string;
  orderId?: string;
  productId: string;
  productVersionId?: string;
  buyerId: string;
  partnerId: string;
  city: string;
  health: "on_track" | "at_risk" | "late";
  daysLate?: number;
  slaUptimeTargetPct?: string;
  slaResponseMinutesTarget?: number;
  milestones: {
    id: string;
    title: string;
    status: MilestoneStatus;
    due: string;
    acceptedOn?: string;
    amount: number;
    evidenceRefs?: string[];
    submissionNotes?: string;
    rejectionReason?: string;
  }[];
};

export type Invoice = {
  id: string;
  ref: string;
  buyerId: string;
  projectId: string;
  orderId?: string;
  milestone: string;
  amount: number;
  currency?: string;
  due: string;
  status: "due" | "paid" | "verified" | "overdue";
  paidOn?: string;
  // Live PCI SAQ A Hosted Checkout & Tax fields
  paymentId?: string;
  paymentStatus?: string;
  gateway?: string;
  sandboxCheckoutUrl?: string;
  gatewayCheckoutUrl?: string;
  einvoiceScheme?: string;
  einvoiceClearanceId?: string | null;
  journalId?: string;
};

export type Payout = {
  id: string;
  partnerId: string;
  invoiceId: string;
  paymentId?: string;
  orderId?: string;
  gross: number;
  fee: number;
  disputeHold?: number;
  net: number;
  currency?: string;
  payoutChannel?: string;
  rawStatus?: string;
  createdBy?: string;
  status: "pending_payment" | "scheduled" | "paid";
  date: string;
  queries?: {
    id: string;
    question: string;
    reply?: string;
    status: "open" | "answered";
    createdAt: string;
    repliedAt?: string;
  }[];
};

export type Licence = {
  id: string;
  buyerId: string;
  productId: string;
  seats: number;
  used: number;
  renews: string;
  status: "active" | "expiring";
};

export type SupportCase = {
  id: string;
  ref: string;
  companyId: string;
  projectId?: string;
  title: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "waiting" | "resolved";
  opened: string;
  messages: { from: string; at: string; body: string }[];
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  minutes: number;
  date: string;
  author: string;
};

export type Faq = { q: string; a: string; group: "buying" | "selling" | "trust" | "money" };

export type Db = {
  users: User[];
  companies: Company[];
  products: Product[];
  requests: BuyerRequest[];
  demos: Demo[];
  offers: Offer[];
  projects: Project[];
  invoices: Invoice[];
  payouts: Payout[];
  licences: Licence[];
  cases: SupportCase[];
  notifications: Notification[];
};
