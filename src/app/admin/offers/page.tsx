"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { Button, dateShort } from "@/components/portal/ui";
import { H1, Kicker, useFlash } from "@/components/admin/kit";
import { Dialog } from "@/components/buyer/kit";
import { Icon } from "@/components/ui/Icon";
import type { BuyerRequest, Offer, Product } from "@/lib/types";
import { downloadCsv, stamp } from "@/lib/csv";
import { CsvButton } from "@/components/portal/CsvButton";

const COLS: { key: Offer["status"]; label: string }[] = [
  { key: "draft", label: "Drafting" },
  { key: "sent", label: "Sent to buyer" },
  { key: "accepted", label: "Signed" },
  { key: "declined", label: "Lost" },
];
const FIELD = "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";
const SPLIT = [
  { title: "Setup & data migration", pct: 0.3 },
  { title: "Configuration & training", pct: 0.4 },
  { title: "Go-live & handover", pct: 0.3 },
];
type Draft = { request: BuyerRequest; product: Product; price: string; sla: string; warranty: string; exit: string };

export default function Offers() {
  const { db, sendOffer, createOffer } = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const L = useLookup();
  const { flash, toast } = useFlash();
  const short = (c?: string) => (c === "United Arab Emirates" ? "UAE" : c);
  const open = db.offers.filter((o) => o.status === "draft" || o.status === "sent").reduce((s, o) => s + o.price, 0);
  const signed = db.offers.filter((o) => o.status === "accepted").reduce((s, o) => s + o.price, 0);
  const totalPipeline = open + signed;
  const decided = db.offers.filter((o) => o.status === "accepted" || o.status === "declined");
  const win = decided.length ? Math.round((decided.filter((o) => o.status === "accepted").length / decided.length) * 100) : 0;

  const nowMs = Date.now();
  const startLabel = new Date(nowMs - 11 * 7 * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const pipeSeries = Array.from({ length: 12 }, (_, idx) => {
    const cutoff = nowMs - (11 - idx) * 7 * 864e5;
    return db.offers
      .filter((o) => {
        if (o.status === "declined") return false;
        const iso = o.sentAt ?? o.signedAt;
        if (!iso) return idx === 11;
        return new Date(iso).getTime() <= cutoff;
      })
      .reduce((s, o) => s + o.price, 0);
  });
  const W = 400, H = 120, max = Math.max(1, ...pipeSeries);
  const pts = pipeSeries.map((v, i) => `${(i / 11) * W},${H - (v / max) * (H - 12) - 6}`);

  // Requests that reached shortlist or demo but have no offer yet
  const ready = db.requests
    .filter((r) => (r.status === "shortlist_sent" || r.status === "demo") && !db.offers.some((o) => o.requestId === r.id && o.status !== "declined"))
    .map((r) => {
      const demos = db.demos.filter((d) => d.requestId === r.id);
      const rated = demos.find((d) => d.rating === "Strong fit") ?? demos.find((d) => d.rating === "Maybe") ?? demos.find((d) => d.status === "done") ?? demos[0];
      const productId = rated?.productId ?? [...r.shortlist].sort((a, b) => b.fit - a.fit)[0]?.productId;
      return { r, demo: rated, product: L.product(productId) };
    })
    .filter((x): x is { r: BuyerRequest; demo: (typeof x)["demo"]; product: Product } => !!x.product)
    .sort((a, b) => (b.demo?.rating === "Strong fit" ? 1 : 0) - (a.demo?.rating === "Strong fit" ? 1 : 0));

  const price = Number(draft?.price.replace(/[^0-9]/g, "")) || 0;
  const submit = (send: boolean) => {
    if (!draft || price <= 0) return;
    const milestones = SPLIT.map((m, i) => ({ title: m.title, amount: i === SPLIT.length - 1 ? price - SPLIT.slice(0, -1).reduce((t, x) => t + Math.round(price * x.pct), 0) : Math.round(price * m.pct) }));
    const o = createOffer({ requestId: draft.request.id, productId: draft.product.id, price, sla: draft.sla, warranty: draft.warranty, exit: draft.exit, milestones, send });
    flash(send ? `${o.ref} sent to ${L.company(draft.request.buyerId)?.name}` : `${o.ref} saved as a draft`);
    setDraft(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>Every deal: buyer signs with DGIX, DGIX signs with the partner</Kicker>
          <H1>Offers &amp; contracts</H1>
        </div>
        <CsvButton
          className="self-start md:self-auto"
          label="Download offers"
          onClick={() => {
            downloadCsv(
              `dgix-offers-${stamp()}`,
              ["Offer", "Buyer", "Country", "Product", "Status", "Price (USD)", "Milestones", "Demo rating", "Sent", "Signed", "Decline reason"],
              db.offers.map((o) => {
                const b = L.company(o.buyerId);
                return [o.ref, b?.name ?? "", b?.country ?? "", L.product(o.productId)?.name ?? "", o.status, o.price, o.milestones.length, o.rating ?? "", o.sentAt ?? "", o.signedAt ?? "", o.declineReason ?? ""];
              }),
            );
            flash(`${db.offers.length} offers downloaded`);
          }}
        />
      </div>

      {ready.length > 0 && (
        <section className="flex flex-col gap-3 rounded-lg bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Ready for an offer</h2>
            <span className="text-xs text-muted">{ready.length} request{ready.length > 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {ready.map(({ r, demo, product }) => {
              const b = L.company(r.buyerId);
              const rating = demo?.rating;
              return (
                <div key={r.id} className="flex flex-col gap-3 py-4 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={"flex size-10 shrink-0 items-center justify-center rounded-lg " + (rating === "Strong fit" ? "bg-[#E6F4EC] text-success" : "bg-mist text-primary")}>
                      <Icon name={rating === "Strong fit" ? "thumbsUp" : demo ? "video" : "file"} size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold">{b?.name} · {r.title}</div>
                      <div className="text-xs text-muted">
                        {product.name} · from {fmtMoney(product.priceFrom)} · {rating ? `demo rated “${rating}”` : demo ? (demo.status === "done" ? "demo held, not rated yet" : "demo booked") : "shortlist sent, no demo yet"}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={rating === "Strong fit" ? "primary" : "soft"}
                    className="self-start sm:self-auto"
                    onClick={() => setDraft({ request: r, product, price: String(product.priceFrom), sla: "99.5% uptime, 4h response", warranty: "12 months", exit: "Data export in 30 days, no lock-in" })}
                  >
                    Draft offer
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
                    {col.key === "declined" && o.declineReason && <div className="text-xs leading-4 text-muted">“{o.declineReason}”</div>}
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
          <div className="flex justify-between"><h2 className="text-lg">Pipeline value · 12 weeks</h2><span className="text-xs text-muted">{db.offers.filter((o) => o.status !== "declined").length} active deals</span></div>
          <svg viewBox={`0 0 ${W} ${H + 10}`} className="mt-4 h-[150px] w-full overflow-visible" preserveAspectRatio="none">
            <defs><linearGradient id="pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BD8" stopOpacity=".25" /><stop offset="1" stopColor="#2F6BD8" stopOpacity="0" /></linearGradient></defs>
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#EEF3FB" />)}
            <motion.path d={`M${pts.join(" L")} L${W},${H + 10} L0,${H + 10} Z`} fill="url(#pv)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
            <motion.path d={`M${pts.join(" L")}`} fill="none" stroke="#1E4FA3" strokeWidth={2} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
          </svg>
          <div className="mt-2 flex justify-between text-[11px]"><span className="text-subtle">{startLabel}</span><span className="font-semibold">Now · {fmtMoney(totalPipeline)}</span></div>
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
      <Dialog open={!!draft} onClose={() => setDraft(null)} title="Draft offer">
        {draft && (
          <form onSubmit={(e) => { e.preventDefault(); submit(true); }} className="flex flex-col gap-4">
            <div className="rounded-lg bg-[#F5F8FC] px-4 py-3 text-sm">
              <div className="font-semibold text-ink">{L.company(draft.request.buyerId)?.name}</div>
              <div className="text-muted">{draft.product.name} · {draft.request.title}</div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Total price (USD)</span>
              <input inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={FIELD} />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">SLA</span>
                <input value={draft.sla} onChange={(e) => setDraft({ ...draft, sla: e.target.value })} className={FIELD} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Warranty</span>
                <input value={draft.warranty} onChange={(e) => setDraft({ ...draft, warranty: e.target.value })} className={FIELD} />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Exit terms</span>
              <input value={draft.exit} onChange={(e) => setDraft({ ...draft, exit: e.target.value })} className={FIELD} />
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium">Milestones · paid on acceptance</span>
              {SPLIT.map((m) => (
                <div key={m.title} className="flex justify-between gap-3 rounded-lg border border-line px-3.5 py-2.5 text-sm">
                  <span>{m.title}</span>
                  <span className="shrink-0 text-muted">{Math.round(m.pct * 100)}% · {fmtMoney(Math.round(price * m.pct))}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <Button variant="outline" disabled={price <= 0} onClick={() => submit(false)}>Save draft</Button>
              <Button type="submit" disabled={price <= 0}>Send to buyer</Button>
            </div>
          </form>
        )}
      </Dialog>
      {toast}
    </div>
  );
}
