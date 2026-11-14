import type { Category, Product } from "@/lib/types";
import { GATES } from "@/lib/seed";

/** Filter chips shown on the catalogue (slug → label + the product categories it covers). */
export const CHIPS: { slug: string; label: string; cats: Category[] }[] = [
  { slug: "erp", label: "ERP", cats: ["erp", "finance", "crm"] },
  { slug: "hr", label: "HR & payroll", cats: ["hr"] },
  { slug: "healthcare", label: "Healthcare", cats: ["healthcare"] },
  { slug: "retail", label: "Retail & POS", cats: ["retail"] },
  { slug: "education", label: "Education", cats: ["education"] },
  { slug: "ai", label: "AI & advanced tech", cats: ["ai"] },
  { slug: "services", label: "IT services", cats: ["services", "custom"] },
  { slug: "memberships", label: "Memberships", cats: [] },
];

export const CAT_LABEL: Record<Category, string> = {
  erp: "ERP",
  finance: "ERP",
  crm: "CRM",
  hr: "HR & payroll",
  healthcare: "Healthcare",
  retail: "Retail",
  education: "Education",
  ai: "AI & advanced tech",
  services: "IT services",
  custom: "IT services",
};

export const chipFor = (c: Category) => CHIPS.find((x) => x.cats.includes(c));

export const VISUAL: Record<Product["visual"], string> = {
  hospital: "/media/hospital.webp",
  people: "/media/people.webp",
  bars: "/media/bars.webp",
  bag: "/media/bag.webp",
  campus: "/media/campus.webp",
  ai: "/media/ai.webp",
  ledger: "/media/bars.webp",
};

export const score = (p: Product) => (typeof p.officialScore === "number" ? Math.round(p.officialScore) : p.checks.reduce((s, c) => s + c.score, 0));
export const isPublic = (p: Product) => p.status === "listed" || p.status === "pilot";
export const gateName = (g: Product["gate"]) => GATES.find((x) => x.id === g)?.name ?? "";

/** Market display names; product.markets uses the short code. */
export const MARKETS: { code: string; slug: string; name: string; short: string }[] = [
  { code: "UAE", slug: "uae", name: "United Arab Emirates", short: "the UAE" },
  { code: "KSA", slug: "ksa", name: "Saudi Arabia", short: "Saudi Arabia" },
  { code: "Qatar", slug: "qatar", name: "Qatar", short: "Qatar" },
  { code: "BGD", slug: "bgd", name: "Bangladesh", short: "Bangladesh" },
  { code: "USA", slug: "usa", name: "United States", short: "the USA" },
];

export const footLine = (p: Product) => [CAT_LABEL[p.category], ...p.markets].join(" · ");

/** Category intro + FAQ copy for category pages. */
export const CATEGORY_COPY: Record<string, { title: string; hero: string; intro: string; faqs: { q: string; a: string }[] }> = {
  healthcare: {
    hero: "Clinic and hospital systems, verified.",
    title: "What we check for healthcare.",
    intro:
      "Every clinic system is reviewed for patient-data privacy, HL7/FHIR records, insurance claims for your country, Arabic screens and on-site support. Built for multi-site clinics, hospitals and pharmacy groups in the UAE, Saudi Arabia and Qatar.",
    faqs: [
      { q: "Does it meet DHA / DOH data rules?", a: "Every healthcare product is checked for in-region hosting and patient-data handling before it is listed for the UAE." },
      { q: "Can it connect to our insurers?", a: "Insurance claim connectors are verified per country. Your advisor confirms the insurers you work with during the demo." },
      { q: "Who trains our clinical staff?", a: "The partner trains your staff on site or remotely, and DGIX tracks training as a paid milestone." },
    ],
  },
  hr: {
    hero: "HR and payroll, verified for your country.",
    title: "What we check for HR & payroll.",
    intro: "Every HR system is checked for WPS and GOSI files, Arabic payslips, leave rules for your country and data residency.",
    faqs: [
      { q: "Does it produce WPS files?", a: "Yes. WPS output is tested with sample payroll runs before listing." },
      { q: "Are payslips available in Arabic?", a: "Arabic is checked in the live demo. Declared items are labelled until verified." },
      { q: "Can we import our current staff data?", a: "Data migration is included as a milestone in every offer." },
    ],
  },
  erp: {
    hero: "ERP for growing companies, verified.",
    title: "What we check for ERP.",
    intro: "Every ERP is checked for VAT and e-invoicing in your country, multi-entity accounts, audit trails and a local support path.",
    faqs: [
      { q: "Is it ready for FTA e-invoicing?", a: "E-invoicing readiness is verified per country before listing." },
      { q: "Can it handle several companies?", a: "Multi-entity consolidation is checked where the partner claims it." },
      { q: "Who migrates our data?", a: "The partner migrates your data as a paid, accepted milestone." },
    ],
  },
};

export const genericCopy = (label: string) => ({
  hero: `${label}, verified.`,
  title: `What we check for ${label.toLowerCase()}.`,
  intro: "Every product is reviewed against eight checks — quality, customer evidence, security, legal ownership, pricing, support, readiness for your country and documentation — before it is listed.",
  faqs: [
    { q: "How is a product verified?", a: "An independent reviewer scores eight checks. Only products that pass every gate are listed." },
    { q: "Can I see a live demo?", a: "Yes. Your advisor books a live demo run by DGIX with the partner." },
    { q: "What if nothing fits?", a: "Describe your need and an advisor checks partners under review within one business day." },
  ],
});

