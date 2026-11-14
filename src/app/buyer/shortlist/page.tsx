"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Btn, Panel, StatusTag, dayMonth, firstName, money, useBuyer, useFlash } from "@/components/buyer/kit";

const thumb = (v: Product["visual"]) => (v === "people" ? "/media/buyer-req-hr.webp" : v === "bag" ? "/media/buyer-req-pos.webp" : "/media/buyer-req-ai.webp");

function trust(p: Product, score: number) {
  if (p.status === "pilot" || p.classification === "pilot_eligible") return `Pilot-Eligible · ${score}/100`;
  if (score >= 90) return `Globally Ready · ${score}/100`;
  return `In review · ${score}/100`;
}

function ShortlistInner() {
  const b = useBuyer();
  const lk = useLookup();
  const router = useRouter();
  const params = useSearchParams();
  const { flash, toast } = useFlash();
  const [tab, setTab] = useState<"need" | "shortlist">("shortlist");

  const byLatest = [...b.requests].sort((a, c) => c.createdAt.localeCompare(a.createdAt));
  const req =
    byLatest.find((r) => r.id === params.get("request")) ??
    byLatest.find((r) => r.status === "shortlist_sent") ??
    byLatest[0];

  if (!req)
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-paper px-6 py-16 text-center">
        <div className="text-lg text-ink">No shortlist yet</div>
        <div className="max-w-sm text-sm text-muted">Describe what you need and your advisor will send verified matches within 24 hours.</div>
        <Btn href="/buyer/requests/new">New request</Btn>
      </div>
    );

  const owner = lk.user(req.ownerId ?? b.company?.advisorId);
  const lockedByAdvisorGate =
    req.shortlistStatus === "pending_advisor" ||
    (req.status === "matching" && req.shortlist.every((s) => !s.confirmed));

  const items = [...req.shortlist]
    .sort((a, c) => c.fit - a.fit)
    .map((s) => {
      const p = lk.product(s.productId);
      if (!p) return null;
      const demo = b.demos.find((d) => d.productId === s.productId && (d.requestId === req.id || !d.requestId) && d.status !== "cancelled");
      return { s, p, score: lk.score(p.id), partner: lk.company(p.partnerId), demo };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const best = items[0];
  const tags = [req.country === "United Arab Emirates" ? "UAE" : req.country, `Budget ${req.budget}`, `Go-live ${req.goLive}`, `${req.users} users`].filter(Boolean);

  const book = (productId: string, name: string) => {
    b.bookDemo(productId, req.id);
    flash(`Demo requested · ${name}. We'll confirm a time within a day.`);
  };

  const note = lockedByAdvisorGate
    ? "AI pre-ranking is complete and queued for DGIX Senior Advisor 4-eyes approval (BR-15). Buyer visibility unlocks immediately after human verification."
    : best
      ? `${best.p.name} fits best: ${best.s.strengths.slice(0, 2).join(" and ")}. Book ${Math.min(2, items.length) === 1 ? "a demo" : "two demos"}, then I'll prepare one binding offer.`
      : "Your advisor is preparing verified product matches for this requirement.";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[13px] leading-4 text-muted">
            <Link href="/buyer/requests" className="hover:text-ink">Requests</Link> / {req.ref}
            {byLatest.length > 1 && (
              <select value={req.id} onChange={(e) => router.push(`/buyer/shortlist?request=${e.target.value}`)} aria-label="Choose request" className="ml-1 rounded-full border border-[#E3E9F4] bg-paper px-2 py-0.5 text-xs text-ink outline-none">
                {byLatest.map((r) => <option key={r.id} value={r.id}>{r.title} ({r.shortlistStatus === "approved" || r.status === "shortlist_sent" ? "Approved" : "Pending Advisor"})</option>)}
              </select>
            )}
          </div>
          <h1 className="text-[30px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">{req.title}</h1>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => <span key={t} className="rounded-lg border border-[#E3E9F4] bg-paper px-3 py-1.5 text-xs leading-4 text-ink">{t}</span>)}
            <StatusTag status={req.status} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-[#E3E9F4] bg-paper p-1 lg:self-auto">
          <button onClick={() => setTab("need")} className={clsx("rounded-lg px-3 py-1.5 text-[13px] leading-4", tab === "need" ? "bg-night font-semibold text-paper" : "text-muted hover:text-ink")}>Need</button>
          <button onClick={() => setTab("shortlist")} className={clsx("rounded-lg px-3.5 py-1.5 text-[13px] leading-4", tab === "shortlist" ? "bg-night font-semibold text-paper" : "text-muted hover:text-ink")}>Shortlist</button>
          <Link href="/buyer/demos" className="px-3 py-1.5 text-[13px] leading-4 text-muted hover:text-ink">Demos</Link>
          <Link href="/buyer/offers" className="px-3 py-1.5 text-[13px] leading-4 text-muted hover:text-ink">Offer</Link>
        </div>
      </div>

      {tab === "need" ? (
        <Panel className="flex flex-col gap-3 p-6">
          <div className="text-xs font-semibold tracking-[0.06em] text-[#9AA2B4]">YOUR NEED</div>
          <p className="text-lg font-light leading-8 text-ink">{req.need}</p>
          <div className="text-[13px] text-muted">Sent {dayMonth(req.createdAt)} · {req.ref}</div>
        </Panel>
      ) : lockedByAdvisorGate ? (
        <Panel className="flex flex-col gap-4 border border-[#F3D9B0] bg-[#FFFBF4] p-7">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-[#FFE4B5] px-2.5 py-1 text-xs font-semibold text-[#8A5300]">
              Human-in-the-Loop Gate · BR-15
            </span>
            <span className="text-xs text-[#6B4A12]">Status: Pending Senior Advisor 4-Eyes Approval</span>
          </div>
          <h2 className="text-2xl font-light text-ink">AI candidate ranking complete — awaiting Advisor sign-off.</h2>
          <p className="max-w-2xl text-sm leading-6 text-[#6B4A12]">
            Under DGIX Governance Rule <strong>BR-15</strong>, AI-generated product shortlists are never exposed directly to enterprise buyers without independent 4-eyes verification by a Senior DGIX Advisor (<code>advisor.approver</code>) confirming regional country readiness, cost-floor compliance and delivery capacity.
          </p>
          <div className="text-xs text-muted">
            Tip for UAT: Switch to <code>advisor.approver</code> in the top-right Account menu → open <strong>Matching desk</strong> → approve this shortlist to unlock it for <code>buyer.user</code>.
          </div>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map(({ s, p, score, partner, demo }, i) => {
              const top = i === 0;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className={clsx("flex min-w-0 flex-col overflow-clip", top ? "rounded-lg border-[1.5px] border-transparent shadow-[0_0_0_4px_#7FB6FF29] [background-clip:padding-box,border-box] [background-origin:border-box]" : "rounded-lg bg-paper")}
                  style={top ? { backgroundImage: "linear-gradient(#FFFFFF, #FFFFFF), conic-gradient(from 210deg at 50% 50%, #7FB6FF 0%, #1E4FA3 25%, #2F6BD8 50%, #7FB6FF 75%, #7FB6FF 100%)" } : undefined}
                >
                  <div className={clsx("relative flex h-[170px] shrink-0 items-start p-[18px]", top ? "justify-between" : "justify-end")}>
                    <Image src={thumb(p.visual)} alt="" fill sizes="(min-width:1280px) 33vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,#08152F1A_0%,#08152F8C_100%)]" />
                    {top && <span className="relative rounded-lg bg-glow-amber px-2.5 py-[5px] text-xs font-semibold leading-4 text-night">Advisor Approved · #1</span>}
                    <div className="relative flex flex-col items-end">
                      <div className="text-[40px] font-light leading-[42px] tracking-tight text-paper">{s.fit}</div>
                      <div className="text-[11px] leading-[14px] text-[#FFFFFFB3]">fit score</div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3.5 p-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-[18px] font-semibold leading-[22px] text-ink">{p.name}</div>
                      <div className="text-[13px] leading-4 text-muted">by {partner?.name} · {trust(p, score)}</div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      {s.strengths.map((t) => <div key={t} className="text-[13px] leading-4 text-ink">✓ {t}</div>)}
                      {s.gaps.map((t) => <div key={t} className="text-[13px] leading-4 text-warning">! {t}</div>)}
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-[#F1F4FA] pt-3">
                      <div className="flex flex-col">
                        <div className="text-lg font-medium leading-6 text-ink">{money(p.priceFrom)}</div>
                        <div className="text-[11px] leading-[14px] text-muted">per year, all-in</div>
                      </div>
                      {demo ? (
                        <Link href="/buyer/demos" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#E6F4EC] px-4 text-[13px] font-semibold leading-4 text-[#0E6439]">
                          {demo.status === "requested" ? "Demo requested" : demo.status === "done" ? "Demo done" : `Demo ${dayMonth(demo.at)}`}
                        </Link>
                      ) : top ? (
                        <button onClick={() => book(p.id, p.name)} className="inline-flex h-10 items-center rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] px-[18px] text-[13px] font-semibold leading-4 text-paper shadow-[0_8px_20px_-8px_#1E4FA3B3] hover:brightness-110">Book demo</button>
                      ) : (
                        <button onClick={() => book(p.id, p.name)} className="inline-flex h-10 items-center rounded-lg border border-[#C9D4E8] px-[18px] text-[13px] font-semibold leading-4 text-ink hover:border-ink">Book demo</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Panel className="flex items-center gap-4 p-5" delay={0.1}>
            <Image src="/media/buyer-advisor.webp" alt={owner?.name ?? "Advisor"} width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
            <div className="flex min-w-0 flex-col gap-1">
              <div className="text-[13px] font-semibold leading-4 text-ink">{firstName(owner?.name) || "Advisor"}&apos;s note (BR-15 Verified)</div>
              <div className="text-sm leading-5 text-muted">{note}</div>
            </div>
          </Panel>

          {items.length > 0 && (
            <Panel className="overflow-x-auto px-6 py-2" delay={0.15}>
              <div className="min-w-[620px]">
                {[
                  { k: "COMPARE", head: true, vals: items.map((x) => x.p.name) },
                  { k: "Go-live", vals: items.map((x) => x.p.goLive) },
                  { k: "Price from (per year)", vals: items.map((x) => money(x.p.priceFrom)) },
                  { k: "Verification", vals: items.map((x) => trust(x.p, x.score)) },
                  { k: "Markets live", vals: items.map((x) => x.p.markets.join(", ")) },
                ].map((row, i, arr) => (
                  <div key={row.k} className={clsx("flex py-3.5", i < arr.length - 1 && "border-b border-[#F1F4FA]")}>
                    <div className={clsx("w-[180px] shrink-0 md:w-[240px]", row.head ? "text-xs font-semibold leading-4 tracking-[0.06em] text-[#9AA2B4]" : "text-[13px] leading-4 text-muted")}>{row.k}</div>
                    {row.vals.map((v, j) => <div key={j} className={clsx("flex-1 basis-0 pr-3 text-[13px] leading-4 text-ink", row.head && "font-semibold")}>{v}</div>)}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
      {toast}
    </div>
  );
}

export default function ShortlistPage() {
  return (
    <Suspense fallback={null}>
      <ShortlistInner />
    </Suspense>
  );
}
