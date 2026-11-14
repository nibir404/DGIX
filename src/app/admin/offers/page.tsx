"use client";

import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { Button, dateShort } from "@/components/portal/ui";
import { H1, Kicker, useFlash } from "@/components/admin/kit";
import type { Offer } from "@/lib/types";

const COLS: { key: Offer["status"]; label: string }[] = [
  { key: "draft", label: "Drafting" },
  { key: "sent", label: "Sent to buyer" },
  { key: "accepted", label: "Signed" },
  { key: "declined", label: "Lost" },
];
const PIPE = [180, 190, 186, 215, 210, 240, 236, 272, 268, 310, 322, 360];

export default function Offers() {
  const { db, sendOffer } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const short = (c?: string) => (c === "United Arab Emirates" ? "UAE" : c);
  const open = db.offers.filter((o) => o.status === "draft" || o.status === "sent").reduce((s, o) => s + o.price, 0);
  const signed = db.offers.filter((o) => o.status === "accepted").reduce((s, o) => s + o.price, 0);
  const decided = db.offers.filter((o) => o.status === "accepted" || o.status === "declined");
  const win = decided.length ? Math.round((decided.filter((o) => o.status === "accepted").length / decided.length) * 100) : 0;

  const W = 400, H = 120, max = 380;
  const pts = PIPE.map((v, i) => `${(i / 11) * W},${H - (v / max) * H}`);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>Every deal: buyer signs with DGIX, DGIX signs with the partner</Kicker>
        <H1>Offers &amp; contracts</H1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLS.map((col) => {
          const list = db.offers.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex justify-between px-1 text-[13px]"><span className="font-semibold">{col.label}</span><span className="text-muted">{list.length}</span></div>
              {list.map((o, i) => {
                const b = L.company(o.buyerId);
                return (
                  <motion.div layout key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={"flex flex-col gap-1 rounded-lg p-4 " + (col.key === "declined" ? "bg-[#E9EDF4] text-muted" : "bg-white")}>
                    <div className="text-[15px] font-semibold">{b?.name} · {short(b?.country)}</div>
                    <div className="text-xs text-muted">{L.product(o.productId)?.name} · {o.ref}</div>
                    <div className={"mt-2 text-[18px] " + (col.key === "declined" ? "text-subtle" : "")}>{fmtMoney(o.price)}</div>
                    {col.key === "sent" && o.sentAt && <div className="text-xs text-warning">Sent {dateShort(o.sentAt)} · expires {dateShort(new Date(new Date(o.sentAt).getTime() + 17 * 864e5).toISOString())}</div>}
                    {col.key === "accepted" && o.signedAt && <div className="text-xs text-success">Signed {dateShort(o.signedAt)}</div>}
                    {col.key === "draft" && (
                      <Button size="sm" className="mt-2 self-start" onClick={() => { sendOffer(o.id); flash(`${o.ref} sent to ${b?.name}`); }}>Send to buyer</Button>
                    )}
                  </motion.div>
                );
              })}
              {!list.length && <div className="rounded-lg border border-dashed border-line p-4 text-xs text-muted">Nothing here</div>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-lg bg-white sm:grid-cols-2">
        <div className="p-6"><div className="text-sm text-muted">Open offers</div><div className="text-[34px] font-light">{fmtMoney(open)}</div></div>
        <div className="border-t border-line p-6 sm:border-l sm:border-t-0"><div className="text-sm text-muted">Signed this quarter</div><div className="text-[34px] font-light">{fmtMoney(signed)}</div></div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg bg-white p-6">
          <div className="flex justify-between"><h2 className="text-lg">Pipeline value · 12 weeks</h2><span className="text-xs text-success">▲ 22%</span></div>
          <svg viewBox={`0 0 ${W} ${H + 10}`} className="mt-4 h-[150px] w-full overflow-visible" preserveAspectRatio="none">
            <defs><linearGradient id="pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BD8" stopOpacity=".25" /><stop offset="1" stopColor="#2F6BD8" stopOpacity="0" /></linearGradient></defs>
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#EEF3FB" />)}
            <motion.path d={`M${pts.join(" L")} L${W},${H + 10} L0,${H + 10} Z`} fill="url(#pv)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
            <motion.path d={`M${pts.join(" L")}`} fill="none" stroke="#1E4FA3" strokeWidth={2} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
          </svg>
          <div className="mt-2 flex justify-between text-[11px]"><span className="text-subtle">25 Aug</span><span className="font-semibold">Now · $412k</span></div>
        </section>
        <section className="rounded-lg bg-white p-6">
          <h2 className="text-lg">Win rate</h2>
          <div className="relative mx-auto mt-4 size-[160px]">
            <svg viewBox="0 0 160 160" className="-rotate-90">
              <circle cx={80} cy={80} r={68} stroke="#EEF3FB" strokeWidth={14} fill="none" />
              <motion.circle cx={80} cy={80} r={68} stroke="#1E4FA3" strokeWidth={14} fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: win / 100 }} transition={{ duration: 1 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[34px] font-light">{win}%</span><span className="text-[11px] text-muted">{decided.filter((o) => o.status === "accepted").length} of {decided.length} decided</span></div>
          </div>
        </section>
      </div>
      {toast}
    </div>
  );
}
