"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Toast } from "@/components/portal/ui";
import type { BuyerRequest } from "@/lib/types";

/** Buyer-only helpers. */

export function useFlash() {
  const [msg, setMsg] = useState<string | null>(null);
  const [last, setLast] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((m: string) => {
    setMsg(m);
    setLast(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2800);
  }, []);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const node = <Toast show={!!msg}>{msg ?? last}</Toast>;
  return { flash, toast: node };
}

/** Data scoped to the signed-in buyer's company. */
export function useBuyer() {
  const s = useStore();
  const c = s.user?.companyId ?? "";
  const { db } = s;
  return {
    ...s,
    companyId: c,
    company: db.companies.find((x) => x.id === c),
    requests: db.requests.filter((r) => r.buyerId === c),
    demos: db.demos.filter((d) => d.buyerId === c),
    offers: db.offers.filter((o) => o.buyerId === c),
    projects: db.projects.filter((p) => p.buyerId === c),
    invoices: db.invoices.filter((i) => i.buyerId === c),
    licences: db.licences.filter((l) => l.buyerId === c),
    cases: db.cases.filter((x) => x.companyId === c),
  };
}

export const firstName = (n?: string) => (n ?? "").split(" ")[0];
export const money = (n: number) => "$" + n.toLocaleString("en-US");
export const dayMonth = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dubai" });
export const timeGst = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dubai" }).toLowerCase() + " GST";
export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);

export function Panel({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={clsx("rounded-lg bg-paper", className)}
    >
      {children}
    </motion.section>
  );
}

export function Heading({ kicker, title, action }: { kicker?: React.ReactNode; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        {kicker && <div className="text-sm leading-[18px] text-muted">{kicker}</div>}
        <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[40px] md:leading-12">{title}</h1>
      </div>
      {action}
    </div>
  );
}

const pillTone = {
  success: "bg-[#E6F4EC] text-[#0E6439] [&>i]:bg-success",
  info: "bg-[#E7EEFB] text-primary [&>i]:bg-primary",
  warning: "bg-[#FDF1DE] text-warning [&>i]:bg-warning",
  danger: "bg-[#FBE7E7] text-danger [&>i]:bg-danger",
  neutral: "bg-mist text-muted [&>i]:bg-subtle",
};
export type PillTone = keyof typeof pillTone;

export function Pill({ tone = "info", children, className }: { tone?: PillTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex h-[26px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium leading-4", pillTone[tone], className)}>
      <i className="size-1.5 rounded-full" />
      {children}
    </span>
  );
}

export function Btn({
  children, onClick, href, variant = "primary", size = "md", className, disabled, type = "button",
}: {
  children: React.ReactNode; onClick?: () => void; href?: string; variant?: "primary" | "outline" | "white" | "soft" | "dark"; size?: "sm" | "md" | "lg"; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const cls = clsx(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-[filter,background-color,border-color] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "h-8 px-3.5 text-xs leading-4",
    size === "md" && "h-11 px-5 text-sm",
    size === "lg" && "h-[52px] px-6 text-[15px] leading-[18px]",
    variant === "primary" && "bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] text-paper hover:brightness-110",
    variant === "outline" && "border border-line bg-paper text-ink hover:border-ink",
    variant === "white" && "bg-paper text-night hover:bg-mist",
    variant === "soft" && "bg-mist text-primary hover:bg-[#E2EAF7]",
    variant === "dark" && "bg-night text-paper hover:brightness-125",
    className,
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function Arrow({ color = "currentColor", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Tick({ size = 12, color = "#FFFFFF", width = 3 }: { size?: number; color?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sparkle({ color = "#FFD58A", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Centered modal dialog. */
export function Dialog({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-night/50 p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-label={title}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-lg bg-paper p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-xl font-medium leading-6 text-ink">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="text-subtle hover:text-ink">✕</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export const requestStatus: Record<BuyerRequest["status"], { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-mist text-muted" },
  matching: { label: "Matching", cls: "bg-[#FDF1DE] text-warning" },
  shortlist_sent: { label: "Shortlist ready", cls: "bg-mist text-primary" },
  demo: { label: "Demos booked", cls: "bg-mist text-primary" },
  offer: { label: "Offer ready", cls: "bg-[#FDF1DE] text-warning" },
  won: { label: "Now a project", cls: "bg-[#E6F4EC] text-[#0E6439]" },
  closed: { label: "Closed", cls: "bg-mist text-muted" },
};

export function StatusTag({ status }: { status: BuyerRequest["status"] }) {
  const s = requestStatus[status];
  return <span className={clsx("inline-block shrink-0 whitespace-nowrap rounded-lg px-2.5 py-[5px] text-xs font-semibold leading-4", s.cls)}>{s.label}</span>;
}

export const requestThumb = (r: Pick<BuyerRequest, "title" | "need">) =>
  /pos|store|retail|shop/i.test(r.title + " " + r.need) ? "/media/buyer-req-pos.webp" : "/media/buyer-req-hr.webp";
