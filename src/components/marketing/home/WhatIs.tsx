"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";

const steps = [
  { n: "01 · Find", t: "We match the need", d: "Describe what you need in plain words. AI ranks the options, and an advisor confirms a shortlist within one business day." },
  { n: "02 · Verify", t: "We check every claim", d: "Each product passes a 100-point review for security, legal ownership, support and readiness in your country." },
  { n: "03 · Deliver", t: "We stand behind it", d: "You sign with DGIX and pay per accepted milestone. If something slips, we're the ones who fix it." },
];
const buys = [
  { t: "Software solutions", d: "ERP, finance, HR and payroll, CRM, retail and POS, healthcare, education, and custom software." },
  { t: "AI and advanced technology", d: "AI automation, agentic workflows, sovereign AI and intelligent AI solutions." },
  { t: "Professional IT services", d: "Resource augmentation, custom engineering teams, implementation, integration, data migration, training and managed support." },
];

export function WhatIs() {
  return (
    <Panel className="flex flex-col gap-14 px-6 pt-20 pb-16 md:gap-20 md:px-20 md:pt-[128px] md:pb-[112px]">
      <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[96px]">
        <div className="flex flex-col gap-6 lg:w-[480px] lg:shrink-0">
          <Eyebrow>What DGIX is</Eyebrow>
          <H2>A smarter way to find technology.</H2>
        </div>
        <p className="flex-1 text-[17px] leading-7 md:text-lg md:leading-8 text-muted">
          DGIX, the Daffodil Global Innovation Exchange, connects businesses abroad with software that Bangladesh&apos;s best product companies have already built and run. We find the right product, check it, write <span className="font-medium text-ink">one contract</span> and stay with you until it&apos;s live.
        </p>
      </Reveal>
      <Stagger className="flex flex-col gap-10 md:flex-row md:gap-8">
        {steps.map((s) => (
          <motion.div key={s.n} variants={staggerItem} className="flex flex-1 flex-col gap-4 border-t-2 border-ink pt-6">
            <div className="font-mono text-[13px] leading-4 text-primary">{s.n}</div>
            <div className="text-[26px] leading-8 tracking-[-0.03em] text-ink">{s.t}</div>
            <div className="text-base leading-[26px] text-muted">{s.d}</div>
          </motion.div>
        ))}
      </Stagger>
      <Reveal className="flex flex-col gap-7 rounded-lg bg-mist p-6 md:p-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div className="text-[22px] leading-7 md:text-[26px] md:leading-8 tracking-[-0.03em] text-ink">Three things you can buy through DGIX</div>
          <div className="text-[15px] leading-5 font-medium text-primary">Serving the USA and GCC first</div>
        </div>
        <Stagger className="flex flex-col gap-4 md:flex-row">
          {buys.map((b) => (
            <motion.div key={b.t} variants={staggerItem} className="flex flex-1 flex-col gap-[10px] rounded-lg bg-paper p-6">
              <div className="text-[18px] leading-6 font-semibold text-ink">{b.t}</div>
              <div className="text-[15px] leading-6 text-muted">{b.d}</div>
            </motion.div>
          ))}
        </Stagger>
      </Reveal>
    </Panel>
  );
}
