import type { Article } from "@/lib/types";

export const FILTERS = [
  { key: "all", label: "All", tags: [] as string[] },
  { key: "guides", label: "Guides", tags: ["Buying guide", "Regulation", "Verification"] },
  { key: "markets", label: "Markets", tags: ["Market", "AI"] },
  { key: "partners", label: "For partners", tags: ["Money", "Verification", "Market"] },
] as const;

export type FilterKey = (typeof FILTERS)[number]["key"];

/** Card visual, cycling through the three treatments in the Paper artboard. */
export const VISUALS = [
  { bg: "radial-gradient(ellipse 70% 90% at 100% 0%, #7FB6FF 0%, #7FB6FF00 60%), linear-gradient(135deg, #0C1F45 0%, #1E4FA3 100%)", img: "/media/insights-card-1.webp", cover: false },
  { bg: "radial-gradient(ellipse 60% 80% at 100% 10%, #E52A2A73 0%, #E52A2A00 65%), linear-gradient(135deg, #0C1F45 0%, #133A5E 100%)", img: "/media/sell-hero.webp", cover: false },
  { bg: "", img: "/media/insights-card-3.webp", cover: true },
];

export const dateLabel = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Placeholder long-form body, generated from the article metadata (seed has no body field). */
export function articleBody(a: Article): { h: string; p: string[] }[] {
  return [
    { h: "The short version", p: [a.excerpt, "Below is how our advisors approach it in practice, and what we check before anything reaches a buyer's shortlist."] },
    { h: "What we see in the field", p: [`Most teams we speak with treat ${a.tag.toLowerCase()} as a box to tick late in the process. It works better as a question asked on day one, with evidence attached.`, "Every claim on a DGIX listing carries a label: verified by us, provided by the partner, or not yet checked. That label is what lets a buyer in Dubai trust a product built in Dhaka."] },
    { h: "What to do next", p: ["Write down the outcome you need, the country you go live in and the date. Share it with your advisor and you'll get a verified shortlist within a working day.", "If you're a product company, run the readiness diagnostic first. It shows every gap in writing before you apply."] },
  ];
}
