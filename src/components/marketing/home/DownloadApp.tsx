import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/marketing/Reveal";
import { ANDROID_APP } from "@/lib/app";
import { Panel } from "./shared";

const PlayGlyph = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={(size * 28) / 26} viewBox="0 0 26 28" aria-hidden className="shrink-0">
    <path d="M1.2.6 14.4 14 1.2 27.4A2 2 0 0 1 .5 25.9V2.1A2 2 0 0 1 1.2.6Z" fill="#2F6BD8" />
    <path d="M18.8 9.6 14.4 14 1.2.6c.4-.3 1-.4 1.6-.1L18.8 9.6Z" fill="#3DDC84" />
    <path d="M18.8 18.4 2.8 27.5c-.6.3-1.2.2-1.6-.1L14.4 14l4.4 4.4Z" fill="#E52A2A" />
    <path d="m24.3 12.6-5.5-3L14.4 14l4.4 4.4 5.5-3c1.1-.6 1.1-2.2 0-2.8Z" fill="#F6A11A" />
  </svg>
);

/** Google Play button. Plain styled link (not the trademarked badge artwork). `tone="dark"` is the black store-button style. */
export function PlayButton({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <a
      href={ANDROID_APP.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "group inline-flex h-14 items-center gap-3 rounded-lg pl-4 pr-5 transition-transform hover:-translate-y-0.5",
        tone === "dark" ? "bg-black text-white shadow-[0_14px_30px_-12px_#000000CC] ring-1 ring-white/15" : "bg-white text-night shadow-[0_12px_32px_-12px_#00000080]",
        className,
      )}
    >
      <PlayGlyph />
      <span className="flex flex-col text-left">
        <span className={clsx("text-[11px] leading-3", tone === "dark" ? "text-white/70" : "text-muted")}>Get it on</span>
        <span className="text-[18px] font-semibold leading-6">Google Play</span>
      </span>
    </a>
  );
}

function ApkButton() {
  return (
    <a
      href={ANDROID_APP.apkUrl}
      className="inline-flex h-14 items-center gap-3 rounded-lg bg-black pl-4 pr-5 text-white shadow-[0_14px_30px_-12px_#000000CC] ring-1 ring-white/15 transition-transform hover:-translate-y-0.5"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-white/10"><Icon name="download" size={16} /></span>
      <span className="flex flex-col text-left">
        <span className="text-[11px] leading-3 text-white/70">No Google Play?</span>
        <span className="text-[18px] font-semibold leading-6">Download APK</span>
      </span>
    </a>
  );
}

/* ---------- Phone mock-up ---------- */

const TASKS = [
  { t: "Milestone 3 ready for review", s: "RetailFlow rollout · evidence attached", dot: "bg-amber" },
  { t: "Invoice INV-0042 verified", s: "$6,200 · receipt available", dot: "bg-success" },
  { t: "Shortlist sent", s: "2 verified products for HR + payroll", dot: "bg-sky" },
];
const TABS: { icon: "home" | "sparkle" | "pulse" | "card"; label: string }[] = [
  { icon: "home", label: "Home" },
  { icon: "sparkle", label: "Requests" },
  { icon: "pulse", label: "Projects" },
  { icon: "card", label: "Billing" },
];

