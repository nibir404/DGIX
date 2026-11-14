"use client";

import { use, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { CATEGORY_COPY, CHIPS, genericCopy, isPublic } from "@/components/marketing/catalogue/data";
import { Chip, HeroStat, IntroFaq, NotListed, ProductCard, ReviewCard, ServicePanels, SortMenu, sortProducts } from "@/components/marketing/catalogue/ui";

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const { db } = useStore();
  const [sort, setSort] = useState("Best fit");
  const chip = CHIPS.find((c) => c.slug === category);
  const label = chip?.label ?? "Solutions";
  const copy = CATEGORY_COPY[category] ?? genericCopy(label);

  const inCat = db.products.filter((p) => chip?.cats.includes(p.category));
  const listed = sortProducts(inCat.filter(isPublic), sort);
  const review = inCat.filter((p) => p.status === "in_review");
  const isServices = category === "ai" || category === "services";

  return (
    <>
      <PageHero
        eyebrow={`Solutions · ${label}`}
        title={copy.hero}
        aside={<HeroStat n={listed.length} label={`listed · ${review.length} in review`} />}
      />

      <section className="mx-2 flex flex-col gap-8 px-2 pb-16 pt-10 md:mx-4 md:px-10 md:pb-24 md:pt-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup id="category-chips">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
              <Chip href="/solutions">All</Chip>
              {CHIPS.map((c) => (
                <Chip key={c.slug} href={`/solutions/${c.slug}`} active={c.slug === category}>
                  {c.slug === category ? `${c.label} · ${listed.length}` : c.label}
                </Chip>
              ))}
            </div>
          </LayoutGroup>
          <SortMenu value={sort} onChange={setSort} />
        </div>

        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {listed.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex flex-col [&>a]:flex-1">
                <ProductCard p={p} />
              </motion.div>
            ))}
            {review.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (listed.length + i) * 0.06 }} className="flex flex-col [&>div]:flex-1">
                <ReviewCard p={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {listed.length + review.length === 0 && (
          <div className="rounded-lg border border-dashed border-line px-6 py-14 text-center text-muted">
            Nothing listed in {label} yet. Describe your need and an advisor will check partners under review.
          </div>
        )}

        {isServices && (
          <Reveal>
            <ServicePanels />
          </Reveal>
        )}
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
