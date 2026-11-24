# Design

## Context

See `proposal.md` - Why. The repo is public on GitHub, has no Pages site, and
only a test workflow. The current build emits absolute `/assets/...` URLs, which
work at a domain root but break under a GitHub Pages project subpath.

## Goals / Non-Goals

**Goals:**

- Publish `dist/` to a free public GitHub Pages URL.
- Keep built assets loadable at both a root and a subpath.
- Give testers a repeatable hosted smoke test.

**Non-Goals:**

- No custom domain, DNS, or paid plan.
- No backend, server, or runtime data storage.
- No per-PR preview deployment; publication follows `main`.

## Decisions

### Decision: Relative Vite base

Set the build base to `./` rather than the hardcoded project path.

- Alternative: `base: '/sales-csv-report/'`. Rejected — hardcodes the repo name
  and breaks forks, custom domains, and root hosting.

### Decision: Official Pages Actions

Use GitHub's official Pages actions to configure, upload `dist/`, and deploy.
The workflow runs on push to `main` and on manual dispatch.

- Alternative: commit `dist/` to a `gh-pages` branch. Rejected — duplicates
  generated output in history and needs manual rebuilds.

### Decision: Least-privilege workflow permissions

Grant `contents: read`, `pages: write`, and `id-token: write` only to the deploy
job, with a Pages concurrency group.

### Decision: README as the operator guide

Document the public URL pattern, deployment trigger, and the `sales.csv` smoke
test in `README.md`; keep the spec behavior-level.

## Risks / Trade-offs

- [Pages source misconfigured] -> Set source to GitHub Actions in repo settings.
- [Absolute asset regression] -> Smoke-test the hosted subpath URL after deploy.
- [Public exposure] -> No user CSV data is uploaded; the site is static only.
- [No PR preview] -> Testers use the published `main` URL or local `npm run preview`.

## Migration Plan

Enable Pages with Actions as the source, merge the deploy workflow, push to
`main`, then verify the public URL. Rollback disables Pages or removes the
workflow; no data migration exists.

## Open Questions

None.
