"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Toast, dateLong, dateShort } from "@/components/portal/ui";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Reveal } from "@/components/marketing/Reveal";
import { CAT_LABEL, MARKETS, chipFor, score } from "@/components/marketing/catalogue/data";
import { AdvisorCard, Svg } from "@/components/marketing/catalogue/ui";

type Badge = "verified" | "certified" | "declared" | "review";
const CLAIMS: Record<string, { label: string; badge: Badge }[]> = {
  "smart-hospital": [
    { label: "Multi-clinic billing with insurance claims", badge: "verified" },
    { label: "Electronic medical records, HL7 / FHIR", badge: "verified" },
    { label: "ISO 27001 information security", badge: "certified" },
    { label: "Arabic interface", badge: "declared" },
    { label: "Live in 40+ clinics across Bangladesh", badge: "verified" },
  ],
};
const LIMITS: Record<string, string> = {
  "smart-hospital": "Custom reports need configuration. Arabic is declared by the partner and will be checked in your demo.",
};

function claimsFor(p: Product) {
  if (CLAIMS[p.slug]) return CLAIMS[p.slug];
  return p.checks.map((c) => ({
    label: c.score >= c.max ? c.label : `${c.label}${c.note ? ` — ${c.note}` : ""}`,
    badge: (c.score >= c.max ? (c.key === "security" ? "certified" : "verified") : "review") as Badge,
  }));
}

function BadgePill({ b }: { b: Badge }) {
  const map = {
    verified: { bg: "bg-[#E6F4EC]", color: "#14804A", text: "text-success", icon: "shieldCheck", label: "Verified" },
    certified: { bg: "bg-mist", color: "#1E4FA3", text: "text-primary", icon: "star", label: "Certified" },
    declared: { bg: "border border-line", color: "#5B6478", text: "text-muted", icon: "info", label: "Declared" },
    review: { bg: "bg-[#FFF4E0]", color: "#B86E00", text: "text-[#8A5300]", icon: "clock", label: "In review" },
  }[b];
  return (
    <div className={clsx("flex h-[30px] shrink-0 items-center gap-[6px] rounded-lg pl-2 pr-3", map.bg)}>
      <Svg name={map.icon} size={16} color={map.color} />
      <span className={clsx("text-[13px] font-semibold leading-4", map.text)}>{map.label}</span>
    </div>
  );
}

