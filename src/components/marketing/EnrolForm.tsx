"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

/* Buyer organisation enrolment: five checked steps, progress saved in this browser. */

const KEY = "dgix_enrolment_draft";
const STEPS = ["Organisation", "Administrator", "Team", "Verification", "Review"] as const;
const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "Qatar", "United States", "Bahrain", "Kuwait", "Oman", "Other"];
const INDUSTRIES = ["Retail", "Healthcare", "Education", "Logistics", "Financial services", "Government", "Manufacturing", "Professional services", "Other"];
const SIZES = ["1–50", "51–250", "251–1,000", "1,001–5,000", "5,000+"];
const ROLES = ["Approver", "Finance", "Viewer"] as const;

type Member = { email: string; role: (typeof ROLES)[number] };
type Draft = {
  org: { legal: string; trading: string; country: string; city: string; reg: string; website: string; industry: string; size: string };
  admin: { name: string; title: string; email: string; phone: string };
  team: Member[];
  doc: string; // file name of the trade licence / registration certificate
  agree: boolean;
};

const EMPTY: Draft = {
  org: { legal: "", trading: "", country: COUNTRIES[0], city: "", reg: "", website: "", industry: INDUSTRIES[0], size: SIZES[1] },
  admin: { name: "", title: "", email: "", phone: "" },
  team: [],
  doc: "",
  agree: false,
};

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const input =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function stepErrors(step: number, d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0) {
    if (d.org.legal.trim().length < 2) e.legal = "Enter the registered company name.";
    if (d.org.city.trim().length < 2) e.city = "Enter the city of the head office.";
    if (d.org.reg.trim().length < 3) e.reg = "Enter the trade licence or registration number.";
    if (d.org.website && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/.test(d.org.website.trim())) e.website = "Enter a valid website, or leave it blank.";
  }
  if (step === 1) {
    if (d.admin.name.trim().length < 2) e.name = "Enter the administrator's full name.";
    if (d.admin.title.trim().length < 2) e.title = "Enter their job title.";
    if (!emailOk(d.admin.email)) e.email = "Enter a valid work email.";
  }
  if (step === 2) {
    d.team.forEach((m, i) => {
      if (m.email && !emailOk(m.email)) e[`m${i}`] = "Enter a valid email or remove this row.";
      if (m.email.trim().toLowerCase() === d.admin.email.trim().toLowerCase() && m.email) e[`m${i}`] = "The administrator is already included.";
    });
  }
  if (step === 3 && !d.doc) e.doc = "Add your trade licence or registration certificate.";
  if (step === 4 && !d.agree) e.agree = "Confirm the declaration to submit.";
  return e;
}

