"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { HeroBg, Section } from "@/components/marketing/pages/bits";
import { ContactForm } from "@/components/marketing/pages/ContactForm";
import { Icon, type IconName } from "@/components/ui/Icon";

const promises: { icon: IconName; text: string }[] = [
  { icon: "clock", text: "Reply within one business day" },
  { icon: "user", text: "One named advisor, start to finish" },
  { icon: "globe", text: "Dhaka HQ · support for USA and GCC" },
];

const offices = [
  { label: "Headquarters", title: "Dhaka, Bangladesh", body: "102/1 Shukrabad, Mirpur Road, Dhanmondi, Dhaka-1207", mist: true },
  { label: "GCC support", title: "[City, country]", body: "Regional office to be confirmed" },
  { label: "Partners", title: "partners@dgix", body: "Apply, or ask about a readiness report" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero>
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), radial-gradient(ellipse 40% 70% at 0% 100%, #F6A11A47 0%, #F6A11A00 65%), linear-gradient(#08152F,#08152F)" />
        <div className="relative z-10 flex flex-col items-start gap-10 px-4 pb-6 pt-6 md:px-10 md:pb-12 md:pt-14 lg:flex-row lg:gap-14">
          <div className="flex grow basis-0 flex-col gap-8 px-2 md:px-0 lg:pt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] leading-[18px] text-white/70">Contact</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-[44px] leading-[46px] md:text-[80px] md:leading-[82px] font-light tracking-[-0.05em] text-white">
              Talk to a person,<br />not a form bot.
            </motion.h1>
            <div className="flex flex-col gap-[18px] pt-3">
              {promises.map((p, i) => (
                <motion.div key={p.text} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-center gap-[14px]">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"><Icon name={p.icon} size={20} strokeWidth={1.75} /></span>
                  <span className="text-[17px] leading-[22px] text-white">{p.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="w-full lg:w-auto">
            <Suspense fallback={<div className="h-[560px] rounded-lg bg-white lg:w-[560px]" />}>
              <ContactForm />
            </Suspense>
          </motion.div>
        </div>
      </PageHero>

      <Section className="grid gap-4 pb-20 pt-16 md:pb-[112px] md:pt-[96px] lg:grid-cols-[1.2fr_1fr_1fr]">
        {offices.map((o, i) => (
          <Reveal key={o.label} delay={i * 0.08} className={"flex flex-col justify-between gap-6 rounded-lg p-8 " + (o.mist ? "bg-mist" : "border border-line")}>
            <div className="text-sm leading-[18px] text-muted">{o.label}</div>
            <div className="flex flex-col gap-2">
              <div className="text-[28px] leading-[34px] font-light tracking-[-0.03em] text-ink">{o.title}</div>
              <div className="text-[15px] leading-6 text-muted">{o.body}</div>
            </div>
          </Reveal>
        ))}
      </Section>
    </>
  );
}
