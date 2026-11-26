"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

const FORMATS = ["Buyer mission to Dhaka", "Virtual demo day", "Roadshow in my city"];
const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "Qatar", "United States", "Other"];
const SECTORS = ["HR & payroll", "Healthcare", "Education", "Retail & POS", "ERP & finance", "AI & automation", "IT services & teams"];
const KEY = "dgix_event_interest";

const input =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={clsx(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
        on ? "border-primary bg-mist font-medium text-primary" : "border-line text-ink/80 hover:border-[#C9D4E8]",
      )}
    >
      {on && <Icon name="check" size={13} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

/** "Register interest" for buyer missions, demo days and roadshows. Kept in this browser for the demo. */
export function EventsInterestForm() {
  const [f, setF] = useState({ name: "", org: "", email: "", country: COUNTRIES[0], note: "" });
  const [formats, setFormats] = useState<string[]>([FORMATS[1]]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [sent, setSent] = useState(false);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const ready = f.name.trim().length > 1 && f.org.trim().length > 1 && emailOk && formats.length > 0 && agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    try {
      const prev = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      localStorage.setItem(KEY, JSON.stringify([...prev, { ...f, formats, sectors, at: new Date().toISOString() }]));
    } catch {}
    setSent(true);
  };

  return (
    <div className="rounded-lg border border-line bg-white p-6 md:p-8">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-4">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#E6F4EC] text-success"><Icon name="check" size={20} strokeWidth={2.4} /></span>
            <div className="text-[26px] font-light leading-8 tracking-tight text-ink">You&apos;re on the list.</div>
            <p className="max-w-[460px] text-[15px] leading-6 text-muted">
              We&apos;ll send dates and the agenda for {formats.join(", ").toLowerCase()} to {f.email.trim()}, matched to the sectors you picked.
            </p>
            <button type="button" onClick={() => setSent(false)} className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink hover:border-ink">
              Register someone else
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-5">
            <div>
              <h3 className="text-[22px] font-light tracking-tight text-ink">Register your interest</h3>
              <p className="mt-1 text-sm text-muted">Dates are shared with registered buyers first.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5"><span className="text-[13px] font-medium text-ink">Full name</span><input required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} /></label>
              <label className="flex flex-col gap-1.5"><span className="text-[13px] font-medium text-ink">Organisation</span><input required autoComplete="organization" value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} className={input} /></label>
              <label className="flex flex-col gap-1.5"><span className="text-[13px] font-medium text-ink">Work email</span><input required type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} /></label>
              <label className="flex flex-col gap-1.5"><span className="text-[13px] font-medium text-ink">Country</span>
                <select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className={input}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium text-ink">I&apos;m interested in</legend>
              <div className="flex flex-wrap gap-2">{FORMATS.map((x) => <Chip key={x} on={formats.includes(x)} onClick={() => toggle(formats, setFormats, x)}>{x}</Chip>)}</div>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium text-ink">Sectors <span className="font-normal text-muted">(optional)</span></legend>
              <div className="flex flex-wrap gap-2">{SECTORS.map((x) => <Chip key={x} on={sectors.includes(x)} onClick={() => toggle(sectors, setSectors, x)}>{x}</Chip>)}</div>
            </fieldset>
            <label className="flex flex-col gap-1.5"><span className="text-[13px] font-medium text-ink">Anything we should plan for? <span className="font-normal text-muted">(optional)</span></span>
              <textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} rows={3} placeholder="Team size, dates that suit you, specific companies to meet" className="resize-none rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="flex items-start gap-3 text-sm text-muted">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-[#1E4FA3]" />
              I agree that Daffodil Group may contact me about DGIX events.
            </label>
            <button type="submit" disabled={!ready} className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] px-6 text-[15px] font-semibold text-white transition-[filter] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50">
              Register interest <Icon name="arrowRight" size={15} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
