import type { Metadata } from "next";
import Image from "next/image";
import { PageHero, SectionHead } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/pages/bits";
import { Reveal } from "@/components/marketing/Reveal";
import { PlayButton } from "@/components/marketing/home/DownloadApp";
import { Icon } from "@/components/ui/Icon";
import { ANDROID_APP } from "@/lib/app";

export const metadata: Metadata = {
  title: "DGIX for Android",
  description: "Enrol your organisation, follow projects, invoices and licences, and keep approvals moving from your phone.",
};

const AUDIENCES = [
  {
    title: "Customers and sellers",
    items: ["Enrol your organisation in minutes", "Browse the verified marketplace", "Track requests, projects and milestones", "See invoices, amounts due and licences"],
  },
  {
    title: "DGIX teams",
    items: ["Commitments overdue or due this week", "Approvals and escalations as alerts", "Every module you have access to", "Start a new commitment from anywhere"],
  },
];

const STEPS = [
  { t: "Get the app", d: "Scan the QR code or tap Get it on Google Play." },
  { t: "Install", d: "Tap Install. Google Play keeps DGIX up to date." },
  { t: "Sign in", d: "Open DGIX, then enrol your organisation or sign in." },
  { t: "Go passwordless", d: "Turn on fingerprint sign-in for faster access." },
];

const SAFETY = [
  { icon: "lock" as const, t: "Same sign-in as the web", d: "Your DGIX account and two-factor protection work exactly as they do in the browser." },
  { icon: "shield" as const, t: "Published by Daffodil Group", d: "Installed from Google Play, with automatic updates." },
  { icon: "clock" as const, t: "Fingerprint with limits", d: "Fingerprint sign-in lasts 30 days per phone and ends when your password changes." },
];

export default function AppPage() {
  return (
    <>
      <PageHero
        eyebrow="Android app · now on Google Play"
        title={<>DGIX in<br />your pocket.</>}
        aside={
          <div className="flex flex-col gap-4 md:items-end">
            <PlayButton className="self-start md:self-end" />
            <span className="text-[13px] text-white/60">v{ANDROID_APP.version} · {ANDROID_APP.size} · {ANDROID_APP.minAndroid}</span>
          </div>
        }
      />

      <Section className="py-16 md:py-24">
        <SectionHead eyebrow="Who it's for" title="One app, one sign-in, the same rules as the web." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {AUDIENCES.map((a) => (
            <Reveal key={a.title} className="rounded-lg bg-[#F5F8FC] p-6 md:p-8">
              <h3 className="text-[22px] font-semibold text-ink">{a.title}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {a.items.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] leading-6 text-ink/85">
                    <Icon name="check" size={16} strokeWidth={2.4} className="mt-1 shrink-0 text-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-10 rounded-lg bg-night p-6 text-white md:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
          <div>
            <div className="text-[15px] text-white/60">How to install</div>
            <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-sm">{i + 1}</span>
                  <div>
                    <div className="text-[17px] font-semibold">{s.t}</div>
                    <div className="mt-1 text-[15px] leading-6 text-haze">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col items-center gap-3 self-center rounded-lg bg-white p-5 text-center text-night">
            <Image src={ANDROID_APP.qr} alt="QR code for the DGIX app on Google Play" width={168} height={168} unoptimized />
            <span className="text-[13px] text-muted">Scan with your phone camera to install</span>
          </div>
        </div>
      </Section>

      <Section className="pb-16 md:pb-24">
        <SectionHead eyebrow="Safe by design" title="Your phone, with the same protection as the web." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SAFETY.map((s) => (
            <Reveal key={s.t} className="rounded-lg border border-line p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-mist text-primary"><Icon name={s.icon} size={18} /></span>
              <h3 className="mt-5 text-[17px] font-semibold text-ink">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-6 text-muted">{s.d}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-lg bg-[#F5F8FC] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <div className="text-[17px] font-semibold text-ink">No Google Play?</div>
            <p className="mt-1 text-[15px] text-muted">Download the APK directly. Check the file against this SHA-256:</p>
            <code className="mt-2 block break-all font-mono text-[12px] text-ink/70">{ANDROID_APP.sha256}</code>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a href={ANDROID_APP.apkUrl} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-[15px] font-semibold text-white">
              <Icon name="download" size={16} /> Download APK
            </a>
            <a href={ANDROID_APP.webUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-5 text-[15px] font-medium text-ink">
              Open DGIX on the web
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
