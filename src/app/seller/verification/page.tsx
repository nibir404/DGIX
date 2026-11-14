"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { GATES } from "@/lib/seed";
import { apiFetch, downloadEvidenceBlob, hasProhibitedUltimateWording } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Check, Product } from "@/lib/types";
import { Empty } from "@/components/portal/ui";
import { BTN_GRADIENT, Head, Panel, ProductTabs, pendingChecks, scoreOf, useFlash, useSeller } from "@/components/seller/kit";
import { Icon } from "@/components/ui/Icon";

const STEPS = ["Application", "Documents", "Product demo", "Technical review", "Agreement", "Listed"];

const EVIDENCE: Record<string, { title: string; body: string; backendType: string }> = {
  quality: { title: "Release & delivery record", body: "Release notes and delivery history for the last 12 months. PDF, max 20 MB.", backendType: "architecture_doc" },
  evidence: { title: "Customer references", body: "Signed references or case studies from live customers. PDF, max 20 MB.", backendType: "customer_reference" },
  security: { title: "Penetration test report", body: "A test by an independent firm, done in the last 12 months. PDF, max 20 MB.", backendType: "pentest_report" },
  legal: { title: "Proof of IP ownership", body: "Company registration and source-code ownership documents. PDF, max 20 MB.", backendType: "ip_attestation" },
  pricing: { title: "Price list & economics", body: "Your list prices and discount rules for DGIX buyers. PDF or XLSX.", backendType: "pricing_schedule" },
  support: { title: "Support & continuity plan", body: "Support hours, escalation path and escrow / continuity terms. PDF.", backendType: "sla_document" },
  docs: { title: "Documentation & demo", body: "User and API docs, plus a recorded demo link. PDF or URL.", backendType: "user_manual" },
};

