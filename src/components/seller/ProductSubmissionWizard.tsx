"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Dialog } from "@/components/buyer/kit";
import { Button } from "@/components/portal/ui";
import { Icon } from "@/components/ui/Icon";
import { hasProhibitedUltimateWording } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

const FIELD =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "erp", label: "ERP (Enterprise Resource Planning)" },
  { value: "hr", label: "HR & Payroll" },
  { value: "crm", label: "CRM & Sales Pipeline" },
  { value: "retail", label: "Retail & Omnichannel POS" },
  { value: "healthcare", label: "Healthcare & Clinic Management" },
  { value: "education", label: "Education & Campus SIS" },
  { value: "finance", label: "Financial Services & Fintech" },
  { value: "ai", label: "AI & Cognitive Automation" },
  { value: "custom", label: "Custom Software Solutions" },
  { value: "services", label: "Managed Tech Services" },
];

const MARKETS = [
  { code: "BGD", label: "Bangladesh" },
  { code: "UAE", label: "United Arab Emirates" },
  { code: "KSA", label: "Saudi Arabia" },
  { code: "QAT", label: "Qatar" },
  { code: "OMN", label: "Oman" },
  { code: "USA", label: "United States" },
  { code: "GBR", label: "United Kingdom" },
  { code: "SGP", label: "Singapore" },
];

const DEPLOYMENT_MODELS = [
  { id: "saas", label: "Multi-Tenant SaaS (Cloud Hosted)" },
  { id: "dedicated", label: "Single-Tenant Dedicated Cloud" },
  { id: "on_prem", label: "On-Premises / Kubernetes Container" },
  { id: "hybrid", label: "Hybrid / Managed Appliance" },
];

const PRICING_MODELS = [
  { id: "seat_per_month", label: "Per User / Seat / Month" },
  { id: "tiered_subscription", label: "Tiered Monthly / Annual Subscription" },
  { id: "usage_based", label: "Usage / Transaction Based" },
  { id: "one_time_license", label: "Perpetual One-Time License" },
];

export interface EvidenceSlot {
  key: string;
  title: string;
  backendType: string;
  desc: string;
  isUrl?: boolean;
}

export const NINE_EVIDENCE_TYPES: EvidenceSlot[] = [
  {
    key: "qa_report",
    title: "1. QA & Automated Test Results",
    backendType: "test_report",
    desc: "Test suite coverage, unit/integration pass logs, and benchmark reports (PDF).",
  },
  {
    key: "pentest",
    title: "2. Penetration Test / Security Audit",
    backendType: "pentest_report",
    desc: "Independent 3rd-party vulnerability assessment or penetration test report (past 12 months).",
  },
  {
    key: "user_manual",
    title: "3. User Manual & Guidelines",
    backendType: "user_manual",
    desc: "End-user guide, administrator handbook, and installation steps.",
  },
  {
    key: "architecture",
    title: "4. Architecture & Technical Guide",
    backendType: "architecture_doc",
    desc: "System architecture diagrams, data flow specs, and API documentation.",
  },
  {
    key: "demo_access",
    title: "5. Live Demo Access & Walkthrough",
    backendType: "demo_access",
    desc: "Sandbox credentials, staging URL, or recorded product demo walkthrough video link.",
    isUrl: true,
  },
  {
    key: "customer_ref",
    title: "6. Client References & Feedback",
    backendType: "customer_reference",
    desc: "Signed customer case study, client satisfaction letter, or production metrics.",
  },
  {
    key: "certificate",
    title: "7. Compliance & Quality Certificates",
    backendType: "certificate",
    desc: "ISO 9001, ISO 27001, SOC 2 Type II, CMMI, HIPAA, or local regulatory certifications.",
  },
  {
    key: "ip_attestation",
    title: "8. IP & Proprietary Code Attestation",
    backendType: "ip_attestation",
    desc: "Attestation confirming proprietary software ownership and clean licensing.",
  },
  {
    key: "sla_doc",
    title: "9. Support Terms & Escrow Plan",
    backendType: "sla_document",
    desc: "SLA response times, escalation contacts, and source code continuity/escrow terms.",
  },
];

