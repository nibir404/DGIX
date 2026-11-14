"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import type { Project } from "@/lib/types";
import { Btn, Dialog, Panel, Pill, Tick, dayMonth, money, useBuyer, useFlash } from "./kit";

export const projectRef = (p: Project, list: Project[]) => "PRJ-00" + (31 + Math.max(0, list.findIndex((x) => x.id === p.id)));

export function ProjectPicker({ current }: { current: string }) {
  const b = useBuyer();
  if (b.projects.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {b.projects.map((p) => (
        <Link key={p.id} href={`/buyer/projects/${p.id}`} className={clsx("rounded-lg border px-3 py-1.5 text-xs leading-4", p.id === current ? "border-night bg-night text-paper" : "border-[#E3E9F4] bg-paper text-ink hover:border-[#C9D4E8]")}>
          {p.name}
        </Link>
      ))}
    </div>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const b = useBuyer();
  const lk = useLookup();
  const { flash, toast } = useFlash();
  const [issue, setIssue] = useState(false);
  const [issueText, setIssueText] = useState("");

  const ms = project.milestones;
  const done = ms.filter((m) => m.status === "done").length;
  const pct = Math.round((done / ms.length) * 100);
  const offer = b.db.offers.find((o) => o.id === project.offerId);
  const invoices = b.invoices.filter((i) => i.projectId === project.id).sort((a, c) => c.due.localeCompare(a.due));
  const dueInv = invoices.filter((i) => i.status === "due" || i.status === "overdue");
  const paidInv = invoices.filter((i) => i.status === "paid" || i.status === "verified");
  const total = offer?.price ?? ms.reduce((s, m) => s + m.amount, 0);
  const paid = paidInv.reduce((s, i) => s + i.amount, 0);
  const current = ms.find((m) => m.status === "in_review") ?? ms.find((m) => m.status === "in_progress");
  const partner = lk.company(project.partnerId);
  const product = lk.product(project.productId);
  const openCases = b.cases.filter((c) => c.projectId === project.id && c.status !== "resolved").length;
  const health = project.health === "on_track" ? { t: "On track", tone: "success" as const } : project.health === "at_risk" ? { t: `At risk${project.daysLate ? ` · ${project.daysLate} days late` : ""}`, tone: "warning" as const } : { t: "Late", tone: "danger" as const };
  const invFor = (title: string) => invoices.find((i) => i.milestone === title);

  const sub = (m: Project["milestones"][number]) => {
    const inv = invFor(m.title);
    if (m.status === "done") return inv?.status === "due" ? { t: `Invoice due ${dayMonth(inv.due)}`, c: "text-glow-amber" } : inv?.paidOn ? { t: `Paid · ${dayMonth(inv.paidOn)}`, c: "text-[#FFFFFF99]" } : { t: `Accepted · ${m.acceptedOn ? dayMonth(m.acceptedOn) : ""}`, c: "text-[#FFFFFF99]" };
    if (m.status === "in_review") return { t: "Waiting for your review", c: "text-[#FFFFFF99]" };
    if (m.status === "in_progress") return { t: `In progress · due ${dayMonth(m.due)}`, c: "text-[#FFFFFF99]" };
    return { t: `Due ${dayMonth(m.due)}`, c: "text-[#FFFFFF80]" };
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted"><Link href="/buyer/projects" className="hover:text-ink">Projects</Link> / {projectRef(project, b.projects)}</div>
          <h1 className="text-[30px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">{project.name}</h1>
        </div>
        <Pill tone={health.tone} className="h-8 self-start px-3.5 text-[13px] md:self-auto">{health.t} · go-live {dayMonth(ms[ms.length - 1].due)}</Pill>
      </div>
      <ProjectPicker current={project.id} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-[22px] rounded-lg bg-night p-6 md:p-7" style={{ backgroundImage: "radial-gradient(ellipse 60% 140% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%)" }}>
        <div className="flex justify-between gap-4">
          <div className="text-sm leading-[18px] text-[#FFFFFFB3]">Milestones{offer ? ` · contract ${offer.ref.replace("OFF", "CTR")}` : ""}</div>
          <div className="shrink-0 text-sm font-semibold leading-[18px] text-paper">{pct}% complete</div>
        </div>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-[640px] items-start">
            {ms.map((m, i) => {
              const last = i === ms.length - 1;
              const nextDone = ms[i + 1]?.status === "done";
              const line = m.status === "done" ? (nextDone ? "bg-[#7FE0AE]" : "bg-[linear-gradient(90deg,#7FE0AE_0%,#7FB6FF_100%)]") : "bg-[#FFFFFF33]";
              const s = sub(m);
              return (
                <div key={m.id} className={clsx("flex flex-col gap-2.5", last ? "w-[140px] shrink-0" : "flex-1 basis-0")}>
                  <div className="flex items-center">
                    {m.status === "done" ? (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#7FE0AE]"><Tick size={14} color="#08152F" /></span>
                    ) : m.status === "upcoming" ? (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#FFFFFF66] text-xs font-semibold leading-4 text-[#FFFFFFB3]">{i + 1}</span>
                    ) : (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-glow-amber text-xs font-bold leading-4 text-night shadow-[0_0_0_6px_#FFD58A33]">{i + 1}</span>
                    )}
                    {!last && <div className={clsx("h-[2px] flex-1", line)} />}
                  </div>
                  <div className={clsx("pr-3 text-sm font-semibold leading-[18px]", m.status === "upcoming" ? "text-[#FFFFFFB3]" : "text-paper")}>{m.title}</div>
                  <div className={clsx("pr-3 text-xs leading-4", s.c)}>{s.t}</div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="flex min-w-0 flex-col gap-4 p-6 lg:grow-[1.3] lg:basis-0" delay={0.05}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[18px] font-medium leading-[22px] text-ink">{current ? (current.status === "in_review" ? `Review ${current.title.toLowerCase()}` : current.title) : "All milestones accepted"}</div>
            <div className="text-[13px] leading-4 text-muted">
              {current?.status === "in_review" ? `Submitted by ${partner?.name}` : current ? `${partner?.name} is working on it` : `Delivered by ${partner?.name}`}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              [`${done} / ${ms.length}`, "milestones accepted"],
              [current ? money(current.amount) : money(total), current ? "on acceptance" : "contract value"],
              [String(openCases), "open issues"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col gap-1 rounded-lg bg-[#F6F8FC] p-3 sm:p-4">
                <div className="text-[20px] font-light leading-[30px] text-ink sm:text-[24px]">{v}</div>
                <div className="text-xs leading-4 text-muted">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-3 rounded-lg bg-[linear-gradient(180deg,#F6F8FC_0%,#FFFFFF_100%)] p-4">
            <div className="flex justify-between">
              <div className="text-xs leading-4 text-muted">Milestone schedule · {product?.name}</div>
              <div className="text-xs font-semibold leading-4 text-ink">
                {money(paid)} of {money(total)} settled
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {ms.map((m) => {
                const share = total > 0 ? Math.max(8, Math.round((m.amount / total) * 100)) : Math.round(100 / Math.max(1, ms.length));
                const tone =
                  m.status === "done"
                    ? "bg-success"
                    : m.status === "in_review"
                      ? "bg-amber"
                      : m.status === "in_progress"
                        ? "bg-primary"
                        : "bg-[#DCE4F2]";
                return (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-ink">{m.title}</span>
                      <span className="shrink-0 text-muted">
                        {money(m.amount)} · {m.status === "done" ? "Accepted" : m.status === "in_review" ? "In review" : `Due ${dayMonth(m.due)}`}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#EAF0FA]">
                      <div className={clsx("h-full rounded-full transition-all", tone)} style={{ width: `${share}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2.5">
            {current?.status === "in_review" && (
              <Btn onClick={() => { b.acceptMilestone(project.id, current.id); flash(`${current.title} accepted · invoice for ${money(current.amount)} raised`); }} className="h-[46px] px-[22px] shadow-[0_10px_24px_-10px_#1E4FA3CC]">Accept milestone</Btn>
            )}
            <Btn variant="outline" onClick={() => setIssue(true)} className="h-[46px] border-[#C9D4E8]">Raise an issue</Btn>
          </div>
        </Panel>

        <Panel className="flex min-w-0 flex-col gap-3 p-6 lg:grow lg:basis-0" delay={0.1}>
          <div className="flex justify-between">
            <div className="text-[18px] font-medium leading-[22px] text-ink">Invoices</div>
            <Link href="/buyer/billing" className="text-[13px] leading-4 text-primary">All billing</Link>
          </div>
          {invoices.length === 0 && <div className="text-sm text-muted">No invoices yet. You&apos;re invoiced only after you accept a milestone.</div>}
          {dueInv.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-lg border border-[#FFE2AE] bg-[#FFF6E5] p-3.5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="truncate text-sm font-semibold leading-[18px] text-ink">{i.ref} · {i.milestone}</div>
                <div className="text-xs leading-4 text-warning">Due {dayMonth(i.due)}</div>
              </div>
              <div className="text-[15px] font-semibold leading-[18px] text-ink">{money(i.amount)}</div>
              <button onClick={() => { b.payInvoice(i.id); flash(`${i.ref} paid · ${money(i.amount)}. DGIX will verify it.`); }} className="inline-flex h-[34px] items-center rounded-lg bg-night px-3.5 text-xs font-semibold leading-4 text-paper hover:brightness-125">Pay</button>
            </div>
          ))}
          {paidInv.map((i) => (
            <div key={i.id} className="flex items-center gap-3 border-b border-[#F1F4FA] px-1 py-3.5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="truncate text-sm leading-[18px] text-ink">{i.ref} · {i.milestone}</div>
                <div className="text-xs leading-4 text-success">{i.status === "verified" ? "Paid & verified" : "Paid"} {i.paidOn ? dayMonth(i.paidOn) : ""}</div>
              </div>
              <div className="text-[15px] leading-[18px] text-ink">{money(i.amount)}</div>
            </div>
          ))}
          <div className="mt-auto flex justify-between px-1 pt-2.5">
            <div className="text-[13px] leading-4 text-muted">Contract value</div>
            <div className="text-[13px] font-semibold leading-4 text-ink">{money(total)} · {money(paid)} paid</div>
          </div>
        </Panel>
      </div>

      <Dialog open={issue} onClose={() => setIssue(false)} title="Raise an issue">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!issueText.trim()) return;
            b.openCase(`${project.name}: ${issueText.trim().slice(0, 60)}`, issueText.trim(), project.id);
            setIssue(false);
            setIssueText("");
            flash("Issue raised · your advisor and the partner are on it");
          }}
          className="flex flex-col gap-3"
        >
          <textarea autoFocus value={issueText} onChange={(e) => setIssueText(e.target.value)} rows={4} placeholder="What's not working? e.g. Store 7 receipts print without VAT number." className="resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-primary" />
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => setIssue(false)} className="flex-1">Cancel</Btn>
            <Btn type="submit" disabled={!issueText.trim()} className="flex-1">Raise issue</Btn>
          </div>
        </form>
      </Dialog>
      {toast}
    </div>
  );
}
