"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";

const rows = [
  ["Dozens of vendors who all claim to be the best", "Every option already passed a 100-point check"],
  ["Pay a consultant to compare them", "AI and an expert advisor match you, free"],
  ["Negotiate price and terms yourself", "One offer: price, SLA, warranty, exit terms"],
  ["Pay upfront and hope it ships", "Pay per milestone, only for accepted work"],
  ["Chase support across time zones", "One named DGIX contact, start to finish"],
];

export function WhyNotDirect() {
  return (
    <Panel className="flex flex-col gap-12 px-6 py-20 md:px-20 md:py-[128px] lg:flex-row lg:gap-[96px]">
      <Reveal className="flex flex-col gap-6 lg:w-[480px] lg:shrink-0">
        <Eyebrow>The difference</Eyebrow>
        <H2>Why not go direct?</H2>
        <p className="text-[17px] leading-7 text-muted">No extra cost to you.</p>
      </Reveal>
      <div className="flex flex-1 flex-col">
        <div className="flex border-b-2 border-ink pb-4 text-[15px] leading-[18px]">
          <div className="flex-1 text-muted">Going it alone</div>
          <div className="flex-1 text-primary">With DGIX</div>
        </div>
        <Stagger>
          {rows.map(([a, b], i) => (
            <motion.div key={a} variants={staggerItem} className={`flex py-[22px] text-[15px] leading-[22px] md:text-[17px] md:leading-[26px] ${i < rows.length - 1 ? "border-b border-line" : ""}`}>
              <div className="flex-1 pr-4 md:pr-8 text-subtle">{a}</div>
              <div className="flex-1 font-medium text-ink">{b}</div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </Panel>
  );
}
