"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

const KEY = "dgix_consent";
type Consent = { essential: true; preferences: boolean; analytics: boolean; marketing: boolean; at: string };

function read(): Consent | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}
function write(c: Omit<Consent, "essential" | "at">) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ essential: true, ...c, at: new Date().toISOString() }));
  } catch {
    /* storage blocked: banner simply closes for this page view */
  }
}

/** Cookie consent banner from the "404 + Cookie banner" artboard. Remembers the choice in localStorage. */
export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [custom, setCustom] = useState(false);
  const [prefs, setPrefs] = useState({ preferences: false, analytics: false, marketing: false });

  useEffect(() => {
    const t = setTimeout(() => setShow(!read()), 600);
    return () => clearTimeout(t);
  }, []);

  const save = (c: typeof prefs) => {
    write(c);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-[60] flex flex-col gap-4 rounded-lg bg-white p-5 shadow-[0_30px_60px_-20px_#00000080] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[520px] sm:max-w-[calc(100vw-48px)] sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mist text-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 109 9 3 3 0 01-3-3 3 3 0 01-3-3 3 3 0 01-3-3z" /><path d="M8.5 10.5h.01M15.5 15.5h.01M10.5 15.5h.01" /></svg>
            </span>
            <span className="text-[18px] font-medium leading-[22px] text-ink">Your privacy, your choice</span>
          </div>
          <p className="text-sm leading-[22px] text-muted">
            We use essential cookies to run DGIX. With your OK we&apos;ll also use analytics to improve it.{" "}
            <Link href="/legal/cookies" className="font-semibold text-ink underline underline-offset-2">Cookie policy</Link>
          </p>
          <AnimatePresence initial={false}>
            {custom && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-col divide-y divide-mist rounded-lg border border-mist">
                  <Row label="Essential" note="Always on" checked disabled />
                  {(["preferences", "analytics", "marketing"] as const).map((k) => (
                    <Row key={k} label={k[0].toUpperCase() + k.slice(1)} checked={prefs[k]} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-col gap-[10px] sm:flex-row">
            <button onClick={() => save({ preferences: false, analytics: false, marketing: false })} className="flex h-[46px] grow basis-0 items-center justify-center rounded-lg border-[1.5px] border-ink text-sm font-semibold text-ink hover:bg-mist">
              Essential only
            </button>
            {custom ? (
              <button onClick={() => save(prefs)} className="flex h-[46px] grow basis-0 items-center justify-center rounded-lg bg-mist text-sm font-semibold text-ink hover:bg-line">
                Save choices
              </button>
            ) : (
              <button onClick={() => setCustom(true)} className="flex h-[46px] grow basis-0 items-center justify-center rounded-lg bg-mist text-sm font-semibold text-ink hover:bg-line">
                Customise
              </button>
            )}
            <button
              onClick={() => save({ preferences: true, analytics: true, marketing: true })}
              className="flex h-[46px] grow basis-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundImage: "linear-gradient(180deg, #4C85EE 0%, #1E4FA3 100%)" }}
            >
              Accept all
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, note, checked, disabled, onChange }: { label: string; note?: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className={clsx("flex items-center justify-between gap-3 px-4 py-3 text-sm text-ink", disabled ? "cursor-default" : "cursor-pointer")}>
      <span>
        {label} {note && <span className="text-xs text-muted">· {note}</span>}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span className={clsx("relative h-6 w-10 shrink-0 rounded-lg transition-colors", checked ? (disabled ? "bg-success/60" : "bg-primary") : "bg-line")}>
        <motion.span animate={{ x: checked ? 18 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} className="absolute top-0.5 size-5 rounded-full bg-white shadow" />
      </span>
    </label>
  );
}
