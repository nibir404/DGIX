"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import { CHECK_META, GATES } from "@/lib/seed";
import type { CheckKey } from "@/lib/types";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { HeroBlock } from "./HeroBlock";

gsap.registerPlugin(ScrollTrigger);

const sw = { fill: "none", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICONS: Record<CheckKey, React.ReactNode> = {
  quality: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  evidence: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.4 3.6-5 6.5-5s5.7 1.6 6.5 5" /><path d="M16 4.5a3.5 3.5 0 010 7M18 15c2 .6 3.2 2.2 3.5 5" /></>),
  security: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>),
  legal: (<><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>),
  pricing: (<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></>),
  support: <path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.4-5.4A8 8 0 1121 12z" />,
  readiness: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" /></>),
  docs: (<><rect x="3" y="5" width="13" height="14" rx="2" /><path d="M16 10l5-3v10l-5-3" /></>),
};

/** One icon per product gate: problem → offer → economics → proof → scale → portfolio. */
const GATE_ICONS: Record<(typeof GATES)[number]["id"], React.ReactNode> = {
  // Problem: a target — the real need the product solves
  PG0: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.5" /></>),
  // Offer: a package — what is actually sold
  PG1: (<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></>),
  // Economics: coins — pricing and unit economics
  PG2: (<><ellipse cx="9" cy="7" rx="5.5" ry="2.5" /><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7" /><path d="M9.5 16.5c.8 1.2 2.9 2 5.5 2 3 0 5.5-1.1 5.5-2.5v-4c0-1.4-2.5-2.5-5.5-2.5" /></>),
  // Proof: a verified badge — evidence from live customers
  PG3: (<><path d="M12 3l2.4 1.8 3-.1.9 2.8 2.4 1.8-.9 2.8.9 2.8-2.4 1.8-.9 2.8-3-.1L12 21l-2.4-1.8-3 .1-.9-2.8L3.3 14.7l.9-2.8-.9-2.8 2.4-1.8.9-2.8 3 .1z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></>),
  // Scale: trend up — ready for more markets and customers
  PG4: (<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>),
  // Portfolio: stacked layers — part of the long-term catalogue
  PG5: (<><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>),
};

function CheckCard({ i, k, label, max }: { i: number; k: CheckKey; label: string; max: number }) {
  const variant = i === 0 ? "night" : i < 3 ? "mist" : "line";
  const dark = variant === "night";
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4 }}
      className={clsx(
        "flex h-[180px] flex-col justify-between rounded-lg p-6 md:h-[220px] md:p-7",
        variant === "night" && "bg-night",
        variant === "mist" && "bg-mist",
        variant === "line" && "border border-line",
      )}
      style={dark ? { backgroundImage: "radial-gradient(ellipse 80% 100% at 100% 0% in oklab, #2F6BD8 0%, #2F6BD800 60%)" } : undefined}
    >
      <div className="flex items-start justify-between">
        <svg width="28" height="28" viewBox="0 0 24 24" stroke={dark ? "#FFFFFF" : "#0C1F45"} {...sw} className="shrink-0">{ICONS[k]}</svg>
        <div className={clsx("text-[56px] leading-[56px] font-light tracking-[-0.05em]", dark ? "text-paper" : "text-ink")}>{max}</div>
      </div>
      <div className={clsx("text-[19px] leading-6 font-medium", dark ? "text-paper" : "text-ink")}>{label}</div>
    </motion.div>
  );
}

