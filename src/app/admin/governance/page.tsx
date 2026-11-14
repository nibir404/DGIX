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
      flash(`Signed distribution agreement and approved ${countryCode} price list required before Council vote.`);
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
          reason: `Council member verified assurance checks, IP rights, and ${countryCode} readiness.`,
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
        flash("Council quorum reached · approval certificate issued");
      } else {
        flash("Council approval vote recorded · awaiting second council member vote");
      }
      await refreshLive();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Council voting requires Product Council membership");
    } finally {
      setBusy(null);
    }
  };

  const approvePao = async (productId: string) => {
    setBusy(productId);
    try {
      await apiFetch(`/bff/v1/iam/pao-bindings/${productId}/approve`, { method: "POST" });
      await refreshLive();
      flash("Product assurance owner assignment approved");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Requires approval by a separate platform administrator");
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
          trigger_type: "critical_cve",
          severity: triggerSeverity,
          summary: triggerSummary,
        }),
      });
      await refreshLive();
      flash("Assurance alert recorded · re-verification initiated");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Requires administrator or assurance reviewer access");
    } finally {
      setBusy(null);
    }
  };

  const createAnchorAndVerify = async () => {
    setBusy("audit");
    try {
      await apiFetch("/bff/v1/audit/anchors", { method: "POST" });
      await refreshLive();
      flash("Audit log checkpoint recorded and verified");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Recording audit checkpoints requires platform administrator access");
    } finally {
      setBusy(null);
    }
  };

  const v = live.auditVerification;
  const isAdmin = authSession?.user.roles.includes("dgix_admin");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>Product council approvals, assurance ownership &amp; compliance audit log</Kicker>
          <H1>Council &amp; Compliance Audit</H1>
        </div>
        {isAdmin && (
          <Button onClick={() => void createAnchorAndVerify()} disabled={busy === "audit"}>
            {busy === "audit" ? "Recording checkpoint..." : "Record audit checkpoint"}
          </Button>
        )}
      </div>

      {/* Audit & Council Status Banner */}
      <section className="rounded-lg bg-night-hero p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-sky">
              <span>Compliance &amp; Audit Status</span>
              {v && (
                <span className={"rounded px-2 py-0.5 font-semibold " + (v.ok ? "bg-success/30 text-[#7FE0AE]" : "bg-danger text-white")}>
                  {v.ok ? "INTEGRITY VERIFIED" : "REVIEW REQUIRED"}
                </span>
              )}
            </div>
            <div className="text-2xl font-light">
              {v ? `${v.count} verified platform events recorded` : `${live.assessments.length} active product assessments under governance`}
            </div>
            {v?.last_entry_hash && (
              <div className="font-mono text-xs text-white/70">Checkpoint reference: {v.last_entry_hash.slice(0, 24)}…</div>
            )}
          </div>
          <div className="text-right text-xs text-white/70">
            <div>Council approvals issued: <strong className="text-white">{live.approvals.length}</strong></div>
            <div>Verified market clearances: <strong className="text-white">{live.countryReadiness.length}</strong></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Product Council Quorum Voting */}
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Product Council Approvals</h2>
            <span className="text-xs text-muted">Two-member quorum</span>
          </div>
          <p className="mb-3 text-xs text-muted">
            Regional catalogue eligibility requires approval votes from at least two independent, non-conflicted Product Council members.
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
                      Ref {aid.slice(0, 8)} · Approved markets:{" "}
                      {existingApprovals.map((a) => String(a.country_code)).join(", ") || "Awaiting council quorum"}
                    </div>
                  </div>
                  {uaeApproved ? (
                    <Chip tone="success">Council Approved ({existingApprovals.length})</Chip>
                  ) : (
                    <Button size="sm" disabled={busy === aid} onClick={() => void castCouncilVote(ass, "UAE")}>
                      {busy === aid ? "Recording..." : "Approve for UAE"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {live.approvals.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="mb-2 text-xs font-semibold uppercase text-muted">Issued Council Approvals</div>
              <div className="flex max-h-[150px] flex-col gap-1.5 overflow-y-auto">
                {live.approvals.map((ap) => {
                  const prod = live.products.find((p) => String(p.product_id) === String(ap.product_id));
                  return (
                    <div key={String(ap.approval_id)} className="rounded bg-[#F8FAFE] px-3 py-2 text-[11px]">
                      <div className="flex justify-between font-medium text-ink">
                        <span>{String(prod?.name ?? "Product")} · {String(ap.country_code)}</span>
                        <span className="text-primary">{String(ap.readiness_tier ?? "Approved").replace(/_/g, " ")}</span>
                      </div>
                      <div className="truncate font-mono text-[10px] text-muted">Certificate ID: {String(ap.approval_id).slice(0, 18)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* PAO + Continuous Assurance Suspension Trigger */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Product Assurance Owners</h2>
              <span className="text-xs text-muted">Conflict-of-interest check</span>
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
                      <div className="text-muted">Conflict-free declaration confirmed</div>
                    </div>
                    {st === "approved" || st === "active" ? (
                      <Chip tone="success">Approved</Chip>
                    ) : (
                      <Button size="sm" disabled={busy === pid} onClick={() => void approvePao(pid)}>
                        Approve owner
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Continuous Assurance Alert</h2>
              <Chip tone="danger">Suspends listing on critical</Chip>
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
                  <option value="critical">Critical security advisory (Suspends listing)</option>
                  <option value="high">High SLA warning</option>
                </select>
              </div>
              <input
                value={triggerSummary}
                onChange={(e) => setTriggerSummary(e.target.value)}
                className="h-9 rounded border border-line px-2.5"
              />
              <Button type="submit" size="sm" variant="outline" disabled={busy === "trigger"}>
                {busy === "trigger" ? "Recording..." : "Record assurance alert"}
              </Button>
            </form>
          </section>
        </div>
      </div>

      {/* Audit Entries Table */}
      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Compliance Audit Log ({live.auditEntries.length} recent events)</h2>
          <span className="text-xs text-muted">Read-only compliance record</span>
        </div>
        {live.auditEntries.length === 0 ? (
          <p className="text-xs text-muted">
            Detailed audit log entries are visible to authorised compliance auditors and platform administrators.
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="pb-2">Seq</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Entity</th>
                <th className="pb-2">Prev Reference</th>
                <th className="pb-2">Event Digest</th>
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

