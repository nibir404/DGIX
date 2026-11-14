"use client";

import { motion } from "framer-motion";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { HeroBg, Section } from "@/components/marketing/pages/bits";
import { CountUp } from "@/components/marketing/pages/CountUp";

const stats = [
  { to: 1990, from: 1950, separator: false, suffix: "", label: "Shaping Bangladesh's technology for 36 years" },
  { to: 50, suffix: "+", label: "Concerns across ICT, education, healthcare" },
  { to: 6000, suffix: "+", label: "People on the Daffodil team" },
  { to: 10, suffix: "+", label: "Countries incl. UK, USA, UAE, Malaysia" },
  { to: 24, suffix: "+", label: "Institutions incl. Daffodil International University" },
];

const rules = ["Nobody approves their own work.", "Every claim carries a label.", "Deals and money go through the system.", "A fee never buys a score."];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About DGIX"
        title={<>Bangladesh&apos;s products,<br className="hidden md:block" /> with Daffodil&apos;s name<br className="hidden md:block" /> behind every sale.</>}
        className="[&>div:nth-child(2)]:md:pt-[120px] [&>div:nth-child(2)]:md:pb-16"
      >
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), radial-gradient(ellipse 40% 70% at 85% 100%, #F6A11A4D 0%, #F6A11A00 65%), linear-gradient(#08152F,#08152F)" />
        <motion.div
          aria-hidden
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="pointer-events-none absolute right-[-160px] top-[110px] hidden h-[440px] w-[860px] bg-cover bg-center [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)] md:block"
          style={{ backgroundImage: "url(/media/about-hero.webp)" }}
        />
      </PageHero>

      <Section className="flex flex-col gap-10 pb-16 pt-16 md:pb-[96px] md:pt-[120px] lg:flex-row lg:gap-[96px]">
        <Reveal className="lg:w-[520px] lg:shrink-0">
          <h2 className="text-[34px] leading-[40px] md:text-[44px] md:leading-[50px] font-light tracking-tight text-ink">Great products. No trusted route to the world. Until now.</h2>
        </Reveal>
        <Reveal delay={0.1} className="flex grow basis-0 flex-col gap-7">
          <Row label="The gap" border>
            Bangladeshi teams build world-class products but can&apos;t fund overseas sales. Global buyers can&apos;t judge an unknown vendor abroad.
          </Row>
          <Row label="The fix" border>
            DGIX verifies, matches and delivers, standing between both sides as one accountable party.
          </Row>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
            <div className="w-[120px] shrink-0 text-sm leading-[18px] text-muted">First markets</div>
            <div className="flex flex-wrap gap-2">
              {["USA", "UAE", "Saudi Arabia", "Qatar"].map((m) => (
                <span key={m} className="rounded-lg bg-mist px-4 py-2 text-sm font-medium leading-[18px] text-ink">{m}</span>
              ))}
              <span className="rounded-lg border border-dashed border-[#9AA2B4] px-4 py-2 text-sm leading-[18px] text-muted">Malaysia · next</span>
            </div>
          </div>
        </Reveal>
      </Section>

      <section
        className="mx-2 flex flex-col gap-12 rounded-lg bg-night px-6 py-16 md:mx-4 md:gap-16 md:px-20 md:py-[120px]"
        style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 100% 100%, #E52A2A59 0%, #E52A2A00 60%), radial-gradient(ellipse 70% 80% at 0% 0%, #1E4FA3 0%, #1E4FA300 65%)" }}
      >
        <Reveal className="flex flex-col gap-5">
          <div className="text-[15px] leading-[18px] text-haze">Who stands behind it</div>
          <h2 className="max-w-[700px] text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-white">One of Bangladesh&apos;s IT pioneers. Now your partner abroad.</h2>
        </Reveal>
        <div className="grid grid-cols-1 border-t border-[#22355E] sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s, i) => (
            <div key={s.label} className={"flex flex-col gap-2 pt-9 pb-2 lg:px-6 " + (i === 0 ? "lg:pl-0" : "lg:border-l lg:border-[#22355E]") + (i === 4 ? " lg:pr-0" : "")}>
              <CountUp to={s.to} from={s.from} suffix={s.suffix} separator={s.separator ?? true} className="text-[54px] leading-[60px] font-light tracking-tight whitespace-pre text-white tabular-nums" />
              <div className="text-sm leading-[21px] text-haze">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Section className="flex flex-col gap-10 py-20 md:py-[112px]">
        <Reveal>
          <h2 className="text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-ink">Rules we don&apos;t bend.</h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rules.map((r, i) => {
            const dark = i === 3;
            return (
              <motion.div key={r} variants={staggerItem} className={"flex flex-col gap-4 rounded-lg p-7 " + (dark ? "bg-night" : "bg-mist")}>
                <div className={"text-[48px] leading-12 font-light tracking-[-0.05em] " + (dark ? "text-glow-amber" : "text-[#9AB3DA]")}>0{i + 1}</div>
                <div className={"text-[19px] leading-[26px] font-medium " + (dark ? "text-white" : "text-ink")}>{r}</div>
              </motion.div>
            );
          })}
        </Stagger>
      </Section>
    </>
  );
}

function Row({ label, children, border }: { label: string; children: React.ReactNode; border?: boolean }) {
  return (
    <div className={"flex flex-col gap-2 pb-6 sm:flex-row sm:gap-5 " + (border ? "border-b border-mist" : "")}>
      <div className="w-[120px] shrink-0 text-sm leading-[18px] text-muted">{label}</div>
      <div className="text-[17px] leading-[27px] text-ink">{children}</div>
    </div>
  );
}
