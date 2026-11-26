"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Btn, Dialog, Panel } from "@/components/buyer/kit";
import { Head, Pill } from "@/components/seller/kit";
import { useFlash } from "@/components/admin/kit";
import {
  CountryPhoneInput,
  formatE164,
  validateCountryPhone,
} from "@/components/ui/CountryPhoneInput";

type CatalogControl = { catalog_open: boolean; reason: string | null };
type BuyerVer = { buyer_id: string; company_name: string; country_code: string; status: string };
type Correction = {
  correction_id: string;
  listing_id: string;
  proposed_title: string | null;
  rationale: string;
  status: string;
};
type FitCheck = {
  fit_check_id: string;
  requirement_id: string;
  listing_id: string;
  fit_score: number;
  plain_summary: string;
  recommendation: string;
};
type CustQuote = {
  quote_id: string;
  product_price: string;
  customization_price: string;
  total_price: string;
  effort_days: number;
  timeline_weeks: number;
  status: string;
  scope_summary: string;
};

export default function AdminBrdOpsPage() {
  const { db } = useStore();
  const { flash, toast } = useFlash();
  const [control, setControl] = useState<CatalogControl>({ catalog_open: true, reason: null });
  const [buyerVers, setBuyerVers] = useState<BuyerVer[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [fitChecks, setFitChecks] = useState<FitCheck[]>([]);
  const [quotes, setQuotes] = useState<CustQuote[]>([]);
  const [assistedOpen, setAssistedOpen] = useState(false);
  const [legalName, setLegalName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [country, setCountry] = useState("BGD");
  const [phoneCountry, setPhoneCountry] = useState("BGD");
  const [partnerMobile, setPartnerMobile] = useState("");
  const [director, setDirector] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

  const partners = db.companies.filter((c) => c.kind === "partner");

  const load = useCallback(async () => {
    const [ctrl, bvs, corrs, fcs, qs] = await Promise.all([
      apiFetch<CatalogControl>("/bff/v1/commercial/catalog/control").catch(() => ({
        catalog_open: true,
        reason: null,
      })),
      apiFetch<BuyerVer[]>("/bff/v1/iam/buyer-verifications").catch(() => []),
      apiFetch<Correction[]>("/bff/v1/commercial/catalog/corrections").catch(() => []),
      apiFetch<FitCheck[]>("/bff/v1/commercial/customization/fit-checks").catch(() => []),
      apiFetch<CustQuote[]>("/bff/v1/commercial/customization/quotes").catch(() => []),
    ]);
    setControl(ctrl);
    setBuyerVers(Array.isArray(bvs) ? bvs : []);
    setCorrections(Array.isArray(corrs) ? corrs : []);
    setFitChecks(Array.isArray(fcs) ? fcs : []);
    setQuotes(Array.isArray(qs) ? qs : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleCatalog = async () => {
    const reason = window.prompt(
      control.catalog_open ? "Reason to emergency-close the global catalogue:" : "Reason to reopen the global catalogue:",
    );
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await apiFetch(
        control.catalog_open ? "/bff/v1/commercial/catalog/emergency-close" : "/bff/v1/commercial/catalog/reopen",
        { method: "POST", body: { reason: reason.trim() } },
      );
      flash(control.catalog_open ? "Global catalogue closed" : "Global catalogue reopened");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to update catalogue control");
    } finally {
      setBusy(false);
    }
  };

  const partnerLifecycle = async (partnerId: string, action: "suspend" | "reactivate" | "terminate") => {
    const reason = window.prompt(`Reason to ${action} this partner:`);
    if (!reason || reason.trim().length < 5) return;
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/partners/${partnerId}/${action}`, {
        method: "POST",
        body: { reason: reason.trim() },
      });
      flash(`Partner ${action}d`);
    } catch (e) {
      flash(e instanceof Error ? e.message : `Failed to ${action} partner`);
    } finally {
      setBusy(false);
    }
  };

  const recordTraining = async (partnerId: string) => {
    const ref = window.prompt("Training completion evidence reference (e.g. cert-2026-001.pdf):");
    if (!ref || ref.trim().length < 3) return;
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/partners/${partnerId}/training`, {
        method: "POST",
        body: { evidence_ref: ref.trim(), completed: true },
      });
      flash("Partner onboarding training verified");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to record training");
    } finally {
      setBusy(false);
    }
  };

  const submitAssisted = async () => {
    const phoneErr = validateCountryPhone(phoneCountry, partnerMobile);
    if (phoneErr) {
      flash(phoneErr);
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/bff/v1/partners/assisted", {
        method: "POST",
        body: {
          legal_name: legalName.trim(),
          registration_number: regNo.trim(),
          country_code: country.trim().toUpperCase(),
          product_summary: `${summary.trim()} [Contact mobile: ${formatE164(phoneCountry, partnerMobile)}]`,
          directors: [{ full_name: director.trim(), country_code: country.trim().toUpperCase(), role_title: "Director" }],
        },
      });
      setAssistedOpen(false);
      setLegalName("");
      setRegNo("");
      setPartnerMobile("");
      setDirector("");
      setSummary("");
      flash("Assisted partner onboarding submitted (requires a second approver)");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Assisted onboarding failed");
    } finally {
      setBusy(false);
    }
  };

  const decideBuyer = async (buyerId: string, decision: "approved" | "rejected") => {
    const reason = window.prompt(`Reason to ${decision} buyer verification:`) ?? "Verified by DGIX Admin";
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/iam/buyer-verifications/${buyerId}/decide`, {
        method: "POST",
        body: { decision, reason },
      });
      flash(`Buyer verification ${decision}`);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  };

  const decideCorrection = async (correctionId: string, decision: "accepted" | "rejected") => {
    const reason = window.prompt(`Reason to ${decision} catalogue correction:`) ?? "Reviewed by DGIX Admin";
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/commercial/catalog/corrections/${correctionId}/decide`, {
        method: "POST",
        body: { decision, reason },
      });
      flash(`Catalogue correction ${decision}`);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Head
        kicker="Partner lifecycle · Catalogue controls · Customization & Fit Check"
        title="Operations & controls"
        right={
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" onClick={() => setAssistedOpen(true)}>
              + Assisted partner onboarding
            </Btn>
            <Btn disabled={busy} onClick={() => void toggleCatalog()}>
              {control.catalog_open ? "Emergency close catalogue" : "Reopen global catalogue"}
            </Btn>
          </div>
        }
      />

      <Panel className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <div className="text-sm font-semibold text-ink">Global Catalogue Kill Switch (V-03)</div>
          <div className="text-xs text-muted">
            {control.catalog_open ? "Catalogue is currently OPEN for buyers." : `CLOSED: ${control.reason ?? "Emergency stop"}`}
          </div>
        </div>
        <Pill tone={control.catalog_open ? "success" : "warning"}>
          {control.catalog_open ? "OPEN" : "CLOSED"}
        </Pill>
      </Panel>

      <Panel className="flex flex-col gap-3 p-6">
        <div className="text-base font-semibold text-ink">Partner Lifecycle &amp; Training Controls ({partners.length})</div>
        <div className="divide-y divide-[#F1F4FA]">
          {partners.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <div className="text-sm font-medium text-ink">{p.name}</div>
                <div className="text-xs text-muted">{p.country}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn variant="outline" disabled={busy} onClick={() => void recordTraining(p.id)}>
                  Verify training
                </Btn>
                <Btn variant="outline" disabled={busy} onClick={() => void partnerLifecycle(p.id, "suspend")}>
                  Suspend
                </Btn>
                <Btn variant="outline" disabled={busy} onClick={() => void partnerLifecycle(p.id, "reactivate")}>
                  Reactivate
                </Btn>
                <Btn variant="outline" disabled={busy} onClick={() => void partnerLifecycle(p.id, "terminate")}>
                  End partner
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3 p-6">
          <div className="text-base font-semibold text-ink">Buyer Verification Queue ({buyerVers.length})</div>
          {buyerVers.length === 0 ? (
            <div className="text-sm text-muted">No pending buyer verification requests.</div>
          ) : (
            buyerVers.map((b) => (
              <div key={b.buyer_id} className="flex items-center justify-between gap-2 border-t border-[#F1F4FA] pt-3">
                <div>
                  <div className="text-sm font-medium text-ink">{b.company_name}</div>
                  <div className="text-xs text-muted">{b.country_code} · {b.status}</div>
                </div>
                {b.status === "pending" && (
                  <div className="flex gap-2">
                    <Btn variant="outline" disabled={busy} onClick={() => void decideBuyer(b.buyer_id, "approved")}>Approve</Btn>
                    <Btn variant="outline" disabled={busy} onClick={() => void decideBuyer(b.buyer_id, "rejected")}>Reject</Btn>
                  </div>
                )}
              </div>
            ))
          )}
        </Panel>

        <Panel className="flex flex-col gap-3 p-6">
          <div className="text-base font-semibold text-ink">Seller Catalogue Corrections ({corrections.length})</div>
          {corrections.length === 0 ? (
            <div className="text-sm text-muted">No seller-proposed catalogue corrections.</div>
          ) : (
            corrections.map((c) => (
              <div key={c.correction_id} className="flex items-center justify-between gap-2 border-t border-[#F1F4FA] pt-3">
                <div>
                  <div className="text-sm font-medium text-ink">{c.proposed_title ?? "Description update"}</div>
                  <div className="text-xs text-muted">{c.rationale} · {c.status}</div>
                </div>
                {c.status === "pending" && (
                  <div className="flex gap-2">
                    <Btn variant="outline" disabled={busy} onClick={() => void decideCorrection(c.correction_id, "accepted")}>Accept</Btn>
                    <Btn variant="outline" disabled={busy} onClick={() => void decideCorrection(c.correction_id, "rejected")}>Reject</Btn>
                  </div>
                )}
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel className="flex flex-col gap-3 p-6">
        <div className="text-base font-semibold text-ink">
          Fit Checks ({fitChecks.length}) &amp; Customization Quotes ({quotes.length})
        </div>
        {fitChecks.length === 0 && quotes.length === 0 ? (
          <div className="text-sm text-muted">
            Fit-check reports and unified product + customization quotes will appear here once recorded via `/bff/v1/commercial/customization/*`.
          </div>
        ) : (
          <div className="divide-y divide-[#F1F4FA]">
            {fitChecks.map((f) => (
              <div key={f.fit_check_id} className="py-2.5 text-sm">
                <strong>Fit {f.fit_score}/100</strong> ({f.recommendation}) — {f.plain_summary}
              </div>
            ))}
            {quotes.map((q) => (
              <div key={q.quote_id} className="py-2.5 text-sm">
                <strong>Quote ${q.total_price}</strong> ({q.effort_days}d / {q.timeline_weeks}w · {q.status}) — {q.scope_summary}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Dialog open={assistedOpen} onClose={() => setAssistedOpen(false)} title="Assisted partner onboarding (P-11)">
        <div className="flex flex-col gap-3">
          <input placeholder="Legal company name" value={legalName} onChange={(e) => setLegalName(e.target.value)} className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink" />
          <input placeholder="Registration number" value={regNo} onChange={(e) => setRegNo(e.target.value)} className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink" />
          <input placeholder="Country code (e.g. BGD, UAE)" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink" />
          <input placeholder="Managing director full name" value={director} onChange={(e) => setDirector(e.target.value)} className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink" />
          <CountryPhoneInput
            countryCode={phoneCountry}
            onCountryChange={setPhoneCountry}
            value={partnerMobile}
            onChange={setPartnerMobile}
            label="Partner primary mobile number *"
          />
          <textarea rows={3} placeholder="Product & capability summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink" />
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={() => setAssistedOpen(false)}>Cancel</Btn>
            <Btn disabled={busy || !legalName || !regNo || !director || !summary || !!validateCountryPhone(phoneCountry, partnerMobile)} onClick={() => void submitAssisted()}>Submit assisted record</Btn>
          </div>
        </div>
      </Dialog>
      {toast}
    </div>
  );
}
