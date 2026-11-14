"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { VISUAL, footLine, gateName, score } from "./data";

/* ---------- icons (paths copied from Paper) ---------- */
const P: Record<string, React.ReactNode> = {
  shield: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />,
  shieldCheck: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  arrowUR: <path d="M7 17L17 7M8 7h9v9" />,
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevD: <path d="M6 9l6 6 6-6" />,
  chevR: <path d="M9 6l6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chat: <path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.4-5.4A8 8 0 1121 12z" />,
  doc: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.4 3.6-5 6.5-5s5.7 1.6 6.5 5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  star: <path d="M12 3l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 16.5 6.7 19.4l1.1-6L3.4 9.3l6-.8z" />,
  sparkle: <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  video: (
    <>
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </>
  ),
  pulse: <path d="M3 12h4l3-8 4 16 3-8h4" />,
};

export function Svg({ name, size = 20, color = "currentColor", width = 1.75, className }: { name: keyof typeof P | string; size?: number; color?: string; width?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={clsx("shrink-0", className)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[name]}
    </svg>
  );
}

export const blueBtn = "bg-[linear-gradient(180deg,#3A72DC_0%,#1E4FA3_100%)] shadow-[inset_0_1px_0_#FFFFFF59]";

/* ---------- product visual ---------- */
export function Visual({ p, className }: { p: Product; className?: string }) {
  const s = score(p);
  return (
    <div className={clsx("relative flex items-center justify-center overflow-clip rounded-lg bg-cover bg-center", className)} style={{ backgroundImage: `url(${VISUAL[p.visual]})` }}>
      <div className="absolute left-4 top-4 flex h-[30px] items-center gap-[6px] rounded-lg bg-white/85 pl-2 pr-3 shadow-[0_6px_16px_-8px_#0C1F454D]">
        <Svg name="shieldCheck" size={16} color="#14804A" />
        <span className="text-xs font-semibold leading-4 text-ink">{p.status === "pilot" ? `Pilot · ${s}` : `${s}/100`}</span>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/85 px-3 py-2 shadow-[0_10px_24px_-10px_#0C1F4559]">
        <span className="text-xs leading-4 text-muted">{p.metricLabel}</span>
        <span className="text-sm font-semibold leading-[18px] text-ink">{p.metricValue}</span>
      </div>
    </div>
  );
}

/* ---------- product card ---------- */
export function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      className="group flex min-h-[300px] flex-col gap-5 rounded-lg border border-mist bg-paper p-5 shadow-[0_24px_48px_-32px_#0C1F4559] transition-transform duration-300 hover:-translate-y-1 md:p-7"
    >
      <Visual p={p} className="h-[220px] shrink-0 transition-transform duration-500 group-hover:scale-[1.01]" />
      <div className="flex flex-col gap-[6px]">
        <div className="text-[24px] leading-[30px] tracking-[-0.02em] text-ink">{p.name}</div>
        <div className="text-[15px] leading-[23px] text-muted">{p.tagline}</div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-mist pt-[18px]">
        <div className="text-[13px] leading-4 text-muted">{footLine(p)}</div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink transition-colors group-hover:bg-primary">
          <Svg name="arrowUR" size={16} color="#fff" />
        </div>
      </div>
    </Link>
  );
}

/* ---------- in-review placeholder card ---------- */
export function ReviewCard({ p }: { p: Product }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border-[1.5px] border-dashed border-line bg-[#FBFCFE] p-5 md:p-7">
      <div className="flex h-[220px] shrink-0 items-center justify-center rounded-lg bg-[repeating-linear-gradient(135deg,#F1F4FA_0px,#F1F4FA_12px,#F7F9FD_12px,#F7F9FD_24px)]">
        <div className="flex h-[34px] items-center gap-2 rounded-full bg-paper px-[14px] shadow-[0_6px_16px_-8px_#0C1F454D]">
          <Svg name="clock" size={16} color="#B86E00" />
          <span className="text-[13px] font-semibold leading-4 text-[#8A5300]">
            In review · {p.gate} {gateName(p.gate)}
          </span>
        </div>
      </div>
      <div className="text-[24px] leading-[30px] tracking-[-0.02em] text-muted">{p.name}</div>
      <div className="text-[15px] leading-[23px] text-[#9AA2B4]">Listed once it passes all gates. Ask an advisor to be told first.</div>
    </div>
  );
}

/* ---------- AI + services panels ---------- */
const AI_TAGS = ["AI automation", "Agentic workflows", "Sovereign AI", "Intelligent AI solutions"];
const SVC_TAGS = ["Resource augmentation", "Custom engineering teams", "Implementation", "Integration", "Data migration", "Training", "Managed support"];

