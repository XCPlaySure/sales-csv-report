# manager-summary Specification

## Purpose

Produces a one-paragraph plain-English summary for a sales manager in which every claim is supported by the parsed data, and lets the user copy it or share it through Telegram without a server.

## Requirements

### Requirement: Guarded-clause summary

The system SHALL build the summary from clauses where each clause is emitted only when its condition holds, and MUST NOT assert any comparison, ranking, or judgment the data does not support.

#### Scenario: Growth clause only with two or more months

- **WHEN** the data spans at least two months
- **THEN** the summary includes a month-over-month clause using "grew" or "fell" according to the actual change

#### Scenario: No growth clause for a single month

- **WHEN** the data spans one month
- **THEN** the summary omits any month-over-month claim

#### Scenario: Leader clause only with multiple regions

- **WHEN** more than one region is present
- **THEN** the summary names the top region and its share; with one region it does not claim a leader

#### Scenario: No unsupported judgment

- **WHEN** the data does not support a claim such as "within normal range"
- **THEN** the summary does not include it

### Requirement: Branch detail in summary

The system SHALL include branch-level detail in the summary when a branch column is mapped and omit it otherwise.

#### Scenario: Branch present

- **WHEN** branch is mapped and multiple branches exist
- **THEN** the summary mentions branch performance

#### Scenario: Branch absent

- **WHEN** branch is not mapped
- **THEN** the summary contains no branch claim

### Requirement: Data caveats

The system SHALL mention material data caveats that affect interpretation, including refund lines and rows with no salesman assigned when present.

#### Scenario: Refund present

- **WHEN** the data includes negative net-sales lines
- **THEN** the summary notes that the figures include refunds

#### Scenario: Missing salesman

- **WHEN** some rows have no salesman value
- **THEN** the summary notes how many lines are excluded from salesman attribution

### Requirement: Weakest-outlet clause

The system SHALL describe the weakest outlets in the summary using the same tiers shown on the dashboard, and SHALL state when none is critically underperforming.

#### Scenario: Critical outlets exist

- **WHEN** at least one listed outlet is tagged CRITICAL
- **THEN** the summary describes those outlets as critically weak with their share of region average

#### Scenario: No critical outlets

- **WHEN** no listed outlet is tagged CRITICAL
- **THEN** the summary states that no outlet is critically underperforming

### Requirement: Single source of truth

The summary SHALL derive every figure from the same aggregate results that populate the dashboard, so the two never disagree.

#### Scenario: Figures match dashboard

- **WHEN** the summary and dashboard both show total net sales
- **THEN** the two values are identical because both read the same aggregate

### Requirement: Copy summary

The system SHALL provide a button that copies the full summary paragraph to the clipboard.

#### Scenario: Copy action

- **WHEN** the user activates Copy
- **THEN** the complete summary paragraph is placed on the clipboard

### Requirement: Telegram share without a server

The system SHALL provide a button that opens Telegram with the summary prefilled, using a share link, and MUST NOT use or expose a bot token or chat id.

#### Scenario: Share action

- **WHEN** the user activates Send via Telegram
- **THEN** Telegram opens with the summary prefilled for the user to send to a channel or chat

#### Scenario: No credentials in the page

- **WHEN** the page is inspected
- **THEN** no bot token or chat id is present, because the share is performed by the user