const marketNames = (p: Product) => p.markets.map((c) => MARKETS.find((m) => m.code === c)?.code ?? c);

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { db, user, bookDemo } = useStore();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const p = db.products.find((x) => x.slug === slug);
  const partner = db.companies.find((c) => c.id === p?.partnerId);

  if (!p) {
    return (
      <>
        <section className="relative mx-2 mt-2 overflow-hidden rounded-lg bg-night-hero text-white md:mx-4 md:mt-4">
          <SiteNav />
          <div className="px-6 pb-14 pt-10 md:px-10 md:pt-16">
            <h1 className="text-[44px] font-light leading-[46px] tracking-[-0.05em] md:text-[72px] md:leading-[72px]">Product not found.</h1>
          </div>
        </section>
        <div className="px-6 py-16 md:px-14">
          <Link href="/solutions" className="text-primary underline">
            Back to all solutions
          </Link>
        </div>
      </>
    );
  }

  const s = score(p);
  const chip = chipFor(p.category);
  const full = p.checks.filter((c) => c.score >= c.max).length;
  const listed = p.status === "listed";
  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 3200);
  };
  const requestDemo = () => {
    if (!user) return router.push(`/sign-in?next=${encodeURIComponent(`/products/${p.slug}`)}`);
    if (user.role !== "buyer") return flash("Demos are requested from a buyer account.");
    bookDemo(p.id);
    flash(`Demo requested · ${p.name}. Your advisor will confirm a time.`);
  };

  const steps = [
    { title: "Passport approved", sub: p.reviewedOn ? dateShort(p.reviewedOn) : "Pending", done: !!p.reviewedOn },
    { title: `Claims verified · ${full}/${p.checks.length}`, sub: "Independent reviewer", done: full === p.checks.length },
    { title: "Live demo run", sub: listed ? "Run by DGIX · passed" : "Scheduled", done: listed, bold: true },
    { title: `Readiness score · ${s}/100`, done: s >= 90 },
    { title: `${listed ? "Listed" : p.status === "pilot" ? "Pilot" : "In review"} · ${p.markets.join(", ")}`, done: listed },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative mx-2 mt-2 overflow-hidden rounded-lg bg-night-hero text-white md:mx-4 md:mt-4">
        <SiteNav />
        <div className="relative z-10 flex flex-col gap-10 px-6 pb-10 pt-10 lg:flex-row lg:items-end lg:gap-12 md:px-10 md:pb-12 md:pt-14">
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm leading-[18px]">
              <Link href="/solutions" className="text-white/60 hover:text-white">
                Solutions
              </Link>
              <Svg name="chevR" size={14} color="rgb(255 255 255 / 50%)" />
              <Link href={`/solutions/${chip?.slug ?? ""}`} className="text-white/60 hover:text-white">
                {chip?.label ?? CAT_LABEL[p.category]}
              </Link>
              <Svg name="chevR" size={14} color="rgb(255 255 255 / 50%)" />
              <span className="text-white">{p.name}</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-4 md:gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[radial-gradient(ellipse_80%_90%_at_100%_0%,#7FB6FF_0%,#7FB6FF00_60%),linear-gradient(135deg,#163C7E_0%,#2F6BD8_100%)] shadow-[inset_0_1px_0_#FFFFFF4D] md:size-20">
                <Svg name="pulse" size={24} color="#fff" />
              </div>
              <h1 className="min-w-0 break-words text-[40px] font-light leading-[44px] tracking-[-0.05em] sm:text-[44px] md:text-[88px] md:leading-[88px]">{p.name}</h1>
            </motion.div>
            <p className="max-w-[600px] text-[17px] font-light leading-[26px] text-white/78 md:text-[19px] md:leading-[29px]">
              {p.tagline.replace(/\.$/, "")}. Delivered and supported by DGIX with {partner?.name ?? "a verified partner"}.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                onClick={requestDemo}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#3A72DC_0%,#1E4FA3_100%)] px-[26px] shadow-[inset_0_1px_0_#FFFFFF59,0_8px_24px_#1E4FA399] transition-transform hover:-translate-y-0.5"
              >
                <Svg name="video" size={20} color="#fff" />
                <span className="text-base font-semibold leading-5 text-white">Request a live demo</span>
              </button>
              <Link href={`/solutions/${chip?.slug ?? ""}`} className="inline-flex h-14 items-center justify-center rounded-full border border-white/22 bg-white/8 px-6 hover:bg-white/14">
                <span className="text-base font-medium leading-5 text-white">Compare with similar</span>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex w-full shrink-0 flex-col gap-[18px] rounded-lg border border-white/16 bg-white/7 p-7 lg:w-[360px]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7FB6FF_0%,#2F6BD8_100%)]">
                <Svg name="check" size={20} color="#08152F" width={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-5 text-white">{listed ? "Daffodil Verified" : p.status === "pilot" ? "Verified pilot" : "Under review"}</span>
                <span className="text-[13px] leading-4 text-white/65">{p.reviewedOn ? `Reviewed ${dateLong(p.reviewedOn)}` : `Gate ${p.gate}`}</span>
              </div>
            </div>
            <div className="text-[72px] font-light leading-[72px] tracking-[-0.05em] text-white">
              {s}
              <span className="text-[28px] tracking-[-0.05em] text-white/55">/100</span>
            </div>
            <div className="flex flex-col gap-[10px] border-t border-white/14 pt-4 text-sm leading-[18px]">
              {[
                ["Ready in", marketNames(p).join(" · ")],
                ["Version", p.version],
                ["Typical go-live", p.goLive],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-white/70">{k}</span>
                  <span className="font-medium text-white">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-2 flex flex-col items-start gap-14 px-4 pb-20 pt-14 md:mx-4 md:px-10 md:pb-24 md:pt-20 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-16">
          <Reveal className="flex flex-col gap-6">
            <h2 className="text-[32px] font-light leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-12">Every claim, labelled.</h2>
            <div className="flex flex-col border-t border-ink">
              {claimsFor(p).map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-4 border-b border-mist py-5">
                  <span className="min-w-0 text-[17px] leading-[22px] text-ink">{c.label}</span>
                  <BadgePill b={c.badge} />
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="flex flex-col gap-6">
            <h2 className="text-[32px] font-light leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-12">What your offer will include.</h2>
            <div className="flex flex-col gap-4 md:flex-row">
              {[
                { icon: "card", t: "Exact price", d: "Annual licence per user, implementation per project." },
                { icon: "clock", t: "Signed SLA", d: "1 business-day response, 99.5% uptime." },
                { icon: "shield", t: "Warranty & exit", d: "12-month warranty. Your data exported if you leave." },
              ].map((x) => (
                <div key={x.t} className="flex flex-1 flex-col gap-3 rounded-lg bg-[#F6F8FC] p-6">
                  <Svg name={x.icon} size={24} color="#0C1F45" />
                  <div className="text-[17px] font-medium leading-[22px] text-ink">{x.t}</div>
                  <div className="text-sm leading-[22px] text-muted">{x.d}</div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-[#F3D9B0] bg-[#FFFBF4] px-5 py-[18px]">
              <Svg name="info" size={20} color="#B86E00" />
              <div className="text-sm leading-[22px] text-[#6B4A12]">
                <span className="font-semibold">Known limits.</span>{" "}
                {LIMITS[p.slug] ?? (p.checks.filter((c) => c.note).map((c) => c.note).join(". ") || "Custom reports need configuration. Anything declared by the partner will be checked in your demo.")}
              </div>
            </div>
          </Reveal>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-5 lg:sticky lg:top-6 lg:w-[400px]">
          <AdvisorCard href={user?.role === "buyer" ? "/buyer/support" : "/contact"} />
          <div className="flex flex-col rounded-lg bg-mist bg-[radial-gradient(ellipse_70%_90%_at_100%_0%,#C9DCFF_0%,#C9DCFF00_60%)] p-7">
            <div className="pb-5 text-[13px] leading-4 text-muted">Quality gate · {listed ? "passed" : p.status === "pilot" ? "pilot" : "in progress"}</div>
            {steps.map((st, i) => {
              const last = i === steps.length - 1;
              return (
                <motion.div key={st.title} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-[14px]">
                  <div className="flex flex-col items-center">
                    <div className={clsx("flex size-7 shrink-0 items-center justify-center rounded-full", st.done ? "bg-success" : "border-[1.5px] border-[#9AA2B4] bg-paper")}>
                      {st.done && <Svg name="check" size={14} color="#fff" width={2.5} />}
                    </div>
                    {!last && <div className={clsx("h-7 w-[2px] shrink-0", st.done ? (i === 1 ? "bg-[linear-gradient(180deg,#14804A_0%,#1E4FA3_100%)]" : "bg-success") : "bg-line")} />}
                  </div>
                  <div className={clsx("flex flex-col gap-[2px]", !st.sub && "pt-1")}>
                    <span className={clsx("text-[15px] leading-[18px] text-ink", st.bold ? "font-semibold" : "font-medium")}>{st.title}</span>
                    {st.sub && <span className="text-xs leading-4 text-muted">{st.sub}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </aside>
      </section>

      <Toast show={!!toast}>{toast}</Toast>
    </>
  );
}
