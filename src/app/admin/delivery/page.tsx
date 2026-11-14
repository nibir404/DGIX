"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { Button, Chip, dateShort } from "@/components/portal/ui";
import { Bar, H1, Kicker, useFlash } from "@/components/admin/kit";

export default function Delivery() {
  const { db } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const [openId, setOpenId] = useState<string | null>(null);
  const risk = db.projects.find((p) => p.health !== "on_track");
  const short = (c?: string) => (c === "United Arab Emirates" ? "UAE" : c);
  const today = Date.now();
  const start = today - 45 * 864e5;
  const end = today + 45 * 864e5;
  const pos = (t: number) => Math.max(0, Math.min(100, ((t - start) / (end - start)) * 100));
  const axisMonths = [0, 1, 2, 3].map((i) =>
    new Date(start + (i / 3) * (end - start)).toLocaleDateString("en-GB", { month: "short" }),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>{db.projects.length} live project{db.projects.length === 1 ? "" : "s"} · DGIX is accountable to every buyer</Kicker>
        <H1>Delivery</H1>
      </div>

      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b border-line text-xs font-medium uppercase tracking-[0.06em] text-subtle"><th className="pb-3">Project</th><th className="pb-3">Progress</th><th className="pb-3">Next</th><th className="pb-3">On-time</th><th className="pb-3 text-right">Status</th></tr></thead>
          <tbody>
            {db.projects.map((p) => {
              const done = p.milestones.filter((m) => m.status === "done").length;
              const pct = Math.round((done / Math.max(1, p.milestones.length)) * 100);
              const next = p.milestones.find((m) => m.status !== "done");
              const b = L.company(p.buyerId);
              const late = p.health !== "on_track";
              const overdueCount = p.milestones.filter((m) => m.status !== "done" && Date.parse(m.due) < today).length;
              const onTimePct = Math.round(((p.milestones.length - overdueCount) / Math.max(1, p.milestones.length)) * 100);
              return (
                <Fragment key={p.id}>
                  <tr onClick={() => setOpenId(openId === p.id ? null : p.id)} className="cursor-pointer border-b border-[#F1F4FA] hover:bg-mist/40">
                    <td className="py-3.5 pr-4"><div className="text-[15px] font-medium">{L.product(p.productId)?.name} · {b?.name}, {short(b?.country)}</div><div className="text-xs text-muted">{L.company(p.partnerId)?.name}</div></td>
                    <td className="pr-4"><div className="flex items-center gap-3"><Bar className="w-[150px]" value={pct} color={late ? "#E52A2A" : "#1E4FA3"} track={late ? "#FBE7E7" : "#EEF3FB"} /><span>{pct}%</span></div></td>
                    <td className={"pr-4 " + (late ? "text-danger" : "")}>{late ? `${p.daysLate ?? 0} days late` : next ? (next.status === "in_review" ? "Buyer review" : `${next.title.split(" ·")[0]} · ${dateShort(next.due)}`) : "Support"}</td>
                    <td className="pr-4">{onTimePct}%</td>
                    <td className="text-right">{late ? <Chip tone="danger" dot={false}>At risk</Chip> : next ? <Chip tone="success" dot={false}>On track</Chip> : <Chip tone="info" dot={false}>Live</Chip>}</td>
                  </tr>
                  {openId === p.id && (
                    <tr key={p.id + "-m"}><td colSpan={5} className="pb-4">
                      <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 gap-2 rounded-lg bg-mist/50 p-4 sm:grid-cols-2">
                        {p.milestones.map((m) => (
                          <li key={m.id} className="flex items-center justify-between gap-3 text-[13px]"><span>{m.title}</span><span className="flex items-center gap-2 text-muted">{dateShort(m.due)} <Chip tone={m.status === "done" ? "success" : m.status === "in_review" ? "warning" : m.status === "in_progress" ? "info" : "draft"}>{m.status.replace("_", " ")}</Chip></span></li>
                        ))}
                      </motion.ul>
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        {risk ? (
          <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
            <div className="text-sm text-[#FF8A8A]">Escalation · {L.product(risk.productId)?.name}, {short(L.company(risk.buyerId)?.country)}</div>
            <p className="mt-3 text-[22px] leading-[28px] font-light">
              {risk.milestones.filter((m) => m.status !== "done" && Date.parse(m.due) < today).length || 1} milestone(s) past target date. Follow up with partner for updated schedule.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="white" onClick={() => flash(`Recovery plan requested from ${L.company(risk.partnerId)?.name}`)}>Request recovery plan</Button>
              <Button variant="outline" className="!border-white/30 !bg-transparent !text-white" onClick={() => flash(`Update sent to ${L.company(risk.buyerId)?.name}`)}>Update buyer</Button>
            </div>
          </section>
        ) : <div />}
        <section className="rounded-lg bg-white p-6">
          <h2 className="mb-3 text-lg">Open tickets across projects</h2>
          {(["urgent", "high", "normal"] as const).map((pr, i) => {
            const n = db.cases.filter((c) => c.status !== "resolved" && c.priority === pr).length;
            return <div key={pr} className="flex justify-between py-1.5 text-[15px]"><span>P{i + 1} {pr === "urgent" ? "critical" : pr}</span><span className={"font-semibold " + (i === 1 && n ? "text-warning" : i === 0 && n ? "text-danger" : "")}>{n}</span></div>;
          })}
        </section>
      </div>

      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <div className="flex justify-between"><h2 className="text-lg">Rollout timeline</h2><span className="text-xs text-muted">90-day window</span></div>
        <div className="relative mt-6 min-w-[560px]">
          <div className="absolute bottom-6 top-0 z-10 w-px bg-amber" style={{ left: `calc(160px + (100% - 160px) * ${pos(today) / 100})` }}>
            <span className="absolute -top-5 -translate-x-1/2 rounded-lg bg-amber px-2 py-0.5 text-[10px] text-white">Today</span>
          </div>
          {db.projects.map((p, i) => {
            const s = Math.min(...p.milestones.map((m) => Date.parse(m.due))) - 20 * 864e5;
            const e = Math.max(...p.milestones.map((m) => Date.parse(m.due)));
            const late = p.health !== "on_track";
            return (
              <div key={p.id} className="flex h-[34px] items-center">
                <span className="w-[160px] shrink-0 truncate text-[13px]">{L.product(p.productId)?.name.split(" ")[0]} · {short(L.company(p.buyerId)?.country)}</span>
                <div className="relative h-[22px] flex-1">
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.08, duration: 0.6 }} style={{ left: `${pos(s)}%`, width: `${Math.max(4, pos(e) - pos(s))}%`, transformOrigin: "left" }}
                    className={"absolute h-full rounded-lg " + (late ? "bg-red" : "bg-primary")} />
                </div>
              </div>
            );
          })}
          <div className="ml-[160px] mt-2 flex justify-between text-[11px] text-subtle">
            {axisMonths.map((m, idx) => <span key={idx}>{m}</span>)}
          </div>
        </div>
      </section>
      {toast}
    </div>
  );
}
