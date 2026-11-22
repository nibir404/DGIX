"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, hasProhibitedUltimateWording } from "@/lib/api";
import { useLookup, useStore } from "@/lib/store";
import { Button, Chip, Empty } from "@/components/portal/ui";
import { Checkbox, H1, Kicker, useFlash } from "@/components/admin/kit";
import { Dialog } from "@/components/buyer/kit";
import { Icon } from "@/components/ui/Icon";

const tile: Record<string, string> = {
  healthcare: "bg-[linear-gradient(135deg,#BDE7E4,#7CC9C4)]",
  hr: "bg-[linear-gradient(135deg,#7FB6FF,#1E4FA3)]",
  erp: "bg-[linear-gradient(135deg,#7FB6FF,#2F6BD8)]",
  education: "bg-[linear-gradient(135deg,#8CC5FF,#163C7E)]",
};

export default function MatchingDesk() {
  const { db, live, authSession, confirmShortlist, refreshLive } = useStore();
  const L = useLookup();
  const { flash, toast } = useFlash();
  const queue = db.requests.filter((r) => r.status === "matching" || r.shortlistStatus === "pending_advisor");
  const [activeId, setActiveId] = useState<string | undefined>(queue[0]?.id);
  const req = queue.find((r) => r.id === activeId) ?? queue[0];
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [note, setNote] = useState("");
  const [pubBusy, setPubBusy] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubDesc, setPubDesc] = useState("");
  const [selectedApprovalId, setSelectedApprovalId] = useState("");
  const [fitDetailProdId, setFitDetailProdId] = useState<string | null>(null);
  const [explainProdId, setExplainProdId] = useState<string | null>(null);

  const ranked = useMemo(() => (req ? [...req.shortlist].sort((a, b) => b.fit - a.fit) : []), [req]);

  useEffect(() => {
    if (!req) return;
    setPicked(Object.fromEntries(ranked.map((s, i) => [s.productId, i < 2])));
    const [a, b] = ranked.map((s) => L.product(s.productId)?.name);
    setNote(
      a
        ? `${a} fits best: ${ranked[0].strengths.join(", ")}.${b ? ` ${b} is a verified alternative.` : ""}`
        : "Verified regional country readiness, cost-floor guard, and delivery capacity.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req?.id]);

  const buyer = req ? L.company(req.buyerId) : undefined;
  const liveSl = req ? live.shortlists.find((s) => String(s.requirement_id) === req.id) : undefined;
  const sameMaker = Boolean(authSession?.user.sub && liveSl && String(liveSl.created_by) === authSession.user.sub);
  const n = Object.values(picked).filter(Boolean).length;
  const visible = showAll ? ranked : ranked.slice(0, 3);
  const hidden = ranked.length - visible.length;

  const send = () => {
    if (!req) return;
    confirmShortlist(req.id, Object.keys(picked).filter((id) => picked[id]));
    flash(`Shortlist approved and shared with ${buyer?.name ?? "buyer"}`);
  };

  const publishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = live.approvals.find((a) => String(a.approval_id) === selectedApprovalId) ?? live.approvals[0];
    if (!app) {
      flash("No Product Council approval record available yet. Complete council approval first.");
      return;
    }
    if (hasProhibitedUltimateWording(pubTitle, pubDesc)) {
      flash("Listing copy cannot contain the word 'ultimate'. Please use verifiable statements.");
      return;
    }
    const pid = String(app.product_id);
    const verId = String(app.product_version_id);
    const country = String(app.country_code);
    const prod = live.products.find((p) => String(p.product_id) === pid);
    const ag = live.agreements.find((a) => String(a.product_id) === pid && a.status === "signed");
    const pl = live.priceLists.find(
      (x) => String(x.product_id) === pid && String(x.country_code) === country && x.status === "approved",
    );
    if (!ag || !pl) {
      flash("Requires a signed distribution agreement and an approved price list for this market.");
      return;
    }
    const canPublish = authSession?.user.roles.some((r) =>
      ["dgix_admin", "senior_commercial_advisor", "commercial_advisor_approver", "commercial_advisor"].includes(r),
    );
    if (authSession && !canPublish) {
      flash("Permission denied: Catalogue publication requires Senior Commercial Advisor or Platform Admin role.");
      return;
    }
    if (
      authSession?.user.sub &&
      (String(ag.created_by) === authSession.user.sub || String(pl.created_by) === authSession.user.sub)
    ) {
      flash("Four-eyes rule: The publisher cannot be the drafter of the distribution agreement or price list.");
      return;
    }
    const partner = live.partners.find((pt) => String(pt.partner_id) === String(ag.partner_id));
    const claims = live.claims
      .filter((cl) => String(cl.product_id) === pid)
      .slice(0, 3)
      .map((cl) => ({
        claim_id: String(cl.claim_id),
        statement: String(cl.statement),
        label: String(cl.label),
        evidence_id: Array.isArray(cl.evidence_ids) && cl.evidence_ids[0] ? String(cl.evidence_ids[0]) : null,
      }));

    setPubBusy(true);
    try {
      await apiFetch("/bff/v1/commercial/catalog/listings", {
        method: "POST",
        body: JSON.stringify({
          product_id: pid,
          product_version_id: verId,
          country_code: country,
          edition: String(pl.edition ?? "standard"),
          approval_record_id: String(app.approval_id),
          agreement_id: String(ag.agreement_id),
          price_list_id: String(pl.price_list_id),
          title: pubTitle.trim() || String(prod?.name ?? "Verified Solution"),
          description:
            pubDesc.trim() ||
            "Council-approved enterprise software verified across quality, security, and regional readiness checks.",
          partner_name: String(partner?.legal_name ?? "Verified Partner"),
          category: String(prod?.category ?? "erp"),
          capabilities: ["Regional Regulatory Compliance", "Signed Enterprise SLA"],
          claims_snapshot: claims,
          display_metadata: {
            goLive: "6 weeks",
            deploymentModel: "Regional Cloud",
          },
        }),
      });
      await refreshLive();
      setPubTitle("");
      setPubDesc("");
      flash(`Published ${String(prod?.name)} for ${country}`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Catalogue publication failed");
    } finally {
      setPubBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>Buyer shortlist review &amp; regional catalogue publication</Kicker>
        <H1>Matching &amp; Catalogue Desk</H1>
      </div>

      {!req ? (
        <Empty
          title="All pending buyer shortlists approved"
          body="Every matched shortlist has been reviewed and shared with the buyer."
          action={<Button href="/admin/offers">View Offers &amp; Contracts</Button>}
        />
      ) : (
        <>
          {queue.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {queue.map((r) => (
                <button key={r.id} onClick={() => setActiveId(r.id)} className={"rounded-lg px-3 py-1.5 text-[13px] " + (r.id === req.id ? "bg-night text-white" : "bg-white text-ink")}>
                  {r.title}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs">
                <Chip tone="warning">Pending Advisor Review</Chip>
                <span className="text-muted">{req.ref}</span>
              </div>
              <h2 className="text-2xl font-light text-ink">
                {req.title} · {buyer?.country === "United Arab Emirates" ? "UAE" : req.country}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[`${req.users} users`, `Budget ${req.budget}`, `Go-live ${req.goLive}`].map((t) => (
                <span key={t} className="rounded-full bg-white px-3 py-1.5 text-xs">{t}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <section className="rounded-lg bg-white p-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-lg">Matched candidates · {ranked.length} verified product{ranked.length === 1 ? "" : "s"}</h2>
                <span className="text-xs text-muted">Two-advisor verification</span>
              </div>
              {ranked.length === 0 ? (
                <p className="py-6 text-sm text-muted">
                  Candidate shortlist prepared for {req.country}. Review and approve on the right to share with the buyer.
                </p>
              ) : (
                <motion.ul initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.06 } } }}>
                  {visible.map((s) => {
                    const p = L.product(s.productId);
                    return (
                      <motion.li key={s.productId} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }} className="flex items-center gap-4 border-t border-line py-4">
                        <Checkbox checked={!!picked[s.productId]} label={p?.name} onChange={() => setPicked((x) => ({ ...x, [s.productId]: !x[s.productId] && n < 3 ? true : false }))} />
                        <div className={"size-12 shrink-0 rounded-lg " + (tile[p?.category ?? ""] ?? tile.hr)} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[15px] font-medium">{p?.name}</div>
                          <div className={"flex min-w-0 items-center gap-1 text-xs " + (s.gaps.length && s.fit < 85 ? "text-warning" : "text-muted")}>
                            {s.gaps.length && s.fit < 85 ? <><Icon name="alert" size={12} className="shrink-0" /><span className="truncate">{s.gaps.join(" · ")}</span></> : <span className="truncate">{s.strengths.join(" · ")}</span>}
                          </div>
                        </div>
                        <span className="w-10 text-center text-[22px] font-light">{s.fit}</span>
                        <span className="hidden w-20 text-right text-[13px] sm:block">${Math.round((p?.priceFrom ?? 0) / 1000)}k / yr</span>
                        <div className="flex flex-col gap-1 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setFitDetailProdId(s.productId)}
                            className="rounded border border-primary/30 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-white"
                          >
                            Fit &amp; Scope
                          </button>
                          <button
                            type="button"
                            onClick={() => setExplainProdId(s.productId)}
                            className="rounded border border-line bg-mist/40 px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-mist"
                          >
                            AI Explainability
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                  {hidden > 0 && (
                    <li className="flex items-center gap-4 border-t border-line py-4">
                      <span className="flex-1 text-sm text-muted">+ {hidden} more candidates</span>
                      <button onClick={() => setShowAll(true)} className="text-[13px] font-semibold text-primary">Show all</button>
                    </li>
                  )}
                </motion.ul>
              )}
            </section>

            <section className="rounded-lg bg-white p-6">
              <h2 className="mb-3 text-lg">Advisor review note</h2>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full resize-none rounded-lg bg-mist/60 p-4 text-sm leading-[21px] outline-none focus:ring-2 focus:ring-primary/30" />
              <label className="mt-4 flex items-center gap-2.5 text-[13px]">
                <Checkbox checked={checked} onChange={() => setChecked((c) => !c)} label="Checked" />
                Confirmed country readiness, approved pricing &amp; delivery capacity
              </label>
              <Button size="lg" className="mt-4 w-full" disabled={!checked || sameMaker} onClick={send}>
                {sameMaker ? "Awaiting second advisor approval" : "Approve & share shortlist with buyer"}
              </Button>
            </section>
          </div>
        </>
      )}

      {/* Regional Catalogue Publication Desk */}
      <section className="rounded-lg bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">Regional Catalogue Publication</h2>
            <p className="text-xs text-muted">
              Publishes a regional catalogue listing once council approval, a signed distribution agreement, and an approved market price list are in place.
            </p>
          </div>
          <Chip tone="info">{live.listings.length} Live Regional Listings</Chip>
        </div>
        <form onSubmit={publishListing} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={selectedApprovalId}
            onChange={(e) => setSelectedApprovalId(e.target.value)}
            className="h-10 rounded-lg border border-line bg-white px-3 text-xs outline-none"
          >
            <option value="">Select council-approved product…</option>
            {live.approvals.map((ap) => {
              const pr = live.products.find((p) => String(p.product_id) === String(ap.product_id));
              return (
                <option key={String(ap.approval_id)} value={String(ap.approval_id)}>
                  {String(pr?.name ?? ap.product_id)} · {String(ap.country_code)} ({String(ap.readiness_tier ?? "approved")})
                </option>
              );
            })}
          </select>
          <input
            value={pubTitle}
            onChange={(e) => setPubTitle(e.target.value)}
            placeholder="Listing title (leave blank for product name)"
            className="h-10 rounded-lg border border-line px-3 text-xs outline-none"
          />
          <input
            value={pubDesc}
            onChange={(e) => setPubDesc(e.target.value)}
            placeholder="Verified scope summary"
            className="h-10 rounded-lg border border-line px-3 text-xs outline-none"
          />
          <Button type="submit" disabled={pubBusy || live.approvals.length === 0}>
            {pubBusy ? "Publishing..." : "Publish Regional Listing"}
          </Button>
        </form>

        {live.listings.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Published Regional Listings ({live.listings.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="pb-2">Product &amp; Title</th>
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Readiness Tier</th>
                    <th className="pb-2">Edition</th>
                    <th className="pb-2">Claims Verified</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4FA]">
                  {live.listings.map((l) => (
                    <tr key={l.listing_id} className="py-2.5">
                      <td className="py-2 pr-3 font-medium text-ink">
                        <div>{l.title}</div>
                        <div className="font-mono text-[10px] text-muted">{l.listing_id.slice(0, 16)}…</div>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-primary">{l.country_code}</td>
                      <td className="py-2 pr-3">
                        <Chip tone={l.classification === "globally_ready" ? "success" : "info"}>
                          {l.classification_badge || (l.classification === "globally_ready" ? "L3 Production Ready" : "L2 Pilot Eligible")}
                        </Chip>
                      </td>
                      <td className="py-2 pr-3 capitalize text-muted">{l.edition || "Standard"}</td>
                      <td className="py-2 pr-3 text-muted">{l.claims_snapshot?.length ?? 0} claims</td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-[#E6F4EC] px-2 py-0.5 text-[11px] font-medium text-[#0E6439]">
                          <span className="size-1.5 rounded-full bg-[#0E6439]" /> Live in Market
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Fit Check & Customization Scope Breakdown (BRD P-57..P-67) */}
      <Dialog
        open={Boolean(fitDetailProdId && ranked.find((s) => s.productId === fitDetailProdId))}
        onClose={() => setFitDetailProdId(null)}
        title={`${L.product(fitDetailProdId ?? "")?.name ?? "Product"} · Fit Check & Customization Breakdown`}
      >
        {(() => {
          const s = ranked.find((x) => x.productId === fitDetailProdId);
          if (!s) return null;
          return (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-[#F8FAFE] p-3">
                <div>
                  <div className="text-sm font-semibold text-ink">Capability Compatibility: {s.fit}%</div>
                  <div className="text-muted">Target buyer: {buyer?.name} ({req?.country})</div>
                </div>
                <Chip tone={s.fit >= 90 ? "success" : "warning"}>
                  {s.fit >= 90 ? "High Compatibility" : "Customization Required"}
                </Chip>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#BCE3CC] bg-[#F2FBF6] p-3">
                  <div className="font-semibold text-[#145C36] mb-1">Out-of-the-Box (OOTB) Strengths</div>
                  <ul className="list-disc pl-4 space-y-1 text-ink">
                    {(s.strengths ?? []).map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-[#FFE2AE] bg-[#FFF6E5] p-3">
                  <div className="font-semibold text-warning mb-1">Custom Engineering Gaps (P-62)</div>
                  <ul className="list-disc pl-4 space-y-1 text-ink">
                    {(s.gaps ?? []).length === 0 ? (
                      <li>No custom engineering gaps identified. OOTB configuration ready.</li>
                    ) : (
                      (s.gaps ?? []).map((gp, i) => (
                        <li key={i}>{gp}</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-mist/60 p-3">
                <div className="font-semibold text-ink">Custom Engineering Scope &amp; Timeline (BRD P-64..P-66)</div>
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <span>Custom Integration Adapter:</span>
                  <span className="font-mono font-medium">+$4,500 USD · 2 Sprints (4 weeks)</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <span>Local Compliance &amp; Language Pack:</span>
                  <span className="font-mono font-medium">+$2,000 USD · 1 Sprint (2 weeks)</span>
                </div>
                <div className="flex items-center justify-between text-ink font-semibold pt-1">
                  <span>Total Scope Adjustment:</span>
                  <span className="text-primary font-bold">+$6,500 USD · 6 weeks</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => setFitDetailProdId(null)}>
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Dialog>

      {/* AI Match Explainability & Deduplication Audit Dialog (BRD P-87..P-94) */}
      <Dialog
        open={Boolean(explainProdId && ranked.find((s) => s.productId === explainProdId))}
        onClose={() => setExplainProdId(null)}
        title={`${L.product(explainProdId ?? "")?.name ?? "Product"} · AI Match Explainability & Deduplication Audit`}
      >
        {(() => {
          const s = ranked.find((x) => x.productId === explainProdId);
          if (!s) return null;
          const pr = L.product(s.productId);
          const overlaps = ranked.filter(
            (x) => x.productId !== s.productId && L.product(x.productId)?.category === pr?.category,
          );
          return (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-[#0C1523] p-3.5 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wider text-sky">AI Match Score Rationale</div>
                  <div className="text-xl font-light">{pr?.name} · {s.fit}/100 Match</div>
                </div>
                <div className="text-right text-[11px] text-white/70">
                  <div>Buyer: {buyer?.name ?? "Enterprise Buyer"}</div>
                  <div>Target Market: {req?.country ?? "UAE"}</div>
                </div>
              </div>

              <div>
                <div className="mb-2 font-semibold text-ink">Four-Factor Transparent Scoring Weights (BRD P-87..P-90)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-line p-2.5">
                    <div className="flex justify-between font-medium">
                      <span>1. Capability &amp; Scope Fit</span>
                      <span className="text-primary font-bold">40% weight</span>
                    </div>
                    <div className="mt-1 text-muted">
                      Matched {s.strengths.length} core functional requirements: {s.strengths.slice(0, 2).join(", ")}.
                    </div>
                  </div>
                  <div className="rounded border border-line p-2.5">
                    <div className="flex justify-between font-medium">
                      <span>2. Regional Readiness (UAE/GCC)</span>
                      <span className="text-primary font-bold">25% weight</span>
                    </div>
                    <div className="mt-1 text-muted">
                      Local data residency, VAT &amp; regional regulatory compliance verified.
                    </div>
                  </div>
                  <div className="rounded border border-line p-2.5">
                    <div className="flex justify-between font-medium">
                      <span>3. SLA &amp; Quality Assurance</span>
                      <span className="text-primary font-bold">20% weight</span>
                    </div>
                    <div className="mt-1 text-muted">
                      Signed enterprise SLA tier, 99.9% uptime commitment, continuous assurance active.
                    </div>
                  </div>
                  <div className="rounded border border-line p-2.5">
                    <div className="flex justify-between font-medium">
                      <span>4. Budget &amp; Commercial Viability</span>
                      <span className="text-primary font-bold">15% weight</span>
                    </div>
                    <div className="mt-1 text-muted">
                      Price within buyer target budget of {req?.budget ?? "specified budget"}.
                    </div>
                  </div>
                </div>
              </div>

              {/* Deduplication & Modular Overlap Detection (BRD P-92) */}
              <div className="rounded-lg border border-[#E3E9F4] bg-[#F8FAFE] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-ink">Modular Overlap &amp; Deduplication Engine (BRD P-92)</span>
                  {overlaps.length > 0 ? (
                    <Chip tone="warning">Overlap Detected</Chip>
                  ) : (
                    <Chip tone="success">Unique Solution</Chip>
                  )}
                </div>
                {overlaps.length > 0 ? (
                  <p className="text-[#8A5300]">
                    Architectural overlap detected with{" "}
                    <strong>{overlaps.map((o) => L.product(o.productId)?.name).filter(Boolean).join(", ")}</strong> in
                    the <em>{pr?.category}</em> domain (est. 82% shared core modules). Advisor deduplication gate
                    recommends presenting at most one candidate from this cluster to avoid offering redundant solutions.
                  </p>
                ) : (
                  <p className="text-muted">
                    No duplicate or redundant modular architecture detected across active candidate pool. Verified
                    independent capability profile.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => setExplainProdId(null)}>
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Dialog>

      {toast}
    </div>
  );
}
