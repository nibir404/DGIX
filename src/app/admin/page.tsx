"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { Button } from "@/components/portal/ui";
import { Icon } from "@/components/ui/Icon";
import { Kicker, useFlash } from "@/components/admin/kit";

const NOW = new Date("2026-11-13T09:00:00Z").getTime();

function dueLabel(iso: string) {
  const ms = new Date(iso).getTime() - NOW;
  if (ms < 6 * 3600e3) return { text: Math.max(1, Math.round(ms / 3600e3)) + " h", cls: "text-danger" };
  if (ms < 18 * 3600e3) return { text: "Today", cls: "text-warning" };
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { weekday: "short" });
  const h = d.getUTCHours();
  return { text: ms < 3 * 864e5 ? `${day} ${h > 12 ? h - 12 : h} ${h >= 12 ? "pm" : "am"}` : day, cls: "text-muted" };
}

export default function AdminToday() {
  const { db, user, sendOffer } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();

  const queue = useMemo(() => {
    const items: { at: string; title: string; sub: string; label: string; primary?: boolean; href?: string; act?: () => void }[] = [];
    db.requests.filter((r) => r.status === "matching").forEach((r) => {
      const b = L.company(r.buyerId);
      items.push({ at: r.dueAt ?? r.createdAt, title: `Confirm shortlist · ${r.title}`, sub: `AI ranked ${r.shortlist.length} products · ${b?.name}, ${b?.country}`, label: "Review", primary: true, href: "/admin/matching" });
    });
    db.cases.filter((c) => c.status === "open").forEach((c) => {
      items.push({ at: new Date(new Date(c.opened).getTime() + 8 * 3600e3).toISOString(), title: `Escalation · ${c.title}`, sub: c.messages[c.messages.length - 1]?.body.slice(0, 48) ?? "", label: "Open", href: "/admin/delivery" });
    });
    db.demos.filter((d) => d.status === "booked" && new Date(d.at).getTime() > NOW).forEach((d) => {
      items.push({ at: d.at, title: `Host demo · ${L.company(d.buyerId)?.name} × ${L.product(d.productId)?.name}`, sub: `Buyer added ${d.questions} questions`, label: "Prepare", act: () => flash(`Demo brief ready · ${L.product(d.productId)?.name}`) });
    });
    db.offers.filter((o) => o.status === "draft").forEach((o) => {
      items.push({ at: new Date(NOW + 3 * 864e5).toISOString(), title: `Send offer · ${L.company(o.buyerId)?.name}`, sub: `${L.product(o.productId)?.name} · rated "${o.rating ?? "—"}"`, label: "Send", act: () => { sendOffer(o.id); flash(`${o.ref} sent to buyer`); } });
    });
    return items.sort((a, b) => a.at.localeCompare(b.at));
  }, [db, L, flash, sendOffer]);

  const atRisk = db.projects.find((p) => p.health !== "on_track");
  const matching = db.requests.filter((r) => r.status === "matching").length;
  const inReview = db.products.filter((p) => p.status === "in_review" && p.gate >= "PG3").length;
  const pipeline = db.offers.filter((o) => o.status !== "declined").reduce((s, o) => s + o.price, 0) + 330000;
  const first = user?.name.split(" ")[0] ?? "Asha";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>Friday, 13 November · 12 accounts</Kicker>
        <h1 className="text-[34px] leading-[40px] font-light tracking-[-0.03em] md:text-[44px] md:leading-[48px]">Good morning, {first}.</h1>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white lg:grid-cols-4">
        {[
          { l: "Shortlists due", v: matching + 3, s: "1 due in 2 h", c: "text-warning" },
          { l: "Products in review", v: inReview, s: "Gate PG4 · Scale", c: "text-muted" },
          { l: "Live projects", v: db.projects.length + 3, s: `${db.projects.filter((p) => p.health !== "on_track").length} at risk`, c: "text-danger" },
          { l: "Pipeline value", v: "$" + Math.round(pipeline / 1000) + "k", s: "+$38k this week", c: "text-success" },
        ].map((s, i) => (
          <div key={s.l} className={"flex flex-col gap-2 p-6 " + (i % 2 ? "border-l border-line " : "") + (i > 1 ? "border-t border-line lg:border-t-0 " : "") + (i === 2 ? "lg:border-l" : "")}>
            <div className="text-sm text-muted">{s.l}</div>
            <div className="text-[38px] leading-[44px] font-light tracking-tight">{s.v}</div>
            <div className={"text-xs " + s.c}>{s.s}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl leading-6">My queue</h2>
            <span className="text-[13px] text-muted">Sorted by due time</span>
          </div>
          <motion.ul initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.06 } } }}>
            {queue.map((q, i) => {
              const d = dueLabel(q.at);
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
            <p className="mt-4 text-sm text-haze">Partner missed 2 milestone dates. Buyer hasn&apos;t complained yet.</p>
            <Button variant="white" className="mt-5" onClick={() => flash(`Calling ${L.company(atRisk.partnerId)?.name}…`)}>Call partner</Button>
          </section>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr_1.2fr]">
        <DealFlow />
        <SlaGauge onTarget={db.projects.filter((p) => p.health === "on_track").length + 2} risk={db.projects.filter((p) => p.health !== "on_track").length} />
        <RouteMap live={db.projects.length + 3} />
      </div>
      {toast}
    </div>
  );
}

