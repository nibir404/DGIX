"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { apiFetch, hasProhibitedUltimateWording } from "@/lib/api";
import { portalHome, useStore } from "@/lib/store";
import type { Category, User } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

type Mode = "buy" | "sell";
type Attachment = { file: File; evidenceType: string; label: string };

const INPUT =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";

const COUNTRIES = [
  { code: "UAE", label: "United Arab Emirates (UAE)" },
  { code: "SAU", label: "Saudi Arabia (SAU)" },
  { code: "QAT", label: "Qatar (QAT)" },
  { code: "BGD", label: "Bangladesh (BGD)" },
  { code: "USA", label: "United States (USA)" },
  { code: "GBR", label: "United Kingdom (GBR)" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "erp", label: "ERP" },
  { value: "hr", label: "HR & Payroll" },
  { value: "crm", label: "CRM & Sales" },
  { value: "retail", label: "Retail & POS" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "ai", label: "AI & Automation" },
  { value: "custom", label: "Custom Software" },
  { value: "services", label: "Managed Services" },
];

const DELIVERY_MODELS = ["SaaS (Cloud Hosted)", "Container / Kubernetes", "Self-Hosted / On-Premises", "API / Managed Service"];
const IP_OPTIONS = ["We own 100% of IP & source code", "Shared with a partner", "Licensed from third party"];
const COMMERCIAL_MODELS = ["List & sell through DGIX (Co-branded)", "DGIX Reseller", "White-label for enterprise buyers"];

const SELLER_DOC_SLOTS = [
  { type: "kyb", label: "Company Incorporation / Trade License (KYB)", hint: "PDF, max 20 MB" },
  { type: "architecture_doc", label: "Product Architecture & Brochure", hint: "PDF / DOCX" },
  { type: "pentest_report", label: "Security / Penetration Test / SBOM", hint: "PDF / JSON" },
  { type: "certificate", label: "ISO 27001 / SOC 2 Certificate", hint: "PDF" },
  { type: "ip_attestation", label: "IP Ownership Attestation", hint: "PDF" },
  { type: "user_manual", label: "User Manual & API Documentation", hint: "PDF / ZIP" },
];

const SELLER_STEPS = [
  { num: 1, title: "Account & Entity (KYB)", sub: "Legal entity & PAO contact" },
  { num: 2, title: "Compliance & Markets", sub: "Directors, IP & territories" },
  { num: 3, title: "Product & Resources", sub: "Listing details & documents" },
  { num: 4, title: "Review & Submit", sub: "Confirm & start assurance" },
];

