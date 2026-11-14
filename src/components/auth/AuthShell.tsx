"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/** Split layout from the "Auth · Sign in" artboards: dark brand panel left, form right. */
export function AuthShell({ headline, children }: { headline: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col gap-4 bg-white p-2 md:p-4 lg:flex-row lg:gap-0">
      <div
        className="relative flex min-h-[260px] shrink-0 flex-col justify-between gap-10 overflow-hidden rounded-lg bg-night p-6 md:p-10 lg:min-h-0 lg:w-[44%] lg:max-w-[640px]"
        style={{ backgroundImage: "radial-gradient(ellipse 60% 70% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%)" }}
      >
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4 }}
          className="pointer-events-none absolute left-[-120px] top-[220px] hidden h-[450px] w-[880px] bg-cover bg-center [mask-image:radial-gradient(closest-side,#000_50%,transparent_100%)] lg:block"
          style={{ backgroundImage: "url(/media/about-hero.webp)" }}
        />
        <Link href="/" aria-label="DGIX home" className="relative z-10 self-start">
          <Image src="/brand/dgix-logo-white.png" alt="DGIX" width={182} height={48} priority className="h-10 w-auto md:h-12" />
        </Link>
        <div className="relative z-10 flex flex-col gap-5">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-[540px] text-[34px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-[-0.045em] text-white">
            {headline}
          </motion.h1>
          <div className="flex flex-wrap gap-[10px]">
            <span className="flex h-8 items-center gap-1.5 rounded-lg bg-white/10 pl-2 pr-3 text-[13px] leading-4 text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FE0AE" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
              Verified products
            </span>
            <span className="flex h-8 items-center gap-1.5 rounded-lg bg-white/10 pl-2 pr-3 text-[13px] leading-4 text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FB6FF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
              Encrypted &amp; audited
            </span>
          </div>
        </div>
      </div>
      <div className="flex grow basis-0 flex-col items-center justify-center px-2 py-8 md:px-6 lg:py-12">{children}</div>
    </div>
  );
}

export const inputCls = "h-[52px] w-full rounded-lg border border-line bg-white px-5 text-[15px] leading-[18px] text-ink outline-none transition-shadow focus:border-[1.5px] focus:border-primary focus:shadow-[0_0_0_4px_#7FB6FF4D]";

export function Field({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="flex justify-between text-[13px] font-medium leading-4 text-ink">
        {label}
        {aside}
      </span>
      {children}
    </label>
  );
}

export function PrimaryButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="group flex h-14 items-center justify-center gap-[10px] rounded-lg text-base font-semibold leading-5 text-white shadow-[inset_0_1px_0_#FFFFFF66,0_12px_28px_-10px_#1E4FA3B3] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      style={{ backgroundImage: "linear-gradient(180deg, #4C85EE 0%, #1E4FA3 100%)" }}
    >
      {children}
    </button>
  );
}

/** Only allow same-origin relative paths for ?next= redirects. */
export function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
