"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Btn, Dialog, Panel } from "@/components/buyer/kit";
import { Head, Pill } from "@/components/seller/kit";
import { useFlash } from "@/components/admin/kit";

type ContractTemplate = {
  template_id: string;
  code: string;
  contract_type: string;
  version: number;
  title: string;
  body: string | null;
  status: string;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
};

type PartnerContract = {
  contract_id: string;
  partner_id: string;
  template_id: string;
  template_version: number;
  contract_type: string;
  title: string;
  status: string;
  created_by: string;
  signed_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export default function AdminContractsPage() {
  const { db, user } = useStore();
  const { flash, toast } = useFlash();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [contracts, setContracts] = useState<PartnerContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTplOpen, setNewTplOpen] = useState(false);
  const [newContractOpen, setNewContractOpen] = useState(false);

  const [tplCode, setTplCode] = useState("dgix-nda-standard");
  const [tplType, setTplType] = useState<"NDA" | "MOU" | "SLA" | "MSA" | "DPA" | "OTHER">("NDA");
  const [tplTitle, setTplTitle] = useState("DGIX Partner Non-Disclosure Agreement");
  const [tplBody, setTplBody] = useState(
    "This agreement governs confidential handling of all diagnostic, assessment, and commercial records exchanged on DGIX.",
  );

  const [selectedTplId, setSelectedTplId] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tpls, ctrs] = await Promise.all([
        apiFetch<ContractTemplate[]>("/bff/v1/commercial/contract-templates").catch(() => []),
        apiFetch<PartnerContract[]>("/bff/v1/commercial/contracts").catch(() => []),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : []);
      setContracts(Array.isArray(ctrs) ? ctrs : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approvedTemplates = templates.filter((t) => t.status === "approved" && t.body);
  const partners = db.companies.filter((c) => c.kind === "partner");

  const createTemplate = async () => {
    setBusy(true);
    try {
      await apiFetch("/bff/v1/commercial/contract-templates", {
        method: "POST",
        body: { code: tplCode.trim(), contract_type: tplType, title: tplTitle.trim(), body: tplBody.trim() },
      });
      setNewTplOpen(false);
      flash("Template draft created (awaiting second Legal approval)");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to create template");
    } finally {
      setBusy(false);
    }
  };

  const approveTemplate = async (templateId: string) => {
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/commercial/contract-templates/${templateId}/approve`, { method: "POST" });
      flash("Template approved under four-eyes control");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Approval failed (requires a second Legal user)");
    } finally {
      setBusy(false);
    }
  };

  const draftAndSendContract = async () => {
    if (!selectedTplId || !selectedPartnerId) return;
    setBusy(true);
    try {
      const created = await apiFetch<PartnerContract>("/bff/v1/commercial/contracts", {
        method: "POST",
        body: { template_id: selectedTplId, partner_id: selectedPartnerId },
      });
      await apiFetch(`/bff/v1/commercial/contracts/${created.contract_id}/send`, { method: "POST" });
      setNewContractOpen(false);
      flash("Contract drafted and sent to partner for signature");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to send contract");
    } finally {
      setBusy(false);
    }
  };

  const sendContract = async (contractId: string) => {
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/commercial/contracts/${contractId}/send`, { method: "POST" });
      flash("Contract sent to partner");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to send contract");
    } finally {
      setBusy(false);
    }
  };

  const withdrawContract = async (contractId: string) => {
    const reason = window.prompt("Reason for withdrawing this contract:");
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/commercial/contracts/${contractId}/withdraw`, {
        method: "POST",
        body: { reason: reason.trim() },
      });
      flash("Contract withdrawn");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to withdraw contract");
    } finally {
      setBusy(false);
    }
  };

  const terminateContract = async (contractId: string) => {
    const reason = window.prompt("Reason for terminating this signed contract:");
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await apiFetch(`/bff/v1/commercial/contracts/${contractId}/terminate`, {
        method: "POST",
        body: { reason: reason.trim() },
      });
      flash("Contract terminated");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to terminate contract");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Head
        kicker="Legal register · Four-eyes templates & partner NDAs / MOUs"
        title="Contracts & templates"
        right={
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" onClick={() => setNewTplOpen(true)}>
              + New template
            </Btn>
            <Btn
              onClick={() => {
                setSelectedTplId(approvedTemplates[0]?.template_id ?? "");
                setSelectedPartnerId(partners[0]?.id ?? "");
                setNewContractOpen(true);
              }}
              disabled={approvedTemplates.length === 0}
            >
              Send contract to partner
            </Btn>
          </div>
        }
      />

      <Panel className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-ink">Contract template register ({templates.length})</div>
          <div className="text-xs text-muted">Four-eyes approval required before use</div>
        </div>
        {loading ? (
          <div className="py-6 text-sm text-muted">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="py-6 text-sm text-muted">No templates found.</div>
        ) : (
          <div className="divide-y divide-[#F1F4FA]">
            {templates.map((t) => (
              <div key={t.template_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {t.code} v{t.version}
                    </span>
                    <Pill tone={t.status === "approved" ? "success" : "warning"}>{t.status}</Pill>
                    <Pill tone="info">{t.contract_type}</Pill>
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink">{t.title}</div>
                  {!t.body && (
                    <div className="text-xs text-warning">Legacy seed placeholder (no legal text body)</div>
                  )}
                </div>
                {t.status === "draft" && (
                  <Btn
                    variant="outline"
                    disabled={busy || t.created_by === user?.id}
                    onClick={() => void approveTemplate(t.template_id)}
                  >
                    {t.created_by === user?.id ? "Awaiting 2nd Legal approver" : "Approve template"}
                  </Btn>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-ink">Partner contracts ({contracts.length})</div>
          <div className="text-xs text-muted">Draft → Sent → Signed / Withdrawn / Terminated</div>
        </div>
        {contracts.length === 0 ? (
          <div className="py-6 text-sm text-muted">No partner contracts issued yet.</div>
        ) : (
          <div className="divide-y divide-[#F1F4FA]">
            {contracts.map((c) => {
              const partnerName = partners.find((p) => p.id === c.partner_id)?.name ?? c.partner_id.slice(0, 8);
              return (
                <div key={c.contract_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{c.title}</span>
                      <Pill tone={c.status === "signed" ? "success" : c.status === "sent" ? "info" : "warning"}>
                        {c.status}
                      </Pill>
                      <Pill tone="amber">{c.contract_type}</Pill>
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Partner: {partnerName} · Template v{c.template_version}
                      {c.signed_at ? ` · Signed ${c.signed_at.slice(0, 10)}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.status === "draft" && (
                      <Btn variant="outline" disabled={busy} onClick={() => void sendContract(c.contract_id)}>
                        Send to partner
                      </Btn>
                    )}
                    {(c.status === "draft" || c.status === "sent") && (
                      <Btn variant="outline" disabled={busy} onClick={() => void withdrawContract(c.contract_id)}>
                        Withdraw
                      </Btn>
                    )}
                    {c.status === "signed" && (
                      <Btn variant="outline" disabled={busy} onClick={() => void terminateContract(c.contract_id)}>
                        Terminate
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Dialog open={newTplOpen} onClose={() => setNewTplOpen(false)} title="Create contract template draft">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Template code
            <input
              value={tplCode}
              onChange={(e) => setTplCode(e.target.value)}
              className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Contract type
            <select
              value={tplType}
              onChange={(e) => setTplType(e.target.value as typeof tplType)}
              className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink"
            >
              <option value="NDA">NDA</option>
              <option value="MOU">MOU</option>
              <option value="SLA">SLA</option>
              <option value="MSA">MSA</option>
              <option value="DPA">DPA</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Title
            <input
              value={tplTitle}
              onChange={(e) => setTplTitle(e.target.value)}
              className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Legal body text
            <textarea
              rows={5}
              value={tplBody}
              onChange={(e) => setTplBody(e.target.value)}
              className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={() => setNewTplOpen(false)}>
              Cancel
            </Btn>
            <Btn disabled={busy} onClick={() => void createTemplate()}>
              Save draft
            </Btn>
          </div>
        </div>
      </Dialog>

      <Dialog open={newContractOpen} onClose={() => setNewContractOpen(false)} title="Send contract to partner">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Approved template
            <select
              value={selectedTplId}
              onChange={(e) => setSelectedTplId(e.target.value)}
              className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink"
            >
              {approvedTemplates.map((t) => (
                <option key={t.template_id} value={t.template_id}>
                  {t.contract_type} · {t.code} v{t.version} — {t.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Partner organisation
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="rounded-lg border border-[#DCE4F2] px-3 py-2 text-sm text-ink"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.country})
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={() => setNewContractOpen(false)}>
              Cancel
            </Btn>
            <Btn disabled={busy || !selectedTplId || !selectedPartnerId} onClick={() => void draftAndSendContract()}>
              Draft &amp; send for signature
            </Btn>
          </div>
        </div>
      </Dialog>
      {toast}
    </div>
  );
}
