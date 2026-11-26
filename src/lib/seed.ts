import type { Check, CheckKey, Db, Article, Faq } from "./types";

/**
 * Seed data for local testing. Every portal screen and every flow in the
 * Paper file reads from here. Passwords are test-only values.
 */

export const CHECK_META: { key: CheckKey; label: string; max: number }[] = [
  { key: "quality", label: "Product quality & delivery", max: 20 },
  { key: "evidence", label: "Customer evidence", max: 15 },
  { key: "security", label: "Security & privacy", max: 15 },
  { key: "legal", label: "Legal ownership", max: 10 },
  { key: "pricing", label: "Pricing & economics", max: 10 },
  { key: "support", label: "Support & continuity", max: 10 },
  { key: "readiness", label: "Readiness for your country", max: 10 },
  { key: "docs", label: "Documentation & demo", max: 10 },
];

export const GATES = [
  { id: "PG0", name: "Problem" },
  { id: "PG1", name: "Offer" },
  { id: "PG2", name: "Economics" },
  { id: "PG3", name: "Proof" },
  { id: "PG4", name: "Scale" },
  { id: "PG5", name: "Portfolio" },
] as const;

function checks(overrides: Partial<Record<CheckKey, [number, string?]>> = {}): Check[] {
  return CHECK_META.map((m) => {
    const o = overrides[m.key];
    return { key: m.key, label: m.label, max: m.max, score: o ? o[0] : m.max, note: o?.[1] };
  });
}

export const TEST_PASSWORD = "dgix-test-2026";