export default function VerificationPage() {
  const { products, focus, uploadEvidence } = useSeller();
  const { live, uploadRealEvidence, refreshLive } = useStore();
  const { flash, toast } = useFlash();
  const [sel, setSel] = useState<string>();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [claimStmt, setClaimStmt] = useState("");
  const [claimLabel, setClaimLabel] = useState<"certified" | "verified" | "declared" | "inferred" | "estimated">("declared");
  const [claimMethod, setClaimMethod] = useState("partner_declaration");
  const [claimEvId, setClaimEvId] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);

  const p = products.find((x) => x.id === sel) ?? focus;

  if (!p) return <Empty title="No products in verification" body="Start a product passport to begin the six gates." />;

  const livePid = p.id;
  const prodVerIds = new Set(
    [
      ...(p.versionId ? [p.versionId] : []),
      ...(live.versionsByProduct[livePid] ?? []).map((v) => String(v.version_id)),
    ].filter(Boolean),
  );
  const productEvidence = live.evidence.filter(
    (ev) => String(ev.product_id) === livePid || prodVerIds.has(String(ev.product_version_id)),
  );
  const productClaims = live.claims.filter(
    (cl) => String(cl.product_id) === livePid || prodVerIds.has(String(cl.product_version_id)),
  );
  const productGaps = live.gapLetters.filter((g) => {
    const assessment = live.assessments.find((a) => String(a.assessment_id) === String(g.assessment_id));
    return assessment && String(assessment.product_id) === livePid;
  });

  const pending = pendingChecks(p);
  const complete = scoreOf(p) >= 100 && p.status === "listed";
  const gateIdx = complete ? 6 : Math.max(0, GATES.findIndex((g) => g.id === p.gate));

  const sendFile = async (c: Check, file: File | null, fallbackName: string) => {
    setUploadingKey(c.key);
    try {
      const meta = EVIDENCE[c.key] ?? { backendType: "compliance_doc" };
      const blob =
        file ??
        new Blob([`%PDF-1.4\n% DGIX Evidence ${fallbackName}\n%%EOF\n`], { type: "application/pdf" });
      if (p.versionId) {
        await uploadRealEvidence({
          productId: p.id,
          productVersionId: p.versionId,
          evidenceType: meta.backendType,
          file: blob,
          filename: file?.name ?? fallbackName,
        });
      } else {
        uploadEvidence(p.id, c.key);
      }
      flash(`${file?.name ?? fallbackName} uploaded`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimStmt.trim() || claimBusy) return;
    if (hasProhibitedUltimateWording(claimStmt)) {
      flash("Claims cannot contain the word 'ultimate'. Please use verifiable statements.");
      return;
    }
    const cleanEvList = productEvidence.filter((ev) => String(ev.scan_status) === "clean");
    const chosenEvId =
      claimLabel === "certified" || claimLabel === "verified"
        ? claimEvId
        : claimEvId || (cleanEvList[0] ? String(cleanEvList[0].evidence_id) : "");
    if (!chosenEvId) {
      flash(
        claimLabel === "certified" || claimLabel === "verified"
          ? "Certified and Verified claims require selecting a verified supporting document."
          : "Upload at least one supporting document before adding a product claim.",
      );
      return;
    }
    const verId = p.versionId ?? (live.versionsByProduct[livePid]?.[0] ? String(live.versionsByProduct[livePid][0].version_id) : "");
    if (!verId) {
      flash("No active product version found.");
      return;
    }
    setClaimBusy(true);
    try {
      await apiFetch("/bff/v1/claims", {
        method: "POST",
        body: {
          evidence_id: chosenEvId,
          product_version_id: verId,
          statement: claimStmt.trim(),
          label: claimLabel,
          method: claimMethod,
        },
      });
      setClaimStmt("");
      await refreshLive();
      flash("Product claim saved");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not record claim");
    } finally {
      setClaimBusy(false);
    }
  };

  const handleDownload = async (evidenceId: string, filename: string) => {
    try {
      await downloadEvidenceBlob(evidenceId, filename);
      flash(`Downloaded ${filename}`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Head kicker={<>{p.name} · reviewed by DGIX</>} title="Verification" right={<ProductTabs products={products} value={p.id} onChange={setSel} />} />

      {productGaps.map((gap) => {
        const missing = Array.isArray(gap.missing_items) ? (gap.missing_items as string[]) : [];
        const items = Array.isArray(gap.gaps) ? (gap.gaps as Array<Record<string, unknown>>) : [];
        const totalItems = missing.length || items.length;
        return (
          <Panel key={String(gap.gap_letter_id ?? gap.letter_id)} className="border border-[#F3D9B0] bg-[#FFFBF4] p-5">
            <div className="flex items-start gap-3">
              <Icon name="info" size={18} className="mt-0.5 shrink-0 text-[#B86E00]" />
              <div className="flex flex-col gap-1.5">
                <div className="text-sm font-semibold text-[#6B4A12]">
                  Additional verification requested ({totalItems} item{totalItems === 1 ? "" : "s"})
                </div>
                {gap.summary ? <div className="text-xs text-[#6B4A12]">{String(gap.summary)}</div> : null}
                <ul className="list-disc space-y-1 pl-4 text-xs text-[#6B4A12]">
                  {missing.map((m, idx) => (
                    <li key={`m-${idx}`}>{m}</li>
                  ))}
                  {items.map((it, idx) => (
                    <li key={`g-${idx}`}>
                      <span className="font-semibold">{String(it.criterion_id ?? it.gate_code ?? "Item")}:</span>{" "}
                      {String(it.remediation ?? it.description ?? "Upload supporting document")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        );
      })}

      {/* Review progress */}
      <Panel className="grid grid-cols-2 gap-y-6 rounded-lg bg-paper p-6 sm:grid-cols-3 md:p-7 lg:flex lg:items-start">
        {STEPS.map((label, i) => {
          const done = i < gateIdx;
          const current = i === gateIdx;
          const last = i === STEPS.length - 1;
          const line = i + 1 < gateIdx ? "bg-success" : i + 1 === gateIdx && !complete ? "bg-[linear-gradient(90deg,#14804A_0%,#2F6BD8_100%)]" : done && i + 1 <= gateIdx ? "bg-success" : "bg-[#E3E9F4]";
          return (
            <div key={label} className={clsx("flex flex-col gap-[10px]", last ? "lg:w-[120px] lg:shrink-0" : "lg:grow lg:basis-0")}>
              <div className="flex items-center">
                <div
                  className={clsx(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs leading-4",
                    done && "bg-success text-paper",
                    current && "bg-amber font-bold text-paper shadow-[0_0_0_6px_#2F6BD82E]",
                    !done && !current && "border-[1.5px] border-[#C9D4E8] text-[#9AA2B4]",
                  )}
                >
                  {done ? "✓" : i + 1}
                </div>
                {!last && <div className={clsx("hidden h-[2px] grow basis-0 lg:block", line)} />}
              </div>
              <div className={clsx("text-sm leading-[18px]", done || current ? "font-semibold text-ink" : "text-muted")}>{label}</div>
              <div className={clsx("text-xs leading-4", done ? "text-muted" : current ? "text-warning" : "text-[#9AA2B4]")}>
                {done ? "Completed" : current ? `${pending.length} item${pending.length === 1 ? "" : "s"} open` : i === gateIdx + 1 ? "Next" : last ? "Goes live" : "Upcoming"}
              </div>
            </div>
          );
        })}
      </Panel>

      {pending.length === 0 ? (
        <Empty title="All eight checks passed" body={`${p.name} scored ${scoreOf(p)}/100 and is verified for buyers.`} action={<Link href="/seller/products" className="text-sm font-semibold text-primary">View passport →</Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pending.map((c) =>
            c.key === "readiness" ? (
              <ResidencyCard key={c.key} p={p} c={c} onSave={(a) => void sendFile(c, null, `residency-${a}.pdf`)} />
            ) : (
              <UploadCard
                key={c.key}
                c={c}
                busy={uploadingKey === c.key}
                onFile={(file, fallback) => void sendFile(c, file, fallback)}
              />
            ),
          )}
        </div>
      )}

      {/* Supporting Documents & Product Claims */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3 bg-paper p-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-ink">Submitted documents</div>
            <span className="rounded bg-mist px-2 py-0.5 text-xs font-semibold text-primary">{productEvidence.length} files</span>
          </div>
          {productEvidence.length === 0 ? (
            <p className="text-xs text-muted">No supporting documents uploaded for this product yet. Upload a document above to begin verification.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {productEvidence.map((ev) => {
                const evId = String(ev.evidence_id);
                const fname = String(ev.filename ?? `${ev.evidence_type}.pdf`);
                const scan = String(ev.scan_status ?? "pending");
                return (
                  <div key={evId} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{fname}</div>
                      <div className="truncate text-xs text-muted">
                        Status:{" "}
                        <span className={scan === "clean" ? "font-semibold text-success" : "font-semibold text-warning"}>
                          {scan === "clean" ? "Verified" : "Pending check"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDownload(evId, fname)}
                      className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-mist"
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel className="flex flex-col gap-3 bg-paper p-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-ink">Product claims</div>
            <span className="rounded bg-mist px-2 py-0.5 text-xs font-semibold text-primary">{productClaims.length} claims</span>
          </div>
          <form onSubmit={submitClaim} className="flex flex-col gap-2.5">
            <input
              value={claimStmt}
              onChange={(e) => setClaimStmt(e.target.value)}
              placeholder="e.g. ISO 27001:2022 certified cloud HR & WPS engine"
              className="h-10 rounded-lg border border-line px-3 text-sm outline-none focus:border-primary"
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={claimLabel}
                onChange={(e) => setClaimLabel(e.target.value as typeof claimLabel)}
                className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-medium outline-none"
              >
                <option value="declared">Declared (Self-attested)</option>
                <option value="verified">Verified (Backed by document)</option>
                <option value="certified">Certified (ISO / SOC 2 certificate)</option>
                <option value="inferred">Inferred</option>
                <option value="estimated">Estimated</option>
              </select>
              <select
                value={claimEvId}
                onChange={(e) => {
                  setClaimEvId(e.target.value);
                  if (e.target.value) setClaimMethod("document_review");
                }}
                className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none"
              >
                <option value="">Link supporting document (optional for Declared)</option>
                {productEvidence
                  .filter((ev) => String(ev.scan_status) === "clean")
                  .map((ev) => (
                    <option key={String(ev.evidence_id)} value={String(ev.evidence_id)}>
                      {String(ev.filename ?? ev.evidence_type)}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={claimBusy || !claimStmt.trim()}
              className={clsx("inline-flex h-10 items-center justify-center self-start rounded-lg px-4 text-xs font-semibold text-white disabled:opacity-50", BTN_GRADIENT)}
            >
              {claimBusy ? "Saving..." : "+ Add product claim"}
            </button>
          </form>
          {productClaims.length > 0 && (
            <div className="mt-1 flex max-h-[160px] flex-col divide-y divide-line overflow-y-auto">
              {productClaims.map((cl) => (
                <div key={String(cl.claim_id)} className="flex items-center justify-between gap-2 py-2 text-xs">
                  <span className="truncate text-ink">{String(cl.statement)}</span>
                  <span className="shrink-0 rounded bg-mist px-2 py-0.5 font-semibold uppercase text-primary">{String(cl.label)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {toast}
    </div>
  );
}

function CardHead({ title, c }: { title: string; c: Check }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-base font-semibold leading-5 text-ink">{title}</div>
      <span className="shrink-0 rounded-lg bg-[#FFF3DC] px-[10px] py-1 text-xs font-semibold leading-4 text-warning">+{c.max - c.score} points</span>
    </div>
  );
}

function Uploaded({ c }: { c: Check }) {
  return c.note?.startsWith("Uploaded") ? <div className="inline-flex items-center gap-1.5 text-[13px] font-medium leading-4 text-success"><Icon name="check" size={14} /> {c.note}</div> : null;
}

function UploadCard({ c, busy, onFile }: { c: Check; busy?: boolean; onFile: (file: File | null, fallbackName: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const meta = EVIDENCE[c.key] ?? { title: c.label, body: "Upload supporting document. PDF, max 20 MB." };
  const take = (f?: File) => f && onFile(f, f.name);
  return (
    <Panel className="flex flex-col gap-4 bg-paper p-6">
      <CardHead title={meta.title} c={c} />
      <div className="text-sm leading-5 text-muted">{c.note && !c.note.startsWith("Uploaded") ? `${c.note}. ` : ""}{meta.body}</div>
      <button
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
        className={clsx("flex h-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed bg-[#F9FAFD] transition", drag ? "border-primary bg-mist" : "border-[#C9D4E8] hover:border-primary")}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-mist text-primary"><Icon name="upload" size={20} /></span>
        <span className="text-sm leading-[18px] text-ink">
          {busy ? "Uploading document..." : <>Drop file or <span className="font-semibold text-primary">browse</span></>}
        </span>
      </button>
      <input ref={input} type="file" accept=".pdf,.xlsx,.doc,.docx,.txt" className="hidden" onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
      <Uploaded c={c} />
    </Panel>
  );
}

function ResidencyCard({ p, c, onSave }: { p: Product; c: Check; onSave: (answer: string) => void }) {
  const m = p.markets[0] ?? "UAE";
  const opts = [`In the ${m} (${m === "UAE" ? "Azure UAE North" : m === "KSA" ? "Azure KSA Central" : "in-region cloud"})`, `Outside the ${m}`];
  const [v, setV] = useState(0);
  return (
    <Panel className="flex flex-col gap-4 bg-paper p-6">
      <CardHead title={`${m} data residency`} c={c} />
      <div className="text-sm leading-5 text-muted">Tell us where {m} customer data is stored.</div>
      <div className="flex flex-col gap-2" role="radiogroup">
        {opts.map((o, i) => (
          <button key={o} role="radio" aria-checked={v === i} onClick={() => setV(i)} className={clsx("flex items-center gap-3 rounded-lg p-[14px] text-left transition", v === i ? "border-[1.5px] border-primary bg-mist" : "border border-[#E3E9F4] hover:border-[#C9D4E8]")}>
            <span className={clsx("size-[18px] shrink-0 rounded-lg", v === i ? "border-[5px] border-primary bg-paper" : "border-[1.5px] border-[#C9D4E8]")} />
            <span className="text-sm leading-[18px] text-ink">{o}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onSave(opts[v])} className={clsx("inline-flex h-[42px] shrink-0 items-center self-start rounded-lg px-5 text-[13px] font-semibold leading-4 text-paper hover:brightness-110", BTN_GRADIENT)}>
        Save answer
      </button>
      <Uploaded c={c} />
    </Panel>
  );
}
