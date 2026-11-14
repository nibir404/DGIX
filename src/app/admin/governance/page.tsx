"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button, Chip } from "@/components/portal/ui";
import { H1, Kicker, useFlash } from "@/components/admin/kit";

export default function GovernanceAndAuditPage() {
  const { live, authSession, refreshLive } = useStore();
  const { flash, toast } = useFlash();
  const [busy, setBusy] = useState<string | null>(null);
  const [triggerSeverity, setTriggerSeverity] = useState<"high" | "critical">("critical");
  const [triggerSummary, setTriggerSummary] = useState("CVE-2026-41902 critical auth bypass reported in upstream dependency");
  const [selectedProdForTrigger, setSelectedProdForTrigger] = useState("");

  const castCouncilVote = async (assessment: Record<string, unknown>, countryCode = "UAE") => {
    const assId = String(assessment.assessment_id);
    const pid = String(assessment.product_id);
    const verId = String(assessment.product_version_id);
    const ag = live.agreements.find((a) => String(a.product_id) === pid && a.status === "signed");
    const pl = live.priceLists.find(
      (x) => String(x.product_id) === pid && String(x.country_code) === countryCode && x.status === "approved",
    );
    if (!ag || !pl) {
      flash(`Signed CommercialAgreement and approved ${countryCode} PriceList required before Council vote.`);
      return;
    }
    setBusy(assId);
    try {
      const res = await apiFetch<Record<string, unknown>>("/bff/v1/governance/approvals", {
        method: "POST",
        body: JSON.stringify({
          assessment_id: assId,
          product_id: pid,
          product_version_id: verId,
          country_code: countryCode,
          vote: "approve",
          reason: `Independent Council member verified PG0–PG5 gates, legal IP rights, and ${countryCode} readiness.`,
          agreement_id: String(ag.agreement_id),
          agreement_type: "commercial_agreement",
          agreement_signed: true,
          price_list_id: String(pl.price_list_id),
          price_list_approved: true,
        }),
      });
      if (res.approval && typeof res.approval === "object") {
        const approval = res.approval as Record<string, unknown>;
        await apiFetch("/bff/v1/commercial/catalog/approval-grants", {
          method: "POST",
          body: JSON.stringify({
            approval_record_id: String(approval.approval_id),
            canonical_payload: approval.canonical_payload,
            signature: String(approval.signature),
            kid: String(approval.kid),
            algorithm: String(approval.algorithm),
          }),
        }).catch(() => undefined);
        flash(`2-Member Quorum Reached! Ed25519 ApprovalRecord minted (kid=${String(approval.kid)})`);
      } else {
        flash("1st Council Quorum Vote recorded! Switch to council2 to complete 2-member quorum.");
      }
      await refreshLive();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Council vote requires council_member role (council1 / council2)");
    } finally {
      setBusy(null);
    }
  };

  const approvePao = async (productId: string) => {
    setBusy(productId);
    try {
      await apiFetch(`/bff/v1/iam/pao-bindings/${productId}/approve`, { method: "POST" });
      await refreshLive();
      flash("PAO 4-Eyes Binding Approved in IAM-KYB!");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Requires dgix_admin different from requestor");
    } finally {
      setBusy(null);
    }
  };

  const fireAssuranceTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = selectedProdForTrigger || String(live.products[0]?.product_id ?? "");
    const verId = String(live.versionsByProduct[pid]?.[0]?.version_id ?? "");
    if (!pid || !verId) return;
    setBusy("trigger");
    try {
      await apiFetch("/bff/v1/governance/assurance/triggers", {
        method: "POST",
        body: JSON.stringify({
          product_id: pid,
          product_version_id: verId,
          trigger_type: "security_cve",
          severity: triggerSeverity,
          summary: triggerSummary,
        }),
      });
      await refreshLive();
      flash("Continuous Assurance Trigger fired · Catalogue suspension & re-assessment event emitted!");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Requires dgix_admin / reviewer role");
    } finally {
      setBusy(null);
    }
  };

  const createAnchorAndVerify = async () => {
    setBusy("audit");
    try {
      await apiFetch("/bff/v1/audit/anchors", { method: "POST" });
      await refreshLive();
      flash("SHA-256 Audit Ledger checkpoint anchored & hash chain verified!");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Audit anchor requires dgix_admin role (dana.admin)");
    } finally {
      setBusy(null);
    }
  };

  const v = live.auditVerification;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>2-Member Ed25519 Council Quorum, PAO 4-Eyes, Continuous Assurance &amp; Tamper-Evident Audit Chain ({authSession?.user.username ?? "staff"})</Kicker>
          <H1>Council Quorum &amp; Audit Ledger</H1>
        </div>
        <Button onClick={() => void createAnchorAndVerify()} disabled={busy === "audit"}>
          {busy === "audit" ? "Verifying SHA-256 Chain..." : "Anchor & Verify Hash Chain"}
        </Button>
      </div>

      {/* Audit Hash Chain Status Banner */}
      <section className="rounded-lg bg-night-hero p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-sky">
              <span>Immutable SHA-256 Append-Only Audit Ledger</span>
              {v && (
                <span className={"rounded px-2 py-0.5 font-semibold " + (v.ok ? "bg-success/30 text-[#7FE0AE]" : "bg-danger text-white")}>
                  {v.ok ? "CHAIN INTEGRITY OK" : "BROKEN CHAIN"}
                </span>
              )}
            </div>
            <div className="text-2xl font-light">
              {v ? `${v.count} Chained Domain Events Verified (ok=${String(v.ok)})` : "Switch to dana.admin or auditor.user to inspect ledger entries"}
            </div>
            {v?.last_entry_hash && (
              <div className="font-mono text-xs text-white/70">Head SHA-256: {v.last_entry_hash}</div>
            )}
          </div>
          <div className="text-right text-xs text-white/70">
            <div>Ed25519 Council Approvals: <strong className="text-white">{live.approvals.length}</strong></div>
            <div>Authorised Country Readiness: <strong className="text-white">{live.countryReadiness.length}</strong></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 2-Member Product Council Quorum Voting */}
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">2-Member Product Council Quorum</h2>
            <span className="text-xs text-muted">Actors: council1 + council2</span>
          </div>
          <p className="mb-3 text-xs text-muted">
            Requires ≥2 distinct non-conflicted <code>council_member</code> votes to mint an Ed25519 signed <code>ApprovalRecord</code>. CureSphere Hospital HMS has 1/2 votes seeded so <code>council2</code> can complete quorum live!
          </p>
          <div className="flex flex-col divide-y divide-line">
            {live.assessments.map((ass) => {
              const aid = String(ass.assessment_id);
              const pid = String(ass.product_id);
              const prod = live.products.find((p) => String(p.product_id) === pid);
              const existingApprovals = live.approvals.filter((ap) => String(ap.assessment_id) === aid);
              const uaeApproved = existingApprovals.some((ap) => String(ap.country_code) === "UAE");
              return (
                <div key={aid} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{String(prod?.name ?? pid.slice(0, 8))}</div>
                    <div className="text-muted">
                      Assessment {aid.slice(0, 8)} · Signed countries:{" "}
                      {existingApprovals.map((a) => String(a.country_code)).join(", ") || "Awaiting 2nd Quorum Vote"}
                    </div>
                  </div>
                  {uaeApproved ? (
                    <Chip tone="success">Ed25519 Signed ({existingApprovals.length})</Chip>
                  ) : (
                    <Button size="sm" disabled={busy === aid} onClick={() => void castCouncilVote(ass, "UAE")}>
                      {busy === aid ? "Signing..." : "Cast UAE Quorum Vote"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {live.approvals.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="mb-2 text-xs font-semibold uppercase text-muted">Minted Ed25519 Approval Records</div>
              <div className="flex max-h-[150px] flex-col gap-1.5 overflow-y-auto">
                {live.approvals.map((ap) => {
                  const prod = live.products.find((p) => String(p.product_id) === String(ap.product_id));
                  return (
                    <div key={String(ap.approval_id)} className="rounded bg-[#F8FAFE] px-3 py-2 text-[11px]">
                      <div className="flex justify-between font-medium text-ink">
                        <span>{String(prod?.name ?? "Product")} · {String(ap.country_code)}</span>
                        <span className="font-mono text-primary">{String(ap.algorithm)} ({String(ap.kid)})</span>
                      </div>
                      <div className="truncate font-mono text-[10px] text-muted">Sig: {String(ap.signature)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* PAO 4-Eyes + Continuous Assurance Suspension Trigger */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">IAM 4-Eyes PAO Bindings</h2>
              <span className="text-xs text-muted">Approver: dana.admin</span>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {live.paoBindings.map((b) => {
                const pid = String(b.product_id);
                const prod = live.products.find((p) => String(p.product_id) === pid);
                const st = String(b.status ?? "approved");
                return (
                  <div key={pid} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <div className="font-medium text-ink">{String(prod?.name ?? pid.slice(0, 8))}</div>
                      <div className="text-muted">Conflict-free declaration: {String(b.no_conflict_declared ?? true)}</div>
                    </div>
                    {st === "approved" || st === "active" ? (
                      <Chip tone="success">Approved</Chip>
                    ) : (
                      <Button size="sm" disabled={busy === pid} onClick={() => void approvePao(pid)}>
                        Approve PAO
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Continuous Assurance Trigger</h2>
              <Chip tone="danger">Auto-Suspend on Critical</Chip>
            </div>
            <form onSubmit={fireAssuranceTrigger} className="flex flex-col gap-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedProdForTrigger}
                  onChange={(e) => setSelectedProdForTrigger(e.target.value)}
                  className="h-9 rounded border border-line bg-white px-2"
                >
                  {live.products.map((p) => (
                    <option key={String(p.product_id)} value={String(p.product_id)}>
                      {String(p.name)}
                    </option>
                  ))}
                </select>
                <select
                  value={triggerSeverity}
                  onChange={(e) => setTriggerSeverity(e.target.value as "high" | "critical")}
                  className="h-9 rounded border border-line bg-white px-2"
                >
                  <option value="critical">Critical CVE (Suspends Listing)</option>
                  <option value="high">High SLA Warning</option>
                </select>
              </div>
              <input
                value={triggerSummary}
                onChange={(e) => setTriggerSummary(e.target.value)}
                className="h-9 rounded border border-line px-2.5"
              />
              <Button type="submit" size="sm" variant="outline" disabled={busy === "trigger"}>
                {busy === "trigger" ? "Dispatching..." : "Emit Assurance Trigger"}
              </Button>
            </form>
          </section>
        </div>
      </div>

      {/* Append-Only Audit Entries Table */}
      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Append-Only Audit Event Stream ({live.auditEntries.length} latest shown)</h2>
          <span className="text-xs text-muted">Role: dgix_admin / auditor</span>
        </div>
        {live.auditEntries.length === 0 ? (
          <p className="text-xs text-muted">
            Switch to <code>dana.admin</code> or <code>auditor.user</code> in the top-right Account menu to inspect raw SHA-256 audit entries.
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="pb-2">Seq</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Entity</th>
                <th className="pb-2">Prev Hash</th>
                <th className="pb-2">Entry Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody>
              {[...live.auditEntries].reverse().slice(0, 25).map((e) => (
                <tr key={String(e.seq)} className="border-b border-[#F1F4FA] font-mono">
                  <td className="py-2 pr-3 font-semibold text-primary">#{String(e.seq)}</td>
                  <td className="py-2 pr-3 font-sans font-medium text-ink">{String(e.action)}</td>
                  <td className="py-2 pr-3 text-muted">{String(e.entity_type)}:{String(e.entity_id).slice(0, 8)}</td>
                  <td className="py-2 pr-3 text-muted">{String(e.prev_hash).slice(0, 16)}…</td>
                  <td className="py-2 text-success">{String(e.entry_hash).slice(0, 24)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {toast}
    </div>
  );
}

