"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useLookup, useStore } from "@/lib/store";
import type { Db, Role } from "@/lib/types";

type Item = { href: string; label: string; icon: IconName; badge?: (db: Db, companyId: string) => number; tone?: "amber" | "red" };
type Config = { groups: { label?: string; items: Item[] }[]; primary: { label: string; href: string }; search: string };

export const portalConfig: Record<Role, Config> = {
  buyer: {
    primary: { label: "New request", href: "/buyer/requests/new" },
    search: "Search requests, offers, invoices",
    groups: [
      {
        items: [
          { href: "/buyer", label: "Home", icon: "home" },
          { href: "/buyer/requests", label: "Requests", icon: "sparkle", badge: (db, c) => db.requests.filter((r) => r.buyerId === c && r.status === "shortlist_sent").length },
          { href: "/buyer/demos", label: "Demos", icon: "video" },
          { href: "/buyer/offers", label: "Offers & contracts", icon: "file" },
        ],
      },
      {
        label: "After you buy",
        items: [
          { href: "/buyer/projects", label: "Projects", icon: "pulse" },
          { href: "/buyer/billing", label: "Billing", icon: "card", badge: (db, c) => db.invoices.filter((i) => i.buyerId === c && i.status === "due").length },
          { href: "/buyer/licences", label: "Licences", icon: "lock" },
          { href: "/buyer/support", label: "Support", icon: "chat" },
        ],
      },
    ],
  },
  seller: {
    primary: { label: "+ Add product", href: "/seller/products" },
    search: "Search leads, orders, payouts",
    groups: [
      {
        items: [
          { href: "/seller", label: "Home", icon: "home" },
          { href: "/seller/products", label: "Products & passport", icon: "box" },
          { href: "/seller/verification", label: "Verification", icon: "shield", badge: (db, c) => db.products.filter((p) => p.partnerId === c && p.status === "in_review").flatMap((p) => p.checks.filter((x) => x.score < x.max)).length },
          { href: "/seller/leads", label: "Leads & demos", icon: "users", badge: (db, c) => db.demos.filter((d) => db.products.find((p) => p.id === d.productId)?.partnerId === c && d.status !== "done").length },
        ],
      },
      {
        label: "After you sell",
        items: [
          { href: "/seller/orders", label: "Orders & delivery", icon: "pulse" },
          { href: "/seller/payouts", label: "Payouts", icon: "card" },
          { href: "/seller/agreement", label: "Agreement", icon: "file" },
          { href: "/seller/support", label: "Support", icon: "chat" },
        ],
      },
    ],
  },
  staff: {
    primary: { label: "+ New shortlist", href: "/admin/matching" },
    search: "Search buyers, partners, deals",
    groups: [
      {
        items: [
          { href: "/admin", label: "Today", icon: "sun" },
          { href: "/admin/matching", label: "Matching desk", icon: "sparkle", badge: (db) => db.requests.filter((r) => r.status === "matching").length },
          { href: "/admin/review", label: "Product review", icon: "shield", badge: (db) => db.products.filter((p) => p.status === "in_review" && p.gate >= "PG3").length },
          { href: "/admin/offers", label: "Offers & contracts", icon: "file" },
        ],
      },
      {
        label: "Operations",
        items: [
          { href: "/admin/delivery", label: "Delivery", icon: "pulse", badge: (db) => db.projects.filter((p) => p.health !== "on_track").length, tone: "red" },
          { href: "/admin/finance", label: "Finance", icon: "card" },
          { href: "/admin/partners", label: "Partners & buyers", icon: "users" },
        ],
      },
    ],
  },
};