export function EnrolForm() {
  const [d, setD] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore saved progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setD({ ...EMPTY, ...saved.d, org: { ...EMPTY.org, ...saved.d?.org }, admin: { ...EMPTY.admin, ...saved.d?.admin } });
        setStep(Math.min(saved.step ?? 0, STEPS.length - 1));
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded || done) return;
    try { localStorage.setItem(KEY, JSON.stringify({ d, step })); } catch {}
  }, [d, step, loaded, done]);

  const errors = stepErrors(step, d);
  const show = (k: string) => (tried ? errors[k] : undefined);
  const setOrg = (k: keyof Draft["org"], v: string) => setD({ ...d, org: { ...d.org, [k]: v } });
  const setAdmin = (k: keyof Draft["admin"], v: string) => setD({ ...d, admin: { ...d.admin, [k]: v } });

  const next = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    setTried(false);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    const ref = "ENR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      const prev = JSON.parse(localStorage.getItem("dgix_enrolments") ?? "[]");
      localStorage.setItem("dgix_enrolments", JSON.stringify([...prev, { ref, at: new Date().toISOString(), ...d, team: d.team.filter((m) => m.email) }]));
      localStorage.removeItem(KEY);
    } catch {}
    setDone(ref);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-5 rounded-lg border border-line bg-white p-6 md:p-10">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#E6F4EC] text-success"><Icon name="check" size={22} strokeWidth={2.4} /></span>
        <div>
          <div className="font-mono text-sm text-muted">{done}</div>
          <h2 className="mt-1 text-[30px] font-light leading-9 tracking-tight text-ink">{d.org.legal} is enrolled for review.</h2>
        </div>
        <ol className="flex flex-col gap-3 text-[15px] leading-6 text-muted">
          <li className="flex gap-3"><span className="font-mono text-primary">1</span>DGIX checks your registration and the document you added.</li>
          <li className="flex gap-3"><span className="font-mono text-primary">2</span>{d.admin.name.split(" ")[0]} gets an email to set a password and turn on two-factor sign-in.</li>
          <li className="flex gap-3"><span className="font-mono text-primary">3</span>{d.team.filter((m) => m.email).length ? `${d.team.filter((m) => m.email).length} colleague${d.team.filter((m) => m.email).length > 1 ? "s are" : " is"} invited once the company is verified.` : "You can invite colleagues once the company is verified."}</li>
        </ol>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-semibold text-white">Describe your first need</Link>
          <Link href="/" className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink hover:border-ink">Back to DGIX</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white">
      {/* progress */}
      <ol className="flex gap-1 overflow-x-auto border-b border-line px-4 py-4 md:px-8" aria-label="Enrolment steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex shrink-0 items-center gap-2 pr-3">
            <span className={clsx("flex size-7 items-center justify-center rounded-full text-xs font-semibold", i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-mist text-muted")}>
              {i < step ? <Icon name="check" size={13} strokeWidth={2.6} /> : i + 1}
            </span>
            <span className={clsx("text-sm", i === step ? "font-semibold text-ink" : "text-muted")} aria-current={i === step ? "step" : undefined}>{s}</span>
            {i < STEPS.length - 1 && <span aria-hidden className="ml-1 h-px w-5 bg-line" />}
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="flex flex-col gap-6 p-5 md:p-8" noValidate>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }} className="flex flex-col gap-5">
            {step === 0 && (
              <>
                <h2 className="text-[22px] font-light tracking-tight text-ink">Your organisation</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Registered company name" error={show("legal")}><input value={d.org.legal} onChange={(e) => setOrg("legal", e.target.value)} autoComplete="organization" className={input} /></Field>
                  <Field label="Trading name" hint="If different from the registered name"><input value={d.org.trading} onChange={(e) => setOrg("trading", e.target.value)} className={input} /></Field>
                  <Field label="Country"><select value={d.org.country} onChange={(e) => setOrg("country", e.target.value)} className={input}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                  <Field label="City" error={show("city")}><input value={d.org.city} onChange={(e) => setOrg("city", e.target.value)} autoComplete="address-level2" className={input} /></Field>
                  <Field label="Trade licence or registration number" error={show("reg")}><input value={d.org.reg} onChange={(e) => setOrg("reg", e.target.value)} className={input} /></Field>
                  <Field label="Website" hint="Optional" error={show("website")}><input value={d.org.website} onChange={(e) => setOrg("website", e.target.value)} inputMode="url" placeholder="example.com" className={input} /></Field>
                  <Field label="Industry"><select value={d.org.industry} onChange={(e) => setOrg("industry", e.target.value)} className={input}>{INDUSTRIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                  <Field label="Employees"><select value={d.org.size} onChange={(e) => setOrg("size", e.target.value)} className={input}>{SIZES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <h2 className="text-[22px] font-light tracking-tight text-ink">Account administrator</h2>
                  <p className="mt-1 text-sm text-muted">The person who owns the DGIX account, approves colleagues and signs contracts. Administrators always use two-factor sign-in.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={show("name")}><input value={d.admin.name} onChange={(e) => setAdmin("name", e.target.value)} autoComplete="name" className={input} /></Field>
                  <Field label="Job title" error={show("title")}><input value={d.admin.title} onChange={(e) => setAdmin("title", e.target.value)} autoComplete="organization-title" className={input} /></Field>
                  <Field label="Work email" error={show("email")}><input type="email" value={d.admin.email} onChange={(e) => setAdmin("email", e.target.value)} autoComplete="email" className={input} /></Field>
                  <Field label="Phone" hint="Optional · for verification calls"><input type="tel" value={d.admin.phone} onChange={(e) => setAdmin("phone", e.target.value)} autoComplete="tel" className={input} /></Field>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-[22px] font-light tracking-tight text-ink">Invite your team</h2>
                  <p className="mt-1 text-sm text-muted">Optional. Invitations go out once your company is verified. Approvers sign off offers, Finance handles invoices, Viewers follow along.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {d.team.map((m, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input type="email" aria-label={`Colleague ${i + 1} email`} value={m.email} placeholder="colleague@company.com" onChange={(e) => setD({ ...d, team: d.team.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)) })} className={input} />
                        <select aria-label={`Colleague ${i + 1} role`} value={m.role} onChange={(e) => setD({ ...d, team: d.team.map((x, j) => (j === i ? { ...x, role: e.target.value as Member["role"] } : x)) })} className={clsx(input, "sm:w-44")}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
                        <button type="button" aria-label="Remove colleague" onClick={() => setD({ ...d, team: d.team.filter((_, j) => j !== i) })} className="flex h-12 shrink-0 items-center justify-center rounded-lg border border-line px-4 text-muted hover:border-danger hover:text-danger sm:w-12 sm:px-0"><Icon name="x" size={16} /></button>
                      </div>
                      {show(`m${i}`) && <span className="text-xs text-danger">{show(`m${i}`)}</span>}
                    </div>
                  ))}
                  {d.team.length < 10 && (
                    <button type="button" onClick={() => setD({ ...d, team: [...d.team, { email: "", role: "Viewer" }] })} className="inline-flex h-11 items-center gap-2 self-start rounded-lg bg-mist px-4 text-sm font-semibold text-primary hover:bg-[#E2EAF7]">
                      <Icon name="plus" size={15} /> Add a colleague
                    </button>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h2 className="text-[22px] font-light tracking-tight text-ink">Verification</h2>
                  <p className="mt-1 text-sm text-muted">DGIX verifies every buyer company before the first shortlist. Add your trade licence or certificate of registration (PDF or image).</p>
                </div>
                <label className={clsx("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed px-4 py-10 text-center transition-colors", d.doc ? "border-success bg-[#F3FAF6]" : "border-[#C9D4E8] bg-[#F9FAFD] hover:border-primary")}>
                  <input type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setD({ ...d, doc: f.name }); }} />
                  <span className={clsx("flex size-11 items-center justify-center rounded-full", d.doc ? "bg-[#E6F4EC] text-success" : "bg-mist text-primary")}><Icon name={d.doc ? "check" : "upload"} size={20} /></span>
                  <span className="text-sm text-ink">{d.doc ? d.doc : <>Drop a file or <span className="font-semibold text-primary">browse</span></>}</span>
                  <span className="text-xs text-muted">The file stays in this browser in the demo.</span>
                </label>
                {!d.doc && (
                  <button type="button" onClick={() => setD({ ...d, doc: "sample-trade-licence.pdf" })} className="self-start text-sm font-medium text-primary hover:underline">Use sample document</button>
                )}
                {show("doc") && <span className="text-xs text-danger">{show("doc")}</span>}
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-[22px] font-light tracking-tight text-ink">Review and submit</h2>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg bg-[#F5F8FC] p-5 text-sm sm:grid-cols-2">
                  {([
                    ["Company", `${d.org.legal}${d.org.trading ? ` (${d.org.trading})` : ""}`],
                    ["Location", `${d.org.city}, ${d.org.country}`],
                    ["Registration", d.org.reg],
                    ["Industry · size", `${d.org.industry} · ${d.org.size}`],
                    ["Administrator", `${d.admin.name}, ${d.admin.title}`],
                    ["Admin email", d.admin.email],
                    ["Team invites", d.team.filter((m) => m.email).map((m) => `${m.email} (${m.role})`).join(", ") || "None yet"],
                    ["Document", d.doc],
                  ] as [string, string][]).map(([k, v], i) => (
                    <div key={k} className="min-w-0">
                      <dt className="flex items-center justify-between text-xs text-muted">{k}
                        <button type="button" onClick={() => setStep(i < 4 ? 0 : i < 6 ? 1 : i === 6 ? 2 : 3)} className="text-xs font-medium text-primary hover:underline">Edit</button>
                      </dt>
                      <dd className="mt-0.5 break-words font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <label className="flex items-start gap-3 text-sm text-muted">
                  <input type="checkbox" checked={d.agree} onChange={(e) => setD({ ...d, agree: e.target.checked })} className="mt-0.5 size-4 accent-[#1E4FA3]" />
                  I confirm I&apos;m authorised to enrol this organisation and the details are correct. DGIX may verify them with the issuing authority.
                </label>
                {show("agree") && <span className="text-xs text-danger">{show("agree")}</span>}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => { setTried(false); setStep(Math.max(0, step - 1)); }} disabled={step === 0} className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-5 text-sm font-medium text-ink hover:border-ink disabled:invisible">
            Back
          </button>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted sm:inline">Progress saves in this browser</span>
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] px-6 text-[15px] font-semibold text-white transition-[filter] hover:brightness-110">
              {step === STEPS.length - 1 ? "Submit for verification" : "Continue"} <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
