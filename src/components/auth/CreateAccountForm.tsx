"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Field, inputCls, PrimaryButton } from "./AuthShell";
import { Icon } from "@/components/ui/Icon";
import { portalHome, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

type Mode = "buy" | "sell";
type EntityType = "COMPANY" | "INDIVIDUAL";

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const LABEL = ["Too short", "Weak password", "Fair password", "Strong password", "Very strong password"];

const COUNTRIES = [
  { code: "BGD", label: "Bangladesh", dial: "+880" },
  { code: "UAE", label: "United Arab Emirates", dial: "+971" },
  { code: "KSA", label: "Saudi Arabia", dial: "+966" },
  { code: "QAT", label: "Qatar", dial: "+974" },
  { code: "OMN", label: "Oman", dial: "+968" },
  { code: "KWT", label: "Kuwait", dial: "+965" },
  { code: "BHR", label: "Bahrain", dial: "+973" },
  { code: "USA", label: "United States", dial: "+1" },
  { code: "GBR", label: "United Kingdom", dial: "+44" },
  { code: "SGP", label: "Singapore", dial: "+65" },
  { code: "MYS", label: "Malaysia", dial: "+60" },
];

export function CreateAccountForm() {
  const router = useRouter();
  const { registerLive } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode>("buy");
  const [entityType, setEntityType] = useState<EntityType>("COMPANY");
  const [f, setF] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    country: "BGD",
    dialCode: "+880",
    phone: "",
  });
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const s = strength(f.password);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  const phoneOk = f.phone.trim().length >= 6;
  const companyOk = entityType === "INDIVIDUAL" || f.company.trim().length >= 2;

  const handleCountryChange = (countryCode: string) => {
    const match = COUNTRIES.find((c) => c.code === countryCode);
    setF({
      ...f,
      country: countryCode,
      dialCode: match ? match.dial : f.dialCode,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || s < 1 || busy || !phoneOk || !companyOk) return;
    setError(null);
    setBusy(true);
    try {
      const u = await registerLive({
        account_type: mode === "buy" ? "buyer" : "seller",
        full_name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        phone_number: f.phone.trim(),
        dial_code: f.dialCode,
        entity_type: entityType,
        company_name: entityType === "COMPANY" ? f.company.trim() : f.name.trim(),
        country_code: f.country,
        trade_license_ref: tradeLicenseFile ? `trade-license:${tradeLicenseFile.name}` : undefined,
      });
      setCreatedUser(u);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account. Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-[22px]">
      <div className="flex items-center gap-[10px]">
        <div className="h-1 grow basis-0 rounded-lg bg-primary" />
        <div className="relative h-1 grow basis-0 overflow-hidden rounded-lg bg-mist">
          <motion.div className="absolute inset-y-0 left-0 bg-primary" animate={{ width: step === 2 ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
        </div>
        <span className="text-[13px] leading-4 text-muted">Step {step} of 2</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={submit}
            className="flex flex-col gap-[20px]"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-[32px] leading-[38px] md:text-[38px] md:leading-[44px] font-light tracking-tight text-ink">
                Create your account
              </h2>
              <p className="text-[14px] leading-[18px] text-muted">
                {mode === "buy"
                  ? "Free for enterprise buyers. Submit software requirements and book product demos."
                  : "Apply to list your software and start verification for global markets."}
              </p>
            </div>

            {/* Buyer vs Seller Toggle */}
            <div className="flex rounded-full bg-mist p-1">
              {(["buy", "sell"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={clsx(
                    "relative flex h-10 grow basis-0 items-center justify-center text-sm leading-[18px]",
                    mode === m ? "font-semibold text-ink" : "font-medium text-muted",
                  )}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="ca-toggle"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_#0C1F451F]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{m === "buy" ? "I'm buying" : "I'm selling"}</span>
                </button>
              ))}
            </div>

            {/* Entity Type Toggle: Company vs Individual */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">Registration Entity Type</span>
              <div className="flex rounded-lg border border-line bg-mist p-1">
                {(["COMPANY", "INDIVIDUAL"] as EntityType[]).map((et) => (
                  <button
                    key={et}
                    type="button"
                    onClick={() => setEntityType(et)}
                    className={clsx(
                      "relative flex h-8 grow basis-0 items-center justify-center text-xs transition-colors",
                      entityType === et ? "font-semibold text-ink" : "font-medium text-muted",
                    )}
                  >
                    {entityType === et && (
                      <motion.span
                        layoutId="entity-toggle"
                        className="absolute inset-0 rounded-md bg-white shadow-sm"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <Icon name={et === "COMPANY" ? "briefcase" : "user"} size={13} />
                      {et === "COMPANY" ? "Company / Corporate" : "Individual Person"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Company */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  required
                  autoComplete="name"
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                  placeholder="e.g. Tanvir Hasan"
                  className={inputCls}
                />
              </Field>
              {entityType === "COMPANY" ? (
                <Field label="Company legal name">
                  <input
                    required
                    autoComplete="organization"
                    value={f.company}
                    onChange={(e) => setF({ ...f, company: e.target.value })}
                    placeholder="e.g. Daffodil Software Ltd"
                    className={inputCls}
                  />
                </Field>
              ) : (
                <Field label="Profession / Title (Optional)">
                  <input
                    value={f.company}
                    onChange={(e) => setF({ ...f, company: e.target.value })}
                    placeholder="e.g. Independent Consultant"
                    className={inputCls}
                  />
                </Field>
              )}
            </div>

            {/* Email & Country */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Work email">
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                    placeholder="name@company.com"
                    className={inputCls + " pr-10"}
                  />
                  {emailOk && <Icon name="check" size={18} strokeWidth={1.75} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />}
                </div>
              </Field>
              <Field label="Jurisdiction / Country">
                <select
                  value={f.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className={inputCls}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.dial})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Phone Number with Country Dial Code */}
            <Field label="Mobile phone number">
              <div className="flex gap-2">
                <select
                  value={f.dialCode}
                  onChange={(e) => setF({ ...f, dialCode: e.target.value })}
                  className={clsx(inputCls, "w-28 shrink-0 font-mono text-xs")}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dial}>
                      {c.dial} ({c.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={f.phone}
                  onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^0-9\s-]/g, "") })}
                  placeholder="1712345678"
                  className={clsx(inputCls, "grow")}
                />
              </div>
            </Field>

            {/* Conditional Trade License Upload */}
            {entityType === "COMPANY" ? (
              <Field label="Company Trade License / Incorporation document">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-[#FAFBFD] p-3 text-center transition-colors hover:border-primary/50">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setTradeLicenseFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                  {tradeLicenseFile ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-ink">
                      <span className="flex size-6 items-center justify-center rounded bg-[#E6F4EC] text-success">
                        <Icon name="check" size={13} strokeWidth={2.5} />
                      </span>
                      <span className="truncate max-w-[260px]">{tradeLicenseFile.name}</span>
                      <span className="text-[11px] text-muted">({Math.round(tradeLicenseFile.size / 1024)} KB)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <Icon name="upload" size={14} /> Upload Trade License / Certificate
                      </div>
                      <p className="text-[11px] text-muted">PDF, PNG or JPG up to 10MB (Statutory corporate KYB)</p>
                    </div>
                  )}
                </label>
              </Field>
            ) : (
              <div className="rounded-lg border border-[#D0E2FF] bg-[#F2F6FE] px-3 py-2 text-xs text-[#0F4C81]">
                <strong>Individual Account:</strong> Phone number and email verification are sufficient. No corporate trade license required.
              </div>
            )}

            {/* Password */}
            <Field label="Password (min 8 chars)">
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={f.password}
                onChange={(e) => setF({ ...f, password: e.target.value })}
                className={inputCls}
              />
              <div className="flex gap-1.5 px-1 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={clsx(
                      "h-1 grow basis-0 rounded-lg transition-colors",
                      i < s ? (s >= 3 ? "bg-success" : s === 2 ? "bg-amber" : "bg-danger") : "bg-mist",
                    )}
                  />
                ))}
              </div>
              {f.password && <span className={clsx("text-xs leading-4", s >= 3 ? "text-success" : "text-muted")}>{LABEL[s]}</span>}
            </Field>

            {error && <p className="rounded-lg bg-[#FBE7E7] px-3.5 py-2.5 text-xs font-medium text-danger">{error}</p>}

            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="peer sr-only" />
              <span className={clsx("flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40", agree ? "border-primary bg-primary text-white" : "border-line")}>
                {agree && <Icon name="check" size={12} strokeWidth={3} />}
              </span>
              <span className="text-[13px] leading-5 text-[#3A4766]">
                I agree to the <Link href="/legal/terms" className="font-semibold text-ink underline underline-offset-2">Terms</Link> and <Link href="/legal/privacy" className="font-semibold text-ink underline underline-offset-2">Privacy policy</Link>.
              </span>
            </label>

            <PrimaryButton disabled={!agree || f.password.length < 8 || !phoneOk || !companyOk || busy}>
              {busy ? "Creating account..." : "Create account"} <Icon name="arrowRight" size={18} strokeWidth={1.75} />
            </PrimaryButton>

            <p className="text-center text-sm leading-[18px] text-muted">
              Already registered? <Link href="/sign-in" className="font-semibold text-ink underline underline-offset-2">Sign in</Link>
            </p>
          </motion.form>
        ) : (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#E6F4EC] text-success">
              <Icon name="check" size={28} strokeWidth={2} />
            </span>
            <h2 className="text-[34px] leading-[42px] font-light tracking-tight text-ink">
              Welcome to DGIX, {f.name.split(" ")[0] || "there"}.
            </h2>
            <p className="text-[15px] leading-6 text-muted">
              Your {entityType === "COMPANY" ? "company" : "individual"} account (<span className="text-ink font-medium">{f.email}</span>)
              {entityType === "COMPANY" && f.company ? (
                <> for <span className="text-ink font-medium">{f.company}</span></>
              ) : null}{" "}
              is ready and signed in.
            </p>
            <div className="rounded-lg border border-[#BCE3CC] bg-[#F2FBF6] px-4 py-3 text-[13px] leading-5 text-[#145C36]">
              {mode === "buy"
                ? "You can now submit software requirements, review matched shortlists, and book live product demos."
                : "Your partner onboarding workspace is active. Our team will review your details and guide you through software verification."}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push(createdUser ? portalHome[createdUser.role] : mode === "buy" ? "/buyer" : "/seller")}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-ink px-6 text-[15px] font-semibold text-white hover:bg-primary"
              >
                Open {mode === "buy" ? "Buyer" : "Partner"} portal <Icon name="arrowRight" size={16} />
              </button>
              <Link href="/products" className="inline-flex h-12 items-center rounded-lg border border-line px-6 text-[15px] font-medium text-ink">
                Browse catalogue
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
