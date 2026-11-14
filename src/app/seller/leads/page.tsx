"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Empty } from "@/components/portal/ui";
import { HATCH, Head, NIGHT_CARD, Panel, Pill, anonBuyer, dayMonth, useFlash, useSeller } from "@/components/seller/kit";

type Lead = { id: string; kind: "requested" | "booked" | "done" | "shortlisted"; fit?: number; buyer: string; sub: string; foot?: string; demoId?: string; at?: string; product: string };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const gst = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });

export default function LeadsPage() {
  const { db, demos, products, productIds, confirmDemo, openCase, focus } = useSeller();
  const { flash, toast } = useFlash();

  const fitFor = (productId: string, requestId?: string) => db.requests.find((r) => r.id === requestId)?.shortlist.find((s) => s.productId === productId)?.fit;
  const reqFor = (requestId?: string) => db.requests.find((r) => r.id === requestId);
  const pname = (id: string) => products.find((p) => p.id === id)?.name ?? "";

  const leads: Lead[] = demos
    .filter((d) => d.status !== "cancelled")
    .map((d) => {
      const r = reqFor(d.requestId);
      const kind = d.status === "requested" ? "requested" : d.status === "booked" ? "booked" : "done";
      return {
        id: d.id,
        demoId: d.id,
        at: d.at,
        kind,
        fit: fitFor(d.productId, d.requestId),
        product: pname(d.productId),
        buyer: anonBuyer(db.companies.find((c) => c.id === d.buyerId)),
        sub: r ? `${r.users} staff · ${r.need.split(".")[0].toLowerCase().replace(/^\w/, (x) => x.toUpperCase())} · budget ${r.budget}` : d.notes ?? pname(d.productId),
        foot: kind === "booked" ? `Demo booked · ${DAYS[new Date(d.at).getUTCDay()]} ${dayMonth(d.at)}, ${gst(d.at)} GST` : kind === "done" ? (db.offers.some((o) => o.requestId === d.requestId && o.productId === d.productId) ? "DGIX is preparing the offer" : `${d.questions} buyer questions · DGIX follows up`) : undefined,
      } as Lead;
    });
  // Shortlisted with no demo yet
  db.requests.forEach((r) =>
    r.shortlist
      .filter((s) => productIds.has(s.productId) && s.confirmed && !demos.some((d) => d.productId === s.productId && d.requestId === r.id))
      .forEach((s) =>
        leads.push({ id: r.id + s.productId, kind: "shortlisted", fit: s.fit, product: pname(s.productId), buyer: anonBuyer(db.companies.find((c) => c.id === r.buyerId)), sub: `${r.users} staff · go-live ${r.goLive}`, foot: "Waiting for buyer to pick a demo time" }),
      ),
  );
  const order = { requested: 0, booked: 1, shortlisted: 2, done: 3 };
  leads.sort((a, b) => order[a.kind] - order[b.kind]);

  // Funnel
  const matched = db.requests.flatMap((r) => r.shortlist.filter((s) => productIds.has(s.productId)));
  const funnel = [
    { label: "Matched", value: matched.length, bar: { background: HATCH } },
    { label: "Shortlisted", value: matched.filter((s) => s.confirmed).length, bar: { background: "repeating-linear-gradient(135deg, rgb(76,133,238) 0px, rgb(76,133,238) 2px, rgb(199,218,251) 2px, rgb(199,218,251) 6px)" } },
    { label: "Demos", value: demos.filter((d) => d.status === "booked" || d.status === "done").length, bar: { background: "#4C85EE" } },
    { label: "Won", value: db.projects.filter((p) => productIds.has(p.productId)).length, bar: undefined },
  ];
  const fmax = Math.max(...funnel.map((f) => f.value), 1);

  return (
    <div className="flex flex-col gap-5">
      <Head kicker="Buyers matched to you by DGIX · names shared after the demo" title="Leads & demos" />

      {leads.length === 0 ? (
        <Empty title="No leads yet" body="When DGIX matches a buyer to one of your products, it shows up here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((l, i) => {
            const dark = l.kind === "requested";
            return (
              <Panel key={l.id} className={clsx("flex flex-col gap-[14px] p-6", dark ? "bg-night" : "bg-paper")} style={dark ? { backgroundImage: NIGHT_CARD } : undefined}>
                <div className="flex items-center justify-between gap-2">
                  {l.kind === "requested" && <Pill tone="amber">New · demo requested</Pill>}
                  {l.kind === "booked" && <Pill tone="info">Demo booked</Pill>}
                  {l.kind === "shortlisted" && <Pill tone="info">Shortlisted</Pill>}
                  {l.kind === "done" && <Pill tone="success">Demo done</Pill>}
                  <div className={clsx("text-xs leading-4", dark ? "text-[#FFFFFF99]" : "text-muted")}>{l.fit ? `${l.fit} fit` : l.product}</div>
                </div>
                <div className={clsx("text-[22px] font-medium leading-7", dark ? "text-paper" : "text-ink")}>{l.buyer}</div>
                <div className={clsx("text-[13px] leading-[19px]", dark ? "text-[#FFFFFFB3]" : "text-muted")}>
                  {l.product} · {l.sub}
                </div>
                {dark && l.demoId && l.at ? (
                  <motion.div layout className="mt-[6px] flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        confirmDemo(l.demoId!);
                        flash(`Demo confirmed · ${DAYS[new Date(l.at!).getUTCDay()]} ${gst(l.at!)} GST`);
                      }}
                      className="inline-flex h-10 items-center rounded-lg bg-paper px-[18px] text-[13px] font-semibold leading-4 text-night hover:bg-mist"
                    >
                      Confirm {DAYS[new Date(l.at).getUTCDay()]} {gst(l.at)}
                    </button>
                    <button
                      onClick={() => {
                        openCase(`Reschedule demo · ${l.product}`, `Partner asked for another time for the ${l.buyer} demo (currently ${dayMonth(l.at!)} ${gst(l.at!)} GST).`);
                        flash("Asked DGIX to propose another time");
                      }}
                      className="inline-flex h-10 items-center rounded-lg border border-[#FFFFFF4D] px-4 text-[13px] font-semibold leading-4 text-paper hover:border-paper"
                    >
                      Other time
                    </button>
                  </motion.div>
                ) : (
                  l.foot && <div className={clsx("mt-[6px] text-[13px] leading-4", l.kind === "done" ? "text-primary" : "text-muted")}>{l.foot}</div>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <Panel className="flex flex-col bg-paper px-4 py-2 md:px-6">
        <div className="flex justify-between gap-3 border-b border-[#F1F4FA] py-[14px]">
          <div className="text-base font-medium leading-5 text-ink">Your demo funnel · last 90 days</div>
          <div className="text-xs leading-4 text-muted">{products.length === 1 ? focus?.name : `${products.length} products`}</div>
        </div>
        {funnel.map((f, i) => (
          <div key={f.label} className={clsx("flex items-center gap-[14px] py-[14px]", i < funnel.length - 1 && "border-b border-[#F1F4FA]")}>
            <div className="w-[90px] shrink-0 text-sm leading-[18px] text-ink sm:w-[160px]">{f.label}</div>
            <div className="flex h-[22px] grow basis-0 rounded-lg bg-mist">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(f.value / fmax) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} style={f.bar} className={clsx("rounded-lg", !f.bar && "bg-primary")} />
            </div>
            <div className="w-10 shrink-0 text-right text-sm font-semibold leading-[18px] text-ink">{f.value}</div>
          </div>
        ))}
      </Panel>
      {toast}
    </div>
  );
}
