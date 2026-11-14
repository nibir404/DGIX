"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import type { Demo, Product } from "@/lib/types";
import { Btn, Dialog, Panel, firstName, timeGst, useBuyer, useFlash } from "@/components/buyer/kit";

const thumb = (v?: Product["visual"]) => (v === "people" ? "/media/buyer-req-hr.webp" : v === "bag" ? "/media/buyer-req-pos.webp" : "/media/buyer-req-ai.webp");
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Dubai" }).replace(",", "");
const TOPICS: Record<string, string[]> = {
  hr: ["WPS payroll run", "Leave & attendance", "Arabic roadmap"],
  retail: ["Offline checkout", "Loyalty export", "Store rollout plan"],
  healthcare: ["Claims workflow", "Arabic screens", "Pharmacy stock"],
  ai: ["Document intake", "Exception routing", "Data residency"],
  erp: ["Month-end close", "Inventory", "E-invoicing"],
};

function ics(d: Demo, name: string) {
  const s = new Date(d.at);
  const e = new Date(s.getTime() + 45 * 60e3);
  const f = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `BEGIN:VEVENT\r\nUID:${d.id}@dgix\r\nDTSTAMP:${f(new Date())}\r\nDTSTART:${f(s)}\r\nDTEND:${f(e)}\r\nSUMMARY:DGIX demo · ${name}\r\nEND:VEVENT\r\n`;
}

