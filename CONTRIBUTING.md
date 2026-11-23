# Contributing to ReBox

Thanks for wanting to contribute — this project exists because people like you show up. Contributions of any size are welcome: typo fixes, bug reports, docs, tests, features.

## Ways to help

- 🐛 **Report bugs** — use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- 💡 **Suggest features** — use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- 📖 **Improve docs** — READMEs, setup guides, code comments where they add value.
- 🧪 **Add tests** — see `backend/tests/`.
- 🎨 **Design / UX** — screenshots, Figma, or PR-ready CSS.
- 🌐 **Translations** — open a Discussion first so we can coordinate.

## Development setup

```bash
git clone https://github.com/Elactrac/rebox.git
cd rebox

# Backend
cd backend && cp .env.example .env && npm install
npx prisma migrate dev && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.example .env && npm install && npm start
```

Full details in the [README](README.md#-quickstart).

## Workflow

1. **Fork** the repo, then create a branch: `git checkout -b feat/short-description`
2. **Make your change.** Keep commits focused; one logical change per commit.
3. **Test locally** — run existing tests (`npm test` in `backend/`) and try the flow you touched in the UI.
4. **Open a PR** against `main`. Fill out the PR template.

### Branch naming
- `feat/…` new feature
- `fix/…` bug fix
- `docs/…` docs-only
- `chore/…` tooling / deps

### Commit messages
Short imperative subject line. Body is optional. Example:

```
feat(pickups): allow recyclers to filter by material type

Adds a MultiSelect on the pickups list page.
```

## Code style

- Backend: existing Express + Prisma conventions. No formatter enforced yet — match surrounding code.
- Frontend: React function components + hooks, Tailwind for styling.
- Avoid adding new dependencies unless the value is clear — call it out in the PR.

## What we're looking for (good first issues)

- Empty-state UI polish across pages
- Accessibility fixes (labels, keyboard nav, contrast)
- Better error messages on failed API calls
- Seed data variety (more realistic sample listings)
- Docs: screenshots, architecture diagram, self-hosting walk-through

Check the [Issues](../../issues) tab for anything tagged `good first issue`.

## Reporting security issues

**Please don't open a public issue for security vulnerabilities.** Email the maintainer instead — see the profile at [github.com/Elactrac](https://github.com/Elactrac).

## Code of Conduct

By participating, you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

Not sure where to start? Open a [Discussion](../../discussions) and say hi. 🌱
