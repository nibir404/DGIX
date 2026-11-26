import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/pages/bits";
import { EnrolForm } from "@/components/marketing/EnrolForm";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Enrol your organisation",
  description: "Register your company with DGIX for free. DGIX verifies every buyer organisation before the first shortlist.",
};

const WHY = [
  { t: "Free for buyers", d: "Registration and shortlists cost nothing. You pay only for what you buy." },
  { t: "Verified once", d: "DGIX checks your company once, so every partner knows they're dealing with a real buyer." },
  { t: "Your team, your roles", d: "Approvers, finance and viewers each see what they need." },
];

export default function EnrolPage() {
  return (
    <>
      <PageHero eyebrow="For buying organisations" title={<>Enrol your<br />organisation.</>} />
      <Section className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <aside className="flex flex-col gap-5">
            {WHY.map((w) => (
              <div key={w.t} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-primary"><Icon name="check" size={14} strokeWidth={2.4} /></span>
                <div>
                  <div className="text-[15px] font-semibold text-ink">{w.t}</div>
                  <p className="text-sm leading-[21px] text-muted">{w.d}</p>
                </div>
              </div>
            ))}
            <p className="border-t border-line pt-5 text-sm text-muted">
              Selling software instead? <a href="/apply" className="font-medium text-primary hover:underline">Apply as a partner</a>
            </p>
          </aside>
          <EnrolForm />
        </div>
      </Section>
    </>
  );
}
