"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { GATES } from "@/lib/seed";
import { Button } from "@/components/portal/ui";
import { Bar, H1, Kicker, useFlash } from "@/components/admin/kit";

const gateName = (g: string) => `${g} · ${GATES.find((x) => x.id === g)?.name ?? ""}`;
const FUNNEL = [21, 16, 13, 9, 8, 8];

export default function ProductReview() {
  const { db, approveCheck } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const rows = db.products
    .filter((p) => p.status === "in_review" || p.waitingOn)
    .sort((a, b) => b.gate.localeCompare(a.gate) || L.score(b.id) - L.score(a.id));
  const [sel, setSel] = useState(rows[0]?.id);
  const p = rows.find((r) => r.id === sel) ?? rows[0];
  const open = p?.checks.filter((c) => c.score < c.max) ?? [];
  const listed = db.products.filter((x) => x.status === "listed").length;

  const approve = (key: string) => {
    if (!p) return;
    const c = p.checks.find((x) => x.key === key)!;
    const total = L.score(p.id) + (c.max - c.score);
    approveCheck(p.id, key);
    flash(total === 100 ? `${p.name} hit 100/100 — now listed` : `${c.label} approved · ${total}/100`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>Partner products going through the 100-point gate</Kicker>
        <H1>Product review</H1>
      </div>

      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium uppercase tracking-[0.06em] text-subtle">
              <th className="pb-3">Product</th><th className="pb-3">Gate</th><th className="pb-3">Score</th><th className="pb-3">Waiting on</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = L.score(r.id);
              const active = r.id === p?.id;
              return (
                <tr key={r.id} className={"border-b border-[#F1F4FA] last:border-0 " + (active ? "bg-mist/60" : "")}>
                  <td className="py-3.5 pl-0 pr-4"><div className="text-[15px] font-medium">{r.name}</div><div className="text-xs text-muted">{r.status === "listed" ? `Re-review · major release v${r.version.split(".")[0]}` : L.company(r.partnerId)?.name}</div></td>
                  <td className="pr-4">{gateName(r.gate)}</td>
                  <td className="pr-4"><div className="flex items-center gap-3"><Bar className="w-[110px]" value={s} color={s === 100 ? "#14804A" : s >= 90 ? "#1E4FA3" : "#7FB6FF"} /><span>{s}</span></div></td>
                  <td className={"pr-4 " + (r.waitingOn?.startsWith("You") ? "text-primary" : "text-warning")}>{r.waitingOn ?? (s === 100 ? "Listed" : "—")}</td>
                  <td className="text-right"><Button size="sm" variant={active ? "primary" : "outline"} onClick={() => setSel(r.id)}>Open</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <section className="rounded-lg bg-white p-6">
          <h2 className="mb-4 text-lg">{p?.name} · open items</h2>
          {open.length === 0 && <div className="rounded-lg bg-[#E7F5EE] px-4 py-3 text-sm text-success">All checks at 100/100 · listed.</div>}
          <motion.div layout className="flex flex-col gap-3">
            {open.map((c) => (
              <motion.div layout key={c.key} className={"flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 " + (c.note?.includes("Uploaded") || c.note?.includes("Answered") ? "bg-mist" : "bg-[#FDF4E3]")}>
                <span className="text-[15px]">{c.label}</span>
                <span className="flex items-center gap-3 text-xs font-medium">
                  <span className={c.note?.includes("Uploaded") ? "text-primary" : "text-warning"}>{c.note ?? "Open"} · {c.max - c.score} pts</span>
                  <button onClick={() => approve(c.key)} className="rounded-lg bg-white px-3 py-1 font-semibold text-primary hover:bg-primary hover:text-white">Approve</button>
                </span>
              </motion.div>
            ))}
          </motion.div>
          {open.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => approve(open[open.length - 1].key)}>Approve {open[open.length - 1].label.split(" ")[0].toLowerCase()}</Button>
              <Button size="lg" variant="outline" onClick={() => flash(`Reminder sent to ${L.company(p!.partnerId)?.name}`)}>Remind partner</Button>
            </div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
          <div className="text-sm text-haze">Gate pass rate · this quarter</div>
          <div className="mt-3 text-[56px] leading-[60px] font-extralight">{Math.round((listed / 21) * 100)}%</div>
          <p className="mt-3 text-sm text-haze">{listed} of 21 applicants reached 100/100. Most fail on security and IP proof.</p>
        </section>
      </div>

      <section className="rounded-lg bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg">Gate funnel · this quarter</h2>
          <span className="text-xs text-muted">21 entered PG0 → {FUNNEL[5]} cleared PG5</span>
        </div>
        <div className="mt-4 grid grid-cols-3 items-end gap-2 sm:grid-cols-6">
          {GATES.map((g, i) => (
            <div key={g.id} className="flex flex-col items-center gap-2">
              <span className={"text-sm font-semibold " + (i === 3 ? "text-warning" : "")}>{FUNNEL[i]}</span>
              <motion.div
                initial={{ height: 0 }} animate={{ height: (FUNNEL[i] / 21) * 96 }} transition={{ duration: 0.7, delay: i * 0.06 }}
                className={"w-full rounded-lg " + (i < 2 ? "hatch-light" : i === 2 ? "hatch" : i === 3 ? "bg-[linear-gradient(180deg,#FFD58A,#F6A11A)]" : i === 4 ? "bg-cobalt" : "bg-primary")}
              />
              <span className={"text-[11px] " + (i === 3 ? "font-semibold text-warning" : "text-muted")}>{g.id} · {g.name}</span>
            </div>
          ))}
        </div>
      </section>
      {toast}
    </div>
  );
}
