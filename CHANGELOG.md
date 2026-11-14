# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org).

## [Unreleased]

### Changed
- "Message your advisor" moved into the account menu (advisor photo, online status and a Message action); the sidebar foot now shows only your own account.
- Removed the line above the home hero heading.

## [1.2.0] — 2026-11-14

The whole DGIX workflow now runs end to end for buyer, seller and staff, ready to present live, and the home page has a new centred hero, a line-art globe and an immersive app section.

### Added
- **Home hero, redesigned:** centred badge text, heading, description and search over the globe, with the "How DGIX works" film as a poster-thumbnail card in the bottom-left corner and live activity in the bottom-right.
- **Line-art globe:** a dark sphere with a thin latitude/longitude grid, crisp white coastlines (Natural Earth 50m), a fine land dot grid, a glowing Dhaka marker and routes to Dubai, Riyadh, Doha and New York. Drag to turn; it drifts gently and pauses off screen. Replaces the three.js particle globe.
- **Sticky search:** "Find my match" is a white pill with a round send button in a frosted, blurred surround. Once you scroll past the hero, a copy stays pinned to the bottom of the screen.
- **Download app section, rebuilt:** a brand-blue panel with "Download the DGIX app today", black Google Play and direct-APK buttons, and a realistic phone mock-up (metal frame, side buttons, Dynamic Island, DGIX app screen) tilted and bleeding off the panel.
- **Demo outcome:** sellers can **Mark demo held**, and the buyer's rating (Not for us / Maybe / Strong fit) is saved and sent to their advisor.
- **Offer drafting for staff:** a **Ready for an offer** list in Offers & contracts shows requests with a shortlist or demo but no offer. **Draft offer** opens a pre-filled offer (price, SLA, warranty, exit terms, 30/40/30 milestones) to save as a draft or send to the buyer.
- **Add product for sellers:** a dialog (also opened from the top-bar shortcut) creates a product at PG0 with every check open, ready for evidence and DGIX review.
- **Licence at handover:** accepting the last milestone completes the project and starts an active licence for the buyer.
- **Notifications at every hand-off:** order won, milestone accepted, invoice ready, payment verified, payout scheduled and sent, offer declined, project delivered, new product submitted, demo rated.
- "Use sample document" shortcuts on seller evidence and sign-off uploads, so a live demo doesn't need the file picker.
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md): a presenter's script for the full workflow.

### Changed
- Dot-and-label pill badges ("New · Android app", the hero badge) are replaced with plain eyebrow text.

### Fixed
- **Approve payouts** in Finance now marks payouts as paid for the seller (it only changed the screen before).
- Matching desk sends only the products that are ticked (it sent all of them).
- The go-live chip on Matching desk reads "Go-live flexible" instead of "Before Flexible".
- After a seller uploads evidence for every open check, the product waits on "DGIX review" instead of "Partner evidence".
- Declining an offer closes the request and tells the advisor.

## [1.1.0] — 2026-11-14

Mobile and tablet support across the whole product, the Android app on the marketing site, an account menu with a settings page, and a security upgrade.

### Security
- Upgraded Next.js from 15.5.4 to 15.5.29 and React / React DOM from 19.1.0 to 19.1.10 to patch the React Server Components remote code execution flaw ([CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478)). Vercel was blocking deploys of the vulnerable version.

### Added
- **Mobile menu on the marketing site.** Below 1024px the nav links collapse into a full-screen menu with all pages, Sign in and the main call to action.
- **Mobile and tablet menu in the portals.** Below 1024px the buyer, seller and staff sidebars become a slide-out drawer.
- **Android app.** A "DGIX is now on Google Play" section on the home page (Play Store button, QR code, phone mock-up) and a new `/app` page with install steps, safety notes and a direct APK download with its SHA-256 checksum. App details live in `src/lib/app.ts`.
- **Account menu** for buyer, seller and staff, opened from the avatar in the top bar or the user row in the sidebar: name, email, company, Profile, Account settings, Help & support and Sign out.
- **Profile & settings page** at `/buyer/account`, `/seller/account` and `/admin/account`: edit name, job title and email, change password, two-factor status, notification preferences and sign out. Saved to the local demo data.
- **Icons for the six product gates** on the Daffodil Verified page, plus calendar, thumbs up/down and help icons in the shared icon set.

### Changed
- The nav call to action now reads **"Get on board"** (was "Get my shortlist").
- The top-bar shortcut in the portals (New request / Add product / New shortlist) is now a secondary outline button, so each screen has one solid primary action.
- The yellow and amber glows and gradients are removed site-wide; fills that used them now use the blue brand gradient.
- "Find my match" search boxes glow blue while focused, and the hero box hides its typing example while you type.
- The favicon is now the official DGIX symbol on a transparent background, with a white-backed icon for iOS home screens.
- Every dropdown uses the same chevron, inset from the edge; form fields in dialogs share padding and focus styles.
- Emoji used as icons are replaced with line icons.
- The "amber" avatar tone is now white text on deep blue for better contrast.

### Fixed
- Pages no longer lose their right edge on 320px phones (minimum width lowered from 353px to 280px).
- Staff Today, Finance and Matching desk no longer overflow the screen on phones.
- The notifications panel and portal search box fit narrow screens.
- "Economics" no longer splits mid-word in the product gates; the gate grid sizes to its own container (2, 3 or 6 columns).
- Removed an unused variable that produced the only lint warning.

## [1.0.0] — 2026-11-14

First complete release of the DGIX frontend.

### Added
- **Marketing site:** Home, Solutions catalogue, category pages, market pages (UAE, Qatar, KSA, USA), product pages, AI search results, How it works, Daffodil Verified, Sell with us, Pricing, About, Insights (list and articles), Contact, FAQ, Terms, Privacy, Cookies, 404 page and cookie banner.
- **Home hero:** 3D globe (three.js) styled after the Paper artwork, with routes from Dhaka, a typewriter AI search bar, live activity cards and a pop-up explainer film.
- **Navigation:** signed-in and signed-out states with a role-specific account menu, and a compact frosted nav that sticks on scroll.
- **Buyer portal:** Home, requests and new request, shortlist, demos, offers and contracts, projects, billing, licences, support.
- **Seller portal:** Home, products and passport, verification, leads and demos, orders and delivery, payouts, agreement, support.
- **Staff console:** Today, matching desk, product review (PG0–PG5 gates), offers and contracts, delivery, finance, partners and buyers.
- **Seed data and mock sign-in** for 8 users across all roles, with role-based route protection and "Reset demo data".
- **Working flows:** request → shortlist → demo → offer → project → milestone → invoice → payment verification → payout, plus product verification up to 100/100 and listing.
- **Motion:** Lenis smooth scrolling synced with GSAP ScrollTrigger, Framer Motion reveals, reduced-motion support.
- **Responsive layouts** from 353px up to 4K.

### Performance
- Media converted to WebP (about 25 MB saved). Explainer video compressed from 66 MB to 6 MB and loaded on demand.
- Globe code-split and paused off screen, with precomputed land-dot data.

[Unreleased]: https://github.com/nibir404/DGIX/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/nibir404/DGIX/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/nibir404/DGIX/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nibir404/DGIX/releases/tag/v1.0.0
