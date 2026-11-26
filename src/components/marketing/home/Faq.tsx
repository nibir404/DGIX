"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faqs } from "@/lib/seed";
import { Reveal } from "@/components/marketing/Reveal";
import { Panel, Eyebrow, H2 } from "./shared";
import { T } from "@/lib/i18n";

const QUESTIONS = [
  "Does buying through DGIX cost more?",
  "Is the matching done only by AI?",
  "Who do I sign the contract with?",
  "Who supports the product after go-live?",
  "Which countries do you serve?",
];

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex flex-col border-t-2 border-ink">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-b border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="text-[17px] leading-6 md:text-[19px] font-semibold text-ink">{f.q}</span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0 text-[22px] leading-7 text-ink">
                {isOpen ? "−" : "+"}
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="-mt-3 overflow-hidden"
                >
                  <p className="pb-6 text-base leading-[26px] text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function Faq() {
  const items = QUESTIONS.map((q) => faqs.find((f) => f.q === q)).filter((f): f is (typeof faqs)[number] => !!f);
  return (
    <Panel className="flex flex-col gap-10 px-6 py-20 md:px-20 md:py-[128px] lg:flex-row lg:gap-[96px]">
      <Reveal className="flex flex-col gap-5 lg:w-[480px] lg:shrink-0">
        <Eyebrow><T>FAQ</T></Eyebrow>
        <H2><T>Straight answers.</T></H2>
      </Reveal>
      <div className="flex-1">
        <FaqList items={items} />
      </div>
    </Panel>
  );
}
