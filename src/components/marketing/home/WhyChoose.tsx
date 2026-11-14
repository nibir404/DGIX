"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";

const items = [
  { v: "38%", t: "Only proven products", d: "Fewer than four in ten applicants pass our gate. You never see the rest." },
  { v: "1 day", t: "Shortlist, not search", d: "Skip months of vendor hunting. Get verified matches with fit scores and gaps in one business day." },
  { v: "1", t: "One contract, one invoice", d: "Price, SLA, warranty and exit terms in a single agreement with DGIX, whoever built the product." },
  { v: "0%", t: "No upfront risk", d: "Pay per milestone, only after you accept the work. Your money is held until Finance verifies delivery." },
  { v: "$0", t: "No extra cost", d: "You pay the quoted price. Our fee comes from the partner, never from your invoice." },
  { v: "35 yrs", t: "A name you can call", d: "Backed by Daffodil Group since 1990, with one named advisor from first call to go-live." },
];

export function WhyChoose() {
  return (
    <Panel className="flex flex-col gap-12 px-6 py-20 md:gap-[72px] md:px-20 md:py-[128px]">
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-[96px]">
        <div className="flex flex-col gap-6 lg:w-[560px] lg:shrink-0">
          <Eyebrow>Why people choose DGIX</Eyebrow>
          <H2>Less risk, less work, one partner.</H2>
        </div>
        <p className="text-[17px] leading-7 text-muted lg:w-[400px] lg:shrink-0">
          No consultant fees. No guesswork. Here&apos;s what buyers in the USA and GCC count on.
        </p>
      </Reveal>
      <Stagger className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 md:gap-y-[72px] lg:grid-cols-3">
        {items.map((x) => (
          <motion.div key={x.t} variants={staggerItem} className="flex flex-col gap-3 border-t border-line pt-6">
            <div className="text-[44px] leading-[52px] md:text-[56px] md:leading-[64px] font-light tracking-tight text-primary">{x.v}</div>
            <div className="text-[20px] leading-7 font-medium text-ink">{x.t}</div>
            <div className="text-base leading-[26px] text-muted">{x.d}</div>
          </motion.div>
        ))}
      </Stagger>
    </Panel>
  );
}
