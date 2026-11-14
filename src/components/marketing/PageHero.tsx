"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { SiteNav } from "./SiteNav";

/**
 * Dark rounded hero panel used at the top of every marketing page.
 * Contains the site nav. Pass `eyebrow`, `title` and optional `aside` / `children`.
 */
export function PageHero({
  eyebrow,
  title,
  aside,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("relative mx-2 mt-2 md:mx-4 md:mt-4 overflow-hidden rounded-xl bg-night-hero text-white", className)}>
      <SiteNav />
      {(eyebrow || title || aside) && (
        <div className="relative z-10 flex flex-col gap-8 px-6 pb-12 pt-10 md:flex-row md:items-end md:justify-between md:px-10 md:pb-10 md:pt-16">
          <div className="flex flex-col gap-6">
            {eyebrow && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-[15px] leading-[18px] text-white/72">
                {eyebrow}
              </motion.div>
            )}
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="max-w-[900px] text-[44px] leading-[46px] md:text-[88px] md:leading-[88px] font-light tracking-[-0.05em]"
              >
                {title}
              </motion.h1>
            )}
          </div>
          {aside && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="shrink-0">
              {aside}
            </motion.div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function SectionHead({ eyebrow, title, aside, className }: { eyebrow: string; title: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-5">
        <div className="text-[15px] leading-[18px] text-muted">{eyebrow}</div>
        <h2 className="max-w-[720px] text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-ink">{title}</h2>
      </div>
      {aside}
    </div>
  );
}
