export type LegalDoc = {
  key: "terms" | "privacy" | "cookies";
  label: string;
  title: string;
  plain: string;
  sections: { h: string; p: string; table?: boolean }[];
};

export const COOKIE_ROWS: { name: string; type: "Essential" | "Preference" | "Analytics" | "Marketing"; purpose: string; expires: string }[] = [
  { name: "dgix_session", type: "Essential", purpose: "Keeps you signed in", expires: "Session" },
  { name: "csrf_token", type: "Essential", purpose: "Protects forms", expires: "Session" },
  { name: "dgix_consent", type: "Essential", purpose: "Stores your cookie choice", expires: "12 mo" },
  { name: "dgix_locale", type: "Preference", purpose: "Language and country", expires: "12 mo" },
  { name: "_ga", type: "Analytics", purpose: "Aggregated page usage", expires: "13 mo" },
  { name: "li_fat_id", type: "Marketing", purpose: "LinkedIn campaign measurement", expires: "30 days" },
];

export const LEGAL: LegalDoc[] = [
  {
    key: "terms",
    label: "Terms",
    title: "Terms of use",
    plain: "DGIX helps you find verified products and buy them under one contract with us. A verification score shows a product passed our review; your real protection is the signed SLA and warranty in your offer. AI suggests matches, a person confirms them.",
    sections: [
      { h: "Who we are", p: 'DGIX (Daffodil Global Innovation Exchange) is operated by Daffodil Group Ltd, 102/1 Shukrabad, Mirpur Road, Dhanmondi, Dhaka-1207, Bangladesh ("DGIX", "we", "us"). These terms apply to the website dgix.daffodil.global and to the buyer, partner and staff portals.' },
      { h: "Using DGIX", p: "You may use DGIX to research products, describe a need, request demos and buy through us. You agree not to misuse the service, attempt to bypass DGIX to contract directly with a partner introduced through us during the period set in your offer, or upload content you have no right to share." },
      { h: "Accounts", p: "Business accounts must be opened by an authorised person using a work email. Company details are verified before quotes are issued. You are responsible for activity under your account and for keeping access details secure." },
      { h: "Listings & verification", p: "Each claim on a listing is labelled Verified, Certified, Declared, Inferred or Estimated. The Global Readiness Score reflects our review on the date shown, per product, version and country. It is not a promise of results, safety or legal compliance in your organisation." },
      { h: "AI matching", p: "We use AI to structure your request and rank products. AI output is advisory only. A DGIX advisor reviews every shortlist, and no offer, contract or payment is created by AI." },
      { h: "Contracts & payments", p: "When you accept an offer you contract with DGIX. Price, scope, service levels, warranty, payment milestones and exit terms are set out in that offer and prevail over these terms where they differ. Payments are made to DGIX only." },
      { h: "Intellectual property", p: "Product companies keep ownership of their products and IP. DGIX owns the website, the Daffodil Verified standard and its marks. You may not copy listings, scores or content for commercial use without written permission." },
      { h: "Liability", p: "Our liability for a purchase is set in your signed offer. Outside an offer, the website is provided as is, and DGIX is not liable for indirect or consequential loss. Nothing in these terms limits liability that cannot be limited by law." },
      { h: "Governing law", p: "These terms are governed by the laws of Bangladesh. An offer may name a different governing law and venue for that contract, which then applies to that contract." },
      { h: "Contact", p: "Questions about these terms: legal@dgix.daffodil.global, or write to Daffodil Group Ltd at the address above. We will tell registered users about material changes at least 30 days before they apply." },
    ],
  },
  {
    key: "privacy",
    label: "Privacy",
    title: "Privacy policy",
    plain: "We collect only what we need to match you, deliver your project and get paid. We never sell your data. Your requirement is shared with a product company only when you ask for a demo or an offer.",
    sections: [
      { h: "Who controls your data", p: "Daffodil Group Ltd, operating DGIX, is the controller of personal data collected through dgix.daffodil.global and the DGIX portals." },
      { h: "What we collect", p: "Contact and company details you give us, your requirements and budgets, demo and contract records, invoices and payments, support messages, and basic usage data such as pages visited and device type." },
      { h: "How we use it", p: "To match your need to verified products, arrange demos, prepare offers, deliver and support projects, collect payments, meet legal duties and improve the service. We rely on contract, legitimate interest and, for marketing, your consent." },
      { h: "AI and your data", p: "Your requirement text is processed by AI to structure and rank matches. It is not used to train third-party models. A DGIX advisor reviews every result, and you can ask for a human-only review." },
      { h: "Who we share with", p: "Product companies you choose to see a demo or offer from, our payment and hosting providers under contract, and authorities where the law requires. We never sell personal data." },
      { h: "International transfers", p: "Data may be processed in Bangladesh, the UAE and the EU. Transfers are protected by contracts and safeguards that meet applicable law, including GDPR and UAE PDPL where they apply." },
      { h: "How long we keep it", p: "Account data while your account is active, contract and invoice records for 7 years, and unconverted requirements for 24 months, after which they are deleted or anonymised." },
      { h: "Security", p: "Encryption in transit and at rest, role-based access, audit logs on every approval and payment, and regular independent testing." },
      { h: "Your rights", p: "You can ask to access, correct, delete or export your data, object to processing or withdraw consent at any time from Account settings or by emailing us." },
      { h: "Contact our DPO", p: "privacy@dgix.daffodil.global. You may also complain to your local data protection authority." },
    ],
  },
  {
    key: "cookies",
    label: "Cookies",
    title: "Cookie policy",
    plain: "We use a few essential cookies to keep you signed in and secure. Analytics and marketing cookies are off until you switch them on, and you can change your choice any time.",
    sections: [
      { h: "What cookies are", p: "Cookies are small files stored by your browser. We also use similar technologies such as local storage. This policy explains each type and how to control it." },
      { h: "Essential cookies", p: "Always on. They keep you signed in, protect forms from abuse, balance load and remember your cookie choice. The site cannot work without them." },
      { h: "Preference cookies", p: "Remember your language, country and display settings so you don't set them again. Off until you allow them." },
      { h: "Analytics cookies", p: "Help us understand which pages are useful, using aggregated, pseudonymised data. Off until you allow them." },
      { h: "Marketing cookies", p: "Measure campaigns on LinkedIn and Google. Off until you allow them. We never use them to profile you inside the portals." },
      { h: "Cookie list", p: "", table: true },
      { h: "Managing your choices", p: 'Use "Cookie settings" in the footer at any time, or your browser settings. Blocking essential cookies will stop sign-in from working.' },
      { h: "Third parties", p: "Analytics and marketing providers act under contract and only receive data when you have consented." },
      { h: "Changes", p: "If we add a new cookie category we will ask for your consent again." },
      { h: "Contact", p: "privacy@dgix.daffodil.global" },
    ],
  },
];
