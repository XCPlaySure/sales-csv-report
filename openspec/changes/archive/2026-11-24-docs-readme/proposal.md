# Proposal

## Why

The project has no README, so a new user cannot tell what the app does, how to
run it, or how the source is organized without reading the code. A short guide
also removes guesswork about the upload-to-report workflow and how to begin a
fresh run.

## What Changes

- Add a `README.md` at the project root with:
  - project title and plain-language description;
  - an overview of the main features, derived from the code: CSV upload with
    flexible column confirmation, region/branch/outlet analysis, the five
    weakest outlets with severity tiers, the manager summary, copy and Telegram
    sharing, and the 100% coverage gate;
  - install, development, test, build, and preview commands;
  - an annotated directory structure and the runtime data flow;
  - the tech stack with versions and a note that no backend or runtime
    dependency exists.
- Include a short, positive "Working with reports" note that explains the app
  shows one report at a time and that starting another file or adjusting column
  mapping begins from the upload step. Wording stays neutral and
  easy-to-understand; no negative framing about missing controls.
- No product code, scripts, dependencies, or specs change.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- None. This change is documentation only; `.openspec.yaml` sets
  `skip_specs: true`.

## Impact

- New file: `README.md` at the repository root.
- No changes to `src/`, `test/`, `index.html`, build config, CI, or OpenSpec
  specs.
