"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import type { SupportCase } from "@/lib/types";
import { Arrow, Btn, Dialog, Panel, dayMonth, firstName, useBuyer, useFlash } from "@/components/buyer/kit";

const PRIO: Record<SupportCase["priority"], string> = { urgent: "P1", high: "P2", normal: "P3", low: "P4" };
const fmtDur = (ms: number) => (ms < 3600e3 ? `${Math.max(1, Math.round(ms / 60e3))} min` : `${Math.round(ms / 3600e3)} h`);

function SupportInner() {
  const b = useBuyer();
  const lk = useLookup();
  const params = useSearchParams();
  const { flash, toast } = useFlash();
  const [sel, setSel] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [report, setReport] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState("");
  const pickNewest = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const cases = [...b.cases].sort((a, c) => (a.status === "resolved" ? 1 : 0) - (c.status === "resolved" ? 1 : 0) || c.opened.localeCompare(a.opened));
  const open = cases.filter((c) => c.status !== "resolved");
  const solved = cases.filter((c) => c.status === "resolved");
  const current = cases.find((c) => c.id === sel) ?? open[0] ?? cases[0];
  const advisor = lk.user(b.company?.advisorId);

  useEffect(() => {
    const s = params.get("subject");
    if (s) { setTitle(s); setReport(true); }
  }, [params]);

  useEffect(() => {
    if (pickNewest.current && b.cases[0]) { setSel(b.cases[0].id); pickNewest.current = false; }
  }, [b.cases]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [current?.messages.length]);

  // SLA from real message timestamps: first staff reply after the opener
  const firsts = b.cases.map((c) => {
    const opener = c.messages[0];
    const reply = c.messages.find((m) => lk.user(m.from)?.role === "staff" && m.from !== opener?.from);
    return opener && reply ? new Date(reply.at).getTime() - new Date(opener.at).getTime() : null;
  }).filter((x): x is number => x !== null);
  const avg = firsts.length ? firsts.reduce((s, x) => s + x, 0) / firsts.length : null;
  const within = firsts.length ? Math.round((firsts.filter((x) => x <= 3600e3).length / firsts.length) * 100) : 100;

  const send = () => {
    if (!current || !draft.trim()) return;
    b.replyCase(current.id, draft.trim());
    setDraft("");
    flash(`Sent to ${firstName(advisor?.name) || "your advisor"}`);
  };

  const submitReport = () => {
    if (!title.trim() || !body.trim()) return;
    pickNewest.current = true;
    b.openCase(title.trim(), body.trim(), projectId || undefined);
    setReport(false);
    setTitle("");
    setBody("");
    setProjectId("");
    flash(`Issue reported · ${firstName(advisor?.name) || "your advisor"} replies within 1 hour`);
  };

  let lastDay = "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted">One contact for everything · replies within 1 hour</div>
          <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">Support</h1>
        </div>
        <Btn onClick={() => setReport(true)} className="self-start shadow-[0_10px_24px_-10px_#1E4FA3CC] md:self-auto">Report an issue</Btn>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="flex min-h-[460px] min-w-0 flex-col overflow-clip lg:grow-[1.6] lg:basis-0">
          <div className="flex items-center gap-3 border-b border-[#F1F4FA] px-[22px] py-[18px]">
            <Image src="/media/buyer-advisor.webp" alt="" width={42} height={42} className="size-[42px] shrink-0 rounded-full object-cover" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="text-[15px] font-semibold leading-[18px] text-ink">{advisor?.name ?? "DGIX support"}</div>
              <div className="text-xs leading-4 text-success">● Online · your DGIX advisor</div>
            </div>
            <div className="hidden text-xs leading-4 text-muted sm:block">{b.company?.city ?? "Dubai"} · GST</div>
          </div>
          {current && (
            <div className="flex items-center justify-between gap-2 border-b border-[#F1F4FA] bg-paper px-[22px] py-2.5 text-xs">
              <span className="truncate font-semibold text-ink">{current.ref} · {current.title}</span>
              <span className={clsx("shrink-0", current.status === "resolved" ? "text-success" : "text-warning")}>{current.status === "resolved" ? "Solved" : current.status === "waiting" ? "Waiting" : "Open"}</span>
            </div>
          )}
          <div className="flex max-h-[520px] flex-1 flex-col gap-3.5 overflow-y-auto bg-[#F9FAFD] p-4 sm:p-[22px]">
            {!current && <div className="m-auto text-sm text-muted">No conversations yet. Report an issue to start one.</div>}
            <AnimatePresence initial={false}>
              {current?.messages.map((m, i) => {
                const mine = m.from === b.user?.id;
                const day = new Date(m.at).toDateString();
                const showDay = day !== lastDay;
                lastDay = day;
                const today = day === new Date().toDateString();
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3.5">
                    {showDay && <div className="self-center text-[11px] leading-[14px] text-[#9AA2B4]">{today ? "Today" : dayMonth(m.at)}</div>}
                    <div
                      className={clsx(
                        "max-w-[85%] rounded-t-lg px-4 py-3 text-sm leading-5 sm:max-w-[70%]",
                        mine ? "self-end rounded-bl-lg rounded-br-lg bg-primary text-paper" : "self-start rounded-bl-lg rounded-br-lg border border-[#E3E9F4] bg-paper text-ink",
                      )}
                    >
                      {!mine && lk.user(m.from)?.id !== advisor?.id && <div className="mb-0.5 text-[11px] font-semibold text-muted">{lk.user(m.from)?.name}</div>}
                      {m.body}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2.5 border-t border-[#F1F4FA] px-4 py-3.5">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={!current} placeholder={`Write to ${firstName(advisor?.name) || "support"}…`} className="h-[46px] min-w-0 flex-1 rounded-lg bg-[#F6F8FC] px-4 text-sm leading-[18px] text-ink outline-none placeholder:text-[#9AA2B4]" />
            <button type="submit" aria-label="Send" disabled={!draft.trim()} className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] transition hover:brightness-110 disabled:opacity-50">
              <Arrow color="#FFFFFF" />
            </button>
          </form>
        </Panel>

        <div className="flex min-w-0 flex-col gap-4 lg:grow lg:basis-0">
          <Panel className="flex flex-col gap-3 p-[22px]" delay={0.05}>
            <div className="flex justify-between">
              <div className="text-base font-medium leading-5 text-ink">Open tickets</div>
              <div className="text-xs leading-4 text-muted">{open.length} open · {solved.length} solved</div>
            </div>
            {open.length === 0 && <div className="text-sm text-muted">No open tickets.</div>}
            {open.map((c) => {
              const prog = c.messages.length > 1 ? 65 : 20;
              const last = c.messages[c.messages.length - 1];
              return (
                <button key={c.id} onClick={() => setSel(c.id)} className={clsx("flex flex-col gap-2 rounded-lg border p-3.5 text-left transition-shadow", "border-[#FFE2AE] bg-[#FFF6E5]", current?.id === c.id && "shadow-[0_0_0_2px_#F6A11A]")}>
                  <div className="flex justify-between gap-2">
                    <div className="truncate text-[13px] font-semibold leading-4 text-ink">#{c.ref.replace("CASE-0", "T-")} · {c.title}</div>
                    <div className="shrink-0 text-[11px] font-semibold leading-[14px] text-warning">{PRIO[c.priority]}</div>
                  </div>
                  <div className="truncate text-xs leading-4 text-muted">{lk.user(last.from)?.role === "staff" ? `${lk.user(last.from)?.name}: ${last.body}` : "Waiting for a reply"}</div>
                  <div className="flex h-1.5 rounded-lg bg-[#FFE2AE]"><motion.div initial={{ width: 0 }} animate={{ width: `${prog}%` }} className="rounded-lg bg-amber" /></div>
                </button>
              );
            })}
            {solved.slice(0, 4).map((c) => {
              const opener = c.messages[0];
              const lastM = c.messages[c.messages.length - 1];
              return (
                <button key={c.id} onClick={() => setSel(c.id)} className="flex justify-between gap-2 px-1 pt-2 text-left">
                  <div className="truncate text-[13px] leading-4 text-ink">#{c.ref.replace("CASE-0", "T-")} · {c.title}</div>
                  <div className="shrink-0 text-xs leading-4 text-success">Solved in {fmtDur(new Date(lastM.at).getTime() - new Date(opener.at).getTime())}</div>
                </button>
              );
            })}
          </Panel>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-between gap-5 rounded-lg bg-night p-[22px]"
            style={{ backgroundImage: "radial-gradient(ellipse 70% 80% at 100% 0%, #2F6BD8 0%, #2F6BD800 65%)" }}
          >
            <div className="text-[13px] leading-4 text-[#FFFFFFB3]">Your SLA · last 30 days</div>
            <div className="flex gap-5">
              <div className="flex flex-col gap-1">
                <div className="text-[34px] font-light leading-[42px] text-paper">{avg === null ? "—" : fmtDur(avg)}</div>
                <div className="text-xs leading-4 text-[#FFFFFF99]">avg. first reply</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[34px] font-light leading-[42px] text-[#7FE0AE]">{within}%</div>
                <div className="text-xs leading-4 text-[#FFFFFF99]">within SLA</div>
              </div>
            </div>
            <div className="text-xs leading-[18px] text-[#FFFFFF8C]">If we miss the SLA, service credits are applied automatically.</div>
          </motion.div>
        </div>
      </div>

      <Dialog open={report} onClose={() => setReport(false)} title="Report an issue">
        <form onSubmit={(e) => { e.preventDefault(); submitReport(); }} className="flex flex-col gap-3">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title, e.g. Receipt printer down" className="h-11 rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-11 rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10">
            <option value="">Not about a project</option>
            {b.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="What happened? Where and since when?" className="resize-none py-3 rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <Btn type="submit" disabled={!title.trim() || !body.trim()}>Send to {firstName(advisor?.name) || "support"}</Btn>
        </form>
      </Dialog>
      {toast}
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportInner />
    </Suspense>
  );
}
