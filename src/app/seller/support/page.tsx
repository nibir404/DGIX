"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { SupportCase } from "@/lib/types";
import { BTN_GRADIENT, Head, NIGHT_CARD, Panel, anonBuyer, orderRef, useFlash, useSeller } from "@/components/seller/kit";

const prio = { urgent: "P1", high: "P2", normal: "P3", low: "P4" } as const;
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
const ago = (from: string, to: string) => {
  const m = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000));
  return m < 60 ? `${m} min` : m < 60 * 48 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} days`;
};

export default function SupportPage() {
  const { db, user, cases: own, projects, replyCase, openCase } = useSeller();
  const { flash, toast } = useFlash();
  const projectIds = new Set(projects.map((p) => p.id));
  const cases = db.cases.filter((c) => own.includes(c) || (c.projectId && projectIds.has(c.projectId)));
  const isSolved = (c: SupportCase) => c.status === "resolved" || c.messages.some((m) => m.body.startsWith("✓ Marked solved"));
  const open = cases.filter((c) => !isSolved(c));
  const solved = cases.filter(isSolved);

  const [sel, setSel] = useState<string>();
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [compose, setCompose] = useState(false);
  const [msg, setMsg] = useState("");

  const active = cases.find((c) => c.id === sel) ?? open[0];
  const who = (id: string) => db.users.find((u) => u.id === id);
  const contextOf = (c: SupportCase) => {
    const pr = db.projects.find((p) => p.id === c.projectId);
    const buyer = pr ? anonBuyer(db.companies.find((x) => x.id === pr.buyerId)).replace(" · ", ", ") : "DGIX";
    return `${pr ? orderRef(db, pr) + " · " : ""}${buyer} · raised ${time(c.opened)}`;
  };

  const sendReply = () => {
    if (!active || !draft.trim()) return;
    replyCase(active.id, draft.trim());
    setDraft("");
    setReplying(false);
    flash(`Reply sent on ${active.ref}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <Head kicker="Buyer issues come to you through DGIX" title="Support" />

      <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start">
        <Panel className="flex flex-col bg-paper px-4 py-2 md:px-6 lg:grow-[1.5] lg:basis-0">
          <div className="flex justify-between gap-3 border-b border-[#F1F4FA] py-[14px]">
            <div className="text-base font-medium leading-5 text-ink">Tickets</div>
            <div className="text-xs leading-4 text-muted">
              {open.length} open · {solved.length} solved
            </div>
          </div>

          {active && (
            <motion.div layout className={clsx("my-[14px] flex flex-col gap-[10px] rounded-lg p-4", isSolved(active) ? "bg-[#F6F8FC]" : "bg-[#FFF6E5]")}>
              <div className="flex flex-col justify-between gap-1 sm:flex-row">
                <div className="text-sm font-semibold leading-[18px] text-ink">
                  #{active.ref} · {active.title}
                </div>
                <div className={clsx("shrink-0 text-xs font-semibold leading-4", isSolved(active) ? "text-success" : "text-warning")}>
                  {isSolved(active) ? "Solved" : `${prio[active.priority]} · ${active.status === "waiting" ? "waiting on you" : "open"}`}
                </div>
              </div>
              <div className="text-[13px] leading-4 text-muted">{contextOf(active)}</div>

              <div className="flex flex-col gap-2 border-t border-[#0000000D] pt-3">
                {active.messages.map((m, i) => {
                  const mine = m.from === user?.id;
                  return (
                    <div key={i} className={clsx("max-w-[90%] rounded-lg px-3 py-2 text-[13px] leading-[19px]", mine ? "self-end bg-primary text-paper" : "self-start bg-paper text-ink")}>
                      <div className={clsx("mb-0.5 text-[11px]", mine ? "text-[#FFFFFFB3]" : "text-muted")}>
                        {who(m.from)?.name ?? "DGIX"} · {time(m.at)}
                      </div>
                      {m.body}
                    </div>
                  );
                })}
              </div>

              <AnimatePresence initial={false}>
                {replying && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="Write a reply — DGIX passes it to the buyer" className="w-full resize-none rounded-lg border border-[#E2C58F] bg-paper p-3 text-sm outline-none focus:border-primary" />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isSolved(active) && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => (replying ? sendReply() : setReplying(true))} className={clsx("inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-semibold leading-4 text-paper hover:brightness-110", BTN_GRADIENT)}>
                    {replying ? "Send reply" : "Reply"}
                  </button>
                  <button
                    onClick={() => {
                      replyCase(active.id, "✓ Marked solved by partner — please confirm with the buyer.");
                      setReplying(false);
                      flash(`${active.ref} marked solved`);
                    }}
                    className="inline-flex h-9 items-center rounded-lg border border-[#E2C58F] bg-paper px-4 text-[13px] font-semibold leading-4 text-ink hover:border-ink"
                  >
                    Mark solved
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {cases.filter((c) => c.id !== active?.id).map((c, i, arr) => (
            <button key={c.id} onClick={() => { setSel(c.id); setReplying(false); }} className={clsx("flex justify-between gap-3 py-[14px] text-left hover:opacity-80", i < arr.length - 1 && "border-b border-[#F1F4FA]")}>
              <span className="text-sm leading-[18px] text-ink">
                #{c.ref} · {c.title}
              </span>
              <span className={clsx("shrink-0 text-xs leading-4", isSolved(c) ? "text-success" : "text-warning")}>
                {isSolved(c) ? `Solved in ${ago(c.opened, c.messages[c.messages.length - 1].at)}` : `${prio[c.priority]} · open`}
              </span>
            </button>
          ))}
          {cases.length === 0 && <div className="py-8 text-center text-sm text-muted">No tickets yet.</div>}
        </Panel>

        <div className="flex flex-col gap-4 lg:grow lg:basis-0">
          <Panel className="flex flex-col gap-[14px] bg-night p-6" style={{ backgroundImage: NIGHT_CARD }}>
            <div className="text-[13px] leading-4 text-[#FFFFFFB3]">Your SLA · last 30 days</div>
            <div className="flex gap-6">
              <div className="flex flex-col gap-1">
                <div className="text-[34px] font-light leading-[42px] text-paper">52 min</div>
                <div className="text-xs leading-4 text-[#FFFFFF99]">avg. first reply</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[34px] font-light leading-[42px] text-[#7FE0AE]">100%</div>
                <div className="text-xs leading-4 text-[#FFFFFF99]">within SLA</div>
              </div>
            </div>
            <div className="text-xs leading-4 text-[#FFFFFF8C]">Missed SLAs lower your readiness score.</div>
          </Panel>

          <Panel className="flex flex-col gap-3 bg-paper p-[22px]">
            <div className="text-base font-medium leading-5 text-ink">Need help from DGIX?</div>
            <div className="text-[13px] leading-[19px] text-muted">Asha replies within 1 hour, Sun–Thu, Dhaka time.</div>
            <AnimatePresence initial={false}>
              {compose && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <textarea autoFocus value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="What do you need?" className="w-full resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-primary" />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                if (!compose) return setCompose(true);
                if (!msg.trim()) return;
                openCase(msg.trim().slice(0, 60), msg.trim());
                setMsg("");
                setCompose(false);
                flash("Message sent to Asha · new ticket opened");
              }}
              className="inline-flex h-10 shrink-0 items-center self-start rounded-lg bg-[#EAF0FB] px-[18px] text-[13px] font-semibold leading-4 text-primary hover:bg-[#DCE6F8]"
            >
              {compose ? "Send to Asha" : "Message Asha"}
            </button>
          </Panel>
        </div>
      </div>
      {toast}
    </div>
  );
}
