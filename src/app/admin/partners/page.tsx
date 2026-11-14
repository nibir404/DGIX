"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useLookup, useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/seed";
import { Button, Chip } from "@/components/portal/ui";
import { H1, Kicker, k, useFlash } from "@/components/admin/kit";

const tones = ["bg-[linear-gradient(135deg,#6FD3A0,#14804A)]", "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)]", "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)] text-ink", "bg-[#FBE7E7] text-danger"];

export default function Partners() {
  const { db, live, authSession, refreshLive } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const [tab, setTab] = useState<"partner" | "buyer">("partner");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftForm, setDraftForm] = useState({
    partnerId: "",
    productId: "",
    wholesale: "36000.00",
    margin: "20.00",
    hold: "5.00",
    territory: "UAE",
  });

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

  const runKybAndTriage = async (partnerId: string, legalName: string) => {
    setBusyId(partnerId);
    try {
      await apiFetch(`/bff/v1/partners/${partnerId}/screenings`, {
        method: "POST",
        body: JSON.stringify({ kyb_documents_verified: true, screening_kind: "initial" }),
      });
      await apiFetch(`/bff/v1/partners/${partnerId}/triage`, {
        method: "POST",
        body: JSON.stringify({
          category_fit: "fit",
          daffodil_overlap: "complementary",
          overlapping_products: [],
          decision: "accepted",
          notes: "Sanctions screening clean and portfolio fit accepted by Legal.",
        }),
      });
      await refreshLive();
      flash(`${legalName} KYB sanctions & overlap triage approved`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "KYB action denied (requires legal / dgix_admin role)");
    } finally {
      setBusyId(null);
    }
  };

  const draftAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = draftForm.productId || String(live.products[0]?.product_id ?? "");
    const partnerId = draftForm.partnerId || String(live.partners[0]?.partner_id ?? "");
    const ver = live.versionsByProduct[pid]?.[0];
    if (!pid || !partnerId || !ver) {
      flash("Select a valid live partner & product with an active semver version.");
      return;
    }
    setBusyId("draft-agr");
    try {
      await apiFetch("/bff/v1/commercial/rights/agreements", {
        method: "POST",
        body: JSON.stringify({
          partner_id: partnerId,
          product_id: pid,
          product_version_id: String(ver.version_id),
          edition: "standard",
          territories: [draftForm.territory],
          brand_model: "co_branded",
          wholesale_price: draftForm.wholesale,
          currency: "USD",
          margin_pct: draftForm.margin,
          dispute_hold_pct: draftForm.hold,
          sla_summary: "99.9% availability SLA with 1 business-day response",
          expires_at: "2028-11-25T00:00:00Z",
        }),
      });
      await refreshLive();
      flash("Draft commercial agreement created · awaiting second legal countersignature");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to draft agreement");
    } finally {
      setBusyId(null);
    }
  };

  const signAgreement = async (agreementId: string) => {
    setBusyId(agreementId);
    try {
      await apiFetch(`/bff/v1/commercial/rights/agreements/${agreementId}/sign`, {
        method: "POST",
      });
      await refreshLive();
      flash("Commercial agreement countersigned");
    } catch (err) {
      flash(err instanceof Error ? err.message : "A second authorised legal counsel must countersign this agreement.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Kicker>Partner KYB screening, portfolio review &amp; commercial distribution agreements</Kicker>
          <H1>Legal, KYB &amp; Partners</H1>
        </div>
        <div className="flex self-start rounded-lg bg-white p-1 text-[13px] md:self-auto">
          {(["partner", "buyer"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={"rounded-lg px-3.5 py-1.5 " + (tab === t ? "bg-night text-white" : "text-muted")}>
              {t === "partner" ? "Partners" : "Buyers"} · {db.companies.filter((c) => c.kind === t).length}
            </button>
          ))}
        </div>
      </div>

      {/* Live KYB Onboarding & Commercial Rights Desk */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Partner KYB &amp; Sanctions Queue</h2>
            <span className="text-xs text-muted">Legal &amp; compliance review</span>
          </div>
          {live.partners.length === 0 ? (
            <p className="text-xs text-muted">No partner records pending review.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {live.partners.map((pt) => {
                const pid = String(pt.partner_id);
                const st = String(pt.status ?? pt.kyb_status ?? "pending");
                const cleared = st === "active" || st === "accepted" || st === "verified" || st === "triaged";
                return (
                  <div key={pid} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{String(pt.legal_name)}</div>
                      <div className="text-xs text-muted">
                        Reg: {String(pt.registration_number ?? "—")} · {String(pt.country_code)} · Status: <span className="font-semibold">{st}</span>
                      </div>
                    </div>
                    {cleared ? (
                      <Chip tone="success">KYB Cleared</Chip>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busyId === pid}
                        onClick={() => void runKybAndTriage(pid, String(pt.legal_name))}
                      >
                        {busyId === pid ? "Screening..." : "Verify KYB & Accept"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Commercial Agreements</h2>
            <span className="text-xs text-muted">Two-person legal sign-off</span>
          </div>
          <form onSubmit={draftAgreement} className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-[#F8FAFE] p-3 text-xs">
            <select
              value={draftForm.partnerId}
              onChange={(e) => setDraftForm({ ...draftForm, partnerId: e.target.value })}
              className="h-9 rounded border border-line bg-white px-2"
            >
              <option value="">Select partner…</option>
              {live.partners.map((pt) => (
                <option key={String(pt.partner_id)} value={String(pt.partner_id)}>
                  {String(pt.legal_name)}
                </option>
              ))}
            </select>
            <select
              value={draftForm.productId}
              onChange={(e) => setDraftForm({ ...draftForm, productId: e.target.value })}
              className="h-9 rounded border border-line bg-white px-2"
            >
              <option value="">Select product…</option>
              {live.products.map((pr) => (
                <option key={String(pr.product_id)} value={String(pr.product_id)}>
                  {String(pr.name)}
                </option>
              ))}
            </select>
            <input
              value={draftForm.wholesale}
              onChange={(e) => setDraftForm({ ...draftForm, wholesale: e.target.value })}
              placeholder="Wholesale USD"
              className="h-9 rounded border border-line bg-white px-2"
            />
            <div className="flex gap-2">
              <select
                value={draftForm.territory}
                onChange={(e) => setDraftForm({ ...draftForm, territory: e.target.value })}
                className="h-9 flex-1 rounded border border-line bg-white px-2"
              >
                {["UAE", "SAU", "QAT", "BGD", "USA"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Button type="submit" size="sm" disabled={busyId === "draft-agr"}>
                Draft
              </Button>
            </div>
          </form>

          <div className="flex max-h-[210px] flex-col divide-y divide-line overflow-y-auto">
            {live.agreements.map((ag) => {
              const aid = String(ag.agreement_id);
              const st = String(ag.status ?? "draft");
              const prod = live.products.find((p) => String(p.product_id) === String(ag.product_id));
              const sameMaker = Boolean(authSession?.user.sub && String(ag.created_by) === authSession.user.sub);
              return (
                <div key={aid} className="flex items-center justify-between gap-2 py-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">
                      {String(prod?.name ?? "Product")} · {(ag.territories as string[] | undefined)?.join(", ")}
                    </div>
                    <div className="text-muted">
                      Wholesale ${String(ag.wholesale_price)} · Margin {String(ag.margin_pct)}% · Hold {String(ag.dispute_hold_pct)}%
                    </div>
                  </div>
                  {st === "signed" ? (
                    <Chip tone="success">Signed</Chip>
                  ) : (
                    <Button
                      size="sm"
                      variant={sameMaker ? "outline" : "primary"}
                      disabled={sameMaker || busyId === aid}
                      onClick={() => void signAgreement(aid)}
                    >
                      {sameMaker ? "Awaiting countersignature" : "Countersign"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="overflow-x-auto rounded-lg bg-white p-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-line text-xs font-medium uppercase tracking-[0.06em] text-subtle">
            <th className="pb-3">{tab === "partner" ? "Partner" : "Buyer"}</th><th className="pb-3">{tab === "partner" ? "Products" : "Requests"}</th><th className="pb-3">Live deals</th><th className="pb-3">{tab === "partner" ? "Standing" : "Advisor"}</th><th className="pb-3 text-right">{tab === "partner" ? "Paid out" : "Invoiced"}</th>
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
                      <div><div className="text-[15px] font-medium">{c.name}</div><div className={"text-xs " + (s.watch ? "text-danger" : "text-muted")}>{s.watch ? "On watch · missed milestones" : `${c.verified ? "Verified" : "Pending KYB"} · ${c.city}`}</div></div>
                    </div>
                  </td>
                  <td className="pr-4">{tab === "partner" ? s.products.map((p) => p.name).join(", ") || "—" : db.requests.filter((r) => r.buyerId === c.id).length}</td>
                  <td className="pr-4">{tab === "partner" ? s.projects.length : buyerProjects.length}</td>
                  <td className={"pr-4 " + (tab === "partner" ? (s.watch ? "text-warning" : "text-success") : "")}>{tab === "partner" ? (s.watch ? "At risk" : "On track") : L.user(c.advisorId)?.name}</td>
                  <td className="text-right text-[15px] font-semibold">{fmtMoney(tab === "partner" ? s.paid : db.invoices.filter((x) => x.buyerId === c.id).reduce((a, x) => a + x.amount, 0))}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="rounded-lg bg-white p-6">
          <div className="text-sm text-muted">Products in review pipeline</div>
          <div className="mt-2 text-[34px] font-light">{db.products.length}</div>
          <Link href="/admin/review" className="text-[13px] text-primary">Open product review →</Link>
        </section>
        <section className="rounded-lg bg-white p-6">
          <div className="text-sm text-muted">Buyers by country</div>
          <div className="mt-2 text-[15px]">{Object.entries(byCountry).map(([c, n]) => `${short(c)} ${n}`).join(" · ")}</div>
          <div className="mt-3 flex gap-1">
            {Object.values(byCountry).map((n, i) => <motion.div key={i} initial={{ flexGrow: 0 }} animate={{ flexGrow: n }} className={"h-1.5 rounded-lg " + ["bg-primary", "bg-sky", "bg-glow-amber"][i % 3]} />)}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-lg bg-night-hero p-6 text-white">
          <div className="text-sm text-haze">Open verification notices</div>
          <div className="mt-2 text-[34px] font-light">{live.gapLetters.length || reReview.length}</div>
          <Link href="/admin/review" className="text-[13px] text-glow-amber">Open product review →</Link>
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
          <h2 className="text-lg">Signed agreements</h2>
          <div className="mt-4 flex flex-col gap-2 text-[13px]">
            <div><span className="text-primary">●</span> Active signed agreements · {live.agreements.filter((a) => a.status === "signed").length}</div>
            <div><span className="text-sky">●</span> Pending countersignature · {live.agreements.filter((a) => a.status !== "signed").length}</div>
            <div><span className="text-glow-amber">●</span> Cleared KYB partners · {live.partners.length}</div>
          </div>
        </section>
      </div>
      {toast}
    </div>
  );
}
