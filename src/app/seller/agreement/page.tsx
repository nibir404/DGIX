"use client";

import clsx from "clsx";
import { useStore } from "@/lib/store";
import { Empty } from "@/components/portal/ui";
import { Head, Panel, Pill, useFlash, useSeller } from "@/components/seller/kit";

const TERMS = [
  ["You keep", "All IP and source code. DGIX receives non-exclusive regional distribution rights only."],
  ["You deliver", "Implementation, training and tier-2/3 engineering support under each buyer's signed SLA."],
  ["DGIX handles", "Buyer contract, tax e-invoicing (UAE FTA / KSA ZATCA), online collection and tier-1 advisory."],
  ["Payout & reserve", "Released after buyer invoice settlement clears, subject to any agreed contractual reserve."],
  ["Continuous assurance", "Annual re-verification, or immediate review on critical security advisories or severe SLA breaches."],
];

export default function AgreementPage() {
  const { company, products } = useSeller();
  const { live } = useStore();
  const { flash, toast } = useFlash();

  const partnerAgreements = live.agreements.filter(
    (a) => !company?.id || String(a.partner_id) === company.id,
  );
  const activeAg = partnerAgreements[0];

  if (!activeAg) {
    return (
      <div className="flex flex-col gap-5">
        <Head kicker="Distribution terms" title="Partnership agreement" />
        <Empty
          title="Agreement pending"
          body="Your commercial distribution agreement will appear here once product verification and commercial terms are finalised with our legal team."
        />
      </div>
    );
  }

  const markets = Array.isArray(activeAg.territories)
    ? (activeAg.territories as string[])
    : Array.from(new Set(products.flatMap((p) => p.markets)));
  const mkts = markets.length ? markets.join(" · ") : company?.country ?? "—";
  const agRef = `AGR-${String(activeAg.agreement_id).slice(0, 8).toUpperCase()}`;
  const status = String(activeAg.status ?? "draft");
  const modelLabel = String(activeAg.commercial_model ?? "reseller").replace(/_/g, " ");
  const commPct = `${Number(activeAg.commission_pct ?? 0)}%`;
  const holdPct = activeAg.dispute_hold_pct
    ? `${Number(activeAg.dispute_hold_pct)}% contractual reserve`
    : "Settled milestone basis";

  const download = () => {
    const text = [
      `DGIX COMMERCIAL DISTRIBUTION AGREEMENT — ${agRef}`,
      `Partner: ${company?.name ?? ""}, ${company?.city ?? ""}, ${company?.country ?? ""}`,
      `Status: ${status.toUpperCase()}`,
      "",
      `Commercial model: ${modelLabel}`,
      `DGIX commission: ${commPct} (${holdPct})`,
      `Authorised territories: ${mkts}`,
      "",
      ...TERMS.map(([k, v]) => `${k}: ${v}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agRef}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    flash(`Agreement downloaded · ${agRef}`);
  };

  const cells = [
    { k: "Commercial model", v: modelLabel, s: status === "signed" ? "Countersigned · Daffodil Verified" : "Draft under legal review" },
    { k: "DGIX margin / fee", v: `${commPct} per sale`, s: holdPct },
    { k: "Territories", v: mkts, s: "Authorised distribution markets" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Head
        kicker={
          <span className="inline-flex items-center gap-2">
            <span>{agRef}</span>
            <Pill tone={status === "signed" ? "success" : "warning"}>{status}</Pill>
          </span>
        }
        title="Partnership agreement"
        right={
          <button onClick={download} className="inline-flex h-11 items-center self-start rounded-lg bg-paper px-5 text-sm font-semibold leading-[18px] text-ink transition hover:bg-mist md:self-auto">
            Download agreement
          </button>
        }
      />

      <Panel className="grid grid-cols-1 overflow-clip bg-paper md:grid-cols-3">
        {cells.map((c, i) => (
          <div key={c.k} className={clsx("flex flex-col gap-2 p-6", i > 0 && "max-md:border-t md:border-l border-[#EEF1F6]")}>
            <div className="text-[13px] leading-4 text-muted">{c.k}</div>
            <div className="text-[24px] font-light leading-[30px] capitalize text-ink">{c.v}</div>
            <div className="text-xs leading-4 text-muted">{c.s}</div>
          </div>
        ))}
      </Panel>

      <Panel className="flex flex-col bg-paper px-4 py-2 md:px-6">
        <div className="border-b border-[#F1F4FA] py-[14px] text-base font-medium leading-5 text-ink">Contractual rights &amp; obligations</div>
        {TERMS.map(([k, v], i) => (
          <div key={k} className={clsx("flex flex-col gap-1 py-[14px] sm:flex-row sm:gap-[14px]", i < TERMS.length - 1 && "border-b border-[#F1F4FA]")}>
            <div className="shrink-0 text-sm leading-[18px] text-muted sm:w-[200px]">{k}</div>
            <div className="text-sm leading-[18px] text-ink">{v}</div>
          </div>
        ))}
      </Panel>
      {toast}
    </div>
  );
}
