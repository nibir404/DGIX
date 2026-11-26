"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Panel, Eyebrow, H2, ArrowUpRight } from "./shared";
import { T } from "@/lib/i18n";

type Card = {
  href: string; title: string; body: string; img: string; bg: string; light?: boolean;
  dots: { c1: string; c2: string; sq: string; accent: string; c3: string };
};

const cards: Card[] = [
  {
    href: "/how-it-works", title: "For buyers", img: "/media/glass-buyers.webp",
    body: "Describe the need, your users and your go-live date. Your advisor arranges demos and follows the request through to one contract, paid per milestone.",
    bg: "radial-gradient(ellipse 70% 90% at 100% 0% in oklab, #7FB6FF 0%, #7FB6FF00 60%), linear-gradient(in oklab 135deg, #0C1F45 0%, #1E4FA3 70%)",
    dots: { c1: "#7FB6FF", c2: "#A9CCFF", sq: "#FFFFFF", accent: "#F6A11A", c3: "#A9CCFF" },
  },
  {
    href: "/sell", title: "For product companies", img: "/media/glass-sellers.webp",
    body: "Pass the gate once. Sell into the USA and GCC. Keep your IP, choose your brand.",
    bg: "radial-gradient(ellipse 60% 80% at 100% 10% in oklab, #E52A2A8C 0%, #E52A2A00 65%), radial-gradient(ellipse 60% 70% at 0% 100% in oklab, #2C8C9E 0%, #2C8C9E00 70%), linear-gradient(in oklab 135deg, #0C1F45 0%, #133A5E 100%)",
    dots: { c1: "#FF8A8A", c2: "#A9CCFF", sq: "#FFFFFF", accent: "#E52A2A", c3: "#FF8A8A" },
  },
  {
    href: "/verified", title: "Daffodil Verified", img: "/media/glass-verified.webp", light: true,
    body: "Eight checks. One hundred points. Only a perfect score is listed as globally ready.",
    bg: "radial-gradient(ellipse 70% 90% at 100% 0% in oklab, #C9DCFF 0%, #C9DCFF00 60%), linear-gradient(in oklab 135deg, #EEF3FB 0%, #DCE7FA 100%)",
    dots: { c1: "#1E4FA3", c2: "#1E4FA3", sq: "#0C1F45", accent: "#F6A11A", c3: "#1E4FA3" },
  },
];

function Dots({ d, light }: { d: Card["dots"]; light?: boolean }) {
  const w = light ? "#0C1F45" : "#FFFFFF";
  const p = light ? "#1E4FA3" : "#FFFFFF";
  return (
    <svg width="112" height="44" viewBox="0 0 112 44" className="shrink-0">
      <circle cx="8" cy="8" r="7" fill={d.c1} />
      <circle cx="26" cy="8" r="7" fill={d.c2} />
      <rect x="38" y="1" width="14" height="14" rx="2" fill={d.sq} />
      <circle cx="64" cy="8" r="7" fill={d.c3} opacity="0.6" />
      <rect x="74" y="1" width="14" height="14" rx="2" fill="#7FB6FF" opacity="0.5" />
      <circle cx="8" cy="28" r="7" fill={p} opacity="0.35" />
      <rect x="18" y="21" width="14" height="14" rx="2" fill="#7FB6FF" />
      <circle cx="45" cy="28" r="7" fill={w} />
      <rect x="56" y="21" width="14" height="14" rx="2" fill={d.accent} />
      <circle cx="82" cy="28" r="7" fill={d.c3} opacity="0.4" />
      <rect x="92" y="21" width="14" height="14" rx="2" fill={w} opacity="0.25" />
    </svg>
  );
}

export function TwoWays() {
  return (
    <Panel className="flex flex-col gap-10 px-4 pt-20 pb-16 md:px-[56px] md:pt-[140px] md:pb-[120px] lg:flex-row lg:gap-[64px]">
      <div className="flex flex-col gap-5 px-2 pt-2 md:px-0 lg:sticky lg:top-24 lg:w-[440px] lg:shrink-0 lg:self-start">
        <Eyebrow><T>Two ways into DGIX</T></Eyebrow>
        <H2><T>One exchange.</T><br /><T>Both sides protected.</T></H2>
      </div>
      <div className="flex flex-1 flex-col gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.href}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
          >
            <Link
              href={c.href}
              style={{ backgroundImage: c.bg }}
              className="group relative flex h-[400px] flex-col justify-between overflow-hidden rounded-lg p-6 md:h-[440px] md:p-9"
            >
              <div
                aria-hidden
                className="absolute right-0 top-0 h-[200px] w-[270px] bg-no-repeat transition-transform duration-700 ease-out [background-size:100%_100%] [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)] group-hover:scale-[1.06] group-hover:-rotate-2 md:right-[110px] md:h-[270px] md:w-[360px]"
                style={{ backgroundImage: `url(${c.img})` }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <Dots d={c.dots} light={c.light} />
                <div className={`flex size-[56px] md:size-[64px] shrink-0 items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-45 ${c.light ? "bg-ink" : "bg-paper"}`}>
                  <ArrowUpRight stroke={c.light ? "#FFFFFF" : "#0C1F45"} />
                </div>
              </div>
              <div className="relative flex flex-col gap-6">
                <div className={`text-[40px] leading-[44px] md:text-[56px] md:leading-[60px] font-light tracking-tight ${c.light ? "text-ink" : "text-paper"}`}>{c.title}</div>
                <div className={`h-px ${c.light ? "bg-[#0C1F4533]" : "bg-[#FFFFFF59]"}`} />
                <div className={`max-w-[560px] text-[17px] leading-[27px] ${c.light ? "text-[#3A4766]" : "text-[#FFFFFFD9]"}`}>{c.body}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}
