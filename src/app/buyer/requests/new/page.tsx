"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import { Arrow, Sparkle, StatusTag, dayMonth, firstName, requestThumb, useBuyer, useFlash } from "@/components/buyer/kit";

const PRESETS: { label: string; text: string }[] = [
  { label: "ERP with ZATCA e-invoicing", text: "We need an ERP for finance, inventory and procurement across 4 branches in Saudi Arabia, with ZATCA e-invoicing, live in Q2." },
  { label: "POS for 10+ stores", text: "We need POS for 12 retail stores in the UAE with offline mode, loyalty and Arabic receipts, live before March." },
  { label: "School management", text: "We run 3 schools in Qatar and need one school management system for student records, fees and parent app, Arabic and English." },
  { label: "AI customer support", text: "We need an AI agent to answer customer support chats and emails for 200 agents in the UAE, Arabic and English, hosted in-region." },
];

const CATS: [RegExp, string][] = [
  [/clinic|hospital|patient|pharmacy|emr/i, "Healthcare · clinic"],
  [/payroll|\bhr\b|staff|leave|wps/i, "HR · payroll"],
  [/pos|store|retail|shop/i, "Retail · POS"],
  [/school|campus|university|student/i, "Education"],
  [/\bai\b|agent|automation|document/i, "AI · automation"],
  [/erp|inventory|procurement|finance|invoic/i, "ERP · finance"],
];
const MUST = ["billing", "claims", "pharmacy", "payroll", "WPS", "POS", "loyalty", "offline", "inventory", "e-invoicing", "fees", "parent app", "support", "procurement"];
const COUNTRIES: [RegExp, string][] = [
  [/uae|dubai|abu dhabi|emirates|sharjah/i, "UAE"],
  [/saudi|ksa|riyadh|jeddah/i, "Saudi Arabia"],
  [/qatar|doha/i, "Qatar"],
  [/oman|muscat/i, "Oman"],
  [/kuwait/i, "Kuwait"],
  [/bahrain/i, "Bahrain"],
  [/\bus\b|usa|united states|new york/i, "United States"],
];
const COUNTRY_FULL: Record<string, string> = { UAE: "United Arab Emirates" };

type Field = "category" | "scale" | "must" | "country" | "goLive" | "budget";

function understand(text: string) {
  const category = CATS.find(([re]) => re.test(text))?.[1] ?? "";
  const scaleM = text.match(/(\d[\d,]*)\s*\+?\s*(clinics?|stores?|staff|employees|people|users|schools?|branches|sites|agents|hospitals?)/i);
  const must = MUST.filter((m) => new RegExp(m.replace("-", "[- ]?"), "i").test(text)).slice(0, 3);
  const country = COUNTRIES.find(([re]) => re.test(text))?.[1] ?? "";
  const lang = /arabic/i.test(text) ? (/english/i.test(text) ? " · Arabic + English" : " · Arabic") : "";
  const goLiveM = text.match(/(before|by|in)\s+(ramadan|q[1-4](?:\s*\d{4})?|january|february|march|april|may|june|july|august|september|october|november|december)[\w ]*/i);
  const goLive = /ramadan/i.test(goLiveM?.[0] ?? "") ? "Before 18 Feb" : goLiveM ? goLiveM[0].replace(/^\w/, (c) => c.toUpperCase()) : /live in ([\w-]+ weeks|q\d)/i.test(text) ? text.match(/live in ([\w-]+ weeks|q\d)/i)![0] : "";
  const budgetM = text.match(/\$\s?[\d,.]+k?(\s?[–-]\s?\$?\s?[\d,.]+k?)?/i);
  return {
    category,
    scale: scaleM ? `${scaleM[1]} ${scaleM[2].toLowerCase()}` : "",
    must: must.map((m, i) => (i === 0 ? m[0].toUpperCase() + m.slice(1) : m)).join(" · "),
    country: country ? country + lang : "",
    goLive,
    budget: budgetM ? budgetM[0] : "",
    users: scaleM ? scaleM[1].replace(/,/g, "") : "",
  };
}

