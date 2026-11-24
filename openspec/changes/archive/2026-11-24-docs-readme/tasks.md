# Tasks

## 1. Draft README content from the codebase

- [x] 1.1 Write the title and plain-language description, then a feature overview covering CSV input, analysis, weakest outlets with tiers, summary, sharing, and the quality gate. Verify: each feature maps to a file under `src/` or `test/`.
- [x] 1.2 Write install, dev, test, coverage, build, and preview commands taken from `package.json`. Verify: every command matches a script name in `package.json`.
- [x] 1.3 Write the annotated directory tree and a plain-ASCII data-flow sketch. Verify: paths match the current repository layout and diagrams use ASCII only.
- [x] 1.4 Write the tech-stack table using versions from `package-lock.json`, noting there is no backend and no runtime dependency. Verify: listed versions match the lockfile.
- [x] 1.5 Write the short "Working with reports" note with the neutral wording from `design.md`. Verify: it says the app focuses on one report at a time and tells the reader to reload and start at the upload step; no negative wording about missing controls.

## 2. Add and verify the document

- [x] 2.1 Create `README.md` at the repository root containing all sections above. Verify: file exists and headings for description, features, install/run, structure, and tech stack are present.
- [x] 2.2 Verify the documented commands actually work. Verify: `npm ci`, `npm run coverage` (100% thresholds), and `npm run build` exit 0.
- [x] 2.3 Confirm the change is documentation-only. Verify: no files outside `README.md` are added or modified.

## Workflow follow-up

- Archive this change after review.
- Verify the archived result.