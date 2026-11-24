# Spec Delta

## MODIFIED Requirements

### Requirement: Severity tier legend

The system SHALL display a legend immediately below the weakest-outlet table, in smaller muted text, stating what each tier means as a share of the outlet's region average and presented as additional information for the Tier column:

- CRITICAL: below 25% of region average
- LOW: 25% to below 50% of region average
- BELOW: 50% to below 100% of region average
- OK: 100% or above of region average

#### Scenario: Legend shown with outlets

- **WHEN** the weakest-outlet view lists outlets
- **THEN** the legend appears below the table, in smaller muted text, describing each tier.

#### Scenario: Legend omitted without outlets

- **WHEN** there are no outlets to rank
- **THEN** the legend is not shown.