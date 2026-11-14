"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import type { BuyerRequest, Company, Offer, Project } from "@/lib/types";
import { Button } from "@/components/portal/ui";
import { Icon } from "@/components/ui/Icon";
import { Kicker, useFlash } from "@/components/admin/kit";

function dueLabel(iso: string, nowMs: number) {
  const ms = new Date(iso).getTime() - nowMs;
  if (ms < 0) return { text: "Due now", cls: "text-danger" };
  if (ms < 6 * 3600e3) return { text: Math.max(1, Math.round(ms / 3600e3)) + " h", cls: "text-danger" };
  if (ms < 18 * 3600e3) return { text: "Today", cls: "text-warning" };
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { weekday: "short" });
  const h = d.getUTCHours();
  return { text: ms < 3 * 864e5 ? `${day} ${h > 12 ? h - 12 : h || 12} ${h >= 12 ? "pm" : "am"}` : day, cls: "text-muted" };
}

export default function AdminToday() {
  const { db, user, sendOffer } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const nowMs = Date.now();

  const queue = useMemo(() => {
    const items: { at: string; title: string; sub: string; label: string; primary?: boolean; href?: string; act?: () => void }[] = [];
    db.requests.filter((r) => r.status === "matching").forEach((r) => {
      const b = L.company(r.buyerId);
      items.push({ at: r.dueAt ?? r.createdAt, title: `Confirm shortlist · ${r.title}`, sub: `${r.shortlist.length} matched product${r.shortlist.length === 1 ? "" : "s"} · ${b?.name ?? "Buyer"}, ${b?.country ?? r.country}`, label: "Review", primary: true, href: "/admin/matching" });
    });
    db.cases.filter((c) => c.status === "open").forEach((c) => {
      items.push({ at: new Date(new Date(c.opened).getTime() + 8 * 3600e3).toISOString(), title: `Escalation · ${c.title}`, sub: c.messages[c.messages.length - 1]?.body.slice(0, 48) ?? "", label: "Open", href: "/admin/delivery" });
    });
    db.demos.filter((d) => d.status === "booked" && new Date(d.at).getTime() > nowMs).forEach((d) => {
      items.push({ at: d.at, title: `Host demo · ${L.company(d.buyerId)?.name} × ${L.product(d.productId)?.name}`, sub: `Buyer added ${d.questions} questions`, label: "Prepare", act: () => flash(`Demo brief ready · ${L.product(d.productId)?.name}`) });
    });
    db.offers.filter((o) => o.status === "draft").forEach((o) => {
      items.push({ at: new Date(nowMs + 3 * 864e5).toISOString(), title: `Send offer · ${L.company(o.buyerId)?.name}`, sub: `${L.product(o.productId)?.name} · ${fmtMoney(o.price)}`, label: "Send", act: () => { sendOffer(o.id); flash(`${o.ref} sent to buyer`); } });
    });
    return items.sort((a, b) => a.at.localeCompare(b.at));
  }, [db, L, flash, sendOffer, nowMs]);

  const atRisk = db.projects.find((p) => p.health !== "on_track");
  const atRiskCount = db.projects.filter((p) => p.health !== "on_track").length;
  const onTrackCount = db.projects.filter((p) => p.health === "on_track").length;
  const matching = db.requests.filter((r) => r.status === "matching").length;
  const inReview = db.products.filter((p) => p.status === "in_review").length;
  const pipeline = db.offers.filter((o) => o.status !== "declined").reduce((s, o) => s + o.price, 0);
  const signedCount = db.offers.filter((o) => o.status === "accepted").length;
  const accountCount = db.companies.filter((c) => c.kind !== "dgix").length;
  const first = user?.name.split(" ")[0] ?? "Team";
  const hour = new Date(nowMs).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date(nowMs).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const overdueMilestones = atRisk
    ? atRisk.milestones.filter((m) => m.status !== "done" && new Date(m.due).getTime() < nowMs).length
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>{todayLabel} · {accountCount} active organisations</Kicker>
        <h1 className="text-[34px] leading-[40px] font-light tracking-[-0.03em] md:text-[44px] md:leading-[48px]">{greeting}, {first}.</h1>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white lg:grid-cols-4">
        {[
          { l: "Shortlists due", v: matching, s: matching ? `${matching} awaiting advisor review` : "All shortlists reviewed", c: matching ? "text-warning" : "text-muted" },
          { l: "Products in review", v: inReview, s: `${db.products.filter((p) => p.status === "listed").length} listed in catalogue`, c: "text-muted" },
          { l: "Live projects", v: db.projects.length, s: atRiskCount ? `${atRiskCount} at risk` : "All on track", c: atRiskCount ? "text-danger" : "text-success" },
          { l: "Pipeline value", v: fmtMoney(pipeline), s: `${signedCount} signed order${signedCount === 1 ? "" : "s"}`, c: "text-success" },
        ].map((s, i) => (
          <div key={s.l} className={"flex flex-col gap-2 p-6 " + (i % 2 ? "border-l border-line " : "") + (i > 1 ? "border-t border-line lg:border-t-0 " : "") + (i === 2 ? "lg:border-l" : "")}>
            <div className="text-sm text-muted">{s.l}</div>
            <div className="text-[38px] leading-[44px] font-light tracking-tight">{s.v}</div>
            <div className={"text-xs " + s.c}>{s.s}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl leading-6">My queue</h2>
            <span className="text-[13px] text-muted">Sorted by due time</span>
          </div>
          <motion.ul initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.06 } } }}>
            {queue.map((q, i) => {
              const d = dueLabel(q.at, nowMs);
              return (
                <motion.li key={i} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }} className="flex items-center gap-4 border-t border-line py-4">
                  <span className={"w-14 shrink-0 text-[13px] " + d.cls}>{d.text}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px]">{q.title}</div>
                    <div className="truncate text-xs text-muted">{q.sub}</div>
                  </div>
                  <Button size="sm" variant={q.primary ? "primary" : "outline"} href={q.href} onClick={q.act}>{q.label}</Button>
                </motion.li>
              );
            })}
            {!queue.length && <li className="border-t border-line py-6 text-sm text-muted">Queue clear. Nice work.</li>}
          </motion.ul>
        </section>

        {atRisk && (
          <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs"><Icon name="alert" size={12} /> At risk</span>
            <h3 className="mt-3 text-[24px] leading-[30px] font-light">{atRisk.name.split(" · ")[0]} is {atRisk.daysLate ?? 0} days behind in {atRisk.city}</h3>
            <p className="mt-4 text-sm text-haze">
              {overdueMilestones > 0 ? `${overdueMilestones} milestone${overdueMilestones === 1 ? "" : "s"} past target date.` : "Delivery schedule requires advisor follow-up."}
            </p>
            <Button variant="white" className="mt-5" href="/admin/delivery">Open delivery tracker</Button>
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.45fr_1fr_1.2fr]">
        <DealFlow requests={db.requests} offers={db.offers} nowMs={nowMs} />
        <SlaGauge onTarget={onTrackCount} risk={atRiskCount} />
        <RouteMap projects={db.projects} companies={db.companies} />
      </div>
      {toast}
    </div>
  );
}

