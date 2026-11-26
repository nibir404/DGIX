import type { Metadata } from "next";
import { PageHero, SectionHead } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/pages/bits";
import { Reveal } from "@/components/marketing/Reveal";
import { EventsInterestForm } from "@/components/marketing/pages/EventsInterestForm";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Buyer missions & events",
  description: "Meet Bangladesh's verified software teams: buyer missions to Dhaka, virtual demo days, and roadshows in the GCC and the USA.",
};

const FORMATS: { icon: IconName; t: string; d: string; points: string[] }[] = [
  {
    icon: "globe",
    t: "Buyer missions to Dhaka",
    d: "A short, planned visit to meet the teams behind the products you're considering.",
    points: ["Meetings set against your request", "Live demos and office visits", "A sector briefing on working with Bangladesh"],
  },
  {
    icon: "video",
    t: "Virtual demo days",
    d: "Online sessions where verified products are shown against a real buyer brief.",
    points: ["One sector per session", "Ask questions live", "Book a follow-up demo in your DGIX account"],
  },
  {
    icon: "users",
    t: "Roadshows in the GCC and USA",
    d: "DGIX and product teams come to your city for briefings and one-to-one meetings.",
    points: ["UAE, Saudi Arabia, Qatar and the USA", "Small rooms, scheduled meetings", "Your advisor follows up on every meeting"],
  },
];

const STEPS = [
  { t: "Register interest", d: "Tell us the format, your country and the sectors you care about." },
  { t: "Get a matched agenda", d: "Your advisor proposes meetings based on your need and the verified products that fit it." },
  { t: "Meet and see demos", d: "Meet the teams, see the products working, and ask the hard questions." },
  { t: "Follow up in DGIX", d: "Everything carries into your account: shortlist, demos, offer and one contract." },
];

const SHOWN = [
  { t: "Bangladesh Innovation Fair 2026", d: "Six Daffodil AI projects selected for the Top 50." },
  { t: "Bangladesh AI Business Summit 2026", d: "Daffodil Group exhibited." },
  { t: "30th U.S. Trade Show, Dhaka", d: "Daffodil Group exhibited." },
];

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Buyer missions & events"
        title={<>Meet the teams<br />before you buy.</>}
        aside={
          <p className="max-w-[420px] text-[17px] leading-[27px] text-white/75">
            Missions to Dhaka, virtual demo days and roadshows in the GCC and USA, each planned around what buyers need.
          </p>
        }
      />

      <Section className="py-14 md:py-20">
        <SectionHead eyebrow="Formats" title="Three ways to meet Bangladesh's builders." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FORMATS.map((f) => (
            <Reveal key={f.t} className="flex flex-col gap-4 rounded-lg bg-[#F5F8FC] p-6 md:p-7">
              <span className="flex size-11 items-center justify-center rounded-lg bg-white text-primary shadow-[0_1px_2px_rgba(12,31,69,0.06)]"><Icon name={f.icon} size={20} /></span>
              <div>
                <h3 className="text-[19px] font-semibold text-ink">{f.t}</h3>
                <p className="mt-2 text-[15px] leading-6 text-muted">{f.d}</p>
              </div>
              <ul className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm leading-5 text-ink/85"><Icon name="check" size={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-primary" />{p}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pb-14 md:pb-20">
        <div className="rounded-lg bg-night p-6 text-white md:p-10 lg:p-14">
          <div className="text-[15px] text-white/60">How a mission works</div>
          <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex flex-col gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-white/10 font-mono text-sm">{i + 1}</span>
                <div className="text-[17px] font-semibold">{s.t}</div>
                <div className="text-[15px] leading-6 text-haze">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section className="pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHead eyebrow="Where Daffodil has shown" title="Already in the room." />
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {SHOWN.map((e) => (
                <li key={e.t} className="flex flex-col gap-1 py-4">
                  <span className="text-[15px] font-semibold text-ink">{e.t}</span>
                  <span className="text-sm text-muted">{e.d}</span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] leading-5 text-muted">Source: Daffodil Group public exhibition records.</p>
          </div>
          <EventsInterestForm />
        </div>
      </Section>
    </>
  );
}
