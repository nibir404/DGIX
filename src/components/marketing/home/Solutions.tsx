"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";

const tiles = [
  { c: "erp", t: "ERP & operations", d: "Operations, inventory, procurement" },
  { c: "hr", t: "HR & payroll", d: "GOSI, WPS, multi-country payroll" },
  { c: "crm", t: "CRM & field sales", d: "Pipeline, field force, service" },
  { c: "retail", t: "Retail & POS", d: "Stores, stock, e-commerce" },
  { c: "healthcare", t: "Healthcare", d: "Clinic billing, EMR, pharmacy" },
  { c: "education", t: "Education", d: "Campus ERP, e-learning" },
  { c: "finance", t: "Finance & accounting", d: "Ledger, VAT, reporting" },
  { c: "custom", t: "Custom software", d: "Built to your spec by verified teams" },
];
const ai = ["AI automation", "Agentic workflows", "Sovereign AI", "Intelligent AI solutions"];
const services = ["Resource augmentation", "Custom engineering teams", "Implementation", "Integration", "Data migration", "Training", "Managed support"];

export function Solutions() {
  return (
    <Panel className="flex flex-col gap-12 px-6 py-20 md:gap-[56px] md:px-20 md:py-[128px]">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5">
          <Eyebrow>Solutions</Eyebrow>
          <H2 className="max-w-[720px]">Software, AI and the people to run it. Already checked.</H2>
        </div>
        <Link href="/solutions" className="shrink-0 text-[15px] leading-[18px] font-semibold text-ink underline decoration-1 underline-offset-4 hover:text-primary">
          See all solutions →
        </Link>
      </Reveal>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-xs leading-4 text-primary">A</span>
          <span className="text-[17px] leading-[22px] font-semibold text-ink">Software solutions</span>
          <span className="text-[15px] leading-[22px] text-muted">Proven products, ready to deploy</span>
        </div>
        <Stagger gap={0.05} className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((x, i) => (
            <motion.div key={x.c} variants={staggerItem}>
              <Link
                href={`/solutions?category=${x.c}`}
                className="group flex h-full flex-col gap-[10px] border-b border-r border-line p-6 transition-colors duration-300 hover:bg-mist md:p-8"
              >
                <span className="font-mono text-xs leading-4 text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex items-center justify-between text-[20px] leading-6 font-medium tracking-[-0.01em] text-ink">
                  {x.t}
                  <span className="translate-x-[-6px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-primary">→</span>
                </span>
                <span className="text-sm leading-[22px] text-muted">{x.d}</span>
              </Link>
            </motion.div>
          ))}
        </Stagger>
      </div>
      <Stagger className="flex flex-col gap-4 lg:flex-row">
        <motion.div variants={staggerItem} className="flex-1">
          <Link
            href="/solutions?category=ai"
            className="flex h-full flex-col gap-5 rounded-lg bg-night p-6 md:p-10"
            style={{ backgroundImage: "radial-gradient(ellipse 80% 90% at 100% 0% in oklab, #2F6BD8 0%, #2F6BD800 70%)" }}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs leading-4 text-sky">B</span>
              <span className="text-[17px] leading-[22px] font-semibold text-paper">AI &amp; advanced technology</span>
            </div>
            <div className="text-[26px] leading-[32px] md:text-[32px] md:leading-[38px] font-light tracking-[-0.03em] text-paper">AI that&apos;s been tested on real work, not demos.</div>
            <div className="flex flex-wrap gap-2 pt-2">
              {ai.map((t) => (
                <span key={t} className="rounded-lg border border-[#FFFFFF38] px-4 py-[9px] text-sm leading-[18px] text-paper">{t}</span>
              ))}
            </div>
          </Link>
        </motion.div>
        <motion.div variants={staggerItem} className="flex-1">
          <Link href="/solutions?category=services" className="flex h-full flex-col gap-5 rounded-lg bg-mist p-6 md:p-10">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs leading-4 text-primary">C</span>
              <span className="text-[17px] leading-[22px] font-semibold text-ink">Professional IT services</span>
            </div>
            <div className="text-[26px] leading-[32px] md:text-[32px] md:leading-[38px] font-light tracking-[-0.03em] text-ink">Vetted engineers to build, move and run it.</div>
            <div className="flex flex-wrap gap-2 pt-2">
              {services.map((t) => (
                <span key={t} className="rounded-lg bg-paper px-4 py-[9px] text-sm leading-[18px] text-ink">{t}</span>
              ))}
            </div>
          </Link>
        </motion.div>
      </Stagger>
    </Panel>
  );
}
