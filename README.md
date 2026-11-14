# DGIX — Daffodil Global Innovation Exchange

Frontend for **DGIX**, Daffodil's global innovation exchange: verified software from Bangladesh, matched to buyers in the USA and GCC, delivered under one contract.

**Live site:** [dgix-rho.vercel.app](https://dgix-rho.vercel.app) · deployed on Vercel from `main`. Sign in with the test accounts at [/sign-in](https://dgix-rho.vercel.app/sign-in) to try the portals.

This repository contains the public marketing site and three role-based portals (Buyer, Seller, Staff), built as a 1-1 implementation of the DGIX Paper design file. All data comes from local seed data, so every flow can be tested end to end without a backend.

> **Status:** v1.5.1. Complete UI with mock data and a mock sign-in, responsive from phones to 4K. There is no real backend, authentication or payments yet. See [CHANGELOG.md](CHANGELOG.md) for what changed in each version.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 with DGIX design tokens (`src/app/globals.css`) |
| Globe | d3-geo orthographic projection on a 2D canvas, Natural Earth data via world-atlas (hero globe) |
| Motion | GSAP + ScrollTrigger (scroll-linked), Framer Motion (UI transitions), Lenis (smooth scroll) |
| Fonts | Plus Jakarta Sans, JetBrains Mono (`next/font`) |
| Data | Client-side store seeded from `src/lib/seed.ts`, persisted to `localStorage` |

## Getting started

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (includes lint and type check) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run globe:dots` | Regenerate `public/data/globe-dots.bin` (land dots for the hero globe) |

## Test accounts

Go to **/sign-in**. The **Test accounts** panel lists every seed user with a one-click **Sign in as** button. All seed users share one test password, which is shown in that panel (`TEST_PASSWORD` in `src/lib/seed.ts`). It is a local test value only.

| Role | User | Company | Portal |
| --- | --- | --- | --- |
| Buyer | Omar Khalid | Gulf Retail Group (UAE) | `/buyer` |
| Buyer | Layla Haddad | Al Noor Clinics (Qatar) | `/buyer` |
| Buyer | James Porter | Meridian Logistics (USA) | `/buyer` |
| Seller | Rahim Karim | SoftHealth Ltd | `/seller` |
| Seller | Nadia Chowdhury | Daffodil Software Ltd | `/seller` |
| Seller | Tanvir Ahmed | Nexa Labs | `/seller` |
| Staff | Asha Rahman | DGIX Operations (advisor) | `/admin` |
| Staff | Farhan Hossain | DGIX Operations (finance) | `/admin` |

**Reset demo data** on the sign-in page restores the seed state. Portal routes are protected by role (`src/middleware.ts`): each role can only open its own portal.

## End-to-end flow to try

Every hand-off below is a real action that updates the shared demo data and notifies the next person. For a presenter's click-by-click version, see **[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)**.

**Buying, delivery and money**

1. **Buyer (Omar):** describe a need at `/buyer/requests/new`. AI ranks matching products.
2. **Staff (Asha):** in **Matching desk**, tick the products to share and send the shortlist.
3. **Buyer:** on the shortlist, **Book demo**.
4. **Seller (the product's partner, e.g. Nadia for Smart Hospital):** in **Leads & demos**, confirm the time, then **Mark demo held**.
5. **Buyer:** in **Demos**, rate it (**Strong fit**).
6. **Staff (Asha):** in **Offers & contracts → Ready for an offer**, **Draft offer** and **Send to buyer**.
7. **Buyer:** sign and accept the offer. A project starts with milestone 1 in progress.
8. **Seller:** in **Orders & delivery**, attach sign-off evidence and **Submit for buyer review**.
9. **Buyer:** **Accept milestone** (this raises the invoice), then pay it in **Billing**.
10. **Staff (Farhan or Asha):** in **Finance**, **Verify payment**, then **Approve payouts**. The seller's net (minus the 15% DGIX fee) shows as paid in **Payouts**.
11. Repeat steps 8–9 for each milestone. When the last one is accepted, the buyer's licence becomes active in **Licences**.

**Seller onboarding**

1. **Seller (Rahim):** **Add product** (top bar), then upload evidence for each check in **Verification**.
2. **Staff (Asha):** in **Product review**, approve each check. At 100/100 the product is listed in the public catalogue.

## Project structure

```
src/
  app/
    (marketing)/        Public site: home, solutions, products, markets, search,
                        how it works, verified, sell, pricing, about, insights,
                        contact, faq, legal, app (Android download),
                        apply (partner application)
    (auth)/             Sign in, create account
    buyer/              Buyer portal (9 screens + account)
    seller/             Seller portal (8 screens + account)
    admin/              Staff console (7 screens + account)
    not-found.tsx       404
  components/
    marketing/          Nav, footer, hero, globe, page sections, catalogue
    portal/             PortalShell (sidebar + top bar), AccountMenu, AccountPage
                        and shared UI primitives
    buyer/ seller/ admin/ auth/   Role-specific components
    ui/                 Icon, Avatar
  lib/
    types.ts            Domain types
    seed.ts             Seed data for all users and modules
    store.tsx           Client store: session, persistence, flow actions
    app.ts              Android app links, version and checksum
  middleware.ts         Role-based route protection
public/
  brand/                Logos and favicons
  media/                Optimised images (WebP) and the explainer video
  data/globe-dots.bin   Precomputed land dots for the hero globe
  data/land-50m.json    Natural Earth 50m coastlines for the hero globe
scripts/
  gen-globe-dots.mjs    Generates globe-dots.bin from Natural Earth data
docs/
  BUILD_GUIDE.md        Conventions for turning Paper artboards into code
  RELEASING.md          Versioning, changelog and tagging process
  DEMO_SCRIPT.md        Click-by-click script for presenting the full workflow
```

## Design system

- **Tokens** live in `src/app/globals.css` (`@theme`): colours (`ink`, `primary`, `mist`, `line`, `night`, `sky`, `amber`, …), type sizes, tracking and radius.
- **Radius:** one 8px radius is used everywhere. Only true circles (avatars, dots, round icon buttons) use `rounded-full`.
- **Responsive:** layouts work from 280px wide (small phones and folded screens). Below 1024px the site nav and the portal sidebars become menus. Above 2400px the page scales up proportionally (QHD to 4K), so large screens keep the 1440–1920 design proportions.
- **Motion:** respects `prefers-reduced-motion`. Lenis drives the GSAP ticker, so ScrollTrigger and Framer Motion reveals stay in sync with smooth scrolling.

## Performance notes

- Images are WebP and served through `next/image` where possible. The explainer video is compressed to 720p and loads only when the player opens.
- The hero globe is code-split and drawn on a 2D canvas. Its land dots come precomputed in a 184 KB binary, the coastlines load after first paint, and drawing pauses when the hero is off screen.

## Versioning

This project follows [Semantic Versioning](https://semver.org). Each release is tagged `vMAJOR.MINOR.PATCH` and recorded in [CHANGELOG.md](CHANGELOG.md). The full process (commit prefixes, when to bump which number, how to tag and publish) is in [docs/RELEASING.md](docs/RELEASING.md).

| Version | Date | Highlights |
| --- | --- | --- |
| v1.5.1 | 2026-11-14 | Live activity card removed from the home hero |
| v1.5.0 | 2026-11-14 | Partner application page and hero CTAs |
| v1.4.0 | 2026-11-14 | More prominent "Why not go direct?" comparison |
| v1.3.0 | 2026-11-14 | Glowing amber Bangladesh and golden routes on the globe, social link previews, FAQ fix |
| v1.2.1 | 2026-11-14 | Advisor in the account menu, simpler hero top, toggle fix |
| v1.2.0 | 2026-11-14 | End-to-end workflow for all three roles, new home hero, line-art globe, sticky search, app section |
| v1.1.0 | 2026-11-14 | Mobile and tablet support, Android app section, account menu and settings, Next.js security upgrade |
| v1.0.0 | 2026-11-14 | First complete release |

## Known limitations

- No backend. Data lives in the browser's `localStorage` per device.
- Create account does not save a new user. Profile, password and notification changes are saved only in this browser's demo data. Some secondary actions (demo rating, reschedule, licence seats) only update the page until reload.
- Some charts on the Staff and Seller dashboards use fixed values from the design rather than seed data.
