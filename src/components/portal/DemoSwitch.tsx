"use client";

import clsx from "clsx";
import { portalHome, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

/** The people used in docs/DEMO_SCRIPT.md: the buyer, DGIX staff, and the two sellers (Track 1 and seller onboarding). */
const PEOPLE: { id: string; role: Role; label: string }[] = [
  { id: "u-omar", role: "buyer", label: "Buyer" },
  { id: "u-asha", role: "staff", label: "Staff" },
  { id: "u-nadia", role: "seller", label: "Seller" },
  { id: "u-rahim", role: "seller", label: "Seller" },
];

/**
 * Demo bar for presenting the workflow: switch between buyer, staff and seller in one click
 * instead of signing out and in. Everything runs on sample data in this browser.
 */
export function DemoSwitch() {
  const { user, db } = useStore();
  if (!user) return null;

  // Write the session cookies (same ones sign-in sets) and load the other portal fresh.
  // Switching the in-memory user first would make the current portal's role guard bounce to /sign-in.
  const go = (id: string, role: Role) => {
    if (id === user.id) return;
    const week = 60 * 60 * 24 * 7;
    document.cookie = `dgix_uid=${id}; path=/; max-age=${week}; samesite=lax`;
    document.cookie = `dgix_role=${role}; path=/; max-age=${week}; samesite=lax`;
    window.location.assign(portalHome[role]);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-white/70 px-4 py-2 backdrop-blur sm:px-5 lg:px-8">
      <p className="text-xs text-muted">
        <span className="mr-1.5 inline-block rounded bg-mist px-1.5 py-0.5 font-semibold text-primary">Demo</span>
        Sample data · stays in this browser
      </p>
      <div role="group" aria-label="View the demo as" className="flex items-center gap-1 rounded-lg bg-mist p-1">
        {PEOPLE.map((p) => {
          const person = db.users.find((u) => u.id === p.id);
          const on = user.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => go(p.id, p.role)}
              className={clsx(
                "h-7 rounded-md px-2.5 text-xs transition-colors",
                on ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(12,31,69,0.12)]" : "text-muted hover:text-ink",
              )}
            >
              <span className="hidden sm:inline">{p.label} · </span>
              {person?.name.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
