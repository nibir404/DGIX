import type { Metadata } from "next";
import { PageHero, SectionHead } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/pages/bits";
import { Reveal } from "@/components/marketing/Reveal";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Support network",
  description: "The industry bodies, public institutions and missions that support Bangladesh's software and digital exports. Check each one on its original register.",
};

type Entry = { name: string; short?: string; role: string; url?: string; site?: string };
type Group = { key: string; eyebrow: string; title: string; note: string; entries: Entry[] };

const GROUPS: Group[] = [
  {
    key: "associations",
    eyebrow: "Industry associations",
    title: "The software sector's own bodies.",
    note: "Member companies, sector data and export programmes for Bangladesh's software and digital industry.",
    entries: [
      { name: "Bangladesh Association of Software and Information Services", short: "BASIS", role: "National association of software and IT-enabled service companies.", url: "https://basis.org.bd", site: "basis.org.bd" },
      { name: "e-Commerce Association of Bangladesh", short: "e-CAB", role: "Association for e-commerce and digital commerce businesses.", url: "https://e-cab.net", site: "e-cab.net" },
      { name: "Bangladesh Association of Contact Center and Outsourcing", short: "BACCO", role: "Association for contact centre, BPO and outsourcing companies.", url: "https://bacco.org.bd", site: "bacco.org.bd" },
      { name: "Federation of Bangladesh Chambers of Commerce and Industry", short: "FBCCI", role: "Apex chamber for trade and industry, including bilateral chambers.", url: "https://fbcci.org", site: "fbcci.org" },
    ],
  },
  {
    key: "institutions",
    eyebrow: "Public institutions",
    title: "Where policy, incentives and infrastructure come from.",
    note: "Government bodies that set ICT policy, run technology parks and support exporters and foreign investors.",
    entries: [
      { name: "ICT Division", role: "Ministry division responsible for ICT policy and digital programmes.", url: "https://ictd.gov.bd", site: "ictd.gov.bd" },
      { name: "Bangladesh Computer Council", short: "BCC", role: "Implements national ICT infrastructure, skills and e-government projects.", url: "https://bcc.gov.bd", site: "bcc.gov.bd" },
      { name: "Bangladesh Hi-Tech Park Authority", short: "BHTPA", role: "Develops and runs hi-tech parks and software technology parks.", url: "https://bhtpa.gov.bd", site: "bhtpa.gov.bd" },
      { name: "Bangladesh Investment Development Authority", short: "BIDA", role: "One-stop service for foreign investors and joint ventures.", site: "bida.gov.bd" },
      { name: "Export Promotion Bureau", short: "EPB", role: "National export promotion, trade fairs and official export statistics.", url: "https://epb.gov.bd", site: "epb.gov.bd" },
    ],
  },
  {
    key: "missions",
    eyebrow: "Diplomatic missions",
    title: "Bangladesh in our priority markets.",
    note: "Embassies and consulates support buyers with introductions and business visits. Check addresses and contacts on the Ministry of Foreign Affairs' official list.",
    entries: [
      { name: "Embassy of Bangladesh, Abu Dhabi", role: "United Arab Emirates" },
      { name: "Consulate General of Bangladesh, Dubai", role: "United Arab Emirates" },
      { name: "Embassy of Bangladesh, Riyadh", role: "Saudi Arabia" },
      { name: "Embassy of Bangladesh, Doha", role: "Qatar" },
      { name: "Embassy of Bangladesh, Washington DC", role: "United States" },
    ],
  },
];

export default function NetworkPage() {
  return (
    <>
      <PageHero
        eyebrow="Support network"
        title={<>Who stands<br />behind the sector.</>}
        aside={
          <p className="max-w-[420px] text-[17px] leading-[27px] text-white/75">
            Find an association, institution or mission that supports Bangladesh&apos;s software and digital exports, and check it on the original register.
          </p>
        }
      />

      {GROUPS.map((g) => (
        <Section key={g.key} className="py-14 md:py-20">
          <SectionHead eyebrow={g.eyebrow} title={g.title} />
          <p className="mt-4 max-w-[640px] text-[15px] leading-6 text-muted">{g.note}</p>
          <ul className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            {g.entries.map((e) => (
              <Reveal key={e.name} className="flex flex-col gap-2 rounded-lg border border-line bg-white p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[17px] font-semibold leading-6 text-ink">{e.name}</div>
                    {e.short && <div className="mt-0.5 font-mono text-xs text-muted">{e.short}</div>}
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist text-primary">
                    <Icon name={g.key === "missions" ? "globe" : g.key === "institutions" ? "shield" : "users"} size={17} />
                  </span>
                </div>
                <p className="text-[15px] leading-6 text-muted">{e.role}</p>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline">
                    {e.site} <Icon name="arrowUpRight" size={13} />
                  </a>
                )}
              </Reveal>
            ))}
          </ul>
          {g.key === "missions" && (
            <a href="https://mofa.gov.bd" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Official list of Bangladesh missions · mofa.gov.bd <Icon name="arrowUpRight" size={13} />
            </a>
          )}
        </Section>
      ))}

      <Section className="pb-20 md:pb-28">
        <p className="max-w-[760px] border-t border-line pt-6 text-[13px] leading-5 text-muted">
          Listed for reference only. Inclusion does not mean an organisation is a DGIX partner or endorses DGIX. Details change, so check each entry on its own official site before relying on it.
        </p>
      </Section>
    </>
  );
}
