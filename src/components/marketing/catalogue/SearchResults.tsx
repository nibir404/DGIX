"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Category, Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Toast } from "@/components/portal/ui";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CAT_LABEL, MARKETS, chipFor, isPublic } from "./data";
import { AdvisorCard, Svg, Visual } from "./ui";

const CAT_WORDS: Record<Category, string[]> = {
  hr: ["hr", "payroll", "staff", "employee", "employees", "people", "leave", "attendance", "recruitment", "gosi", "wps", "payslip", "payslips"],
  erp: ["erp", "finance", "inventory", "procurement", "accounting", "vat", "invoice", "invoicing", "sme", "smes"],
  finance: ["accounting", "ledger", "vat", "finance", "consolidation"],
  crm: ["crm", "sales", "customers"],
  retail: ["retail", "pos", "store", "stores", "shop", "loyalty", "stock"],
  healthcare: ["clinic", "clinics", "hospital", "health", "healthcare", "emr", "pharmacy", "patient", "medical", "billing", "insurance"],
  education: ["school", "schools", "university", "campus", "education", "students", "lms", "exam"],
  ai: ["ai", "automation", "agent", "agents", "documents", "document", "agentic", "ocr"],
  services: ["engineers", "services", "team", "migration", "integration"],
  custom: ["custom", "bespoke"],
};
const PLACE: { words: string[]; code: string }[] = [
  { words: ["riyadh", "jeddah", "saudi", "ksa", "dammam"], code: "KSA" },
  { words: ["uae", "dubai", "abu", "dhabi", "sharjah", "emirates"], code: "UAE" },
  { words: ["qatar", "doha"], code: "Qatar" },
  { words: ["usa", "us", "america", "states", "new", "york", "texas"], code: "USA" },
];
const EXTRA = ["gosi", "wps", "arabic", "payslips", "fhir", "hl7", "vat", "e-invoicing", "offline", "loyalty"];

