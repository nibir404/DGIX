"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import type { Licence, Product } from "@/lib/types";
import { Btn, Dialog, Panel, daysUntil, dayMonth, money, useBuyer, useFlash } from "@/components/buyer/kit";

const thumb = (v?: Product["visual"]) => (v === "people" ? "/media/buyer-req-hr.webp" : v === "bag" ? "/media/buyer-req-pos.webp" : "/media/buyer-req-ai.webp");
const STORES = ["Dubai Mall", "Mall of the Emirates", "Yas Mall", "City Centre Deira", "Head office", "Ibn Battuta", "Dubai Hills", "Al Wahda", "Sharjah City Centre", "Marina Mall", "Dragon Mart", "Al Ghurair"];
const SITES = ["Head office", "Riyadh branch", "Jeddah branch", "Dammam branch"];

/** Spread a licence's used seats across sites (seed has no per-site data). */
function bySite(l: Licence, retail: boolean) {
  const names = retail ? STORES : SITES;
  const n = names.length;
  const base = Math.floor(l.seats / n);
  let extra = l.seats - base * n;
  let used = l.used;
  return names.map((name, i) => {
    const cap = base + (extra-- > 0 ? 1 : 0);
    const u = Math.min(cap, Math.max(0, i === n - 1 ? used : Math.min(used, cap - (i % 4 === 3 ? 2 : i % 3 === 1 ? 1 : 0))));
    used -= u;
    return { name, cap, used: u };
  });
}

