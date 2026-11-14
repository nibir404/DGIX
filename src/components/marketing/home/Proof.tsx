"use client";

import { Reveal } from "@/components/marketing/Reveal";
import { Panel, CountUp } from "./shared";

const stats = [
  { v: "1990", d: "Shaping Bangladesh's technology for 36 years" },
  { v: "50+", d: "Concerns across ICT, education, healthcare" },
  { v: "6,000+", d: "People on the Daffodil team" },
  { v: "10+", d: "Countries incl. UK, USA, UAE, Malaysia" },
  { v: "24+", d: "Institutions incl. Daffodil International University" },
];

export function Proof() {
  return (
    <Panel
      className="flex flex-col gap-12 rounded-lg bg-night px-6 py-16 md:gap-16 md:px-20 md:py-[120px]"
      style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 100% 100% in oklab, #E52A2A59 0%, #E52A2A00 60%), radial-gradient(ellipse 70% 80% at 0% 0% in oklab, #1E4FA3 0%, #1E4FA300 65%)" }}
    >
      <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-5">
          <div className="text-[15px] leading-[18px] text-haze">Who stands behind it</div>
          <h2 className="max-w-[700px] text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-paper">
            One of Bangladesh&apos;s IT pioneers. Now your partner abroad.
          </h2>
        </div>
        <div
          aria-hidden
          className="aspect-[520/266] w-full max-w-[520px] shrink-0 bg-cover bg-center [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]"
          style={{ backgroundImage: "url(/media/proof-campus.webp)" }}
        />
      </Reveal>
      <div className="grid grid-cols-2 border-t border-[#22355E] md:grid-cols-3 lg:flex">
        {stats.map((s, i) => (
          <div
            key={s.v}
            className={`flex flex-1 flex-col gap-2 pt-7 pb-4 md:pt-9 lg:pb-0 ${i === 0 ? "pr-6" : i === stats.length - 1 ? "lg:pl-6 lg:border-l lg:border-[#22355E]" : "lg:px-6 lg:border-l lg:border-[#22355E]"} pr-4`}
          >
            <CountUp value={s.v} className="whitespace-pre text-[34px] leading-[42px] sm:text-[40px] sm:leading-[48px] md:text-[54px] md:leading-[60px] font-light tracking-tight text-paper tabular-nums" />
            <div className="text-sm leading-[21px] text-haze">{s.d}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
