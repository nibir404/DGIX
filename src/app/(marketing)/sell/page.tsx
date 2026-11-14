"use client";

import { motion } from "framer-motion";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { GhostButton, GlowButton, Section } from "@/components/marketing/pages/bits";
import { Icon, type IconName } from "@/components/ui/Icon";

const heroBg =
  "radial-gradient(ellipse 60% 90% at 100% 10%, #E52A2A73 0%, #E52A2A00 60%), radial-gradient(ellipse 60% 90% at 0% 100%, #2C8C9E 0%, #2C8C9E00 70%), linear-gradient(135deg, #08152F 0%, #133A5E 100%)";

const features: { icon: IconName; title: string; body: string; tone: "night" | "mist" | "line" }[] = [
  { icon: "star", title: "Qualified demand", body: "AI-matched buyers with budget and a date.", tone: "night" },
  { icon: "file", title: "Contracts handled", body: "DGIX signs with the buyer and owns the deal.", tone: "mist" },
  { icon: "card", title: "Paid, not chased", body: "We collect. You're paid once Finance verifies.", tone: "mist" },
  { icon: "lock", title: "Your IP stays yours", body: "You only grant the sales rights you choose.", tone: "line" },
];

const models = [
  ["Direct brand", "Your name, sold through DGIX"],
  ["Co-branded", "Your name + Verified by Daffodil"],
  ["White-label", "Packaged in DGIX bundles"],
  ["Reseller", "Packaged SaaS, DGIX margin"],
  ["OEM · country licence", "Embedded or licensed per market"],
];

const steps = ["Apply and pass due diligence", "Sign the MOU and rights", "Submit your Product Passport", "Claims checked, live demo run", "Scored and listed per country"];

export default function SellPage() {
  return (
    <>
      <PageHero className="!bg-none" >
        <div className="absolute inset-0 -z-0" style={{ backgroundImage: heroBg }} />
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 pb-12 pt-6 md:px-10 md:pt-10 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] leading-[18px] text-white/70">For product companies</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-[44px] leading-[46px] md:text-[88px] md:leading-[88px] font-light tracking-[-0.05em] text-white">
              Built in Bangladesh.<br />Sold worldwide.
            </motion.h1>
            <p className="max-w-[540px] text-[17px] leading-[26px] md:text-[19px] md:leading-[29px] font-light text-white/78">
              Pass the gate once. We bring qualified buyers in the USA and GCC, handle contracts and collections. You keep your IP.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <GlowButton href="/contact?role=seller">Apply to sell</GlowButton>
              <GhostButton href="/contact?role=seller&topic=readiness">Get a readiness report</GhostButton>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="aspect-[4/3] w-full max-w-[500px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/sell-hero.webp" alt="" className="size-full object-cover [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]" />
          </motion.div>
        </div>
      </PageHero>

      <Section className="flex flex-col gap-10 pt-20 md:pt-[112px]">
        <Reveal>
          <h2 className="text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-ink">
            Everything a global sales<br className="hidden md:block" /> team would do, done for you.
          </h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              className={
                "flex h-[220px] md:h-[260px] flex-col justify-between rounded-lg p-7 " +
                (f.tone === "night" ? "bg-night text-white" : f.tone === "mist" ? "bg-mist text-ink" : "border border-line text-ink")
              }
              style={f.tone === "night" ? { backgroundImage: "radial-gradient(ellipse 80% 100% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%)" } : undefined}
            >
              <Icon name={f.icon} size={28} strokeWidth={1.75} />
              <div className="flex flex-col gap-2">
                <div className="text-[22px] leading-[28px] font-medium">{f.title}</div>
                <div className={"text-sm leading-[22px] " + (f.tone === "night" ? "text-white/70" : "text-muted")}>{f.body}</div>
              </div>
            </motion.div>
          ))}
        </Stagger>
      </Section>

      <Section className="grid grid-cols-1 gap-5 py-20 md:py-[112px] lg:grid-cols-2">
        <Reveal className="flex flex-col gap-6 rounded-lg border border-line p-6 md:p-10">
          <h3 className="text-[32px] leading-[40px] md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Choose how you&apos;re sold.</h3>
          <div className="flex flex-col border-t border-ink">
            {models.map(([a, b], i) => (
              <div key={a} className={"flex flex-col gap-1 py-[18px] sm:flex-row sm:items-center sm:justify-between " + (i < models.length - 1 ? "border-b border-mist" : "")}>
                <div className="text-[18px] leading-[22px] text-ink">{a}</div>
                <div className="text-sm leading-[18px] text-muted">{b}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal
          delay={0.1}
          className="flex flex-col justify-between gap-7 rounded-lg bg-mist p-6 md:p-10"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 90% at 100% 0%, #C9DCFF 0%, #C9DCFF00 60%)" }}
        >
          <h3 className="text-[32px] leading-[40px] md:text-[40px] md:leading-12 font-light tracking-tight text-ink">From application to listed.</h3>
          <div className="flex flex-col gap-[14px]">
            {steps.map((s, i) => {
              const last = i === steps.length - 1;
              return (
                <div key={s} className="flex items-center gap-[14px]">
                  <div className={"w-9 shrink-0 font-mono text-[13px] leading-4 " + (last ? "text-success" : "text-muted")}>0{i + 1}</div>
                  <div className={"text-[18px] leading-[22px] " + (last ? "font-medium text-success" : "text-ink")}>{s}</div>
                </div>
              );
            })}
          </div>
          <div className="text-sm leading-[22px] text-muted">Didn&apos;t pass? You get every gap in writing and can reapply.</div>
        </Reveal>
      </Section>
    </>
  );
}
