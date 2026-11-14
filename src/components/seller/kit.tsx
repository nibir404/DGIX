"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import type { Company, Db, Product, Project } from "@/lib/types";
import { Toast } from "@/components/portal/ui";

/* ---------- data ---------- */

export const scoreOf = (p?: Product) => p?.checks.reduce((s, c) => s + c.score, 0) ?? 0;
export const pendingChecks = (p?: Product) => p?.checks.filter((c) => c.score < c.max) ?? [];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dayMonth = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

/** Order reference shown to partners: derived from the offer ref when there is one. */
export function orderRef(db: Db, pr?: Project) {
  if (!pr) return "ORD-0000";
  const o = db.offers.find((x) => x.id === pr.offerId);
  if (o) return o.ref.replace("OFF", "ORD");
  return "ORD-" + String(10 + db.projects.findIndex((x) => x.id === pr.id)).padStart(4, "0");
}

const shortCountry = (c?: string) =>
  ({ "United Arab Emirates": "UAE", "Saudi Arabia": "KSA", "United States": "USA" } as Record<string, string>)[c ?? ""] ?? c ?? "";

/** Buyers stay anonymous to partners until after the demo. */
export function anonBuyer(c?: Company) {
  if (!c) return "Buyer";
  const n = c.name.toLowerCase();
  const kind = n.includes("retail") ? "Retail group" : n.includes("clinic") || n.includes("hospital") ? "Clinic group" : n.includes("logistic") ? "Logistics firm" : "Buyer";
  return `${kind} · ${shortCountry(c.country)}`;
}

export function useSeller() {
  const store = useStore();
  const { db, user } = store;
  const companyId = user?.companyId ?? "";
  return useMemo(() => {
    const company = db.companies.find((c) => c.id === companyId);
    const products = db.products.filter((p) => p.partnerId === companyId);
    const productIds = new Set(products.map((p) => p.id));
    const focus = products.find((p) => scoreOf(p) < 100) ?? products[0];
    const demos = db.demos.filter((d) => productIds.has(d.productId));
    const projects = db.projects.filter((p) => p.partnerId === companyId);
    const payouts = db.payouts.filter((p) => p.partnerId === companyId).sort((a, b) => b.date.localeCompare(a.date));
    const cases = db.cases.filter((c) => c.companyId === companyId);
    return { ...store, company, companyId, products, productIds, focus, demos, projects, payouts, cases };
  }, [store, db, companyId]);
}

/* ---------- feedback ---------- */

export function useFlash() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const flash = useCallback((m: string) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2800);
  }, []);
  const node = <Toast show={!!msg}>{msg}</Toast>;
  return { flash, toast: node };
}

/* ---------- primitives (Paper portal values) ---------- */

export const NIGHT_BANNER =
  "radial-gradient(ellipse 60% 120% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), radial-gradient(ellipse 40% 90% at 70% 100%, #F6A11A4D 0%, #F6A11A00 70%)";
export const NIGHT_CARD = "radial-gradient(ellipse 70% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 65%)";
export const HATCH = "repeating-linear-gradient(135deg, rgb(127,182,255) 0px, rgb(127,182,255) 2px, rgb(227,237,253) 2px, rgb(227,237,253) 6px)";
export const BTN_GRADIENT = "bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)]";

export function Panel({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={style}
      className={clsx("rounded-lg", className)}
    >
      {children}
    </motion.div>
  );
}

export function Head({ kicker, title, right }: { kicker: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-[6px]">
        <div className="text-[13px] leading-4 text-muted">{kicker}</div>
        <h1 className="text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-light tracking-tight text-ink">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function Pill({ tone = "info", children }: { tone?: "info" | "success" | "warning" | "amber"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-block whitespace-nowrap rounded-lg px-[10px] py-1 text-xs font-semibold leading-4",
        tone === "info" && "bg-mist text-primary",
        tone === "success" && "bg-[#E6F4EC] text-[#0E6439]",
        tone === "warning" && "bg-[#FFF3DC] text-warning",
        tone === "amber" && "bg-glow-amber text-night",
      )}
    >
      {children}
    </span>
  );
}

export function ProductTabs({ products, value, onChange }: { products: Product[]; value?: string; onChange: (id: string) => void }) {
  if (products.length < 2) return null;
  return (
    <div className="flex max-w-full items-center gap-1 self-start overflow-x-auto rounded-lg bg-paper p-1 md:self-auto">
      {products.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={clsx(
            "relative whitespace-nowrap rounded-lg px-[14px] py-[6px] text-[13px] leading-4 transition-colors",
            p.id === value ? "font-semibold text-paper" : "text-muted hover:text-ink",
          )}
        >
          {p.id === value && <motion.span layoutId="seller-tab" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <span className="relative">{p.name}</span>
        </button>
      ))}
    </div>
  );
}

/** Six-month bar chart; last bar solid, others hatched. */
export function Bars({ values, radius = 8, className }: { values: number[]; radius?: number; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className={clsx("flex items-end gap-[10px]", className)}>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(6, Math.round((v / max) * 92))}%` }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          title={"$" + v.toLocaleString("en-US")}
          style={{ borderRadius: radius, background: i === values.length - 1 ? undefined : HATCH }}
          className={clsx("grow basis-0", i === values.length - 1 && "bg-primary")}
        />
      ))}
    </div>
  );
}

/** Net paid out per month for the last six months (ending this month). */
export function lastSixMonths(payouts: { net: number; date: string; status: string }[], now = new Date()) {
  const out: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    out.push({ label: MONTHS[d.getUTCMonth()], value: payouts.filter((p) => p.status === "paid" && p.date.startsWith(key)).reduce((s, p) => s + p.net, 0) });
  }
  return out;
}
