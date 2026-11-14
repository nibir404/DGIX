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
const HelpIcon = () => <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" /></svg>;

/**
 * Account menu: profile, account settings, help and sign out.
 * `variant="header"` is the round avatar in the top bar (opens downward);
 * `variant="sidebar"` is the user row at the bottom of the sidebar (opens upward).
 */
export function AccountMenu({ variant = "header", collapsed = false }: { variant?: "header" | "sidebar"; collapsed?: boolean }) {
  const { user, signOut } = useStore();
  const { company } = useLookup();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
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
  const items = [
    { href: `${base}/account#profile`, label: "Profile", icon: <UserIcon /> },
    { href: `${base}/account#settings`, label: "Account settings", icon: <GearIcon /> },
    ...(user.role !== "staff" ? [{ href: `${base}/support`, label: "Help & support", icon: <HelpIcon /> }] : []),
  ];
  const up = variant === "sidebar";

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
                <span className="block truncate text-xs leading-4 text-muted">{user.title}</span>
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
              "absolute z-50 w-[min(280px,calc(100vw-32px))] rounded-lg border border-line/70 bg-white p-1.5 shadow-[0_24px_60px_rgba(12,31,69,0.18)]",
              up ? (collapsed ? "bottom-0 left-full ml-3 origin-bottom-left" : "bottom-full left-0 mb-2 origin-bottom-left") : "right-0 top-14 origin-top-right",
            )}
          >
            <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
              <Avatar user={user} size={40} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
                <div className="truncate text-xs text-muted">{user.email}</div>
                <div className="truncate text-xs text-subtle">{co?.name}</div>
              </div>
            </div>
            <div className="h-px bg-line" />
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
