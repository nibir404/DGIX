"use client";

import { use } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal, Stagger, staggerItem } from "@/components/marketing/Reveal";
import { motion } from "framer-motion";
import { MARKETS, MARKET_COPY, isPublic } from "@/components/marketing/catalogue/data";
import { HeroStat, IntroFaq, NotListed, ProductCard, ServicePanels, Svg } from "@/components/marketing/catalogue/ui";

export default function MarketPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = use(params);
  const { db } = useStore();
  const m = MARKETS.find((x) => x.slug === market) ?? MARKETS[0];
  const copy = MARKET_COPY[m.slug] ?? MARKET_COPY.uae;
  // Listed (not pilot) products, healthcare/retail/HR first as in the Paper artboard
  const order = ["healthcare", "retail", "hr", "erp", "education", "ai"];
  const ready = db.products
    .filter((p) => isPublic(p) && p.markets.includes(m.code))
    .sort((a, b) => (a.status === "pilot" ? 1 : 0) - (b.status === "pilot" ? 1 : 0) || order.indexOf(a.category) - order.indexOf(b.category));
  const top = ready.slice(0, 3);
  const listedCount = ready.filter((p) => p.status === "listed").length;

  return (
    <>
      <PageHero
        eyebrow={`Markets · ${m.name}`}
        title={
          <>
            Products verified
            <br />
            for {m.short}.
          </>
        }
        aside={<HeroStat n={listedCount} label={`ready in ${m.short} today`} />}
      />

      <section className="mx-2 flex flex-col gap-8 px-2 pb-16 pt-10 md:mx-4 md:px-10 md:pb-24 md:pt-12">
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {copy.checks.map((c, i) => {
            const dark = i === copy.checks.length - 1;
            return (
              <motion.div key={c.label} variants={staggerItem} className={clsx("flex items-center gap-3 rounded-lg px-5 py-[18px]", dark ? "bg-night" : "bg-mist", dark && "col-span-2 md:col-span-1")}>
                <Svg name={c.icon} size={24} color={dark ? "#fff" : "#0C1F45"} />
                <span className={clsx("text-[15px] font-medium leading-[18px]", dark ? "text-white" : "text-ink")}>{c.label}</span>
              </motion.div>
            );
          })}
        </Stagger>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {top.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06} className="flex flex-col [&>a]:flex-1">
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
        {ready.length > 3 && (
          <Link href={`/solutions`} className="self-center text-[15px] font-semibold text-primary underline underline-offset-4">
            See all {ready.length} products ready in {m.short}
          </Link>
        )}
        {ready.length === 0 && (
          <div className="rounded-lg border border-dashed border-line px-6 py-14 text-center text-muted">No products are verified for {m.short} yet.</div>
        )}

        <Reveal>
          <ServicePanels ai={copy.ai} services={copy.services} />
        </Reveal>
        <Reveal>
          <NotListed />
        </Reveal>
        <Reveal>
          <IntroFaq title={copy.title} intro={copy.intro} faqs={copy.faqs} />
        </Reveal>
      </section>
    </>
  );
}
