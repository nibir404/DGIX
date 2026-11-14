import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CookieBanner } from "@/components/marketing/pages/CookieBanner";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <main className="flex flex-col">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </SmoothScroll>
  );
}
