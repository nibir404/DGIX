export type Role = "buyer" | "seller" | "staff";

export type User = {
  id: string;
  name: string;
  initials: string;
  email: string;
  password: string; // seed-only, for local testing
  role: Role;
  companyId: string;
  title: string;
  avatarTone: "amber" | "green" | "blue" | "rose" | "violet";
  photo?: string;
};

export type Company = {
  id: string;
  name: string;
  kind: "buyer" | "partner" | "dgix";
  country: string;
  city: string;
  verified: boolean;
  advisorId?: string; // staff user id
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
  note?: string; // shown when score < max
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

export type Product = {
  id: string;
  slug: string;
  name: string;
  partnerId: string;
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
};

export type RequestStatus = "draft" | "matching" | "shortlist_sent" | "demo" | "offer" | "won" | "closed";

export type BuyerRequest = {
  id: string;
  ref: string;
  buyerId: string; // company id
  title: string;
  need: string;
  country: string;
  budget: string;
  users: string;
  goLive: string;
  status: RequestStatus;
  ownerId?: string; // staff
  createdAt: string;
  dueAt?: string;
  shortlist: { productId: string; fit: number; gaps: string[]; strengths: string[]; confirmed: boolean }[];
};

export type Demo = {
  id: string;
  requestId?: string;
  productId: string;
  buyerId: string;
  at: string; // ISO
  status: "requested" | "booked" | "done" | "cancelled";
  notes?: string;
  questions: number;
};

export type Offer = {
  id: string;
  ref: string;
  requestId: string;
  productId: string;
  buyerId: string;
  price: number;
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
  productId: string;
  buyerId: string;
  partnerId: string;
  city: string;
  health: "on_track" | "at_risk" | "late";
  daysLate?: number;
  milestones: { id: string; title: string; status: MilestoneStatus; due: string; acceptedOn?: string; amount: number }[];
};

export type Invoice = {
  id: string;
  ref: string;
  buyerId: string;
  projectId: string;
  milestone: string;
  amount: number;
  due: string;
  status: "due" | "paid" | "verified" | "overdue";
  paidOn?: string;
};

export type Payout = {
  id: string;
  partnerId: string;
  invoiceId: string;
  gross: number;
  fee: number;
  net: number;
  status: "pending_payment" | "scheduled" | "paid";
  date: string;
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
