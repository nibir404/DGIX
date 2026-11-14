"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Empty } from "@/components/portal/ui";
import { BTN_GRADIENT, Head, Panel, Pill, anonBuyer, dayMonth, orderRef, useFlash, useSeller } from "@/components/seller/kit";
import { Icon } from "@/components/ui/Icon";

export default function OrdersPage() {
  const { db, projects, submitMilestone } = useSeller();
  const { flash, toast } = useFlash();
  const [sel, setSel] = useState<string>();
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const input = useRef<HTMLInputElement>(null);

  const pr = projects.find((p) => p.id === sel) ?? projects.find((p) => p.milestones.some((m) => m.status === "in_progress")) ?? projects[0];
  if (!pr) return <Empty title="No orders yet" body="Orders appear here once a buyer accepts a DGIX offer for one of your products." />;

  const buyer = anonBuyer(db.companies.find((c) => c.id === pr.buyerId));
  const ms = pr.milestones;
  const curIdx = ms.findIndex((m) => m.status === "in_progress" || m.status === "in_review");
  const cur = curIdx >= 0 ? ms[curIdx] : undefined;
  const last = ms[ms.length - 1];
  const health = pr.health === "on_track" ? { tone: "bg-[#E6F4EC] text-[#0E6439]", dot: "bg-success", label: `On track · go-live ${dayMonth(last.due)}` } : { tone: "bg-[#FFF3DC] text-warning", dot: "bg-amber", label: `${pr.health === "late" ? "Late" : "At risk"}${pr.daysLate ? ` · ${pr.daysLate} days behind` : ""}` };
  const key = pr.id + (cur?.id ?? "");
  const attached = files[key] ?? [];
  const paidOut = (title: string) => db.invoices.some((i) => i.projectId === pr.id && i.milestone === title && i.status === "verified");

  const checklist = cur
    ? [
        { label: `${cur.title} delivered`, done: true },
        { label: "Buyer contact confirmed it works", done: true },
        { label: "Attach sign-off evidence", done: attached.length > 0 },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <Head
        kicker={<>Orders / {orderRef(db, pr)} · buyer: {buyer.replace(" · ", ", ")}</>}
        title={pr.name}
        right={
          <div className={clsx("flex h-8 items-center gap-[6px] self-start rounded-full px-[14px] md:self-auto", health.tone)}>
            <span className={clsx("size-[6px] shrink-0 rounded-lg", health.dot)} />
            <span className="text-[13px] font-medium leading-4">{health.label}</span>
          </div>
        }
      />

      {/* Milestone track */}
      <Panel className="flex flex-col gap-6 rounded-lg bg-night p-6 md:flex-row md:items-start md:gap-0 md:p-7" style={{ backgroundImage: "radial-gradient(ellipse 60% 140% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%)" }}>
        {ms.map((m, i) => {
          const done = m.status === "done";
          const now = m.status === "in_progress" || m.status === "in_review";
          const isLast = i === ms.length - 1;
          return (
            <div key={m.id} className={clsx("flex flex-col gap-[10px]", isLast ? "md:w-[200px] md:shrink-0" : "md:grow md:basis-0")}>
              <div className="flex items-center">
                <div className={clsx("flex size-7 shrink-0 items-center justify-center rounded-lg text-xs leading-4", done && "bg-[#7FE0AE] text-night", now && "bg-glow-amber font-bold text-night shadow-[0_0_0_6px_#FFD58A33]", !done && !now && "border-[1.5px] border-[#FFFFFF66] text-[#FFFFFFB3]")}>
                  {done ? "✓" : i + 1}
                </div>
                {!isLast && <div className={clsx("hidden h-[2px] grow basis-0 md:block", done ? "bg-[#7FE0AE]" : "bg-[#FFFFFF33]")} />}
              </div>
              <div className={clsx("text-sm font-semibold leading-[18px]", done || now ? "text-paper" : "text-[#FFFFFFB3]")}>{m.title}</div>
              <div className={clsx("text-xs leading-4", done ? "text-[#FFFFFF99]" : now ? "text-glow-amber" : "text-[#FFFFFF80]")}>
                {done ? (paidOut(m.title) ? "Accepted · paid out" : "Accepted") : m.status === "in_review" ? "With buyer for review" : now ? `Due ${dayMonth(m.due)} · ready to submit` : `Due ${dayMonth(m.due)}`}
              </div>
            </div>
          );
        })}
      </Panel>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Panel className="flex flex-col gap-4 bg-paper p-6 lg:grow-[1.4] lg:basis-0">
          {!cur ? (
            <>
              <div className="text-[18px] font-medium leading-[22px] text-ink">All milestones accepted</div>
              <div className="text-sm text-muted">This order is in its support phase.</div>
            </>
          ) : cur.status === "in_review" ? (
            <>
              <div className="text-[18px] font-medium leading-[22px] text-ink">Milestone {curIdx + 1} submitted</div>
              <div className="text-sm leading-5 text-muted">“{cur.title}” is with the buyer. They have 5 working days to accept; DGIX then invoices and pays you within 7 days of payment.</div>
              <div><Pill tone="info">In buyer review</Pill></div>
            </>
          ) : (
            <>
              <div className="text-[18px] font-medium leading-[22px] text-ink">Submit milestone {curIdx + 1}</div>
              <div className="flex flex-col gap-[10px]">
                {checklist.map((c) => (
                  <div key={c.label} className="flex items-center gap-[10px]">
                    {c.done ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] leading-[14px] text-paper">✓</span>
                    ) : (
                      <span className="size-5 shrink-0 rounded-lg border-[1.5px] border-[#C9D4E8]" />
                    )}
                    <span className="text-sm leading-[18px] text-ink">{c.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => input.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const n = Array.from(e.dataTransfer.files).map((f) => f.name);
                  if (n.length) setFiles((s) => ({ ...s, [key]: [...attached, ...n] }));
                }}
                className="flex min-h-[90px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-[#C9D4E8] bg-[#F9FAFD] px-4 py-3 transition hover:border-primary"
              >
                <span className="text-sm leading-[18px] text-ink">
                  Drop files or <span className="font-semibold text-primary">browse</span>
                </span>
                {attached.map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 text-xs text-success"><Icon name="check" size={12} /> {n}</span>
                ))}
              </button>
              {!attached.length && (
                <button
                  type="button"
                  onClick={() => setFiles((s) => ({ ...s, [key]: [`signoff-${cur.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`] }))}
                  className="-mt-1 self-start text-xs font-medium text-primary hover:underline"
                >
                  Use sample sign-off document
                </button>
              )}
              <input
                ref={input}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const n = Array.from(e.target.files ?? []).map((f) => f.name);
                  if (n.length) setFiles((s) => ({ ...s, [key]: [...attached, ...n] }));
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center">
                <button
                  onClick={() => {
                    if (!attached.length) return flash("Attach sign-off evidence first");
                    submitMilestone(pr.id, cur.id);
                    flash(`Milestone ${curIdx + 1} sent for buyer review`);
                  }}
                  className={clsx("inline-flex h-[46px] items-center justify-center self-start rounded-lg px-[22px] text-sm font-semibold leading-[18px] text-paper shadow-[0_10px_24px_-10px_#1E4FA3CC] hover:brightness-110", BTN_GRADIENT, !attached.length && "opacity-70")}
                >
                  Submit for buyer review
                </button>
                <div className="text-xs leading-4 text-muted">Buyer has 5 working days to accept</div>
              </div>
            </>
          )}
        </Panel>

        <Panel className="flex flex-col gap-3 bg-paper p-6 lg:grow lg:basis-0">
          <div className="text-[18px] font-medium leading-[22px] text-ink">All orders</div>
          {projects.map((p, i) => {
            const c = db.companies.find((x) => x.id === p.buyerId);
            const idx = p.milestones.findIndex((m) => m.status !== "done");
            const live = idx < 0;
            return (
              <motion.button
                key={p.id}
                layout
                onClick={() => setSel(p.id)}
                className={clsx("-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-[#F9FAFD]", i < projects.length - 1 && "border-b border-[#F1F4FA]", p.id === pr.id && "bg-[#F6F8FC]")}
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium leading-[18px] text-ink">
                    {orderRef(db, p)} · {anonBuyer(c).split(" · ")[1]}
                  </span>
                  <span className="text-xs leading-4 text-muted">{live ? "Support phase · SLA 99.5%" : `Milestone ${idx + 1} of ${p.milestones.length}`}</span>
                </span>
                {live ? <Pill tone="info">Live</Pill> : p.health === "on_track" ? <Pill tone="success">On track</Pill> : <Pill tone="warning">{p.health === "late" ? "Late" : "At risk"}</Pill>}
              </motion.button>
            );
          })}
        </Panel>
      </div>
      {toast}
    </div>
  );
}