function DealFlow({ requests, offers, nowMs }: { requests: BuyerRequest[]; offers: Offer[]; nowMs: number }) {
  const [hover, setHover] = useState(7);
  const buckets = Array.from({ length: 8 }, (_, idx) => {
    const end = nowMs - (7 - idx) * 7 * 864e5;
    const start = end - 7 * 864e5;
    const label = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const reqCount = requests.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return idx === 7 ? t >= start : t >= start && t < end;
    }).length;
    const sigCount = offers.filter((o) => {
      if (o.status !== "accepted") return false;
      const iso = o.signedAt ?? o.sentAt;
      if (!iso) return idx === 7;
      const t = new Date(iso).getTime();
      return idx === 7 ? t >= start : t >= start && t < end;
    }).length;
    return { label, reqCount, sigCount };
  });
  const reqSeries = buckets.map((b) => b.reqCount);
  const sigSeries = buckets.map((b) => b.sigCount);
  const W = 380, H = 160, max = Math.max(4, ...reqSeries, ...sigSeries);
  const x = (i: number) => (i / (buckets.length - 1)) * W;
  const y = (v: number) => H - (v / max) * (H - 16) - 8;
  const path = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <section className="rounded-lg bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg leading-6">Deal flow · last 8 weeks</h2>
          <div className="text-xs text-muted">Requests in vs offers signed</div>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-cobalt">— Requests</span>
          <span className="text-amber">— Signed</span>
        </div>
      </div>
      <div className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[180px] w-full overflow-visible" preserveAspectRatio="none" onMouseLeave={() => setHover(7)}>
          <defs>
            <linearGradient id="dfReq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BD8" stopOpacity=".25" /><stop offset="1" stopColor="#2F6BD8" stopOpacity="0" /></linearGradient>
            <linearGradient id="dfSig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6A11A" stopOpacity=".18" /><stop offset="1" stopColor="#F6A11A" stopOpacity="0" /></linearGradient>
          </defs>
          <rect x={x(hover) - 8} y={0} width={16} height={H} rx={8} fill="#EEF3FB" />
          <motion.path d={path(reqSeries) + ` L${W},${H} L0,${H} Z`} fill="url(#dfReq)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
          <motion.path d={path(sigSeries) + ` L${W},${H} L0,${H} Z`} fill="url(#dfSig)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
          <motion.path d={path(reqSeries)} fill="none" stroke="#2F6BD8" strokeWidth={2} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
          <motion.path d={path(sigSeries)} fill="none" stroke="#F6A11A" strokeWidth={2} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.2 }} />
          {buckets.map((_, i) => (
            <rect key={i} x={x(i) - W / 14} y={0} width={W / 7} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
          ))}
          <circle cx={x(hover)} cy={y(reqSeries[hover])} r={4} fill="#fff" stroke="#2F6BD8" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          <circle cx={x(hover)} cy={y(sigSeries[hover])} r={4} fill="#fff" stroke="#F6A11A" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
        </svg>
        <div
          className="pointer-events-none absolute top-0 -translate-x-full rounded-lg bg-night px-3 py-2 text-xs text-white shadow-lg transition-[left]"
          style={{ left: `calc(${(hover / 7) * 100}% - 12px)`, ...(hover < 3 ? { transform: "none", left: `calc(${(hover / 7) * 100}% + 12px)` } : {}) }}
        >
          <div className="text-[11px] text-haze">Week of {buckets[hover].label}</div>
          <div className="whitespace-nowrap">Requests <b className="text-sky">{reqSeries[hover]}</b> · Signed <b className="text-amber">{sigSeries[hover]}</b></div>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-subtle">
        {buckets.filter((_, i) => i % 2 === 0).map((b) => <span key={b.label}>{b.label}</span>)}
      </div>
    </section>
  );
}