const WEEKS = ["22 Sep", "29 Sep", "6 Oct", "13 Oct", "20 Oct", "27 Oct", "3 Nov", "10 Nov"];
const REQ = [6, 7, 9, 8, 10, 11, 14, 15];
const SIG = [1, 1, 2, 2, 3, 3, 4, 4.5];

function DealFlow() {
  const [hover, setHover] = useState(6);
  const W = 380, H = 160, max = 16;
  const x = (i: number) => (i / (WEEKS.length - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
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
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[180px] w-full overflow-visible" preserveAspectRatio="none" onMouseLeave={() => setHover(6)}>
          <defs>
            <linearGradient id="dfReq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BD8" stopOpacity=".25" /><stop offset="1" stopColor="#2F6BD8" stopOpacity="0" /></linearGradient>
            <linearGradient id="dfSig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6A11A" stopOpacity=".18" /><stop offset="1" stopColor="#F6A11A" stopOpacity="0" /></linearGradient>
          </defs>
          <rect x={x(hover) - 8} y={0} width={16} height={H} rx={8} fill="#EEF3FB" />
          <motion.path d={path(REQ) + ` L${W},${H} L0,${H} Z`} fill="url(#dfReq)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
          <motion.path d={path(SIG) + ` L${W},${H} L0,${H} Z`} fill="url(#dfSig)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
          <motion.path d={path(REQ)} fill="none" stroke="#2F6BD8" strokeWidth={2} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
          <motion.path d={path(SIG)} fill="none" stroke="#F6A11A" strokeWidth={2} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.2 }} />
          {WEEKS.map((_, i) => (
            <rect key={i} x={x(i) - W / 14} y={0} width={W / 7} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
          ))}
          <circle cx={x(hover)} cy={y(REQ[hover])} r={4} fill="#fff" stroke="#2F6BD8" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          <circle cx={x(hover)} cy={y(SIG[hover])} r={4} fill="#fff" stroke="#F6A11A" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
        </svg>
        <div
          className="pointer-events-none absolute top-0 -translate-x-full rounded-lg bg-night px-3 py-2 text-xs text-white shadow-lg transition-[left]"
          style={{ left: `calc(${(hover / 7) * 100}% - 12px)`, ...(hover < 3 ? { transform: "none", left: `calc(${(hover / 7) * 100}% + 12px)` } : {}) }}
        >
          <div className="text-[11px] text-haze">Week of {WEEKS[hover]}</div>
          <div className="whitespace-nowrap">Requests <b className="text-sky">{REQ[hover]}</b> · Signed <b className="text-amber">{Math.floor(SIG[hover])}</b></div>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-subtle">
        {WEEKS.filter((_, i) => i % 2 === 0).map((w) => <span key={w}>{w}</span>)}
      </div>
    </section>
  );
}

function SlaGauge({ onTarget, risk }: { onTarget: number; risk: number }) {
  const N = 14, filled = 10, cx = 110, cy = 100;
  return (
    <section className="flex flex-col rounded-lg bg-white p-6">
      <h2 className="text-lg leading-6">SLA health</h2>
      <div className="relative mx-auto mt-4 w-full max-w-[240px]">
        <svg viewBox="0 0 220 130" className="w-full">
          {Array.from({ length: N }).map((_, i) => {
            const a = Math.PI + (i / (N - 1)) * Math.PI * 0.95 - 0.05;
            const r1 = 70, r2 = 98;
            const c = i < filled ? `hsl(${220 - i * 2} 70% ${42 + i * 3}%)` : i === filled ? "#FFD58A" : "#EEF3FB";
            return (
              <motion.line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={c} strokeWidth={13} strokeLinecap="round"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} />
            );
          })}
        </svg>
        <div className="absolute inset-x-0 top-[52%] text-center">
          <div className="text-[34px] leading-[38px] font-light tracking-tight">99.4%</div>
          <div className="text-[11px] text-muted">within SLA · 30 days</div>
        </div>
      </div>
      <div className="mt-auto flex justify-center gap-4 pt-6 text-xs">
        <span className="text-primary">● {onTarget} on target</span>
        <span className="text-warning">● {risk} at risk</span>
      </div>
    </section>
  );
}

function RouteMap({ live }: { live: number }) {
  const dhaka = { x: 250, y: 120 };
  const pins = [
    { label: "RUH · 1", x: 70, y: 110, lx: 40, ly: 78, c: "#3DDC84", bg: "#B8F0CF" },
    { label: "DXB · 3", x: 125, y: 130, lx: 92, ly: 132, c: "#7FB6FF", bg: "#BFD8FF" },
    { label: "DOH · 2", x: 140, y: 160, lx: 150, ly: 170, c: "#F6A11A", bg: "#FFD58A" },
  ];
  return (
    <Link href="/admin/delivery" className="relative block overflow-hidden rounded-lg bg-night-hero p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Dhaka → Gulf</h2>
        <span className="text-xs text-haze">{live} live projects</span>
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