function passwordStrength(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export function UnifiedOnboardingWizard({
  initialMode = "buy",
  embedded = false,
}: {
  initialMode?: Mode;
  embedded?: boolean;
}) {
  const router = useRouter();
  const { user, registerLive, applyPartnerLive } = useStore();
  const alreadySeller = user?.role === "seller";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [sellerStep, setSellerStep] = useState<1 | 2 | 3 | 4>(1);
  const [doneUser, setDoneUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared Account & Entity fields
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [roleTitle, setRoleTitle] = useState("Managing Director / PAO");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [country, setCountry] = useState(initialMode === "sell" ? "BGD" : "UAE");
  const [city, setCity] = useState(initialMode === "sell" ? "Dhaka" : "Dubai");
  const [website, setWebsite] = useState("");

  // Seller Step 2: Governance, Directors & Compliance
  const [directorName, setDirectorName] = useState("");
  const [refOrg, setRefOrg] = useState("");
  const [refContact, setRefContact] = useState("");
  const [refEmail, setRefEmail] = useState("");
  const [ipOwnership, setIpOwnership] = useState(IP_OPTIONS[0]);
  const [commercialModel, setCommercialModel] = useState(COMMERCIAL_MODELS[0]);
  const [markets, setMarkets] = useState<string[]>(["UAE", "USA"]);

  // Seller Step 3: Product & Resources (AWS Marketplace style)
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<Category>("erp");
  const [deliveryModel, setDeliveryModel] = useState(DELIVERY_MODELS[0]);
  const [priceFrom, setPriceFrom] = useState("24000");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Terms & NDA consent
  const [agree, setAgree] = useState(false);

  const pwScore = passwordStrength(password);
  const prohibitedWording = hasProhibitedUltimateWording(productName, tagline, description);

  const addFiles = (evidenceType: string, label: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file) => ({ file, evidenceType, label }));
    setAttachments((prev) => [...prev, ...next]);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || pwScore < 1 || busy) return;
    setError(null);
    setBusy(true);
    try {
      const u = await registerLive({
        account_type: "buyer",
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        company_name: companyName.trim(),
        country_code: country,
        registration_number: regNumber.trim() || undefined,
      });
      if (regNumber.trim()) {
        await apiFetch("/bff/v1/iam/buyer-verifications", {
          method: "POST",
          body: {
            company_name: companyName.trim(),
            country_code: country,
            registration_number: regNumber.trim(),
          },
        }).catch(() => undefined);
      }
      setDoneUser(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create buyer account.");
    } finally {
      setBusy(false);
    }
  };

  const validateSellerStep = (s: 1 | 2 | 3): string | null => {
    if (s === 1) {
      if (companyName.trim().length < 2) return "Enter your legal company name.";
      if (regNumber.trim().length < 2) return "Enter your company registration or trade license number.";
      if (!alreadySeller) {
        if (fullName.trim().length < 2) return "Enter the primary contact (PAO) full name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid work email.";
        if (password.length < 8) return "Password must be at least 8 characters.";
      }
    }
    if (s === 2) {
      if (markets.length === 0) return "Select at least one target market.";
    }
    if (s === 3) {
      if (productName.trim().length < 2) return "Enter your product name.";
      if (tagline.trim().length < 5) return "Enter a clear one-line pitch (at least 5 characters).";
      if (prohibitedWording) return "Product wording cannot contain 'ultimate'. Use specific, verifiable claims.";
    }
    return null;
  };

  const nextSellerStep = () => {
    const err = validateSellerStep(sellerStep as 1 | 2 | 3);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSellerStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  };

  const submitSeller = async () => {
    if (!agree || busy) return;
    setError(null);
    setBusy(true);
    try {
      const numericPrice = Number(priceFrom.replace(/[^0-9]/g, "")) || 24000;
      const u = await applyPartnerLive({
        companyName: companyName.trim(),
        registrationNumber: regNumber.trim(),
        countryCode: country,
        directorName: directorName.trim() || fullName.trim() || "Managing Director",
        directorRole: roleTitle.trim() || "Managing Director",
        referenceOrg: refOrg.trim() || companyName.trim(),
        referenceContact: refContact.trim() || fullName.trim() || "Reference Contact",
        referenceEmail: refEmail.trim() || email.trim() || "reference@company.example",
        productName: productName.trim(),
        category,
        tagline: `${deliveryModel} · ${tagline.trim()}`,
        description: `${description.trim() || tagline.trim()}\nDelivery: ${deliveryModel}\nIP: ${ipOwnership}\nModel: ${commercialModel}${demoUrl ? `\nDemo: ${demoUrl}` : ""}`,
        markets,
        priceFrom: numericPrice,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        attachments: attachments.map((a) => ({ file: a.file, evidenceType: a.evidenceType })),
      });
      setDoneUser(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete partner onboarding.");
    } finally {
      setBusy(false);
    }
  };

  if (doneUser) {
    return (
      <div className="flex w-full flex-col gap-5 rounded-xl border border-line bg-white p-6 md:p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#E6F4EC] text-[#14804A]">
          <Icon name="check" size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-ink">
            {mode === "buy" ? "Buyer account created" : "Seller onboarding & product submitted"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {mode === "buy"
              ? `Welcome, ${doneUser.name}. Your enterprise buyer workspace is ready${regNumber ? " and your company verification has been queued for DGIX Admin." : "."}`
              : `Welcome, ${doneUser.name}. Your partner entity (${companyName}), product (${productName} v1.0.0), and ${attachments.length} supporting document(s) have been submitted to DGIX Assurance.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(mode === "sell" ? "/seller/verification" : portalHome[doneUser.role])}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong"
          >
            {mode === "sell" ? "Open Seller Verification Console" : "Open Buyer Portal"}
            <Icon name="arrowRight" size={15} />
          </button>
          {mode === "sell" && (
            <Link
              href="/seller/agreement"
              className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-semibold text-ink hover:bg-mist"
            >
              Review &amp; sign NDA / MOU
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex w-full flex-col gap-6", !embedded && "mx-auto max-w-[820px]")}>
      {/* Unified Role Switcher */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[28px] font-light tracking-tight text-ink md:text-[34px]">
            {mode === "buy" ? "Create Buyer Account" : "Seller Registration & Onboarding"}
          </h2>
          <Link href="/sign-in" className="text-xs font-semibold text-primary hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
        <p className="text-sm text-muted">
          {mode === "buy"
            ? "Single enterprise account to submit software requirements, view verified products, and manage contracts & milestones."
            : "Unified AWS Marketplace-style partner onboarding: register your entity, upload KYB & product evidence, and start PG0–PG5 assurance in one flow."}
        </p>
      </div>

      <div className="flex rounded-full bg-mist p-1">
        {(
          [
            { id: "buy", label: "I'm buying software" },
            { id: "sell", label: "I'm selling / Become a partner" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id);
              setError(null);
            }}
            className={clsx(
              "flex h-10 flex-1 items-center justify-center rounded-full text-sm transition-all",
              mode === tab.id ? "bg-white font-semibold text-ink shadow-sm" : "font-medium text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BUYER FLOW */}
      {mode === "buy" ? (
        <form onSubmit={submitBuyer} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Full name *
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={INPUT} placeholder="Omar Khalid" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Company / Organisation *
              <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={INPUT} placeholder="Gulf Retail Group" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Work email *
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="omar@gulfretail.ae" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Jurisdiction *
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Company registration / trade license no. (unlocks verified-buyer catalogue)
            <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className={INPUT} placeholder="e.g. DED-90831" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Password (min 8 characters) *
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 text-xs text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 rounded border-line" />
            <span>I accept the DGIX Marketplace Terms of Use and Privacy Policy.</span>
          </label>
          {error && <div className="rounded-lg bg-[#FBE7E7] px-3.5 py-2.5 text-xs font-medium text-danger">{error}</div>}
          <button
            type="submit"
            disabled={!agree || pwScore < 1 || busy}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
          >
            {busy ? "Creating buyer account..." : "Create buyer account"}
          </button>
        </form>
      ) : (
        /* SELLER FLOW — Unified AWS Marketplace-style 4-step registration */
        <div className="flex flex-col gap-5">
          {/* Step Indicator */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SELLER_STEPS.map((st) => {
              const active = sellerStep === st.num;
              const done = sellerStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => st.num < sellerStep && setSellerStep(st.num as 1 | 2 | 3 | 4)}
                  className={clsx(
                    "flex flex-col gap-0.5 rounded-lg border p-3 text-left transition",
                    active
                      ? "border-primary bg-mist/60"
                      : done
                        ? "border-[#BCE3CC] bg-[#F2FBF6]"
                        : "border-line bg-white opacity-70",
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {done ? "✓ " : ""}Step {st.num}
                  </span>
                  <span className="text-xs font-semibold text-ink">{st.title}</span>
                  <span className="text-[11px] text-muted">{st.sub}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
            {sellerStep === 1 && (
              <>
                <div className="text-base font-semibold text-ink">1. Legal Entity &amp; Primary Contact (PAO)</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Legal company name *
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={INPUT} placeholder="Acme Software Ltd" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Registration / Trade License No. *
                    <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className={INPUT} placeholder="RJSC-C-184920" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Jurisdiction *
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    City &amp; Website
                    <div className="grid grid-cols-2 gap-2">
                      <input value={city} onChange={(e) => setCity(e.target.value)} className={INPUT} placeholder="Dhaka" />
                      <input value={website} onChange={(e) => setWebsite(e.target.value)} className={INPUT} placeholder="https://..." />
                    </div>
                  </label>
                </div>

                {!alreadySeller && (
                  <div className="grid grid-cols-1 gap-3 border-t border-[#F1F4FA] pt-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                      Primary Contact / PAO Full Name *
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={INPUT} placeholder="Farhana Karim" />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                      Role / Title
                      <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className={INPUT} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                      Work email *
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="farhana@acme.com" />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                      Portal password (min 8 chars) *
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
                    </label>
                  </div>
                )}

                <div className="rounded-lg border border-dashed border-line bg-[#F8FAFD] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-ink">KYB Incorporation / Trade License Upload</div>
                      <div className="text-[11px] text-muted">Attach corporate charter or trade license PDF for Legal KYB screening</div>
                    </div>
                    <label className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-night px-3.5 text-xs font-semibold text-paper hover:bg-primary">
                      + Upload KYB PDF
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.zip"
                        className="sr-only"
                        onChange={(e) => {
                          addFiles("kyb", "KYB / Trade License", e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {sellerStep === 2 && (
              <>
                <div className="text-base font-semibold text-ink">2. Governance, Directors, IP &amp; Target Markets</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Managing Director / UBO Full Name
                    <input value={directorName} onChange={(e) => setDirectorName(e.target.value)} className={INPUT} placeholder={fullName || "Director name"} />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Customer Reference Organisation
                    <input value={refOrg} onChange={(e) => setRefOrg(e.target.value)} className={INPUT} placeholder="e.g. Apex Garments Group" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Reference Contact Name
                    <input value={refContact} onChange={(e) => setRefContact(e.target.value)} className={INPUT} placeholder="Tariq Mahmud" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Reference Email
                    <input type="email" value={refEmail} onChange={(e) => setRefEmail(e.target.value)} className={INPUT} placeholder="tariq@apex.com" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    IP &amp; Source Code Ownership
                    <select value={ipOwnership} onChange={(e) => setIpOwnership(e.target.value)} className={INPUT}>
                      {IP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Commercial Distribution Model
                    <select value={commercialModel} onChange={(e) => setCommercialModel(e.target.value)} className={INPUT}>
                      {COMMERCIAL_MODELS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-muted">Target Markets *</div>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map((c) => {
                      const on = markets.includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setMarkets((prev) => (on ? prev.filter((x) => x !== c.code) : [...prev, c.code]))}
                          className={clsx(
                            "h-9 rounded-lg border px-3 text-xs font-medium transition",
                            on ? "border-primary bg-mist text-primary" : "border-line bg-white text-ink",
                          )}
                        >
                          {on ? "✓ " : ""}
                          {c.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {sellerStep === 3 && (
              <>
                <div className="text-base font-semibold text-ink">3. Product Listing &amp; Verification Resources</div>
                {prohibitedWording && (
                  <div className="rounded-lg border border-[#F2B8B8] bg-[#FFF5F5] px-3.5 py-2 text-xs font-medium text-danger">
                    FR-CAT-03: Avoid prohibited superlatives such as &ldquo;ultimate&rdquo;. Use specific, verifiable statements.
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Product Name *
                    <input value={productName} onChange={(e) => setProductName(e.target.value)} className={INPUT} placeholder="e.g. ClinicFlow EMR" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Category *
                    <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={INPUT}>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Delivery Model (AWS Marketplace style)
                    <select value={deliveryModel} onChange={(e) => setDeliveryModel(e.target.value)} className={INPUT}>
                      {DELIVERY_MODELS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                    Starting Annual Price (USD) *
                    <input inputMode="numeric" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} className={INPUT} placeholder="24000" />
                  </label>
                </div>
                <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                  One-line verifiable pitch *
                  <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={INPUT} placeholder="Multi-site payroll and attendance compliance suite" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                  Product overview &amp; capabilities
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-line bg-white p-3 text-sm text-ink outline-none focus:border-primary" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                  Live Demo or Documentation URL (optional)
                  <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className={INPUT} placeholder="https://demo.yourproduct.com" />
                </label>

                <div className="flex flex-col gap-2 border-t border-[#F1F4FA] pt-3">
                  <div className="text-xs font-semibold text-ink">Verification Document Slots (PG0–PG5)</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SELLER_DOC_SLOTS.map((slot) => (
                      <div key={slot.type} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-[#F8FAFD] px-3 py-2.5">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-ink">{slot.label}</div>
                          <div className="text-[11px] text-muted">{slot.hint}</div>
                        </div>
                        <label className="shrink-0 cursor-pointer rounded-md bg-night px-2.5 py-1.5 text-[11px] font-semibold text-paper hover:bg-primary">
                          Upload
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xlsx,.csv,.zip,.json,.png,.jpg,.jpeg"
                            className="sr-only"
                            onChange={(e) => {
                              addFiles(slot.type, slot.label, e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {sellerStep === 4 && (
              <>
                <div className="text-base font-semibold text-ink">4. Review &amp; Submit for DGIX Assurance</div>
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-[#F8FAFD] p-4 text-xs sm:grid-cols-2">
                  <div>
                    <div className="font-semibold text-ink">Legal Entity &amp; PAO</div>
                    <div className="mt-1 text-muted">
                      {companyName} ({regNumber}) · {country}
                      <br />
                      PAO: {fullName || user?.name} ({email || user?.email})
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">Product &amp; Markets</div>
                    <div className="mt-1 text-muted">
                      {productName} ({category.toUpperCase()} · {deliveryModel})
                      <br />
                      From ${priceFrom}/yr · Markets: {markets.join(", ")}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted">
                  <strong>Attached documents ({attachments.length}):</strong>{" "}
                  {attachments.length === 0 ? "None attached yet (can also upload in Verification)." : attachments.map((a) => `${a.file.name} [${a.evidenceType}]`).join(", ")}
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-xs text-ink">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 rounded border-line" />
                  <span>
                    I confirm all company and product claims are accurate, I agree to the DGIX Partner Confidentiality (NDA) and Marketplace Rules, and understand listing requires independent PG0–PG5 assurance review.
                  </span>
                </label>
              </>
            )}

            {attachments.length > 0 && sellerStep !== 4 && (
              <div className="flex flex-wrap gap-1.5 border-t border-[#F1F4FA] pt-3">
                {attachments.map((att, idx) => (
                  <span key={`${att.file.name}-${idx}`} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs text-ink">
                    <span className="font-mono text-[10px] text-primary">{att.evidenceType}</span>
                    <span className="max-w-[160px] truncate">{att.file.name}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="font-semibold text-muted hover:text-danger">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {error && <div className="rounded-lg bg-[#FBE7E7] px-3.5 py-2.5 text-xs font-medium text-danger">{error}</div>}

            <div className="flex items-center justify-between border-t border-[#F1F4FA] pt-4">
              {sellerStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setSellerStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                  className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:bg-mist"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              {sellerStep < 4 ? (
                <button
                  type="button"
                  onClick={nextSellerStep}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong"
                >
                  Continue <Icon name="arrowRight" size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!agree || busy}
                  onClick={() => void submitSeller()}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
                >
                  {busy ? "Submitting onboarding & files..." : "Submit partner & product"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
