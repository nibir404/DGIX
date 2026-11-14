"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { H1, Kicker, k } from "@/components/admin/kit";

const tones = ["bg-[linear-gradient(135deg,#6FD3A0,#14804A)]", "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)]", "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)] text-ink", "bg-[#FBE7E7] text-danger"];

export default function Partners() {
  const { db } = useStore();
  const L = useLookup();
  const [tab, setTab] = useState<"partner" | "buyer">("partner");
  const companies = db.companies.filter((c) => c.kind === tab);
  const partnerStats = (id: string) => {
    const products = db.products.filter((p) => p.partnerId === id);
    const projects = db.projects.filter((p) => p.partnerId === id);
    const paid = db.payouts.filter((p) => p.partnerId === id && p.status === "paid").reduce((s, p) => s + p.net, 0);
    const watch = projects.some((p) => p.health !== "on_track");
    return { products, projects, paid, watch };
  };
  const partners = db.companies.filter((c) => c.kind === "partner").map((c) => ({ c, ...partnerStats(c.id) }));
  const maxPaid = Math.max(1, ...partners.map((p) => p.paid));
  const totalPaid = partners.reduce((s, p) => s + p.paid, 0);
  const buyers = db.companies.filter((c) => c.kind === "buyer");
  const byCountry = buyers.reduce<Record<string, number>>((m, b) => ({ ...m, [b.country]: (m[b.country] ?? 0) + 1 }), {});
  const reReview = db.products.filter((p) => p.waitingOn?.includes("sign-off") || db.projects.some((pr) => pr.productId === p.id && pr.health !== "on_track"));
  const initials = (n: string) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const short = (c: string) => (c === "United Arab Emirates" ? "UAE" : c === "United States" ? "USA" : c);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2"><Kicker>Everyone DGIX works with</Kicker><H1>Partners &amp; buyers</H1></div>
        <div className="flex self-start rounded-lg bg-white p-1 text-[13px] md:self-auto">
          {(["partner", "buyer"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={"rounded-lg px-3.5 py-1.5 " + (tab === t ? "bg-night text-white" : "text-muted")}>
              {t === "partner" ? "Partners" : "Buyers"} · {db.companies.filter((c) => c.kind === t).length}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-line text-xs font-medium uppercase tracking-[0.06em] text-subtle">
            <th className="pb-3">{tab === "partner" ? "Partner" : "Buyer"}</th><th className="pb-3">{tab === "partner" ? "Products" : "Requests"}</th><th className="pb-3">Live deals</th><th className="pb-3">{tab === "partner" ? "SLA" : "Advisor"}</th><th className="pb-3 text-right">{tab === "partner" ? "Paid out" : "Invoiced"}</th>
          </tr></thead>
          <motion.tbody key={tab} initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.05 } } }}>
            {companies.map((c, i) => {
              const s = partnerStats(c.id);
              const buyerProjects = db.projects.filter((p) => p.buyerId === c.id);
              return (
                <motion.tr key={c.id} variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} className="border-b border-[#F1F4FA] last:border-0">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <span className={"flex size-[34px] items-center justify-center rounded-lg text-xs font-semibold text-white " + (s.watch ? tones[3] : tones[i % 3])}>{initials(c.name)}</span>
                      <div><div className="text-[15px] font-medium">{c.name}</div><div className={"text-xs " + (s.watch ? "text-danger" : "text-muted")}>{s.watch ? "On watch · missed milestones" : `${c.verified ? "Verified" : "Unverified"} · ${c.city}`}</div></div>
                    </div>
                  </td>
                  <td className="pr-4">{tab === "partner" ? s.products.map((p) => p.name).join(", ") || "—" : db.requests.filter((r) => r.buyerId === c.id).length}</td>
                  <td className="pr-4">{tab === "partner" ? s.projects.length : buyerProjects.length}</td>
                  <td className={"pr-4 " + (tab === "partner" ? (s.watch ? "text-warning" : "text-success") : "")}>{tab === "partner" ? (s.watch ? "98.9%" : s.projects.length ? "99.8%" : "100%") : L.user(c.advisorId)?.name}</td>
                  <td className="text-right text-[15px] font-semibold">{fmtMoney(tab === "partner" ? s.paid : db.invoices.filter((x) => x.buyerId === c.id).reduce((a, x) => a + x.amount, 0))}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="rounded-lg bg-white p-6">
          <div className="text-sm text-muted">Applications this month</div>
          <div className="mt-2 text-[34px] font-light">{db.products.filter((p) => p.gate <= "PG2").length + 3}</div>
          <Link href="/admin/review" className="text-[13px] text-primary">Review applications →</Link>
        </section>
        <section className="rounded-lg bg-white p-6">
          <div className="text-sm text-muted">Buyers by country</div>
          <div className="mt-2 text-[15px]">{Object.entries(byCountry).map(([c, n]) => `${short(c)} ${n}`).join(" · ")}</div>
          <div className="mt-3 flex gap-1">
            {Object.values(byCountry).map((n, i) => <motion.div key={i} initial={{ flexGrow: 0 }} animate={{ flexGrow: n }} className={"h-1.5 rounded-lg " + ["bg-primary", "bg-sky", "bg-glow-amber"][i % 3]} />)}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
          <div className="text-sm text-haze">Re-reviews due</div>
          <div className="mt-2 text-[34px] font-light">{reReview.length}</div>
          <Link href="/admin/review" className="text-[13px] text-glow-amber">{reReview.map((p) => p.name).join(" · ")}</Link>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex justify-between"><h2 className="text-lg">Paid out by partner · this year</h2><span className="text-xs text-muted">{fmtMoney(totalPaid)} total</span></div>
          {[...partners].sort((a, b) => b.paid - a.paid).map((p, i) => (
            <div key={p.c.id} className="flex items-center gap-3 py-1.5 text-[13px]">
              <span className={"w-[120px] shrink-0 truncate " + (p.watch ? "text-danger" : "")}>{p.c.name}</span>
              <div className="h-[18px] flex-1 overflow-hidden rounded-lg bg-mist">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(p.paid / maxPaid) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 }} className={"h-full rounded-lg " + (p.watch ? "bg-[#F5B5B5]" : i === 0 ? "bg-primary" : "hatch")} />
              </div>
              <span className="w-12 text-right font-semibold">{k(p.paid)}</span>
            </div>
          ))}
        </section>
        <section className="rounded-lg bg-white p-6">
          <h2 className="text-lg">Partner models</h2>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative size-[120px] shrink-0">
              <svg viewBox="0 0 120 120" className="-rotate-90">
                {[{ v: 3, c: "#1E4FA3" }, { v: 3, c: "#7FB6FF" }, { v: 2, c: "#FFD58A" }].reduce<{ off: number; el: React.ReactNode[] }>((acc, s, i) => {
                  const len = (s.v / 8) * 0.98;
                  acc.el.push(<motion.circle key={i} cx={60} cy={60} r={46} fill="none" stroke={s.c} strokeWidth={18} pathLength={1} strokeDasharray={`${len} 1`} strokeDashoffset={-acc.off} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }} />);
                  acc.off += s.v / 8;
                  return acc;
                }, { off: 0, el: [] }).el}
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[24px] font-light">8</span>
            </div>
            <ul className="flex flex-col gap-2 text-[13px]">
              <li><span className="text-primary">●</span> Direct · 3</li>
              <li><span className="text-sky">●</span> Co-branded · 3</li>
              <li><span className="text-glow-amber">●</span> White-label · 2</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
