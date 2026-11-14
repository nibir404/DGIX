# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org).

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

[1.0.0]: https://github.com/nibir404/DGIX/releases/tag/v1.0.0
