"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";
import { T } from "@/lib/i18n";

const steps = [
  { n: "01", t: "Discover", d: "Identify a buyer need or a promising solution." },
  { n: "02", t: "Validate", d: "Review the owner, rights, demo and evidence." },
  { n: "03", t: "Accelerate", d: "Prepare the offer, support plan and pilot." },
  { n: "04", t: "Connect", d: "Match buyers with products and delivery teams." },
  { n: "05", t: "Commercialize", d: "Agree scope and terms; deliver and measure results." },
  { n: "06", t: "Globalize", d: "Localize and expand where the offer is ready." },
];
const buys = [
  { t: "Software & integration", d: "Product development, APIs, modernization and quality testing." },
  { t: "AI, data & intelligence", d: "Applied AI, supervised AI agents, analytics and BI." },
  { t: "Cloud & hosting", d: "Deployment, operations, backups and recovery." },
  { t: "Cybersecurity & privacy", d: "Security assessment, governance and operational support." },
  { t: "Growth & market access", d: "Positioning, campaigns, e-commerce and localization." },
  { t: "Expert teams & training", d: "Specialist delivery, implementation, training and support." },
];
const roles = [
  { t: "DGIX", d: "Discovery, product passport, review and listing." },
  { t: "SMBOS", d: "Sales, marketing and business intelligence; enquiries, quotes and renewals." },
  { t: "Product teams", d: "Implementation, delivery, training and support." },
  { t: "Finance", d: "Official invoices, receipts and settlement." },
];

export function WhatIs() {
  return (
    <Panel className="flex flex-col gap-14 px-6 pt-20 pb-16 md:gap-20 md:px-20 md:pt-[128px] md:pb-[112px]">
      <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[96px]">
        <div className="flex flex-col gap-6 lg:w-[480px] lg:shrink-0">
          <Eyebrow>How it works</Eyebrow>
          <H2><T>From idea to market.</T></H2>
        </div>
        <p className="flex-1 text-[17px] leading-7 md:text-lg md:leading-8 text-muted">
          DGIX, the Daffodil Global Innovation Exchange, follows <span className="font-medium text-ink">one buyer journey</span> to assess, match and commercialize eligible solutions. Discover solutions, explore a pilot, build a partnership.
        </p>
      </Reveal>
      <Stagger className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {steps.map((s) => (
          <motion.div key={s.n} variants={staggerItem} className="flex flex-1 flex-col gap-4 border-t-2 border-ink pt-6">
            <div className="font-mono text-[13px] leading-4 text-primary">{s.n}</div>
            <div className="text-[26px] leading-8 tracking-[-0.03em] text-ink">{s.t}</div>
            <div className="text-base leading-[26px] text-muted">{s.d}</div>
          </motion.div>
        ))}
      </Stagger>
      <Reveal className="flex flex-col gap-5">
        <div className="text-[22px] leading-7 md:text-[26px] md:leading-8 tracking-[-0.03em] text-ink">Who is responsible</div>
        <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <div key={r.t} className="flex flex-col gap-2 border-b border-r border-line p-6">
              <div className="font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">{r.t}</div>
              <div className="text-[15px] leading-6 text-muted">{r.d}</div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal className="flex flex-col gap-7 rounded-lg bg-mist p-6 md:p-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div className="text-[22px] leading-7 md:text-[26px] md:leading-8 tracking-[-0.03em] text-ink">More than software: the expertise to adopt it</div>
          <div className="text-[15px] leading-5 font-medium text-primary">Priority markets: the USA and GCC</div>
        </div>
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buys.map((b) => (
            <motion.div key={b.t} variants={staggerItem} className="flex flex-1 flex-col gap-[10px] rounded-lg bg-paper p-6">
              <div className="text-[18px] leading-6 font-semibold text-ink">{b.t}</div>
              <div className="text-[15px] leading-6 text-muted">{b.d}</div>
            </motion.div>
          ))}
        </Stagger>
        <p className="text-[13px] leading-5 text-muted">Services and experts are matched subject to verified capacity, qualifications and scope.</p>
      </Reveal>
    </Panel>
  );
}
