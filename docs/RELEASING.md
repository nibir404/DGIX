# Versioning and releases

How DGIX versions, tags and documents every release. Follow these steps so that `package.json`, `CHANGELOG.md` and the git tags always agree.

## Version numbers

DGIX uses [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

| Bump | When | Example |
| --- | --- | --- |
| **MAJOR** `2.0.0` | A change that breaks something people rely on: removed pages or routes, a new data format that drops saved demo data, a redesign of a whole flow. | Real backend replaces local seed data |
| **MINOR** `1.2.0` | New features or visible improvements that don't break anything. | New page, new portal screen, new menu |
| **PATCH** `1.1.1` | Bug fixes, security updates, copy fixes, small style corrections. | Fix overflow on phones, upgrade a patched dependency |

If a release has both features and fixes, the biggest change decides the bump.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org) prefixes, so the changelog is easy to write:

| Prefix | Use for | Changelog section |
| --- | --- | --- |
| `feat:` | New feature or visible improvement | Added / Changed |
| `fix:` | Bug fix | Fixed |
| `fix:` + security note | Vulnerability or dependency patch | Security |
| `docs:` | Documentation only | not listed |
| `chore:` | Tooling, config, release commits | not listed |
| `refactor:` / `style:` / `perf:` | Code changes with no new behaviour | Changed (only if users notice) |

Example: `feat: account menu and settings page`.

## The changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

- Keep an **`[Unreleased]`** section at the top. Add a line there with each change you merge, in plain language a non-developer can follow.
- Sort lines under **Security**, **Added**, **Changed**, **Fixed**, **Removed** (use only the ones you need).
- At release time, rename `[Unreleased]` to the new version and date, and start a fresh empty `[Unreleased]` above it.
- Update the compare links at the bottom of the file.

## Making a release

Run these from a clean `main` that's up to date with GitHub.

1. **Check the build.**

   ```bash
   npm run lint
   ```

   ```bash
   npm run typecheck
   ```

   ```bash
   npm run build
   ```

2. **Update the changelog.** Move the `[Unreleased]` notes under a new heading `## [X.Y.Z] — YYYY-MM-DD`, add an empty `[Unreleased]` section above it, and add the compare links at the bottom:

   ```
   [Unreleased]: https://github.com/nibir404/DGIX/compare/vX.Y.Z...HEAD
   [X.Y.Z]: https://github.com/nibir404/DGIX/compare/vPREVIOUS...vX.Y.Z
   ```

3. **Bump the version** in `package.json` and `package-lock.json` without creating a tag yet:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   ```

4. **Commit the release.**

   ```bash
   git add CHANGELOG.md package.json package-lock.json
   ```

   ```bash
   git commit -m "chore(release): vX.Y.Z"
   ```

5. **Tag it** with an annotated tag. The message is the one-line summary from the changelog:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z — short summary"
   ```

6. **Push the commit and the tag.**

   ```bash
   git push origin main
   ```

   ```bash
   git push origin vX.Y.Z
   ```

7. **Optional: publish a GitHub release** from the tag, pasting that version's changelog section as the notes:

   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <(sed -n '/^## \[X.Y.Z\]/,/^## \[/p' CHANGELOG.md | sed '$d')
   ```

Vercel deploys every push to `main`, so the release is live once the deploy finishes. Tags don't trigger a separate deploy.

## Rules

- Tags are permanent. Never move or delete a pushed tag. If a release has a problem, fix it and release a new patch version.
- One tag per version, always on the release commit, always prefixed with `v`.
- `package.json` `version` must match the latest tag.
- Never commit secrets. The `.claude/` folder holds local tool settings and stays out of git.

## Release history

| Version | Date | Summary |
| --- | --- | --- |
| [v1.5.0](https://github.com/nibir404/DGIX/compare/v1.4.0...v1.5.0) | 2026-11-14 | Partner application page and "Become a partner" / "Sell with us" hero buttons |
| [v1.4.0](https://github.com/nibir404/DGIX/compare/v1.3.0...v1.4.0) | 2026-11-14 | More prominent "Why not go direct?" comparison on the home page |
| [v1.3.0](https://github.com/nibir404/DGIX/compare/v1.2.1...v1.3.0) | 2026-11-14 | Glowing amber Bangladesh and golden routes on the hero globe, social link previews, FAQ fix |
| [v1.2.1](https://github.com/nibir404/DGIX/compare/v1.2.0...v1.2.1) | 2026-11-14 | Advisor moved into the account menu, simpler hero top, notification toggle fix |
| [v1.2.0](https://github.com/nibir404/DGIX/compare/v1.1.0...v1.2.0) | 2026-11-14 | End-to-end buyer, seller and staff workflow; new home hero, line-art globe, sticky search and app section |
| [v1.1.0](https://github.com/nibir404/DGIX/compare/v1.0.0...v1.1.0) | 2026-11-14 | Mobile and tablet support, Android app section, account menu and settings, Next.js security upgrade |
| [v1.0.0](https://github.com/nibir404/DGIX/releases/tag/v1.0.0) | 2026-11-14 | First complete release of the frontend |
