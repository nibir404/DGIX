"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";

/** Shared building blocks for the three portals. Values follow the Paper portal artboards. */

export function PageTitle({ kicker, title, action }: { kicker?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        {kicker && <div className="text-[15px] leading-[18px] text-muted">{kicker}</div>}
        <h1 className="text-[34px] leading-[40px] md:text-[44px] md:leading-[48px] font-light tracking-tight text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children, title, meta }: { className?: string; children: React.ReactNode; title?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={clsx("rounded-lg bg-white p-6", className)}
    >
      {(title || meta) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-xl font-normal leading-6 tracking-[-0.01em]">{title}</h2>}
          {meta && <div className="text-[13px] text-muted">{meta}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export function NightCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={clsx("relative overflow-hidden rounded-lg bg-night-panel p-6 text-white", className)}
    >
      {children}
    </motion.section>
  );
}

export function Stats({ items }: { items: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "primary" | "success" | "warning" | "danger" | "muted" }[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-lg bg-white">
      {items.map((s, i) => (
        <div key={s.label} className={clsx("flex flex-col gap-2 p-6", i > 0 && "lg:border-l border-line", i % 2 === 1 && "border-l border-line lg:border-l", i > 1 && "border-t lg:border-t-0 border-line")}>
          <div className="text-sm text-muted">{s.label}</div>
          <div className="text-[38px] leading-[44px] font-light tracking-tight">{s.value}</div>
          {s.sub && <div className={clsx("text-[13px]", toneText[s.tone ?? "muted"])}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

const toneText = { primary: "text-primary", success: "text-success", warning: "text-warning", danger: "text-danger", muted: "text-muted" };

const chipTone: Record<string, string> = {
  draft: "bg-mist text-muted",
  neutral: "bg-mist text-ink",
  info: "bg-[#E7EEFB] text-primary",
  success: "bg-[#E7F5EE] text-success",
  warning: "bg-[#FDF1DE] text-warning",
  danger: "bg-[#FBE7E7] text-danger",
};

export function Chip({ tone = "info", children, dot = true }: { tone?: keyof typeof chipTone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium", chipTone[tone])}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Button({
  href,
  onClick,
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "white" | "soft";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls = clsx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
    size === "sm" && "h-8 px-4 text-[13px]",
    size === "md" && "h-10 px-5 text-sm",
    size === "lg" && "h-12 px-6 text-[15px]",
    variant === "primary" && "bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] text-white shadow-[0_8px_20px_-10px_#1E4FA3] hover:brightness-110",
    variant === "outline" && "border border-line bg-white text-ink hover:border-ink",
    variant === "ghost" && "text-primary hover:bg-mist",
    variant === "white" && "bg-white text-ink hover:bg-mist",
    variant === "soft" && "bg-mist text-primary hover:bg-[#E2EAF7]",
    className,
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function Progress({ value, tone = "primary", striped, className }: { value: number; tone?: "primary" | "amber" | "success" | "sky"; striped?: boolean; className?: string }) {
  return (
    <div className={clsx("h-1.5 w-full overflow-hidden rounded-lg bg-mist", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={clsx(
          "h-full rounded-lg",
          tone === "primary" && "bg-primary",
          tone === "amber" && "bg-amber",
          tone === "success" && "bg-success",
          tone === "sky" && "bg-sky",
          striped && "hatch",
        )}
      />
    </div>
  );
}

export function Table({ head, children, className }: { head: React.ReactNode[]; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={i} className="pb-3 text-xs font-medium uppercase tracking-[0.06em] text-subtle">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-[#F1F4FA] [&>tr:last-child]:border-0 [&_td]:py-3.5 [&_td]:pr-4 [&_td]:align-middle text-sm">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <div className="text-lg">{title}</div>
      {body && <div className="max-w-sm text-sm text-muted">{body}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Toast({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={show ? { opacity: 1, y: 0, pointerEvents: "auto" } : { opacity: 0, y: 16, pointerEvents: "none" }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-night px-5 py-4 text-sm text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-success/30 text-[#3DDC84]">✓</span>
      {children}
    </motion.div>
  );
}

export const dateShort = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const dateLong = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