export const seed: Db = {
  users: [
    { id: "u-omar", name: "Omar Khalid", initials: "OK", email: "omar@gulfretail.ae", password: TEST_PASSWORD, role: "buyer", companyId: "c-gulf", title: "Head of Operations", avatarTone: "amber" },
    { id: "u-layla", name: "Layla Haddad", initials: "LH", email: "layla@alnoorclinics.qa", password: TEST_PASSWORD, role: "buyer", companyId: "c-alnoor", title: "IT Director", avatarTone: "rose" },
    { id: "u-james", name: "James Porter", initials: "JP", email: "james@meridianlogistics.us", password: TEST_PASSWORD, role: "buyer", companyId: "c-meridian", title: "VP Systems", avatarTone: "violet" },
    { id: "u-rahim", name: "Rahim Karim", initials: "RK", email: "rahim@softhealth.com.bd", password: TEST_PASSWORD, role: "seller", companyId: "c-softhealth", title: "CEO", avatarTone: "green" },
    { id: "u-nadia", name: "Nadia Chowdhury", initials: "NC", email: "nadia@daffodilsoft.com", password: TEST_PASSWORD, role: "seller", companyId: "c-daffsoft", title: "Partnerships Lead", avatarTone: "blue" },
    { id: "u-tanvir", name: "Tanvir Ahmed", initials: "TA", email: "tanvir@nexalabs.io", password: TEST_PASSWORD, role: "seller", companyId: "c-nexa", title: "Founder", avatarTone: "violet" },
    { id: "u-asha", name: "Asha Rahman", initials: "AR", email: "asha@dgix.daffodil.global", password: TEST_PASSWORD, role: "staff", companyId: "c-dgix", title: "Advisor · 12 accounts", avatarTone: "blue", photo: "/media/buyer-advisor.webp" },
    { id: "u-farhan", name: "Farhan Hossain", initials: "FH", email: "farhan@dgix.daffodil.global", password: TEST_PASSWORD, role: "staff", companyId: "c-dgix", title: "Finance", avatarTone: "green" },
  ],

  companies: [
    { id: "c-gulf", name: "Gulf Retail Group", kind: "buyer", country: "United Arab Emirates", city: "Dubai", verified: true, advisorId: "u-asha" },
    { id: "c-alnoor", name: "Al Noor Clinics", kind: "buyer", country: "Qatar", city: "Doha", verified: true, advisorId: "u-asha" },
    { id: "c-meridian", name: "Meridian Logistics", kind: "buyer", country: "United States", city: "New York", verified: false, advisorId: "u-asha" },
    { id: "c-softhealth", name: "SoftHealth Ltd", kind: "partner", country: "Bangladesh", city: "Dhaka", verified: true, advisorId: "u-asha" },
    { id: "c-daffsoft", name: "Daffodil Software Ltd", kind: "partner", country: "Bangladesh", city: "Dhaka", verified: true, advisorId: "u-asha" },
    { id: "c-nexa", name: "Nexa Labs", kind: "partner", country: "Bangladesh", city: "Dhaka", verified: true, advisorId: "u-asha" },
    { id: "c-brainstation", name: "Brainstation Labs", kind: "partner", country: "Bangladesh", city: "Dhaka", verified: true, advisorId: "u-asha" },
    { id: "c-dgix", name: "DGIX Operations", kind: "dgix", country: "Bangladesh", city: "Dhaka", verified: true },
  ],

  products: [
    {
      id: "p-smart-hospital", slug: "smart-hospital", name: "Smart Hospital", partnerId: "c-daffsoft", category: "healthcare",
      tagline: "Billing, EMR and pharmacy for multi-site clinics.",
      description: "Billing, EMR and pharmacy for multi-site clinics. Delivered and supported by DGIX with Daffodil Software Ltd.",
      version: "3.2", markets: ["UAE", "Qatar"], gate: "PG5", status: "listed", checks: checks(),
      metricLabel: "Clinics live", metricValue: "40+", visual: "hospital", goLive: "8–12 weeks", priceFrom: 48200, reviewedOn: "2026-11-12",
    },
    {
      id: "p-ai-hr", slug: "ai-hr-management", name: "AI HR Management", partnerId: "c-daffsoft", category: "hr",
      tagline: "Recruitment, attendance, leave and payroll with GOSI support.",
      description: "Recruitment, attendance, leave and payroll with GOSI and WPS support, in Arabic and English.",
      version: "5.1", markets: ["UAE", "KSA"], gate: "PG5", status: "listed", checks: checks(),
      metricLabel: "Employees managed", metricValue: "120k", visual: "people", goLive: "6–8 weeks", priceFrom: 31500, reviewedOn: "2026-10-28",
    },
    {
      id: "p-smart-business", slug: "smart-business-24", name: "Smart Business 24", partnerId: "c-daffsoft", category: "erp",
      tagline: "Finance, inventory and procurement for growing SMEs.",
      description: "Finance, inventory and procurement for growing SMEs, with FTA VAT and e-invoicing built in.",
      version: "24.3", markets: ["UAE", "Qatar"], gate: "PG5", status: "listed", checks: checks(),
      metricLabel: "SMEs live", metricValue: "300+", visual: "bars", goLive: "4–6 weeks", priceFrom: 18900, reviewedOn: "2026-09-30",
    },
    {
      id: "p-retailflow", slug: "retailflow-pos", name: "RetailFlow POS", partnerId: "c-nexa", category: "retail",
      tagline: "Point of sale, stock and loyalty across every store.",
      description: "Point of sale, stock and loyalty across every store, with offline mode and Arabic receipts.",
      version: "5.0", markets: ["UAE"], gate: "PG4", status: "listed", checks: checks(),
      metricLabel: "Stores live", metricValue: "85", visual: "bag", goLive: "6–10 weeks", priceFrom: 36000, reviewedOn: "2026-11-10", waitingOn: "You · sign-off",
    },
    {
      id: "p-eduvas", slug: "eduvas-university", name: "Eduvas University", partnerId: "c-daffsoft", category: "education",
      tagline: "Campus ERP from admissions to exam results.",
      description: "Campus ERP from admissions to exam results, with LMS and parent portal.",
      version: "8.4", markets: ["UAE", "KSA"], gate: "PG5", status: "listed", checks: checks(),
      metricLabel: "Campuses", metricValue: "24", visual: "campus", goLive: "10–14 weeks", priceFrom: 42000, reviewedOn: "2026-08-14",
    },
    {
      id: "p-central-ai", slug: "central-ai", name: "Central AI", partnerId: "c-nexa", category: "ai",
      tagline: "Agents that read documents and automate back-office work.",
      description: "Agents that read invoices, contracts and claims and automate back-office work, hosted in-region.",
      version: "1.6", markets: ["USA", "UAE"], gate: "PG4", status: "pilot",
      checks: checks({ evidence: [9, "Two references so far"], docs: [7, "API docs incomplete"] }),
      metricLabel: "Docs / day", metricValue: "50k", visual: "ai", goLive: "4–6 weeks", priceFrom: 24000, reviewedOn: "2026-11-05",
    },
    {
      id: "p-clinicdesk", slug: "clinicdesk", name: "ClinicDesk", partnerId: "c-softhealth", category: "healthcare",
      tagline: "Front desk, appointments and insurance claims for clinics.",
      description: "Front desk, appointments and insurance claims for outpatient clinics.",
      version: "2.3", markets: ["Qatar"], gate: "PG5", status: "listed", checks: checks(),
      metricLabel: "Clinics live", metricValue: "18", visual: "hospital", goLive: "6–8 weeks", priceFrom: 22000, reviewedOn: "2026-07-02",
    },
    {
      id: "p-peoplecore", slug: "peoplecore-hr", name: "PeopleCore HR", partnerId: "c-softhealth", category: "hr",
      tagline: "HR, payroll and WPS for 100–2,000 staff. Arabic and English. Cloud.",
      description: "HR, payroll and WPS for 100–2,000 staff. Arabic and English. Cloud.",
      version: "4.2", markets: ["UAE", "KSA"], gate: "PG4", status: "in_review",
      checks: checks({ security: [9, "Pen test needed"], readiness: [8, "Data residency"] }),
      metricLabel: "Employees managed", metricValue: "38k", visual: "people", goLive: "6–8 weeks", priceFrom: 27500, waitingOn: "Partner · pen test",
    },
    {
      id: "p-edusphere", slug: "edusphere", name: "EduSphere", partnerId: "c-brainstation", category: "education",
      tagline: "School management and online classes.",
      description: "School management, timetables and online classes for K-12 groups.",
      version: "3.0", markets: ["KSA"], gate: "PG3", status: "in_review",
      checks: checks({ evidence: [8, "Needs 3 references"], security: [10, "Awaiting SOC report"], readiness: [5, "Arabic UI partial"], docs: [6, "Demo not yet run"] }),
      metricLabel: "Schools", metricValue: "60", visual: "campus", goLive: "8–10 weeks", priceFrom: 21000, waitingOn: "You · demo Tue",
    },
    {
      id: "p-ledgerone", slug: "ledgerone-erp", name: "LedgerOne ERP", partnerId: "c-nexa", category: "finance",
      tagline: "Accounting and VAT for multi-entity groups.",
      description: "Accounting, consolidation and VAT for multi-entity groups.",
      version: "2.1", markets: ["UAE"], gate: "PG2", status: "in_review",
      checks: checks({ evidence: [5, "No foreign references"], security: [6, "Pen test needed"], legal: [2, "IP proof missing"], readiness: [4, "VAT not certified"], docs: [3, "Docs missing"], quality: [15, "Release cadence unclear"] }),
      metricLabel: "Entities", metricValue: "210", visual: "ledger", goLive: "8–12 weeks", priceFrom: 26000, waitingOn: "Partner · IP proof",
    },
    {
      id: "p-pharmacy", slug: "pharmacy-inventory-suite", name: "Pharmacy inventory suite", partnerId: "c-softhealth", category: "healthcare",
      tagline: "Listed once it passes all gates. Ask an advisor to be told first.",
      description: "Pharmacy stock, expiry and controlled-drug tracking.",
      version: "1.2", markets: ["UAE"], gate: "PG3", status: "in_review",
      checks: checks({ evidence: [7], security: [8], readiness: [6], docs: [6] }),
      metricLabel: "Pharmacies", metricValue: "30", visual: "hospital", goLive: "—", priceFrom: 0,
    },
    {
      id: "p-telehealth", slug: "telehealth-consult-platform", name: "Telehealth consult platform", partnerId: "c-brainstation", category: "healthcare",
      tagline: "Listed once it passes all gates. Ask an advisor to be told first.",
      description: "Video consults, e-prescriptions and follow-ups.",
      version: "0.9", markets: ["Qatar"], gate: "PG2", status: "in_review",
      checks: checks({ evidence: [4], security: [7], legal: [6], readiness: [3], docs: [4] }),
      metricLabel: "Consults", metricValue: "—", visual: "hospital", goLive: "—", priceFrom: 0,
    },
  ],

  requests: [
    {
      id: "r-hr-gulf", ref: "REQ-202611-AC498D", buyerId: "c-gulf", title: "HR + payroll, 400 staff",
      need: "HR and payroll for 400 staff across 12 stores in the UAE, with WPS files and Arabic payslips.",
      country: "United Arab Emirates", budget: "$30k–$50k", users: "400", goLive: "Q1 2027", status: "shortlist_sent", ownerId: "u-asha",
      createdAt: "2026-11-12T08:10:00Z", log: [
        { at: "2026-11-12T08:10:00Z", by: "u-omar", kind: "opened", text: "Request opened · 400 users, go-live Q1 2027" },
        { at: "2026-11-12T08:10:00Z", kind: "matched", text: "AI ranked 3 verified products for advisor review" },
        { at: "2026-11-12T14:30:00Z", by: "u-asha", kind: "shortlist", text: "Shortlist confirmed · 2 verified products sent to the buyer" },
        { at: "2026-11-13T06:05:00Z", by: "u-omar", kind: "demo", text: "Demo requested · AI HR Management" },
        { at: "2026-11-13T09:40:00Z", by: "u-nadia", kind: "demo", text: "Demo confirmed by the partner · AI HR Management, 14 Nov 15:00" },
        { at: "2026-11-13T10:15:00Z", by: "u-omar", kind: "demo", text: "Demo requested · PeopleCore HR" },
      ],
      shortlist: [
        { productId: "p-ai-hr", fit: 94, confirmed: true, strengths: ["WPS + GOSI", "Arabic payslips", "Live in 6–8 weeks"], gaps: [] },
        { productId: "p-peoplecore", fit: 88, confirmed: true, strengths: ["Strong UAE payroll", "Lower price"], gaps: ["Pen test due before contract"] },
        { productId: "p-smart-business", fit: 71, confirmed: true, strengths: ["Same vendor as your ERP"], gaps: ["HR module is basic", "No shift rostering"] },
      ],
    },
    {
      id: "r-clinic-alnoor", ref: "REQ-202611-B71F20", buyerId: "c-alnoor", title: "Clinic billing, 3 sites",
      need: "Billing and insurance claims for 3 clinics in Doha, HL7/FHIR, Arabic screens.",
      country: "Qatar", budget: "$40k–$60k", users: "120", goLive: "Feb 2027", status: "matching",
      createdAt: "2026-11-13T05:00:00Z", log: [
        { at: "2026-11-13T05:00:00Z", by: "u-layla", kind: "opened", text: "Request opened · 120 users, go-live Feb 2027" },
        { at: "2026-11-13T05:00:00Z", kind: "matched", text: "AI ranked 3 verified products for advisor review" },
      ], dueAt: "2026-11-13T15:00:00Z",
      shortlist: [
        { productId: "p-smart-hospital", fit: 92, confirmed: false, strengths: ["Multi-site billing", "Qatar ready"], gaps: ["Live by March needs 12 weeks"] },
        { productId: "p-clinicdesk", fit: 84, confirmed: false, strengths: ["Insurance claims"], gaps: ["No pharmacy module"] },
      ],
    },
    {
      id: "r-docs-meridian", ref: "REQ-202611-C02A11", buyerId: "c-meridian", title: "Invoice and contract AI",
      need: "Read 30k supplier invoices a month and route exceptions.",
      country: "United States", budget: "$20k–$40k", users: "25", goLive: "Jan 2027", status: "demo", ownerId: "u-asha",
      createdAt: "2026-11-06T14:00:00Z", log: [
        { at: "2026-11-06T14:00:00Z", by: "u-james", kind: "opened", text: "Request opened · 25 users, go-live Jan 2027" },
        { at: "2026-11-06T14:00:00Z", kind: "matched", text: "AI ranked 2 verified products for advisor review" },
        { at: "2026-11-07T09:20:00Z", by: "u-asha", kind: "shortlist", text: "Shortlist confirmed · 1 verified product sent to the buyer" },
        { at: "2026-11-08T16:45:00Z", by: "u-james", kind: "demo", text: "Demo requested · Central AI" },
        { at: "2026-11-09T08:30:00Z", by: "u-tanvir", kind: "demo", text: "Demo confirmed by the partner · Central AI, 18 Nov 19:00" },
      ],
      shortlist: [{ productId: "p-central-ai", fit: 90, confirmed: true, strengths: ["Hosted in-region", "50k docs/day"], gaps: ["Pilot status: 88/100"] }],
    },
    {
      id: "r-logistics-qatar", ref: "REQ-202611-D44E90", buyerId: "c-gulf", title: "Retail POS, wave 3",
      need: "Extend POS to 6 more stores in Deira.", country: "United Arab Emirates", budget: "$15k–$25k", users: "60", goLive: "Dec 2026",
      status: "won", ownerId: "u-asha", createdAt: "2026-08-02T10:00:00Z", log: [
        { at: "2026-08-02T10:00:00Z", by: "u-omar", kind: "opened", text: "Request opened · retail POS for wave 3 stores" },
        { at: "2026-08-02T10:00:00Z", kind: "matched", text: "AI ranked 3 verified products for advisor review" },
        { at: "2026-08-03T11:00:00Z", by: "u-asha", kind: "shortlist", text: "Shortlist confirmed · 2 verified products sent to the buyer" },
        { at: "2026-08-10T10:00:00Z", by: "u-tanvir", kind: "demo", text: "Demo held · RetailFlow POS" },
        { at: "2026-08-11T07:30:00Z", by: "u-omar", kind: "demo", text: "Demo rated “Strong fit” · RetailFlow POS" },
        { at: "2026-08-20T09:00:00Z", by: "u-asha", kind: "offer", text: "Offer OFF-0019 sent · RetailFlow POS, $48,200" },
        { at: "2026-08-24T12:00:00Z", by: "u-omar", kind: "signed", text: "Offer OFF-0019 accepted and signed · project started" },
      ],
      shortlist: [{ productId: "p-retailflow", fit: 97, confirmed: true, strengths: ["Already live in 12 stores"], gaps: [] }],
    },
  ],

  demos: [
    { id: "d-1", requestId: "r-hr-gulf", productId: "p-ai-hr", buyerId: "c-gulf", at: "2026-11-14T11:00:00Z", status: "booked", questions: 2 },
    { id: "d-2", requestId: "r-docs-meridian", productId: "p-central-ai", buyerId: "c-meridian", at: "2026-11-18T15:00:00Z", status: "booked", questions: 0 },
    { id: "d-3", requestId: "r-hr-gulf", productId: "p-peoplecore", buyerId: "c-gulf", at: "2026-11-17T07:00:00Z", status: "requested", questions: 0 },
    { id: "d-4", productId: "p-retailflow", buyerId: "c-gulf", at: "2026-08-10T10:00:00Z", status: "done", notes: "Loved offline mode. Asked for loyalty export.", questions: 3 },
  ],

  offers: [
    {
      id: "o-retail-w2", ref: "OFF-0019", requestId: "r-logistics-qatar", productId: "p-retailflow", buyerId: "c-gulf", price: 48200,
      sla: "99.5% uptime, 4h response", warranty: "12 months", exit: "Data export in 30 days, no lock-in",
      milestones: [
        { title: "Setup & data migration", amount: 9640 },
        { title: "Store rollout, wave 1", amount: 9640 },
        { title: "Store rollout, wave 2", amount: 9640 },
        { title: "Store rollout, wave 3", amount: 9640 },
        { title: "Training & handover", amount: 9640 },
      ],
      status: "accepted", sentAt: "2026-08-20", signedAt: "2026-08-24",
    },
    {
      id: "o-hr-gulf", ref: "OFF-0027", requestId: "r-hr-gulf", productId: "p-ai-hr", buyerId: "c-gulf", price: 34800,
      sla: "99.5% uptime, 4h response", warranty: "12 months", exit: "Data export in 30 days, no lock-in",
      milestones: [
        { title: "Setup & payroll import", amount: 10440 },
        { title: "WPS + GOSI go-live", amount: 13920 },
        { title: "Training & handover", amount: 10440 },
      ],
      status: "draft", rating: "Strong fit",
    },
  ],

  projects: [
    {
      id: "pr-retailflow", name: "RetailFlow rollout · 12 stores", offerId: "o-retail-w2", productId: "p-retailflow", buyerId: "c-gulf", partnerId: "c-nexa",
      city: "Dubai", health: "on_track",
      milestones: [
        { id: "m1", title: "Setup & data migration", status: "done", due: "2026-09-10", acceptedOn: "2026-09-12", amount: 9640 },
        { id: "m2", title: "Store rollout, wave 1", status: "done", due: "2026-10-05", acceptedOn: "2026-10-08", amount: 9640 },
        { id: "m3", title: "Store rollout, wave 2", status: "in_review", due: "2026-11-02", amount: 9640 },
        { id: "m4", title: "Store rollout, wave 3", status: "upcoming", due: "2026-11-25", amount: 9640 },
        { id: "m5", title: "Training & handover", status: "upcoming", due: "2026-12-05", amount: 9640 },
      ],
    },
    {
      id: "pr-clinicdesk", name: "ClinicDesk rollout · Doha", productId: "p-clinicdesk", buyerId: "c-alnoor", partnerId: "c-softhealth",
      city: "Doha", health: "at_risk", daysLate: 9,
      milestones: [
        { id: "m1", title: "Setup & migration", status: "done", due: "2026-09-20", acceptedOn: "2026-09-25", amount: 6600 },
        { id: "m2", title: "Clinic 1 go-live", status: "in_progress", due: "2026-11-04", amount: 6600 },
        { id: "m3", title: "Clinics 2–3 go-live", status: "upcoming", due: "2026-12-01", amount: 6600 },
        { id: "m4", title: "Training & handover", status: "upcoming", due: "2026-12-20", amount: 2200 },
      ],
    },
    {
      id: "pr-peoplecore-ksa", name: "PeopleCore pilot · Riyadh", productId: "p-peoplecore", buyerId: "c-gulf", partnerId: "c-softhealth",
      city: "Riyadh", health: "on_track",
      milestones: [
        { id: "m1", title: "Pilot setup", status: "done", due: "2026-10-15", acceptedOn: "2026-10-16", amount: 4000 },
        { id: "m2", title: "Milestone 2 · payroll run", status: "in_progress", due: "2026-11-21", amount: 5270 },
      ],
    },
  ],

  invoices: [
    { id: "i-38", ref: "INV-0038", buyerId: "c-gulf", projectId: "pr-retailflow", milestone: "Setup & data migration", amount: 9640, due: "2026-09-20", status: "verified", paidOn: "2026-09-18" },
    { id: "i-40", ref: "INV-0040", buyerId: "c-gulf", projectId: "pr-retailflow", milestone: "Store rollout, wave 1", amount: 9640, due: "2026-10-18", status: "verified", paidOn: "2026-10-15" },
    { id: "i-42", ref: "INV-0042", buyerId: "c-gulf", projectId: "pr-retailflow", milestone: "Milestone 3", amount: 6200, due: "2026-11-16", status: "due" },
    { id: "i-43", ref: "INV-0043", buyerId: "c-alnoor", projectId: "pr-clinicdesk", milestone: "Setup & migration", amount: 6600, due: "2026-10-05", status: "paid", paidOn: "2026-10-04" },
    { id: "i-44", ref: "INV-0044", buyerId: "c-gulf", projectId: "pr-peoplecore-ksa", milestone: "Pilot setup", amount: 4000, due: "2026-10-30", status: "verified", paidOn: "2026-10-28" },
  ],

  payouts: [
    { id: "po-1", partnerId: "c-softhealth", invoiceId: "i-44", gross: 4000, fee: 600, net: 3400, status: "paid", date: "2026-11-05" },
    { id: "po-2", partnerId: "c-softhealth", invoiceId: "i-43", gross: 6600, fee: 990, net: 5610, status: "scheduled", date: "2026-11-20" },
    { id: "po-3", partnerId: "c-nexa", invoiceId: "i-40", gross: 9640, fee: 1446, net: 8194, status: "paid", date: "2026-10-30" },
    { id: "po-4", partnerId: "c-softhealth", invoiceId: "i-42", gross: 6200, fee: 930, net: 5270, status: "pending_payment", date: "2026-11-20" },
  ],

  licences: [
    { id: "l-1", buyerId: "c-gulf", productId: "p-retailflow", seats: 85, used: 79, renews: "2027-08-24", status: "active" },
    { id: "l-2", buyerId: "c-gulf", productId: "p-peoplecore", seats: 40, used: 22, renews: "2026-12-15", status: "expiring" },
    { id: "l-3", buyerId: "c-alnoor", productId: "p-clinicdesk", seats: 60, used: 41, renews: "2027-09-25", status: "active" },
  ],

  cases: [
    {
      id: "cs-1", ref: "CASE-0112", companyId: "c-gulf", projectId: "pr-retailflow", title: "Receipt printer down · Deira store", priority: "high", status: "open", opened: "2026-11-13T06:20:00Z",
      messages: [
        { from: "u-omar", at: "2026-11-13T06:20:00Z", body: "Two tills at the Deira store can't print receipts since this morning." },
        { from: "u-asha", at: "2026-11-13T06:41:00Z", body: "Nexa Labs is on it — engineer remote session at 11:00 GST. I'll update you here." },
      ],
    },
    {
      id: "cs-2", ref: "CASE-0108", companyId: "c-alnoor", projectId: "pr-clinicdesk", title: "Clinic 1 go-live slipped", priority: "urgent", status: "waiting", opened: "2026-11-06T09:00:00Z",
      messages: [{ from: "u-asha", at: "2026-11-06T09:00:00Z", body: "Partner missed 2 milestone dates. Recovery plan requested by Friday." }],
    },
    {
      id: "cs-3", ref: "CASE-0097", companyId: "c-softhealth", title: "Payout query · October", priority: "low", status: "resolved", opened: "2026-10-31T09:00:00Z",
      messages: [
        { from: "u-rahim", at: "2026-10-31T09:00:00Z", body: "October payout is $930 lower than expected." },
        { from: "u-farhan", at: "2026-11-01T10:00:00Z", body: "That's the 15% DGIX fee on INV-0044 per your MOU. Statement attached." },
      ],
    },
  ],

  notifications: [
    { id: "n-1", userId: "u-omar", title: "Your shortlist is ready", body: "3 verified matches, confirmed by Asha.", at: "2026-11-13T08:00:00Z", read: false, href: "/buyer/shortlist" },
    { id: "n-2", userId: "u-omar", title: "Invoice INV-0042 due", body: "$6,200 · due in 3 days", at: "2026-11-13T07:00:00Z", read: false, href: "/buyer/billing" },
    { id: "n-3", userId: "u-rahim", title: "2 checks left to 100/100", body: "Upload the pen test and confirm UAE data residency.", at: "2026-11-13T06:00:00Z", read: false, href: "/seller/verification" },
    { id: "n-4", userId: "u-rahim", title: "New lead · Retail group, UAE", body: "Demo requested for PeopleCore HR.", at: "2026-11-12T12:00:00Z", read: false, href: "/seller/leads" },
    { id: "n-5", userId: "u-asha", title: "Shortlist due in 2h", body: "Clinic billing, Qatar · 2 products AI-ranked", at: "2026-11-13T08:00:00Z", read: false, href: "/admin/matching" },
    { id: "n-6", userId: "u-asha", title: "ClinicDesk rollout at risk", body: "9 days behind in Doha", at: "2026-11-13T05:00:00Z", read: false, href: "/admin/delivery" },
  ],
};

