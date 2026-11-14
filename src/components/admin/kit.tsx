"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Toast } from "@/components/portal/ui";

/** Toast hook: `flash("Saved")` shows the shared Toast for ~2.6s. */
export function useFlash() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((m: string) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  const node = <Toast show={!!msg}>{msg}</Toast>;
  return { flash, toast: node };
}

export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("text-[14px] leading-[18px] text-muted", className)}>{children}</div>;
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[34px] leading-[40px] font-light tracking-[-0.03em] text-ink md:text-[40px] md:leading-[48px]">{children}</h1>;
}

/** Thin progress bar with draw-in. */
export function Bar({ value, color = "#1E4FA3", track = "#EEF3FB", className, striped }: { value: number; color?: string; track?: string; className?: string; striped?: boolean }) {
  return (
    <div className={clsx("h-1 w-full overflow-hidden rounded-lg", className)} style={{ background: track }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={clsx("h-full rounded-lg", striped && "hatch")}
        style={{ background: striped ? undefined : color }}
      />
    </div>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={clsx(
        "flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors",
        checked ? "border-primary bg-primary text-white" : "border-line bg-white",
      )}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      )}
    </button>
  );
}

export const panel = "rounded-lg bg-white p-6";
export const k = (n: number) => "$" + (n >= 1000 ? Math.round(n / 100) / 10 + "k" : n);
