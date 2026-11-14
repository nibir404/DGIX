"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageHero } from "@/components/marketing/PageHero";
import { HeroBlock } from "@/components/marketing/verified/HeroBlock";

gsap.registerPlugin(ScrollTrigger);

const sw = { fill: "none", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const blueBtn = "linear-gradient(in oklab 180deg, #3A72DC 0%, #1E4FA3 100%)";
const tile = "radial-gradient(ellipse 80% 90% at 100% 0% in oklab, #7FB6FF 0%, #7FB6FF00 60%), linear-gradient(in oklab 135deg, #0C1F45 0%, #1E4FA3 100%)";
const mistBg = "radial-gradient(ellipse 70% 90% at 100% 0% in oklab, #C9DCFF 0%, #C9DCFF00 60%)";

const QUERY = "Clinic billing for 3 sites in Dubai";

function Typing() {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(QUERY);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setText("");
    const o = { n: 0 };
    const t = gsap.to(o, {
      n: QUERY.length, duration: 1.8, ease: "none",
      onUpdate: () => setText(QUERY.slice(0, Math.round(o.n))),
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, []);
  return (
    <span ref={ref}>
      {text}
      <span className="animate-pulse text-sky">|</span>
    </span>
  );
}

function Pill({ children, dashed }: { children: React.ReactNode; dashed?: boolean }) {
  return (
    <div className={dashed ? "flex h-[30px] items-center rounded-lg border border-dashed border-[#FFD58A99] px-3 text-[13px] leading-4 text-glow-amber" : "flex h-[30px] items-center rounded-lg border border-[#7FB6FF59] bg-[#7FB6FF26] px-3 text-[13px] leading-4 text-[#C9DCFF]"}>
      {children}
    </div>
  );
}

function Visual1() {
  return (
    <div
      className="flex flex-1 items-center justify-center rounded-lg bg-night px-4 py-10 md:px-8 md:py-14"
      style={{ backgroundImage: "radial-gradient(ellipse 60% 90% at 100% 0% in oklab, #2F6BD8 0%, #2F6BD800 60%)" }}
    >
      <div className="flex w-full max-w-[684px] flex-col gap-[14px]">
        <div
          className="flex rounded-lg p-[2px] shadow-[0_0_0_6px_#7FB6FF1F,0_0_48px_6px_#7FB6FF59,0_0_90px_10px_#2F6BD82E] sm:rounded-lg transition-shadow duration-300 focus-within:shadow-[0_0_0_6px_#7FB6FF47,0_0_40px_8px_#7FB6FF8C,0_0_110px_14px_#2F6BD866]"
          style={{ backgroundImage: "conic-gradient(in oklab from 210deg at 50% 50%, #7FB6FF 0%, #1E4FA3 25%, #2F6BD8 50%, #7FB6FF 75%, #7FB6FF 100%)" }}
        >
          <div className="flex flex-1 flex-col gap-3 rounded-lg p-4 sm:h-[76px] sm:flex-row sm:items-center sm:gap-[14px] sm:rounded-lg sm:py-0 sm:pl-[26px] sm:pr-[10px]" style={{ backgroundImage: "linear-gradient(in oklab 90deg, #0E1E40 0%, #142B57 100%)" }}>
            <div className="flex flex-1 items-center gap-[14px]">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="#FFD58A" {...sw} className="shrink-0"><path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" /></svg>
              <div className="flex-1 text-[16px] leading-[22px] sm:text-[18px] text-paper"><Typing /></div>
            </div>
            <div className="flex h-[56px] items-center justify-center rounded-lg px-6 text-base leading-5 font-semibold text-paper shadow-[inset_0_1px_0_#FFFFFF73,0_8px_24px_#1E4FA399]" style={{ backgroundImage: "linear-gradient(in oklab 180deg, #4C85EE 0%, #2559B8 100%)" }}>
              Find my match
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-2 sm:pl-6">
          <span className="text-[13px] leading-4 text-[#FFFFFF8C]">AI picked up</span>
          <Pill>Healthcare</Pill><Pill>UAE</Pill><Pill>3 sites</Pill><Pill dashed>+ add budget</Pill>
        </div>
      </div>
    </div>
  );
}

function Visual2() {
  const rows = [
    { l: "Multi-clinic billing", r: "Verified", c: "text-success", lc: "text-ink" },
    { l: "Arabic interface", r: "Declared", c: "text-muted", lc: "text-ink" },
    { l: "Live by March", r: "Gap · needs 12 wks", c: "text-[#8A5300]", lc: "text-[#8A5300]" },
  ];
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg bg-mist p-4 py-10 md:p-12" style={{ backgroundImage: mistBg }}>
      <div className="flex w-full max-w-[520px] flex-col gap-[18px] rounded-lg border border-mist bg-paper p-5 shadow-[0_30px_60px_-30px_#0C1F454D] md:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-[14px]">
            <div className="flex size-[52px] shrink-0 items-center justify-center rounded-lg" style={{ backgroundImage: tile }}>
              <svg width="24" height="24" viewBox="0 0 24 24" stroke="#FFFFFF" {...sw}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>
            </div>
            <div className="flex flex-col gap-[2px]">
              <div className="text-[20px] leading-6 font-medium text-ink">Smart Hospital</div>
              <div className="text-[13px] leading-4 text-muted">Healthcare · v3.2 · UAE, Qatar</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[36px] leading-[38px] font-light tracking-tight text-ink">92%</div>
            <div className="text-xs leading-4 text-muted">fit</div>
          </div>
        </div>
        <div className="flex flex-col gap-[10px] rounded-lg bg-[#F6F8FC] p-4">
          {rows.map((r) => (
            <div key={r.l} className="flex items-center justify-between gap-3">
              <span className={`text-sm leading-[18px] ${r.lc}`}>{r.l}</span>
              <span className={`text-xs leading-4 font-semibold ${r.c}`}>{r.r}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] leading-[14px] font-bold text-night" style={{ backgroundImage: "linear-gradient(in oklab 135deg, #7FB6FF 0%, #2F6BD8 100%)" }}>AS</div>
            <span className="text-[13px] leading-4 text-muted">Confirmed by Asha</span>
          </div>
          <div className="inline-flex h-11 items-center rounded-lg px-5 text-sm leading-[18px] font-semibold text-paper shadow-[inset_0_1px_0_#FFFFFF59,0_8px_20px_-6px_#1E4FA38C]" style={{ backgroundImage: blueBtn }}>Request demo</div>
        </div>
      </div>
    </div>
  );
}

function Visual3() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg bg-mist p-4 py-10 md:p-12" style={{ backgroundImage: mistBg }}>
      <div className="flex w-full max-w-[520px] flex-col gap-[18px] rounded-lg bg-paper p-5 shadow-[0_40px_80px_-30px_#0C1F4573,0_0_0_1px_#EEF3FB] md:p-7">
        <div className="flex items-start justify-between">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg" style={{ backgroundImage: tile }}>
            <svg width="24" height="24" viewBox="0 0 24 24" stroke="#FFFFFF" {...sw}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F6F8FC]">
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="#0C1F45" {...sw}><path d="M6 6l12 12M18 6L6 18" /></svg>
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          <div className="text-[24px] leading-[30px] tracking-[-0.02em] text-ink">Accept this offer?</div>
          <div className="text-sm leading-[22px] text-muted">$48,200 · SLA 99.5% · 12-month warranty. You&apos;ll sign one contract with DGIX.</div>
        </div>
        <div className="flex flex-wrap justify-end gap-[10px]">
          <div className="inline-flex h-11 items-center rounded-lg border-[1.5px] border-ink px-5 text-sm leading-[18px] font-semibold text-ink">Not yet</div>
          <div className="inline-flex h-11 items-center rounded-lg px-5 text-sm leading-[18px] font-semibold text-paper shadow-[inset_0_1px_0_#FFFFFF59,0_8px_20px_-6px_#1E4FA38C]" style={{ backgroundImage: blueBtn }}>Accept &amp; sign</div>
        </div>
      </div>
    </div>
  );
}

function Visual4() {
  return (
    <div
      className="flex flex-1 items-center justify-center rounded-lg bg-night p-4 py-10 md:p-12"
      style={{ backgroundImage: "radial-gradient(ellipse 60% 90% at 100% 0% in oklab, #2F6BD8 0%, #2F6BD800 60%)" }}
    >
      <div
        className="flex h-[200px] flex-1 flex-col justify-between rounded-lg bg-night p-6"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 90% at 100% 0% in oklab, #2F6BD8 0%, #2F6BD800 60%)" }}
      >
        <div className="text-[13px] leading-4 text-[#FFFFFFA6]">Contract value</div>
        <div className="flex flex-col gap-[6px]">
          <div className="text-[36px] leading-[40px] md:text-[44px] md:leading-[46px] font-light tracking-tight text-paper">$48,200</div>
          <div className="text-[13px] leading-4 text-[#7FE0AE]">↑ $12,400 paid this month</div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { n: "01", t: "Describe the need", d: "Plain words. No RFP. AI picks out what matters.", v: <Visual1 /> },
  { n: "02", t: "Get a checked shortlist", d: "AI ranks verified products. A named advisor confirms every match.", v: <Visual2 /> },
  { n: "03", t: "See it live, then sign once", d: "Demos in your time zone. One offer with price, SLA, warranty and exit terms.", v: <Visual3 /> },
  { n: "04", t: "Delivered, then supported", d: "Pay per accepted milestone. Your DGIX contact stays after go-live.", v: <Visual4 /> },
];

function Steps() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
        const num = step.querySelector("[data-num]");
        const vis = step.querySelector("[data-vis]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: "top 90%", end: "center 55%", scrub: 0.6 } });
        tl.fromTo(num, { color: "#D9E1EE" }, { color: "#1E4FA3", ease: "none" }, 0)
          .fromTo(vis, { y: 60, scale: 0.96, opacity: 0.4 }, { y: 0, scale: 1, opacity: 1, ease: "power2.out" }, 0)
          .fromTo(step.querySelector("[data-bar]"), { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="mx-2 flex flex-col gap-5 px-2 py-16 md:mx-4 md:px-10 md:py-24">
      {STEPS.map((s) => (
        <div key={s.n} data-step className="flex flex-col gap-5 lg:flex-row">
          <div className="relative flex flex-col justify-between gap-10 overflow-hidden rounded-lg border border-mist p-6 md:p-9 lg:w-[420px] lg:shrink-0">
            <div data-num className="text-[48px] leading-[48px] md:text-[64px] md:leading-[64px] font-light tracking-[-0.05em] text-line">{s.n}</div>
            <div className="flex flex-col gap-[10px]">
              <div className="text-[26px] leading-8 md:text-[32px] md:leading-10 font-light tracking-[-0.03em] text-ink">{s.t}</div>
              <div className="text-base leading-[25px] text-muted">{s.d}</div>
            </div>
            <div data-bar aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-primary motion-reduce:scale-x-100" />
          </div>
          <div data-vis aria-hidden className="flex flex-1">{s.v}</div>
        </div>
      ))}
    </section>
  );
}

const HERO_STATS = [
  { v: "1 day", d: "to a verified shortlist" },
  { v: "1", d: "contract, with DGIX" },
  { v: "$0", d: "extra for buyers" },
];

export function HowItWorksPage() {
  return (
    <>
      <PageHero>
        <HeroBlock
          eyebrow="How it works"
          title={<>AI finds it.<br />Experts confirm it.<br />We deliver it.</>}
          aside={
            <div className="flex flex-wrap gap-8 pb-3 md:gap-10">
              {HERO_STATS.map((s) => (
                <div key={s.d} className="flex flex-col gap-1">
                  <div className="text-[36px] leading-10 md:text-[48px] md:leading-12 font-light tracking-tight text-paper">{s.v}</div>
                  <div className="text-sm leading-[18px] text-white/70">{s.d}</div>
                </div>
              ))}
            </div>
          }
        />
      </PageHero>
      <Steps />
    </>
  );
}