export const articles: Article[] = [
  { slug: "why-most-products-fail-the-gate", title: "Why 62% of products fail our gate", excerpt: "Security and IP proof sink most applicants. Here's what passing looks like.", tag: "Verification", minutes: 6, date: "2026-11-10", author: "Asha Rahman" },
  { slug: "wps-payroll-checklist", title: "The UAE WPS payroll checklist", excerpt: "Eleven things to confirm before your HR system goes live in the Emirates.", tag: "Buying guide", minutes: 8, date: "2026-11-02", author: "DGIX Advisory" },
  { slug: "fta-e-invoicing-2027", title: "FTA e-invoicing: what changes in 2027", excerpt: "A plain-language guide for finance teams in the UAE.", tag: "Regulation", minutes: 5, date: "2026-10-21", author: "Farhan Hossain" },
  { slug: "sovereign-ai-gcc", title: "Sovereign AI in the GCC", excerpt: "Why in-region hosting matters, and how we check it.", tag: "AI", minutes: 7, date: "2026-10-12", author: "DGIX Advisory" },
  { slug: "milestone-payments", title: "Why we pay per milestone", excerpt: "How milestone billing protects buyers and keeps partners on schedule.", tag: "Money", minutes: 4, date: "2026-09-30", author: "Farhan Hossain" },
  { slug: "bangladesh-software-exports", title: "Bangladesh's quiet software export boom", excerpt: "From outsourcing to products: the companies behind the shift.", tag: "Market", minutes: 9, date: "2026-09-15", author: "DGIX Advisory" },
];

