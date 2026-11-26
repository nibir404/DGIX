# Merge plan: backend branches into `main`

Status: **steps 1 and 2 done on `integrate/backend`** (26 Nov 2026). Written against `main` at v1.7.0 (`221111c`).

## Progress

| Step | State | Commit |
| --- | --- | --- |
| 1 · Merge Pial's branch | Done: 11 conflicts resolved, type-check, lint (0 errors) and build pass | `725971a` |
| 2 · Merge Masum's branch | Done: 8 conflicts resolved, type-check, lint (0 errors) and build (52 pages) pass | `af52ca0` |
| 3 · Run against the backend | **Blocked:** needs the BFF and Keycloak test personas | |
| 4 · Re-implement v1.7.0 features on the backend | Not started; needs the backend additions below | |
| 5 · Verify and release v2.0.0 | Not started | |

Provisional choices made while merging (change them if the team decides otherwise):
- **Sign-up:** Pial's `CreateAccountForm` is kept; Masum's unified onboarding wizard is in the tree but not wired to `/create-account`.
- **Demo switcher:** deleted. The demo script now says to sign in as each Keycloak persona.
- **Main button:** keeps the label "Get on board" and now goes to `/create-account`.

Found during the merge:
- **Declining an offer doesn't reach the backend at all.** Pial's `declineOffer` only marks it in the page's memory, so the offer comes back after a reload. The BFF needs a decline endpoint (with a reason).
- **Milestone endpoints disagree.** Pial calls `/bff/v1/delivery/projects/…`; Masum called `/bff/v1/finance/delivery/projects/…`. The merge uses Pial's path everywhere. The backend team should confirm it.
- **Payout maths:** Masum's version is kept (reads fee and hold from the server). Pial's fell back to a hard-coded `+ 8000` and a 5% hold.
- **Masum's key dictionary (`nav.home` …) isn't used by any screen yet**, so the portals don't translate. Arabic sets the page right-to-left, which no screen has been checked in.
- **Two kill-switch screens:** Pial's governance page and Masum's `/admin/brd-ops`. Keep one.
- **Lint:** 8 warnings remain, all unused variables already present on Pial's branch.

## Where things stand

`main` is a front-end-only demo: data lives in each browser (`localStorage`), sign-in is a mock, and there are no API routes. The real backend work lives on two branches that have never been merged:

