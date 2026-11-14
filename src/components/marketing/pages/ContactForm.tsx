"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { submitPublicInquiry } from "@/lib/api";
import { useLookup, useStore } from "@/lib/store";
import { Toast } from "@/components/portal/ui";

const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "United States", "Bangladesh", "Malaysia", "United Kingdom", "Other"];
const COUNTRY_ALIAS: Record<string, string> = { UAE: "United Arab Emirates", USA: "United States", US: "United States", KSA: "Saudi Arabia", UK: "United Kingdom" };

type Mode = "buy" | "sell";

export function ContactForm() {
  const params = useSearchParams();
  const { user, ready, signOut, createRequest } = useStore();
  const look = useLookup();
  const company = look.company(user?.companyId);
  const advisor = look.user(company?.advisorId);
  const advisorLabel = advisor?.name ?? "your advisor";

  const [mode, setMode] = useState<Mode>(params.get("role") === "seller" ? "sell" : "buy");
  const [f, setF] = useState({ name: "", email: "", company: "", country: "United Arab Emirates", need: "" });
  const [sent, setSent] = useState<null | { ref?: string }>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (user) {
      const c = company?.country ? COUNTRY_ALIAS[company.country] ?? company.country : undefined;
      setF((p) => ({ ...p, name: user.name, email: user.email, company: company?.name ?? "", country: c && COUNTRIES.includes(c) ? c : c ? "Other" : p.country }));
      if (user.role === "seller") setMode("sell");
    } else {
      setF((p) => ({ ...p, name: "", email: "", company: "" }));
    }
  }, [ready, user, company]);

  useEffect(() => {
    if (params.get("topic") === "readiness") setF((p) => (p.need ? p : { ...p, need: "I'd like a readiness report for our product." }));
  }, [params]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError(null);
    setF((p) => ({ ...p, [k]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (user?.role === "buyer" && mode === "buy") {
      const firstLine = f.need.split(/[.\n]/)[0].trim().slice(0, 80) || "New request from contact form";
      const req = createRequest({ title: firstLine, need: f.need, country: f.country, budget: "45000", users: "250", goLive: "6 weeks" });
      setSent({ ref: req.ref });
      setToast(true);
      setTimeout(() => setToast(false), 3200);
      return;
    }
    setBusy(true);
    try {
      const res = await submitPublicInquiry({
        mode,
        full_name: f.name.trim(),
        email: f.email.trim(),
        company: f.company.trim(),
        country: f.country,
        need: f.need.trim(),
      });
      setSent({ ref: res.reference });
      setToast(true);
      setTimeout(() => setToast(false), 3200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signedIn = ready && !!user;

  return (
    <div className="relative w-full shrink-0 overflow-hidden rounded-lg bg-white p-5 shadow-[0_40px_80px_-30px_#00000080] md:p-8 lg:w-[560px]">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[460px] flex-col items-center justify-center gap-5 text-center">
            <motion.div initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex size-16 items-center justify-center rounded-full bg-[#E6F4EC] text-success">
              <Icon name="check" size={30} strokeWidth={2} />
            </motion.div>
            <div className="text-[28px] leading-[34px] font-light tracking-[-0.03em] text-ink">{signedIn ? `Sent to ${advisorLabel}.` : "Thanks, we've got it."}</div>
            <p className="max-w-[380px] text-[15px] leading-6 text-muted">
              {sent.ref ? (
                mode === "buy" ? (
                  <>Your request <span className="font-mono text-ink">{sent.ref}</span> is being matched. Expect a verified shortlist within one business day.</>
                ) : (
                  <>Your inquiry <span className="font-mono text-ink">{sent.ref}</span> has been logged with our partner team. Expect a reply within one business day.</>
                )
              ) : (
                "A named advisor will reply within one business day."
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {signedIn && user?.role === "buyer" && <Link href="/buyer" className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-semibold text-white">Open my portal</Link>}
              {signedIn && user?.role === "seller" && <Link href="/seller" className="inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-semibold text-white">Open partner portal</Link>}
              <button onClick={() => { setSent(null); setF((p) => ({ ...p, need: "" })); }} className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink">Send another</button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-5">
            <div className="relative flex rounded-lg bg-mist p-1" role="tablist">
              {(["buy", "sell"] as Mode[]).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={clsx("relative flex h-10 grow basis-0 items-center justify-center text-sm leading-[18px] transition-colors", mode === m ? "font-semibold text-ink" : "font-medium text-muted")}>
                  {mode === m && <motion.span layoutId="contact-toggle" className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_#0C1F451F]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{m === "buy" ? "I'm buying" : "I'm selling"}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name"><input required value={f.name} onChange={set("name")} className={inputCls} autoComplete="name" /></Field>
              <Field label="Work email"><input required type="email" value={f.email} onChange={set("email")} className={inputCls} autoComplete="email" /></Field>
              <Field label="Company"><input required value={f.company} onChange={set("company")} className={inputCls} autoComplete="organization" /></Field>
              <Field label="Country">
                <div className="relative">
                  <select value={f.country} onChange={set("country")} className={clsx(inputCls, "w-full")}>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </Field>
            </div>
            <Field label={mode === "buy" ? "What do you need?" : "What do you sell?"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.textarea
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  required
                  value={f.need}
                  onChange={set("need")}
                  placeholder={mode === "buy" ? "Users, integrations, budget, deadline…" : "Product, customers today, markets you want…"}
                  className="h-[120px] w-full resize-none rounded-lg border border-line px-5 py-4 text-[15px] leading-6 text-ink outline-none placeholder:text-[#9AA2B4] focus:border-primary"
                />
              </AnimatePresence>
            </Field>
            {error && <p className="rounded-lg bg-[#FBE7E7] px-3.5 py-2.5 text-xs font-medium text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="group flex h-14 items-center justify-center gap-[10px] rounded-lg text-base font-semibold leading-5 text-white shadow-[inset_0_1px_0_#FFFFFF66,0_12px_28px_-10px_#1E4FA3B3] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              style={{ backgroundImage: "linear-gradient(180deg, #4C85EE 0%, #1E4FA3 100%)" }}
            >
              {busy ? "Sending..." : signedIn ? "Send to advisory team" : mode === "buy" ? "Get my verified shortlist" : "Send partner inquiry"}
              <Icon name="arrowRight" size={18} strokeWidth={1.75} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <div className="text-center text-xs leading-[18px] text-muted">
              {signedIn ? (
                <>
                  Signed in as {user!.name} · filled from your account. Not you?{" "}
                  <button type="button" onClick={signOut} className="underline underline-offset-2 hover:text-ink">Sign out</button>
                </>
              ) : (
                <>
                  Have an account? <Link href="/sign-in?next=/contact" className="underline underline-offset-2 hover:text-ink">Sign in</Link> to fill this from your profile.
                </>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <Toast show={toast}>Request received</Toast>
    </div>
  );
}

const inputCls = "h-[52px] w-full rounded-lg border border-line bg-white px-5 text-[15px] leading-[18px] text-ink outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium leading-4 text-ink">{label}</span>
      {children}
    </label>
  );
}