export const faqs: Faq[] = [
  { group: "buying", q: "Does buying through DGIX cost more?", a: "No. You pay the quoted price. The partner pays DGIX." },
  { group: "buying", q: "Is the matching done only by AI?", a: "No. AI ranks the options, then a named advisor checks the fit and confirms every shortlist before you see it." },
  { group: "buying", q: "Who do I sign the contract with?", a: "With DGIX. One contract covers price, SLA, warranty and exit terms, whoever built the product." },
  { group: "buying", q: "Who supports the product after go-live?", a: "The partner provides support under the SLA in your contract, and DGIX stays your single point of contact." },
  { group: "buying", q: "Which countries do you serve?", a: "The USA and the GCC first: UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman." },
  { group: "trust", q: "What does Daffodil Verified mean?", a: "The product scored 100/100 across eight checks and cleared all six gates. Only a full 100 is listed as globally ready." },
  { group: "trust", q: "What happens if a product's score drops?", a: "It's re-reviewed after every major release or incident. Fall below the bar and the listing is suspended." },
  { group: "money", q: "How do payments work?", a: "You pay DGIX per accepted milestone. Finance verifies each payment before the partner is paid." },
  { group: "money", q: "Can I pay upfront?", a: "You don't need to. Milestone payments mean you only pay for work you've accepted." },
  { group: "selling", q: "What does it cost to list?", a: "Nothing upfront. DGIX keeps a fee set in your MOU, typically around 15%, from each paid milestone." },
  { group: "selling", q: "How long does verification take?", a: "Most partners move from application to listing in 6–10 weeks, depending on how fast evidence arrives." },
];

export const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US");