export function ServicePanels({ ai = "AI that's been tested on real work, not demos.", services = "Vetted engineers to build, move and run it." }: { ai?: string; services?: string }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Link href="/solutions/ai" className="flex flex-1 flex-col gap-5 rounded-lg bg-night-panel p-6 md:p-10">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs leading-4 text-sky">B</span>
          <span className="text-[17px] font-semibold leading-[22px] text-white">AI &amp; advanced technology</span>
        </div>
        <div className="text-[26px] font-light leading-[32px] tracking-[-0.03em] text-white md:text-[32px] md:leading-[38px]">{ai}</div>
        <div className="flex flex-wrap gap-2 pt-2">
          {AI_TAGS.map((t) => (
            <span key={t} className="rounded-full border border-white/22 px-4 py-[9px] text-sm leading-[18px] text-white">
              {t}
            </span>
          ))}
        </div>
      </Link>
      <Link href="/solutions/services" className="flex flex-1 flex-col gap-5 rounded-lg bg-mist p-6 md:p-10">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs leading-4 text-primary">C</span>
          <span className="text-[17px] font-semibold leading-[22px] text-ink">Professional IT services</span>
        </div>
        <div className="text-[26px] font-light leading-[32px] tracking-[-0.03em] text-ink md:text-[32px] md:leading-[38px]">{services}</div>
        <div className="flex flex-wrap gap-2 pt-2">
          {SVC_TAGS.map((t) => (
            <span key={t} className="rounded-full bg-paper px-4 py-[9px] text-sm leading-[18px] text-ink">
              {t}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
}

/* ---------- "Don't see what you need?" band ---------- */
export function NotListed() {
  const { user } = useStore();
  const href = user?.role === "buyer" ? "/buyer/requests/new" : `/sign-in?next=${encodeURIComponent("/buyer/requests/new")}`;
  return (
    <div className="flex flex-col items-start gap-5 rounded-lg bg-mist bg-[radial-gradient(ellipse_60%_120%_at_100%_0%,#C9DCFF_0%,#C9DCFF00_60%)] px-6 py-8 md:flex-row md:items-center md:justify-between md:px-9">
      <div className="flex flex-col gap-[6px]">
        <div className="text-[28px] font-light leading-[34px] tracking-[-0.03em] text-ink">Don&apos;t see what you need?</div>
        <div className="text-[15px] leading-[18px] text-muted">Describe it. An advisor checks partners under review and replies in one business day.</div>
      </div>
      <Link href={href} className={clsx("inline-flex h-[52px] shrink-0 items-center gap-2 rounded-lg px-6 shadow-[inset_0_1px_0_#FFFFFF59,0_8px_20px_-6px_#1E4FA38C]", "bg-[linear-gradient(180deg,#3A72DC_0%,#1E4FA3_100%)]")}>
        <span className="text-[15px] font-semibold leading-[18px] text-white">Describe my need</span>
        <Svg name="arrowR" size={18} color="#fff" />
      </Link>
    </div>
  );
}

/* ---------- intro + FAQ ---------- */
export function IntroFaq({ title, intro, faqs }: { title: string; intro: string; faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-10 pt-14 md:flex-row md:gap-14">
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-[30px] font-light leading-[36px] tracking-tight text-ink md:text-[36px] md:leading-[42px]">{title}</h2>
        <p className="text-base leading-[26px] text-muted">{intro}</p>
      </div>
      <div className="flex flex-1 flex-col border-t border-ink">
        {faqs.map((f, i) => (
          <div key={f.q} className="border-b border-mist">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
              <span className="text-[17px] leading-[22px] text-ink">{f.q}</span>
              <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="flex">
                <Svg name="plus" size={20} color="#0C1F45" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="pb-5 text-[15px] leading-[23px] text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- hero stat ---------- */
export function HeroStat({ n, label }: { n: React.ReactNode; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-[6px] md:items-end">
      <div className="text-[56px] font-light leading-[56px] tracking-tight text-white">{n}</div>
      <div className="text-sm leading-[18px] text-white/70">{label}</div>
    </div>
  );
}

/* ---------- category chips row ---------- */
export function Chip({ active, children, onClick, href }: { active?: boolean; children: React.ReactNode; onClick?: () => void; href?: string }) {
  const cls = clsx(
    "relative shrink-0 whitespace-nowrap rounded-lg px-[18px] py-[10px] text-sm leading-[18px] transition-colors",
    active ? "font-semibold text-white" : "border border-line text-ink hover:border-ink/40",
  );
  const inner = (
    <>
      {active && <motion.span layoutId="cat-chip" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
      <span className="relative">{children}</span>
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function SortMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const opts = ["Best fit", "Highest score", "Fastest go-live", "Name A–Z"];
  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm leading-[18px]">
        <span className="text-muted">Sort</span>
        <span className="font-semibold text-ink">{value}</span>
        <Svg name="chevD" size={16} color="#0C1F45" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 top-8 z-20 flex w-48 flex-col rounded-lg border border-mist bg-paper p-1.5 shadow-[0_20px_40px_-20px_#0C1F4580]"
          >
            {opts.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={clsx("rounded-lg px-3 py-2 text-left text-sm", o === value ? "bg-mist font-semibold text-ink" : "text-ink hover:bg-mist")}
              >
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function sortProducts(list: Product[], sort: string) {
  const weeks = (p: Product) => parseInt(p.goLive) || 99;
  const l = [...list];
  if (sort === "Highest score") l.sort((a, b) => score(b) - score(a));
  else if (sort === "Fastest go-live") l.sort((a, b) => weeks(a) - weeks(b));
  else if (sort === "Name A–Z") l.sort((a, b) => a.name.localeCompare(b.name));
  else l.sort((a, b) => (a.status === "pilot" ? 1 : 0) - (b.status === "pilot" ? 1 : 0));
  return l;
}

/* ---------- advisor card ---------- */
export function AdvisorCard({ href = "/buyer/support" }: { href?: string }) {
  return (
    <div className="flex items-center gap-[14px] rounded-lg border border-mist bg-paper p-[18px] shadow-[0_20px_40px_-24px_#0C1F454D]">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7FB6FF_0%,#2F6BD8_100%)] shadow-[0_0_0_3px_#fff,0_0_0_4.5px_#14804A]">
        <span className="text-[15px] font-bold leading-[18px] text-night">AS</span>
      </div>
      <div className="flex flex-1 flex-col gap-[2px]">
        <div className="text-[15px] font-semibold leading-[18px] text-ink">Asha Rahman</div>
        <div className="text-xs leading-4 text-muted">Your DGIX advisor · online</div>
      </div>
      <Link href={href} aria-label="Message advisor" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mist">
        <Svg name="chat" size={18} color="#0C1F45" />
      </Link>
    </div>
  );
}

