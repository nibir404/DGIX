"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** GSAP count-up that fires when scrolled into view. Keeps `prefix`/`suffix` and thousands separators. */
export function CountUp({ to, suffix = "", from = 0, separator = true, className }: { to: number; suffix?: string; from?: number; separator?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n: number) => (separator ? Math.round(n).toLocaleString("en-US") : String(Math.round(n))) + suffix;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(to);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const obj = { v: from };
    el.textContent = fmt(from);
    const tween = gsap.to(obj, {
      v: to,
      duration: 1.8,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = fmt(obj.v);
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [to, from, suffix, separator]);
  return <span ref={ref} className={className}>{(separator ? to.toLocaleString("en-US") : String(to)) + suffix}</span>;
}
