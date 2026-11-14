import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "./Reveal";

const cols = [
  { title: "Buy", links: [["Solutions", "/solutions"], ["How it works", "/how-it-works"], ["Pricing", "/pricing"], ["Android app", "/app"]] },
  { title: "Trust", links: [["Daffodil Verified", "/verified"], ["FAQ", "/faq"], ["About", "/about"]] },
  { title: "Partners", links: [["Sell through DGIX", "/sell"], ["Insights", "/insights"], ["Contact", "/contact"]] },
];

export function SiteFooter() {
  return (
    <footer className="mx-2 mb-2 md:mx-4 md:mb-4 flex flex-col gap-16 md:gap-20 rounded-lg bg-night px-6 pb-12 pt-16 md:px-20 md:pt-24">
      <Reveal className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[52px] leading-[54px] md:text-[88px] md:leading-[88px] font-light tracking-[-0.05em] text-white">
          You name it.
          <br />
          DGIX has it.
        </h2>
        <Link
          href="/contact"
          className="group flex h-[60px] shrink-0 items-center justify-center gap-2.5 self-start md:self-auto rounded-lg px-7 text-[17px] font-semibold text-white bg-[linear-gradient(180deg,#4C85EE_0%,#1E4FA3_100%)] shadow-[inset_0_1px_0_#FFFFFF66,0_0_0_6px_#7FB6FF1F,0_12px_32px_-8px_#1E4FA3B3,0_0_48px_#7FB6FF4D] transition-transform hover:-translate-y-0.5"
        >
          Get my verified shortlist
          <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
      <div className="flex flex-col gap-10 md:flex-row md:gap-16 border-t border-[#22355E] pt-12">
        <div className="flex flex-col gap-3 md:flex-[1.5]">
          <Image src="/brand/dgix-logo-white.png" alt="DGIX" width={182} height={48} className="h-12 w-auto self-start" />
          <p className="text-sm leading-[22px] text-haze">
            A Daffodil Group initiative.
            <br />
            102/1 Shukrabad, Mirpur Road,
            <br />
            Dhanmondi, Dhaka-1207
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 md:contents">
          {cols.map((c) => (
            <div key={c.title} className="flex flex-col gap-3 md:flex-1">
              <div className="text-[13px] font-semibold uppercase tracking-caps leading-4 text-[#7F8DAD]">{c.title}</div>
              {c.links.map(([l, h]) => (
                <Link key={h} href={h} className="text-[15px] leading-[18px] text-white hover:text-sky transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:justify-between text-[13px] leading-4 text-[#7F8DAD]">
        <span>© 2026 Daffodil Group Ltd · dgix.daffodil.global</span>
        <span className="flex gap-1">
          <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>·
          <Link href="/legal/terms" className="hover:text-white">Terms</Link>·
          <Link href="/legal/cookies" className="hover:text-white">Cookies</Link>
        </span>
      </div>
    </footer>
  );
}
