# Tasks

## 1. Relative build paths

- [x] 1.1 Set `base: './'` in `vite.config.js`. Verify: `npm run build` emits `./assets/...` paths in `dist/index.html`.

## 2. Pages deploy workflow

- [x] 2.1 Add `.github/workflows/deploy-pages.yml` with `push` on `main` plus `workflow_dispatch`, `npm ci`, `npm run build`, and GitHub's official Pages configure/upload/deploy actions. Verify: workflow parses and the deploy job has `pages: write` and `id-token: write`.

## 3. Operator documentation

- [x] 3.1 Add a hosting section to `README.md` with the public URL pattern, no-custom-domain note, deploy trigger, and `sales.csv` smoke test. Verify: section states the project-site URL shape and the upload-to-summary check.

## 4. Spec sync

- [x] 4.1 Sync the `static-hosting` delta spec to main specs. Verify: `openspec/specs/static-hosting/spec.md` exists and `openspec validate --specs` passes.

## Workflow follow-up

- After merge, set Pages source to GitHub Actions and verify the public URL.
- Smoke-test the hosted app: upload `sales.csv`, confirm mapping, process, and check copy/Telegram buttons.
- Archive this change after review.