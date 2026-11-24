# Spec Delta

## Purpose

Serves the built report app from a public static URL so testers can open it over
HTTP/S and Telegram sharing carries a real page address. It also keeps assets
working when the site is published under a subpath.

## ADDED Requirements

### Requirement: Relative asset paths

The built app SHALL reference its scripts and styles relative to the page URL so
it loads correctly at a domain root and under a project subpath.

#### Scenario: Root hosting

- **WHEN** the built site is served at a domain root
- **THEN** its script and stylesheet load and the app starts

#### Scenario: Project subpath hosting

- **WHEN** the built site is served under a subpath such as a GitHub Pages project site
- **THEN** its script and stylesheet load from that subpath and the app starts

### Requirement: Public static publication

The repository SHALL publish the built app to a public HTTP/S address without a
custom domain, DNS record, or paid plan.

#### Scenario: Publish from the main branch

- **WHEN** the main branch is updated and the publish workflow runs
- **THEN** the built site is available at the public project URL

#### Scenario: No custom domain required

- **WHEN** a user opens the public project URL
- **THEN** the app is reachable over HTTPS without configuring a domain

#### Scenario: Hosted smoke test

- **WHEN** a tester opens the public URL and uploads `sales.csv`
- **THEN** the mapping panel, dashboard, summary, copy button, and Telegram button are available
