"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { createPortal, preload } from "react-dom";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Icon } from "@/components/ui/Icon";

import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/components/marketing/globe/GlobeLines"), { ssr: false });

const LIVE = [
  { route: "-", kicker: "Live · just now", time: "4h 12m", title: "Shortlist sent to a retail group in Riyadh", tags: ["HR & payroll", "3 verified matches"] },
  { route: "nyc", kicker: "Live · 12 min ago", time: "1d 2h", title: "Demo booked by a logistics firm in New York", tags: ["AI & automation", "Central AI"] },
  { route: "--", kicker: "Live · 40 min ago", time: "6h", title: "Milestone accepted by a clinic group in Doha", tags: ["Healthcare", "Paid on acceptance"] },
];


const PROMPTS = ["HR and payroll for 400 staff in Riyadh", "Clinic billing for 3 sites in Doha", "POS for 12 stores in Dubai", "Read 30k invoices a month in New York"];

export function HomeHero() {
  preload("/data/globe-dots.bin", { as: "fetch", crossOrigin: "anonymous" });
  const [active] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [film, setFilm] = useState(false);
  const headline = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

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
    <section className="relative mx-2 mt-2 md:mx-4 md:mt-4 flex min-h-[760px] flex-col overflow-hidden rounded-lg bg-night-hero text-white md:h-[880px]">
      {/* Background: globe centred behind the copy, rising from below */}
      <div className="absolute left-1/2 top-[52%] aspect-[1752/897] w-[230%] -translate-x-1/2 sm:top-[46%] sm:w-[170%] md:top-[40%] md:w-[135%] lg:w-[118%] xl:w-[108%] [mask-image:linear-gradient(180deg,#000_55%,transparent_100%)]">
        <Globe />
      </div>
      {/* Readability: soft dark pool behind the centred copy, and a fade at the bottom */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_38%_at_50%_38%,rgba(8,21,47,0.82),rgba(8,21,47,0.3)_60%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(180deg,transparent,rgba(8,21,47,0.45))]" />

      <SiteNav />

      {/* Foreground: everything centred */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100%-104px)] max-w-[980px] flex-col items-center justify-center gap-7 px-4 pb-10 pt-6 text-center sm:px-6 md:gap-8 md:pb-[150px]">
        <h1 ref={headline} className="text-[44px] leading-[46px] sm:text-[64px] sm:leading-[66px] md:text-[84px] md:leading-[86px] lg:text-[100px] lg:leading-[100px] font-light tracking-[-0.05em]">
          <span className="hl-line block overflow-hidden pb-2"><span className="block">Proven products.</span></span>
          <span className="hl-line block overflow-hidden pb-2"><span className="block">Sold to the world.</span></span>
        </h1>
        <p className="hero-fade max-w-[620px] text-[17px] leading-[26px] text-white/75 sm:text-[19px] sm:leading-[29px]">
          <span className="font-medium text-white">DGIX is Daffodil&apos;s global innovation exchange.</span> We verify products from Bangladesh, match them to your need, and deliver them under one contract.
        </p>
        <div className="pointer-events-auto flex w-full flex-col items-center gap-5">
          <div ref={barRef} className="hero-fade flex w-full justify-center">
            <NeedBar />
          </div>
          {/* Compact film button for phones and tablets; large screens get the thumbnail card */}
          <button onClick={() => setFilm(true)} className="hero-fade group flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-1.5 pl-1.5 pr-5 backdrop-blur transition-colors hover:bg-white/16 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-primary transition-transform group-hover:scale-105">
              <Icon name="play" size={13} />
            </span>
            <span className="text-[15px] font-medium">Watch how DGIX works</span>
            <span className="font-mono text-[13px] text-sky">1:10</span>
          </button>
        </div>
      </div>

      {/* Bottom-left corner: film thumbnail */}
      <button
        onClick={() => setFilm(true)}
        aria-label="Watch how DGIX works, 1 minute 10 seconds"
        className="hero-fade group absolute bottom-8 left-8 z-20 hidden w-[300px] items-center gap-4 rounded-lg border border-white/15 bg-[#0C1F45]/55 p-2.5 pr-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-[#0C1F45]/75 lg:flex"
      >
        <span className="relative block aspect-video w-[118px] shrink-0 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/dgix-film-poster.webp" alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-night/25" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
              <Icon name="play" size={13} />
            </span>
          </span>
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 font-mono text-[10px] leading-4 text-white">1:10</span>
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[15px] font-semibold leading-5">How DGIX works</span>
          <span className="text-[13px] leading-[18px] text-haze">From request to go-live, in one minute.</span>
        </span>
      </button>

      {/* Bottom-right corner: live activity */}
      <div className="pointer-events-none absolute bottom-8 right-8 z-20 hidden w-[300px] lg:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={live.title}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-3 rounded-lg border border-white/15 bg-[#0C1F45]/55 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
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
            <div className="text-[15px] font-medium leading-5">{live.title}</div>
            <div className="flex gap-1.5">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs">{live.tags[0]}</span>
              <span className="rounded-md bg-sky/20 px-2.5 py-1 text-xs font-semibold text-sky">{live.tags[1]}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <FilmModal open={film} onClose={() => setFilm(false)} />
      <SearchDock anchor={barRef} />
    </section>
  );
}

function NeedBar({ autoFocus = false }: { autoFocus?: boolean }) {
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
    <div className="w-full max-w-[656px] rounded-full bg-night/40 p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/12 backdrop-blur-xl backdrop-saturate-150">
      <form
        onSubmit={submit}
        className="relative flex h-14 w-full items-center gap-2 rounded-full border border-white/70 bg-white pl-5 pr-1.5 shadow-[0_0_0_4px_rgba(127,182,255,0.12),0_18px_50px_-12px_rgba(0,0,0,0.55)] transition-shadow duration-300 focus-within:shadow-[0_0_0_5px_rgba(127,182,255,0.4),0_0_48px_rgba(127,182,255,0.45),0_18px_50px_-12px_rgba(0,0,0,0.55)] sm:h-16 sm:pl-7 sm:pr-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => { focused.current = true; setIsFocused(true); }}
          onBlur={() => { focused.current = false; setIsFocused(false); setShown(""); }}
          aria-label="Describe what you need"
          autoFocus={autoFocus}
          placeholder={isFocused ? "" : shown + "│"}
          className="min-w-0 flex-1 bg-transparent text-left text-base text-ink outline-none placeholder:text-muted sm:text-[17px]"
        />
        <button
          type="submit"
          aria-label="Find my match"
          title="Find my match"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] text-white shadow-[0_6px_16px_-6px_#1E4FA3] transition hover:brightness-110 active:scale-95 sm:size-12"
        >
          <Icon name="arrowRight" size={18} strokeWidth={2.2} className="-rotate-90" />
        </button>
      </form>
    </div>
  );
}

/** Floating copy of the search, pinned to the bottom of the screen once the hero search has scrolled out of view. */
function SearchDock({ anchor }: { anchor: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [anchor]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-4 sm:pb-5"
        >
          <div className="pointer-events-auto flex w-full justify-center">
            <NeedBar />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
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
