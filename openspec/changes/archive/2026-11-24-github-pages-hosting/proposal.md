# Proposal

## Why

The app needs to be served over HTTP/S, but today it only runs locally and has
no published site. That blocks sharing a working URL with testers and makes the
Telegram share link point at a local address a recipient cannot open.

## What Changes

- Build the app with relative asset paths so it works both at a domain root and
  under a GitHub Pages project subpath.
- Add a GitHub Actions workflow that builds `dist/` and publishes it to GitHub
  Pages. No custom domain, DNS, or paid plan is required.
- Document the public URL pattern, how to deploy, and how to smoke-test the
  hosted app with `sales.csv`.
- No product code, runtime dependency, or existing capability requirement
  changes.

## Capabilities

### New Capabilities
- `static-hosting`: publishing the built app as a static site at a public
  HTTP/S address, including correct asset loading under a subpath.

### Modified Capabilities
- None. The existing `telegram-share` requirements already describe using the
  current page URL; hosting makes that URL reachable.

## Impact

- `vite.config.js`: asset base path.
- `.github/workflows/deploy-pages.yml`: new deploy workflow.
- `README.md`: deployment and smoke-test guidance.
- `openspec/specs/static-hosting/spec.md`: new capability spec.
