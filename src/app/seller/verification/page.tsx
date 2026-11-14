"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { GATES } from "@/lib/seed";
import type { Check, Product } from "@/lib/types";
import { Empty } from "@/components/portal/ui";
import { BTN_GRADIENT, Head, Panel, ProductTabs, pendingChecks, scoreOf, useFlash, useSeller } from "@/components/seller/kit";
import { Icon } from "@/components/ui/Icon";

const STEPS = ["Application", "Documents", "Product demo", "Technical review", "Agreement", "Listed"];

const EVIDENCE: Record<string, { title: string; body: string }> = {
  quality: { title: "Release & delivery record", body: "Release notes and delivery history for the last 12 months. PDF, max 20 MB." },
  evidence: { title: "Customer references", body: "Signed references or case studies from live customers. PDF, max 20 MB." },
  security: { title: "Penetration test report", body: "A test by an independent firm, done in the last 12 months. PDF, max 20 MB." },
  legal: { title: "Proof of IP ownership", body: "Company registration and source-code ownership documents. PDF, max 20 MB." },
  pricing: { title: "Price list & economics", body: "Your list prices and discount rules for DGIX buyers. PDF or XLSX." },
  support: { title: "Support & continuity plan", body: "Support hours, escalation path and escrow / continuity terms. PDF." },
  docs: { title: "Documentation & demo", body: "User and API docs, plus a recorded demo link. PDF or URL." },
};

export default function VerificationPage() {
  const { products, focus, uploadEvidence } = useSeller();
  const { flash, toast } = useFlash();
  const [sel, setSel] = useState<string>();
  const p = products.find((x) => x.id === sel) ?? focus;

  if (!p) return <Empty title="No products in verification" body="Start a product passport to begin the six gates." />;

  const pending = pendingChecks(p);
  const complete = scoreOf(p) >= 100;
  const gateIdx = complete ? 6 : GATES.findIndex((g) => g.id === p.gate);

  const send = (c: Check, what: string) => {
    uploadEvidence(p.id, c.key);
    flash(`${what} sent · DGIX reviews within 2 working days`);
  };

  return (
    <div className="flex flex-col gap-5">
      <Head kicker={<>{p.name} · reviewed by DGIX</>} title="Verification" right={<ProductTabs products={products} value={p.id} onChange={setSel} />} />

      {/* Gate progress PG0–PG5 */}
      <Panel className="grid grid-cols-2 gap-y-6 rounded-lg bg-paper p-6 sm:grid-cols-3 md:p-7 lg:flex lg:items-start">
        {STEPS.map((label, i) => {
          const done = i < gateIdx;
          const current = i === gateIdx;
          const last = i === STEPS.length - 1;
          const line = i + 1 < gateIdx ? "bg-success" : i + 1 === gateIdx && !complete ? "bg-[linear-gradient(90deg,#14804A_0%,#2F6BD8_100%)]" : done && i + 1 <= gateIdx ? "bg-success" : "bg-[#E3E9F4]";
          return (
            <div key={label} className={clsx("flex flex-col gap-[10px]", last ? "lg:w-[120px] lg:shrink-0" : "lg:grow lg:basis-0")}>
              <div className="flex items-center">
                <div
                  className={clsx(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs leading-4",
                    done && "bg-success text-paper",
                    current && "bg-amber font-bold text-paper shadow-[0_0_0_6px_#2F6BD82E]",
                    !done && !current && "border-[1.5px] border-[#C9D4E8] text-[#9AA2B4]",
                  )}
                >
                  {done ? "✓" : i + 1}
                </div>
                {!last && <div className={clsx("hidden h-[2px] grow basis-0 lg:block", line)} />}
              </div>
              <div className={clsx("text-sm leading-[18px]", done || current ? "font-semibold text-ink" : "text-muted")}>{label}</div>
              <div className={clsx("text-xs leading-4", done ? "text-muted" : current ? "text-warning" : "text-[#9AA2B4]")}>
                {done ? `${GATES[i].id} · passed` : current ? `${pending.length} item${pending.length === 1 ? "" : "s"} open` : i === gateIdx + 1 ? "Next" : last ? "Goes live" : GATES[i].id}
              </div>
            </div>
          );
        })}
      </Panel>

      {pending.length === 0 ? (
        <Empty title="All eight checks passed" body={`${p.name} scored 100/100 and is listed for buyers.`} action={<Link href="/seller/products" className="text-sm font-semibold text-primary">View passport →</Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pending.map((c) => (c.key === "readiness" ? <ResidencyCard key={c.key} p={p} c={c} onSave={(a) => send(c, `Answer “${a}”`)} /> : <UploadCard key={c.key} c={c} onFile={(n) => send(c, n)} />))}
        </div>
      )}
      {toast}
    </div>
  );
}