function SlaGauge({ onTarget, risk }: { onTarget: number; risk: number }) {
  const total = onTarget + risk;
  const pct = total === 0 ? 100 : Math.round((onTarget / total) * 100);
  const N = 14, filled = Math.round((pct / 100) * N), cx = 110, cy = 100;
  return (
    <section className="flex flex-col rounded-lg bg-white p-6">
      <h2 className="text-lg leading-6">SLA health</h2>
      <div className="relative mx-auto mt-4 w-full max-w-[240px]">
        <svg viewBox="0 0 220 130" className="w-full">
          {Array.from({ length: N }).map((_, i) => {
            const a = Math.PI + (i / (N - 1)) * Math.PI * 0.95 - 0.05;
            const r1 = 70, r2 = 98;
            const c = i < filled ? `hsl(${220 - i * 2} 70% ${42 + i * 3}%)` : i === filled && risk > 0 ? "#FFD58A" : "#EEF3FB";
            return (
              <motion.line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={c} strokeWidth={13} strokeLinecap="round"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} />
            );
          })}
        </svg>
        <div className="absolute inset-x-0 top-[52%] text-center">
          <div className="text-[34px] leading-[38px] font-light tracking-tight">{pct}%</div>
          <div className="text-[11px] text-muted">projects on target</div>
        </div>
      </div>
      <div className="mt-auto flex justify-center gap-4 pt-6 text-xs">
        <span className="text-primary">● {onTarget} on target</span>
        <span className="text-warning">● {risk} at risk</span>
      </div>
    </section>
  );
}

