"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { CHIPS, MARKETS, isPublic } from "./data";
import { Chip, HeroStat, NotListed, ProductCard, ServicePanels, SortMenu, Svg, sortProducts } from "./ui";

export function Catalogue() {
  const { db, catalogueDisclaimer, syncing, lastError, refreshLive } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const [cat, setCat] = useState<string>(params.get("category") ?? "all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [market, setMarket] = useState<string>(params.get("market") ?? "all");
  const [sort, setSort] = useState("Best fit");
  const [mOpen, setMOpen] = useState(false);
  const mRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = params.get("category");
    if (c) setCat(c);
  }, [params]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => mRef.current && !mRef.current.contains(e.target as Node) && setMOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pub = useMemo(() => db.products.filter(isPublic), [db.products]);
  const base = useMemo(() => {
    const t = q.trim().toLowerCase();
    return pub.filter((p) => (market === "all" || p.markets.includes(market)) && (!t || [p.name, p.tagline, p.description, p.category, ...p.markets].join(" ").toLowerCase().includes(t)));
  }, [pub, q, market]);
  const chip = CHIPS.find((c) => c.slug === cat);
  const shown = sortProducts(chip ? base.filter((p) => chip.cats.includes(p.category)) : base, sort);
  const countFor = (slug: string) => base.filter((p) => CHIPS.find((c) => c.slug === slug)?.cats.includes(p.category)).length;

  const pick = (slug: string) => {
    setCat(slug);
    const u = new URLSearchParams(params.toString());
    if (slug === "all") u.delete("category");
    else u.set("category", slug);
    router.replace(`/solutions${u.toString() ? "?" + u : ""}`, { scroll: false });
  };

  const mName = market === "all" ? "All countries" : MARKETS.find((m) => m.code === market)?.name;

  return (
    <>
      <PageHero eyebrow="Solutions" title={<>Verified products,<br />ready for your country.</>} aside={<HeroStat n={pub.length} label={`listed today · ${CHIPS.length + 1} categories`} />}>
        <div className="relative z-10 flex flex-col gap-3 px-4 pb-6 md:flex-row md:px-10 md:pb-10">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex h-[60px] flex-1 items-center gap-3 rounded-lg border border-white/20 bg-white/10 pl-[22px] pr-2"
          >
            <Svg name="search" size={20} color="#fff" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, need or capability"
              className="min-w-0 flex-1 bg-transparent text-base leading-5 text-white outline-none placeholder:text-white/60"
            />
            <button type="submit" className="flex h-11 items-center rounded-lg bg-[linear-gradient(180deg,#3A72DC_0%,#1E4FA3_100%)] px-5 shadow-[inset_0_1px_0_#FFFFFF59]">
              <span className="text-[15px] font-semibold leading-[18px] text-white">Search</span>
            </button>
          </form>
          <div ref={mRef} className="relative">
            <button onClick={() => setMOpen(!mOpen)} className="flex h-[60px] w-full items-center gap-[10px] rounded-lg border border-white/20 bg-white/10 px-[22px] md:w-auto">
              <Svg name="globe" size={20} color="#fff" />
              <span className="flex-1 text-left text-base leading-5 text-white">{mName}</span>
              <Svg name="chevD" size={18} color="#fff" />
            </button>
            <AnimatePresence>
              {mOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-[68px] z-30 flex w-full min-w-60 flex-col rounded-lg bg-paper p-1.5 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                >
                  {[{ code: "all", name: "All countries" }, ...MARKETS].map((m) => (
                    <button
                      key={m.code}
                      onClick={() => {
                        setMarket(m.code);
                        setMOpen(false);
                      }}
                      className={clsx("rounded-lg px-3 py-2.5 text-left text-[15px]", m.code === market ? "bg-mist font-semibold" : "hover:bg-mist")}
                    >
                      {m.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageHero>

      <section className="mx-2 flex flex-col gap-8 px-2 pb-16 pt-10 md:mx-4 md:px-10 md:pb-24 md:pt-12">
        <div className="flex items-start gap-3 rounded-lg border border-[#CBD7EE] bg-[#F6F9FF] px-4 py-3 text-[13px] leading-5 text-[#2C3E66]">
          <Svg name="info" size={18} color="#1E4FA3" className="mt-0.5" />
          <div>
            <span className="font-semibold text-ink">Verification note: </span>
            {catalogueDisclaimer}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup id="solutions-chips">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
              <Chip active={cat === "all"} onClick={() => pick("all")}>
                {cat === "all" ? `All · ${base.length}` : "All"}
              </Chip>
              {CHIPS.map((c) => (
                <Chip key={c.slug} active={cat === c.slug} onClick={() => pick(c.slug)}>
                  {cat === c.slug ? `${c.label} · ${countFor(c.slug)}` : c.label}
                </Chip>
              ))}
            </div>
          </LayoutGroup>
          <SortMenu value={sort} onChange={setSort} />
        </div>

        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col [&>a]:flex-1"
              >
                <ProductCard p={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {lastError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F5C6C6] bg-[#FFF5F5] px-4 py-3 text-sm text-danger">
            <span>{lastError}</span>
            <button
              type="button"
              onClick={() => void refreshLive()}
              className="shrink-0 rounded bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm"
            >
              Try again
            </button>
          </div>
        )}
        {shown.length === 0 && (
          <div className="rounded-lg border border-dashed border-line px-6 py-14 text-center text-muted">
            {syncing && pub.length === 0
              ? "Loading verified products…"
              : `No verified products match yet${chip ? ` in ${chip.label}` : ""}. Try another country or describe your need below.`}
          </div>
        )}

        <Reveal>
          <ServicePanels />
        </Reveal>
        <Reveal>
          <NotListed />
        </Reveal>
      </section>
    </>
  );
}
