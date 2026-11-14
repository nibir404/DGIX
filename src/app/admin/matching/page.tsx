"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { Button, Empty } from "@/components/portal/ui";
import { Checkbox, H1, useFlash } from "@/components/admin/kit";

const tile: Record<string, string> = {
  healthcare: "bg-[linear-gradient(135deg,#BDE7E4,#7CC9C4)]",
  hr: "bg-[linear-gradient(135deg,#7FB6FF,#1E4FA3)]",
  erp: "bg-[linear-gradient(135deg,#FFD58A,#F6A11A)]",
};

export default function MatchingDesk() {
  const { db, confirmShortlist } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const queue = db.requests.filter((r) => r.status === "matching");
  const [activeId, setActiveId] = useState<string | undefined>(queue[0]?.id);
  const req = queue.find((r) => r.id === activeId) ?? queue[0];
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [note, setNote] = useState("");

  const ranked = useMemo(() => (req ? [...req.shortlist].sort((a, b) => b.fit - a.fit) : []), [req]);

  useEffect(() => {
    if (!req) return;
    setPicked(Object.fromEntries(ranked.map((s, i) => [s.productId, i < 2])));
    const [a, b] = ranked.map((s) => L.product(s.productId)?.name);
    setNote(a ? `${a} fits best: ${ranked[0].strengths.join(", ")}.${b ? ` ${b} is cheaper but ${ranked[1].gaps[0]?.toLowerCase() ?? "a close second"}.` : ""}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req?.id]);

  if (!req) return (<div className="flex flex-col gap-6"><H1>Matching desk</H1><Empty title="No requests waiting" body="New buyer requests land here after AI ranking." action={<Button href="/admin">Back to Today</Button>} />{toast}</div>);

  const buyer = L.company(req.buyerId);
  const n = Object.values(picked).filter(Boolean).length;
  const visible = showAll ? ranked : ranked.slice(0, 3);
  const hidden = ranked.length - visible.length;
  const dueH = req.dueAt ? Math.max(1, Math.round((new Date(req.dueAt).getTime() - Date.parse("2026-11-13T13:00:00Z")) / 3600e3)) : null;

  const send = () => {
    confirmShortlist(req.id);
    flash(`Shortlist sent to ${buyer?.name}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {queue.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {queue.map((r) => (
            <button key={r.id} onClick={() => setActiveId(r.id)} className={"rounded-lg px-3 py-1.5 text-[13px] " + (r.id === req.id ? "bg-night text-white" : "bg-white text-ink")}>{r.title}</button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-[14px] text-danger">{req.ref.replace("REQ-202611-", "REQ-")}{dueH ? ` · due in ${dueH} h` : ""}</div>
          <H1>{req.title} · {buyer?.country === "United Arab Emirates" ? "UAE" : buyer?.country}</H1>
        </div>
        <div className="flex flex-wrap gap-2">
          {[`${req.users} users`, req.need.split(",")[0].slice(0, 28), "Arabic + English", `Before ${req.goLive}`].map((t) => (
            <span key={t} className="rounded-full bg-white px-3 py-2 text-[13px]">{t}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-lg">AI ranking · {ranked.length} verified products</h2>
            <span className="text-xs text-muted">Pick up to 3 for the buyer</span>
          </div>
          <motion.ul initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.06 } } }}>
            {visible.map((s) => {
              const p = L.product(s.productId);
              return (
                <motion.li key={s.productId} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }} className="flex items-center gap-4 border-t border-line py-4">
                  <Checkbox checked={!!picked[s.productId]} label={p?.name} onChange={() => setPicked((x) => ({ ...x, [s.productId]: !x[s.productId] && n < 3 ? true : false }))} />
                  <div className={"size-12 shrink-0 rounded-lg " + (tile[p?.category ?? ""] ?? tile.hr)} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium">{p?.name}</div>
                    <div className={"truncate text-xs " + (s.gaps.length && s.fit < 85 ? "text-warning" : "text-muted")}>
                      {s.gaps.length && s.fit < 85 ? "⚠ " + s.gaps.join(" · ") : `${p?.metricValue} ${p?.metricLabel.toLowerCase()} · ${s.strengths.join(" · ")}`}
                    </div>
                  </div>
                  <span className="w-10 text-center text-[22px] font-light">{s.fit}</span>
                  <span className="hidden w-20 text-right text-[13px] sm:block">${Math.round((p?.priceFrom ?? 0) / 1000)}k / yr</span>
                </motion.li>
              );
            })}
            {hidden > 0 && (
              <li className="flex items-center gap-4 border-t border-line py-4">
                <Checkbox checked={false} onChange={() => setShowAll(true)} label="Show more" />
                <div className="size-12 shrink-0 rounded-lg bg-mist" />
                <span className="flex-1 text-[15px] text-muted">+ {hidden} more below {visible[visible.length - 1].fit}</span>
                <button onClick={() => setShowAll(true)} className="text-[13px] font-semibold text-primary">Show</button>
              </li>
            )}
          </motion.ul>
        </section>

        <section className="rounded-lg bg-white p-6">
          <h2 className="mb-4 text-lg">Note to buyer</h2>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} className="w-full resize-none rounded-lg bg-mist/60 p-4 text-[15px] leading-[21px] outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="mt-4 flex items-center gap-2.5 text-[13px]">
            <Checkbox checked={checked} onChange={() => setChecked((c) => !c)} label="Checked" />
            I checked price, SLA and country fit
          </label>
          <Button size="lg" className="mt-4 w-full" disabled={!checked || n === 0} onClick={send}>Send {n} product{n === 1 ? "" : "s"} to buyer</Button>
        </section>
      </div>
      {toast}
    </div>
  );
}