function understand(q: string) {
  const t = q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  const cats = (Object.keys(CAT_WORDS) as Category[]).map((c) => ({ c, n: t.filter((w) => CAT_WORDS[c].includes(w)).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const place = PLACE.find((p) => t.some((w) => p.words.includes(w)))?.code;
  const staff = q.match(/(\d[\d,]*)\s*(staff|employees|people|users|seats)/i);
  const extras = EXTRA.filter((e) => t.includes(e));
  return { tokens: t, cat: cats[0]?.c, cats: cats.map((x) => x.c), place, staff: staff ? staff[1] : undefined, extras };
}

function rank(p: Product, u: ReturnType<typeof understand>) {
  const hay = [p.name, p.tagline, p.description, p.category, CAT_LABEL[p.category], ...p.markets].join(" ").toLowerCase();
  let pts = 0;
  for (const w of u.tokens) if (w.length > 2 && hay.includes(w)) pts += 6;
  if (u.cat && p.category === u.cat) pts += 30;
  else if (u.cats.includes(p.category)) pts += 14;
  if (u.place && p.markets.includes(u.place)) pts += 12;
  if (p.status === "pilot") pts -= 6;
  if (pts <= 0) return 0;
  return Math.max(40, Math.min(97, 48 + pts));
}

type Row = { label: string; tone: "ok" | "muted" | "gap"; value: string };

function rowsFor(p: Product, u: ReturnType<typeof understand>, place: string): Row[] {
  const placeName = MARKETS.find((m) => m.code === place)?.name ?? place;
  const want = u.cat ? CAT_LABEL[u.cat] : "Your need";
  const sameCat = !u.cat || p.category === u.cat;
  const rows: Row[] = [
    { label: u.staff ? `${want} for ${u.staff}+ ${u.cat === "hr" ? "staff" : "users"}` : want, tone: sameCat ? "ok" : "gap", value: sameCat ? "Verified" : `Gap · ${CAT_LABEL[p.category]} product` },
  ];
  const ex = u.extras.filter((e) => e !== "arabic").slice(0, 1);
  for (const e of ex) {
    const has = (p.tagline + p.description).toLowerCase().includes(e);
    rows.push({ label: `${e.toUpperCase()} ${e === "gosi" ? "submissions" : "support"}`, tone: has ? "ok" : "muted", value: has ? "Verified" : "Declared" });
  }
  const arabic = (p.tagline + p.description).toLowerCase().includes("arabic");
  rows.push({ label: u.extras.includes("payslips") ? "Arabic payslips" : "Arabic interface", tone: "muted", value: arabic ? "Declared" : "Declared" });
  const ready = p.markets.includes(place);
  rows.push({
    label: `Ready in ${placeName}`,
    tone: p.status === "pilot" ? "gap" : ready ? "ok" : "gap",
    value: p.status === "pilot" ? `Pilot · ${p.checks.reduce((s, c) => s + c.score, 0)}` : ready ? "Verified" : "Gap · not yet listed",
  });
  return rows.slice(0, 4);
}

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const { db, user, bookDemo, createRequest } = useStore();
  const q = params.get("q") ?? "";
  const [text, setText] = useState(q);
  const u = useMemo(() => understand(q), [q]);
  const [place, setPlace] = useState<string>(u.place ?? "UAE");
  const [pilots, setPilots] = useState(true);
  const [cloud, setCloud] = useState(true);
  const [onPrem, setOnPrem] = useState(false);
  const [global, setGlobal] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setText(q);
    setPlace(u.place ?? "UAE");
  }, [q, u.place]);

  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 3400);
  };

  const pub = db.products.filter(isPublic);
  const scored = pub
    .map((p) => ({ p, fit: q ? rank(p, u) : 60 }))
    .filter((x) => x.fit > 0 && (pilots || x.p.status !== "pilot"));
  const inPlace = scored.filter((x) => x.p.markets.includes(place) || x.p.status === "pilot");
  const results = inPlace.sort((a, b) => b.fit - a.fit).slice(0, 5);
  const hidden = scored.length - inPlace.length;
  const placeName = MARKETS.find((m) => m.code === place)?.name ?? place;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(text.trim())}`);
  };

  const signIn = () => router.push(`/sign-in?next=${encodeURIComponent(`/search?q=${encodeURIComponent(q)}`)}`);
  const demo = (p: Product) => {
    if (!user) return signIn();
    if (user.role !== "buyer") return flash("Demos are requested from a buyer account.");
    bookDemo(p.id);
    flash(`Demo requested · ${p.name}`);
  };
  const advisor = () => {
    if (!user) return signIn();
    if (user.role !== "buyer") return flash("Requests are sent from a buyer account.");
    const r = createRequest({
      title: (q || "New need").slice(0, 60),
      need: q || "Help me find the right product.",
      country: placeName,
      budget: "To confirm",
      users: u.staff ?? "To confirm",
      goLive: "To confirm",
    });
    flash(`Sent to Asha · ${r.ref}`);
  };

  const chips = [u.cat && CAT_LABEL[u.cat], u.staff && `${u.staff} staff`, u.place && MARKETS.find((m) => m.code === u.place)?.name, ...u.extras.map((e) => (e === "payslips" ? "Arabic payslips" : e === "arabic" ? "Arabic" : e.toUpperCase()))].filter(
    (x, i, a): x is string => !!x && a.indexOf(x) === i && !(x === "Arabic" && a.includes("Arabic payslips")),
  );

  return (
    <>
      <section className="relative mx-2 mt-2 overflow-hidden rounded-lg bg-night-hero text-white md:mx-4 md:mt-4">
        <SiteNav />
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 pb-10 pt-8 md:px-10 md:pb-[44px] md:pt-12">
          <form
            onSubmit={submit}
            className="flex w-full max-w-[900px] rounded-lg bg-[conic-gradient(from_210deg_at_50%_50%,#7FB6FF_0%,#1E4FA3_25%,#F6A11A_50%,#FFD58A_75%,#7FB6FF_100%)] p-[2px] shadow-[0_0_0_6px_#7FB6FF1F,0_0_48px_6px_#7FB6FF59,0_0_90px_10px_#F6A11A2E]"
          >
            <div className="flex h-16 flex-1 items-center gap-[14px] rounded-lg bg-[linear-gradient(90deg,#0E1E40_0%,#142B57_100%)] pl-5 pr-2 md:h-[76px] md:pl-[26px] md:pr-[10px]">
              <Svg name="sparkle" size={20} color="#FFD58A" />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe what you need…"
                className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-white caret-sky outline-none placeholder:text-white/50 md:text-[18px]"
              />
              <button type="submit" className="flex h-12 shrink-0 items-center gap-[10px] rounded-lg bg-[linear-gradient(180deg,#3A72DC_0%,#1E4FA3_100%)] px-4 shadow-[inset_0_1px_0_#FFFFFF59,0_8px_24px_#1E4FA38C] md:h-14 md:px-6">
                <span className="hidden text-base font-semibold leading-5 sm:inline">Find my match</span>
                <Svg name="arrowR" size={18} color="#fff" />
              </button>
            </div>
          </form>
          {q && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Svg name="sparkle" size={18} color="#FFD58A" />
              <span className="text-sm leading-[18px] text-white/65">AI understood</span>
              {chips.map((c) => (
                <span key={c} className="flex h-8 items-center rounded-lg border border-[#7FB6FF59] bg-[#7FB6FF26] px-[14px] text-[13px] leading-4 text-[#C9DCFF]">
                  {c}
                </span>
              ))}
              <Link href="/buyer/requests/new" className="flex h-8 items-center rounded-lg border border-dashed border-[#FFD58A99] px-[14px] text-[13px] leading-4 text-glow-amber">
                + add budget
              </Link>
              <Link href="/buyer/requests/new" className="flex h-8 items-center rounded-lg border border-dashed border-[#FFD58A99] px-[14px] text-[13px] leading-4 text-glow-amber">
                + add go-live date
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-2 flex flex-col gap-10 px-2 pb-20 pt-10 md:mx-4 md:px-10 md:pb-24 md:pt-12 lg:flex-row lg:gap-14">
        {/* Filters */}
        <aside className="flex w-full shrink-0 flex-col gap-7 lg:w-[280px]">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium leading-[22px] text-ink">Refine</span>
            <button
              onClick={() => {
                setPlace(u.place ?? "UAE");
                setPilots(true);
                setCloud(true);
                setOnPrem(false);
                setGlobal(true);
              }}
              className="text-[13px] leading-4 text-muted underline underline-offset-2"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium leading-4 text-muted">Ready in</span>
            <div className="flex flex-wrap gap-2">
              {[...MARKETS].sort((a, b) => (a.code === u.place ? -1 : b.code === u.place ? 1 : 0)).map((m) => (
                <button
                  key={m.code}
                  onClick={() => setPlace(m.code)}
                  className={clsx("rounded-lg px-[14px] py-2 text-[13px] leading-4", place === m.code ? "bg-ink font-semibold text-white" : "border border-line text-ink")}
                >
                  {m.code === "KSA" ? "Saudi Arabia" : m.code}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium leading-4 text-muted">Deployment</span>
            <Check on={cloud} set={setCloud} label="Cloud" />
            <Check on={onPrem} set={setOnPrem} label="On-premise" />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium leading-4 text-muted">Trust level</span>
            <Check on={global} set={setGlobal} label="Globally ready · 100" />
            <Check on={pilots} set={setPilots} label="Include pilots" />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium leading-4 text-muted">Budget (USD / year)</span>
            <div className="flex h-[6px] shrink-0 rounded-lg bg-mist">
              <div className="ml-[15%] w-[55%] rounded-lg bg-[linear-gradient(90deg,#7FB6FF_0%,#1E4FA3_100%)]" />
            </div>
            <div className="flex justify-between text-[13px] leading-4 text-ink">
              <span>$15k</span>
              <span>$60k</span>
            </div>
          </div>
          <AdvisorCard href={user?.role === "buyer" ? "/buyer/support" : "/contact"} />
        </aside>

        {/* Results */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-col gap-3 pb-1 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-[36px] font-light leading-[42px] tracking-tight text-ink md:text-[44px] md:leading-[48px]">
                {results.length} verified {results.length === 1 ? "match" : "matches"}
              </h1>
              <p className="text-sm leading-[18px] text-muted">Ranked by fit to your need · checked by Asha, your advisor</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={advisor} className="flex h-10 items-center gap-2 rounded-lg border-[1.5px] border-ink px-4 text-sm font-semibold text-ink hover:bg-ink hover:text-white">
                <Svg name="chat" size={16} />
                Send to an advisor
              </button>
              <span className="flex items-center gap-2 text-sm leading-[18px]">
                <span className="text-muted">Sort</span>
                <span className="font-semibold text-ink">Best fit</span>
              </span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {results.map(({ p, fit }, i) => {
              const top = i === 0;
              const label = top ? "Best match" : p.status === "pilot" ? "Pilot" : fit >= 75 ? "Strong match" : "Partial match";
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={clsx(
                    "flex flex-col gap-6 rounded-lg bg-paper p-4 md:flex-row lg:flex-col xl:flex-row",
                    top ? "border-[1.5px] border-sky shadow-[0_0_0_6px_#7FB6FF1F,0_30px_60px_-30px_#0C1F4559]" : "border border-mist shadow-[0_24px_48px_-32px_#0C1F4559]",
                  )}
                >
                  <Link href={`/products/${p.slug}`} className="block w-full shrink-0 md:w-[300px] lg:w-full xl:w-[340px]">
                    <Visual p={p} className="h-[240px] rounded-lg md:h-full md:min-h-[320px]" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-[18px] md:py-3 md:pr-3">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {top ? (
                            <span className="flex h-[26px] items-center gap-[6px] rounded-lg bg-[linear-gradient(135deg,#FFD58A_0%,#F6A11A_100%)] px-[10px]">
                              <Svg name="sparkle" size={14} color="#08152F" width={2} />
                              <span className="text-xs font-semibold leading-4 text-night">{label}</span>
                            </span>
                          ) : (
                            <span className={clsx("flex h-[26px] items-center rounded-lg px-[10px] text-xs font-semibold leading-4", p.status === "pilot" ? "bg-mist text-ink" : "bg-mist text-primary")}>{label}</span>
                          )}
                          <span className="text-[13px] leading-4 text-muted">
                            {chipFor(p.category)?.label ?? CAT_LABEL[p.category]} · v{p.version}
                          </span>
                        </div>
                        <Link href={`/products/${p.slug}`} className="min-w-0 break-words text-[28px] font-light leading-[36px] tracking-[-0.03em] text-ink md:text-[32px] md:leading-[40px]">
                          {p.name}
                        </Link>
                      </div>
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="text-[44px] font-light leading-[48px] tracking-[-0.05em] text-ink md:text-[52px] md:leading-[52px]">{fit}%</span>
                        <span className="text-[13px] leading-4 text-muted">fit to your need</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[10px] rounded-lg bg-[#F6F8FC] px-[18px] py-4">
                      {rowsFor(p, u, place).map((r) => (
                        <div key={r.label} className="flex items-center justify-between gap-3">
                          <span className="text-[15px] leading-[18px] text-ink">{r.label}</span>
                          <span className={clsx("shrink-0 text-right text-[13px] font-semibold leading-4", r.tone === "ok" ? "text-success" : r.tone === "gap" ? "text-warning" : "text-muted")}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD58A_0%,#F6A11A_100%)] text-[11px] font-bold leading-[14px] text-night">AS</span>
                        <span className="text-[13px] leading-4 text-muted">Confirmed by Asha · 2h ago</span>
                      </div>
                      <div className="flex flex-wrap gap-[10px]">
                        <Link href={`/products/${p.slug}`} className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border-[1.5px] border-ink px-5 text-[15px] font-semibold leading-[18px] text-ink sm:flex-none">
                          View passport
                        </Link>
                        <button
                          onClick={() => demo(p)}
                          className={clsx(
                            "inline-flex h-12 flex-1 items-center justify-center rounded-lg px-[22px] text-[15px] font-semibold leading-[18px] sm:flex-none",
                            top ? "bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] text-white shadow-[inset_0_1px_0_#FFFFFF66,0_12px_28px_-10px_#1E4FA3B3]" : "border-[1.5px] border-ink text-ink",
                          )}
                        >
                          Request demo
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line px-6 py-14 text-center">
              <p className="text-muted">No verified product matches {q ? `“${q}”` : "yet"} in {placeName}. An advisor can check partners under review.</p>
              <button onClick={advisor} className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white">
                Send to an advisor
              </button>
            </div>
          )}

          {hidden > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-mist px-5 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <Svg name="info" size={18} color="#5B6478" />
                <span className="text-sm leading-[18px] text-ink">
                  {hidden} {hidden === 1 ? "product" : "products"} hidden: not verified for {placeName} yet.
                </span>
              </div>
              <Link href="/how-it-works" className="shrink-0 text-[13px] font-semibold text-ink underline underline-offset-2">
                Show why
              </Link>
            </div>
          )}
        </div>
      </section>
      <Toast show={!!toast}>{toast}</Toast>
    </>
  );
}

function Check({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-[10px] text-left">
      <span className={clsx("flex size-5 shrink-0 items-center justify-center rounded-lg", on ? "bg-primary" : "border-[1.5px] border-[#9AA2B4]")}>
        {on && <Svg name="check" size={12} color="#fff" width={3} />}
      </span>
      <span className="text-[15px] leading-[18px] text-ink">{label}</span>
    </button>
  );
}
