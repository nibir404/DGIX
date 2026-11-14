"use client";

import { motion } from "framer-motion";
import { PageHero } from "@/components/marketing/PageHero";
import { GhostButton, GlowButton, HeroBg } from "@/components/marketing/pages/bits";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-white pb-2 md:pb-4">
      <PageHero className="flex grow flex-col">
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), linear-gradient(#08152F,#08152F)" />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-120px] right-[-200px] h-[460px] w-[900px] max-w-none bg-cover bg-center opacity-55 [mask-image:radial-gradient(closest-side,#000_45%,transparent_100%)]"
          style={{ backgroundImage: "url(/media/about-hero.webp)" }}
        />
        <div className="relative z-10 flex grow flex-col justify-center gap-6 px-6 pb-20 pt-10 md:px-10 md:pb-[120px]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="text-[120px] leading-[110px] md:text-[200px] md:leading-[180px] font-extralight tracking-[-0.06em] text-white/14">
            404
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-[40px] leading-[44px] md:text-[64px] md:leading-[68px] font-light tracking-[-0.045em] text-white">
            This page didn&apos;t pass the gate.
          </motion.h1>
          <p className="text-[18px] leading-[26px] md:leading-[22px] font-light text-white/75">It may have moved, or the link is out of date. Let&apos;s get you somewhere verified.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <GlowButton href="/">Back to home</GlowButton>
            <GhostButton href="/solutions">Browse solutions</GhostButton>
          </div>
        </div>
      </PageHero>
    </div>
  );
}
