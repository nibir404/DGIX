"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CHECK_META } from "@/lib/seed";
import { CountUp, reducedMotion } from "./shared";

/** Global Readiness Score card. Bars fill on scroll (width = max / 20). */
export function Scorecard({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
    const tween = gsap.fromTo(
      bars,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 75%", once: true } },
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(bars, { clearProps: "transform" }); };
  }, []);
  return (
    <div ref={ref} className={`flex flex-col rounded-lg bg-paper p-6 md:p-10 shadow-[0_30px_60px_-30px_#0C1F4540] ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-6">
        <div className="text-[15px] leading-[18px] font-semibold text-ink">Global Readiness Score</div>
        <div className="text-[48px] leading-[52px] md:text-[64px] md:leading-[68px] font-light tracking-tight text-ink">
          <CountUp value="100" />
          <span className="text-muted">/100</span>
        </div>
      </div>
      <div className="flex flex-col gap-[18px] pt-7">
        {CHECK_META.map((c) => (
          <div key={c.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <div className="text-[15px] leading-[18px] text-ink sm:w-[240px] sm:shrink-0">{c.label}</div>
            <div className="flex flex-1 items-center gap-5">
              <div className="h-2 flex-1 rounded-lg bg-mist">
                <div data-bar className="h-2 origin-left rounded-lg bg-ink" style={{ width: `${(c.max / 20) * 100}%` }} />
              </div>
              <div className="w-7 shrink-0 text-right font-mono text-sm leading-[18px] font-semibold text-ink">{c.max}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
