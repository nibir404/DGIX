"use client";

import clsx from "clsx";
import { Head, Panel, useFlash, useSeller } from "@/components/seller/kit";

const TERMS = [
  ["You keep", "All IP and source code. DGIX gets a sales licence only."],
  ["You deliver", "Setup, training and support under each buyer's SLA."],
  ["DGIX handles", "Buyer contract, billing, collection and first-line contact."],
  ["Payout timing", "Within 7 days after the buyer pays."],
  ["Re-review", "Every 12 months, or after a major release or SLA breach."],
];

export default function AgreementPage() {
  const { company, products } = useSeller();
  const { flash, toast } = useFlash();
  const markets = Array.from(new Set(products.flatMap((p) => p.markets).filter((m) => m !== "USA")));
  const mkts = markets.length ? markets.join(" · ") : "UAE · KSA · Qatar";

  const download = () => {
    const text = [
      "DGIX PARTNERSHIP AGREEMENT — MOU-0031",
      `Partner: ${company?.name ?? ""}, ${company?.city ?? ""}, ${company?.country ?? ""}`,
      "Signed 30 Oct · renews 30 Oct next year",
      "",
      "Model: Co-branded — your brand + \"Daffodil Verified\"",
      "DGIX fee: 15% per sale, taken only from paid milestones",
      `Markets: ${mkts} (USA after 3 references)`,
      "",
      ...TERMS.map(([k, v]) => `${k}: ${v}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "MOU-0031.txt";
    a.click();
    URL.revokeObjectURL(url);
    flash("Agreement downloaded · MOU-0031");
  };

  const cells = [
    { k: "Model", v: "Co-branded", s: "Your brand + “Daffodil Verified”" },
    { k: "DGIX fee", v: "15% per sale", s: "Taken only from paid milestones" },
    { k: "Markets", v: mkts, s: "USA after 3 references" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Head
        kicker="MOU-0031 · signed 30 Oct · renews 30 Oct next year"
        title="Partnership agreement"
        right={
          <button onClick={download} className="inline-flex h-11 items-center self-start rounded-lg bg-paper px-5 text-sm font-semibold leading-[18px] text-ink transition hover:bg-mist md:self-auto">
            Download PDF
          </button>
        }
      />

      <Panel className="grid grid-cols-1 overflow-clip bg-paper md:grid-cols-3">
        {cells.map((c, i) => (
          <div key={c.k} className={clsx("flex flex-col gap-2 p-6", i > 0 && "max-md:border-t md:border-l border-[#EEF1F6]")}>
            <div className="text-[13px] leading-4 text-muted">{c.k}</div>
            <div className="text-[24px] font-light leading-[30px] text-ink">{c.v}</div>
            <div className="text-xs leading-4 text-muted">{c.s}</div>
          </div>
        ))}
      </Panel>

      <Panel className="flex flex-col bg-paper px-4 py-2 md:px-6">
        <div className="border-b border-[#F1F4FA] py-[14px] text-base font-medium leading-5 text-ink">What you agreed to</div>
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
