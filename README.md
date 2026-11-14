# DGIX — Daffodil Global Innovation Exchange

Frontend for **DGIX**, Daffodil's global innovation exchange: verified software from Bangladesh, matched to buyers in the USA and GCC, delivered under one contract.

This repository contains the public marketing site and three role-based portals (Buyer, Seller, Staff), built as a 1-1 implementation of the DGIX Paper design file. All data comes from local seed data, so every flow can be tested end to end without a backend.

> **Status:** v1.0.0 — complete UI with mock data and a mock sign-in. There is no real backend, authentication or payments yet.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 with DGIX design tokens (`src/app/globals.css`) |
| 3D | three.js via React Three Fiber (hero globe) |
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

1. **Buyer (Omar):** create a request at `/buyer/requests/new`, open the shortlist and book a demo.
2. **Staff (Asha):** confirm a shortlist in **Matching desk**, then send the AI HR offer to the buyer in **Offers & contracts**.
3. **Buyer:** accept and sign the offer, accept a milestone in **Projects**, then pay the invoice in **Billing**.
4. **Staff (Farhan or Asha):** verify the payment in **Finance**. This schedules the partner payout, minus the DGIX fee.
5. **Seller (Rahim):** see the payout in **Payouts**, upload verification evidence, and confirm demos.
6. **Staff:** approve a product's open checks in **Product review** until it reaches 100/100 and is listed.

## Project structure

```
src/
  app/
    (marketing)/        Public site: home, solutions, products, markets, search,
                        how it works, verified, sell, pricing, about, insights,
                        contact, faq, legal
    (auth)/             Sign in, create account
    buyer/              Buyer portal (9 screens)
    seller/             Seller portal (8 screens)
    admin/              Staff console (7 screens)
    not-found.tsx       404
  components/
    marketing/          Nav, footer, hero, globe, page sections, catalogue
    portal/             PortalShell (sidebar + top bar) and shared UI primitives
    buyer/ seller/ admin/ auth/   Role-specific components
    ui/                 Icon, Avatar
  lib/
    types.ts            Domain types
    seed.ts             Seed data for all users and modules
    store.tsx           Client store: session, persistence, flow actions
  middleware.ts         Role-based route protection
public/
  brand/                Logos and favicons
  media/                Optimised images (WebP) and the explainer video
  data/globe-dots.bin   Precomputed land dots for the 3D globe
scripts/
  gen-globe-dots.mjs    Generates globe-dots.bin from Natural Earth data
docs/
  BUILD_GUIDE.md        Conventions for turning Paper artboards into code
```

## Design system

- **Tokens** live in `src/app/globals.css` (`@theme`): colours (`ink`, `primary`, `mist`, `line`, `night`, `sky`, `amber`, …), type sizes, tracking and radius.
- **Radius:** one 8px radius is used everywhere. Only true circles (avatars, dots, round icon buttons) use `rounded-full`.
- **Responsive:** layouts work from 353px wide. Above 2400px the page scales up proportionally (QHD to 4K), so large screens keep the 1440–1920 design proportions.
- **Motion:** respects `prefers-reduced-motion`. Lenis drives the GSAP ticker, so ScrollTrigger and Framer Motion reveals stay in sync with smooth scrolling.

## Performance notes

- Images are WebP and served through `next/image` where possible. The explainer video is compressed to 720p and loads only when the player opens.
- The 3D globe is code-split and loaded on demand. Its land dots come precomputed in a 184 KB binary, and rendering pauses when the hero is off screen.

## Versioning

This project follows [Semantic Versioning](https://semver.org). Each release is tagged `vMAJOR.MINOR.PATCH` and recorded in [CHANGELOG.md](CHANGELOG.md).

## Known limitations

- No backend. Data lives in the browser's `localStorage` per device.
- Create account does not save a new user. Some secondary actions (demo rating, reschedule, licence seats) only update the page until reload.
- Some charts on the Staff and Seller dashboards use fixed values from the design rather than seed data.
