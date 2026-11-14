"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import type { Offer, Product } from "@/lib/types";
import { Btn, Dialog, Panel, Tick, dayMonth, firstName, money, useBuyer, useFlash } from "@/components/buyer/kit";

const thumb = (v?: Product["visual"]) => (v === "people" ? "/media/buyer-req-hr.webp" : v === "bag" ? "/media/buyer-req-pos.webp" : "/media/buyer-req-ai.webp");
const addDays = (iso: string, n: number) => new Date(new Date(iso).getTime() + n * 864e5).toISOString();

const ICONS = {
  price: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.3c0 3 6 1.6 6 4.6 0 1.3-1.3 2.4-3 2.4s-3-1.1-3-2.5" /></>,
  sla: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  warranty: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  exit: <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />,
};

function weeks(o: Offer, p?: Product) {
  const total = Number(p?.goLive.match(/(\d+)\s*weeks/)?.[1] ?? 8);
  const sum = o.milestones.reduce((s, m) => s + m.amount, 0) || 1;
  let start = 1;
  return o.milestones.map((m, i) => {
    const len = i === o.milestones.length - 1 ? Math.max(1, total - start + 1) : Math.max(1, Math.round((m.amount / sum) * total));
    const label = len === 1 ? `Week ${start}` : `Week ${start}–${start + len - 1}`;
    start += len;
    return label;
  });
}

