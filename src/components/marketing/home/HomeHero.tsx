"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { preload } from "react-dom";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Icon } from "@/components/ui/Icon";

import dynamic from "next/dynamic";

const Globe3D = dynamic(() => import("@/components/marketing/globe/Globe3D"), { ssr: false });

const LIVE = [
  { route: "-", kicker: "Live · just now", time: "4h 12m", title: "Shortlist sent to a retail group in Riyadh", tags: ["HR & payroll", "3 verified matches"] },
  { route: "nyc", kicker: "Live · 12 min ago", time: "1d 2h", title: "Demo booked by a logistics firm in New York", tags: ["AI & automation", "Central AI"] },
  { route: "--", kicker: "Live · 40 min ago", time: "6h", title: "Milestone accepted by a clinic group in Doha", tags: ["Healthcare", "Paid on acceptance"] },
];

const VERIFIED = [
  { title: "Smart Hospital passed 100/100", sub: "Daffodil Verified · now listed for UAE, Qatar" },
  { title: "RetailFlow POS re-verified", sub: "Major release v5 · still 100/100" },
  { title: "AI HR Management passed 100/100", sub: "Daffodil Verified · now listed for UAE, KSA" },
];

const PROMPTS = ["HR and payroll for 400 staff in Riyadh", "Clinic billing for 3 sites in Doha", "POS for 12 stores in Dubai", "Read 30k invoices a month in New York"];

export function HomeHero() {
  preload("/data/globe-dots.bin", { as: "fetch", crossOrigin: "anonymous" });
  const [active] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [film, setFilm] = useState(false);
  const headline = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (active) return;
    const t = setInterval(() => setI((x) => (x + 1) % LIVE.length), 4200);
    return () => clearInterval(t);
  }, [active]);

  useLayoutEffect(() => {
    if (!headline.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hl-line > span", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: 0.15 });
      gsap.from(".hero-fade", { opacity: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.55 });
    }, headline.current.parentElement!);
    return () => ctx.revert();
  }, []);

  const live = active ? LIVE.find((l) => l.route === active) ?? LIVE[i] : LIVE[i];

  return (
    <section className="relative mx-2 mt-2 md:mx-4 md:mt-4 min-h-[760px] md:h-[880px] overflow-hidden rounded-lg bg-night-hero text-white">
      {/* Globe */}
      <div className="absolute left-[-30%] top-[46%] aspect-[1752/897] w-[160%] sm:left-[-12%] sm:top-[40%] sm:w-[124%] md:left-[30%] md:top-[8%] md:w-[86%] [mask-image:radial-gradient(closest-side,#000_70%,transparent_100%)]">
        <Globe3D />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(8,21,47,0.55))]" />

      <SiteNav />

      {/* Live cards */}
      <div className="pointer-events-none absolute right-14 top-[150px] z-20 hidden w-[292px] md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={live.title}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-3 rounded-lg border border-white/16 bg-[#0C1F45]/55 p-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-haze">
                <span className="relative flex size-[7px]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#3DDC84]/70" />
                  <span className="relative size-[7px] rounded-full bg-[#3DDC84]" />
                </span>
                {live.kicker}
              </span>
              <span className="font-mono text-xs text-sky">{live.time}</span>
            </div>
            <div className="text-[17px] font-medium leading-[22px]">{live.title}</div>
            <div className="flex gap-1.5">
              <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs">{live.tags[0]}</span>
              <span className="rounded-lg bg-glow-amber px-2.5 py-1.5 text-xs font-semibold text-night">{live.tags[1]}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="pointer-events-none absolute left-[calc(50%+280px)] top-[580px] z-20 hidden lg:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 rounded-lg bg-white/95 py-3 pl-3 pr-[18px] shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-amber text-night">
              <Icon name="check" size={16} strokeWidth={2.4} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold leading-[18px] text-ink">{VERIFIED[i].title}</span>
              <span className="text-xs leading-[14px] text-muted">{VERIFIED[i].sub}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hero-fade absolute right-14 top-[690px] z-20 hidden items-center gap-2 text-xs text-haze lg:flex">
        <Icon name="drag" size={18} /> Drag to spin · tap a route
      </div>

      {/* Copy */}
      <div className="pointer-events-none relative z-10 flex h-[calc(100%-104px)] flex-col justify-end gap-10 px-4 pb-6 sm:px-6 sm:pb-8 md:px-10">
        <h1 ref={headline} className="text-[46px] leading-[48px] sm:text-[64px] sm:leading-[64px] lg:text-[104px] lg:leading-[104px] md:text-[80px] md:leading-[80px] md:leading-[104px] font-light tracking-[-0.05em]">
          <span className="hl-line block overflow-hidden pb-2"><span className="block">Proven products.</span></span>
          <span className="hl-line block overflow-hidden pb-2"><span className="block">Sold to the world.</span></span>
        </h1>
        <div className="pointer-events-auto flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[520px] flex-col gap-6">
            <p className="hero-fade text-[19px] leading-[28px] text-white/72">
              <span className="font-medium text-white">DGIX is Daffodil&apos;s global innovation exchange.</span> We verify products from Bangladesh, match them to your need, and deliver them under one contract.
            </p>
            <button onClick={() => setFilm(true)} className="hero-fade group flex items-center gap-3 self-start rounded-lg border border-white/28 bg-white/10 py-1.5 pl-1.5 pr-5 backdrop-blur transition-colors hover:bg-white/16">
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-primary transition-transform group-hover:scale-105">
                <Icon name="play" size={14} />
              </span>
              <span className="text-[15px] font-medium">Watch how DGIX works</span>
              <span className="font-mono text-[13px] text-sky">1:10</span>
            </button>
          </div>
          <NeedBar />
        </div>
      </div>

      <FilmModal open={film} onClose={() => setFilm(false)} />
    </section>
  );
}

function NeedBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [shown, setShown] = useState("");
  const [p, setP] = useState(0);
  const focused = useRef(false);
  const [isFocused, setIsFocused] = useState(false);

  // Typewriter placeholder that cycles through real requests
  useEffect(() => {
    let i = 0;
    let dir = 1;
    const t = setInterval(() => {
      if (focused.current) return;
      const full = PROMPTS[p];
      i += dir;
      setShown(full.slice(0, i));
      if (i >= full.length + 18) dir = -1;
      if (i <= 0 && dir === -1) {
        dir = 1;
        setP((x) => (x + 1) % PROMPTS.length);
      }
    }, 55);
    return () => clearInterval(t);
  }, [p]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim() || PROMPTS[p];
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={submit}
      className="hero-fade relative flex h-16 sm:h-20 w-full md:max-w-[680px] items-center gap-2 sm:gap-3 rounded-lg border border-sky/40 bg-[#0C1F45]/80 pl-4 sm:pl-7 pr-1.5 sm:pr-2 shadow-[0_0_0_1px_rgba(127,182,255,0.25),0_0_40px_rgba(47,107,216,0.25)] backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300 hover:border-sky/70 focus-within:border-sky focus-within:bg-[#0C1F45]/95 focus-within:shadow-[0_0_0_4px_rgba(127,182,255,0.28),0_0_32px_rgba(127,182,255,0.55),0_0_90px_rgba(47,107,216,0.6)]"
    >
      <Icon name="sparkle" size={18} className="shrink-0 text-sky" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => { focused.current = true; setIsFocused(true); }}
        onBlur={() => { focused.current = false; setIsFocused(false); setShown(""); }}
        aria-label="Describe what you need"
        placeholder={isFocused ? "" : shown + "│"}
        className="min-w-0 flex-1 bg-transparent text-[15px] sm:text-[17px] text-white outline-none placeholder:text-white/85"
      />
      <button type="submit" className="flex h-12 sm:h-14 shrink-0 items-center gap-2 rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] px-4 sm:px-6 text-[15px] sm:text-[17px] font-semibold shadow-[inset_0_1px_0_#FFFFFF55] transition hover:brightness-110" aria-label="Find my match">
        <span className="hidden sm:inline">Find my match</span> <Icon name="arrowRight" size={16} />
      </button>
    </form>
  );
}

function FilmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-lenis-prevent
          className="fixed inset-0 z-[100] flex items-center justify-center bg-night/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[1100px] overflow-hidden rounded-lg bg-black shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
          >
            <video src="/media/dgix-how-it-works.mp4" poster="/media/dgix-film-poster.webp" controls autoPlay playsInline preload="none" className="aspect-video w-full" />
            <button onClick={onClose} aria-label="Close film" className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink">
              <Icon name="x" size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