function Gates() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(GATES.length - 1);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(-1);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "bottom 45%",
      scrub: true,
      onUpdate: (self) => setActive(Math.min(GATES.length - 1, Math.floor(self.progress * GATES.length) - (self.progress === 0 ? 1 : 0))),
    });
    return () => st.kill();
  }, []);
  return (
    <div className="@container">
    <div ref={ref} className="grid grid-cols-2 gap-[10px] @md:grid-cols-3 @4xl:grid-cols-6">
      {GATES.map((g, i) => {
        const on = i === active;
        const passed = i < active;
        return (
          <div
            key={g.id}
            className={clsx(
              "relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-lg p-4 transition-colors duration-500 sm:p-5",
              on ? "bg-night" : "bg-paper",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={clsx(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-500",
                  on ? "bg-white/10 text-glow-amber" : passed ? "bg-[#E6F4EC] text-success" : "bg-mist text-primary",
                )}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" {...sw} aria-hidden>{GATE_ICONS[g.id]}</svg>
              </span>
              <span
                aria-label={passed ? "Passed" : undefined}
                className={clsx("flex size-5 items-center justify-center rounded-full bg-success text-white transition-opacity duration-300", passed ? "opacity-100" : "opacity-0")}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" {...sw} strokeWidth={3.5} aria-hidden><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className={clsx("font-mono text-xs leading-4 transition-colors duration-500", on ? "text-glow-amber" : "text-muted")}>{g.id}</div>
              <div className={clsx("text-[15px] leading-5 font-medium transition-colors duration-500 [hyphens:none] [overflow-wrap:normal] [word-break:keep-all]", on ? "text-paper" : "text-ink")}>{g.name}</div>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

const LABELS = [
  { t: "Verified", cls: "bg-[#E6F4EC] text-success", stroke: "#14804A", icon: (<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>) },
  { t: "Certified", cls: "bg-mist text-primary", stroke: "#1E4FA3", icon: <path d="M12 3l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 16.5 6.7 19.4l1.1-6L3.4 9.3l6-.8z" /> },
  { t: "Declared", cls: "border border-line text-muted", stroke: "#5B6478", icon: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>) },
  { t: "Inferred", cls: "border border-dashed border-[#9AA2B4] text-muted", stroke: "#5B6478", icon: <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" /> },
];

export function VerifiedPage() {
  return (
    <>
      <PageHero>
        <HeroBlock
          eyebrow="Daffodil Verified"
          title={<>Most products<br />won&apos;t make the cut.</>}
          lead="Eight checks. Six gates. One hundred points. Reviewed per product, version and country by someone who didn't build it."
          aside={
            <div className="flex items-center gap-4 rounded-lg border border-[#FFFFFF2E] bg-[#FFFFFF14] py-3 pl-3 pr-[22px]">
              <div className="flex size-[56px] shrink-0 items-center justify-center rounded-full shadow-[0_0_30px_#2F6BD880]" style={{ backgroundImage: "linear-gradient(in oklab 135deg, #7FB6FF 0%, #2F6BD8 100%)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" stroke="#08152F" {...sw} strokeWidth={2}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </div>
              <div className="flex flex-col">
                <div className="text-[20px] leading-6 font-medium text-paper">Globally ready</div>
                <div className="text-sm leading-[18px] text-white/70">only at 100 / 100</div>
              </div>
            </div>
          }
        />
      </PageHero>

      <section className="mx-2 flex flex-col gap-10 px-4 pt-20 md:mx-4 md:px-10 md:pt-[112px]">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-ink">
            Eight checks,<br />one hundred points.
          </h2>
          <p className="text-base leading-[25px] text-muted lg:w-[380px] lg:shrink-0">
            Each check is scored on evidence. A product that misses any hard gate is not listed, whatever its total.
          </p>
        </Reveal>
        <Stagger gap={0.06} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHECK_META.map((c, i) => (
            <CheckCard key={c.key} i={i} k={c.key} label={c.label} max={c.max} />
          ))}
        </Stagger>
      </section>

      <section className="mx-2 flex flex-col gap-5 px-4 py-20 md:mx-4 md:px-10 md:py-[112px] lg:flex-row">
        <Reveal
          className="flex flex-col gap-7 rounded-lg bg-mist p-6 md:p-10 lg:flex-[1.4]"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 90% at 100% 0% in oklab, #C9DCFF 0%, #C9DCFF00 60%)" }}
        >
          <h3 className="text-[32px] leading-10 md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Six gates, in order.</h3>
          <Gates />
          <p className="text-[15px] leading-6 text-muted">Re-reviewed after every release, incident or expiry. Fall below the bar and the listing is suspended.</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-[22px] rounded-lg border border-line p-6 md:p-10 lg:flex-1">
          <h3 className="text-[32px] leading-10 md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Every claim, labelled.</h3>
          <div className="flex flex-wrap gap-2">
            {LABELS.map((l) => (
              <div key={l.t} className={clsx("flex h-8 items-center gap-[6px] rounded-lg pl-2 pr-3", l.cls)}>
                <svg width="18" height="18" viewBox="0 0 24 24" stroke={l.stroke} {...sw}>{l.icon}</svg>
                <span className="text-[13px] leading-4 font-semibold">{l.t}</span>
              </div>
            ))}
          </div>
          <p className="text-[15px] leading-6 text-muted">A score shows the product passed review. Your protection is the written SLA and warranty.</p>
        </Reveal>
      </section>
    </>
  );
}