function RouteMap({ projects, companies }: { projects: Project[]; companies: Company[] }) {
  const dhaka = { x: 250, y: 120 };
  const countRegion = (matchers: string[]) =>
    projects.filter((pr) => {
      const buyer = companies.find((c) => c.id === pr.buyerId);
      const hay = `${pr.city ?? ""} ${buyer?.country ?? ""} ${buyer?.city ?? ""}`.toLowerCase();
      return matchers.some((m) => hay.includes(m));
    }).length;
  const ksaCount = countRegion(["riyadh", "jeddah", "saudi", "ksa", "sau"]);
  const uaeCount = countRegion(["dubai", "abu dhabi", "sharjah", "emirates", "uae"]);
  const qatCount = countRegion(["doha", "qatar", "qat"]);
  const pins = [
    { label: `RUH · ${ksaCount}`, x: 70, y: 110, lx: 40, ly: 78, c: "#3DDC84", bg: "#B8F0CF" },
    { label: `DXB · ${uaeCount}`, x: 125, y: 130, lx: 92, ly: 132, c: "#7FB6FF", bg: "#BFD8FF" },
    { label: `DOH · ${qatCount}`, x: 140, y: 160, lx: 150, ly: 170, c: "#F6A11A", bg: "#FFD58A" },
  ];
  return (
    <Link href="/admin/delivery" className="relative block overflow-hidden rounded-lg bg-night-hero p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Dhaka → Gulf</h2>
        <span className="text-xs text-haze">{projects.length} live project{projects.length === 1 ? "" : "s"}</span>
      </div>
      <svg viewBox="0 0 300 220" className="mt-2 w-full">
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={30 + ((i * 47) % 250)} cy={60 + ((i * 29) % 140)} r={1.2} fill="#AEBBD6" opacity={0.35} />
        ))}
        {pins.map((p, i) => (
          <motion.path key={p.label} d={`M${p.x},${p.y} Q${(p.x + dhaka.x) / 2},${Math.min(p.y, dhaka.y) - 40} ${dhaka.x},${dhaka.y}`} fill="none" stroke={p.c} strokeWidth={1.5} strokeDasharray="4 4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: i * 0.2 }} />
        ))}
        {pins.map((p) => (
          <g key={p.label + "pin"}>
            <circle cx={p.x} cy={p.y} r={5} fill={p.c} />
            <rect x={p.lx - 26} y={p.ly - 10} width={52} height={20} rx={10} fill={p.bg} />
            <text x={p.lx} y={p.ly + 4} textAnchor="middle" fontSize={10} fontWeight={600} fill="#0C1F45">{p.label}</text>
          </g>
        ))}
        <circle cx={dhaka.x} cy={dhaka.y} r={8} fill="#2F6BD8" stroke="#fff" strokeWidth={3} />
        <rect x={dhaka.x - 26} y={dhaka.y - 34} width={56} height={20} rx={10} fill="#1E4FA3" />
        <text x={dhaka.x + 2} y={dhaka.y - 20} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff">DHAKA</text>
      </svg>
    </Link>
  );
}
