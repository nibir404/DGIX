"use client";

import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { GlowButton, HeroBg, Section } from "@/components/marketing/pages/bits";
import { articleBody, dateLabel, VISUALS } from "@/components/marketing/pages/insights";
import { Icon } from "@/components/ui/Icon";
import { articles } from "@/lib/seed";

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const idx = articles.findIndex((a) => a.slug === slug);
  if (idx < 0) notFound();
  const a = articles[idx];
  const more = articles.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={
          <Link href="/insights" className="inline-flex items-center gap-1.5 hover:text-white">
            <Icon name="chevronLeft" size={16} /> Insights · {a.tag}
          </Link>
        }
        title={<span className="block max-w-[1000px] text-[40px] leading-[44px] md:text-[72px] md:leading-[76px]">{a.title}</span>}
        aside={
          <div className="flex flex-col gap-1 text-[15px] leading-[22px] text-white/72 md:items-end">
            <span className="text-white">{a.author}</span>
            <span>{dateLabel(a.date)} · {a.minutes} min read</span>
          </div>
        }
      >
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), radial-gradient(ellipse 40% 70% at 85% 100%, #F6A11A4D 0%, #F6A11A00 65%), linear-gradient(#08152F,#08152F)" />
      </PageHero>

      <Section className="py-14 md:py-[96px]">
        <article className="mx-auto flex max-w-[720px] flex-col gap-10">
          <p className="text-[22px] leading-[34px] font-light text-ink md:text-[26px] md:leading-[38px]">{a.excerpt}</p>
          {articleBody(a).map((s, i) => (
            <Reveal key={s.h} delay={i * 0.05} className="flex flex-col gap-4">
              <h2 className="text-[26px] leading-[32px] font-normal tracking-[-0.02em] text-ink">{s.h}</h2>
              {s.p.map((p) => (
                <p key={p} className="text-[17px] leading-[29px] text-[#2A3550]">{p}</p>
              ))}
            </Reveal>
          ))}
          <div className="flex flex-col items-start gap-5 rounded-lg bg-mist p-6 md:p-8">
            <div className="text-[22px] leading-[28px] text-ink">Want a verified shortlist for your need?</div>
            <GlowButton href="/contact">Describe my need</GlowButton>
          </div>
        </article>
      </Section>

      <Section className="flex flex-col gap-6 pb-20 md:pb-[112px]">
        <h3 className="text-[32px] leading-[40px] font-light tracking-tight text-ink">Keep reading</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {more.map((m, i) => {
            const v = VISUALS[i % VISUALS.length];
            return (
              <Link key={m.slug} href={`/insights/${m.slug}`} className="group flex flex-col gap-4 rounded-lg border border-mist px-4 pb-6 pt-4 shadow-[0_24px_48px_-32px_#0C1F4559] transition-transform hover:-translate-y-1">
                <div className="h-[160px] rounded-lg bg-cover bg-center" style={{ backgroundImage: v.cover ? `url(${v.img})` : `url(${v.img}), ${v.bg}`, backgroundSize: v.cover ? "cover" : "auto 100%, cover", backgroundRepeat: "no-repeat" }} />
                <div className="flex flex-col gap-2 px-2">
                  <div className="text-[13px] leading-4 text-muted">{m.tag} · {m.minutes} min</div>
                  <div className="text-[19px] leading-[26px] text-ink">{m.title}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
    </>
  );
}
