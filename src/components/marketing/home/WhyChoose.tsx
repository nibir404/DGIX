"use client";

import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";

const items = [
  { v: "01", t: "Buyers", d: "Share your need and ask about a demo or pilot." },
  { v: "02", t: "Innovators", d: "Bring a solution and evidence for review." },
  { v: "03", t: "Delivery partners", d: "Explore reseller, integration and support roles." },
  { v: "04", t: "Experts & diaspora", d: "Offer domain expertise, mentorship or market insight." },
  { v: "05", t: "Universities", d: "Explore applied research, student projects and training." },
  { v: "06", t: "Investors", d: "Discuss commercialization and pilot opportunities." },
];

export function WhyChoose() {
  return (
    <Panel className="flex flex-col gap-12 px-6 py-20 md:gap-[72px] md:px-20 md:py-[128px]">
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-[96px]">
        <div className="flex flex-col gap-6 lg:w-[560px] lg:shrink-0">
          <Eyebrow>Work with DGIX</Eyebrow>
          <H2>Take the next step.</H2>
        </div>
        <p className="text-[17px] leading-7 text-muted lg:w-[400px] lg:shrink-0">
          Tell us what you want to solve, build or bring to a new market. Contact Daffodil Group at <a href="https://daffodil.group/contact" className="font-medium text-primary underline underline-offset-4">daffodil.group/contact</a> with “DGIX” in the subject.
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
