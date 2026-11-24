# sales-analytics Specification

## Purpose

Aggregates parsed sales rows into regional, branch, and outlet performance views, ranks the weakest outlets, and renders a dashboard that adapts correctly to dirty or limited data.

## Requirements

### Requirement: Region aggregation

The system SHALL group sales by the exact region string as written in the file and compute net sales and each region's share of total net sales.

#### Scenario: Raw region strings are not merged

- **WHEN** the file contains `Jawa Barat` and `JAWA BARAT`
- **THEN** they are reported as two separate regions, because the system does not normalize region names

#### Scenario: Region share

- **WHEN** total net sales are positive
- **THEN** each region's share is its net sales divided by total net sales, displayed as a percentage

#### Scenario: Share suppressed for non-positive total

- **WHEN** total net sales are zero or negative
- **THEN** the region share is not computed or shown and the system notes that share is unavailable

### Requirement: Branch aggregation

The system SHALL compute net sales per branch and render a branch breakdown when a branch column is mapped.

#### Scenario: Branch breakdown shown

- **WHEN** branch is mapped
- **THEN** the dashboard shows net sales per branch alongside the region view

#### Scenario: Branch breakdown omitted

- **WHEN** branch is not mapped
- **THEN** the branch view is omitted without an error

### Requirement: Five lowest outlets

The system SHALL rank outlets by absolute net sales ascending, grouped by outlet id and region, and show up to five, showing fewer when the file contains fewer.

#### Scenario: Five weakest shown

- **WHEN** the file contains at least five outlets
- **THEN** the five outlets with the lowest absolute net sales are listed, lowest first

#### Scenario: Fewer than five outlets

- **WHEN** the file contains fewer than five outlets
- **THEN** all outlets are listed and the heading reflects the actual count

#### Scenario: Outlet identity

- **WHEN** the same outlet id appears on multiple rows in one region
- **THEN** its rows are combined into a single outlet entry

#### Scenario: Outlet id spans regions

- **WHEN** the same outlet id appears under different region labels
- **THEN** each region is listed as a separate outlet and the view notes the conflict

### Requirement: Severity tiers

The system SHALL tag each listed outlet by its net sales relative to its region's average net sales per outlet: CRITICAL below 25%, LOW from 25% to below 50%, BELOW from 50% to below 100%, and OK at or above 100%.

#### Scenario: Critical outlet

- **WHEN** an outlet's net sales are below 25% of its region average
- **THEN** it is tagged CRITICAL

#### Scenario: None critical

- **WHEN** none of the listed outlets is tagged CRITICAL
- **THEN** the view states that no outlet is critically underperforming and reports the lowest tier present

#### Scenario: Tunable thresholds

- **WHEN** the severity thresholds are changed
- **THEN** the tags reflect the new thresholds without any other logic change

### Requirement: Limited data adaptation

The system SHALL adapt its output when the data is valid but limited, without treating the data as faulty.

#### Scenario: Single month

- **WHEN** all rows fall within one calendar month
- **THEN** the period is shown as a single month and no month-over-month comparison is produced

#### Scenario: Single region

- **WHEN** the file contains only one region
- **THEN** the region view shows that single region and the summary does not claim a region "led"

#### Scenario: All outlets equal

- **WHEN** all outlets have approximately equal net sales within their region
- **THEN** the view notes that outlets perform similarly rather than implying a meaningful ranking

### Requirement: Negative and zero totals

The system SHALL display figures correctly when total net sales are negative or zero and SHALL suppress percentage-of-total views that are undefined.

#### Scenario: Negative total

- **WHEN** total net sales are negative
- **THEN** the system shows the figures, suppresses the share view, and notes that returns exceeded sales

#### Scenario: Zero total

- **WHEN** total net sales are exactly zero
- **THEN** the system notes that share is unavailable

### Requirement: Indonesian number format

The system SHALL display monetary values in Indonesian formatting: `Rp` prefix, dot as thousands separator, and comma as decimal separator.

#### Scenario: Currency display

- **WHEN** a monetary value of 1728036900 is displayed
- **THEN** it is shown as `Rp 1.728.036.900`