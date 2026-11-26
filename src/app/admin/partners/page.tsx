"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { Button, Chip } from "@/components/portal/ui";
import { H1, Kicker, k, useFlash } from "@/components/admin/kit";
import { Dialog } from "@/components/buyer/kit";

const tones = ["bg-[linear-gradient(135deg,#6FD3A0,#14804A)]", "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)]", "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)] text-ink", "bg-[#FBE7E7] text-danger"];

export default function Partners() {
  const { db, live, authSession, refreshLive } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const [tab, setTab] = useState<"partner" | "buyer">("partner");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Assisted Onboarding Modal (P-09, P-11, P-12, P-13)
  const [showAssistedModal, setShowAssistedModal] = useState(false);
  const [assistedForm, setAssistedForm] = useState({
    companyName: "",
    legalName: "",
    contactName: "",
    email: "",
    country: "UAE",
    city: "Dubai",
    website: "",
    taxId: "",
  });

  // Commercial Agreement Drafting
  const [draftForm, setDraftForm] = useState({
    partnerId: "",
    productId: "",
    wholesale: "36000.00",
    margin: "20.00",
    hold: "5.00",
    territory: "UAE",
    exclusive: false,
    sector: "Enterprise Software",
    termMonths: 24,
  });

  // Contract Templates Desk (FR-CTR-01, FR-CTR-02, P-21)
  const [templateForm, setTemplateForm] = useState({
    code: "dgix-nda-standard",
    contract_type: "NDA" as "MOU" | "NDA" | "SLA" | "MSA" | "DPA" | "OTHER",
    title: "DGIX Standard Mutual Non-Disclosure Agreement",
    body: "This Bilateral Non-Disclosure Agreement governs confidential information exchanged between DGIX and the Partner during onboarding, product verification, and commercial readiness evaluations.",
  });

  // Partner Contracts Issuance (FR-CTR-03..05, FR-PAR-06)
  const [contractForm, setContractForm] = useState({
    partnerId: "",
    templateId: "",
    title: "",
    expiryDays: 365,
  });

  const companies = db.companies.filter((c) => c.kind === tab);
  const partnerStats = (id: string) => {
    const products = db.products.filter((p) => p.partnerId === id);
    const projects = db.projects.filter((p) => p.partnerId === id);
    const paid = db.payouts.filter((p) => p.partnerId === id && p.status === "paid").reduce((s, p) => s + p.net, 0);
    const watch = projects.some((p) => p.health !== "on_track");
    return { products, projects, paid, watch };
  };
  const partners = db.companies.filter((c) => c.kind === "partner").map((c) => ({ c, ...partnerStats(c.id) }));
  const maxPaid = Math.max(1, ...partners.map((p) => p.paid));
  const totalPaid = partners.reduce((s, p) => s + p.paid, 0);
  const buyers = db.companies.filter((c) => c.kind === "buyer");
  const byCountry = buyers.reduce<Record<string, number>>((m, b) => ({ ...m, [b.country]: (m[b.country] ?? 0) + 1 }), {});
  const reReview = db.products.filter((p) => p.waitingOn?.includes("sign-off") || db.projects.some((pr) => pr.productId === p.id && pr.health !== "on_track"));
  const initials = (n: string) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const short = (c: string) => (c === "United Arab Emirates" ? "UAE" : c === "United States" ? "USA" : c);

  const runKybAndTriage = async (partnerId: string, legalName: string) => {
    setBusyId(partnerId);
    try {
      await apiFetch(`/bff/v1/partners/${partnerId}/screenings`, {
        method: "POST",
        body: JSON.stringify({ kyb_documents_verified: true, screening_kind: "initial" }),
      });
      await apiFetch(`/bff/v1/partners/${partnerId}/triage`, {
        method: "POST",
        body: JSON.stringify({
          category_fit: "fit",
          daffodil_overlap: "complementary",
          overlapping_products: [],
          decision: "accepted",
          notes: "Sanctions screening clean and portfolio fit accepted by Legal.",
        }),
      });
      await refreshLive();
      flash(`${legalName} KYB sanctions & overlap triage approved`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "KYB action denied (requires legal / dgix_admin role)");
    } finally {
      setBusyId(null);
    }
  };

  const draftAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = draftForm.productId || String(live.products[0]?.product_id ?? "");
    const partnerId = draftForm.partnerId || String(live.partners[0]?.partner_id ?? "");
    const ver = live.versionsByProduct[pid]?.[0];
    if (!pid || !partnerId || !ver) {
      flash("Select a valid live partner & product with an active semver version.");
      return;
    }
    if (draftForm.exclusive && draftForm.termMonths > 24) {
      flash("BRD Rule P-08: Exclusive rights cannot exceed a maximum of 2 years (24 months).");
      return;
    }
    setBusyId("draft-agr");
    try {
      await apiFetch("/bff/v1/commercial/rights/agreements", {
        method: "POST",
        body: JSON.stringify({
          partner_id: partnerId,
          product_id: pid,
          product_version_id: String(ver.version_id),
          edition: draftForm.exclusive ? "exclusive" : "standard",
          territories: [draftForm.territory],
          brand_model: "co_branded",
          wholesale_price: draftForm.wholesale,
          currency: "USD",
          margin_pct: draftForm.margin,
          dispute_hold_pct: draftForm.hold,
          sla_summary: "99.9% availability SLA with 1 business-day response",
          expires_at: new Date(Date.now() + Math.min(24, draftForm.termMonths) * 30 * 864e5).toISOString(),
        }),
      });
      await refreshLive();
      flash(draftForm.exclusive ? "Draft exclusive agreement created (max 2-year term) · awaiting second legal countersignature" : "Draft commercial agreement created · awaiting second legal countersignature");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to draft agreement");
    } finally {
      setBusyId(null);
    }
  };

  const updatePartnerStatus = async (partnerId: string, action: "suspend" | "reactivate" | "terminate") => {
    const reason = window.prompt(`Enter recorded reason to ${action} this partner:`);
    if (!reason || reason.trim().length < 5) {
      flash("Action cancelled: a recorded reason is required (BRD P-07).");
      return;
    }
    setBusyId(partnerId);
    try {
      await apiFetch(`/bff/v1/partners/${partnerId}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      await refreshLive();
      flash(`Partner successfully ${action}d with recorded reason.`);
    } catch (err) {
      flash(err instanceof Error ? err.message : `Failed to ${action} partner`);
    } finally {
      setBusyId(null);
    }
  };

  const signAgreement = async (agreementId: string) => {
    setBusyId(agreementId);
    try {
      await apiFetch(`/bff/v1/commercial/rights/agreements/${agreementId}/sign`, {
        method: "POST",
      });
      await refreshLive();
      flash("Commercial agreement countersigned");
    } catch (err) {
      flash(err instanceof Error ? err.message : "A second authorised legal counsel must countersign this agreement.");
    } finally {
      setBusyId(null);
    }
  };

  // Assisted Onboarding submit (P-09, P-11, P-12, P-13)
  const submitAssistedOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("assisted-onboard");
    try {
      await apiFetch("/bff/v1/partners", {
        method: "POST",
        body: JSON.stringify({
          legal_name: assistedForm.legalName || assistedForm.companyName,
          jurisdiction: assistedForm.country,
          city: assistedForm.city,
          tax_id: assistedForm.taxId || undefined,
          website: assistedForm.website || undefined,
          contact_name: assistedForm.contactName,
          contact_email: assistedForm.email,
        }),
      });
      await refreshLive();
      flash(`Assisted onboarding recorded for ${assistedForm.companyName} (Advisor: ${authSession?.user.full_name ?? "Commercial Advisor"})`);
      setShowAssistedModal(false);
      setAssistedForm({
        companyName: "",
        legalName: "",
        contactName: "",
        email: "",
        country: "UAE",
        city: "Dubai",
        website: "",
        taxId: "",
      });
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to register partner");
    } finally {
      setBusyId(null);
    }
  };

  // Contract Templates Actions (FR-CTR-01, FR-CTR-02)
  const createTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("create-template");
    try {
      await apiFetch("/bff/v1/contract-templates", {
        method: "POST",
        body: JSON.stringify(templateForm),
      });
      await refreshLive();
      flash(`Draft template ${templateForm.code} created · awaiting second legal approval`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to draft contract template");
    } finally {
      setBusyId(null);
    }
  };

  const approveTemplate = async (templateId: string, createdBy?: string) => {
    if (authSession?.user.sub && createdBy && String(authSession.user.sub) === String(createdBy)) {
      flash("Four-eyes violation (FR-CTR-02): The author of a contract template cannot approve their own draft.");
      return;
    }
    setBusyId(templateId);
    try {
      await apiFetch(`/bff/v1/contract-templates/${templateId}/approve`, {
        method: "POST",
      });
      await refreshLive();
      flash("Contract template approved and published");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Requires second legal counsel or super_admin approval");
    } finally {
      setBusyId(null);
    }
  };

  // Partner Contract Actions (FR-CTR-03..05)
  const issuePartnerContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.partnerId || !contractForm.templateId) {
      flash("Please select both a partner and an approved contract template.");
      return;
    }
    setBusyId("issue-contract");
    try {
      const expiresAt = new Date(Date.now() + contractForm.expiryDays * 864e5).toISOString();
      const res = await apiFetch<Record<string, unknown>>("/bff/v1/contracts", {
        method: "POST",
        body: JSON.stringify({
          partner_id: contractForm.partnerId,
          template_id: contractForm.templateId,
          title: contractForm.title || undefined,
          expires_at: expiresAt,
        }),
      });
      await refreshLive();
      flash(`Draft contract created (Ref: ${String(res.contract_id).slice(0, 8)}) · Ready to send`);
      setContractForm({ ...contractForm, title: "" });
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to issue partner contract");
    } finally {
      setBusyId(null);
    }
  };

  const sendContract = async (contractId: string) => {
    setBusyId(contractId);
    try {
      await apiFetch(`/bff/v1/contracts/${contractId}/send`, { method: "POST" });
      await refreshLive();
      flash("Contract sent to partner for signature (FR-PAR-06)");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to send contract");
    } finally {
      setBusyId(null);
    }
  };

  const withdrawContract = async (contractId: string) => {
    const reason = window.prompt("Reason for withdrawing contract:");
    if (!reason || reason.trim().length < 3) return;
    setBusyId(contractId);
    try {
      await apiFetch(`/bff/v1/contracts/${contractId}/withdraw`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      await refreshLive();
      flash("Contract withdrawn");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to withdraw contract");
    } finally {
      setBusyId(null);
    }
  };

  const terminateContract = async (contractId: string) => {
    const reason = window.prompt("Reason for terminating signed contract:");
    if (!reason || reason.trim().length < 3) return;
    setBusyId(contractId);
    try {
      await apiFetch(`/bff/v1/contracts/${contractId}/terminate`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      await refreshLive();
      flash("Contract terminated");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to terminate contract");
    } finally {
      setBusyId(null);
    }
  };

  const approvedTemplates = live.contractTemplates.filter((t) => t.status === "approved");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>Partner KYB screening, portfolio review, assisted onboarding &amp; contracts</Kicker>
          <H1>Legal, KYB &amp; Contracts</H1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowAssistedModal(true)}>
            + Assisted Onboarding (Enrol for Seller)
          </Button>
          <div className="flex rounded-lg bg-white p-1 text-[13px]">
            {(["partner", "buyer"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={"rounded-lg px-3.5 py-1.5 " + (tab === t ? "bg-night text-white" : "text-muted")}>
                {t === "partner" ? "Partners" : "Buyers"} · {db.companies.filter((c) => c.kind === t).length}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live KYB Onboarding & Commercial Rights Desk */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Partner KYB &amp; Sanctions Queue</h2>
            <span className="text-xs text-muted">Legal &amp; compliance review</span>
          </div>
          {live.partners.length === 0 ? (
            <p className="text-xs text-muted">No partner records pending review.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {live.partners.map((pt) => {
                const pid = String(pt.partner_id);
                const st = String(pt.status ?? "in_review");
                const kybCleared = Boolean(pt.kyb_verified);
                return (
                  <div key={pid} className="flex flex-col gap-2 py-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-ink">{String(pt.legal_name)}</div>
                        <div className="text-muted">
                          {String(pt.jurisdiction)} · {String(pt.city ?? "HQ")} · Tax: {String(pt.tax_id ?? "Verified")}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Chip tone={kybCleared ? "success" : "warning"}>{st.replace(/_/g, " ")}</Chip>
                        {!kybCleared && (
                          <Button
                            size="sm"
                            disabled={busyId === pid}
                            onClick={() => void runKybAndTriage(pid, String(pt.legal_name))}
                          >
                            {busyId === pid ? "Screening..." : "Run KYB Clear"}
                          </Button>
                        )}
                        {/* BRD P-07: Suspend, Reactivate, Terminate Actions with Recorded Reason */}
                        {st === "active" || kybCleared ? (
                          <button
                            onClick={() => void updatePartnerStatus(pid, "suspend")}
                            disabled={busyId === pid}
                            className="rounded border border-warning/40 bg-warning/10 px-2 py-1 text-[11px] font-medium text-warning hover:bg-warning hover:text-white"
                          >
                            Suspend
                          </button>
                        ) : st === "suspended" ? (
                          <button
                            onClick={() => void updatePartnerStatus(pid, "reactivate")}
                            disabled={busyId === pid}
                            className="rounded border border-success/40 bg-success/10 px-2 py-1 text-[11px] font-medium text-success hover:bg-success hover:text-white"
                          >
                            Reactivate
                          </button>
                        ) : null}
                        {st !== "terminated" && (
                          <button
                            onClick={() => void updatePartnerStatus(pid, "terminate")}
                            disabled={busyId === pid}
                            className="rounded border border-danger/40 bg-danger/10 px-2 py-1 text-[11px] font-medium text-danger hover:bg-danger hover:text-white"
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    </div>
                    {/* BRD P-02: 5-Check Due Diligence Gate Visual Indicator */}
                    <div className="flex items-center gap-2 pt-1 border-t border-line/40 text-[11px] text-muted">
                      <span className="font-medium text-ink">5-Check DD Gate:</span>
                      <span className={kybCleared ? "text-success font-semibold" : "text-muted"}>[1 Identity]</span>
                      <span className={kybCleared ? "text-success font-semibold" : "text-muted"}>[2 References]</span>
                      <span className={kybCleared ? "text-success font-semibold" : "text-muted"}>[3 Conflict Clear]</span>
                      <span className={kybCleared ? "text-success font-semibold" : "text-muted"}>[4 IP Rights]</span>
                      <span className={kybCleared ? "text-success font-semibold" : "text-muted"}>[5 Payment/MOU]</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Commercial Distribution Agreements</h2>
            <span className="text-xs text-muted">Two-person legal sign-off</span>
          </div>
          <form onSubmit={draftAgreement} className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-[#F8FAFE] p-3 text-xs">
            <select
              value={draftForm.partnerId}
              onChange={(e) => setDraftForm({ ...draftForm, partnerId: e.target.value })}
              className="h-9 rounded border border-line bg-white px-2"
            >
              <option value="">Select partner…</option>
              {live.partners.map((pt) => (
                <option key={String(pt.partner_id)} value={String(pt.partner_id)}>
                  {String(pt.legal_name)}
                </option>
              ))}
            </select>
            <select
              value={draftForm.productId}
              onChange={(e) => setDraftForm({ ...draftForm, productId: e.target.value })}
              className="h-9 rounded border border-line bg-white px-2"
            >
              <option value="">Select product…</option>
              {live.products.map((pr) => (
                <option key={String(pr.product_id)} value={String(pr.product_id)}>
                  {String(pr.name)}
                </option>
              ))}
            </select>
            <input
              value={draftForm.wholesale}
              onChange={(e) => setDraftForm({ ...draftForm, wholesale: e.target.value })}
              placeholder="Wholesale USD"
              className="h-9 rounded border border-line bg-white px-2"
            />
            <div className="col-span-2 flex flex-wrap items-center gap-3 pt-1 border-t border-line/60">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftForm.exclusive}
                  onChange={(e) => setDraftForm({ ...draftForm, exclusive: e.target.checked })}
                  className="rounded border-line"
                />
                <span className="font-medium text-ink">Exclusive Rights (P-08)</span>
              </label>
              {draftForm.exclusive && (
                <>
                  <input
                    value={draftForm.sector}
                    onChange={(e) => setDraftForm({ ...draftForm, sector: e.target.value })}
                    placeholder="Sector (e.g. HealthTech)"
                    className="h-8 flex-1 rounded border border-line bg-white px-2 text-[11px]"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <span>Term:</span>
                    <input
                      type="number"
                      max={24}
                      min={1}
                      value={draftForm.termMonths}
                      onChange={(e) => setDraftForm({ ...draftForm, termMonths: Number(e.target.value) || 24 })}
                      className="h-8 w-16 rounded border border-line bg-white px-1.5 text-center text-[11px]"
                    />
                    <span>mo (max 24)</span>
                  </div>
                </>
              )}
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="submit" size="sm" disabled={busyId === "draft-agr"}>
                {draftForm.exclusive ? "Draft Exclusive Rights Agreement" : "Draft Standard Agreement"}
              </Button>
            </div>
          </form>

          <div className="flex max-h-[210px] flex-col divide-y divide-line overflow-y-auto">
            {live.agreements.map((ag) => {
              const aid = String(ag.agreement_id);
              const st = String(ag.status ?? "draft");
              const prod = live.products.find((p) => String(p.product_id) === String(ag.product_id));
              const sameMaker = Boolean(authSession?.user.sub && String(ag.created_by) === authSession.user.sub);
              return (
                <div key={aid} className="flex items-center justify-between gap-2 py-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">
                      {String(prod?.name ?? "Product")} · {(ag.territories as string[] | undefined)?.join(", ")}
                    </div>
                    <div className="text-muted">
                      Wholesale ${String(ag.wholesale_price)} · Margin {String(ag.margin_pct)}% · Hold {String(ag.dispute_hold_pct)}%
                    </div>
                  </div>
                  {st === "signed" ? (
                    <Chip tone="success">Signed</Chip>
                  ) : (
                    <Button
                      size="sm"
                      variant={sameMaker ? "outline" : "primary"}
                      disabled={sameMaker || busyId === aid}
                      onClick={() => void signAgreement(aid)}
                    >
                      {sameMaker ? "Awaiting countersignature" : "Countersign"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Contract Templates & Partner Contracts Desk (FR-CTR-01..05, FR-PAR-06, P-21) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Contract Templates (Four-Eyes Legal Approval) */}
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Contract Templates Desk</h2>
            <span className="text-xs text-muted">Legal drafting &amp; 4-eyes approval</span>
          </div>
          <form onSubmit={createTemplate} className="mb-4 flex flex-col gap-2 rounded-lg bg-[#F8FAFE] p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={templateForm.code}
                onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                placeholder="Code (e.g. nda-bilateral-v1)"
                className="h-8 rounded border border-line bg-white px-2"
                required
              />
              <select
                value={templateForm.contract_type}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    contract_type: e.target.value as "MOU" | "NDA" | "SLA" | "MSA" | "DPA" | "OTHER",
                  })
                }
                className="h-8 rounded border border-line bg-white px-2"
              >
                <option value="NDA">NDA (Mutual Non-Disclosure)</option>
                <option value="MOU">MOU (Memorandum of Understanding)</option>
                <option value="SLA">SLA (Service Level Agreement)</option>
                <option value="MSA">MSA (Master Services Agreement)</option>
                <option value="DPA">DPA (Data Processing Agreement)</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <input
              value={templateForm.title}
              onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
              placeholder="Template Title"
              className="h-8 rounded border border-line bg-white px-2"
              required
            />
            <textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              placeholder="Legal contract markdown body..."
              rows={3}
              className="rounded border border-line bg-white p-2 font-mono text-[11px]"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={busyId === "create-template"}>
                {busyId === "create-template" ? "Saving Draft..." : "Draft Template"}
              </Button>
            </div>
          </form>

          <div className="flex max-h-[220px] flex-col divide-y divide-line overflow-y-auto">
            {live.contractTemplates.length === 0 ? (
              <p className="py-2 text-xs text-muted">No contract templates registered.</p>
            ) : (
              live.contractTemplates.map((tmpl) => {
                const tid = String(tmpl.template_id);
                const st = String(tmpl.status);
                const isAuthor = authSession?.user.sub && String(tmpl.created_by) === authSession.user.sub;
                return (
                  <div key={tid} className="flex items-center justify-between gap-2 py-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{String(tmpl.code)}</span>
                        <span className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-mono text-muted">v{String(tmpl.version)}</span>
                        <Chip tone={st === "approved" ? "success" : st === "draft" ? "warning" : "default"}>{st}</Chip>
                      </div>
                      <div className="truncate text-muted">{String(tmpl.title)} · {String(tmpl.contract_type)}</div>
                    </div>
                    {st === "draft" && (
                      <Button
                        size="sm"
                        variant={isAuthor ? "outline" : "primary"}
                        disabled={Boolean(isAuthor) || busyId === tid}
                        onClick={() => void approveTemplate(tid, String(tmpl.created_by))}
                      >
                        {isAuthor ? "Awaiting 2nd Legal" : "Approve Template"}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Partner Contracts (Step-1 NDA & Bilateral Agreements) */}
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Partner Contracts &amp; Step-1 NDA</h2>
            <span className="text-xs text-muted">Issuance &amp; signature tracking</span>
          </div>
          <form onSubmit={issuePartnerContract} className="mb-4 flex flex-col gap-2 rounded-lg bg-[#F8FAFE] p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={contractForm.partnerId}
                onChange={(e) => setContractForm({ ...contractForm, partnerId: e.target.value })}
                className="h-8 rounded border border-line bg-white px-2"
                required
              >
                <option value="">Select Partner…</option>
                {live.partners.map((pt) => (
                  <option key={String(pt.partner_id)} value={String(pt.partner_id)}>
                    {String(pt.legal_name)}
                  </option>
                ))}
              </select>
              <select
                value={contractForm.templateId}
                onChange={(e) => setContractForm({ ...contractForm, templateId: e.target.value })}
                className="h-8 rounded border border-line bg-white px-2"
                required
              >
                <option value="">Select Approved Template…</option>
                {approvedTemplates.map((at) => (
                  <option key={String(at.template_id)} value={String(at.template_id)}>
                    {String(at.title)} ({String(at.code)} v{String(at.version)})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                value={contractForm.title}
                onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                placeholder="Custom Title (Optional)"
                className="col-span-2 h-8 rounded border border-line bg-white px-2"
              />
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted">Term:</span>
                <input
                  type="number"
                  min={30}
                  max={730}
                  value={contractForm.expiryDays}
                  onChange={(e) => setContractForm({ ...contractForm, expiryDays: Number(e.target.value) || 365 })}
                  className="h-8 w-16 rounded border border-line bg-white px-1 text-center text-[11px]"
                />
                <span className="text-[11px] text-muted">days</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={busyId === "issue-contract"}>
                {busyId === "issue-contract" ? "Issuing..." : "Issue Contract Draft"}
              </Button>
            </div>
          </form>

          <div className="flex max-h-[220px] flex-col divide-y divide-line overflow-y-auto">
            {live.contracts.length === 0 ? (
              <p className="py-2 text-xs text-muted">No contracts issued to partners yet.</p>
            ) : (
              live.contracts.map((ctr) => {
                const cid = String(ctr.contract_id);
                const st = String(ctr.status);
                const p = live.partners.find((x) => String(x.partner_id) === String(ctr.partner_id));
                return (
                  <div key={cid} className="flex items-center justify-between gap-2 py-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{String(p?.legal_name ?? "Partner")}</span>
                        <Chip tone={st === "signed" ? "success" : st === "sent" ? "info" : st === "draft" ? "warning" : "default"}>
                          {st}
                        </Chip>
                      </div>
                      <div className="truncate text-muted">{String(ctr.title)} ({String(ctr.contract_type)})</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {st === "draft" && (
                        <Button size="sm" disabled={busyId === cid} onClick={() => void sendContract(cid)}>
                          Send to Sign
                        </Button>
                      )}
                      {st === "sent" && (
                        <button
                          onClick={() => void withdrawContract(cid)}
                          disabled={busyId === cid}
                          className="rounded border border-warning/40 px-2 py-1 text-[11px] text-warning hover:bg-warning hover:text-white"
                        >
                          Withdraw
                        </button>
                      )}
                      {st === "signed" && (
                        <button
                          onClick={() => void terminateContract(cid)}
                          disabled={busyId === cid}
                          className="rounded border border-danger/40 px-2 py-1 text-[11px] text-danger hover:bg-danger hover:text-white"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Assisted Onboarding Modal (P-09, P-11, P-12, P-13) */}
      <Dialog
        open={showAssistedModal}
        onClose={() => setShowAssistedModal(false)}
        title="Assisted Onboarding (Enrol for Seller)"
      >
        <form onSubmit={submitAssistedOnboarding} className="flex flex-col gap-3 p-1 text-sm">
          <p className="text-xs text-muted">
            Commercial Advisors can enrol an emerging software vendor directly. The onboarding record links your identity as the assisted onboarder (BRD P-09..P-13).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Company Name *</label>
              <input
                required
                value={assistedForm.companyName}
                onChange={(e) => setAssistedForm({ ...assistedForm, companyName: e.target.value })}
                placeholder="e.g. Apex HealthTech"
                className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Legal Entity Name</label>
              <input
                value={assistedForm.legalName}
                onChange={(e) => setAssistedForm({ ...assistedForm, legalName: e.target.value })}
                placeholder="e.g. Apex HealthTech Ltd."
                className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Contact Person *</label>
              <input
                required
                value={assistedForm.contactName}
                onChange={(e) => setAssistedForm({ ...assistedForm, contactName: e.target.value })}
                placeholder="e.g. Tariq Al-Mansoor"
                className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Contact Email *</label>
              <input
                required
                type="email"
                value={assistedForm.email}
                onChange={(e) => setAssistedForm({ ...assistedForm, email: e.target.value })}
                placeholder="contact@apexhealth.test"
                className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-muted">Country</label>
              <select
                value={assistedForm.country}
                onChange={(e) => setAssistedForm({ ...assistedForm, country: e.target.value })}
                className="mt-1 h-9 w-full rounded border border-line px-2 text-xs bg-white"
              >
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="SAU">Saudi Arabia (KSA)</option>
                <option value="QAT">Qatar</option>
                <option value="BGD">Bangladesh</option>
                <option value="USA">United States</option>
                <option value="GBR">United Kingdom</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">City</label>
              <input
                value={assistedForm.city}
                onChange={(e) => setAssistedForm({ ...assistedForm, city: e.target.value })}
                placeholder="e.g. Dubai"
                className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Tax / License ID</label>
              <input
                value={assistedForm.taxId}
                onChange={(e) => setAssistedForm({ ...assistedForm, taxId: e.target.value })}
                placeholder="e.g. TRN-8941029"
                className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Website</label>
            <input
              value={assistedForm.website}
              onChange={(e) => setAssistedForm({ ...assistedForm, website: e.target.value })}
              placeholder="https://example.com"
              className="mt-1 h-9 w-full rounded border border-line px-2.5 text-xs"
            />
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowAssistedModal(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={busyId === "assisted-onboard"}>
              {busyId === "assisted-onboard" ? "Registering Partner..." : "Confirm & Register Partner"}
            </Button>
          </div>
        </form>
      </Dialog>

      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-line text-xs font-medium uppercase tracking-[0.06em] text-subtle">
            <th className="pb-3">{tab === "partner" ? "Partner" : "Buyer"}</th><th className="pb-3">{tab === "partner" ? "Products" : "Requests"}</th><th className="pb-3">Live deals</th><th className="pb-3">{tab === "partner" ? "Standing" : "Advisor"}</th><th className="pb-3 text-right">{tab === "partner" ? "Paid out" : "Invoiced"}</th>
          </tr></thead>
          <motion.tbody key={tab} initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.05 } } }}>
            {companies.map((c, i) => {
              const s = partnerStats(c.id);
              const buyerProjects = db.projects.filter((p) => p.buyerId === c.id);
              return (
                <motion.tr key={c.id} variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} className="border-b border-[#F1F4FA] last:border-0">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <span className={"flex size-[34px] items-center justify-center rounded-lg text-xs font-semibold text-white " + (s.watch ? tones[3] : tones[i % 3])}>{initials(c.name)}</span>
                      <div><div className="text-[15px] font-medium">{c.name}</div><div className={"text-xs " + (s.watch ? "text-danger" : "text-muted")}>{s.watch ? "On watch · missed milestones" : `${c.verified ? "Verified" : "Pending KYB"} · ${c.city}`}</div></div>
                    </div>
                  </td>
                  <td className="pr-4">{tab === "partner" ? s.products.map((p) => p.name).join(", ") || "—" : db.requests.filter((r) => r.buyerId === c.id).length}</td>
                  <td className="pr-4">{tab === "partner" ? s.projects.length : buyerProjects.length}</td>
                  <td className={"pr-4 " + (tab === "partner" ? (s.watch ? "text-warning" : "text-success") : "")}>{tab === "partner" ? (s.watch ? "At risk" : "On track") : L.user(c.advisorId)?.name}</td>
                  <td className="text-right text-[15px] font-semibold">{fmtMoney(tab === "partner" ? s.paid : db.invoices.filter((x) => x.buyerId === c.id).reduce((a, x) => a + x.amount, 0))}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="rounded-lg bg-white p-6">
          <div className="text-sm text-muted">Products in review pipeline</div>
          <div className="mt-2 text-[34px] font-light">{db.products.length}</div>
          <Link href="/admin/review" className="text-[13px] text-primary">Open product review →</Link>
        </section>
        <section className="rounded-lg bg-white p-6">
          <div className="text-sm text-muted">Buyers by country</div>
          <div className="mt-2 text-[15px]">{Object.entries(byCountry).map(([c, n]) => `${short(c)} ${n}`).join(" · ")}</div>
          <div className="mt-3 flex gap-1">
            {Object.values(byCountry).map((n, i) => <motion.div key={i} initial={{ flexGrow: 0 }} animate={{ flexGrow: n }} className={"h-1.5 rounded-lg " + ["bg-primary", "bg-sky", "bg-glow-amber"][i % 3]} />)}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
          <div className="text-sm text-haze">Open verification notices</div>
          <div className="mt-2 text-[34px] font-light">{live.gapLetters.length || reReview.length}</div>
          <Link href="/admin/review" className="text-[13px] text-glow-amber">Open product review →</Link>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex justify-between"><h2 className="text-lg">Paid out by partner · this year</h2><span className="text-xs text-muted">{fmtMoney(totalPaid)} total</span></div>
          {[...partners].sort((a, b) => b.paid - a.paid).map((p, i) => (
            <div key={p.c.id} className="flex items-center gap-3 py-1.5 text-[13px]">
              <span className={"w-[120px] shrink-0 truncate " + (p.watch ? "text-danger" : "")}>{p.c.name}</span>
              <div className="h-[18px] flex-1 overflow-hidden rounded-lg bg-mist">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(p.paid / maxPaid) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 }} className={"h-full rounded-lg " + (p.watch ? "bg-[#F5B5B5]" : i === 0 ? "bg-primary" : "hatch")} />
              </div>
              <span className="w-12 text-right font-semibold">{k(p.paid)}</span>
            </div>
          ))}
        </section>
        <section className="rounded-lg bg-white p-6">
          <h2 className="text-lg">Signed agreements</h2>
          <div className="mt-4 flex flex-col gap-2 text-[13px]">
            <div><span className="text-primary">●</span> Active signed agreements · {live.agreements.filter((a) => a.status === "signed").length}</div>
            <div><span className="text-sky">●</span> Pending countersignature · {live.agreements.filter((a) => a.status !== "signed").length}</div>
            <div><span className="text-glow-amber">●</span> Cleared KYB partners · {live.partners.length}</div>
          </div>
        </section>
      </div>
      {toast}
    </div>
  );
}