function OffersInner() {
  const b = useBuyer();
  const lk = useLookup();
  const router = useRouter();
  const params = useSearchParams();
  const { flash, toast } = useFlash();
  const [checks, setChecks] = useState([false, false]);
  const [sig, setSig] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [declining, setDeclining] = useState(false);

  const order: Record<Offer["status"], number> = { sent: 0, draft: 1, accepted: 2, declined: 3 };
  const all = [...b.offers].sort((a, c) => order[a.status] - order[c.status] || (c.sentAt ?? "").localeCompare(a.sentAt ?? ""));
  const o = all.find((x) => x.id === params.get("offer")) ?? all[0];

  if (!o)
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">Offers &amp; contracts</h1>
        <Panel className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="text-lg text-ink">No offers yet</div>
          <div className="max-w-sm text-sm text-muted">After your demos, your advisor prepares one clear offer with price, SLA and exit terms.</div>
          <Btn href="/buyer/demos">See demos</Btn>
        </Panel>
      </div>
    );

  const p = lk.product(o.productId);
  const req = b.requests.find((r) => r.id === o.requestId);
  const score = lk.score(o.productId);
  const advisor = lk.user(b.company?.advisorId);
  const project = b.db.projects.find((pr) => pr.offerId === o.id);
  const signer = sig ?? b.user?.name ?? "";
  const stage = o.status === "draft" ? 0 : o.status === "sent" ? 1 : o.status === "accepted" ? 2 : -1;
  const wk = weeks(o, p);
  const canSign = o.status === "sent" && checks.every(Boolean) && signer.trim().length > 2;
  const validUntil = o.sentAt ? dayMonth(addDays(o.sentAt, 14)) : null;
  const kicker = o.status === "accepted" ? `Contracts / ${o.ref} · signed ${o.signedAt ? dayMonth(o.signedAt) : ""}` : o.status === "draft" ? `Offers / ${o.ref} · being prepared` : o.status === "declined" ? `Offers / ${o.ref} · declined` : `Offers / ${o.ref}${validUntil ? ` · valid until ${validUntil}` : ""}`;
  const title = o.status === "accepted" ? `Your contract for ${p?.name}` : `Your offer for ${p?.name}`;

  const terms = [
    { k: "price", t: "Price", v: `${money(o.price)} a year, all-in. Setup included. No extra DGIX fee.` },
    { k: "sla", t: "Service level", v: `${o.sla}.` },
    { k: "warranty", t: "Warranty", v: `${o.warranty} warranty. Service credits if SLA is missed.` },
    { k: "exit", t: "Exit terms", v: `${o.exit}.` },
  ] as const;

  const accept = () => {
    b.acceptOffer(o.id);
    setConfirm(false);
    flash(`Signed · ${o.ref} is now a contract. Kick-off is being scheduled.`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted">{kicker}</div>
          <h1 className="text-[30px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-[#E3E9F4] bg-paper p-1 lg:self-auto">
          {["Review", "Sign", "Kick-off"].map((s, i) =>
            i === 2 && project ? (
              <Link key={s} href={`/buyer/projects/${project.id}`} className={clsx("rounded-lg px-3.5 py-1.5 text-[13px] leading-4", stage === 2 ? "bg-night font-semibold text-paper" : "text-muted")}>{s}</Link>
            ) : (
              <span key={s} className={clsx("rounded-lg py-1.5 text-[13px] leading-4", stage === i ? "bg-night px-3.5 font-semibold text-paper" : "px-3 text-muted")}>{s}</span>
            ),
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:grow-[1.5] lg:basis-0">
          <Panel className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <Image src={thumb(p?.visual)} alt="" width={120} height={84} className="h-[84px] w-[120px] shrink-0 rounded-lg object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="text-[18px] font-semibold leading-[22px] text-ink">{p?.name}{req?.users && req.users !== "—" ? ` · ${req.users} employees` : ""}</div>
              <div className="text-[13px] leading-4 text-muted">Delivered by {lk.company(p?.partnerId)?.name} · Contract with DGIX</div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className={clsx("rounded-lg px-2.5 py-1 text-xs font-semibold leading-4", score === 100 ? "bg-[#E6F4EC] text-[#0E6439]" : "bg-[#FDF1DE] text-warning")}>{p?.status === "pilot" ? "Pilot" : "Verified"} {score}/100</span>
                <span className="rounded-lg bg-[#F6F8FC] px-2.5 py-1 text-xs leading-4 text-ink">12-month term</span>
                {o.rating && <span className="rounded-lg bg-mist px-2.5 py-1 text-xs leading-4 text-primary">Advisor rating · {o.rating}</span>}
              </div>
            </div>
          </Panel>

          <Panel className="grid grid-cols-1 overflow-clip sm:grid-cols-2" delay={0.05}>
            {terms.map((t, i) => (
              <div key={t.k} className={clsx("flex flex-col gap-2.5 border-[#EEF1F6] p-6", ["border-b sm:border-r", "border-b", "border-b sm:border-b-0 sm:border-r", ""][i])}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4FA3" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{ICONS[t.k]}</svg>
                <div className="text-sm font-semibold leading-[18px] text-ink">{t.t}</div>
                <div className="text-[13px] leading-[19px] text-muted">{t.v}</div>
              </div>
            ))}
          </Panel>

          <Panel className="flex flex-col px-5 py-1.5" delay={0.1}>
            {o.milestones.map((m, i) => (
              <div key={m.title} className={clsx("flex items-center gap-3 py-3.5", i < o.milestones.length - 1 && "border-b border-[#F1F4FA]")}>
                <div className="w-7 shrink-0 text-[13px] font-semibold leading-4 text-[#9AA2B4]">{String(i + 1).padStart(2, "0")}</div>
                <div className="min-w-0 flex-1 text-sm leading-[18px] text-ink">{m.title}</div>
                <div className="hidden text-[13px] leading-4 text-muted sm:block">{wk[i]}</div>
                <div className="w-[90px] shrink-0 text-right text-sm font-medium leading-[18px] text-ink">{money(m.amount)}</div>
              </div>
            ))}
          </Panel>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex min-w-0 flex-col gap-[18px] rounded-lg bg-night p-[26px] lg:grow lg:basis-0"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 50% at 100% 0%, #2F6BD8 0%, #2F6BD800 70%), radial-gradient(ellipse 60% 40% at 0% 100%, #F6A11A40 0%, #F6A11A00 70%)" }}
        >
          <div className="text-[13px] leading-4 text-[#FFFFFFA6]">Total for year one</div>
          <div className="flex items-baseline gap-2">
            <div className="text-[48px] font-light leading-[56px] tracking-[-0.05em] text-paper md:text-[56px] md:leading-[64px]">{money(o.price)}</div>
            <div className="text-sm leading-[18px] text-[#FFFFFF8C]">USD</div>
          </div>
          <div className="text-[13px] leading-4 text-[#7FE0AE]">Paid in {o.milestones.length} parts, only after you accept each one</div>

          {o.status === "draft" && (
            <div className="flex flex-1 flex-col gap-3 border-t border-[#FFFFFF1F] pt-[18px]">
              <div className="flex items-center gap-2 text-sm text-paper"><span className="size-2 animate-pulse rounded-full bg-glow-amber" /> Being prepared</div>
              <div className="text-[13px] leading-5 text-[#FFFFFFB3]">{firstName(advisor?.name) || "Your advisor"} is finalising this offer with {lk.company(p?.partnerId)?.name}. You&apos;ll get a notification as soon as it&apos;s ready to sign.</div>
            </div>
          )}

          {o.status === "sent" && (
            <>
              <div className="flex flex-col gap-3 border-y border-[#FFFFFF1F] py-[18px]">
                {["I've read the SLA and exit terms", `I can sign for ${b.company?.name ?? "my company"}`].map((l, i) => (
                  <button key={l} onClick={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))} className="flex items-center gap-2.5 text-left">
                    <span className={clsx("flex size-5 shrink-0 items-center justify-center rounded-lg transition-colors", checks[i] ? "bg-sky" : "border-[1.5px] border-[#FFFFFF59]")}>{checks[i] && <Tick color="#08152F" />}</span>
                    <span className="text-sm leading-[18px] text-paper">{l}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs leading-4 text-[#FFFFFF8C]">Signing as</div>
                <div className="text-[15px] leading-[18px] text-paper">{signer} · {b.user?.title}</div>
              </div>
              <label className="flex min-h-[110px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-dashed border-[#FFFFFF40] bg-[#FFFFFF0A] px-4">
                <input value={signer} onChange={(e) => setSig(e.target.value)} aria-label="Type your signature" className="w-full bg-transparent text-center text-[30px] font-light italic leading-9 text-[#FFFFFFD9] outline-none" />
              </label>
              <button
                disabled={!canSign}
                onClick={() => setConfirm(true)}
                className="flex h-[54px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] text-[15px] font-semibold leading-[18px] text-paper shadow-[inset_0_1px_0_#FFFFFF4D,0_12px_28px_-10px_#4C85EEE6] transition hover:brightness-110 disabled:opacity-50"
              >
                Sign &amp; accept offer
              </button>
            </>
          )}

          {o.status === "accepted" && (
            <div className="flex flex-1 flex-col gap-3 border-t border-[#FFFFFF1F] pt-[18px]">
              <div className="flex items-center gap-2.5"><span className="flex size-5 items-center justify-center rounded-lg bg-[#7FE0AE]"><Tick color="#08152F" /></span><span className="text-sm text-paper">Signed {o.signedAt ? dayMonth(o.signedAt) : ""} by {b.user?.name}</span></div>
              <div className="flex flex-1 items-center justify-center rounded-lg border-[1.5px] border-dashed border-[#FFFFFF40] bg-[#FFFFFF0A] py-8 text-[30px] font-light italic leading-9 text-[#FFFFFFD9]">{b.user?.name}</div>
              {project && <Btn href={`/buyer/projects/${project.id}`} size="lg" className="w-full">Open project</Btn>}
            </div>
          )}

          {o.status === "declined" && <div className="flex-1 border-t border-[#FFFFFF1F] pt-[18px] text-sm text-[#FFFFFFB3]">You declined this offer. Your advisor can prepare a new one.</div>}

          <div className="flex flex-wrap justify-between gap-3">
            <button onClick={() => window.print()} className="text-[13px] leading-4 text-[#FFFFFFB3] hover:text-paper">Download PDF</button>
            {o.status === "sent" && <button onClick={() => setDeclining(true)} className="text-[13px] leading-4 text-[#FFFFFFB3] hover:text-paper">Decline</button>}
            <button onClick={() => router.push(`/buyer/support?subject=${encodeURIComponent("Question about " + o.ref)}`)} className="text-[13px] leading-4 text-glow-amber">Ask {firstName(advisor?.name) || "advisor"} a question</button>
          </div>
        </motion.div>
      </div>

      {all.length > 1 && (
        <Panel className="flex flex-col px-5 py-1.5" delay={0.15}>
          <div className="pb-1 pt-3.5 text-xs font-semibold tracking-[0.06em] text-[#9AA2B4]">ALL OFFERS &amp; CONTRACTS</div>
          {all.map((x, i) => {
            const st = { draft: ["Being prepared", "bg-mist text-muted"], sent: ["Ready to sign", "bg-[#FDF1DE] text-warning"], accepted: ["Signed contract", "bg-[#E6F4EC] text-[#0E6439]"], declined: ["Declined", "bg-mist text-muted"] }[x.status];
            return (
              <Link key={x.id} href={`/buyer/offers?offer=${x.id}`} className={clsx("flex items-center gap-3 py-3.5", i < all.length - 1 && "border-b border-[#F1F4FA]", x.id === o.id && "font-medium")}>
                <div className="w-[72px] shrink-0 text-[13px] text-muted">{x.ref}</div>
                <div className="min-w-0 flex-1 truncate text-sm text-ink">{lk.product(x.productId)?.name}</div>
                <div className="hidden text-sm text-ink sm:block">{money(x.price)}</div>
                <span className={clsx("shrink-0 rounded-lg px-2.5 py-[5px] text-xs font-semibold", st[1])}>{st[0]}</span>
              </Link>
            );
          })}
        </Panel>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Accept & sign">
        <div className="flex flex-col gap-4 text-sm text-muted">
          <p>You&apos;re signing <span className="font-semibold text-ink">{o.ref}</span> for <span className="font-semibold text-ink">{p?.name}</span> at <span className="font-semibold text-ink">{money(o.price)}</span> on behalf of {b.company?.name}. Each of the {o.milestones.length} payments is only invoiced after you accept that milestone.</p>
          <div className="rounded-lg bg-[#F6F8FC] py-4 text-center text-2xl font-light italic text-ink">{signer}</div>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => setConfirm(false)} className="flex-1">Cancel</Btn>
            <Btn onClick={accept} className="flex-1">Sign &amp; accept</Btn>
          </div>
        </div>
      </Dialog>
      <Dialog open={declining} onClose={() => setDeclining(false)} title="Decline this offer?">
        <div className="flex flex-col gap-4 text-sm text-muted">
          <p>{firstName(advisor?.name) || "Your advisor"} will be told and can prepare a different offer.</p>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => setDeclining(false)} className="flex-1">Keep offer</Btn>
            <Btn variant="dark" onClick={() => { b.declineOffer(o.id); setDeclining(false); flash(`${o.ref} declined`); }} className="flex-1">Decline</Btn>
          </div>
        </div>
      </Dialog>
      {toast}
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense fallback={null}>
      <OffersInner />
    </Suspense>
  );
}
