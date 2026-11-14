"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { fmtMoney } from "@/lib/seed";
import { BTN_GRADIENT, NIGHT_BANNER, Bars, Panel, anonBuyer, dayMonth, lastSixMonths, orderRef, pendingChecks, scoreOf, useFlash, useSeller } from "@/components/seller/kit";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Task = { id: string; icon: string; iconBg: string; title: string; sub: string; label: string; primary?: boolean; done?: boolean; run: () => void };

export default function SellerHome() {
  const s = useSeller();
  const { db, user, focus, products, demos, projects, payouts } = s;
  const { flash, toast } = useFlash();

  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = user?.name.split(" ")[0] ?? "there";

  const pending = pendingChecks(focus);
  const score = scoreOf(focus);
  const market = focus?.markets[0] ?? "GCC";

  const openDemos = demos.filter((d) => d.status === "requested" || d.status === "booked");
  const booked = demos.filter((d) => d.status === "booked").length;
  const atRisk = projects.filter((p) => p.health !== "on_track").length;
  const next = [...payouts].filter((p) => p.status !== "paid").sort((a, b) => a.date.localeCompare(b.date))[0];

  const months = lastSixMonths(payouts, now);
  const paidTotal = payouts.filter((p) => p.status === "paid").reduce((t, p) => t + p.net, 0);

  const tasks: Task[] = [];
  pending.forEach((c) => {
    const uploaded = !!c.note?.startsWith("Uploaded");
    tasks.push({
      id: "c-" + c.key,
      icon: "🛡",
      iconBg: "bg-[#FFF3DC]",
      title: c.key === "security" ? "Upload penetration test report" : `Upload evidence · ${c.label}`,
      sub: `${c.label.split(" ")[0]} check · ${c.max - c.score} points`,
      label: uploaded ? "Uploaded" : "Upload",
      primary: true,
      done: uploaded,
      run: () => {
        if (!focus) return;
        s.uploadEvidence(focus.id, c.key);
        flash(`Evidence sent to DGIX · ${c.label}`);
      },
    });
  });
  demos
    .filter((d) => d.status === "requested")
    .forEach((d) => {
      const at = new Date(d.at);
      tasks.push({
        id: d.id,
        icon: "📅",
        iconBg: "bg-mist",
        title: `Confirm demo · ${anonBuyer(db.companies.find((c) => c.id === d.buyerId))}`,
        sub: `${DAYS[at.getUTCDay()].slice(0, 3)} ${dayMonth(d.at)} · ${at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })} GST / ${at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" })} BST`,
        label: "Confirm",
        run: () => {
          s.confirmDemo(d.id);
          flash("Demo confirmed · buyer notified");
        },
      });
    });
  projects.forEach((pr) => {
    const idx = pr.milestones.findIndex((m) => m.status === "in_progress");
    if (idx < 0) return;
    const m = pr.milestones[idx];
    tasks.push({
      id: pr.id + m.id,
      icon: "✓",
      iconBg: "bg-[#E6F4EC]",
      title: `Submit milestone ${idx + 1} for review`,
      sub: `Order ${orderRef(db, pr)} · due ${dayMonth(m.due)}`,
      label: "Submit",
      run: () => {
        s.submitMilestone(pr.id, m.id);
        flash(`Milestone ${idx + 1} sent for buyer review`);
      },
    });
  });
  const live = tasks.filter((t) => !t.done).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div suppressHydrationWarning className="text-sm leading-[18px] text-muted">
          {DAYS[now.getDay()]}, {now.getDate()} {MONTHS_LONG[now.getMonth()]}
        </div>
        <h1 suppressHydrationWarning className="text-[32px] leading-10 md:text-[40px] md:leading-12 font-light tracking-tight text-ink">
          {greet}, {first}.
        </h1>
      </div>

      {/* Next-step banner */}
      <Panel className="flex flex-col items-start gap-6 rounded-lg bg-night p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8" style={{ backgroundImage: NIGHT_BANNER }}>
        <div className="flex flex-col gap-3">
          <div className="text-[13px] leading-4 text-glow-amber">✦ Next step · {focus?.name ?? "Your products"}</div>
          <div className="text-[24px] leading-[30px] md:text-[32px] md:leading-[38px] font-light tracking-[-0.03em] text-paper">
            {pending.length > 0 ? (
              <>
                {pending.length} {pending.length === 1 ? "check" : "checks"} left to reach 100/100.
                <br />
                Then you&apos;re listed for {market} buyers.
              </>
            ) : (
              <>
                All products are 100/100.
                <br />
                You&apos;re listed for {market} buyers.
              </>
            )}
          </div>
        </div>
        <Link href={pending.length ? "/seller/verification" : "/seller/products"} className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-lg bg-paper px-6 text-night transition hover:bg-mist">
          <span className="text-[15px] font-semibold leading-[18px]">{pending.length ? "Finish verification" : "View passport"}</span>
          <span className="text-base leading-5">→</span>
        </Link>
      </Panel>

      {/* Stats */}
      <Panel className="grid grid-cols-2 bg-paper py-[6px] lg:grid-cols-4">
        {[
          { label: "Readiness score", value: <>{score}<span className="text-[18px] tracking-tight text-[#9AA2B4]">/100</span></>, sub: pending.length ? `${pending.length} checks pending` : "Verified", tone: pending.length ? "text-warning" : "text-success", href: "/seller/products" },
          { label: "New leads", value: openDemos.length, sub: `${booked} demo${booked === 1 ? "" : "s"} booked`, tone: "text-primary", href: "/seller/leads" },
          { label: "Active orders", value: projects.length, sub: atRisk ? `${atRisk} at risk` : "On track", tone: atRisk ? "text-warning" : "text-success", href: "/seller/orders" },
          { label: "Next payout", value: next ? fmtMoney(next.net) : "—", sub: next ? `${dayMonth(next.date)} · ${next.status === "pending_payment" ? "after buyer pays" : "scheduled"}` : "Nothing pending", tone: "text-muted", href: "/seller/payouts" },
        ].map((x, i) => (
          <Link key={x.label} href={x.href} className={clsx("flex min-w-0 flex-col gap-[10px] px-4 sm:px-6 py-4 transition hover:bg-[#F9FAFD]", i % 2 === 1 && "border-l border-[#EEF1F6]", i === 2 && "lg:border-l", i > 1 && "max-lg:border-t max-lg:border-[#EEF1F6]")}>
            <div className="text-[13px] leading-4 text-muted">{x.label}</div>
            <div className="text-[30px] leading-[34px] md:text-[36px] md:leading-[38px] font-light tracking-tight text-ink">{x.value}</div>
            <div className={clsx("text-xs leading-4", x.tone)}>{x.sub}</div>
          </Link>
        ))}
      </Panel>

      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start">
        {/* Needs you */}
        <Panel className="flex flex-col gap-[6px] bg-paper p-6 lg:grow-[1.4] lg:basis-0">
          <div className="mb-2 flex justify-between">
            <div className="text-[18px] font-medium leading-[22px] text-ink">Needs you</div>
            <div className="text-[13px] leading-4 text-muted">{live} {live === 1 ? "thing" : "things"}</div>
          </div>
          {tasks.length === 0 && <div className="py-6 text-sm text-muted">You&apos;re all caught up.</div>}
          {tasks.map((t, i) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={clsx("flex items-center gap-3 py-[14px]", i < tasks.length - 1 && "border-b border-[#F1F4FA]")}>
              <div className={clsx("flex size-9 shrink-0 items-center justify-center rounded-lg text-[15px] leading-[18px]", t.iconBg)}>{t.icon}</div>
              <div className="flex min-w-0 grow basis-0 flex-col">
                <div className="text-sm font-medium leading-[18px] text-ink">{t.title}</div>
                <div className="text-xs leading-4 text-muted">{t.sub}</div>
              </div>
              <button
                onClick={t.run}
                disabled={t.done}
                className={clsx(
                  "inline-flex h-[34px] shrink-0 items-center rounded-lg px-[14px] text-xs font-semibold leading-4 transition disabled:opacity-60",
                  t.primary && !t.done ? `${BTN_GRADIENT} text-paper hover:brightness-110` : "border border-[#C9D4E8] text-ink hover:border-ink",
                )}
              >
                {t.label}
              </button>
            </motion.div>
          ))}
        </Panel>

        {/* Earnings */}
        <Panel className="flex flex-col gap-[14px] bg-paper p-6 lg:grow lg:basis-0">
          <div className="text-[18px] font-medium leading-[22px] text-ink">Earnings · last 6 months</div>
          <Bars values={months.map((m) => m.value)} className="h-[160px] shrink-0" />
          <div className="flex justify-between">
            <div className="text-xs leading-4 text-[#9AA2B4]">{months[0].label}</div>
            <Link href="/seller/payouts" className="text-[13px] font-semibold leading-4 text-ink hover:text-primary">
              {fmtMoney(paidTotal)} paid out
            </Link>
          </div>
        </Panel>
      </div>
      {products.length === 0 && <div className="text-sm text-muted">No products yet for this company.</div>}
      {toast}
    </div>
  );
}