export function PortalShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { db, user, ready, signOut } = useStore();
  const { company, user: findUser } = useLookup();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const cfg = portalConfig[role];
  const co = company(user?.companyId);
  const advisor = role === "staff" ? user : findUser(co?.advisorId);
  const unread = user ? db.notifications.filter((n) => n.userId === user.id && !n.read).length : 0;

  if (!ready) return <div className="min-h-screen bg-[#F5F8FC]" />;
  if (!user || user.role !== role) {
    if (typeof window !== "undefined") router.replace("/sign-in");
    return null;
  }

  const homeHref = cfg.groups[0].items[0].href;

  return (
    <div className="flex min-h-screen bg-[#F5F8FC] text-ink">
      <aside className={clsx("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-white px-4 py-5 md:flex transition-[width]", collapsed ? "w-[84px]" : "w-64")}>
        <div className="flex items-center justify-between px-1 pb-6">
          <Link href="/" aria-label="DGIX website">
            <Image src="/brand/dgix-logo-full.png" alt="DGIX" width={140} height={37} className={clsx("h-9 w-auto", collapsed && "hidden")} />
            {collapsed && <Image src="/brand/dgix-logo-mark.png" alt="DGIX" width={36} height={36} className="h-9 w-9 object-contain" />}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar" className="text-subtle hover:text-ink">
              <Icon name="sidebar" size={18} />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar" className="mb-4 self-center text-subtle hover:text-ink">
            <Icon name="sidebar" size={18} />
          </button>
        )}
        <div className={clsx("mb-5 flex items-center gap-3 rounded-lg px-2 py-2", collapsed && "justify-center")}>
          <div className={clsx("flex size-[34px] shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white", role === "seller" ? "bg-[linear-gradient(135deg,#14804A,#3DDC84)]" : role === "staff" ? "bg-[linear-gradient(135deg,#163C7E,#1E4FA3)]" : "bg-[linear-gradient(135deg,#F6A11A,#E52A2A)]")}>
            {(co?.name ?? "").split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-[18px]">{co?.name}</div>
              <div className={clsx("text-xs leading-4", role === "buyer" ? "text-success" : "text-muted")}>
                {role === "buyer" ? `Verified buyer · ${co?.country === "United Arab Emirates" ? "UAE" : co?.country}` : role === "seller" ? `Partner · ${co?.city}` : `Staff · ${co?.city}`}
              </div>
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {cfg.groups.map((g, gi) => (
            <div key={gi} className="flex flex-col gap-1">
              {g.label && !collapsed && <div className="px-3 pb-2 pt-5 text-[11px] leading-[14px] text-subtle">{g.label}</div>}
              {g.label && collapsed && <div className="my-3 h-px bg-line" />}
              {g.items.map((it) => {
                const active = it.href === homeHref ? pathname === it.href : pathname.startsWith(it.href);
                const n = it.badge?.(db, user.companyId) ?? 0;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    title={collapsed ? it.label : undefined}
                    className={clsx(
                      "relative flex h-[42px] items-center gap-3 rounded-lg px-3 text-[15px] transition-colors",
                      active ? "bg-mist font-medium text-primary" : "text-ink/80 hover:bg-mist/60",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && <motion.span layoutId={`pill-${role}`} className="absolute inset-0 -z-0 rounded-lg bg-mist" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
                    <Icon name={it.icon} size={18} className="relative" />
                    {!collapsed && <span className="relative flex-1">{it.label}</span>}
                    {n > 0 && (
                      <span className={clsx("relative flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-white", it.tone === "red" ? "bg-danger" : "bg-amber", collapsed && "absolute right-2 top-1 size-4 text-[9px]")}>
                        {n}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          {advisor && (
            <div className={clsx("flex items-center gap-3 px-1", collapsed && "justify-center")}>
              <Avatar user={advisor} size={36} />
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold leading-[18px]">{advisor.name}</div>
                  <div className="text-xs leading-4 text-muted">
                    {role === "staff" ? (
                      advisor.title
                    ) : (
                      <span className="text-success">● {role === "buyer" ? "Your advisor" : "Partner manager"} · online</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {role !== "staff" && !collapsed && (
            <Link href={`/${role}/support`} className="flex h-9 items-center justify-center rounded-lg bg-mist text-sm font-medium text-primary hover:bg-[#E2EAF7]">
              Message
            </Link>
          )}
          {!collapsed && (
            <button onClick={() => { signOut(); router.push("/"); }} className="flex items-center gap-2 px-1 text-xs text-subtle hover:text-ink">
              <Icon name="logout" size={14} /> Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-5 pt-6 md:px-8">
          <label className="flex h-11 w-full max-w-[420px] items-center gap-3 rounded-lg bg-white px-4 text-sm text-subtle shadow-[0_1px_2px_rgba(12,31,69,0.04)]">
            <Icon name="search" size={16} />
            <input placeholder={cfg.search} className="flex-1 bg-transparent text-ink outline-none placeholder:text-subtle" />
            <kbd className="hidden sm:block rounded-lg bg-mist px-1.5 py-0.5 font-mono text-[11px] text-muted">⌘K</kbd>
          </label>
          <div className="flex items-center gap-3">
            <Link href={cfg.primary.href} className="hidden sm:flex h-11 items-center gap-2 rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_#1E4FA3B3]">
              {cfg.primary.label.startsWith("+") ? cfg.primary.label : <><Icon name="plus" size={16} /> {cfg.primary.label}</>}
            </Link>
            <NotificationBell count={unread} />
            <Avatar user={user} size={44} />
          </div>
        </header>
        <main className="flex-1 px-5 pb-12 pt-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

function NotificationBell({ count }: { count: number }) {
  const { db, user, markRead } = useStore();
  const [open, setOpen] = useState(false);
  const items = db.notifications.filter((n) => n.userId === user?.id).slice(0, 6);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative flex size-11 items-center justify-center rounded-full bg-white text-ink">
        <Icon name="bell" size={18} />
        {count > 0 && <span className="absolute right-3 top-2.5 size-2 rounded-full bg-red ring-2 ring-white" />}
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-50 w-[340px] rounded-lg bg-white p-2 shadow-[0_24px_60px_rgba(12,31,69,0.18)]">
          <div className="px-3 py-2 text-sm font-semibold">Notifications</div>
          {items.length === 0 && <div className="px-3 py-6 text-sm text-muted">You&apos;re all caught up.</div>}
          {items.map((n) => (
            <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setOpen(false); }} className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-mist">
              <span className={clsx("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-amber")} />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted">{n.body}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
