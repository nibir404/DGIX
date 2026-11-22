"use client";

import { useState } from "react";
import clsx from "clsx";
import { Dialog } from "@/components/buyer/kit";
import { Button } from "@/components/portal/ui";
import { Icon } from "@/components/ui/Icon";
import { hasProhibitedUltimateWording } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

const FIELD =
  "w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "erp", label: "ERP" },
  { value: "hr", label: "HR & payroll" },
  { value: "crm", label: "CRM" },
  { value: "retail", label: "Retail & POS" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "ai", label: "AI & automation" },
  { value: "custom", label: "Custom software" },
  { value: "services", label: "Services" },
];
const MARKETS = ["UAE", "SAU", "QAT", "BGD", "USA", "GBR"];
const DELIVERY_MODELS = ["SaaS (Cloud Hosted)", "Container / Kubernetes", "Self-Hosted / On-Premises", "API / Managed Service"];
const DOC_SLOTS = [
  { type: "architecture_doc", label: "Architecture / Product Brochure" },
  { type: "pentest_report", label: "Security / Pentest / SBOM" },
  { type: "certificate", label: "ISO 27001 / SOC 2 Certificate" },
  { type: "ip_attestation", label: "IP Ownership Proof" },
  { type: "pricing_schedule", label: "Pricing Schedule" },
  { type: "sla_document", label: "SLA & Support Plan" },
  { type: "user_manual", label: "User Manual / API Docs" },
];

/** Unified AWS Marketplace-style 3-step Product Submission Dialog aligned with DGIX PG0-PG5 gates. */
export function AddProductDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (id: string, name: string) => void;
}) {
  const { addProduct } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState({
    name: "",
    category: "erp" as Category,
    deliveryModel: DELIVERY_MODELS[0],
    tagline: "",
    description: "",
    price: "",
    sla: "99.9% uptime · 60m P1 response",
  });
  const [markets, setMarkets] = useState<string[]>(["UAE"]);
  const [attachments, setAttachments] = useState<{ file: File; evidenceType: string }[]>([]);

  const price = Number(f.price.replace(/[^0-9]/g, "")) || 0;
  const prohibited = hasProhibitedUltimateWording(f.name, f.tagline, f.description);
  const step1Ok = f.name.trim().length > 1 && f.tagline.trim().length > 2 && !prohibited;
  const step2Ok = markets.length > 0 && price > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1Ok || !step2Ok) return;
    const id = addProduct({
      name: f.name.trim(),
      category: f.category,
      tagline: `${f.deliveryModel} · ${f.tagline.trim()}`,
      description: `${f.description.trim() || f.tagline.trim()}\nDelivery: ${f.deliveryModel}\nSLA: ${f.sla}`,
      markets,
      priceFrom: price,
      attachments,
    });
    onAdded(id, f.name.trim());
    setStep(1);
    setF({
      name: "",
      category: "erp",
      deliveryModel: DELIVERY_MODELS[0],
      tagline: "",
      description: "",
      price: "",
      sla: "99.9% uptime · 60m P1 response",
    });
    setMarkets(["UAE"]);
    setAttachments([]);
  };

  return (
    <Dialog open={open} onClose={onClose} title={`Submit product · Step ${step} of 3`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-semibold">
          {["1. Overview", "2. Markets & Pricing", "3. Resources & Submit"].map((lbl, idx) => (
            <div
              key={lbl}
              className={clsx(
                "rounded-md py-1.5",
                step === idx + 1 ? "bg-primary text-white" : step > idx + 1 ? "bg-[#E6F4EC] text-[#0E6439]" : "bg-mist text-muted",
              )}
            >
              {lbl}
            </div>
          ))}
        </div>

        {prohibited && (
          <div className="rounded-lg border border-[#F2B8B8] bg-[#FFF5F5] px-3.5 py-2.5 text-xs font-medium text-danger">
            Product claims cannot contain the word &ldquo;ultimate&rdquo;. Please use specific, verifiable phrasing.
          </div>
        )}

        {step === 1 && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Product name *</span>
              <input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. ClinicFlow EMR" className={clsx(FIELD, "h-11")} />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Category</span>
                <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })} className={clsx(FIELD, "h-11")}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Delivery model</span>
                <select value={f.deliveryModel} onChange={(e) => setF({ ...f, deliveryModel: e.target.value })} className={clsx(FIELD, "h-11")}>
                  {DELIVERY_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">One-line verifiable pitch *</span>
              <input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} placeholder="Patient records and billing for multi-site clinics" className={clsx(FIELD, "h-11")} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Capabilities &amp; description</span>
              <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={clsx(FIELD, "resize-none py-2.5")} />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Annual price from (USD) *</span>
                <input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="24000" className={clsx(FIELD, "h-11")} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">SLA &amp; Support commitment</span>
                <input value={f.sla} onChange={(e) => setF({ ...f, sla: e.target.value })} className={clsx(FIELD, "h-11")} />
              </label>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-[13px] font-medium">Target markets *</legend>
              <div className="flex flex-wrap gap-2">
                {MARKETS.map((m) => {
                  const on = markets.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMarkets((x) => (on ? x.filter((y) => y !== m) : [...x, m]))}
                      className={clsx(
                        "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
                        on ? "border-primary bg-mist font-medium text-primary" : "border-line bg-white text-ink hover:border-primary/40",
                      )}
                    >
                      {on && <Icon name="check" size={14} />}
                      {m}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2.5">
            <div className="text-xs text-muted">
              Attach supporting assurance documents now (or add more later in Verification):
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DOC_SLOTS.map((slot) => (
                <div key={slot.type} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-[#F8FAFD] px-3 py-2">
                  <span className="truncate text-xs font-medium text-ink">{slot.label}</span>
                  <label className="shrink-0 cursor-pointer rounded-md bg-night px-2.5 py-1 text-[11px] font-semibold text-paper hover:bg-primary">
                    Upload
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xlsx,.csv,.zip,.json,.png,.jpg,.jpeg"
                      className="sr-only"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length > 0) {
                          setAttachments((prev) => [...prev, ...files.map((file) => ({ file, evidenceType: slot.type }))]);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {attachments.map((att, idx) => (
                  <span key={`${att.file.name}-${idx}`} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs text-ink">
                    <span className="font-mono text-[10px] text-primary">{att.evidenceType}</span>
                    <span className="max-w-[150px] truncate">{att.file.name}</span>
                    <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} className="font-semibold text-muted hover:text-danger">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-between">
          <div>
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>Back</Button>
            ) : (
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            )}
          </div>
          {step < 3 ? (
            <Button
              type="button"
              disabled={step === 1 ? !step1Ok : !step2Ok}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={!step1Ok || !step2Ok}>
              Submit for assurance ({attachments.length} file{attachments.length === 1 ? "" : "s"})
            </Button>
          )}
        </div>
      </form>
    </Dialog>
  );
}
