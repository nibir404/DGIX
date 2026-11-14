"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import { Btn, Dialog, Panel, daysUntil, dayMonth, money, useBuyer, useFlash } from "@/components/buyer/kit";

const statusChip = (i: Invoice) =>
  i.status === "due" ? { t: `Due ${dayMonth(i.due)}`, c: "bg-[#FFF3DC] text-warning" }
  : i.status === "overdue" ? { t: "Overdue", c: "bg-[#FBE7E7] text-danger" }
  : i.status === "paid" ? { t: "Captured · awaiting settle", c: "bg-mist text-primary" }
  : { t: "Settled & Posted", c: "bg-[#E6F4EC] text-[#0E6439]" };

function BillingInner() {
  const b = useBuyer();
  const { refreshLive } = useStore();
  const lk = useLookup();
  const params = useSearchParams();
  const { flash, toast } = useFlash();
  const [paying, setPaying] = useState<Invoice | null>(null);
  const justPaid = params.get("paid") === "1";

  useEffect(() => {
    if (justPaid) {
      void refreshLive();
    }
  }, [justPaid, refreshLive]);

  const list = [...b.invoices].sort((a, c) => (a.status === "due" ? -1 : 0) - (c.status === "due" ? -1 : 0) || c.due.localeCompare(a.due));
  const due = list.filter((i) => i.status === "due" || i.status === "overdue").sort((a, c) => a.due.localeCompare(c.due));
  const next = due[0];
  const projName = (id: string) => lk.product(b.db.projects.find((p) => p.id === id)?.productId)?.name ?? "Enterprise Order";
  const year = String(new Date().getFullYear());
  const paidThisYear = b.invoices.filter((i) => (i.status === "paid" || i.status === "verified") && (i.paidOn ?? "").startsWith(year));
  const spent = paidThisYear.reduce((s, i) => s + i.amount, 0);

  const months = Array.from({ length: 5 }, (_, k) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (4 - k));
    const key = d.toISOString().slice(0, 7);
    return { key, label: d.toLocaleDateString("en-GB", { month: "short" }), v: b.invoices.filter((i) => (i.paidOn ?? "").startsWith(key)).reduce((s, i) => s + i.amount, 0) };
  });
  const max = Math.max(1, ...months.map((m) => m.v));

  const exportCsv = () => {
    const rows = [
      ["Invoice", "E-Invoice Clearance", "For", "Status", "Amount (USD)", "Due", "Paid on"],
      ...list.map((i) => [
        i.ref,
        i.einvoiceClearanceId ?? "Standard",
        `${projName(i.projectId)} · ${i.milestone}`,
        i.status,
        String(i.amount),
        i.due,
        i.paidOn ?? "",
      ]),
    ];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `dgix-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Statement exported");
  };

  const pay = () => {
    if (!paying) return;
    b.payInvoice(paying.id);
    flash(`Redirecting to PCI SAQ A Hosted Gateway for ${paying.ref}…`);
    setPaying(null);
  };

  const dd = next ? daysUntil(next.due) : 0;

  return (
    <div className="flex flex-col gap-5">
      {justPaid && (
        <div className="rounded-lg border border-[#BCE3CC] bg-[#F2FBF6] px-4 py-3 text-sm text-[#145C36]">
          <strong>Hosted Gateway Payment Captured:</strong> Signed HMAC-SHA256 gateway webhook verified and balanced double-entry ledger journal posted in <code>payments-delivery</code>.
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted">Tax-compliant e-invoicing (UAE FTA / KSA ZATCA) · PCI DSS v4.0.1 SAQ A Hosted Checkout</div>
          <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">Billing</h1>
        </div>
        <Btn variant="outline" onClick={exportCsv} className="self-start border-[#C9D4E8] md:self-auto">Export statement</Btn>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start justify-between gap-6 rounded-lg bg-night p-6 sm:flex-row sm:items-center md:p-7 lg:grow-[1.4] lg:basis-0"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 120% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%)" }}
        >
          {next ? (
            <>
              <div className="flex min-w-0 flex-col gap-2">
                <div className="text-[13px] leading-4 text-glow-amber">{dd < 0 ? `Overdue by ${-dd} days` : dd === 0 ? "Due today" : `Due in ${dd} days`} · {next.ref}</div>
                <div className="text-[48px] font-light leading-[56px] tracking-[-0.05em] text-paper md:text-[56px] md:leading-[64px]">{money(next.amount)}</div>
                <div className="text-sm leading-[18px] text-[#FFFFFFA6]">{projName(next.projectId)} · {next.milestone}</div>
                {next.einvoiceClearanceId && (
                  <div className="font-mono text-xs text-[#7FE0AE]">
                    {next.einvoiceScheme?.toUpperCase()}: {next.einvoiceClearanceId}
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto">
                <button onClick={() => setPaying(next)} className="inline-flex h-[52px] items-center justify-center rounded-lg bg-paper px-7 text-[15px] font-semibold leading-[18px] text-night hover:bg-mist">
                  Pay via Hosted Gateway
                </button>
                <div className="text-center text-xs leading-4 text-[#FFFFFF8C]">PCI SAQ A · Zero card data on DGIX</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-[13px] leading-4 text-[#7FE0AE]">Nothing due</div>
              <div className="text-[32px] font-light leading-10 tracking-tight text-paper">You&apos;re all paid up.</div>
              <div className="text-sm text-[#FFFFFFA6]">New invoices appear after order acceptance or milestone sign-off.</div>
            </div>
          )}
        </motion.div>

        <Panel className="flex flex-col gap-3.5 p-6 lg:grow lg:basis-0" delay={0.05}>
          <div className="text-[13px] leading-4 text-muted">Settled &amp; captured this year</div>
          <div className="text-[40px] font-light leading-12 tracking-tight text-ink">{money(spent)}</div>
          <div className="flex h-2.5 gap-1">
            {b.projects.map((p, i) => {
              const v = paidThisYear.filter((x) => x.projectId === p.id).reduce((s, x) => s + x.amount, 0);
              return v ? <div key={p.id} style={{ flexGrow: v }} className={clsx("basis-0 rounded-lg", i % 2 ? "bg-sky" : "bg-primary")} /> : null;
            })}
            {spent === 0 && <div className="flex-1 rounded-lg bg-mist" />}
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            {b.projects.map((p, i) => {
              const v = paidThisYear.filter((x) => x.projectId === p.id).reduce((s, x) => s + x.amount, 0);
              return v ? <div key={p.id} className={clsx("text-xs leading-4", i % 2 ? "text-muted" : "text-primary")}>● {lk.product(p.productId)?.name} {money(v)}</div> : null;
            })}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="min-w-0 overflow-x-auto px-6 py-2 lg:grow-[1.6] lg:basis-0" delay={0.1}>
          <div className="min-w-[540px]">
            <div className="flex items-center border-b border-[#F1F4FA] py-3.5 text-xs font-semibold leading-4 tracking-[0.06em] text-[#9AA2B4]">
              <div className="flex-[1.3] basis-0">INVOICE / CLEARANCE</div>
              <div className="flex-[2] basis-0">FOR</div>
              <div className="flex-1 basis-0">STATUS</div>
              <div className="flex-1 basis-0 text-right">AMOUNT</div>
            </div>
            {list.length === 0 && <div className="py-8 text-center text-sm text-muted">No invoices yet.</div>}
            {list.map((i, k) => {
              const s = statusChip(i);
              const isDue = i.status === "due" || i.status === "overdue";
              return (
                <div key={i.id} className={clsx("flex items-center py-4", k < list.length - 1 && "border-b border-[#F1F4FA]")}>
                  <div className="flex flex-[1.3] basis-0 flex-col pr-2">
                    <span className="text-sm font-medium leading-[18px] text-ink">{i.ref}</span>
                    {i.einvoiceClearanceId && (
                      <span className="truncate font-mono text-[10.5px] text-muted">{i.einvoiceClearanceId}</span>
                    )}
                  </div>
                  <div className="flex flex-[2] basis-0 flex-col pr-3">
                    <Link href={`/buyer/projects/${i.projectId}`} className="text-sm leading-[18px] text-ink hover:text-primary">{projName(i.projectId)} · {i.milestone}</Link>
                    <div className="text-xs leading-4 text-[#9AA2B4]">{i.paidOn ? `Paid ${dayMonth(i.paidOn)}` : `Due ${dayMonth(i.due)}`}</div>
                  </div>
                  <div className="flex flex-1 basis-0 items-center gap-2">
                    <span className={clsx("whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold leading-4", s.c)}>{s.t}</span>
                  </div>
                  <div className="flex flex-1 basis-0 items-center justify-end gap-2.5">
                    {isDue && <button onClick={() => setPaying(i)} className="inline-flex h-[30px] items-center rounded-lg bg-night px-3 text-xs font-semibold text-paper">Pay</button>}
                    <span className={clsx("text-right text-[15px] leading-[18px] text-ink", isDue && "font-semibold")}>{money(i.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="flex flex-col gap-4 lg:grow lg:basis-0">
          <Panel className="flex min-h-[220px] flex-1 flex-col gap-3.5 p-6" delay={0.15}>
            <div className="text-base font-medium leading-5 text-ink">Monthly spend</div>
            <div className="flex flex-1 items-end gap-2.5">
              {months.map((m, k) => {
                const last = k === months.length - 1;
                return (
                  <div key={m.key} className="flex h-full flex-1 basis-0 flex-col items-center justify-end gap-1.5" title={money(m.v)}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, (m.v / max) * 84)}%` }}
                      transition={{ duration: 0.7, delay: k * 0.05 }}
                      className={clsx("w-full rounded-lg", last ? "bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)]" : "[background:repeating-linear-gradient(135deg,#7FB6FF_0px,#7FB6FF_2px,#E3EDFD_2px,#E3EDFD_6px)]")}
                    />
                    <div className={clsx("text-[11px] leading-[14px]", last ? "font-semibold text-ink" : "text-[#9AA2B4]")}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel className="flex flex-col gap-3 p-5" delay={0.2}>
            <div className="text-base font-medium leading-5 text-ink">PCI DSS SAQ A Hosted Architecture</div>
            <div className="rounded-lg bg-[linear-gradient(135deg,#0C1F45_0%,#1E4FA3_100%)] p-3.5 text-paper">
              <div className="text-[13px] font-semibold">Stripe · Adyen · Checkout.com · SSLCommerz</div>
              <div className="mt-1 text-[11px] leading-4 text-[#FFFFFFB3]">
                Cardholder PAN/CVV never touches DGIX servers. Payments redirect to the gateway&apos;s hosted session and settle via HMAC-SHA256 webhooks.
              </div>
            </div>
            <div className="text-xs leading-4 text-muted">Cleared tax e-invoices go to finance@{b.user?.email.split("@")[1] ?? "company.com"}</div>
          </Panel>
        </div>
      </div>

      <Dialog open={!!paying} onClose={() => setPaying(null)} title={`Hosted Gateway Checkout · ${paying?.ref ?? ""}`}>
        {paying && (
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <div className="text-sm text-muted">{projName(paying.projectId)} · {paying.milestone}</div>
              <div className="text-2xl font-light text-ink">{money(paying.amount)}</div>
            </div>
            <div className="rounded-lg border border-[#CBD7EE] bg-[#F6F9FF] p-3.5 text-xs leading-5 text-[#2C3E66]">
              <strong>PCI DSS v4.0.1 SAQ A Compliant:</strong> You will be redirected to the isolated Hosted Gateway Checkout page. Upon capture, an HMAC-signed webhook posts a balanced double-entry journal (`gateway_clearing` Dr / `deferred_revenue` Cr) and returns you here.
            </div>
            <Btn onClick={pay} size="lg">Proceed to Hosted Gateway ({money(paying.amount)}) →</Btn>
          </div>
        )}
      </Dialog>
      {toast}
    </div>
  );
}

export default function Billing() {
  return (
    <Suspense fallback={null}>
      <BillingInner />
    </Suspense>
  );
}
