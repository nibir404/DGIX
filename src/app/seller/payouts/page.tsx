"use client";

import clsx from "clsx";
import { fmtMoney } from "@/lib/seed";
import type { Payout } from "@/lib/types";
import { Empty } from "@/components/portal/ui";
import { Bars, Head, NIGHT_BANNER, Panel, Pill, dayMonth, lastSixMonths, orderRef, useSeller } from "@/components/seller/kit";

export default function PayoutsPage() {
  const { db, payouts } = useSeller();

  const label = (p: Payout) => {
    const inv = db.invoices.find((i) => i.id === p.invoiceId);
    const pr = db.projects.find((x) => x.id === inv?.projectId);
    if (!inv || !pr) return p.payoutChannel ? `Settled order · ${p.payoutChannel.toUpperCase()}` : "Settled order payout";
    const idx = pr.milestones.findIndex((m) => m.title === inv.milestone);
    return `${orderRef(db, pr)} · ${idx >= 0 ? `Milestone ${idx + 1}` : inv.milestone}`;
  };

  const next = payouts.filter((p) => p.status !== "paid").sort((a, b) => a.date.localeCompare(b.date))[0];
  const year = String(new Date().getFullYear());
  const paidYear = payouts.filter((p) => p.status === "paid" && p.date.startsWith(year)).reduce((s, p) => s + p.net, 0);
  const months = lastSixMonths(payouts);

  return (
    <div className="flex flex-col gap-5">
      <Head kicker="Double-entry ledger verified · SWIFT / Local Bank Settlement · BR-17" title="Payouts" />

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="flex flex-col gap-[18px] rounded-lg bg-night p-6 md:p-7 lg:grow-[1.4] lg:basis-0" style={{ backgroundImage: NIGHT_BANNER }}>
          {next ? (
            <>
              <div className="text-[13px] leading-4 text-glow-amber">
                Next payout · {dayMonth(next.date)} · {next.status === "scheduled" ? "Awaiting 4-Eyes Finance Release" : "Awaiting Buyer Settlement"}
              </div>
              <div className="text-[44px] leading-[52px] md:text-[56px] md:leading-[64px] font-light tracking-[-0.05em] text-paper">{fmtMoney(next.net)}</div>
              <div className="flex flex-col gap-[10px] border-t border-[#FFFFFF1F] pt-4">
                <Row l={`Buyer settled · ${label(next)}`} r={fmtMoney(next.gross)} />
                <Row l={`DGIX margin & gateway fee`} r={`− ${fmtMoney(next.fee)}`} />
                {typeof next.disputeHold === "number" && next.disputeHold > 0 && (
                  <Row l="Dispute-hold reserve (escrow)" r={`− ${fmtMoney(next.disputeHold)}`} />
                )}
                <Row l="Partner payable release" r={fmtMoney(next.net)} strong />
              </div>
            </>
          ) : (
            <div className="text-[15px] text-paper">No payouts pending approval.</div>
          )}
          <div className="text-xs leading-[18px] text-[#FFFFFF8C]">
            Partner payouts are strictly gated on settled buyer payments (BR-17) and require two independent DGIX Finance actors (Maker + Approver) before disbursement.
          </div>
        </Panel>

        <Panel className="flex flex-col gap-[14px] bg-paper p-6 lg:grow lg:basis-0">
          <div className="text-[13px] leading-4 text-muted">Released this year</div>
          <div className="text-[40px] font-light leading-12 tracking-tight text-ink">{fmtMoney(paidYear)}</div>
          <Bars values={months.map((m) => m.value)} radius={6} className="min-h-[90px] grow basis-0 !gap-2" />
        </Panel>
      </div>

      <Panel className="flex flex-col bg-paper px-4 py-2 md:px-6">
        {payouts.length === 0 && <Empty title="No payouts yet" body="Payouts appear once a buyer settles an invoice and Finance schedules disbursement." />}
        {payouts.length > 0 && (
          <div className="flex gap-3 border-b border-[#F1F4FA] py-[14px] text-xs font-semibold leading-4 tracking-[0.06em] text-[#9AA2B4]">
            <div className="grow-[1.2] basis-0">DATE</div>
            <div className="hidden grow-2 basis-0 sm:block">FOR</div>
            <div className="grow basis-0">STATUS</div>
            <div className="grow basis-0 text-right">NET PAYABLE</div>
          </div>
        )}
        {payouts.map((p, i) => (
          <div key={p.id} className={clsx("flex flex-wrap items-center gap-3 py-[15px] sm:flex-nowrap", i < payouts.length - 1 && "border-b border-[#F1F4FA]")}>
            <div className="grow-[1.2] basis-0 text-sm leading-[18px] text-ink">
              {dayMonth(p.date)}
              <div className="text-xs text-muted sm:hidden">{label(p)}</div>
            </div>
            <div className="hidden grow-2 basis-0 text-sm leading-[18px] text-ink sm:block">{label(p)}</div>
            <div className="grow basis-0">
              {p.status === "paid" ? (
                <Pill tone="success">Released</Pill>
              ) : p.status === "scheduled" ? (
                <Pill tone="info">Pending 4-Eyes Approval</Pill>
              ) : (
                <Pill tone="warning">Awaiting settlement</Pill>
              )}
            </div>
            <div className={clsx("grow basis-0 text-right text-[15px] leading-[18px] text-ink", p.status !== "paid" && "font-semibold")}>
              {fmtMoney(p.net)}
              <div className="text-[11px] font-normal text-muted">
                Gross {fmtMoney(p.gross)} − Fee {fmtMoney(p.fee)}
              </div>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Row({ l, r, strong }: { l: string; r: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <div className={clsx("text-sm leading-[18px]", strong ? "font-semibold text-paper" : "text-[#FFFFFFB3]")}>{l}</div>
      <div className={clsx("shrink-0 text-sm leading-[18px]", strong ? "font-semibold text-[#7FE0AE]" : "text-paper")}>{r}</div>
    </div>
  );
}