/** Market page copy. */
export const MARKET_COPY: Record<string, { checks: { icon: string; label: string }[]; ai: string; services: string; title: string; intro: string; faqs: { q: string; a: string }[] }> = {
  uae: {
    checks: [
      { icon: "chat", label: "Arabic interface" },
      { icon: "doc", label: "FTA VAT & e-invoicing" },
      { icon: "card", label: "WPS payroll files" },
      { icon: "lock", label: "Data residency" },
      { icon: "user", label: "Local support" },
    ],
    ai: "AI checked for UAE data rules before it reaches you.",
    services: "Engineers who cover Dubai and Abu Dhabi hours.",
    title: 'What "ready for the UAE" means.',
    intro:
      "Before a product is listed for the UAE we check Arabic screens, FTA VAT and e-invoicing, WPS payroll files, data residency options and a local support path. Approval for one country never carries over to another.",
    faqs: [
      { q: "Is my data hosted in the UAE?", a: "Data residency options are verified for every UAE listing; in-region hosting is labelled on each passport." },
      { q: "Do invoices meet FTA e-invoicing rules?", a: "Yes. E-invoicing output is tested against the FTA format before listing." },
      { q: "Who supports us in Dubai or Abu Dhabi?", a: "Every UAE listing has a named local support path with signed response times." },
    ],
  },
  qatar: {
    checks: [
      { icon: "chat", label: "Arabic interface" },
      { icon: "doc", label: "Qatar invoicing" },
      { icon: "card", label: "WPS payroll files" },
      { icon: "lock", label: "Data residency" },
      { icon: "user", label: "Local support" },
    ],
    ai: "AI checked for Qatar data rules before it reaches you.",
    services: "Engineers who cover Doha business hours.",
    title: 'What "ready for Qatar" means.',
    intro: "Before a product is listed for Qatar we check Arabic screens, local invoicing, WPS payroll files, data residency under Qatar's PDPPL and a local support path. Approval for one country never carries over to another.",
    faqs: [
      { q: "Is my data hosted in Qatar?", a: "Hosting options are verified and labelled on each passport." },
      { q: "Does payroll produce Qatar WPS files?", a: "WPS output is tested with sample runs before listing." },
      { q: "Who supports us in Doha?", a: "Every Qatar listing has a named local support path." },
    ],
  },
  ksa: {
    checks: [
      { icon: "chat", label: "Arabic interface" },
      { icon: "doc", label: "ZATCA e-invoicing" },
      { icon: "card", label: "GOSI & Mudad files" },
      { icon: "lock", label: "Data residency" },
      { icon: "user", label: "Local support" },
    ],
    ai: "AI checked for Saudi data rules before it reaches you.",
    services: "Engineers who cover Riyadh and Jeddah hours.",
    title: 'What "ready for Saudi Arabia" means.',
    intro: "Before a product is listed for Saudi Arabia we check Arabic screens, ZATCA e-invoicing, GOSI and Mudad payroll files, PDPL data residency and a local support path. Approval for one country never carries over to another.",
    faqs: [
      { q: "Is it ZATCA phase 2 ready?", a: "E-invoicing integration is verified before a product is listed for Saudi Arabia." },
      { q: "Does payroll submit to GOSI?", a: "GOSI submissions are tested with sample payroll runs." },
      { q: "Who supports us in Riyadh?", a: "Every Saudi listing has a named local support path." },
    ],
  },
  usa: {
    checks: [
      { icon: "doc", label: "Sales tax & 1099" },
      { icon: "shield", label: "SOC 2 controls" },
      { icon: "card", label: "US payroll" },
      { icon: "lock", label: "US data hosting" },
      { icon: "user", label: "US-hours support" },
    ],
    ai: "AI checked for US privacy rules before it reaches you.",
    services: "Engineers who overlap US business hours.",
    title: 'What "ready for the USA" means.',
    intro: "Before a product is listed for the USA we check SOC 2 controls, US data hosting, state sales tax handling, accessibility and a support path that overlaps US hours. Approval for one country never carries over to another.",
    faqs: [
      { q: "Is my data hosted in the US?", a: "US hosting options are verified and labelled on each passport." },
      { q: "Do you check SOC 2?", a: "Security evidence including SOC 2 reports is reviewed by an independent reviewer." },
      { q: "Who supports us during US hours?", a: "Every US listing has a support path with signed response times in US hours." },
    ],
  },
  bgd: {
    checks: [
      { icon: "doc", label: "NBR VAT & statutory tax" },
      { icon: "card", label: "bKash / SSLCommerz & BEFTN" },
      { icon: "lock", label: "Bangladesh data rules" },
      { icon: "chat", label: "Bangla & English screens" },
      { icon: "user", label: "Dhaka engineering support" },
    ],
    ai: "AI checked for Bangladesh enterprise & statutory rules before it reaches you.",
    services: "Engineers who cover Dhaka and Chattogram business hours.",
    title: 'What "ready for Bangladesh" means.',
    intro: "Before a product is listed for Bangladesh we verify NBR VAT/Mushak outputs, local BEFTN & SSLCommerz payment compatibility, data governance and Dhaka on-site support.",
    faqs: [
      { q: "Does payroll handle Bangladesh tax & BEFTN?", a: "Statutory payroll, tax slabs and BEFTN bank files are verified before listing." },
      { q: "Can we pay in BDT or USD?", a: "Supported local & cross-border gateways are configured per jurisdiction." },
      { q: "Who supports us in Dhaka?", a: "Every Bangladesh listing has a named Dhaka engineering support desk." },
    ],
  },
};
