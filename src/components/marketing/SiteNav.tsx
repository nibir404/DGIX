"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { portalHome, useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";

const links = [
  { href: "/solutions", label: "Solutions" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/verified", label: "Daffodil Verified" },
  { href: "/sell", label: "Sell with us" },
];

/** In-hero nav, plus a compact frosted copy that sticks to the top once you scroll past the hero. */
export function SiteNav() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 140);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <NavBar />
      <AnimatePresence>
        {stuck && (
          <motion.div
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-2 top-2 z-[60] rounded-lg border border-white/10 bg-night/80 shadow-[0_16px_40px_rgba(8,21,47,0.35)] backdrop-blur-xl md:inset-x-4 md:top-3"
          >
            <NavBar compact />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavBar({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const { user, ready } = useStore();
  return (
    <nav className={clsx("relative z-30 flex items-center justify-between gap-3", compact ? "px-3 py-2 sm:px-4 md:px-6 md:py-2.5" : "px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-7")}>
      <Link href="/" aria-label="DGIX home" className="shrink-0">
        <Image src="/brand/dgix-logo-white.png" alt="DGIX · Daffodil Global Innovation Exchange" width={182} height={48} priority className={compact ? "h-8 w-auto md:h-10" : "h-8 w-auto sm:h-10 md:h-12"} />
      </Link>
      <div className="hidden lg:flex gap-8 rounded-lg border border-white/12 bg-white/6 px-7 py-2.5">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx("text-[15px] leading-[18px] transition-colors hover:text-white", pathname.startsWith(l.href) ? "text-white font-medium" : "text-white/72")}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        {ready && user ? <SignedIn /> : <SignedOut />}
        <MobileMenu />
      </div>
    </nav>
  );
}

function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const signedIn = ready && user;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/18 bg-white/8 text-white sm:size-11 lg:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {mounted && createPortal(<AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-night px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Link href="/" aria-label="DGIX home" onClick={() => setOpen(false)}>
                <Image src="/brand/dgix-logo-white.png" alt="DGIX" width={182} height={48} className="h-8 w-auto sm:h-10" />
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="flex size-10 items-center justify-center rounded-lg border border-white/18 bg-white/8 text-white sm:size-11">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <nav className="mt-8 flex flex-col">
              {[...links, { href: "/pricing", label: "Pricing" }, { href: "/app", label: "Get the app" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }].map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={clsx("flex items-center justify-between border-b border-white/10 py-4 text-xl font-medium", pathname.startsWith(l.href) ? "text-white" : "text-white/80")}
                  >
                    {l.label}
                    <Icon name="arrowUpRight" size={14} className="text-white/40" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              {signedIn ? (
                <>
                  <Link href={portalHome[user.role]} onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-lg bg-white text-[15px] font-semibold text-night">
                    {user.role === "staff" ? "Open console" : "Open my portal"}
                  </Link>
                  <button onClick={() => { setOpen(false); signOut(); router.push("/"); }} className="flex h-12 items-center justify-center rounded-lg border border-white/18 text-[15px] text-white/80">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/contact" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-lg bg-white text-[15px] font-semibold text-night">
                    Get on board
                  </Link>
                  <Link href="/sign-in" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-lg border border-white/18 text-[15px] text-white/80">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
}

function SignedOut() {
  return (
    <>
      <Link href="/sign-in" className="hidden md:block text-[15px] text-white/72 hover:text-white px-3">
        Sign in
      </Link>
      <Link href="/contact" className="group hidden min-[400px]:flex h-10 sm:h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-white pl-4 sm:pl-5 pr-1.5 sm:pr-2 text-[14px] sm:text-[15px] font-medium text-night">
        Get on board
        <span className="flex size-[30px] items-center justify-center rounded-full bg-primary text-white transition-transform group-hover:rotate-45">
          <Icon name="arrowUpRight" size={12} strokeWidth={2.2} />
        </span>
      </Link>
    </>
  );
}

function SignedIn() {
  const { user, db, signOut } = useStore();
  const { company } = useLookup();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (!user) return null;
  const co = company(user.companyId);
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read);
  const home = portalHome[user.role];
  const isStaff = user.role === "staff";

  const menu = buildMenu(user.role, db, user.companyId);

  return (
    <div ref={ref} className="relative flex items-center gap-2.5">
      <Link href={home} aria-label="Notifications" className="relative hidden sm:flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white">
        <Icon name="bell" size={18} />
        {unread.length > 0 && <span className="absolute right-[10px] top-[9px] size-2 rounded-full border-2 border-ink bg-amber" />}
      </Link>
      <Link href={home} className="group flex shrink-0 items-center gap-2 sm:gap-2.5 whitespace-nowrap rounded-lg bg-white py-[6px] sm:py-[7px] pl-4 sm:pl-[18px] pr-[6px] sm:pr-[7px]">
        <span className="text-[15px] font-medium leading-[18px] text-ink">{isStaff ? "Console" : "My portal"}</span>
        {unread.length > 0 && <span className="rounded-lg bg-glow-amber px-[7px] py-[3px] text-[11px] font-bold leading-[14px] text-night">{unread.length}</span>}
        <span className="flex size-[30px] items-center justify-center rounded-full bg-primary text-white transition-transform group-hover:rotate-45">
          <Icon name="arrowUpRight" size={12} strokeWidth={2} />
        </span>
      </Link>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="hidden md:flex items-center gap-2.5 rounded-lg border border-white/18 bg-white/8 py-1 pl-1 pr-3 text-left"
      >
        <Avatar user={user} size={36} />
        <span className="flex flex-col gap-px">
          <span className="text-[13px] font-semibold leading-4 text-white">{user.name}</span>
          <span className="text-[11px] leading-[14px] text-haze">{co?.name}</span>
        </span>
        <Icon name="chevronDown" size={14} className={clsx("text-haze transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[58px] z-50 flex w-[280px] flex-col rounded-lg bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
          >
            <div className="p-3">
              <span className="rounded-lg bg-mist px-2.5 py-1 text-xs font-semibold text-primary">{menu.badge}</span>
            </div>
            {menu.attention.map((a, i) => (
              <Link
                key={a.label}
                href={a.href}
                onClick={() => setOpen(false)}
                className={clsx("flex items-center justify-between gap-3 rounded-lg px-3 py-[11px] text-sm text-ink hover:bg-mist", i === 0 && "bg-mist font-medium")}
              >
                <span>{a.label}</span>
                <span className={clsx("text-xs whitespace-nowrap", a.tone === "danger" ? "text-danger" : a.tone === "warning" ? "text-warning" : a.tone === "muted" ? "text-muted" : "font-semibold text-primary")}>{a.meta}</span>
              </Link>
            ))}
            <div className="my-1 h-px bg-line" />
            {menu.links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-[11px] text-sm text-ink hover:bg-mist">
                {l.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-line" />
            <Link href={menu.footer.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-[11px] text-sm text-ink hover:bg-mist">
              <span className="flex size-6 items-center justify-center rounded-full bg-mist text-[10px] font-bold text-primary">{menu.footer.icon === "swap" ? <Icon name="swap" size={12} /> : menu.footer.icon}</span>
              {menu.footer.label}
            </Link>
            <button
              onClick={() => {
                signOut();
                setOpen(false);
                router.push("/");
              }}
              className="rounded-lg px-3 py-[11px] text-left text-sm text-muted hover:bg-mist"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Menu = {
  badge: string;
  attention: { label: string; meta: string; href: string; tone?: "danger" | "warning" | "muted" }[];
  links: { label: string; href: string }[];
  footer: { label: string; href: string; icon: string };
};

function buildMenu(role: "buyer" | "seller" | "staff", db: ReturnType<typeof useStore>["db"], companyId: string): Menu {
  const co = db.companies.find((c) => c.id === companyId);
  if (role === "buyer") {
    const req = db.requests.find((r) => r.buyerId === companyId && r.status === "shortlist_sent");
    const inv = db.invoices.find((i) => i.buyerId === companyId && i.status === "due");
    const att: Menu["attention"] = [];
    if (req) att.push({ label: "Your shortlist is ready", meta: "Review", href: "/buyer/shortlist" });
    if (inv) att.push({ label: `Invoice ${inv.ref} due`, meta: fmtMoney(inv.amount), href: "/buyer/billing", tone: "warning" });
    return {
      badge: `${co?.verified ? "✓ Verified buyer" : "Buyer"} · ${co?.country === "United Arab Emirates" ? "UAE" : co?.country}`,
      attention: att,
      links: [
        { label: "Requests", href: "/buyer/requests/new" },
        { label: "Projects & licences", href: "/buyer/projects" },
        { label: "Company settings", href: "/buyer/support" },
      ],
      footer: { label: "Message Asha, your advisor", href: "/buyer/support", icon: "AR" },
    };
  }
  if (role === "seller") {
    const products = db.products.filter((p) => p.partnerId === companyId && p.status === "in_review");
    const att: Menu["attention"] = [];
    if (products[0]) {
      const left = products[0].checks.filter((c) => c.score < c.max).length;
      att.push({ label: `${left} checks left to 100/100`, meta: "Finish", href: "/seller/verification" });
    }
    const po = db.payouts.find((p) => p.partnerId === companyId && p.status !== "paid");
    if (po) att.push({ label: `Next payout ${fmtMoney(po.net)}`, meta: new Date(po.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), href: "/seller/payouts", tone: "muted" });
    return {
      badge: `✓ Partner · ${co?.city}`,
      attention: att,
      links: [
        { label: "Products & passport", href: "/seller/products" },
        { label: "Leads & demos", href: "/seller/leads" },
        { label: "Payouts & agreement", href: "/seller/payouts" },
      ],
      footer: { label: "Message your partner manager", href: "/seller/support", icon: "AR" },
    };
  }
  const due = db.requests.find((r) => r.status === "matching");
  const risk = db.projects.find((p) => p.health !== "on_track");
  const att: Menu["attention"] = [];
  if (due) att.push({ label: `Confirm shortlist · ${db.companies.find((c) => c.id === due.buyerId)?.name}`, meta: "2h", href: "/admin/matching", tone: "danger" });
  if (risk) att.push({ label: `${risk.name.split(" ·")[0]} at risk`, meta: `${risk.daysLate ?? 0} days late`, href: "/admin/delivery", tone: "danger" });
  return {
    badge: "Staff · Advisor · 12 accounts",
    attention: att,
    links: [
      { label: "Matching desk", href: "/admin/matching" },
      { label: "Product review", href: "/admin/review" },
      { label: "Finance", href: "/admin/finance" },
    ],
    footer: { label: "View as buyer or partner", href: "/sign-in", icon: "swap" },
  };
}