export default function NewRequest() {
  const b = useBuyer();
  const lk = useLookup();
  const router = useRouter();
  const { flash, toast } = useFlash();
  const [text, setText] = useState("");
  const [edits, setEdits] = useState<Partial<Record<Field, string>>>({});
  const [editing, setEditing] = useState<Field | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const area = useRef<HTMLTextAreaElement>(null);

  const auto = useMemo(() => understand(text), [text]);
  const val = (f: Field) => edits[f] ?? auto[f];
  const advisor = firstName(lk.user(b.company?.advisorId)?.name) || "Your advisor";
  const matches = useMemo(() => {
    if (!text.trim()) return 0;
    const cat = val("category").toLowerCase();
    const map: Record<string, string[]> = { healthcare: ["healthcare"], hr: ["hr"], retail: ["retail"], education: ["education"], ai: ["ai"], erp: ["erp", "finance"] };
    const key = Object.keys(map).find((k) => cat.includes(k));
    const n = b.db.products.filter((p) => (p.status === "listed" || p.status === "pilot") && (!key || map[key].includes(p.category))).length;
    return key ? n : Math.min(n, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, edits, b.db.products]);

  const rows: { f: Field; label: string }[] = [
    { f: "category", label: "Category" },
    { f: "scale", label: "Scale" },
    { f: "must", label: "Must have" },
    { f: "country", label: "Country" },
    { f: "goLive", label: "Go-live" },
    { f: "budget", label: "Budget" },
  ];

  const recent = b.requests.slice(0, 2);
  const curStep = step === 3 ? 3 : text.trim().length > 20 || Object.keys(edits).length ? 2 : 1;

  const submit = () => {
    if (text.trim().length < 12) {
      flash("Tell us a little more about what you need");
      area.current?.focus();
      return;
    }
    setStep(3);
    const country = val("country").split(" · ")[0];
    const title = (val("must") ? `${val("must")}` : val("category") || "New request") + (val("scale") ? `, ${val("scale")}` : "");
    const req = b.createRequest({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      need: text.trim(),
      country: COUNTRY_FULL[country] ?? (country || b.company?.country || ""),
      budget: val("budget") || "To discuss",
      users: auto.users || "—",
      goLive: val("goLive") || "Flexible",
    });
    flash(`Request ${req.ref} sent · ${advisor} is checking your matches`);
    setTimeout(() => router.push(`/buyer/shortlist?request=${req.id}`), 700);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] leading-4 text-muted">
            <Link href="/buyer/requests" className="hover:text-ink">Requests</Link> / New
          </div>
          <h1 className="text-[32px] font-light leading-10 tracking-tight text-ink md:text-[36px] md:leading-[44px]">What do you need?</h1>
        </div>
        <div className="flex items-center gap-2">
          {["Describe", "Confirm", "Shortlist"].map((s, i) => {
            const n = i + 1;
            const on = n <= curStep;
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="h-px w-5 shrink-0 bg-[#C9D4E8] sm:w-7" />}
                <div className="flex items-center gap-1.5">
                  <div className={clsx("flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] leading-[14px]", on ? "bg-night font-bold text-paper" : "border-[1.5px] border-[#C9D4E8] font-semibold text-muted")}>{n}</div>
                  <div className={clsx("text-[13px] leading-4", n === curStep ? "font-semibold text-ink" : "hidden text-muted sm:block")}>{s}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:grow-[1.5] lg:basis-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-lg border-[1.5px] border-transparent p-6 shadow-[0_0_0_6px_#7FB6FF24] [background-clip:padding-box,border-box] [background-origin:border-box]"
            style={{ backgroundImage: "linear-gradient(#FFFFFF, #FFFFFF), conic-gradient(from 210deg at 50% 50%, #7FB6FF 0%, #1E4FA3 25%, #2F6BD8 50%, #7FB6FF 75%, #7FB6FF 100%)" }}
          >
            <textarea
              ref={area}
              value={text}
              onChange={(e) => { setText(e.target.value); setEdits({}); }}
              rows={4}
              autoFocus
              placeholder="We run 18 clinics in Dubai and Abu Dhabi. We need one system for patient billing, insurance claims and pharmacy stock, in Arabic and English, live before Ramadan."
              className="min-h-[128px] w-full resize-none bg-transparent text-lg font-light leading-8 tracking-[-0.01em] text-ink caret-primary outline-none placeholder:text-[#9AA2B4]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F4FA] pt-3.5">
              <div className="flex gap-2">
                <label className="inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-lg bg-[#F6F8FC] px-3 text-xs leading-4 text-muted hover:bg-mist">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 7" fill="none" stroke="#5B6478" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Attach brief
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.type === "text/plain") f.text().then((t) => setText((x) => (x ? x + "\n" : "") + t.slice(0, 1200)));
                      flash(`${f.name} attached`);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    type SR = { lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; start: () => void };
                    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
                    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
                    if (!Ctor) return flash("Voice input isn't supported in this browser");
                    const r = new Ctor();
                    r.lang = "en-US";
                    r.onresult = (e) => setText((x) => (x ? x + " " : "") + e.results[0][0].transcript);
                    r.start();
                    flash("Listening…");
                  }}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-[#F6F8FC] px-3 text-xs leading-4 text-muted hover:bg-mist"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="#5B6478" strokeWidth="1.75" /><path d="M5 11a7 7 0 0014 0M12 18v3" fill="none" stroke="#5B6478" strokeWidth="1.75" strokeLinecap="round" /></svg>
                  Speak
                </button>
              </div>
              <div className="text-xs leading-4 text-[#9AA2B4]">Plain words are fine</div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-2.5">
            <div className="text-[13px] leading-4 text-muted">Or start from a common need</div>
            <div className="flex flex-wrap gap-2.5">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setText(p.text); setEdits({}); area.current?.focus(); }} className="rounded-lg border border-[#E3E9F4] bg-paper px-3.5 py-[9px] text-[13px] leading-4 text-ink transition-colors hover:border-primary">
                  {p.label}
                </button>
              ))}
            </div>
            {recent.length > 0 && (
              <div className="mt-3.5 flex flex-col rounded-lg bg-paper px-5 py-1.5">
                {recent.map((r, i) => (
                  <Link key={r.id} href={r.status === "won" ? "/buyer/projects" : `/buyer/shortlist?request=${r.id}`} className={clsx("flex items-center gap-3.5 py-3.5", i < recent.length - 1 && "border-b border-[#F1F4FA]")}>
                    <Image src={requestThumb(r)} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-cover" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="truncate text-sm font-medium leading-[18px] text-ink">{r.title}</div>
                      <div className="text-xs leading-4 text-muted">Sent {dayMonth(r.createdAt)}</div>
                    </div>
                    <StatusTag status={r.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex min-w-0 flex-col gap-3.5 overflow-clip rounded-lg bg-night p-6 lg:grow lg:basis-0"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 100% 0%, #2F6BD8 0%, #2F6BD800 70%)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkle />
            <div className="text-sm font-semibold leading-[18px] text-paper">What we understood</div>
          </div>
          <div className="flex flex-col gap-0.5">
            {rows.map(({ f, label }, i) => {
              const v = val(f);
              return (
                <div key={f} className={clsx("flex items-center justify-between gap-4 py-3", i < rows.length - 1 && "border-b border-[#FFFFFF1A]")}>
                  <div className="shrink-0 text-[13px] leading-4 text-[#FFFFFF99]">{label}</div>
                  {editing === f ? (
                    <input
                      autoFocus
                      defaultValue={v}
                      onBlur={(e) => { setEdits((x) => ({ ...x, [f]: e.target.value })); setEditing(null); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className="min-w-0 flex-1 rounded-lg bg-[#FFFFFF14] px-2 py-1 text-right text-[13px] font-medium leading-4 text-paper outline-none"
                    />
                  ) : v ? (
                    <button onClick={() => setEditing(f)} className="min-w-0 truncate text-right text-[13px] font-medium leading-4 text-paper hover:text-glow-amber">{v}</button>
                  ) : (
                    <button onClick={() => setEditing(f)} className="rounded-lg border border-dashed border-[#FFD58A99] px-2.5 py-1 text-[13px] font-semibold leading-4 text-glow-amber">
                      {f === "budget" ? "Add a range" : "Add"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-[#FFFFFF0F] p-3.5">
            <div className="text-[28px] font-light leading-[34px] text-paper">{matches}</div>
            <div className="text-[13px] leading-[18px] text-[#FFFFFFBF]">verified products already match. {advisor} will check them before you see any.</div>
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-2">
            <button
              onClick={submit}
              disabled={step === 3}
              className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] text-[15px] font-semibold leading-[18px] text-paper shadow-[inset_0_1px_0_#FFFFFF4D,0_12px_28px_-10px_#4C85EEE6] transition hover:brightness-110 disabled:opacity-60"
            >
              {step === 3 ? "Sending…" : "Get my shortlist"} <Arrow color="#FFFFFF" />
            </button>
            <div className="text-center text-xs leading-4 text-[#FFFFFF8C]">Tap any line to edit it</div>
          </div>
        </motion.div>
      </div>
      {toast}
    </div>
  );
}
