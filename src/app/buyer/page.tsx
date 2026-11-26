"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import { Arrow, Btn, Panel, Pill, Sparkle, Tick, daysUntil, dayMonth, firstName, money, timeGst, useBuyer, useFlash } from "@/components/buyer/kit";

export default function BuyerHome() {
  const b = useBuyer();
  const lk = useLookup();
  const { flash, toast } = useFlash();
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  // Next step banner
  const shortlist = b.requests.find((r) => r.status === "shortlist_sent");
  const sentOffer = b.offers.find((o) => o.status === "sent");
  const reviewProject = b.projects.find((p) => p.milestones.some((m) => m.status === "in_review"));
  const dueInv = b.invoices.filter((i) => i.status === "due" || i.status === "overdue").sort((a, c) => a.due.localeCompare(c.due));
  const next = shortlist
    ? {
        kicker: `Next step · ${shortlist.title}`,
        line1: "Your shortlist is ready.",
        line2: `${shortlist.shortlist.length} verified matches, confirmed by ${firstName(lk.user(shortlist.ownerId)?.name) || "your advisor"}.`,
        cta: "Review shortlist",
        href: `/buyer/shortlist?request=${shortlist.id}`,
      }
    : sentOffer
      ? { kicker: `Next step · ${sentOffer.ref}`, line1: "Your offer is ready to sign.", line2: `${lk.product(sentOffer.productId)?.name} · ${money(sentOffer.price)}`, cta: "Review offer", href: "/buyer/offers" }
      : reviewProject
        ? { kicker: `Next step · ${reviewProject.name}`, line1: "A milestone is waiting for you.", line2: "Review the delivery and accept to release the invoice.", cta: "Review milestone", href: `/buyer/projects/${reviewProject.id}` }
        : dueInv[0]
          ? { kicker: `Next step · ${dueInv[0].ref}`, line1: "An invoice is due.", line2: `${money(dueInv[0].amount)} · ${dueInv[0].milestone}`, cta: "Pay invoice", href: "/buyer/billing" }
          : { kicker: "Next step", line1: "You're all caught up.", line2: "Tell us what you need next — we'll shortlist in 24 hours.", cta: "New request", href: "/buyer/requests/new" };

  // Stats
  const open = b.requests.filter((r) => !["won", "closed"].includes(r.status));
  const active = b.projects.filter((p) => p.milestones.some((m) => m.status !== "done"));
  const projectCount = b.projects.length;
  const dueTotal = dueInv.reduce((s, i) => s + i.amount, 0);
  const dueDays = dueInv[0] ? daysUntil(dueInv[0].due) : null;
  const lic = b.licences.filter((l) => l.status === "active");
  const stats = [
    { label: "Open requests", value: open.length, sub: shortlist ? "Shortlist ready" : open.length ? "In matching" : "None open", tone: "text-primary" },
    {
      label: "Projects",
      value: projectCount,
      sub: active.length > 0 ? (active.every((p) => p.health === "on_track") ? "All on track" : "Needs attention") : projectCount > 0 ? "Delivered" : "None yet",
      tone: active.every((p) => p.health === "on_track") ? "text-success" : "text-warning",
    },
    { label: "Amount due", value: money(dueTotal), sub: dueDays === null ? "Nothing due" : dueDays < 0 ? `Overdue by ${-dueDays} days` : `Due in ${dueDays} days`, tone: dueDays === null ? "text-muted" : "text-warning" },
    { label: "Active licences", value: lic.reduce((s, l) => s + l.seats, 0), sub: lic.map((l) => lk.product(l.productId)?.name).join(", ") || "None yet", tone: "text-muted" },
  ];

  // Active project card
  const project = reviewProject ?? active[0] ?? b.projects[0];
  const ms = project?.milestones ?? [];
  const doneCount = ms.filter((m) => m.status === "done").length;
  const pct = ms.length ? Math.round((doneCount / ms.length) * 100) : 0;
  const curIdx = ms.findIndex((m) => m.status === "in_review" || m.status === "in_progress");
  const lastDone = ms.map((m, i) => ({ m, i })).filter((x) => x.m.status === "done").pop();
  const rows = [lastDone, curIdx >= 0 ? { m: ms[curIdx], i: curIdx } : undefined, ms.map((m, i) => ({ m, i })).find((x) => x.m.status === "upcoming" && x.i !== curIdx)].filter(Boolean) as { m: (typeof ms)[number]; i: number }[];
  const health = project?.health === "on_track" ? { t: "On track", tone: "success" as const } : project?.health === "at_risk" ? { t: "At risk", tone: "warning" as const } : { t: "Late", tone: "danger" as const };

  // Coming up
  const upcoming = [
    ...b.demos.filter((d) => (d.status === "booked" || d.status === "requested") && daysUntil(d.at) >= 0).map((d) => ({
      at: d.at, title: `Demo · ${lk.product(d.productId)?.name}`, sub: d.status === "requested" ? "Waiting for the partner to confirm" : `${timeGst(d.at)} · with ${firstName(lk.user(b.company?.advisorId)?.name) || "your advisor"}`, href: "/buyer/demos",
    })),
    ...dueInv.map((i) => ({ at: i.due, title: `Invoice ${i.ref} due`, sub: `${money(i.amount)} · ${i.milestone}`, href: "/buyer/billing" })),
    ...b.projects.flatMap((p) => p.milestones.filter((m) => m.status === "in_progress" && daysUntil(m.due) >= 0).map((m) => ({ at: m.due, title: m.title, sub: `${p.name} · due`, href: `/buyer/projects/${p.id}` }))),
  ].sort((a, c) => a.at.localeCompare(c.at)).slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="text-sm leading-[18px] text-muted">{dateLabel}</div>
        <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[40px] md:leading-12">{greet}, {firstName(b.user?.name)}.</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative flex flex-col items-start gap-6 overflow-clip rounded-lg bg-night p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8"
        style={{ backgroundImage: "radial-gradient(ellipse 60% 120% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%)" }}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkle />
            <div className="text-[13px] leading-4 text-glow-amber">{next.kicker}</div>
          </div>
          <div className="text-xl font-light leading-[30px] tracking-[-0.03em] text-paper md:leading-[38px]">
            {next.line1}
            <br />
            {next.line2}
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-[260px] top-[-60px] h-[280px] w-[360px] bg-[url(/media/buyer-banner-map.webp)] bg-size-[100%_100%] bg-center bg-no-repeat opacity-45 [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]"
        />
        <Btn href={next.href} variant="white" size="lg" className="relative z-10">
          {next.cta} <Arrow color="#08152F" />
        </Btn>
      </motion.div>

      <Panel className="grid grid-cols-2 py-1.5 lg:grid-cols-4" delay={0.05}>
        {stats.map((s, i) => (
          <div key={s.label} className={`flex min-w-0 flex-col gap-2.5 px-5 py-4 md:px-6 ${i % 2 === 0 ? "border-r border-[#EEF1F6]" : ""} ${i === 1 ? "lg:border-r lg:border-[#EEF1F6]" : ""} ${i > 1 ? "border-t border-[#EEF1F6] lg:border-t-0" : ""}`}>
            <div className="text-[13px] leading-4 text-muted">{s.label}</div>
            <div className="truncate text-[30px] font-light leading-[38px] tracking-tight text-ink md:text-[36px]">{s.value}</div>
            <div className={`truncate text-xs leading-4 ${s.tone}`}>{s.sub}</div>
          </div>
        ))}
      </Panel>

      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start">
        {project && (
          <Panel className="flex flex-col gap-[18px] p-6 lg:grow-[1.4] lg:basis-0" delay={0.1}>
            <div className="flex items-center justify-between gap-3">
              <Link href={`/buyer/projects/${project.id}`} className="text-[18px] font-medium leading-[22px] text-ink hover:text-primary">{project.name}</Link>
              <Pill tone={health.tone}>{health.t}</Pill>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="text-[13px] leading-4 text-muted">{doneCount} of {ms.length} milestones accepted</div>
                <div className="text-[13px] font-semibold leading-4 text-ink">{pct}%</div>
              </div>
              <div className="flex h-2 rounded-lg bg-mist">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="rounded-lg [background:repeating-linear-gradient(135deg,#4C85EE_0px,#4C85EE_2px,#BCD3FA_2px,#BCD3FA_6px)]" />
              </div>
            </div>
            <div className="flex flex-col">
              {rows.map(({ m, i }, k) => (
                <div key={m.id} className={`flex items-center gap-3 py-3 ${k < rows.length - 1 ? "border-b border-[#F1F4FA]" : ""}`}>
                  {m.status === "done" ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success"><Tick /></span>
                  ) : m.status === "upcoming" ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#9AA2B4] text-[11px] font-semibold leading-[14px] text-muted">{i + 1}</span>
                  ) : (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold leading-[14px] text-paper shadow-[0_0_0_4px_#7FB6FF4D]">{i + 1}</span>
                  )}
                  <div className={`min-w-0 flex-1 text-sm leading-[18px] ${m.status === "upcoming" ? "text-muted" : "text-ink"} ${m.status === "in_review" || m.status === "in_progress" ? "font-medium" : ""}`}>{m.title}</div>
                  {m.status === "done" && <div className="text-[13px] leading-4 text-muted">Accepted {m.acceptedOn ? dayMonth(m.acceptedOn) : ""}</div>}
                  {m.status === "upcoming" && <div className="text-[13px] leading-4 text-[#9AA2B4]">Due {dayMonth(m.due)}</div>}
                  {m.status === "in_progress" && <div className="text-[13px] leading-4 text-muted">In progress</div>}
                  {m.status === "in_review" && (
                    <Btn size="sm" onClick={() => { b.acceptMilestone(project.id, m.id); flash(`${m.title} accepted · invoice raised`); }}>Review &amp; accept</Btn>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        )}

        <Panel className="flex flex-col gap-3.5 p-6 lg:grow lg:basis-0" delay={0.15}>
          <div className="text-[18px] font-medium leading-[22px] text-ink">Coming up</div>
          {upcoming.length === 0 && <div className="text-sm text-muted">Nothing scheduled.</div>}
          {upcoming.map((u) => {
            const d = new Date(u.at);
            return (
              <Link key={u.title + u.at} href={u.href} className="flex gap-3.5 rounded-lg bg-[#F6F8FC] p-3.5 transition-colors hover:bg-mist">
                <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-paper py-1.5">
                  <div className="text-[11px] font-semibold leading-[14px] text-red">{d.toLocaleDateString("en-GB", { month: "short", timeZone: "Asia/Dubai" }).toUpperCase()}</div>
                  <div className="text-lg font-medium leading-6 text-ink">{d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Asia/Dubai" })}</div>
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-0.5">
                  <div className="truncate text-sm font-semibold leading-[18px] text-ink">{u.title}</div>
                  <div className="truncate text-xs leading-4 text-muted">{u.sub}</div>
                </div>
              </Link>
            );
          })}
        </Panel>
      </div>
      {toast}
    </div>
  );
}