/** Realistic phone: metal frame, side buttons, Dynamic Island, glass reflection, DGIX app screen. Sizes scale with the container (cqw). */
function Phone({ className }: { className?: string }) {
  const btn = "absolute w-[1.2cqw] bg-[linear-gradient(90deg,#4A505C,#1E2128)]";
  return (
    <div className={clsx("@container relative aspect-[9/19.3]", className)} aria-hidden>
      {/* side buttons */}
      <span className={clsx(btn, "-left-[0.9cqw] top-[17%] h-[5%] rounded-l-sm")} />
      <span className={clsx(btn, "-left-[0.9cqw] top-[25%] h-[9%] rounded-l-sm")} />
      <span className={clsx(btn, "-left-[0.9cqw] top-[36%] h-[9%] rounded-l-sm")} />
      <span className={clsx(btn, "-right-[0.9cqw] top-[29%] h-[14%] rotate-180 rounded-l-sm")} />

      {/* frame: brushed-metal edge around a black bezel */}
      <div className="absolute inset-0 rounded-[16cqw] bg-[linear-gradient(140deg,#6B7280_0%,#2A2E37_16%,#15171D_50%,#2E323C_84%,#737B8C_100%)] p-[1.4cqw] shadow-[0_70px_120px_-30px_rgba(0,0,0,0.75),0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="relative size-full overflow-hidden rounded-[14.6cqw] bg-black p-[3.2cqw]">
          {/* screen */}
          <div className="relative flex size-full flex-col overflow-hidden rounded-[11.6cqw] bg-[#F5F8FC]">
            {/* status bar + Dynamic Island */}
            <div className="relative flex items-center justify-between bg-night px-[8cqw] pb-[2.5cqw] pt-[4.5cqw] text-[3.6cqw] font-semibold text-white">
              <span>9:41</span>
              <span className="absolute left-1/2 top-[3cqw] h-[7.5cqw] w-[28cqw] -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-[1.2cqw]">
                <svg className="w-[4.6cqw]" viewBox="0 0 16 10" fill="currentColor" aria-hidden><rect x="0" y="6" width="3" height="4" rx="1" /><rect x="4.3" y="4" width="3" height="6" rx="1" /><rect x="8.6" y="2" width="3" height="8" rx="1" /><rect x="12.9" y="0" width="3" height="10" rx="1" /></svg>
                <svg className="w-[6.4cqw]" viewBox="0 0 24 12" fill="none" aria-hidden><rect x=".5" y=".5" width="20" height="11" rx="3" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="15" height="8" rx="1.8" fill="currentColor" /><path d="M22 4v4" stroke="currentColor" strokeLinecap="round" opacity=".5" /></svg>
              </span>
            </div>
            {/* app header */}
            <div className="bg-night px-[7cqw] pb-[11cqw] pt-[4cqw] text-white">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-[2.4cqw]">
                  <span className="flex size-[9cqw] items-center justify-center rounded-[2.6cqw] bg-white">
                    <Image src="/brand/favicon-192.png" alt="" width={32} height={32} className="size-[6.6cqw]" />
                  </span>
                  <span className="text-[4.4cqw] font-semibold">DGIX</span>
                </span>
                <span className="flex size-[9cqw] items-center justify-center rounded-full bg-[linear-gradient(135deg,#1E4FA3,#4C85EE)] text-[3.2cqw] font-bold">OK</span>
              </div>
              <div className="mt-[7cqw] text-[3.4cqw] text-white/60">Good morning, Omar</div>
              <div className="mt-[1cqw] text-[6.6cqw] font-light leading-[1.15]">3 things need you today</div>
            </div>
            {/* tasks */}
            <div className="-mt-[6cqw] flex flex-col gap-[2.6cqw] px-[4.5cqw]">
              {TASKS.map((r) => (
                <div key={r.t} className="flex gap-[3cqw] rounded-[3.6cqw] bg-white p-[3.8cqw] shadow-[0_2px_8px_#0C1F4514]">
                  <span className={`mt-[1.2cqw] size-[2.2cqw] shrink-0 rounded-full ${r.dot}`} />
                  <div className="min-w-0">
                    <div className="truncate text-[3.7cqw] font-semibold text-ink">{r.t}</div>
                    <div className="truncate text-[3.1cqw] text-muted">{r.s}</div>
                  </div>
                </div>
              ))}
              <div className="mt-[1cqw] flex items-center justify-center gap-[2cqw] rounded-[3.6cqw] bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] py-[3.6cqw] text-[3.7cqw] font-semibold text-white">
                <svg className="w-[4.4cqw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 11c0 3-1 6-3 8M8 6.5A6 6 0 0 1 18 11c0 2-.3 4-1 6M6 9a6 6 0 0 0-1 3v1M12 15c0 2-.5 3.5-1.5 5" /></svg>
                Review milestone
              </div>
            </div>
            {/* tab bar */}
            <div className="mt-auto grid grid-cols-4 border-t border-line bg-white px-[3cqw] pb-[7cqw] pt-[3cqw] text-[2.8cqw] text-muted">
              {TABS.map((t, i) => (
                <span key={t.label} className={clsx("flex flex-col items-center gap-[1cqw]", i === 0 && "font-semibold text-primary")}>
                  <Icon name={t.icon} size={16} className="size-[5cqw]" />
                  {t.label}
                </span>
              ))}
            </div>
            <span className="absolute bottom-[2cqw] left-1/2 h-[1.2cqw] w-[32cqw] -translate-x-1/2 rounded-full bg-ink/80" />
          </div>
          {/* glass reflection */}
          <div className="pointer-events-none absolute inset-0 rounded-[14.6cqw] bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_28%,transparent_42%)]" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

export function DownloadApp() {
  return (
    <Panel id="download-app" className="rounded-lg bg-[linear-gradient(135deg,#1E4FA3_0%,#163C7E_55%,#0C1F45_100%)] text-white">
      {/* depth: light bloom behind the phone and a faint grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_78%_45%,rgba(127,182,255,0.35),transparent_70%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_70%_at_70%_50%,#000,transparent)]"
        aria-hidden
      />

      <div className="relative grid grid-cols-1 lg:min-h-[720px] lg:grid-cols-2">
        {/* Copy */}
        <Reveal className="relative z-10 flex flex-col justify-center px-6 pb-4 pt-16 md:px-12 md:pt-20 lg:py-24 lg:pl-20 lg:pr-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white shadow-[0_10px_24px_-10px_#000]">
              <Image src="/brand/favicon-192.png" alt="" width={36} height={36} className="size-8" />
            </span>
            <span className="text-[15px] text-white/75">DGIX for Android</span>
          </div>
          <h2 className="mt-8 max-w-[520px] text-[44px] font-semibold leading-[46px] tracking-[-0.03em] md:text-[64px] md:leading-[64px]">
            Download the DGIX app today
          </h2>
          <p className="mt-6 max-w-[460px] text-[17px] leading-[27px] text-white/75">
            Requests, projects, invoices and approvals in your pocket. One sign-in, fingerprint unlock, the same rules as the web.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <PlayButton tone="dark" />
            <ApkButton />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/60">
            <span className="hidden items-center gap-3 md:flex">
              <span className="rounded-md bg-white p-1">
                <Image src={ANDROID_APP.qr} alt="QR code for the DGIX app on Google Play" width={44} height={44} unoptimized />
              </span>
              Scan to install
            </span>
            <span>v{ANDROID_APP.version} · {ANDROID_APP.size} · {ANDROID_APP.minAndroid}</span>
            <Link href="/app" className="inline-flex items-center gap-1.5 font-medium text-white hover:underline">
              More about the app <Icon name="arrowRight" size={13} />
            </Link>
          </div>
        </Reveal>

        {/* Phone: large, tilted, bleeding off the panel edges */}
        <div className="relative h-[480px] sm:h-[560px] lg:h-auto">
          <div className="absolute left-1/2 top-10 w-[290px] -translate-x-[40%] rotate-[-14deg] sm:w-[330px] lg:left-[10%] lg:top-[7%] lg:w-[400px] lg:translate-x-0 xl:w-[440px]">
            <Reveal>
              <Phone className="w-full" />
            </Reveal>
          </div>
        </div>
      </div>
    </Panel>
  );
}
