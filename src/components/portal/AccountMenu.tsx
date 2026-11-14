"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { portalHome, useLookup, useStore } from "@/lib/store";

const svg = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const UserIcon = () => <svg {...svg}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" /></svg>;
const GearIcon = () => (
  <svg {...svg}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

/**
 * Account menu: profile, 4-Eyes Keycloak persona switcher, account settings, and sign out.
 */
export function AccountMenu({ variant = "header", collapsed = false }: { variant?: "header" | "sidebar"; collapsed?: boolean }) {
  const { user, authSession, personas, switchPersona, signOut } = useStore();
  const { company, user: findUser } = useLookup();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [switchingUser, setSwitchingUser] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setShowSwitcher(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const base = portalHome[user.role];
  const co = company(user.companyId);
  const advisor = user.role !== "staff" ? findUser(co?.advisorId) : undefined;
  const activeRole = authSession?.user.primary_dgix_role ?? user.primaryDgixRole ?? user.role;
  const activeUsername = authSession?.user.username ?? user.username;
  const items = [
    { href: `${base}/account#profile`, label: "Profile", icon: <UserIcon /> },
    { href: `${base}/account#settings`, label: "Account settings", icon: <GearIcon /> },
  ];
  const up = variant === "sidebar";

  const handleSwitch = async (username: string) => {
    setSwitchingUser(username);
    try {
      const next = await switchPersona(username);
      setOpen(false);
      if (next.role !== user.role) {
        router.push(portalHome[next.role]);
      }
    } finally {
      setSwitchingUser(null);
    }
  };

  return (
    <div ref={ref} className={clsx("relative", variant === "sidebar" && "w-full")}>
      {variant === "header" ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          className={clsx("block rounded-full transition-shadow", open ? "ring-4 ring-sky/40" : "hover:ring-4 hover:ring-sky/25")}
        >
          <Avatar user={user} size={44} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          title={collapsed ? user.name : undefined}
          className={clsx("flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-mist/70", open && "bg-mist", collapsed && "justify-center")}
        >
          <Avatar user={user} size={36} />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold leading-[18px] text-ink">{user.name}</span>
                <span className="block truncate text-xs leading-4 text-muted">
                  {activeRole} · {user.title}
                </span>
              </span>
              <Icon name="chevronDown" size={14} className={clsx("shrink-0 text-subtle transition-transform", !open && "rotate-180")} />
            </>
          )}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={clsx(
              "absolute z-50 w-[min(320px,calc(100vw-32px))] rounded-lg border border-line/70 bg-white p-1.5 shadow-[0_24px_60px_rgba(12,31,69,0.18)]",
              up ? (collapsed ? "bottom-0 left-full ml-3 origin-bottom-left" : "bottom-full left-0 mb-2 origin-bottom-left") : "right-0 top-14 origin-top-right",
            )}
          >
            <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
              <Avatar user={user} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
                <div className="truncate text-xs text-muted">{user.email}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="rounded bg-mist px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
                    {activeRole}
                  </span>
                  {authSession?.user.mfa_level && (
                    <span className="rounded bg-[#E6F4EC] px-1.5 py-0.5 text-[10px] font-semibold text-[#145C36]">
                      MFA: {authSession.user.mfa_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="h-px bg-line" />

            {personas.length > 0 && (
              <>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => setShowSwitcher((v) => !v)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-semibold text-primary hover:bg-mist"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="shield" size={14} /> Switch 4-Eyes / UAT Persona
                    </span>
                    <Icon name="chevronDown" size={14} className={clsx("transition-transform", showSwitcher && "rotate-180")} />
                  </button>
                  {showSwitcher && (
                    <div className="mt-1 max-h-[220px] overflow-y-auto rounded-md border border-line bg-[#F9FBFF] p-1">
                      {personas.map((p) => {
                        const isCurrent = p.username === activeUsername;
                        return (
                          <button
                            key={p.username}
                            type="button"
                            disabled={switchingUser !== null || isCurrent}
                            onClick={() => void handleSwitch(p.username)}
                            className={clsx(
                              "flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors",
                              isCurrent ? "bg-mist font-semibold text-primary" : "hover:bg-white text-ink",
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {p.username}{" "}
                              <span className="text-[10.5px] text-muted">({p.primary_dgix_role})</span>
                            </span>
                            <span className="shrink-0 text-[10.5px] font-semibold text-primary">
                              {isCurrent ? "Active" : switchingUser === p.username ? "..." : "Switch"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="h-px bg-line" />
              </>
            )}

            {advisor && (
              <>
                <Link
                  href={`${base}/support`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group my-1 flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-mist"
                >
                  <span className="relative shrink-0">
                    <Avatar user={advisor} size={32} />
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-white" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{advisor.name}</span>
                    <span className="block truncate text-xs text-success">{user.role === "buyer" ? "Advisor" : "Manager"} · online</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-primary transition-colors group-hover:bg-white">
                    <Icon name="chat" size={13} /> Message
                  </span>
                </Link>
                <div className="h-px bg-line" />
              </>
            )}
            <div className="flex flex-col py-1">
              {items.map((it) => (
                <Link
                  key={it.label}
                  href={it.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex h-10 items-center gap-3 rounded-md px-2.5 text-sm text-ink/85 transition-colors hover:bg-mist hover:text-ink"
                >
                  <span className="text-muted">{it.icon}</span>
                  {it.label}
                </Link>
              ))}
            </div>
            <div className="h-px bg-line" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
                router.push("/");
              }}
              className="mt-1 flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-sm text-danger transition-colors hover:bg-[#FBE7E7]"
            >
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
