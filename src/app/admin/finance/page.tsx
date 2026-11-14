"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, makeIdempotencyKey } from "@/lib/api";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { Button, Chip, dateShort } from "@/components/portal/ui";
import { H1, Kicker, useFlash } from "@/components/admin/kit";

export default function Finance() {
  const { db, live, authSession, verifyPayment, approvePayouts, refreshLive } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const [mode, setMode] = useState<"monthly" | "yearly">("yearly");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [fxCcy, setFxCcy] = useState("AED");
  const [fxRate, setFxRate] = useState("0.27229408");
  const [journalLines, setJournalLines] = useState<Array<Record<string, unknown>> | null>(null);
  const [journalIdView, setJournalIdView] = useState<string | null>(null);

  const toVerify = db.invoices.filter((i) => i.status === "paid");
  const settledInvoices = db.invoices.filter((i) => i.status === "paid" || i.status === "verified");
  const collected = settledInvoices.reduce((s, i) => s + i.amount, 0);
  const fee = db.payouts.reduce((s, p) => s + p.fee, 0);
  const owed = db.payouts.filter((p) => p.status !== "paid").reduce((s, p) => s + p.net, 0);
  const releasedTotal = db.payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.net, 0);
  const scheduled = db.payouts.filter((p) => p.status === "scheduled");
  const partnerNetTotal = owed + releasedTotal;
  const partnerShare = partnerNetTotal + fee > 0 ? Math.round((partnerNetTotal / (partnerNetTotal + fee)) * 100) : 0;
  const pendingPriceLists = live.priceLists.filter((pl) => String(pl.status) !== "approved");
  const monthlySeries = Array.from({ length: 12 }, (_, idx) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - idx));
    const ym = d.toISOString().slice(0, 7);
    return settledInvoices
      .filter((inv) => (inv.paidOn ?? inv.due).startsWith(ym))
      .reduce((s, inv) => s + inv.amount, 0);
  });
  const chartValues = mode === "yearly" ? monthlySeries : monthlySeries.slice(-6);
  const chartMax = Math.max(1, ...chartValues);

  const approvePriceList = async (plId: string) => {
    setBusyId(plId);
    try {
      await apiFetch(`/bff/v1/commercial/pricing/price-lists/${plId}/approve`, { method: "POST" });
      await refreshLive();
      flash("Price list approved");
    } catch (err) {
      flash(err instanceof Error ? err.message : "A second authorised finance officer must approve this price list.");
    } finally {
      setBusyId(null);
    }
  };

  const settlePayment = async (paymentId: string) => {
    setBusyId(paymentId);
    try {
      await apiFetch(`/bff/v1/finance/payments/${paymentId}/settle`, {
        method: "POST",
        headers: { "Idempotency-Key": makeIdempotencyKey() },
        body: JSON.stringify({ gateway_fee_amount: "250.00" }),
      });
      await refreshLive();
      flash("Payment settled and posted to ledger");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Settlement failed");
    } finally {
      setBusyId(null);
    }
  };

  const inspectJournal = async (jid: string) => {
    setBusyId(jid);
    try {
      const res = await apiFetch<Record<string, unknown>>(`/bff/v1/finance/ledger/journals/${jid}`);
      const entries = Array.isArray(res.entries)
        ? (res.entries as Array<Record<string, unknown>>)
        : Array.isArray(res)
          ? (res as Array<Record<string, unknown>>)
          : [];
      setJournalIdView(jid);
      setJournalLines(entries);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not load journal entries");
    } finally {
      setBusyId(null);
    }
  };

  const saveFx = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("fx");
    try {
      await apiFetch(`/bff/v1/finance/fx-rates/${fxCcy.trim().toUpperCase()}`, {
        method: "PUT",
        body: JSON.stringify({ rate_to_usd: fxRate.trim(), active: true }),
      });
      await refreshLive();
      flash(`FX rate ${fxCcy.toUpperCase()} → USD updated to ${fxRate}`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "FX update requires finance role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>Invoices, settlements, partner payouts &amp; FX rates</Kicker>
          <H1>Finance &amp; Ledger</H1>
        </div>
        <Button
          size="lg"
          disabled={!scheduled.length}
          onClick={() => {
            approvePayouts(scheduled.map((p) => p.id));
            flash(`Payout release submitted (${scheduled.length})`);
          }}
        >
          Release scheduled payouts ({scheduled.length})
        </Button>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white lg:grid-cols-4">
        {[
          { l: "Collected & Settled", v: fmtMoney(collected) },
          { l: "DGIX Margin & Fees", v: fmtMoney(fee) },
          { l: "Partner Payable Queue", v: fmtMoney(owed) },
          { l: "Pending Price Lists", v: pendingPriceLists.length, c: pendingPriceLists.length ? "text-warning" : "" },
        ].map((s, i) => (
          <div key={s.l} className={"flex flex-col gap-2 p-6 " + (i % 2 ? "border-l border-line " : "") + (i > 1 ? "border-t border-line lg:border-t-0 " : "") + (i === 2 ? "lg:border-l" : "")}>
            <div className="text-sm text-muted">{s.l}</div>
            <div className={"text-[30px] leading-[40px] font-light tracking-tight md:text-[34px] " + (s.c ?? "")}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* PriceList Approval & FX Table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg">Product price lists</h2>
            <span className="text-xs text-muted">Two-person finance approval</span>
          </div>
          <div className="flex max-h-[220px] flex-col divide-y divide-line overflow-y-auto">
            {live.priceLists.map((pl) => {
              const plId = String(pl.price_list_id);
              const prod = live.products.find((p) => String(p.product_id) === String(pl.product_id));
              const approved = String(pl.status) === "approved";
              const sameMaker = Boolean(authSession?.user.sub && String(pl.created_by) === authSession.user.sub);
              return (
                <div key={plId} className="flex items-center justify-between gap-2 py-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">
                      {String(prod?.name ?? "Product")} · {String(pl.edition)} · {String(pl.country_code)}
                    </div>
                    <div className="text-muted">
                      Unit Price: ${String(pl.unit_price)} {String(pl.currency)} / {String(pl.billing_period)}
                    </div>
                  </div>
                  {approved ? (
                    <Chip tone="success">Approved</Chip>
                  ) : (
                    <Button
                      size="sm"
                      variant={sameMaker ? "outline" : "primary"}
                      disabled={sameMaker || busyId === plId}
                      onClick={() => void approvePriceList(plId)}
                    >
                      {sameMaker ? "Awaiting second approval" : "Approve price list"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg">Exchange rates</h2>
            <span className="text-xs text-muted">Locked per invoice &amp; settlement</span>
          </div>
          <form onSubmit={saveFx} className="mb-3 flex gap-2">
            <input
              value={fxCcy}
              onChange={(e) => setFxCcy(e.target.value)}
              maxLength={3}
              placeholder="CCY"
              className="h-9 w-20 rounded border border-line px-2.5 font-mono text-xs uppercase"
            />
            <input
              value={fxRate}
              onChange={(e) => setFxRate(e.target.value)}
              placeholder="Rate to USD"
              className="h-9 flex-1 rounded border border-line px-2.5 font-mono text-xs"
            />
            <Button type="submit" size="sm" disabled={busyId === "fx"}>
              Update FX
            </Button>
          </form>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {live.fxRates.map((fx) => (
              <div key={String(fx.currency)} className="rounded-lg border border-line bg-[#F9FBFF] p-2.5 text-xs">
                <div className="font-mono font-semibold text-ink">1 {String(fx.currency)}</div>
                <div className="font-mono text-muted">${Number(fx.rate_to_usd).toFixed(4)} USD</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Live Payments, Settlement & Journal Inspector */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex justify-between">
            <h2 className="text-lg">Captured payments &amp; partner payouts</h2>
            <span className="text-xs text-muted">Settled funds only</span>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {live.payments.map((pay) => {
              const pid = String(pay.payment_id);
              const st = String(pay.status);
              const jid = pay.settlement_journal_id ? String(pay.settlement_journal_id) : pay.capture_journal_id ? String(pay.capture_journal_id) : null;
              return (
                <div key={pid} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs">
                  <div>
                    <div className="font-medium text-ink">
                      Payment {pid.slice(0, 8)} · ${String(pay.amount)} {String(pay.currency)} ({String(pay.gateway)})
                    </div>
                    <div className="text-muted">Status: {st}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {st === "captured" && (
                      <Button size="sm" disabled={busyId === pid} onClick={() => void settlePayment(pid)}>
                        Settle
                      </Button>
                    )}
                    {jid && (
                      <Button size="sm" variant="outline" disabled={busyId === jid} onClick={() => void inspectJournal(jid)}>
                        View journal
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {toVerify.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                <div>
                  <div className="font-medium text-ink">{inv.ref} · {fmtMoney(inv.amount)}</div>
                  <div className="text-muted">Captured · ready for settlement</div>
                </div>
                <Button size="sm" onClick={() => verifyPayment(inv.id)}>Settle</Button>
              </div>
            ))}
            {db.payouts.map((po) => {
              const st = po.status;
              return (
                <div key={po.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{L.company(po.partnerId)?.name}</div>
                    <div className="text-xs text-muted">
                      Gross {fmtMoney(po.gross)} − Fee {fmtMoney(po.fee)} · {dateShort(po.date)}
                    </div>
                  </div>
                  <Chip tone={st === "paid" ? "success" : st === "scheduled" ? "info" : "draft"} dot={false}>
                    {st === "paid" ? "Released" : st === "scheduled" ? "Pending release" : st}
                  </Chip>
                  <span className="w-20 text-right text-sm font-semibold">{fmtMoney(po.net)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex justify-between">
            <h2 className="text-lg">
              {journalIdView ? `Ledger journal · ${journalIdView.slice(0, 8)}` : "Buyer e-invoices"}
            </h2>
            {journalIdView && (
              <button onClick={() => { setJournalIdView(null); setJournalLines(null); }} className="text-xs font-semibold text-primary">
                ← Back to invoices
              </button>
            )}
          </div>
          {journalLines ? (
            <div className="flex flex-col gap-2">
              <div className="rounded bg-[#E7F5EE] px-3 py-2 text-xs font-medium text-success">
                Balanced ledger journal verified (Debits = Credits)
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="py-2">Account Code</th>
                    <th className="py-2 text-right">Debit</th>
                    <th className="py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {journalLines.map((ln, idx) => (
                    <tr key={idx} className="border-b border-[#F1F4FA]">
                      <td className="py-2 font-mono text-[11px] text-ink">{String(ln.account_code)}</td>
                      <td className="py-2 text-right font-mono">{String(ln.debit)}</td>
                      <td className="py-2 text-right font-mono">{String(ln.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul>
              {db.invoices.map((inv) => {
                const b = L.company(inv.buyerId);
                const late = inv.status === "overdue";
                return (
                  <li key={inv.id} className="flex items-center gap-3 border-t border-line py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px]">{b?.name}</div>
                      <div className={"text-xs " + (late ? "text-warning" : inv.status === "due" ? "text-muted" : "text-success")}>
                        {inv.ref} {inv.einvoiceClearanceId ? `· ${inv.einvoiceClearanceId}` : ""} · {inv.status}
                      </div>
                    </div>
                    <span className="w-20 text-right text-[15px] font-semibold">{fmtMoney(inv.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="text-sm text-muted">Gross Merchandise Volume</div><div className="text-[34px] font-light">{fmtMoney(collected)}</div></div>
            <div className="flex rounded-lg bg-mist p-1 text-[13px]">
              {(["monthly", "yearly"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={"rounded-lg px-3 py-1 capitalize " + (mode === m ? "bg-primary text-white" : "text-muted")}>{m}</button>)}
            </div>
          </div>
          <div className="mt-4 flex h-[150px] items-end gap-2">
            {chartValues.map((v, i, arr) => (
              <motion.div key={mode + i} initial={{ height: 0 }} animate={{ height: `${Math.max(4, (v / chartMax) * 100)}%` }} transition={{ delay: i * 0.04, duration: 0.5 }}
                className={"flex-1 rounded-lg " + (i === arr.length - 1 ? "bg-[linear-gradient(180deg,#4C85EE,#1E4FA3)]" : "bg-[linear-gradient(180deg,#E2EAF7,#F4F7FC)]")} />
            ))}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
          <div className="text-sm text-haze">Net Revenue Split</div>
          <div className="mt-6 flex items-baseline gap-2"><span className="text-[52px] font-extralight leading-none">{partnerShare}%</span><span className="text-sm text-haze">to software partners</span></div>
          <div className="mt-6 flex gap-1.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${partnerShare}%` }} className="h-3 rounded-lg bg-sky" />
            <div className="h-3 flex-1 rounded-lg bg-glow-amber" />
          </div>
          <div className="mt-6 flex justify-between text-xs"><span className="text-sky">● Partners {fmtMoney(partnerNetTotal)}</span><span className="text-glow-amber">● DGIX {fmtMoney(fee)}</span></div>
        </section>
      </div>
      {toast}
    </div>
  );
}
