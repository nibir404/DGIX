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
  { code: "UAE", label: "United Arab Emirates" },
  { code: "KSA", label: "Saudi Arabia" },
  { code: "QAT", label: "Qatar" },
  { code: "BGD", label: "Bangladesh" },
  { code: "USA", label: "United States" },
  { code: "GBR", label: "United Kingdom" },
];

export function CreateAccountForm() {
  const router = useRouter();
  const { registerLive } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode>("buy");
  const [f, setF] = useState({ name: "", company: "", email: "", password: "", country: "UAE" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const s = strength(f.password);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || s < 1 || busy) return;
    setError(null);
    setBusy(true);
    try {
      const u = await registerLive({
        account_type: mode === "buy" ? "buyer" : "seller",
        full_name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        company_name: f.company.trim(),
        country_code: f.country,
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
            className="flex flex-col gap-[22px]"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-[34px] leading-[42px] md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Create your account</h2>
              <p className="text-[15px] leading-[18px] text-muted">
                {mode === "buy"
                  ? "Free for enterprise buyers. Submit software requirements and book product demos."
                  : "Apply to list your software and start verification for global markets."}
              </p>
            </div>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Company">
                <input required autoComplete="organization" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Work email">
                <div className="relative">
                  <input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls + " pr-10"} />
                  {emailOk && <Icon name="check" size={18} strokeWidth={1.75} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />}
                </div>
              </Field>
              <Field label="Jurisdiction">
                <select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className={inputCls}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Password (min 8 chars)">
              <input type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inputCls} />
              <div className="flex gap-1.5 px-1 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={clsx("h-1 grow basis-0 rounded-lg transition-colors", i < s ? (s >= 3 ? "bg-success" : s === 2 ? "bg-amber" : "bg-danger") : "bg-mist")} />
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
            <PrimaryButton disabled={!agree || f.password.length < 8 || busy}>
              {busy ? "Creating account..." : "Create account"} <Icon name="arrowRight" size={18} strokeWidth={1.75} />
            </PrimaryButton>
            <p className="text-center text-sm leading-[18px] text-muted">
              Already registered? <Link href="/sign-in" className="font-semibold text-ink underline underline-offset-2">Sign in</Link>
            </p>
          </motion.form>
        ) : (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#E6F4EC] text-success"><Icon name="check" size={28} strokeWidth={2} /></span>
            <h2 className="text-[34px] leading-[42px] font-light tracking-tight text-ink">Welcome to DGIX, {f.name.split(" ")[0] || "there"}.</h2>
            <p className="text-[15px] leading-6 text-muted">
              Your account (<span className="text-ink font-medium">{f.email}</span>) for{" "}
              <span className="text-ink font-medium">{f.company}</span> is ready and signed in.
            </p>
            <div className="rounded-lg border border-[#BCE3CC] bg-[#F2FBF6] px-4 py-3 text-[13px] leading-5 text-[#145C36]">
              {mode === "buy"
                ? "You can now submit software requirements, review matched shortlists, and book live product demos."
                : "Your partner onboarding workspace is active. Our team will review your company details and guide you through product verification."}
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