| Branch | Author | Commits past v1.6.0 | What it adds |
| --- | --- | --- | --- |
| `feat/masum-backend-integration` | Khandaker Zoad Pial | 21 (3 shared + 18 own), 15–23 Nov | Connects every portal to the **DGIX BFF** (9 microservices, Keycloak OIDC, 4-eyes consoles, PCI SAQ A checkout); dual contracts, milestone evidence and rejection, change requests, payout advice and disputes, digital licences, catalogue kill-switch, 5-step product submission with 9 evidence documents, company sign-up with trade licence |
| `feat/brd-gap-closure` | Mazharul Islam Masum (on Pial's base) | 8 (3 shared + 5 own), 15–22 Nov | Same BFF base; Bangla/Arabic switch with right-to-left, contracts UI, Ops & Customization console (`/admin/brd-ops`), unified onboarding wizard for `/create-account`, `/apply` and Add product, validated phone numbers |

- Both branch from **v1.6.0** and share their first three commits (the original BFF connection). After that they diverge: **neither contains the other**, and neither has v1.7.0.
- The branch named "masum-backend-integration" is mostly **Pial's** work.
- The **backend itself is not in this repository.** The site reaches it through `NEXT_PUBLIC_BFF_URL` (browser) or `DGIX_INTERNAL_BFF_URL` (server, default `http://127.0.0.1:18118`), proxied at `/bff/*` and `/checkout/*` by `next.config.ts`. Between them the branches call **75 BFF endpoints**.
- **Neither branch works without the backend.** Both stores load all data from the BFF (about 30 calls) and keep no sample-data fallback, and commit `15bb5d6` deliberately removed the test-account switchers.

## Trial merges (in memory, nothing written)

| Merge | Conflicted files | Biggest conflicts |
| --- | --- | --- |
| Pial ← Masum | 7 | `CreateAccountForm.tsx` 458 lines (both rewrote sign-up), `store.tsx` 117, `seller/agreement` 103 |
| `main` (v1.7.0) ← Pial | 11 | `store.tsx` **913 lines**, `admin/matching` 37, `admin/finance` 30, `billing` and `payouts` 24 each |
| `main` (v1.7.0) ← Masum | 10 | `store.tsx` **891 lines**, `i18n.tsx` 316 (both created it), `CreateAccountForm.tsx` 100 |

The `store.tsx` conflict is structural, not textual. The branches replaced the in-browser store with backend calls, while v1.7.0 added new in-browser actions (activity log, close reasons). Those features have to be **re-implemented on the backend store**, not merged line by line.

## Recommended order

Work on a new branch, never directly on `main`:

```bash
git switch -c integrate/backend origin/main
```

### Step 1 · Merge Pial's branch first

It is the larger, newer superset of the shared base (18 own commits, last on 23 Nov).

```bash
git merge --no-ff origin/feat/masum-backend-integration
```

Resolve the 11 conflicts by **taking Pial's side for data and portal logic**, then re-adding v1.7.0's purely visual changes on top:

| File | Resolution |
| --- | --- |
| `src/lib/store.tsx`, `src/lib/types.ts` | Take Pial's. Re-add v1.7.0 actions in step 4. |
| `src/app/admin/finance`, `buyer/billing`, `seller/payouts` | Take Pial's data and actions; re-add the v1.7.0 CSV buttons (`src/lib/csv.ts`, `CsvButton`) reading the backend data. |
| `src/app/admin/matching` | Take Pial's (4-eyes publishing, match explainability); re-add the Activity panel and close-with-reason in step 4. |
| `src/components/portal/PortalShell.tsx` | Take Pial's (role-scoped nav). Drop the v1.7.0 `DemoSwitch` mount (see decisions). |
| `src/app/layout.tsx`, `globals.css` | Take Pial's font change (CSS import, avoids build-time network failures) and keep the v1.7.0 `metadataBase`/share-image tags and the Bengali font in the same CSS-import style. |
| `src/components/marketing/SiteNav.tsx` | Keep Pial's "Create account" button and v1.7.0's language switch. |
| `CreateAccountForm.tsx` | Take Pial's (company sign-up with entity type and trade licence) for now; step 2 decides between his and Masum's. |

### Step 2 · Merge Masum's branch

```bash
git merge --no-ff origin/feat/brd-gap-closure
```

| File | Resolution |
| --- | --- |
| `CreateAccountForm.tsx`, onboarding | **Team decision:** Pial's sign-up vs Masum's unified onboarding wizard. Keep one; the other is deleted, not merged. |
| `src/lib/i18n.tsx` | Keep **Masum's provider** (English, Bangla, Arabic, right-to-left, key-based like `nav.home`). Fold v1.7.0's text-keyed Bangla dictionary into it and make `<T>` a thin wrapper over `useLocale().t(text, text)`, so the public-site strings keep working. One provider, one toggle (EN · বাংলা · العربية). |
| `store.tsx`, `ProjectDetail.tsx`, `seller/agreement` | Take whichever already calls the BFF for that feature; where both do, keep Pial's and port Masum's UI additions (contracts UI, milestone reject/submit). |
| `admin/brd-ops` console | New file, no conflict. Check it against Pial's governance page for duplicate kill-switch screens. |

### Step 3 · Build and run against the backend

```bash
npx tsc --noEmit -p .
```

```bash
npm run lint
```

```bash
npm run build
```

Then run the site against a running BFF (see "What we need from the backend team") and sign in as each Keycloak persona.

### Step 4 · Re-implement v1.7.0 features on the backend

| v1.7.0 feature | Backend today | What to do |
| --- | --- | --- |
| Request activity log | `/bff/v1/audit/entries` exists, but it's a global trail (limit 60), not per request | **Backend:** add a per-request history, e.g. `GET /commercial/buyers/requirements/:id/events`, or a filter on audit entries by subject. **Frontend:** `ActivityLog` reads it; the seeded history is removed. |
| Close a request with a reason | **No endpoint** to close or withdraw a requirement | **Backend:** add it (status + reason, notifies the advisor). Until then, hide the button. |
| Decline an offer with a reason | `/bff/v1/commercial/offers/:id` decline exists, **but takes no reason** | **Backend:** accept a `reason` field. **Frontend:** `ReasonDialog` passes it. |
| CSV downloads | Ledger, payouts and offers data all come from the BFF | Frontend only: point the exports at the backend data. No backend change. |
| `/events` register interest | `/bff/v1/public/inquiries` exists | Send it as an inquiry with a type like `event_interest`. |
| `/enrol` organisation enrolment | Company sign-up with trade licence already exists (`/bff/auth/register`, `/bff/v1/iam/buyer-verifications`) | Probably **retire `/enrol`** in favour of the branch's sign-up, or point `/enrol` at the same endpoints. Team decision. |
| Bangla switch | Masum's provider | Merged in step 2. |
| Demo switcher | The team removed switchers on purpose (`15bb5d6`) | **Drop it**, or keep it only in a local demo mode (decision below). |
| `/network`, hero quick searches, copy changes | Static pages and text | Keep as they are. |

### Step 5 · Verify, then release

- Run [DEMO_SCRIPT.md](DEMO_SCRIPT.md) end to end against the BFF, updating it for real sign-in (Keycloak personas instead of one-click test accounts).
- Release as **v2.0.0**. Real authentication and server data replace the mock sign-in and browser storage, a breaking change under [RELEASING.md](RELEASING.md).
- Open a pull request from `integrate/backend` for Pial and Masum to review before it reaches `main`.

## Decisions needed

1. **Sign-up:** Pial's company sign-up or Masum's unified onboarding wizard?
2. **`/enrol`:** retire it, or keep it as the entry point and send it to the branch's registration endpoints?
3. **Offline demo mode:** with the backend merged, presentations need the BFF running. Keep a `NEXT_PUBLIC_DEMO_MODE` that falls back to the sample data (and the demo switcher) when it's set, or present only against a running backend?
4. **Who resolves the merge:** the branch authors know their code best; the store conflict especially should be done with Pial.

## What we need from the backend team

- Access to the **BFF repository** (or the deployed URL) and how to run it locally.
- The **environment variables** for this site (`NEXT_PUBLIC_BFF_URL`, `DGIX_INTERNAL_BFF_URL`) for local, staging and production.
- **Keycloak test personas** (buyer, seller, staff roles) for testing.
- The three backend additions above: per-request history, close-request-with-reason, and a reason on offer decline.
