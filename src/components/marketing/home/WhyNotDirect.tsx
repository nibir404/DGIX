"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Panel, Eyebrow, H2 } from "./shared";
import { T } from "@/lib/i18n";

const rows = [
  ["Dozens of vendors who all claim to be the best", "Every option already passed a 100-point check"],
  ["Pay a consultant to compare them", "AI and an expert advisor match you, free"],
  ["Negotiate price and terms yourself", "One offer: price, SLA, warranty, exit terms"],
  ["Pay upfront and hope it ships", "Pay per milestone, only for accepted work"],
  ["Chase support across time zones", "One named DGIX contact, start to finish"],
];

/**
 * "Going it alone" vs "With DGIX". The DGIX column sits on a glowing dark-blue card so the
 * contrast reads at a glance. On phones the whole comparison sits on the dark card, each row
 * showing the pain point (crossed) above the DGIX answer (checked).
 */
export function WhyNotDirect() {
  return (
    <Panel className="flex flex-col gap-12 px-6 py-20 md:px-20 md:py-[128px] lg:flex-row lg:gap-[96px]">
      <Reveal className="flex flex-col gap-6 lg:w-[420px] lg:shrink-0">
        <Eyebrow><T>The difference</T></Eyebrow>
        <H2><T>Why not go direct?</T></H2>
        <p className="text-[17px] leading-7 text-muted">
          Same software, none of the risk. DGIX does the vetting, the contract and the follow-through, at <span className="font-semibold text-ink">no extra cost to you</span>.
        </p>
      </Reveal>

      <Reveal className="relative flex-1">
        {/* DGIX column card (right half on tablet+, full width on phones) */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary via-primary-strong to-night shadow-[0_30px_80px_-20px_rgba(30,79,163,0.55)] md:left-1/2"
        >
          <div className="absolute inset-0 rounded-lg bg-[radial-gradient(120%_60%_at_80%_0%,rgba(127,182,255,0.35),transparent_60%)]" />
          <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/15" />
        </div>

        <div className="relative">
          {/* Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="hidden px-6 pb-5 pt-7 md:block">
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle">Going it alone</span>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-7">
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-sky">With DGIX</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/25">Recommended</span>
            </div>
          </div>

          <Stagger>
            {rows.map(([a, b], i) => (
              <motion.div
                key={a}
                variants={staggerItem}
                className={`grid grid-cols-1 gap-2 px-0 py-5 md:grid-cols-2 md:gap-0 md:py-6 ${i < rows.length - 1 ? "border-b border-white/10 md:border-0" : ""}`}
              >
                <div className={`flex items-start gap-3 px-6 md:pr-8 ${i < rows.length - 1 ? "md:border-b md:border-line md:pb-6" : ""}`}>
                  <span className="mt-[3px] grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-white/60 md:bg-line md:text-subtle">
                    <Icon name="x" size={12} strokeWidth={2.4} />
                  </span>
                  <span className="text-[14px] leading-[22px] text-white/60 line-through decoration-white/30 md:text-[16px] md:leading-[26px] md:text-subtle md:decoration-subtle/40">{a}</span>
                </div>
                <div className={`flex items-start gap-3 px-6 ${i < rows.length - 1 ? "md:border-b md:border-white/10 md:pb-6" : ""}`}>
                  <span className="mt-[2px] grid size-6 shrink-0 place-items-center rounded-full bg-sky text-night shadow-[0_0_16px_rgba(127,182,255,0.7)]">
                    <Icon name="check" size={14} strokeWidth={2.6} />
                  </span>
                  <span className="text-[16px] font-semibold leading-[24px] text-white md:text-[18px] md:leading-[27px]">{b}</span>
                </div>
              </motion.div>
            ))}
          </Stagger>
          <div className="h-3" />
        </div>
      </Reveal>
    </Panel>
  );
}
