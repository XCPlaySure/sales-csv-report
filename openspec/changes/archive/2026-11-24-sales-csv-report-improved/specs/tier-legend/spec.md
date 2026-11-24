# Spec Delta

## Purpose

Explains the severity tiers used in the weakest-outlet view, so the user can
judge which outlets are genuinely underperforming rather than just small.

## ADDED Requirements

### Requirement: Severity tier legend

The system SHALL display a legend near the weakest-outlet view that states what
each tier means as a share of the outlet's region average:

- CRITICAL: below 25% of region average
- LOW: 25% to below 50% of region average
- BELOW: 50% to below 100% of region average
- OK: 100% or above of region average

#### Scenario: Legend shown with outlets

- **WHEN** the weakest-outlet view lists outlets
- **THEN** the legend appears describing each tier.

#### Scenario: Legend omitted without outlets

- **WHEN** there are no outlets to rank
- **THEN** the legend is not shown.

### Requirement: Severity tier tags

The system SHALL tag each listed outlet by its net sales relative to its
region's average net sales per outlet using the tiers defined above.

#### Scenario: Critical outlet tagged

- **WHEN** an outlet's net sales are below 25% of its region average
- **THEN** it is tagged CRITICAL.

#### Scenario: No critical outlets

- **WHEN** none of the listed outlets is tagged CRITICAL
- **THEN** the view states that no outlet is critically underperforming and
  reports the lowest tier present.