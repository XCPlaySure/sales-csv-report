# Spec Delta

## Purpose

States the data provenance under the summary paragraph, so the reader can judge
the summary's coverage and trust it without re-checking the dashboard.

## ADDED Requirements

### Requirement: Summary basis line

The system SHALL include a short note under the summary paragraph that states
what the summary is based on: number of rows, invoices, outlets, and regions,
plus any skipped rows.

#### Scenario: Basis text included

- **WHEN** the summary is generated
- **THEN** the note states the row, invoice, outlet, and region counts, and any
  skipped-row count.

#### Scenario: Basis text omitted when no data

- **WHEN** there are no data rows
- **THEN** the note is omitted and no summary is shown.

### Requirement: Single source of truth

The system SHALL derive the basis note from the same aggregate results that
populate the dashboard, so the note and the dashboard never disagree.

#### Scenario: Figures match dashboard

- **WHEN** the basis note and dashboard both show a count
- **THEN** the values are identical because both read the same aggregate.