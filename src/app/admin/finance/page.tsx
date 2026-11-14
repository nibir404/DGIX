"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { Button, Chip, dateShort } from "@/components/portal/ui";
import { H1, Kicker, useFlash } from "@/components/admin/kit";

const MONTHS = [14, 22, 19, 26, 21, 30, 27, 34, 32, 38, 48.6];

export default function Finance() {
  const { db, verifyPayment, approvePayouts } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const [mode, setMode] = useState<"monthly" | "yearly">("yearly");

  const toVerify = db.invoices.filter((i) => i.status === "paid");
  const collected = db.invoices.filter((i) => i.status === "paid" || i.status === "verified").reduce((s, i) => s + i.amount, 0);
  const fee = db.payouts.reduce((s, p) => s + p.fee, 0);
  const owed = db.payouts.filter((p) => p.status !== "paid").reduce((s, p) => s + p.net, 0);
  const overdue = db.invoices.filter((i) => i.status === "overdue" || (i.status === "due" && i.due < "2026-11-13")).length;
  const scheduled = db.payouts.filter((p) => p.status === "scheduled");
  const partnerShare = Math.round((owed / (owed + fee || 1)) * 100);

  const verify = (id: string) => {
    const inv = db.invoices.find((i) => i.id === id)!;
    verifyPayment(id);
    flash(`${inv.ref} verified · payout of ${fmtMoney(Math.round(inv.amount * 0.85))} scheduled`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>Buyers pay DGIX · DGIX keeps its fee · partners get the rest</Kicker>
          <H1>Finance</H1>
        </div>
        <Button size="lg" disabled={!scheduled.length} onClick={() => { approvePayouts(scheduled.map((p) => p.id)); flash(`${scheduled.length} payout${scheduled.length > 1 ? "s" : ""} released · partners notified`); }}>
          Approve payouts ({scheduled.length})
        </Button>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white lg:grid-cols-4">
        {[
          { l: "Collected · Nov", v: fmtMoney(collected) },
          { l: "DGIX fee earned", v: fmtMoney(fee) },
          { l: "Owed to partners", v: fmtMoney(owed) },
          { l: "Overdue invoices", v: overdue, c: "text-warning" },
        ].map((s, i) => (
          <div key={s.l} className={"flex flex-col gap-2 p-6 " + (i % 2 ? "border-l border-line " : "") + (i > 1 ? "border-t border-line lg:border-t-0 " : "") + (i === 2 ? "lg:border-l" : "")}>
            <div className="text-sm text-muted">{s.l}</div>
            <div className={"text-[30px] leading-[40px] font-light tracking-tight md:text-[34px] " + (s.c ?? "")}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex justify-between"><h2 className="text-lg">Payouts</h2><span className="text-xs text-muted">Buyer has paid</span></div>
          <motion.ul layout>
            {toVerify.map((inv) => {
              const pr = db.projects.find((p) => p.id === inv.projectId);
              return (
                <motion.li layout key={inv.id} className="flex items-center gap-3 border-t border-line py-3.5">
                  <div className="min-w-0 flex-1"><div className="text-[15px]">{L.company(pr?.partnerId)?.name}</div><div className="text-xs text-muted">{inv.ref} · {fmtMoney(inv.amount)} paid {inv.paidOn && dateShort(inv.paidOn)}</div></div>
                  <Button size="sm" onClick={() => verify(inv.id)}>Verify payment</Button>
                </motion.li>
              );
            })}
            {db.payouts.map((po) => {
              const st = po.status;
              return (
                <motion.li layout key={po.id} className="flex items-center gap-3 border-t border-line py-3.5">
                  <div className="min-w-0 flex-1"><div className="text-[15px]">{L.company(po.partnerId)?.name}</div><div className="text-xs text-muted">{fmtMoney(po.gross)} − 15% fee · {dateShort(po.date)}</div></div>
                  <Chip tone={st === "paid" ? "success" : st === "scheduled" ? "info" : "draft"} dot={false}>{st.replace("_", " ")}</Chip>
                  <span className="w-16 text-right text-[15px] font-semibold">{fmtMoney(po.net)}</span>
                </motion.li>
              );
            })}
          </motion.ul>
        </section>

        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex justify-between"><h2 className="text-lg">Buyer invoices</h2><span className="text-xs text-muted">This month</span></div>
          <ul>
            {db.invoices.map((inv) => {
              const b = L.company(inv.buyerId);
              const late = inv.status === "overdue";
              return (
                <li key={inv.id} className="flex items-center gap-3 border-t border-line py-3.5">
                  <div className="min-w-0 flex-1"><div className="text-[15px]">{b?.name}</div>
                    <div className={"text-xs " + (late ? "text-warning" : inv.status === "due" ? "text-muted" : "text-success")}>{inv.ref} · {inv.status === "due" ? `due ${dateShort(inv.due)}` : late ? "overdue" : `${inv.status} ${inv.paidOn ? dateShort(inv.paidOn) : ""}`}</div></div>
                  {inv.status === "due" || late ? <Button size="sm" variant="outline" onClick={() => flash(`Reminder sent to ${b?.name}`)}>Remind</Button> : null}
                  <span className="w-16 text-right text-[15px] font-semibold">{fmtMoney(inv.amount)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="text-sm text-muted">Collected this year</div><div className="text-[34px] font-light">$312,400</div></div>
            <div className="flex rounded-lg bg-mist p-1 text-[13px]">
              {(["monthly", "yearly"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={"rounded-lg px-3 py-1 capitalize " + (mode === m ? "bg-primary text-white" : "text-muted")}>{m}</button>)}
            </div>
          </div>
          <div className="mt-4 flex h-[160px] items-end gap-2">
            {(mode === "yearly" ? MONTHS : MONTHS.slice(-6)).map((v, i, arr) => (
              <motion.div key={mode + i} initial={{ height: 0 }} animate={{ height: `${(v / 50) * 100}%` }} transition={{ delay: i * 0.04, duration: 0.5 }}
                className={"flex-1 rounded-lg " + (i === arr.length - 1 ? "bg-[linear-gradient(180deg,#4C85EE,#1E4FA3)]" : "bg-[linear-gradient(180deg,#E2EAF7,#F4F7FC)]")} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px]"><span className="text-subtle">{mode === "yearly" ? "Jan" : "Jun"}</span><span className="font-semibold">Nov · $48.6k</span></div>
        </section>
        <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
          <div className="text-sm text-haze">Where November&apos;s money goes</div>
          <div className="mt-8 flex items-baseline gap-2"><span className="text-[56px] font-extralight leading-none">{partnerShare}%</span><span className="text-sm text-haze">to partners</span></div>
          <div className="mt-8 flex gap-1.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${partnerShare}%` }} className="h-3 rounded-lg bg-sky" />
            <div className="h-3 flex-1 rounded-lg bg-glow-amber" />
          </div>
          <div className="mt-8 flex justify-between text-xs"><span className="text-sky">● Partners {fmtMoney(owed)}</span><span className="text-glow-amber">● DGIX {fmtMoney(fee)}</span></div>
        </section>
      </div>
      {toast}
    </div>
  );
}
