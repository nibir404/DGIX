"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { useLookup, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

const GROUP_LABELS: Array<{ role: "buyer" | "seller" | "staff"; label: string }> = [
  { role: "buyer", label: "Enterprise Buyer" },
  { role: "seller", label: "Software Partners & PAOs" },
  { role: "staff", label: "DGIX Governance, Legal, Finance & Council (4-Eyes SoD)" },
];

/** Live 16-Persona Keycloak OIDC UAT Switcher backed by GET /bff/auth/personas + POST /bff/auth/persona-login. */
export function TestAccounts({ onSignedIn }: { onSignedIn: (u: User) => void }) {
  const { db, personas, switchPersona, signInAs, refreshLive } = useStore();
  const look = useLookup();
  const [open, setOpen] = useState(true);
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "buyer" | "seller" | "staff">("all");
  const [err, setErr] = useState<string | null>(null);

  const handlePersona = async (username: string) => {
    setBusyUser(username);
    setErr(null);
    try {
      const u = await switchPersona(username);
      onSignedIn(u);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to switch Keycloak persona");
    } finally {
      setBusyUser(null);
    }
  };

  return (
    <div className="w-full rounded-lg border border-dashed border-[#CBD7EE] bg-[#F6F9FF]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-caps text-primary">
          <Icon name="shield" size={16} /> Keycloak OIDC UAT Personas ({personas.length || db.users.length})
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-primary">
          <Icon name="chevronDown" size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-3 px-4 pb-4">
              <p className="text-[12.5px] leading-5 text-[#3A4766]">
                Real Keycloak JWT tokens with OPA RBAC &amp; 4-eyes Segregation-of-Duties. Shared UAT password:{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-ink">dgix_local_only</code>
              </p>

              <div className="flex flex-wrap gap-1.5">
                {(["all", "buyer", "seller", "staff"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={clsx(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize transition-colors",
                      filter === tab ? "bg-primary text-white" : "bg-white text-muted hover:text-ink",
                    )}
                  >
                    {tab === "all" ? `All (${personas.length || db.users.length})` : tab}
                  </button>
                ))}
              </div>

              {err && <div className="rounded-lg bg-[#FBE7E7] px-3 py-2 text-xs text-danger">{err}</div>}

              {personas.length > 0 ? (
                <div className="flex max-h-[380px] flex-col gap-3 overflow-y-auto pr-1">
                  {GROUP_LABELS.filter((g) => filter === "all" || g.role === filter).map((group) => {
                    const list = personas.filter((p) => p.portal_role === group.role);
                    if (!list.length) return null;
                    return (
                      <div key={group.role} className="flex flex-col gap-1.5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{group.label}</div>
                        <div className="flex flex-col divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
                          {list.map((p) => {
                            const initials = p.full_name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();
                            const loading = busyUser === p.username;
                            return (
                              <div key={p.username} className="flex items-center gap-3 px-3 py-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-bold text-primary">
                                  {initials}
                                </div>
                                <div className="flex min-w-0 grow basis-0 flex-col">
                                  <span className="truncate text-sm font-medium text-ink">
                                    {p.full_name}{" "}
                                    <span className="ml-1 rounded bg-mist px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
                                      {p.primary_dgix_role}
                                    </span>
                                  </span>
                                  <span className="truncate text-xs text-muted">
                                    {p.username} · {p.title}
                                  </span>
                                  {p.sod_pair_hint && (
                                    <span className="truncate text-[11px] text-[#6B4A12]">4-Eyes: {p.sod_pair_hint}</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  disabled={busyUser !== null}
                                  onClick={() => handlePersona(p.username)}
                                  className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
                                >
                                  {loading ? "Signing in..." : "Sign in"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
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
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => void refreshLive()}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-mist"
                >
                  Refresh live BFF state
                </button>
                <span className="text-[11px] text-muted">BFF: :18118 · Keycloak :18180</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
