# DGIX frontend — build guide

Next.js 15 (App Router) + Tailwind v4 + three.js (R3F) + GSAP + Framer Motion + Lenis.
The source of truth for every screen is the Paper file **DGIX** (file id `01M7AJANPGV2V2X2CHJEY94G90`).
Goal: a 1-1 copy of each artboard, made interactive, reading/writing the seed store.

## Paper → code
- Load the Paper guide first: `get_guide({ topic: "paper-mcp-instructions" })`.
- For each artboard: `get_tree_summary` → `get_jsx` (format `tailwind`, `includeNodeIds: false`) per section → `get_screenshot` to compare.
- Use exact values from JSX (sizes, colors, radii, spacing). Never eyeball from screenshots.
- Images on Paper (`https://app.paper.design/file-assets/...` URLs): download with `curl -sL <url> -o public/media/<name>.png` and reference `/media/<name>.png`. Reuse files already in `public/`.
- Translate Paper font families (`PlusJakartaSans-Light` etc.) to `font-light` / `font-medium` etc. Fonts are already loaded (`font-sans` = Plus Jakarta Sans, `font-mono` = JetBrains Mono).
- Map hex values to tokens in `src/app/globals.css` (`text-ink`, `bg-mist`, `border-line`, `text-muted`, `bg-primary`, `bg-night`, `text-sky`, `bg-amber`, `text-haze`…). Helper surfaces: `bg-night-hero`, `bg-night-panel`, `bg-verified`, `hatch`, `hatch-light`.
- Desktop artboards are 1440 wide with a 16px outer inset; sections are rounded panels. Make every page responsive down to 375px (stack columns, 16–24px gutters, no horizontal scroll).

## Shared code (do NOT edit — import it)
- `src/lib/types.ts`, `src/lib/seed.ts` (seed data, `CHECK_META`, `GATES`, `articles`, `faqs`, `fmtMoney`, `TEST_PASSWORD`), `src/lib/store.tsx` (`useStore()` → `db`, `user`, actions; `useLookup()`).
- Marketing: `PageHero` / `SectionHead` (`src/components/marketing/PageHero.tsx`), `SiteNav`, `SiteFooter` (already in the marketing layout), `Reveal` / `Stagger` / `staggerItem`, `SmoothScroll` (Lenis; already in layout).
- Portal: `PortalShell` (already wraps `/buyer`, `/seller`, `/admin` via layouts), and primitives in `src/components/portal/ui.tsx`: `PageTitle`, `Card`, `NightCard`, `Stats`, `Chip`, `Button`, `Progress`, `Table`, `Empty`, `Toast`, `dateShort`, `dateLong`.
- `Icon` (`src/components/ui/Icon.tsx`) and `Avatar`.
If you need a new shared primitive, put it in your own folder instead of editing shared files. If a shared file is genuinely broken, say so in your report rather than editing it.

## Motion
- Marketing: Framer Motion `Reveal`/`Stagger` for section entrances; GSAP + ScrollTrigger for scroll-linked effects (pin, scrub, counters); Lenis is global. Keep it tasteful; respect `prefers-reduced-motion`.
- Portals: light Framer Motion only (card entrance, list stagger, layout transitions).

## Data & flows
- All pages are client components that read `useStore().db`. Buttons that represent actions must call store actions (e.g. `acceptMilestone`, `payInvoice`, `confirmShortlist`, `approveCheck`, `verifyPayment`, `bookDemo`, `acceptOffer`, `sendOffer`, `uploadEvidence`, `submitMilestone`, `confirmDemo`, `createRequest`, `openCase`, `replyCase`) and show a `Toast`.
- Filter by the signed-in user's company (`user.companyId`). Staff see everything.
- Use `next/link` for all navigation; every visible link/button should go somewhere real.

## Checks before reporting
`npx tsc --noEmit` must pass for your files. Do not start the dev server (another process may own port 3000); do not run `next build`.
