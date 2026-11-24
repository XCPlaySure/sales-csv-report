# Design

## Context

See `proposal.md` - Why. The repository currently has source, tests, OpenSpec
specs, and CI, but no top-level guide. Documentation content must be derived
from the code and configuration, not invented: package scripts, source modules,
and the test/CI setup are the source of truth.

## Goals / Non-Goals

**Goals:**

- Give a new reader a complete first-run path: what the app is, how to install
  and run it, what the main features are, where code lives, and which stack it
  uses.
- Explain the upload-to-report flow in plain language, including how to begin a
  fresh run, without negative framing about the interface.

**Non-Goals:**

- No product code, UI controls, scripts, dependencies, or spec changes.
- No separate documentation site or generated docs.

## Decisions

### Decision: One root-level `README.md`

Place all content in a single file at the repository root.

- Alternative: a `docs/` directory with multiple pages. Rejected — the project
  is small and a single entry point is easier to discover.

### Decision: Content grounded in code and configuration

Feature descriptions come from `src/lib/*`, `src/ui/*`, `src/app.js`,
`index.html`, `package.json`, `vitest.config.js`, and `.github/workflows/test.yml`.
Commands and versions are taken from `package.json` and `package-lock.json`.

- Alternative: paraphrase the OpenSpec capability specs. Rejected — those
  describe behavior contracts, while the README should describe the actual
  tool and how to run it.

### Decision: Group features by user workflow

Order the feature section as: CSV input, analysis, report and summary, sharing,
quality gates. This mirrors what a reader does.

- Alternative: file-by-file module listing. Rejected — useful for maintainers
  only, and the directory-structure section already covers that.

### Decision: Positive wording for the single-report workflow

Include a short "Working with reports" note using neutral, easy-to-understand
language:

> The app focuses on one report at a time. To try another file or revisit the
> column mapping, reload the page and start again from the upload step.

- Alternative: describing absent back/restart controls. Rejected — that reads
  as a defect report, not user guidance.

### Decision: Terminal-safe ASCII diagrams

Use plain ASCII for the directory tree and data-flow sketch so padding stays
aligned in terminals and monospace viewers.

## Risks / Trade-offs

- [README drifts from code as the app evolves] -> Keep descriptions at behavior
  level and derive commands/versions from config; apply task verifies commands.
- [Document becomes too long] -> Use headings, tables, and two compact diagrams;
  avoid restating spec scenarios.
- [Local-only sharing details confuse readers] -> State that Telegram sharing
  uses the current page URL, so it is most useful when the app is hosted.

## Migration Plan

Adding one documentation file. Rollback is deleting `README.md`; no data or
runtime state is affected.

## Open Questions

None.