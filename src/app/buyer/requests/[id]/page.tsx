"use client";

import { use, useState } from "react";
import { useLookup } from "@/lib/store";
import { ActivityLog } from "@/components/portal/ActivityLog";
import { ReasonDialog } from "@/components/portal/ReasonDialog";
import { Arrow, Btn, Heading, Panel, StatusTag, dayMonth, useBuyer, useFlash } from "@/components/buyer/kit";

const CLOSE_REASONS = ["Our budget changed", "We chose another solution", "Our need changed", "The timeline moved", "None of the matches fit"];

export default function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const b = useBuyer();
  const lk = useLookup();
  const { flash, toast } = useFlash();
  const [closing, setClosing] = useState(false);
  const r = b.requests.find((x) => x.id === id);

  if (!r) {
    return (
      <div className="flex flex-col gap-5">
        <Heading kicker="Requests" title="Request not found" />
        <Panel className="p-6 text-sm text-muted">This request doesn&apos;t exist or belongs to another company. <Btn href="/buyer/requests" variant="soft" size="sm" className="ml-2">Back to requests</Btn></Panel>
      </div>
    );
  }

  const advisor = lk.user(r.ownerId ?? b.company?.advisorId);
  const offer = b.offers.find((o) => o.requestId === r.id && o.status !== "draft");
  const next =
    r.status === "won" ? { label: "Open the project", href: "/buyer/projects" } :
    r.status === "offer" ? { label: "Review the offer", href: "/buyer/offers" } :
    r.status === "shortlist_sent" || r.status === "demo" ? { label: "See your shortlist", href: `/buyer/shortlist?request=${r.id}` } :
    null;
  const canClose = r.status !== "won" && r.status !== "closed";
  const facts: [string, string][] = [
    ["Country", r.country],
    ["Users", r.users],
    ["Budget", r.budget],
    ["Go-live", r.goLive],
    ["Sent", dayMonth(r.createdAt)],
    ["Advisor", advisor?.name ?? "Being assigned"],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Heading
        kicker={<>{r.ref} · <StatusTag status={r.status} /></>}
        title={r.title}
        action={next ? <Btn href={next.href}>{next.label} <Arrow color="#FFFFFF" /></Btn> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <Panel className="flex flex-col gap-5 p-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-caps text-muted">What you need</div>
              <p className="mt-2 text-[15px] leading-6 text-ink">{r.need}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="truncate text-sm font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {r.status === "closed" && r.closedReason && (
              <p className="rounded-lg bg-[#F5F8FC] px-4 py-3 text-sm text-muted">Closed · “{r.closedReason}”</p>
            )}
            {offer && r.status !== "won" && (
              <p className="text-sm text-muted">Offer {offer.ref} · {offer.status === "sent" ? "waiting for your decision" : offer.status}</p>
            )}
          </Panel>
          {canClose && (
            <Panel className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between" delay={0.05}>
              <div>
                <div className="text-[15px] font-semibold text-ink">No longer need this?</div>
                <p className="text-sm text-muted">Close the request and tell {advisor ? advisor.name.split(" ")[0] : "your advisor"} why.</p>
              </div>
              <Btn variant="outline" onClick={() => setClosing(true)} className="text-danger hover:border-danger">Close request</Btn>
            </Panel>
          )}
        </div>

        <Panel className="p-6" delay={0.1}>
          <h2 className="mb-5 text-lg text-ink">Activity</h2>
          <ActivityLog request={r} />
        </Panel>
      </div>

      <ReasonDialog
        open={closing}
        title="Close this request?"
        intro="Your advisor stops matching and the shortlist is withdrawn. You can always send a new request."
        reasons={CLOSE_REASONS}
        confirmLabel="Close request"
        onClose={() => setClosing(false)}
        onConfirm={(reason) => {
          b.closeRequest(r.id, reason);
          setClosing(false);
          flash("Request closed · your advisor has been told why");
        }}
      />
      {toast}
    </div>
  );
}
