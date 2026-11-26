"use client";

import { useState } from "react";
import clsx from "clsx";
import { fmtMoney } from "@/lib/seed";
import type { Payout } from "@/lib/types";
import { Empty } from "@/components/portal/ui";
import { Dialog } from "@/components/buyer/kit";
import { Bars, Head, NIGHT_BANNER, Panel, Pill, dayMonth, lastSixMonths, orderRef, useSeller } from "@/components/seller/kit";

export default function PayoutsPage() {
  const { db, company, payouts, createPayoutQueryLive } = useSeller();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [inquiryQuestion, setInquiryQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
      <Head kicker="Bank settlements & statements" title="Payouts" />

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="flex flex-col gap-[18px] rounded-lg bg-night p-6 md:p-7 lg:grow-[1.4] lg:basis-0" style={{ backgroundImage: NIGHT_BANNER }}>
          {next ? (
            <>
              <div className="text-[13px] leading-4 text-glow-amber">
                Next payout · {dayMonth(next.date)} · {next.status === "scheduled" ? "Pending finance release" : "Awaiting buyer settlement"}
              </div>
              <div className="text-[44px] leading-[52px] md:text-[56px] md:leading-[64px] font-light tracking-[-0.05em] text-paper">{fmtMoney(next.net)}</div>
              <div className="flex flex-col gap-[10px] border-t border-[#FFFFFF1F] pt-4">
                <Row l={`Buyer settled · ${label(next)}`} r={fmtMoney(next.gross)} />
                <Row l={`DGIX margin & processing fee`} r={`− ${fmtMoney(next.fee)}`} />
                {typeof next.disputeHold === "number" && next.disputeHold > 0 && (
                  <Row l="Contractual reserve" r={`− ${fmtMoney(next.disputeHold)}`} />
                )}
                <Row l="Net partner payout" r={fmtMoney(next.net)} strong />
              </div>
            </>
          ) : (
            <div className="text-[15px] text-paper">No payouts pending approval.</div>
          )}
          <div className="text-xs leading-[18px] text-[#FFFFFF8C]">
            Partner payouts are scheduled once buyer invoice settlement clears and DGIX Finance completes disbursement sign-off.
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
                <Pill tone="info">Pending finance release</Pill>
              ) : (
                <Pill tone="warning">Awaiting settlement</Pill>
              )}
            </div>
            <div className={clsx("grow basis-0 text-right text-[15px] leading-[18px] text-ink", p.status !== "paid" && "font-semibold")}>
              {fmtMoney(p.net)}
              <div className="text-[11px] font-normal text-muted">
                Gross {fmtMoney(p.gross)} − Fee {fmtMoney(p.fee)}
              </div>
              <div className="mt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const advice = [
                      "============================================================",
                      "DGIX REMITTANCE ADVICE & PAYOUT STATEMENT",
                      "============================================================",
                      `Payout Reference: PAY-${p.id.slice(0, 8).toUpperCase()}`,
                      `Date: ${p.date}`,
                      `Beneficiary: ${company?.name ?? "Partner"}`,
                      `Order / Milestone: ${label(p)}`,
                      `Status: ${p.status.toUpperCase()}`,
                      "",
                      "BREAKDOWN:",
                      `Gross Invoice Amount:     ${fmtMoney(p.gross)}`,
                      `DGIX Platform Fee:        − ${fmtMoney(p.fee)}`,
                      `Contractual Reserve (5%): − ${fmtMoney(p.disputeHold ?? 0)}`,
                      "------------------------------------------------------------",
                      `NET BANK DISBURSEMENT:    ${fmtMoney(p.net)}`,
                      "============================================================",
                      "Disbursed via UAE Central Bank Direct Wire Settlement.",
                    ].join("\n");
                    const blob = new Blob([advice], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `payout-advice-${p.id.slice(0, 8)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Download Advice (BRD P-76)
                </button>
                <span className="text-[#C9D4E8]">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayout(p);
                    setInquiryQuestion("");
                    setInquiryOpen(true);
                  }}
                  className="text-[11px] font-medium text-[#D97706] hover:underline"
                >
                  Dispute / Inquire (BRD P-77)
                </button>
              </div>

              {p.queries && p.queries.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1.5 rounded-lg border border-[#F1F4FA] bg-[#F8FAFC] p-2.5 text-left text-xs">
                  <div className="font-semibold text-ink">Inquiry History (BRD P-77):</div>
                  {p.queries.map((q) => (
                    <div key={q.id} className="flex flex-col gap-0.5 border-t border-[#E2E8F0] pt-1.5 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink">Q: {q.question}</span>
                        <span className={clsx("rounded px-1.5 py-0.5 text-[10px] font-semibold", q.status === "answered" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEF3C7] text-[#B45309]")}>
                          {q.status}
                        </span>
                      </div>
                      {q.reply && (
                        <div className="text-muted"><span className="font-medium text-[#15803D]">Finance reply:</span> {q.reply}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </Panel>

      <Dialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} title="Payout Inquiry / Dispute (BRD P-77)">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedPayout || !inquiryQuestion.trim()) return;
            setSubmitting(true);
            try {
              await createPayoutQueryLive(selectedPayout.id, inquiryQuestion.trim());
              setFeedback("Inquiry sent to DGIX Finance Desk. We will review and reply within 1 business day.");
              setInquiryOpen(false);
              setInquiryQuestion("");
            } catch (err) {
              setFeedback(err instanceof Error ? err.message : "Failed to submit inquiry");
            } finally {
              setSubmitting(false);
            }
          }}
          className="flex flex-col gap-3"
        >
          <p className="text-xs text-muted">
            Have questions regarding deductions, reserve holdback (5%), or exchange rates for payout {selectedPayout ? `PAY-${selectedPayout.id.slice(0, 8).toUpperCase()}` : ""}? Enter your inquiry below.
          </p>
          <textarea
            autoFocus
            required
            rows={4}
            value={inquiryQuestion}
            onChange={(e) => setInquiryQuestion(e.target.value)}
            placeholder="e.g., Requesting breakdown of the 5% contractual reserve holdback..."
            className="w-full resize-none rounded-lg border border-[#CBD5E1] p-3 text-xs outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInquiryOpen(false)}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-xs font-semibold text-ink hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !inquiryQuestion.trim()}
              className="rounded-lg bg-night px-4 py-2 text-xs font-semibold text-paper hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Send to Finance"}
            </button>
          </div>
        </form>
      </Dialog>
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
