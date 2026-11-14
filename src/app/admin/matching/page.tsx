"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, hasProhibitedUltimateWording } from "@/lib/api";
import { useLookup, useStore } from "@/lib/store";
import { Button, Chip, Empty } from "@/components/portal/ui";
import { Checkbox, H1, Kicker, useFlash } from "@/components/admin/kit";
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
  const n = Object.values(picked).filter(Boolean).length;
  const visible = showAll ? ranked : ranked.slice(0, 3);
  const hidden = ranked.length - visible.length;

  const send = () => {
    if (!req) return;
    confirmShortlist(req.id, Object.keys(picked).filter((id) => picked[id]));
    flash(`4-Eyes Advisor approval recorded (BR-15) · Shortlist unlocked for ${buyer?.name ?? "buyer"}`);
  };

  const publishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = live.approvals.find((a) => String(a.approval_id) === selectedApprovalId) ?? live.approvals[0];
    if (!app) {
      flash("No Ed25519 Council ApprovalRecord available yet. Vote in Council & Audit first.");
      return;
    }
    if (hasProhibitedUltimateWording(pubTitle, pubDesc)) {
      flash("FR-CAT-03 Violation: Listing copy cannot contain 'ultimate'.");
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
      flash("5-Point Check: Requires signed CommercialAgreement and 4-eyes approved PriceList for this country.");
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
            "Council-approved enterprise software verified across PG0–PG5 quality, security, and country readiness gates.",
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
      flash(`Published ${String(prod?.name)} for ${country} via 5-point governance check!`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Catalogue publication failed");
    } finally {
      setPubBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Kicker>BR-15 Human-in-the-Loop Shortlist Gate &amp; 5-Point Catalogue Publication ({authSession?.user.username ?? "advisor"})</Kicker>
        <H1>Matching &amp; Catalogue Desk</H1>
      </div>

      {!req ? (
        <Empty
          title="All pending buyer shortlists approved"
          body="Every AI-ranked shortlist has received 4-eyes Advisor sign-off (BR-15)."
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
                <Chip tone="warning">Pending 4-Eyes Advisor Approval · BR-15</Chip>
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
                <h2 className="text-lg">AI Candidate Ranking · {ranked.length} verified matches</h2>
                <span className="text-xs text-muted">Checker: advisor.approver</span>
              </div>
              {ranked.length === 0 ? (
                <p className="py-6 text-sm text-muted">
                  Candidate shortlist generated in backend for {req.country}. Click approve on the right as <code>advisor.approver</code> to release to buyer.
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
              <h2 className="mb-3 text-lg">4-Eyes Advisor Approval Note</h2>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full resize-none rounded-lg bg-mist/60 p-4 text-sm leading-[21px] outline-none focus:ring-2 focus:ring-primary/30" />
              <label className="mt-4 flex items-center gap-2.5 text-[13px]">
                <Checkbox checked={checked} onChange={() => setChecked((c) => !c)} label="Checked" />
                Verified country readiness, cost floor &amp; SLA capacity (BR-15)
              </label>
              <Button size="lg" className="mt-4 w-full" disabled={!checked} onClick={send}>
                Approve &amp; Release Shortlist to Buyer
              </Button>
            </section>
          </div>
        </>
      )}

      {/* 5-Point Catalogue Publication Desk */}
      <section className="rounded-lg bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">5-Point Catalogue Publication Desk</h2>
            <p className="text-xs text-muted">
              Publishes a regional listing only when Ed25519 Council Approval + Signed Agreement + Approved PriceList + Country Match + FR-CAT-03 all pass.
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
            <option value="">Select Ed25519 Council Approval…</option>
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
            placeholder="Verified scope summary (no 'ultimate')"
            className="h-10 rounded-lg border border-line px-3 text-xs outline-none"
          />
          <Button type="submit" disabled={pubBusy || live.approvals.length === 0}>
            {pubBusy ? "Verifying 5 preconditions..." : "Publish Regional Listing"}
          </Button>
        </form>
      </section>

      {toast}
    </div>
  );
}
