"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PageHero } from "@/components/marketing/PageHero";
import { HeroBg, BG } from "@/components/marketing/pages/bits";
import { Icon, type IconName } from "@/components/ui/Icon";
import { hasProhibitedUltimateWording } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

const DRAFT_KEY = "dgix-partner-draft";

const TEAM = ["1–10", "11–50", "51–200", "201–500", "500+"];
const CATEGORIES = ["ERP", "HR & payroll", "CRM & sales", "Retail & POS", "Healthcare", "Education", "Finance & accounting", "AI & automation", "Custom software", "IT services"];
const STAGES = ["Live with paying customers", "Live, pilots only", "Beta", "In development"];
const MARKETS = ["USA", "Gulf (GCC)", "Europe", "Other"];
const IP = ["We own it fully", "Shared with a client or partner", "Licensed from a third party", "Not sure"];
const MODES = ["Not sure yet", "List and sell through DGIX", "White-label for a buyer", "Custom builds on request"];

type Form = {
  company: string; regNumber: string; brand: string; year: string; team: string; country: string; city: string; website: string;
  name: string; role: string; email: string; phone: string; password: string;
  product: string; count: string; category: string; what: string; stage: string; customers: string; demo: string;
  markets: string[]; ip: string; mode: string; agree: boolean;
};
type Key = keyof Form;

const initial: Form = {
  company: "", regNumber: "", brand: "", year: "", team: "", country: "Bangladesh", city: "Dhaka", website: "",
  name: "", role: "", email: "", phone: "", password: "",
  product: "", count: "1", category: "", what: "", stage: "", customers: "", demo: "",
  markets: [], ip: "", mode: MODES[0], agree: false,
};

function mapCategoryLabel(label: string): Category {
  const lower = label.toLowerCase();
  if (lower.includes("hr")) return "hr";
  if (lower.includes("crm")) return "crm";
  if (lower.includes("retail")) return "retail";
  if (lower.includes("health")) return "healthcare";
  if (lower.includes("education")) return "education";
  if (lower.includes("finance")) return "finance";
  if (lower.includes("ai")) return "ai";
  if (lower.includes("custom")) return "custom";
  if (lower.includes("service")) return "services";
  return "erp";
}

function mapMarketsToCountries(markets: string[]): string[] {
  const out: string[] = [];
  for (const m of markets) {
    if (m.includes("Gulf")) {
      out.push("UAE", "SAU");
    } else if (m === "USA") {
      out.push("USA");
    } else if (m === "Europe") {
      out.push("GBR");
    } else {
      out.push("UAE");
    }
  }
  return Array.from(new Set(out));
}

const STEPS: { title: string; blurb: string; icon: IconName; required: Key[] }[] = [
  { title: "Company", blurb: "Who you are", icon: "box", required: ["company", "country"] },
  { title: "Contact", blurb: "Who we talk to", icon: "user", required: ["name", "email", "phone"] },
  { title: "Product", blurb: "What you sell", icon: "sparkle", required: ["product", "category", "what", "stage"] },
  { title: "Going global", blurb: "Where and how", icon: "globe", required: ["markets", "ip"] },
  { title: "Review", blurb: "Check and submit", icon: "check", required: ["agree"] },
];

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v);
const urlOk = (v: string) => !v || /^https?:\/\/\S+\.\S+/.test(v);

function errorsFor(step: number, f: Form, needsPassword: boolean): Partial<Record<Key, string>> {
  const e: Partial<Record<Key, string>> = {};
  for (const k of STEPS[step].required) {
    const v = f[k];
    if (Array.isArray(v) ? !v.length : typeof v === "boolean" ? !v : !v.trim()) {
      e[k] = k === "markets" ? "Pick at least one market" : k === "agree" ? "Please confirm to submit" : "Required";
    }
  }
  if (step === 0) {
    if (f.year && !/^(19|20)\d{2}$/.test(f.year)) e.year = "Enter a 4-digit year";
    if (!urlOk(f.website)) e.website = "Start with https://";
  }
  if (step === 1) {
    if (f.email && !emailOk(f.email)) e.email = "Enter a valid email";
    if (needsPassword && f.password.length < 8) e.password = "Use at least 8 characters for your partner portal password";
  }
  if (step === 2) {
    if (f.what.trim() && f.what.trim().length < 30) e.what = "A little more detail, please (30+ characters)";
    if (hasProhibitedUltimateWording(f.product, f.what)) {
      e.what = "Please use specific, verifiable statements rather than superlatives such as 'ultimate'.";
    }
    if (!urlOk(f.demo)) e.demo = "Start with https://";
  }
  return e;
}

