"use client";

import { Reveal } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";
import { Scorecard } from "./Scorecard";

export function TierPills() {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <div className="flex h-[30px] items-center gap-[6px] rounded-lg bg-[#E6F4EC] px-3">
        <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#14804A" /><path d="M4 7.2l2 2 4-4.2" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <span className="text-[13px] leading-4 font-semibold text-success">Verified</span>
      </div>
      <div className="flex h-[30px] items-center gap-[6px] rounded-lg bg-paper px-3">
        <span className="text-[13px] leading-4 font-semibold text-primary">Certified</span>
      </div>
      <div className="flex h-[30px] items-center gap-[6px] rounded-lg border border-line bg-paper px-3">
        <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="none" stroke="#5B6478" strokeWidth="1.4" /></svg>
        <span className="text-[13px] leading-4 font-semibold text-muted">Declared</span>
      </div>
    </div>
  );
}

export function VerifiedSection() {
  return (
    <Panel
      className="flex flex-col gap-12 rounded-lg bg-mist px-4 py-16 md:px-20 md:py-[120px] lg:flex-row lg:gap-[96px]"
      style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 100% 0% in oklab, #C9DCFF 0%, #C9DCFF00 60%), radial-gradient(ellipse 40% 60% at 0% 100% in oklab, #F6A11A2E 0%, #F6A11A00 70%)" }}
    >
      <Reveal className="flex flex-col gap-6 px-2 md:px-0 lg:w-[480px] lg:shrink-0">
        <Eyebrow>Daffodil Verified</Eyebrow>
        <H2>Most products won&apos;t make the cut. That&apos;s the point.</H2>
        <p className="text-[17px] leading-7 text-muted">Only a full 100 gets listed.</p>
        <TierPills />
      </Reveal>
      <Reveal delay={0.1} className="flex-1">
        <Scorecard />
      </Reveal>
    </Panel>
  );
}
