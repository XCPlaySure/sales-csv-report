# ui-flow Specification

## Purpose

Defines the user-interface flow: the app presents a stage-by-stage progression
instead of a single page, so the user always sees only the step relevant to the
current task. Fields are auto-mapped via header detection, and required fields
must be confirmed before processing begins.

## Requirements

### Requirement: Progressive-stage UI

The system SHALL display exactly one stage at a time: upload (file picker), then
mapping (confirmable column assignment), then results (dashboard and summary).
Only the current stage is visible.

#### Scenario: Upload, map, then view results

- **WHEN** a valid CSV is uploaded
- **THEN** the mapping panel appears with required fields auto-assigned and a
  sample value shown; the upload prompt is hidden.
- **THEN** the user confirms, and the dashboard with the summary appears while
  the mapping panel and upload prompt are hidden.

#### Scenario: No file selected

- **WHEN** no file has been selected
- **THEN** the mapping panel and results section are hidden, and the upload
  prompt is shown.

### Requirement: Required field validation

The system SHALL require mappings for region, outlet id, and a net-sales source
before enabling processing, and SHALL block processing with a clear message
while any required field is unmapped.

#### Scenario: Duplicate mapping

- **WHEN** two fields are mapped to the same column
- **THEN** the system reports the mapping as invalid and blocks processing.

### Requirement: Row parsing and fault reporting

The system SHALL parse each data row, skip rows whose mapped numeric fields
cannot be parsed, and report the skipped-row count as a fault of the file with
guidance to fix it.

#### Scenario: Invalid numeric row

- **WHEN** a row has a non-numeric value in a mapped numeric field
- **THEN** that row is skipped and the system reports how many rows were skipped
  and why.

#### Scenario: Empty or unusable file

- **WHEN** the file has no data rows, or every data row is invalid
- **THEN** the system reports that the file has no usable data and asks the user
  to fix and re-upload it.

### Requirement: Local file upload

The system SHALL read a user-selected CSV file entirely in the browser and MUST
NOT transmit its contents to any server.

#### Scenario: Upload a valid file

- **WHEN** the user selects a CSV file
- **THEN** the system reads the file locally and proceeds to header detection
  without any network request.

#### Scenario: No file selected

- **WHEN** no file has been selected
- **THEN** the system shows an upload prompt and no dashboard or summary.

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