export function ProductSubmissionWizard({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (id: string, name: string, isDraft: boolean) => void;
}) {
  const { addProduct, uploadRealEvidence } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("erp");
  const [tagline, setTagline] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["BGD", "UAE"]);
  const [sector, setSector] = useState("Enterprise Software");

  // Step 2: Tech Specs
  const [description, setDescription] = useState("");
  const [deploymentModel, setDeploymentModel] = useState("saas");
  const [techStack, setTechStack] = useState("Next.js, FastAPI, PostgreSQL, Docker");
  const [slaUptime, setSlaUptime] = useState("99.9%");
  const [integrations, setIntegrations] = useState("REST API, Webhooks, Single Sign-On (SAML/OIDC)");

  // Step 3: Pricing
  const [pricingModel, setPricingModel] = useState("seat_per_month");
  const [priceFrom, setPriceFrom] = useState("450");
  const [currency, setCurrency] = useState("USD");
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [freeTrial, setFreeTrial] = useState("14 Days Free POC");

  // Step 4: 9 Evidence files & URL inputs
  const [files, setFiles] = useState<Record<string, File>>({});
  const [demoUrl, setDemoUrl] = useState("");

  const prohibited = hasProhibitedUltimateWording(name, tagline, description);
  const step1Ok = name.trim().length >= 2 && tagline.trim().length >= 3 && selectedMarkets.length > 0 && !prohibited;
  const step2Ok = description.trim().length >= 10 && techStack.trim().length >= 2;
  const step3Ok = Number(priceFrom.replace(/[^0-9]/g, "")) > 0;

  const toggleMarket = (code: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleFileUpload = (key: string, file: File | null) => {
    if (!file) {
      setFiles((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const saveProduct = async (isDraft: boolean) => {
    if (prohibited || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const numericPrice = Number(priceFrom.replace(/[^0-9]/g, "")) || 100;
      const fullDesc = [
        description.trim(),
        `\n\n### Technical Specifications`,
        `- **Deployment Model**: ${deploymentModel}`,
        `- **Technology Stack**: ${techStack}`,
        `- **SLA Commitment**: ${slaUptime} uptime`,
        `- **Integrations**: ${integrations}`,
        `\n### Commercial Model`,
        `- **Pricing Structure**: ${pricingModel} (${currency} ${numericPrice} / ${billingPeriod})`,
        `- **POC / Free Trial**: ${freeTrial}`,
        demoUrl ? `- **Live Demo URL**: ${demoUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const tempId = addProduct({
        name: name.trim(),
        category,
        tagline: tagline.trim(),
        description: fullDesc,
        markets: selectedMarkets,
        priceFrom: numericPrice,
      });

      // Upload any attached evidence files
      for (const [key, file] of Object.entries(files)) {
        const slot = NINE_EVIDENCE_TYPES.find((s) => s.key === key);
        if (slot) {
          try {
            await uploadRealEvidence({
              productId: tempId,
              evidenceType: slot.backendType,
              file,
              filename: file.name,
              expiresAt: "2027-12-31",
            });
          } catch {
            // Non-fatal if evidence upload queue processes in background
          }
        }
      }

      onAdded(tempId, name.trim(), isDraft);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register product passport");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Register Enterprise Software Passport">
      <div className="flex w-full flex-col gap-5">
        {/* Stepper Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-ink">
            <span className={clsx(step >= 1 ? "text-primary" : "text-muted")}>1. Basics</span>
            <span className={clsx(step >= 2 ? "text-primary" : "text-muted")}>2. Technical Specs</span>
            <span className={clsx(step >= 3 ? "text-primary" : "text-muted")}>3. Commercials</span>
            <span className={clsx(step >= 4 ? "text-primary" : "text-muted")}>4. Evidence (9 Docs)</span>
            <span className={clsx(step >= 5 ? "text-primary" : "text-muted")}>5. Review</span>
          </div>
          <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-mist">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={clsx(
                  "h-full grow transition-colors duration-300",
                  i <= step ? "bg-primary" : "bg-transparent",
                )}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-[#FBE7E7] px-3.5 py-2 text-xs font-medium text-danger">
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex flex-col gap-4"
            >
              <p className="text-xs text-muted">
                Define the software identity and primary enterprise category for international buyer discovery.
              </p>
              <div>
                <label className="text-xs font-semibold text-ink">Software Trade Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SmartCampus SIS"
                  className={FIELD}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink">Primary Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className={FIELD}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Industry Sector</label>
                  <input
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g. Higher Education & EdTech"
                    className={FIELD}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">One-Line Enterprise Tagline *</label>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Cloud-native Student Information System powering 50,000+ active students."
                  className={FIELD}
                />
                {prohibited && (
                  <p className="mt-1 text-xs text-danger">
                    Unsubstantiated superlatives (like &ldquo;ultimate&rdquo;, &ldquo;best in class&rdquo;) are prohibited by FR-CAT-03.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Target Export Markets *</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {MARKETS.map((m) => {
                    const active = selectedMarkets.includes(m.code);
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => toggleMarket(m.code)}
                        className={clsx(
                          "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-line bg-white text-muted hover:border-line-hover",
                        )}
                      >
                        {m.label} ({m.code})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button disabled={!step1Ok} onClick={() => setStep(2)}>
                  Next: Technical Specs <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TECHNICAL DESCRIPTION & ARCHITECTURE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-xs font-semibold text-ink">Detailed Software Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the business problems solved, core user roles, functional workflows, and key features..."
                  rows={4}
                  className={FIELD}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink">Deployment Model *</label>
                  <select
                    value={deploymentModel}
                    onChange={(e) => setDeploymentModel(e.target.value)}
                    className={FIELD}
                  >
                    {DEPLOYMENT_MODELS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">SLA Uptime Commitment</label>
                  <select
                    value={slaUptime}
                    onChange={(e) => setSlaUptime(e.target.value)}
                    className={FIELD}
                  >
                    <option value="99.5%">99.5% Standard SLA</option>
                    <option value="99.9%">99.9% High Availability</option>
                    <option value="99.99%">99.99% Mission Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Technology Stack *</label>
                <input
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. Next.js, Node.js, Python, PostgreSQL, Redis, AWS"
                  className={FIELD}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Supported Integrations</label>
                <input
                  value={integrations}
                  onChange={(e) => setIntegrations(e.target.value)}
                  placeholder="e.g. REST API, Webhooks, SAP ERP, Oracle, Stripe"
                  className={FIELD}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-mist"
                >
                  Back
                </button>
                <Button disabled={!step2Ok} onClick={() => setStep(3)}>
                  Next: Commercials <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PRICING & COMMERCIALS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink">Pricing Model *</label>
                  <select
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value)}
                    className={FIELD}
                  >
                    {PRICING_MODELS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Billing Period</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                    className={FIELD}
                  >
                    <option value="monthly">Monthly Recurring</option>
                    <option value="annually">Annual Billing (Discounted)</option>
                    <option value="one_time">One-Time License</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink">Starting Base Price *</label>
                  <div className="flex gap-2">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={clsx(FIELD, "w-24 shrink-0 font-mono")}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="BDT">BDT (৳)</option>
                    </select>
                    <input
                      type="number"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      placeholder="450"
                      className={FIELD}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">POC / Free Trial Policy</label>
                  <input
                    value={freeTrial}
                    onChange={(e) => setFreeTrial(e.target.value)}
                    placeholder="e.g. 14 Days Guided POC"
                    className={FIELD}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#BCE3CC] bg-[#F2FBF6] p-3 text-xs text-[#145C36]">
                <strong>AWS Marketplace Transparency:</strong> Buyers will view your starting price and commercial terms directly on the public storefront. Custom enterprise contracts can be negotiated via DGIX Private Offers.
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-mist"
                >
                  Back
                </button>
                <Button disabled={!step3Ok} onClick={() => setStep(4)}>
                  Next: 9 Evidence Uploads <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: 9 EVIDENCE & VERIFICATION DOCUMENTS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex flex-col gap-3.5 max-h-[460px] overflow-y-auto pr-1"
            >
              <div className="rounded-lg border border-line bg-mist/50 p-2.5 text-xs text-muted">
                Upload up to <strong>9 statutory assurance documents</strong>. You can upload now or attach remaining files later from the Seller Verification desk.
              </div>

              <div className="flex flex-col gap-2.5">
                {NINE_EVIDENCE_TYPES.map((ev) => {
                  const uploaded = files[ev.key];
                  if (ev.isUrl) {
                    return (
                      <div key={ev.key} className="rounded-lg border border-line bg-white p-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-ink">
                          <span>{ev.title}</span>
                          <span className="text-[11px] font-normal text-muted">URL / Sandbox</span>
                        </div>
                        <p className="text-[11px] text-muted mb-2">{ev.desc}</p>
                        <input
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          placeholder="https://demo.yourcompany.com or https://youtube.com/watch?v=..."
                          className={FIELD}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={ev.key} className="rounded-lg border border-line bg-white p-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>{ev.title}</span>
                        {uploaded && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                            <Icon name="check" size={12} strokeWidth={3} /> Attached
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mb-2">{ev.desc}</p>
                      <label className="flex cursor-pointer items-center justify-between rounded border border-dashed border-line bg-[#FAFBFD] px-3 py-2 text-xs transition-colors hover:border-primary/40">
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.zip,.png"
                          onChange={(e) => handleFileUpload(ev.key, e.target.files?.[0] ?? null)}
                          className="sr-only"
                        />
                        {uploaded ? (
                          <div className="flex items-center gap-2 truncate text-ink font-medium">
                            <Icon name="file" size={14} className="text-primary shrink-0" />
                            <span className="truncate max-w-[300px]">{uploaded.name}</span>
                            <span className="text-muted text-[10px]">({Math.round(uploaded.size / 1024)} KB)</span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1.5 text-primary font-medium">
                            <Icon name="upload" size={13} /> Select PDF / File
                          </span>
                        )}
                        {uploaded && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleFileUpload(ev.key, null);
                            }}
                            className="text-muted hover:text-danger ml-2"
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-mist"
                >
                  Back
                </button>
                <Button onClick={() => setStep(5)}>
                  Next: Review & Submit <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & DECISION */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-lg border border-line bg-white p-3.5 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Software Name</span>
                  <span className="font-semibold text-ink">{name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Category</span>
                  <span className="font-medium text-ink capitalize">{category}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Markets</span>
                  <span className="font-medium text-ink">{selectedMarkets.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Deployment & SLA</span>
                  <span className="font-medium text-ink">{deploymentModel} · {slaUptime}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Pricing</span>
                  <span className="font-semibold text-ink">{currency} {priceFrom} / {billingPeriod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Evidence Documents Attached</span>
                  <span className="font-semibold text-primary">
                    {Object.keys(files).length + (demoUrl ? 1 : 0)} of 9 uploaded
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[#D0E2FF] bg-[#F2F6FE] p-3 text-xs text-[#0F4C81]">
                <strong>Assurance Process:</strong> Submitting for verification immediately initiates Gate PG1 screening by the DGIX assurance desk. You can also save as draft and resume uploading remaining documents later from the Seller Portal.
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-mist"
                >
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => saveProduct(true)}
                    className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-mist"
                  >
                    Save as Draft
                  </button>
                  <Button disabled={busy} onClick={() => saveProduct(false)}>
                    {busy ? "Registering..." : "Submit for Verification (PG1)"} <Icon name="check" size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  );
}
