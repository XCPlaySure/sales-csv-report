# Spec Delta

## ADDED Requirements

### Requirement: Numbered report tables

The system SHALL add a leading `#` column with 1-based row numbers to the region, branch, and weakest-outlet report tables. The column mapping table SHALL remain unchanged.

#### Scenario: Numbered rows in report tables

- **WHEN** any report table renders with rows
- **THEN** each row shows its 1-based position in a leading `#` column, and the mapping table has no `#` column.

### Requirement: Striped table rows

The system SHALL apply alternating background styling to odd and even rows in the region, branch, and weakest-outlet report tables.

#### Scenario: Odd and even rows distinguishable

- **WHEN** a report table renders with two or more rows
- **THEN** odd and even data rows use different background styling.