export default function Licences() {
  const b = useBuyer();
  const lk = useLookup();
  const { flash, toast } = useFlash();
  const [added, setAdded] = useState<Record<string, number>>({});
  const [renewed, setRenewed] = useState<Record<string, boolean>>({});
  const [seatDlg, setSeatDlg] = useState<Licence | null>(null);
  const [seatN, setSeatN] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const [freed, setFreed] = useState<Record<string, number>>({});

  const lic = b.licences.map((l) => ({ ...l, seats: l.seats + (added[l.id] ?? 0) }));
  const pending = b.offers.filter((o) => (o.status === "draft" || o.status === "sent") && !lic.some((l) => l.productId === o.productId));
  const renewSoon = [...lic].sort((a, c) => a.renews.localeCompare(c.renews));
  const renewal = renewSoon.find((l) => !renewed[l.id]) ?? renewSoon[0];
  const perSeat = (l: Licence) => Math.round((lk.product(l.productId)?.priceFrom ?? 0) / Math.max(1, b.licences.find((x) => x.id === l.id)?.seats ?? l.seats));
  const main = lic.find((l) => lk.product(l.productId)?.category === "retail") ?? lic[0];
  const sites = main ? bySite(main, lk.product(main.productId)?.category === "retail") : [];
  const shown = showAll ? sites : sites.slice(0, 5);
  const upcomingCount = lic.filter((l) => daysUntil(l.renews) < 60 && !renewed[l.id]).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted">{lic.length + pending.length} products · {upcomingCount} renewal{upcomingCount === 1 ? "" : "s"} coming up</div>
          <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">Licences</h1>
        </div>
        <Btn onClick={() => main && (setSeatDlg(main), setSeatN(5))} disabled={!main} className="self-start shadow-[0_10px_24px_-10px_#1E4FA3CC] md:self-auto">Add seats</Btn>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {lic.map((l, i) => {
          const p = lk.product(l.productId);
          const pct = Math.round((l.used / l.seats) * 100);
          const left = l.seats - l.used;
          return (
            <Panel key={l.id} className="flex min-w-0 flex-col overflow-clip sm:flex-row" delay={i * 0.05}>
              <div className="relative h-[140px] shrink-0 sm:h-auto sm:w-[200px]"><Image src={thumb(p?.visual)} alt="" fill sizes="200px" className="object-cover" /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-3.5 p-[22px]">
                <div className="flex justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <div className="text-[18px] font-semibold leading-[22px] text-ink">{p?.name}</div>
                    <div className="text-xs leading-4 text-muted">Renews {dayMonth(l.renews)} · {money(perSeat(l))} / seat / yr</div>
                  </div>
                  <span className={clsx("h-fit shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold leading-4", renewed[l.id] ? "bg-[#E6F4EC] text-[#0E6439]" : l.status === "expiring" ? "bg-[#FFF3DC] text-warning" : "bg-[#E6F4EC] text-[#0E6439]")}>{renewed[l.id] ? "Renewed" : l.status === "expiring" ? "Expiring" : "Active"}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-[40px] font-light leading-12 tracking-tight text-ink">{l.used}</div>
                  <div className="text-sm leading-[18px] text-muted">of {l.seats} seats used</div>
                </div>
                <div className="flex h-2.5 rounded-lg bg-mist">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="rounded-lg bg-[linear-gradient(90deg,#7FB6FF_0%,#1E4FA3_100%)]" />
                </div>
                <div className={clsx("text-xs leading-4", left <= 10 ? "text-warning" : "text-muted")}>
                  {left <= 10 ? `${left} seats left. You may need more soon.` : `${left} seats free.`}{" "}
                  <button onClick={() => { setSeatDlg(l); setSeatN(5); }} className="font-semibold text-primary">Add seats</button>
                </div>
              </div>
            </Panel>
          );
        })}
        {pending.map((o, i) => {
          const p = lk.product(o.productId);
          const req = b.requests.find((r) => r.id === o.requestId);
          return (
            <Panel key={o.id} className="flex min-w-0 flex-col overflow-clip sm:flex-row" delay={(lic.length + i) * 0.05}>
              <div className="relative h-[140px] shrink-0 opacity-85 sm:h-auto sm:w-[200px]"><Image src={thumb(p?.visual)} alt="" fill sizes="200px" className="object-cover" /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-3.5 p-[22px]">
                <div className="flex justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="text-[18px] font-semibold leading-[22px] text-ink">{p?.name}</div>
                    <div className="text-xs leading-4 text-muted">Starts after you sign the offer</div>
                  </div>
                  <span className="h-fit shrink-0 rounded-lg bg-mist px-2.5 py-1 text-xs font-semibold leading-4 text-primary">Pending</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-[40px] font-light leading-12 tracking-tight text-ink">{req?.users ?? "—"}</div>
                  <div className="text-sm leading-[18px] text-muted">employees covered</div>
                </div>
                <div className="h-2.5 rounded-lg [background:repeating-linear-gradient(135deg,#C9D4E8_0px,#C9D4E8_2px,#EEF3FB_2px,#EEF3FB_7px)]" />
                <Link href={`/buyer/offers?offer=${o.id}`} className="text-xs leading-4 text-primary">Review offer →</Link>
              </div>
            </Panel>
          );
        })}
      </div>

      {main && (
        <div className="flex flex-col gap-4 lg:flex-row">
          <Panel className="flex min-w-0 flex-col px-5 py-2 sm:px-6 lg:grow-[1.6] lg:basis-0" delay={0.1}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F4FA] py-3.5">
              <div className="text-base font-medium leading-5 text-ink">Seats by {lk.product(main.productId)?.category === "retail" ? "store" : "site"} · {lk.product(main.productId)?.name}</div>
              <div className="text-xs leading-4 text-muted">Assign or free a seat in one click</div>
            </div>
            {shown.map((s) => {
              const used = Math.max(0, s.used - (freed[s.name] ?? 0));
              const pct = Math.round((used / Math.max(1, s.cap)) * 100);
              return (
                <div key={s.name} className="group flex items-center gap-3.5 border-b border-[#F1F4FA] py-[13px]">
                  <div className="w-[110px] shrink-0 truncate text-sm leading-[18px] text-ink sm:w-[200px]">{s.name}</div>
                  <div className="flex h-2 min-w-0 flex-1 rounded-lg bg-mist">
                    <motion.div animate={{ width: `${pct}%` }} className={clsx("rounded-lg", pct < 80 ? "bg-sky" : "bg-primary")} />
                  </div>
                  <button
                    onClick={() => { if (used > 0) { setFreed((f) => ({ ...f, [s.name]: (f[s.name] ?? 0) + 1 })); flash(`1 seat freed at ${s.name}`); } }}
                    title="Free a seat"
                    className="w-[60px] shrink-0 text-right text-[13px] leading-4 text-ink hover:text-primary"
                  >
                    {used}/{s.cap}
                  </button>
                </div>
              );
            })}
            {sites.length > 5 && (
              <div className="flex items-center gap-3.5 py-[13px]">
                <div className="flex-1 text-sm leading-[18px] text-muted">{showAll ? "" : `+ ${sites.length - 5} more`}</div>
                <button onClick={() => setShowAll((v) => !v)} className="text-[13px] font-semibold leading-4 text-primary">{showAll ? "Show less" : "View all"}</button>
              </div>
            )}
          </Panel>

          {renewal && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex min-h-[220px] flex-col justify-between gap-3 overflow-clip rounded-lg bg-night p-6 lg:grow lg:basis-0"
              style={{ backgroundImage: "radial-gradient(ellipse 70% 80% at 100% 0%, #2F6BD8 0%, #2F6BD800 65%), radial-gradient(ellipse 50% 60% at 0% 100%, #F6A11A4D 0%, #F6A11A00 70%)" }}
            >
              <div className="text-[13px] leading-4 text-glow-amber">{renewed[renewal.id] ? "Renewed · thank you" : `Renewal in ${Math.max(0, daysUntil(renewal.renews))} days`}</div>
              <div className="flex flex-col gap-1.5">
                <div className="text-[40px] font-light leading-12 tracking-tight text-paper">{money(perSeat(renewal) * renewal.seats)}</div>
                <div className="text-[13px] leading-4 text-[#FFFFFFA6]">{lk.product(renewal.productId)?.name} · {renewal.seats} seats · {dayMonth(renewal.renews)}</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  disabled={renewed[renewal.id]}
                  onClick={() => { setRenewed((r) => ({ ...r, [renewal.id]: true })); flash(`${lk.product(renewal.productId)?.name} renewal confirmed · invoice will follow`); }}
                  className="inline-flex h-[42px] items-center rounded-lg bg-paper px-[18px] text-[13px] font-semibold leading-4 text-night hover:bg-mist disabled:opacity-60"
                >
                  {renewed[renewal.id] ? "Renewed" : "Renew"}
                </button>
                <button onClick={() => { setSeatDlg(renewal); setSeatN(5); }} className="inline-flex h-[42px] items-center rounded-lg border border-[#FFFFFF4D] px-[18px] text-[13px] font-semibold leading-4 text-paper hover:bg-[#FFFFFF14]">Change seats</button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {lic.length === 0 && pending.length === 0 && (
        <Panel className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="text-lg text-ink">No licences yet</div>
          <Btn href="/buyer/requests/new">Start a request</Btn>
        </Panel>
      )}

      <Dialog open={!!seatDlg} onClose={() => setSeatDlg(null)} title={`Seats · ${lk.product(seatDlg?.productId)?.name ?? ""}`}>
        {seatDlg && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-[#F6F8FC] p-4">
              <button onClick={() => setSeatN((n) => Math.max(-(seatDlg.seats - seatDlg.used), n - 1))} className="flex size-10 items-center justify-center rounded-full bg-paper text-xl text-ink">−</button>
              <div className="text-center">
                <div className="text-3xl font-light text-ink">{seatN > 0 ? `+${seatN}` : seatN}</div>
                <div className="text-xs text-muted">{seatDlg.seats + seatN} seats total</div>
              </div>
              <button onClick={() => setSeatN((n) => n + 1)} className="flex size-10 items-center justify-center rounded-full bg-paper text-xl text-ink">+</button>
            </div>
            <div className="text-sm text-muted">{seatN >= 0 ? "Adds" : "Removes"} {money(Math.abs(seatN) * perSeat(seatDlg))} a year, prorated to the renewal date.</div>
            <Btn
              size="lg"
              disabled={seatN === 0}
              onClick={() => { setAdded((a) => ({ ...a, [seatDlg.id]: (a[seatDlg.id] ?? 0) + seatN })); flash(`${Math.abs(seatN)} seat${Math.abs(seatN) > 1 ? "s" : ""} ${seatN > 0 ? "added" : "removed"} · ${lk.product(seatDlg.productId)?.name}`); setSeatDlg(null); }}
            >
              Confirm change
            </Btn>
          </div>
        )}
      </Dialog>
      {toast}
    </div>
  );
}
