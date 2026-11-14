"use client";

import { motion } from "framer-motion";

/** Hero content block placed inside PageHero (title + lead + optional aside). */
export function HeroBlock({ eyebrow, title, lead, aside, leadWidth = 520 }: { eyebrow: string; title: React.ReactNode; lead?: string; aside?: React.ReactNode; leadWidth?: number }) {
  return (
    <div className="relative z-10 flex flex-col gap-10 px-6 pb-12 pt-10 md:px-10 md:pb-14 md:pt-24 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <div className="flex flex-col gap-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-[15px] leading-[18px] text-white/70">
          {eyebrow}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="text-[32px] leading-[36px] sm:text-[44px] sm:leading-[46px] md:text-[64px] md:leading-[66px] lg:text-[88px] lg:leading-[88px] font-light tracking-[-0.05em] text-paper"
        >
          {title}
        </motion.h1>
        {lead && <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{ maxWidth: leadWidth }}
          className="text-[17px] leading-[27px] md:text-[19px] md:leading-[29px] font-light text-white/75"
        >
          {lead}
        </motion.p>}
      </div>
      {aside && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="shrink-0 self-start lg:self-auto">
          {aside}
        </motion.div>
      )}
    </div>
  );
}