export default function Demos() {
  const b = useBuyer();
  const lk = useLookup();
  const { flash, toast } = useFlash();
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [extra, setExtra] = useState<Record<string, string[]>>({});
  const [resched, setResched] = useState<Demo | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [asking, setAsking] = useState(false);
  const [q, setQ] = useState("");

  const at = (d: Demo) => overrides[d.id] ?? d.at;
  const now = Date.now();
  const upcoming = b.demos.filter((d) => (d.status === "booked" || d.status === "requested") && new Date(at(d)).getTime() > now - 3600e3).sort((a, c) => at(a).localeCompare(at(c)));
  const hero = upcoming.find((d) => d.status === "booked") ?? upcoming[0];
  const rest = upcoming.filter((d) => d !== hero);
  const done = b.demos.filter((d) => d.status === "done").sort((a, c) => at(c).localeCompare(at(a)));
  const toRate = done.find((d) => !ratings[d.id]) ?? done[0];
  const advisor = firstName(lk.user(b.company?.advisorId)?.name) || "your advisor";

  const syncCal = () => {
    const evs = upcoming.filter((d) => d.status === "booked");
    if (!evs.length) return flash("No confirmed demos to sync yet");
    const body = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DGIX//Buyer//EN\r\n" + evs.map((d) => ics({ ...d, at: at(d) }, lk.product(d.productId)?.name ?? "Demo")).join("") + "END:VCALENDAR\r\n";
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "dgix-demos.ics";
    a.click();
    URL.revokeObjectURL(url);
    flash(`${evs.length} demo${evs.length > 1 ? "s" : ""} added to your calendar file`);
  };

  const heroP = lk.product(hero?.productId);
  const hours = hero ? Math.max(0, Math.round((new Date(at(hero)).getTime() - now) / 3600e3)) : 0;
  const topics = [...(TOPICS[heroP?.category ?? ""] ?? ["Product walkthrough", "Your use case", "Pricing"]), ...(hero ? extra[hero.id] ?? [] : [])];
  const slots = hero || resched ? [1, 2, 3, 4, 5, 6].map((i) => { const x = new Date(); x.setUTCDate(x.getUTCDate() + Math.ceil(i / 2)); x.setUTCHours(i % 2 ? 7 : 11, 0, 0, 0); return x.toISOString(); }) : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted">{upcoming.length} upcoming · {done.filter((d) => !ratings[d.id]).length} to rate</div>
          <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">Demos</h1>
        </div>
        <Btn variant="outline" onClick={syncCal} className="self-start border-[#C9D4E8] md:self-auto">Sync to calendar</Btn>
      </div>

      {hero && heroP ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col overflow-clip rounded-lg bg-night md:flex-row">
          <div className="relative h-[200px] shrink-0 md:h-auto md:w-[340px] lg:w-[420px]">
            <Image src={thumb(heroP.visual)} alt="" fill sizes="420px" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#08152F00_40%,#08152F_100%)] md:bg-[linear-gradient(90deg,#08152F00_35%,#08152FB3_75%,#08152F_100%)]" />
            <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-lg bg-[#FFFFFFE0] px-3 py-1.5">
              <span className="size-[7px] shrink-0 rounded-full bg-red" />
              <span className="text-xs font-semibold leading-4 text-ink">{hero.status === "requested" ? "Awaiting confirmation" : hours < 1 ? "Starting now" : `Starts in ${hours} h`}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-[18px] p-6 md:p-8">
            <div className="flex flex-col gap-1.5">
              <div className="text-[13px] leading-4 text-glow-amber">{dayLabel(at(hero))} · {timeGst(at(hero)).replace(" GST", "")}–{timeGst(new Date(new Date(at(hero)).getTime() + 45 * 60e3).toISOString())}</div>
              <div className="text-[26px] font-light leading-[34px] tracking-[-0.03em] text-paper md:text-[30px] md:leading-9">{heroP.name}</div>
              <div className="text-sm leading-[18px] text-[#FFFFFFA6]">{lk.company(heroP.partnerId)?.name} · hosted by {advisor}, DGIX</div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="text-xs font-semibold leading-4 tracking-[0.06em] text-[#FFFFFF80]">WE&apos;LL SHOW YOU</div>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => <span key={t} className="rounded-lg border border-[#FFFFFF1F] bg-[#FFFFFF14] px-3 py-[7px] text-[13px] leading-4 text-paper">{t}</span>)}
                <button onClick={() => setAsking(true)} className="rounded-lg border border-dashed border-[#FFD58A80] px-3 py-[7px] text-[13px] leading-4 text-glow-amber hover:bg-[#FFD58A14]">+ Add a question</button>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => (hero.status !== "booked" ? flash("The partner hasn't confirmed this time yet") : hours > 0 ? flash(`The link opens 10 min before · ${dayLabel(at(hero))}, ${timeGst(at(hero))}`) : flash("Joining the demo room…"))}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] px-[22px] text-sm font-semibold leading-[18px] text-paper shadow-[inset_0_1px_0_#FFFFFF4D,0_12px_28px_-10px_#4C85EEE6] hover:brightness-110"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="5" width="13" height="14" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="1.75" /><path d="M16 10l5-3v10l-5-3" fill="none" stroke="#FFFFFF" strokeWidth="1.75" strokeLinejoin="round" /></svg>
                Join demo
              </button>
              <button onClick={() => setResched(hero)} className="inline-flex h-12 items-center rounded-lg border border-[#FFFFFF40] px-5 text-sm font-semibold leading-[18px] text-paper hover:bg-[#FFFFFF14]">Reschedule</button>
              <div className="ml-2 text-xs leading-4 text-[#FFFFFF80]">Link opens 10 min before</div>
            </div>
          </div>
        </motion.div>
      ) : (
        <Panel className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="text-lg text-ink">No demos booked</div>
          <div className="text-sm text-muted">Pick products from your shortlist and we&apos;ll set up a live demo.</div>
          <Btn href="/buyer/shortlist">Open shortlist</Btn>
        </Panel>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="flex flex-col gap-3 p-6 lg:flex-1 lg:basis-0" delay={0.05}>
          <div className="text-[18px] font-medium leading-[22px] text-ink">Also booked</div>
          {rest.length === 0 && <div className="text-sm text-muted">Nothing else scheduled. <Link href="/buyer/shortlist" className="text-primary">Book another demo →</Link></div>}
          {rest.map((d) => {
            const p = lk.product(d.productId);
            const pending = d.status === "requested";
            return (
              <div key={d.id} className={clsx("flex items-center gap-3.5 rounded-lg p-3.5", pending ? "border-[1.5px] border-dashed border-[#C9D4E8]" : "bg-[#F6F8FC]")}>
                <Image src={thumb(p?.visual)} alt="" width={56} height={56} className={clsx("size-14 shrink-0 rounded-lg object-cover", pending && "opacity-70")} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="truncate text-sm font-semibold leading-[18px] text-ink">{p?.name}</div>
                  <div className="truncate text-xs leading-4 text-muted">{pending ? `Requested · ${dayLabel(at(d))}, ${timeGst(at(d))}` : `${dayLabel(at(d))} · ${timeGst(at(d))}`}</div>
                </div>
                {pending ? (
                  <button onClick={() => setResched(d)} className="shrink-0 text-[13px] font-semibold leading-4 text-primary">Choose slot →</button>
                ) : (
                  <span className="shrink-0 rounded-lg bg-[#E6F4EC] px-2.5 py-[5px] text-xs font-semibold leading-4 text-[#0E6439]">Confirmed</span>
                )}
              </div>
            );
          })}
        </Panel>

        <Panel className="flex flex-col gap-3.5 p-6 lg:flex-1 lg:basis-0" delay={0.1}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[18px] font-medium leading-[22px] text-ink">How did it go?</div>
            {toRate && <div className="text-xs leading-4 text-muted">{lk.product(toRate.productId)?.name} · {new Date(toRate.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>}
          </div>
          {toRate ? (
            <>
              <div className="text-sm leading-5 text-muted">Your rating updates the shortlist ranking. Only {advisor} sees your notes.</div>
              {toRate.notes && <div className="text-[13px] italic leading-5 text-muted">“{toRate.notes}”</div>}
              <div className="flex gap-2">
                {[["👎", "Not for us"], ["🤔", "Maybe"], ["👍", "Strong fit"]].map(([e, l]) => {
                  const on = ratings[toRate.id] === l;
                  return (
                    <button
                      key={l}
                      onClick={() => { setRatings((r) => ({ ...r, [toRate.id]: l })); flash(`Rated “${l}” · ${advisor} will see it`); }}
                      className={clsx("flex flex-1 basis-0 flex-col items-center gap-1.5 rounded-lg py-3.5 transition-colors", on ? "border-[1.5px] border-primary bg-mist" : "border border-[#E3E9F4] hover:border-[#C9D4E8]")}
                    >
                      <span className="text-[22px] leading-7">{e}</span>
                      <span className={clsx("text-xs leading-4", on ? "font-semibold text-primary" : "text-muted")}>{l}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => flash("Opening recording · AI summary attached")} className="flex items-center gap-2.5 rounded-lg bg-[#F6F8FC] px-3.5 py-3 text-left hover:bg-mist">
                <svg width="18" height="18" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4" fill="none" stroke="#5B6478" strokeWidth="1.75" strokeLinejoin="round" /></svg>
                <span className="flex-1 text-[13px] leading-4 text-ink">Watch recording · 41 min</span>
                <span className="text-xs leading-4 text-muted">AI summary ready</span>
              </button>
            </>
          ) : (
            <div className="text-sm text-muted">After each demo you can rate it here.</div>
          )}
        </Panel>
      </div>

      <Dialog open={!!resched} onClose={() => setResched(null)} title={`Pick a new time · ${lk.product(resched?.productId)?.name ?? ""}`}>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <button
              key={s}
              onClick={() => { if (resched) setOverrides((o) => ({ ...o, [resched.id]: s })); flash(`Requested ${dayLabel(s)}, ${timeGst(s)} · partner will confirm`); setResched(null); }}
              className="rounded-lg border border-[#E3E9F4] px-3 py-3 text-left text-[13px] leading-4 text-ink hover:border-primary"
            >
              <div className="font-semibold">{dayLabel(s)}</div>
              <div className="text-muted">{timeGst(s)}</div>
            </button>
          ))}
        </div>
      </Dialog>

      <Dialog open={asking} onClose={() => setAsking(false)} title="Add a question">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!hero || !q.trim()) return;
            setExtra((x) => ({ ...x, [hero.id]: [...(x[hero.id] ?? []), q.trim()] }));
            setQ("");
            setAsking(false);
            flash("Question added · the partner will cover it");
          }}
          className="flex flex-col gap-3"
        >
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Can it run payroll for two entities?" className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-primary" />
          <Btn type="submit" disabled={!q.trim()}>Add question</Btn>
        </form>
      </Dialog>
      {toast}
    </div>
  );
}
