"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seed } from "./seed";
import type { BuyerRequest, Db, Role, User } from "./types";

const KEY = "dgix-db-v1";
const SESSION_COOKIE = "dgix_uid";

type Ctx = {
  db: Db;
  ready: boolean;
  user: User | null;
  signIn: (email: string, password: string) => User | null;
  signInAs: (userId: string) => User | null;
  signOut: () => void;
  reset: () => void;
  // Buyer flow
  createRequest: (r: Pick<BuyerRequest, "title" | "need" | "country" | "budget" | "users" | "goLive">) => BuyerRequest;
  bookDemo: (productId: string, requestId?: string) => void;
  acceptOffer: (offerId: string) => void;
  declineOffer: (offerId: string) => void;
  acceptMilestone: (projectId: string, milestoneId: string) => void;
  payInvoice: (invoiceId: string) => void;
  openCase: (title: string, body: string, projectId?: string) => void;
  replyCase: (caseId: string, body: string) => void;
  resolveCase: (caseId: string) => void;
  // Seller flow
  uploadEvidence: (productId: string, checkKey: string) => void;
  confirmDemo: (demoId: string) => void;
  submitMilestone: (projectId: string, milestoneId: string) => void;
  // Staff flow
  confirmShortlist: (requestId: string, productIds?: string[]) => void;
  approvePayouts: (ids: string[]) => void;
  sendOffer: (offerId: string) => void;
  approveCheck: (productId: string, checkKey: string) => void;
  verifyPayment: (invoiceId: string) => void;
  markRead: (notificationId: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

function load(): Db {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {}
  return structuredClone(seed);
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export const portalHome: Record<Role, string> = { buyer: "/buyer", seller: "/seller", staff: "/admin" };

const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const today = () => new Date().toISOString();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db>(seed);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setDb(load());
    setUserId(readCookie(SESSION_COOKIE));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {}
  }, [db, ready]);

  const user = useMemo(() => db.users.find((u) => u.id === userId) ?? null, [db.users, userId]);

  const update = useCallback((fn: (d: Db) => void) => {
    setDb((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const startSession = (u: User) => {
    document.cookie = `${SESSION_COOKIE}=${u.id}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    document.cookie = `dgix_role=${u.role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    setUserId(u.id);
    return u;
  };

  const notify = (d: Db, userId: string, title: string, body: string, href: string) => {
    d.notifications.unshift({ id: "n-" + uid(), userId, title, body, href, at: today(), read: false });
  };

  const value: Ctx = {
    db,
    ready,
    user,
    signIn: (email, password) => {
      const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
      return u ? startSession(u) : null;
    },
    signInAs: (id) => {
      const u = db.users.find((x) => x.id === id);
      return u ? startSession(u) : null;
    },
    signOut: () => {
      document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
      document.cookie = `dgix_role=; path=/; max-age=0`;
      setUserId(null);
    },
    reset: () => {
      setDb(structuredClone(seed));
    },

    createRequest: (input) => {
      const company = db.companies.find((c) => c.id === user?.companyId);
      const req: BuyerRequest = {
        id: "r-" + uid().toLowerCase(),
        ref: "REQ-202611-" + uid(),
        buyerId: user?.companyId ?? "c-gulf",
        status: "matching",
        createdAt: today(),
        dueAt: new Date(Date.now() + 24 * 3600e3).toISOString(),
        shortlist: [],
        ...input,
      };
      // Mock AI pre-ranking from the need text
      const text = (input.title + " " + input.need).toLowerCase();
      const ranked = db.products
        .filter((p) => p.status === "listed" || p.status === "pilot")
        .map((p) => {
          let fit = 50;
          const words: Record<string, string[]> = {
            hr: ["hr", "payroll", "wps", "staff", "leave"],
            healthcare: ["clinic", "hospital", "emr", "pharmacy", "patient"],
            retail: ["pos", "store", "retail", "shop"],
            erp: ["erp", "inventory", "procurement", "finance"],
            education: ["school", "campus", "university", "student"],
            ai: ["ai", "document", "invoice", "automation", "agent"],
          };
          (words[p.category] ?? []).forEach((w) => text.includes(w) && (fit += 12));
          if (input.country && p.markets.some((m) => input.country.includes(m) || (m === "UAE" && input.country.includes("Emirates")))) fit += 8;
          return { p, fit: Math.min(fit, 97) };
        })
        .sort((a, b) => b.fit - a.fit)
        .slice(0, 3);
      req.shortlist = ranked.map(({ p, fit }) => ({ productId: p.id, fit, confirmed: false, strengths: [p.tagline], gaps: fit < 75 ? ["Partial fit — advisor to check"] : [] }));
      update((d) => {
        d.requests.unshift(req);
        notify(d, company?.advisorId ?? "u-asha", "New request · " + (company?.name ?? "Buyer"), input.title, "/admin/matching");
      });
      return req;
    },
    bookDemo: (productId, requestId) =>
      update((d) => {
        d.demos.unshift({ id: "d-" + uid(), productId, requestId, buyerId: user?.companyId ?? "c-gulf", at: new Date(Date.now() + 3 * 864e5).toISOString(), status: "requested", questions: 0 });
        const r = d.requests.find((x) => x.id === requestId);
        if (r && r.status === "shortlist_sent") r.status = "demo";
        const p = d.products.find((x) => x.id === productId);
        const seller = d.users.find((u) => u.companyId === p?.partnerId && u.role === "seller");
        if (seller) notify(d, seller.id, "New demo request", `${p?.name} · ${d.companies.find((c) => c.id === user?.companyId)?.name}`, "/seller/leads");
      }),
    acceptOffer: (offerId) =>
      update((d) => {
        const o = d.offers.find((x) => x.id === offerId);
        if (!o) return;
        o.status = "accepted";
        o.signedAt = today().slice(0, 10);
        const r = d.requests.find((x) => x.id === o.requestId);
        if (r) r.status = "won";
        const p = d.products.find((x) => x.id === o.productId)!;
        if (!d.projects.some((pr) => pr.offerId === o.id)) {
          d.projects.unshift({
            id: "pr-" + uid().toLowerCase(), name: `${p.name} rollout`, offerId: o.id, productId: o.productId, buyerId: o.buyerId, partnerId: p.partnerId, city: "Dubai", health: "on_track",
            milestones: o.milestones.map((m, i) => ({ id: "m" + (i + 1), title: m.title, amount: m.amount, status: i === 0 ? "in_progress" : "upcoming", due: new Date(Date.now() + (i + 1) * 21 * 864e5).toISOString().slice(0, 10) })),
          });
        }
        notify(d, "u-asha", "Offer accepted", `${o.ref} · ${p.name}`, "/admin/offers");
      }),
    declineOffer: (offerId) =>
      update((d) => {
        const o = d.offers.find((x) => x.id === offerId);
        if (o) o.status = "declined";
      }),
    acceptMilestone: (projectId, milestoneId) =>
      update((d) => {
        const pr = d.projects.find((x) => x.id === projectId);
        const m = pr?.milestones.find((x) => x.id === milestoneId);
        if (!pr || !m) return;
        m.status = "done";
        m.acceptedOn = today().slice(0, 10);
        const next = pr.milestones.find((x) => x.status === "upcoming");
        if (next) next.status = "in_progress";
        d.invoices.unshift({ id: "i-" + uid(), ref: "INV-00" + (45 + d.invoices.length), buyerId: pr.buyerId, projectId, milestone: m.title, amount: m.amount, due: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10), status: "due" });
      }),
    payInvoice: (invoiceId) =>
      update((d) => {
        const inv = d.invoices.find((x) => x.id === invoiceId);
        if (!inv) return;
        inv.status = "paid";
        inv.paidOn = today().slice(0, 10);
        notify(d, "u-farhan", "Payment received", `${inv.ref} · $${inv.amount.toLocaleString()} to verify`, "/admin/finance");
      }),
    openCase: (title, body, projectId) =>
      update((d) => {
        d.cases.unshift({ id: "cs-" + uid(), ref: "CASE-0" + (113 + d.cases.length), companyId: user?.companyId ?? "", projectId, title, priority: "normal", status: "open", opened: today(), messages: [{ from: user?.id ?? "", at: today(), body }] });
      }),
    replyCase: (caseId, body) =>
      update((d) => {
        const c = d.cases.find((x) => x.id === caseId);
        if (c) c.messages.push({ from: user?.id ?? "", at: today(), body });
      }),

    resolveCase: (caseId) =>
      update((d) => {
        const c = d.cases.find((x) => x.id === caseId);
        if (c) c.status = "resolved";
      }),
    uploadEvidence: (productId, checkKey) =>
      update((d) => {
        const p = d.products.find((x) => x.id === productId);
        const c = p?.checks.find((x) => x.key === checkKey);
        if (c) c.note = "Uploaded · awaiting review";
        notify(d, "u-asha", "Evidence uploaded", `${p?.name} · ${c?.label}`, "/admin/review");
      }),
    confirmDemo: (demoId) =>
      update((d) => {
        const dm = d.demos.find((x) => x.id === demoId);
        if (!dm) return;
        dm.status = "booked";
        const buyer = d.users.find((u) => u.companyId === dm.buyerId && u.role === "buyer");
        const p = d.products.find((x) => x.id === dm.productId);
        if (buyer) notify(d, buyer.id, "Demo confirmed", `${p?.name} · ${new Date(dm.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`, "/buyer/demos");
      }),
    submitMilestone: (projectId, milestoneId) =>
      update((d) => {
        const pr = d.projects.find((x) => x.id === projectId);
        const m = pr?.milestones.find((x) => x.id === milestoneId);
        if (!pr || !m) return;
        m.status = "in_review";
        const buyer = d.users.find((u) => u.companyId === pr.buyerId && u.role === "buyer");
        if (buyer) notify(d, buyer.id, "Milestone ready to review", `${pr.name} · ${m.title}`, "/buyer/projects");
      }),

    confirmShortlist: (requestId, productIds) =>
      update((d) => {
        const r = d.requests.find((x) => x.id === requestId);
        if (!r) return;
        if (productIds) r.shortlist = r.shortlist.filter((s) => productIds.includes(s.productId));
        r.shortlist.forEach((s) => (s.confirmed = true));
        r.status = "shortlist_sent";
        r.ownerId = user?.id ?? "u-asha";
        const buyer = d.users.find((u) => u.companyId === r.buyerId && u.role === "buyer");
        if (buyer) notify(d, buyer.id, "Your shortlist is ready", `${r.shortlist.length} verified matches for ${r.title}`, "/buyer/shortlist");
      }),
    sendOffer: (offerId) =>
      update((d) => {
        const o = d.offers.find((x) => x.id === offerId);
        if (!o) return;
        o.status = "sent";
        o.sentAt = today().slice(0, 10);
        const r = d.requests.find((x) => x.id === o.requestId);
        if (r) r.status = "offer";
        const buyer = d.users.find((u) => u.companyId === o.buyerId && u.role === "buyer");
        if (buyer) notify(d, buyer.id, "New offer to review", `${o.ref} · $${o.price.toLocaleString()}`, "/buyer/offers");
      }),
    approveCheck: (productId, checkKey) =>
      update((d) => {
        const p = d.products.find((x) => x.id === productId);
        const c = p?.checks.find((x) => x.key === checkKey);
        if (!p || !c) return;
        c.score = c.max;
        c.note = undefined;
        const total = p.checks.reduce((s, x) => s + x.score, 0);
        const order = ["PG0", "PG1", "PG2", "PG3", "PG4", "PG5"] as const;
        const byScore = total >= 100 ? 5 : total >= 85 ? 4 : total >= 70 ? 3 : total >= 50 ? 2 : 1;
        if (order.indexOf(p.gate) < byScore) p.gate = order[byScore];
        if (total === 100) {
          p.gate = "PG5";
          p.status = "listed";
          p.waitingOn = undefined;
          p.reviewedOn = today().slice(0, 10);
        }
        const seller = d.users.find((u) => u.companyId === p.partnerId);
        if (seller) notify(d, seller.id, total === 100 ? `${p.name} passed 100/100` : "Check approved", total === 100 ? "You're now listed." : `${c.label} · ${total}/100`, "/seller/products");
      }),
    verifyPayment: (invoiceId) =>
      update((d) => {
        const inv = d.invoices.find((x) => x.id === invoiceId);
        if (!inv) return;
        inv.status = "verified";
        const pr = d.projects.find((x) => x.id === inv.projectId);
        if (pr) {
          const fee = Math.round(inv.amount * 0.15);
          d.payouts.unshift({ id: "po-" + uid(), partnerId: pr.partnerId, invoiceId: inv.id, gross: inv.amount, fee, net: inv.amount - fee, status: "scheduled", date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) });
        }
      }),
    approvePayouts: (ids) =>
      update((d) => {
        d.payouts.forEach((p) => {
          if (ids.includes(p.id)) p.status = "paid";
        });
      }),
    markRead: (id) =>
      update((d) => {
        const n = d.notifications.find((x) => x.id === id);
        if (n) n.read = true;
      }),
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
    score: (productId?: string) => db.products.find((p) => p.id === productId)?.checks.reduce((s, c) => s + c.score, 0) ?? 0,
  };
}
