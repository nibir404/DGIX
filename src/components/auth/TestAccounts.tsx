"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { useLookup, useStore } from "@/lib/store";
import { TEST_PASSWORD } from "@/lib/seed";
import type { User } from "@/lib/types";

/** Demo-only panel: one-click sign-in as any seed user, plus a data reset. Uses the shared seed test password only. */
export function TestAccounts({ onSignedIn }: { onSignedIn: (u: User) => void }) {
  const { db, signInAs, reset } = useStore();
  const look = useLookup();
  const [open, setOpen] = useState(true);
  const [didReset, setDidReset] = useState(false);

  return (
    <div className="w-full rounded-lg border border-dashed border-[#F3D9B0] bg-[#FFFBF4]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-caps text-[#6B4A12]">
          <Icon name="info" size={16} /> Test accounts · demo only
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[#6B4A12]"><Icon name="chevronDown" size={16} /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-3 px-4 pb-4">
              <p className="text-[13px] leading-5 text-[#6B4A12]">
                Every seed user shares the test password <code className="rounded bg-white px-1.5 py-0.5 font-mono text-ink">{TEST_PASSWORD}</code>. Or sign in with one click:
              </p>
              <div className="flex flex-col divide-y divide-[#F3D9B0] overflow-hidden rounded-lg border border-[#F3D9B0] bg-white">
                {db.users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar user={u} size={32} />
                    <div className="flex min-w-0 grow basis-0 flex-col">
                      <span className="truncate text-sm font-medium text-ink">
                        {u.name} <span className="ml-1 rounded-lg bg-mist px-1.5 py-0.5 text-[11px] font-semibold uppercase text-primary">{u.role}</span>
                      </span>
                      <span className="truncate text-xs text-muted">{look.company(u.companyId)?.name} · {u.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const s = signInAs(u.id);
                        if (s) onSignedIn(s);
                      }}
                      className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary"
                    >
                      Sign in as
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setDidReset(true);
                  setTimeout(() => setDidReset(false), 2000);
                }}
                className="self-start rounded-lg border border-[#F3D9B0] bg-white px-4 py-2 text-xs font-semibold text-[#6B4A12] hover:bg-[#FFF3DF]"
              >
                {didReset ? "Demo data reset ✓" : "Reset demo data"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
