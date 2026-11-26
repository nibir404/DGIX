"use client";

import { useState } from "react";
import clsx from "clsx";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button, Empty } from "@/components/portal/ui";
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
  const { live, refreshLive } = useStore();
  const { flash, toast } = useFlash();
  const [signingId, setSigningId] = useState<string | null>(null);

  const partnerAgreements = live.agreements.filter(
    (a) => !company?.id || String(a.partner_id) === company.id,
  );
  const activeAg = partnerAgreements[0];

  const partnerContracts = live.contracts.filter(
    (c) => !company?.id || String(c.partner_id) === company.id,
  );
  const ndaContract = partnerContracts.find((c) => String(c.contract_type).toUpperCase() === "NDA");
  const ndaSigned = ndaContract?.status === "signed";
  const ndaSent = ndaContract?.status === "sent";

  const signContract = async (contractId: string, title: string) => {
    setSigningId(contractId);
    try {
      await apiFetch(`/bff/v1/contracts/${contractId}/sign`, {
        method: "POST",
      });
      await refreshLive();
      flash(`${title} successfully signed · legal gate cleared`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Contract signing failed");
    } finally {
      setSigningId(null);
    }
  };

  const markets = Array.isArray(activeAg?.territories)
    ? (activeAg.territories as string[])
    : Array.from(new Set(products.flatMap((p) => p.markets)));
  const mkts = markets.length ? markets.join(" · ") : company?.country ?? "—";
  const agRef = activeAg ? `AGR-${String(activeAg.agreement_id).slice(0, 8).toUpperCase()}` : "AGR-PENDING";
  const status = String(activeAg?.status ?? "draft");
  const modelLabel = String(activeAg?.commercial_model ?? "reseller").replace(/_/g, " ");
  const commPct = `${Number(activeAg?.commission_pct ?? 0)}%`;
  const holdPct = activeAg?.dispute_hold_pct
    ? `${Number(activeAg.dispute_hold_pct)}% contractual reserve`
    : "Settled milestone basis";

  const download = () => {
    if (!activeAg) return;
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
        title="Partnership &amp; Distribution Agreement"
        right={
          activeAg ? (
            <button
              onClick={download}
              className="inline-flex h-11 items-center self-start rounded-lg bg-paper px-5 text-sm font-semibold leading-[18px] text-ink transition hover:bg-mist md:self-auto"
            >
              Download agreement
            </button>
          ) : undefined
        }
      />

      {/* Step 1 NDA Hard Gate Banner (FR-PAR-06) */}
      {ndaContract && (
        <Panel className={clsx("p-5 border-2", ndaSigned ? "border-success/30 bg-[#F2FBF6]" : "border-warning/50 bg-[#FDF7E7]")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={clsx("text-xs font-bold uppercase tracking-wider", ndaSigned ? "text-success" : "text-warning")}>
                  {ndaSigned ? "Step 1 Gate Cleared" : "Step 1 Hard Gate: Mandatory NDA Required (FR-PAR-06)"}
                </span>
                <Pill tone={ndaSigned ? "success" : "warning"}>{ndaContract.status as string}</Pill>
              </div>
              <div className="text-base font-medium text-ink">
                {String(ndaContract.title || "Mutual Non-Disclosure Agreement (Standard)")}
              </div>
              <div className="text-xs text-muted">
                {ndaSigned
                  ? `Countersigned by partner on ${new Date(String(ndaContract.signed_at)).toLocaleDateString("en-GB")}. Diagnostic access and product verification unlocked.`
                  : "All partners must sign a bilateral Non-Disclosure Agreement before product triage, evidence review, and commercial listings can proceed."}
              </div>
            </div>
            {ndaSent && (
              <Button
                variant="primary"
                disabled={signingId === String(ndaContract.contract_id)}
                onClick={() => void signContract(String(ndaContract.contract_id), "Mutual NDA")}
              >
                {signingId === String(ndaContract.contract_id) ? "Signing NDA..." : "Sign Mutual NDA"}
              </Button>
            )}
          </div>
        </Panel>
      )}

      {/* Other Partner Contracts (SLA, MSA, DPA) */}
      {partnerContracts.filter((c) => String(c.contract_type).toUpperCase() !== "NDA").length > 0 && (
        <Panel className="p-5 bg-white flex flex-col gap-3">
          <div className="text-sm font-semibold text-ink">Additional Partnership Contracts</div>
          <div className="flex flex-col divide-y divide-line">
            {partnerContracts
              .filter((c) => String(c.contract_type).toUpperCase() !== "NDA")
              .map((c) => {
                const cid = String(c.contract_id);
                const st = String(c.status);
                return (
                  <div key={cid} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <div className="font-medium text-ink">{String(c.title)}</div>
                      <div className="text-muted">Type: {String(c.contract_type)} · Ref: {cid.slice(0, 8)}</div>
                    </div>
                    {st === "sent" ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={signingId === cid}
                        onClick={() => void signContract(cid, String(c.title))}
                      >
                        {signingId === cid ? "Signing..." : "Sign Contract"}
                      </Button>
                    ) : (
                      <Pill tone={st === "signed" ? "success" : "warning"}>{st}</Pill>
                    )}
                  </div>
                );
              })}
          </div>
        </Panel>
      )}

      {/* Commercial Distribution Agreement */}
      {!activeAg ? (
        <Empty
          title="Distribution agreement pending"
          body="Your commercial distribution agreement will appear here once product verification and commercial terms are finalised with our legal team."
        />
      ) : (
        <>
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
        </>
      )}
      {toast}
    </div>
  );
}