function CardHead({ title, c }: { title: string; c: Check }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-base font-semibold leading-5 text-ink">{title}</div>
      <span className="shrink-0 rounded-lg bg-[#FFF3DC] px-[10px] py-1 text-xs font-semibold leading-4 text-warning">+{c.max - c.score} points</span>
    </div>
  );
}

function Uploaded({ c }: { c: Check }) {
  return c.note?.startsWith("Uploaded") ? <div className="inline-flex items-center gap-1.5 text-[13px] font-medium leading-4 text-success"><Icon name="check" size={14} /> {c.note}</div> : null;
}

function UploadCard({ c, onFile }: { c: Check; onFile: (name: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const meta = EVIDENCE[c.key] ?? { title: c.label, body: "Upload supporting evidence. PDF, max 20 MB." };
  const take = (f?: File) => f && onFile(f.name);
  return (
    <Panel className="flex flex-col gap-4 bg-paper p-6">
      <CardHead title={meta.title} c={c} />
      <div className="text-sm leading-5 text-muted">{c.note && !c.note.startsWith("Uploaded") ? `${c.note}. ` : ""}{meta.body}</div>
      <button
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
        className={clsx("flex h-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed bg-[#F9FAFD] transition", drag ? "border-primary bg-mist" : "border-[#C9D4E8] hover:border-primary")}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-mist text-primary"><Icon name="upload" size={20} /></span>
        <span className="text-sm leading-[18px] text-ink">
          Drop file or <span className="font-semibold text-primary">browse</span>
        </span>
      </button>
      <input ref={input} type="file" accept=".pdf,.xlsx,.doc,.docx" className="hidden" onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
      {!c.note?.startsWith("Uploaded") && (
        <button type="button" onClick={() => onFile(`${c.key}-evidence.pdf`)} className="-mt-1 self-start text-xs font-medium text-primary hover:underline">
          Use sample document
        </button>
      )}
      <Uploaded c={c} />
    </Panel>
  );
}

function ResidencyCard({ p, c, onSave }: { p: Product; c: Check; onSave: (answer: string) => void }) {
  const m = p.markets[0] ?? "UAE";
  const opts = [`In the ${m} (${m === "UAE" ? "Azure UAE North" : m === "KSA" ? "Azure KSA Central" : "in-region cloud"})`, `Outside the ${m}`];
  const [v, setV] = useState(0);
  return (
    <Panel className="flex flex-col gap-4 bg-paper p-6">
      <CardHead title={`${m} data residency`} c={c} />
      <div className="text-sm leading-5 text-muted">Tell us where {m} customer data is stored.</div>
      <div className="flex flex-col gap-2" role="radiogroup">
        {opts.map((o, i) => (
          <button key={o} role="radio" aria-checked={v === i} onClick={() => setV(i)} className={clsx("flex items-center gap-3 rounded-lg p-[14px] text-left transition", v === i ? "border-[1.5px] border-primary bg-mist" : "border border-[#E3E9F4] hover:border-[#C9D4E8]")}>
            <span className={clsx("size-[18px] shrink-0 rounded-lg", v === i ? "border-[5px] border-primary bg-paper" : "border-[1.5px] border-[#C9D4E8]")} />
            <span className="text-sm leading-[18px] text-ink">{o}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onSave(opts[v])} className={clsx("inline-flex h-[42px] shrink-0 items-center self-start rounded-lg px-5 text-[13px] font-semibold leading-4 text-paper hover:brightness-110", BTN_GRADIENT)}>
        Save answer
      </button>
      <Uploaded c={c} />
    </Panel>
  );
}
