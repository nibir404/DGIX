"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { BG, GlowButton, HeroBg, Section } from "@/components/marketing/pages/bits";
import { Icon } from "@/components/ui/Icon";

const buyerItems = ["AI + advisor matching", "Live demos and comparison", "Negotiated offer with SLA, warranty, exit", "Pay per accepted milestone", "One DGIX contact after go-live"];
const sellerRows = [
  ["Listing & matching", "Free"],
  ["DGIX fee", "Set in your MOU"],
  ["Readiness diagnostic", "Optional · fixed fee"],
  ["Payout", "After Finance verifies"],
];

const flow: { label: string; icon: React.ReactNode; dark?: boolean }[] = [
  { label: "Buyer pays DGIX", icon: <Icon name="card" size={28} strokeWidth={1.75} /> },
  { label: "Finance verifies", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg> },
  { label: "DGIX fee kept", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg> },
  { label: "Partner paid", icon: <Icon name="check" size={28} strokeWidth={1.75} className="text-[#7FE0AE]" />, dark: true },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>You pay the quoted price.<br />Nothing on top.</>}
        aside={
          <div className="flex flex-col gap-1 md:items-end">
            <div className="text-[88px] leading-[84px] md:text-[120px] md:leading-[110px] font-light tracking-[-0.06em]">$0</div>
            <div className="text-[15px] leading-[18px] text-white/70">extra for buyers, ever</div>
          </div>
        }
      >
        <HeroBg image={BG.blue} />
      </PageHero>

      <Section className="grid gap-5 pt-16 md:pt-[96px] lg:grid-cols-2">
        <Reveal className="flex flex-col gap-7 rounded-lg border border-line p-6 md:p-10 shadow-[0_30px_60px_-40px_#0C1F4559]">
          <div className="flex items-center justify-between">
            <div className="text-[15px] leading-[18px] text-muted">For buyers</div>
            <div className="flex h-[30px] items-center rounded-lg bg-[#E6F4EC] px-3 text-[13px] font-semibold leading-4 text-success">Always included</div>
          </div>
          <h2 className="text-[34px] leading-[40px] md:text-[44px] md:leading-12 font-light tracking-tight text-ink">The product price.<br />That&apos;s it.</h2>
          <div className="flex flex-col gap-[14px] border-t border-mist pt-[22px]">
            {buyerItems.map((t) => (
              <div key={t} className="flex items-center gap-3 text-base leading-5 text-ink">
                <Icon name="check" size={22} strokeWidth={1.75} className="shrink-0 text-success" />
                {t}
              </div>
            ))}
          </div>
          <GlowButton href="/contact" className="!h-[52px] self-start !px-6 !text-[15px]">Describe my need</GlowButton>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-7 rounded-lg p-6 md:p-10 text-white" style={{ backgroundImage: BG.red }}>
          <div className="text-[15px] leading-[18px] text-white/70">For product companies</div>
          <h2 className="text-[34px] leading-[40px] md:text-[44px] md:leading-12 font-light tracking-tight">A fee only when<br />you&apos;re paid.</h2>
          <div className="flex flex-col gap-[14px] border-t border-white/14 pt-[22px]">
            {sellerRows.map(([a, b]) => (
              <div key={a} className="flex justify-between gap-4 text-base leading-5">
                <span className="text-white/75">{a}</span>
                <span className="text-right font-medium">{b}</span>
              </div>
            ))}
          </div>
          <div className="text-[13px] leading-5 text-white/60">A fee never buys a higher score or a listing.</div>
        </Reveal>
      </Section>

      <Section className="flex flex-col gap-8 pb-20 pt-16 md:pb-[112px] md:pt-[96px]">
        <Reveal>
          <h2 className="text-[32px] leading-[40px] md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Where the money goes.</h2>
        </Reveal>
        <Stagger className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {flow.map((f, i) => (
            <Fragment key={f.label}>
              <motion.div variants={staggerItem} className={"flex grow basis-0 flex-col gap-[14px] rounded-lg p-7 " + (f.dark ? "bg-night text-white" : "bg-mist text-ink")}>
                {f.icon}
                <div className="text-lg font-medium">{f.label}</div>
              </motion.div>
              {i < flow.length - 1 && <Icon name="arrowRight" size={28} strokeWidth={1.75} className="shrink-0 self-center rotate-90 text-[#9AA2B4] md:rotate-0" />}
            </Fragment>
          ))}
        </Stagger>
      </Section>
    </>
  );
}
