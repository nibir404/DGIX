import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/marketing/Reveal";
import { ANDROID_APP } from "@/lib/app";
import { Panel } from "./shared";

/** Google Play button. Plain styled link (not the trademarked badge artwork). */
export function PlayButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={ANDROID_APP.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex h-14 items-center gap-3 rounded-lg bg-white pl-4 pr-5 text-night shadow-[0_12px_32px_-12px_#00000080] transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <svg width="26" height="28" viewBox="0 0 26 28" aria-hidden className="shrink-0">
        <path d="M1.2.6 14.4 14 1.2 27.4A2 2 0 0 1 .5 25.9V2.1A2 2 0 0 1 1.2.6Z" fill="#2F6BD8" />
        <path d="M18.8 9.6 14.4 14 1.2.6c.4-.3 1-.4 1.6-.1L18.8 9.6Z" fill="#3DDC84" />
        <path d="M18.8 18.4 2.8 27.5c-.6.3-1.2.2-1.6-.1L14.4 14l4.4 4.4Z" fill="#E52A2A" />
        <path d="m24.3 12.6-5.5-3L14.4 14l4.4 4.4 5.5-3c1.1-.6 1.1-2.2 0-2.8Z" fill="#F6A11A" />
      </svg>
      <span className="flex flex-col text-left">
        <span className="text-[11px] leading-3 text-muted">Get it on</span>
        <span className="text-[18px] font-semibold leading-6">Google Play</span>
      </span>
    </a>
  );
}

/** Simple phone frame with a DGIX home screen, drawn in CSS so it stays crisp at any size. */
function PhoneMock() {
  const rows = [
    { t: "Milestone 3 ready for review", s: "RetailFlow rollout · evidence attached", tone: "bg-amber" },
    { t: "Invoice INV-0042 verified", s: "$6,200 · receipt available", tone: "bg-success" },
    { t: "Shortlist sent", s: "2 verified products for HR + payroll", tone: "bg-sky" },
  ];
  return (
    <div className="relative mx-auto w-[230px] sm:w-[260px]" aria-hidden>
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,#4C85EE55,transparent)]" />
      <div className="relative rounded-[38px] border border-white/15 bg-[#0A1730] p-2.5 shadow-[0_40px_80px_-20px_#000000AA]">
        <div className="overflow-hidden rounded-[30px] bg-[#F5F8FC]">
          <div className="flex items-center justify-between bg-night px-5 pb-4 pt-3 text-white">
            <span className="text-[10px] opacity-70">9:41</span>
            <span className="h-4 w-16 rounded-full bg-black/60" />
            <span className="text-[10px] opacity-70">5G</span>
          </div>
          <div className="bg-night px-5 pb-5 text-white">
            <div className="text-[11px] text-white/60">Good morning, Omar</div>
            <div className="mt-1 text-[19px] font-light leading-6">3 things need you today</div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {rows.map((r) => (
              <div key={r.t} className="flex gap-2.5 rounded-xl bg-white p-3 shadow-[0_1px_2px_#0C1F4514]">
                <span className={`mt-1 size-2 shrink-0 rounded-full ${r.tone}`} />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-ink">{r.t}</div>
                  <div className="truncate text-[10px] text-muted">{r.s}</div>
                </div>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] py-2.5 text-[12px] font-semibold text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 11c0 3-1 6-3 8M8 6.5A6 6 0 0 1 18 11c0 2-.3 4-1 6M6 9a6 6 0 0 0-1 3v1M12 15c0 2-.5 3.5-1.5 5" /></svg>
              Fingerprint sign-in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "One sign-in",
    body: "Same account and two-factor protection as the web.",
    icon: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
  },
  {
    title: "Fingerprint",
    body: "Unlock with a touch. Lasts 30 days per phone.",
    icon: <path d="M12 11c0 3-1 6-3 8M8 6.5A6 6 0 0 1 18 11c0 2-.3 4-1 6M6 9a6 6 0 0 0-1 3v1M12 15c0 2-.5 3.5-1.5 5" />,
  },
  {
    title: "Always current",
    body: "Updates arrive through Google Play.",
    icon: <><path d="M20 11a8 8 0 0 0-14.9-3.9M4 13a8 8 0 0 0 14.9 3.9" /><path d="M4 4v4h4M20 20v-4h-4" /></>,
  },
];

export function DownloadApp() {
  return (
    <Panel id="download-app" className="rounded-lg bg-night text-white">
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_45%,#1E4FA355,transparent)]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-6 py-16 md:px-12 md:py-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-20">
        <Reveal className="flex min-w-0 flex-col">
          <div className="text-[15px] leading-[18px] text-white/60">Android app</div>
          <h2 className="mt-5 text-[36px] leading-[40px] md:text-[52px] md:leading-[56px] font-light tracking-tight">DGIX is now on Google Play</h2>
          <p className="mt-5 max-w-[560px] text-[17px] leading-[27px] text-haze">
            Enrol your organisation, follow projects, invoices and licences, and keep approvals moving from your phone.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-5 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-8">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4 sm:flex-col sm:gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/8 text-sky">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{f.icon}</svg>
                </span>
                <span className="flex min-w-0 flex-col gap-1 sm:gap-3">
                  <span className="text-[15px] font-semibold">{f.title}</span>
                  <span className="text-sm leading-[21px] text-haze">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
            <PlayButton className="self-start" />
            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-md bg-white p-1.5">
                <Image src={ANDROID_APP.qr} alt="QR code for the DGIX app on Google Play" width={56} height={56} unoptimized />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Scan to install</span>
                <span className="text-[13px] text-haze">Point your phone camera here</span>
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/50">
            <Link href="/app" className="inline-flex items-center gap-1.5 font-medium text-white/80 hover:text-white">
              More about the app <Icon name="arrowRight" size={13} />
            </Link>
            <span>v{ANDROID_APP.version} · {ANDROID_APP.size} · {ANDROID_APP.minAndroid}</span>
          </div>
        </Reveal>
        <Reveal className="flex justify-center">
          <PhoneMock />
        </Reveal>
      </div>
    </Panel>
  );
}
