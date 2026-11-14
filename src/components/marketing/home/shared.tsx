"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Outer wrapper matching the 16px desktop inset of the Paper artboards. */
export function Panel({ className, children, style, id }: { className?: string; children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  return (
    <section id={id} style={style} className={clsx("relative mx-2 mt-2 md:mx-4 md:mt-4 overflow-clip", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("text-[15px] leading-[18px] text-muted", className)}>{children}</div>;
}

export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={clsx("text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight text-ink", className)}>
      {children}
    </h2>
  );
}

/** Counts a number up when scrolled into view. `value` like "6,000+" or "1990". */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!m || reducedMotion()) return;
    const [, pre, num, post] = m;
    const target = parseInt(num.replace(/,/g, ""), 10);
    const comma = num.includes(",");
    const fmt = (n: number) => pre + (comma ? Math.round(n).toLocaleString("en-US") : String(Math.round(n))) + post;
    const from = target >= 1000 && !comma ? target - 60 : 0;
    const o = { n: from };
    el.textContent = fmt(from);
    const tween = gsap.to(o, {
      n: target,
      duration: 1.8,
      ease: "power3.out",
      onUpdate: () => { el.textContent = fmt(o.n); },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); el.textContent = value; };
  }, [value]);
  return <span ref={ref} className={className}>{value}</span>;
}

export function ArrowUpRight({ stroke }: { stroke: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0">
      <path d="M5 17L17 5M7 5h10v10" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
