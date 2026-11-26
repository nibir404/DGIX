"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";
import { T } from "@/lib/i18n";

const tiles = [
  { c: "education", k: "Education", t: "EduVAS · AI Professor", d: "Education management and teaching. Also: Student360 and Alumni360." },
  { c: "hr", k: "Workforce", t: "Perfect HR · Skill.jobs", d: "Workforce management, recruitment and career connections." },
  { c: "erp", k: "Governance", t: "LeadershipOS · RegistrarOS", d: "Decision tracking, accountability and institutional workflows." },
  { c: "healthcare", k: "Healthcare", t: "Smart Hospital", d: "Appointments, patient records, billing, pharmacy and labs." },
  { c: "ai", k: "Applied AI", t: "Central AI", d: "Customer engagement, lead capture and business knowledge." },
  { c: "custom", k: "Industry", t: "Robotics & Automation", d: "Robotics and automation for practical operating needs." },
];
const ai = ["Applied AI", "Supervised AI agents", "Analytics", "BI"];
const services = ["Implementation", "Integration", "Cloud & hosting", "Cybersecurity", "Localization", "Training", "Support"];

export function Solutions() {
  return (
    <Panel className="flex flex-col gap-12 px-6 py-20 md:gap-[56px] md:px-20 md:py-[128px]">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5">
          <Eyebrow><T>The portfolio</T></Eyebrow>
          <H2 className="max-w-[720px]"><T>What Bangladesh builds.</T></H2>
        </div>
        <Link href="/solutions" className="inline-flex min-h-10 shrink-0 items-center self-start text-[15px] leading-[18px] font-semibold text-ink underline decoration-1 underline-offset-4 hover:text-primary">
          Ask about the right solution →
        </Link>
      </Reveal>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-xs leading-4 text-primary">A</span>
          <span className="text-[17px] leading-[22px] font-semibold text-ink">Selected Daffodil examples</span>
          <span className="text-[15px] leading-[22px] text-muted">DGIX also considers eligible products from other Bangladeshi innovators</span>
        </div>
        <Stagger gap={0.05} className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((x, i) => (
            <motion.div key={x.c} variants={staggerItem}>
              <Link
                href={`/solutions?category=${x.c}`}
                className="group flex h-full flex-col gap-[10px] border-b border-r border-line p-6 transition-colors duration-300 hover:bg-mist md:p-8"
              >
                <span className="font-mono text-xs uppercase leading-4 tracking-[0.08em] text-muted">{String(i + 1).padStart(2, "0")} / {x.k}</span>
                <span className="flex items-center justify-between text-[20px] leading-6 font-medium tracking-[-0.01em] text-ink">
                  {x.t}
                  <span className="translate-x-[-6px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-primary">→</span>
                </span>
                <span className="text-sm leading-[22px] text-muted">{x.d}</span>
              </Link>
            </motion.div>
          ))}
        </Stagger>
        <p className="text-[13px] leading-5 text-muted">Portfolio examples are not a list of approved DGIX offers. Confirm demo, pilot and market availability with the product team.</p>
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
            <div className="text-[26px] leading-[32px] md:text-[32px] md:leading-[38px] font-light tracking-[-0.03em] text-paper">AI, data and intelligence for real operating needs.</div>
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
            <div className="text-[26px] leading-[32px] md:text-[32px] md:leading-[38px] font-light tracking-[-0.03em] text-ink">Expert teams to deploy, secure and support it.</div>
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
