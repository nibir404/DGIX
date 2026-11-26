"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Field, inputCls, PrimaryButton } from "./AuthShell";
import { Icon } from "@/components/ui/Icon";

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

/**
 * "Auth · Sign in" variant 2 (Create account). The seed store has no create-user action, so step 2 is a
 * confirmation that points to the demo test accounts instead of persisting a new user.
 */
export function CreateAccountForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode>("buy");
  const [f, setF] = useState({ name: "", company: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const s = strength(f.password);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);

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
            onSubmit={(e) => {
              e.preventDefault();
              if (agree && s >= 2) setStep(2);
            }}
            className="flex flex-col gap-[22px]"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-[34px] leading-[42px] md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Create your account</h2>
              <p className="text-[15px] leading-[18px] text-muted">{mode === "buy" ? "Free for buyers. Takes under a minute." : "Apply to list. We'll review your company first."}</p>
              {mode === "buy" && <p className="text-[13px] leading-[18px] text-muted">Setting up your whole company? <Link href="/enrol" className="font-medium text-primary hover:underline">Enrol your organisation</Link></p>}
            </div>
            <div className="flex rounded-full bg-mist p-1">
              {(["buy", "sell"] as Mode[]).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={clsx("relative flex h-10 grow basis-0 items-center justify-center text-sm leading-[18px]", mode === m ? "font-semibold text-ink" : "font-medium text-muted")}>
                  {mode === m && <motion.span layoutId="ca-toggle" className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_#0C1F451F]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{m === "buy" ? "I'm buying" : "I'm selling"}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name"><input required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></Field>
              <Field label="Company"><input required autoComplete="organization" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Work email">
              <div className="relative">
                <input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls + " pr-12"} />
                {emailOk && <Icon name="check" size={20} strokeWidth={1.75} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />}
              </div>
            </Field>
            <Field label="Password">
              <input type="password" required autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inputCls} />
              <div className="flex gap-1.5 px-1 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={clsx("h-1 grow basis-0 rounded-lg transition-colors", i < s ? (s >= 3 ? "bg-success" : s === 2 ? "bg-amber" : "bg-danger") : "bg-mist")} />
                ))}
              </div>
              {f.password && <span className={clsx("text-xs leading-4", s >= 3 ? "text-success" : "text-muted")}>{LABEL[s]}</span>}
            </Field>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="peer sr-only" />
              <span className={clsx("flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40", agree ? "border-primary bg-primary text-white" : "border-line")}>
                {agree && <Icon name="check" size={12} strokeWidth={3} />}
              </span>
              <span className="text-[13px] leading-5 text-[#3A4766]">
                I agree to the <Link href="/legal/terms" className="font-semibold text-ink underline underline-offset-2">Terms</Link> and <Link href="/legal/privacy" className="font-semibold text-ink underline underline-offset-2">Privacy policy</Link>.
              </span>
            </label>
            <PrimaryButton disabled={!agree || s < 2}>
              Continue <Icon name="arrowRight" size={18} strokeWidth={1.75} />
            </PrimaryButton>
            <p className="text-center text-sm leading-[18px] text-muted">
              Already registered? <Link href="/sign-in" className="font-semibold text-ink underline underline-offset-2">Sign in</Link>
            </p>
          </motion.form>
        ) : (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#E6F4EC] text-success"><Icon name="check" size={28} strokeWidth={2} /></span>
            <h2 className="text-[34px] leading-[42px] font-light tracking-tight text-ink">Check your inbox, {f.name.split(" ")[0] || "there"}.</h2>
            <p className="text-[15px] leading-6 text-muted">
              We&apos;ve sent a link to <span className="text-ink">{f.email}</span> to confirm your work email. {mode === "buy" ? "Your advisor will verify " : "Our partner team will review "}
              <span className="text-ink">{f.company}</span> before {mode === "buy" ? "quotes are issued" : "you can apply"}.
            </p>
            <p className="rounded-lg border border-[#F3D9B0] bg-[#FFFBF4] px-4 py-3 text-[13px] leading-5 text-[#6B4A12]">
              Demo: new accounts aren&apos;t saved. Use a test account on the sign-in page to explore the portals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-in" className="inline-flex h-12 items-center rounded-lg bg-ink px-6 text-[15px] font-semibold text-white">Go to sign in</Link>
              <button onClick={() => setStep(1)} className="inline-flex h-12 items-center rounded-lg border border-line px-6 text-[15px] font-medium text-ink">Back</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