const input =
  "h-12 w-full rounded-lg border border-line bg-mist/50 px-4 text-[15px] text-ink placeholder:text-subtle outline-none transition-[border-color,box-shadow,background-color] focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(30,79,163,0.14)] aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger/[0.03]";

export function PartnerApply() {
  const sell = useSearchParams().get("from") === "sell";
  const eyebrow = sell ? "Sell with us" : "Become a partner";
  const { user, applyPartnerLive } = useStore();
  const alreadySeller = user?.role === "seller";

  const [f, setF] = useState<Form>(initial);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (d?.f) { setF({ ...initial, ...d.f, password: "" }); setStep(d.step ?? 0); setReached(d.reached ?? 0); setRestored(true); }
    } catch {}
  }, []);

  useEffect(() => {
    if (done) return;
    const { password: _pw, ...safeDraft } = f;
    void _pw;
    const t = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ f: safeDraft, step, reached })); } catch {} }, 300);
    return () => clearTimeout(t);
  }, [f, step, reached, done]);

  const set = <K extends Key>(k: K, v: Form[K]) => {
    setSubmitError(null);
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };
  const text = (k: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value as never);

  const toTop = () => {
    const y = (card.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 24;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
  };

  const go = (to: number) => {
    if (to > step) {
      for (let s = step; s < to; s++) {
        const e = errorsFor(s, f, !alreadySeller);
        if (Object.keys(e).length) {
          setStep(s); setErrors(e);
          requestAnimationFrame(() => card.current?.querySelector<HTMLElement>("[aria-invalid=true],[data-invalid=true]")?.focus());
          return;
        }
      }
    }
    setErrors({}); setDir(to > step ? 1 : -1); setStep(to); setReached((r) => Math.max(r, to)); toTop();
  };

  const submit = async () => {
    if (submitting) return;
    for (let s = 0; s < STEPS.length; s++) {
      const e = errorsFor(s, f, !alreadySeller);
      if (Object.keys(e).length) { setDir(s > step ? 1 : -1); setStep(s); setErrors(e); toTop(); return; }
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const regRef = f.regNumber.trim() || `REG-${(f.year || "2026").slice(0, 4)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      await applyPartnerLive({
        companyName: f.company.trim(),
        registrationNumber: regRef,
        countryCode: f.country.trim(),
        directorName: f.name.trim(),
        directorRole: f.role.trim() || "Founder",
        referenceOrg: f.brand.trim() || f.company.trim(),
        referenceContact: f.name.trim(),
        referenceEmail: f.email.trim(),
        productName: f.product.trim(),
        category: mapCategoryLabel(f.category),
        tagline: `${f.category} · ${f.stage}`,
        description: f.what.trim(),
        markets: mapMarketsToCountries(f.markets),
        priceFrom: 32000,
        fullName: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setDone(true);
      toTop();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit your application. Please review your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startOver = () => { setF(initial); setStep(0); setReached(0); setErrors({}); setSubmitError(null); setDone(false); setRestored(false); try { localStorage.removeItem(DRAFT_KEY); } catch {} };

  const pct = done ? 100 : Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <>
      <PageHero>
        <HeroBg image={BG.blue} />
        <div className="relative z-10 flex flex-col gap-6 px-6 pb-12 pt-8 md:px-10 md:pb-16 md:pt-14">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] font-semibold uppercase tracking-[0.16em] text-sky">{eyebrow}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-[820px] text-[40px] font-light leading-[44px] tracking-[-0.05em] md:text-[72px] md:leading-[74px]">
            Tell us about your product
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="max-w-[620px] text-[17px] leading-7 text-white/70">
            Five short steps, about 6 minutes. Your progress saves as you go, and a partner manager replies within 3 working days.
          </motion.p>
        </div>
      </PageHero>

      <section className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-8 px-4 py-10 md:px-8 md:py-16 lg:grid-cols-[300px_1fr] lg:gap-14">
        {/* Stepper */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="mb-4 flex items-center justify-between text-[13px] text-muted lg:hidden">
            <span>Step {Math.min(step + 1, STEPS.length)} of {STEPS.length} · <span className="font-semibold text-ink">{STEPS[step].title}</span></span>
            <span className="font-mono">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-mist lg:hidden">
            <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
          </div>
          <ol className="hidden flex-col gap-1 lg:flex">
            {STEPS.map((s, i) => {
              const state = done || i < step ? "done" : i === step ? "current" : "todo";
              const clickable = !done && i <= reached && i !== step;
              return (
                <li key={s.title}>
                  <button
                    type="button" disabled={!clickable} onClick={() => go(i)}
                    aria-current={state === "current" ? "step" : undefined}
                    className={`flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors ${state === "current" ? "bg-mist" : clickable ? "hover:bg-mist/60" : ""}`}
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors ${state === "done" ? "bg-primary text-white" : state === "current" ? "bg-white text-primary ring-2 ring-primary" : "bg-mist text-subtle"}`}>
                      {state === "done" ? <Icon name="check" size={16} strokeWidth={2.6} /> : <Icon name={s.icon} size={17} />}
                    </span>
                    <span>
                      <span className={`block text-[15px] font-semibold ${state === "todo" ? "text-subtle" : "text-ink"}`}>{s.title}</span>
                      <span className="block text-[13px] text-muted">{s.blurb}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 hidden rounded-lg border border-line p-5 lg:block">
            <p className="text-[14px] font-semibold text-ink">Why we ask</p>
            <p className="mt-2 text-[13px] leading-[21px] text-muted">These details let us check fit before the intro call. Nothing is shared with buyers until you sign the MOU.</p>
            <Link href="/contact" className="mt-3 inline-flex text-[13px] font-semibold text-primary hover:underline">Questions? Talk to us</Link>
          </div>
        </aside>

        {/* Step card */}
        <div ref={card} className="relative overflow-hidden rounded-lg border border-line bg-paper shadow-[0_24px_60px_-30px_rgba(12,31,69,0.35)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-mist">
            <motion.div className="h-full bg-gradient-to-r from-primary to-sky" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
          </div>

          {done ? (
            <Success f={f} onAnother={startOver} />
          ) : (
            <div className="px-5 pb-6 pt-8 sm:px-10 sm:pb-10 sm:pt-10">
              {restored && step > 0 && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mist px-4 py-3 text-[14px] text-ink">
                  <span>Welcome back. We kept your progress.</span>
                  <button onClick={startOver} className="font-semibold text-primary hover:underline">Start over</button>
                </div>
              )}
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-subtle">Step {step + 1} of {STEPS.length}</p>
              <h2 className="mt-2 text-[26px] font-medium leading-8 tracking-[-0.02em] text-ink sm:text-[30px] sm:leading-9">{STEP_HEAD[step]}</h2>

              <AnimatePresence mode="wait" custom={dir}>
                <motion.form
                  key={step}
                  noValidate
                  onSubmit={(e) => { e.preventDefault(); if (step < STEPS.length - 1) go(step + 1); else void submit(); }}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-7"
                >
                  {step === 0 && (
                    <Grid>
                      <Field label="Registered company name" required full error={errors.company}>
                        <input autoFocus className={input} value={f.company} onChange={text("company")} aria-invalid={!!errors.company} autoComplete="organization" />
                      </Field>
                      <Field label="Registration / trade licence no." hint="optional">
                        <input className={input} value={f.regNumber} onChange={text("regNumber")} placeholder="e.g. C-148290" />
                      </Field>
                      <Field label="Brand name" hint="if different">
                        <input className={input} value={f.brand} onChange={text("brand")} />
                      </Field>
                      <Field label="Year established" error={errors.year}>
                        <input className={input} value={f.year} onChange={text("year")} aria-invalid={!!errors.year} inputMode="numeric" maxLength={4} placeholder="e.g. 2016" />
                      </Field>
                      <Field label="Team size">
                        <Select value={f.team} onChange={text("team")} options={TEAM} />
                      </Field>
                      <Field label="Country" required error={errors.country}>
                        <input className={input} value={f.country} onChange={text("country")} aria-invalid={!!errors.country} autoComplete="country-name" />
                      </Field>
                      <Field label="City">
                        <input className={input} value={f.city} onChange={text("city")} autoComplete="address-level2" />
                      </Field>
                      <Field label="Website" full error={errors.website}>
                        <input className={input} value={f.website} onChange={text("website")} aria-invalid={!!errors.website} type="url" placeholder="https://" />
                      </Field>
                    </Grid>
                  )}

                  {step === 1 && (
                    <Grid>
                      <Field label="Full name" required error={errors.name}>
                        <input autoFocus className={input} value={f.name} onChange={text("name")} aria-invalid={!!errors.name} autoComplete="name" />
                      </Field>
                      <Field label="Role">
                        <input className={input} value={f.role} onChange={text("role")} placeholder="Founder, CEO, CTO" autoComplete="organization-title" />
                      </Field>
                      <Field label="Email" required error={errors.email}>
                        <input className={input} value={f.email} onChange={text("email")} aria-invalid={!!errors.email} type="email" autoComplete="email" />
                      </Field>
                      <Field label="Phone or WhatsApp" required error={errors.phone}>
                        <input className={input} value={f.phone} onChange={text("phone")} aria-invalid={!!errors.phone} type="tel" autoComplete="tel" placeholder="+880" />
                      </Field>
                      {!alreadySeller && (
                        <Field label="Create a partner portal password" hint="8+ characters" required full error={errors.password}>
                          <input className={input} value={f.password} onChange={text("password")} aria-invalid={!!errors.password} type="password" minLength={8} autoComplete="new-password" placeholder="••••••••" />
                        </Field>
                      )}
                    </Grid>
                  )}

                  {step === 2 && (
                    <Grid>
                      <Field label="Main product name" required error={errors.product}>
                        <input autoFocus className={input} value={f.product} onChange={text("product")} aria-invalid={!!errors.product} />
                      </Field>
                      <Field label="Products you want to take global">
                        <input className={input} value={f.count} onChange={text("count")} type="number" min={1} />
                      </Field>
                      <Field label="Category" required full error={errors.category}>
                        <Select value={f.category} onChange={text("category")} options={CATEGORIES} invalid={!!errors.category} />
                      </Field>
                      <Field label="What it does" hint="in 2–3 sentences" required full error={errors.what} counter={`${f.what.length}/600`}>
                        <textarea className={`${input} h-auto min-h-[128px] resize-y py-3 leading-6`} maxLength={600} value={f.what} onChange={text("what")} aria-invalid={!!errors.what} placeholder="Who it's for, the problem it solves, and what makes it different." />
                      </Field>
                      <Field label="Stage" required error={errors.stage}>
                        <Select value={f.stage} onChange={text("stage")} options={STAGES} invalid={!!errors.stage} />
                      </Field>
                      <Field label="Paying customers today">
                        <input className={input} value={f.customers} onChange={text("customers")} type="number" min={0} placeholder="0" />
                      </Field>
                      <Field label="Demo or product link" full error={errors.demo}>
                        <input className={input} value={f.demo} onChange={text("demo")} aria-invalid={!!errors.demo} type="url" placeholder="https://" />
                      </Field>
                    </Grid>
                  )}

                  {step === 3 && (
                    <Grid>
                      <Field label="Target markets" hint="choose all that apply" required full error={errors.markets} as="div">
                        <div className="flex flex-wrap gap-2.5" role="group" data-invalid={!!errors.markets || undefined} tabIndex={-1}>
                          {MARKETS.map((m) => {
                            const on = f.markets.includes(m);
                            return (
                              <button
                                key={m} type="button" aria-pressed={on}
                                onClick={() => set("markets", on ? f.markets.filter((x) => x !== m) : [...f.markets, m])}
                                className={`flex h-11 items-center gap-2.5 rounded-full border px-4 text-[15px] font-medium transition-colors ${on ? "border-primary bg-primary text-white" : errors.markets ? "border-danger bg-mist/50 text-ink" : "border-line bg-mist/50 text-ink hover:border-primary/50"}`}
                              >
                                <span className={`grid size-[18px] place-items-center rounded-full border ${on ? "border-white bg-white text-primary" : "border-subtle"}`}>
                                  {on && <Icon name="check" size={11} strokeWidth={3} />}
                                </span>
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      </Field>
                      <Field label="Who owns the IP and source code?" required error={errors.ip}>
                        <Select value={f.ip} onChange={text("ip")} options={IP} invalid={!!errors.ip} />
                      </Field>
                      <Field label="How would you like to work with us?">
                        <Select value={f.mode} onChange={text("mode")} options={MODES} placeholder={false} />
                      </Field>
                    </Grid>
                  )}

                  {step === 4 && <Review f={f} onEdit={(s) => go(s)} agree={f.agree} setAgree={(v) => set("agree", v)} error={errors.agree} />}

                  {submitError && (
                    <div className="mt-5 rounded-lg bg-[#FBE7E7] px-4 py-3 text-sm text-danger">
                      {submitError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                    {step > 0 ? (
                      <button type="button" onClick={() => go(step - 1)} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-line px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mist">
                        <Icon name="arrowRight" size={15} className="rotate-180" /> Back
                      </button>
                    ) : (
                      <Link href="/" className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mist">Cancel</Link>
                    )}
                    <button type="submit" disabled={submitting} className="group inline-flex h-14 items-center justify-center gap-3 rounded-lg bg-primary pl-7 pr-2 text-[16px] font-semibold text-white shadow-[0_14px_32px_-12px_rgba(30,79,163,0.7)] transition-[background-color,transform] hover:bg-primary-strong active:scale-[0.97] disabled:opacity-60">
                      {step < STEPS.length - 1 ? `Continue to ${STEPS[step + 1].title.toLowerCase()}` : submitting ? "Submitting application..." : "Submit application"}
                      <span className="grid size-10 place-items-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                        <Icon name={step < STEPS.length - 1 ? "arrowRight" : "arrowUpRight"} size={14} strokeWidth={2.2} />
                      </span>
                    </button>
                  </div>
                </motion.form>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const STEP_HEAD = ["About your company", "Who should we talk to?", "About your product", "Where do you want to sell?", "Review your application"];

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">{children}</div>;
}

function Field({ label, hint, required, full, error, counter, as = "label", children }: { label: string; hint?: string; required?: boolean; full?: boolean; error?: string; counter?: string; as?: "label" | "div"; children: React.ReactNode }) {
  const Tag = as;
  return (
    <Tag className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-medium text-ink">
          {label}
          {required && <span className="text-primary" aria-hidden> *</span>}
          {hint && <span className="ml-1.5 text-[13px] font-normal text-subtle">{hint}</span>}
        </span>
        {counter && <span className="font-mono text-[12px] text-subtle">{counter}</span>}
      </span>
      {children}
      {error && <span role="alert" className="flex items-center gap-1.5 text-[13px] text-danger"><Icon name="alert" size={13} />{error}</span>}
    </Tag>
  );
}

function Select({ value, onChange, options, invalid, placeholder = true }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; invalid?: boolean; placeholder?: boolean }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} aria-invalid={invalid} className={`${input} appearance-none pr-10 ${value ? "" : "text-subtle"}`}>
        {placeholder && <option value="">Select</option>}
        {options.map((o) => <option key={o} value={o} className="text-ink">{o}</option>)}
      </select>
      <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

function Review({ f, onEdit, agree, setAgree, error }: { f: Form; onEdit: (step: number) => void; agree: boolean; setAgree: (v: boolean) => void; error?: string }) {
  const groups: { step: number; title: string; rows: [string, string][] }[] = [
    { step: 0, title: "Company", rows: [["Company", f.company], ["Registration", f.regNumber], ["Brand", f.brand], ["Established", f.year], ["Team", f.team], ["Location", [f.city, f.country].filter(Boolean).join(", ")], ["Website", f.website]] },
    { step: 1, title: "Contact", rows: [["Name", f.name], ["Role", f.role], ["Email", f.email], ["Phone", f.phone]] },
    { step: 2, title: "Product", rows: [["Product", f.product], ["Products to take global", f.count], ["Category", f.category], ["What it does", f.what], ["Stage", f.stage], ["Paying customers", f.customers], ["Demo link", f.demo]] },
    { step: 3, title: "Going global", rows: [["Markets", f.markets.join(", ")], ["IP owner", f.ip], ["Working model", f.mode]] },
  ];
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.title} className="rounded-lg border border-line">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="text-[15px] font-semibold text-ink">{g.title}</span>
            <button type="button" onClick={() => onEdit(g.step)} className="text-[14px] font-semibold text-primary hover:underline">Edit</button>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-[180px_1fr]">
            {g.rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-[13px] text-muted">{k}</dt>
                <dd className="break-words text-[14px] text-ink max-sm:-mt-2">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <label className={`mt-2 flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-[14px] leading-[22px] text-muted transition-colors ${error ? "border-danger bg-danger/5" : "border-line bg-mist/40"}`}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={!!error} className="mt-[3px] size-[18px] shrink-0 accent-primary" />
        <span>I confirm the details are accurate and agree that the DGIX team may use them to assess this product and prepare an MOU. Applying does not grant any rights or promise a listing; both need a signed agreement.</span>
      </label>
      {error && <span role="alert" className="-mt-2 text-[13px] text-danger">{error}</span>}
    </div>
  );
}

function Success({ f, onAnother }: { f: Form; onAnother: () => void }) {
  const steps = [
    ["Review", "A partner manager reviews your company and product submission within 3 working days."],
    ["Intro call", "A 30-minute call to align on target markets, pricing, and delivery capacity."],
    ["MOU and verification", "Sign the MOU, then complete the 100-point Daffodil Verified check in your partner workspace."],
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start px-5 pb-10 pt-10 sm:px-10">
      <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="grid size-16 place-items-center rounded-full bg-primary text-white shadow-[0_0_0_10px_rgba(30,79,163,0.12)]">
        <Icon name="check" size={30} strokeWidth={2.6} />
      </motion.span>
      <h2 className="mt-7 text-[30px] font-medium leading-9 tracking-[-0.02em] text-ink">Application received</h2>
      <p className="mt-3 max-w-[560px] text-[17px] leading-7 text-muted">
        Thanks{f.name ? `, ${f.name.split(" ")[0]}` : ""}. Your partner profile and product submission for <span className="font-semibold text-ink">{f.product}</span> are now active. We&apos;ll also follow up at <span className="font-semibold text-ink">{f.email}</span>.
      </p>
      <p className="mt-10 text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle">What happens next</p>
      <ol className="mt-3 w-full divide-y divide-line rounded-lg border border-line">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4 p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mist font-mono text-[13px] font-semibold text-primary">{i + 1}</span>
            <span>
              <span className="block text-[15px] font-semibold text-ink">{t}</span>
              <span className="mt-1 block text-[14px] leading-[22px] text-muted">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/seller" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-[15px] font-semibold text-white transition-colors hover:bg-primary-strong">Open Partner portal</Link>
        <Link href="/verified" className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-mist">See the 100-point check</Link>
        <button onClick={onAnother} className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-mist">Apply with another product</button>
      </div>
    </motion.div>
  );
}
