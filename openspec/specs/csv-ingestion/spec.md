# csv-ingestion Specification

## Purpose

Turns a user-uploaded CSV into a validated, parsed dataset by reading its own header row, confirming how columns map to required and optional fields, and reporting file faults clearly before any analysis runs.

## Requirements

### Requirement: Local file upload

The system SHALL read a user-selected CSV file entirely in the browser and MUST NOT transmit its contents to any server.

#### Scenario: Upload a valid file

- **WHEN** the user selects a CSV file
- **THEN** the system reads the file locally and proceeds to header detection without any network request

#### Scenario: No file selected

- **WHEN** no file has been selected
- **THEN** the system shows an upload prompt and no dashboard or summary

### Requirement: Header auto-detection

The system SHALL read the first row as column headers and auto-detect which column serves each known field, ignoring case, underscores, and spaces, and matching known synonyms.

#### Scenario: Exact headers

- **WHEN** the header row contains `region`, `outlet_id`, and `net_sales_idr`
- **THEN** those columns are auto-assigned to region, outlet id, and net sales respectively

#### Scenario: Synonym header

- **WHEN** a column is named `omzet`, a known synonym for net sales
- **THEN** it is auto-assigned to net sales

#### Scenario: Unrecognized header

- **WHEN** a header matches no known field
- **THEN** it remains selectable in the mapping panel but is not auto-assigned

### Requirement: Confirmable column mapping

The system SHALL present a column mapping panel before processing, prefilled with auto-detected assignments and showing a sample value for each mapped column, and MUST require explicit confirmation before processing.

#### Scenario: Mapping shown before processing

- **WHEN** a file is loaded
- **THEN** the mapping panel appears with required and optional fields and their current assignments, and processing does not start until the user confirms

#### Scenario: Sample value aids confirmation

- **WHEN** a field is mapped to a column
- **THEN** the panel displays a sample value taken from that column

### Requirement: Required field validation

The system SHALL require mappings for region, outlet id, and a net-sales source before enabling processing, and SHALL block processing with a clear message while any required field is unmapped.

#### Scenario: Missing required field

- **WHEN** no column is mapped to net sales and it cannot be derived
- **THEN** processing is disabled and the system states which required field is unresolved

#### Scenario: Derived net sales

- **WHEN** no net-sales column exists but gross-sales and discount columns are mapped
- **THEN** the system offers net sales as gross minus discount and states that it is derived

#### Scenario: Duplicate mapping

- **WHEN** two fields are mapped to the same column
- **THEN** the system reports the mapping as invalid and blocks processing

### Requirement: Optional field degradation

The system SHALL treat branch, date, qty, discount, outlet name, salesman, brand, outlet type, sku, price, and gross as optional, and SHALL skip only the views or summary clauses that depend on an unmapped optional field.

#### Scenario: Missing branch

- **WHEN** branch is not mapped
- **THEN** the dashboard omits the branch breakdown and the summary omits branch detail, while every other view renders

#### Scenario: Missing date

- **WHEN** date is not mapped
- **THEN** the period and month-over-month comparison are omitted and the rest of the report renders

### Requirement: Row parsing and fault reporting

The system SHALL skip rows whose required identifiers are blank or whose required numeric values cannot be parsed, and report them. Invalid optional numeric values SHALL be omitted from those fields with a warning while the row's required sales data is kept.

#### Scenario: Invalid required numeric value

- **WHEN** net sales, or gross sales and discount when net sales is derived, is non-numeric
- **THEN** that row is skipped and the system reports how many rows were skipped and why

#### Scenario: Blank required identifier

- **WHEN** region or outlet id is blank
- **THEN** that row is skipped and the system reports the blank identifier

#### Scenario: Invalid optional numeric value

- **WHEN** an optional mapped numeric field is non-numeric but net sales is valid
- **THEN** the row is kept, that field is omitted, and a warning is reported

#### Scenario: Empty or unusable file

- **WHEN** the file has no data rows, or every data row is invalid
- **THEN** the system reports that the file has no usable data and asks the user to fix and re-upload it

#### Scenario: File fault framing

- **WHEN** a required field cannot be satisfied by any column
- **THEN** the system presents the problem as an issue with the CSV file and instructs the user how to fix it