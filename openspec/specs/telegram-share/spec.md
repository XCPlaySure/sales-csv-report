# telegram-share Specification

## Purpose

Defines how the summary is sent to a Telegram channel or chat without any
server, bot token, or chat id, by opening a prefilled share link the user sends
from their own account.

## Requirements

### Requirement: Telegram share link

The system SHALL provide a button that opens Telegram with the summary text
prefilled, using the link
`https://t.me/share/url?url=<page>&text=<summary>`, and MUST NOT use or expose a
bot token or chat id.

#### Scenario: Share action

- **WHEN** the user activates Send via Telegram
- **THEN** Telegram opens with the summary prefilled for the user to choose a
  recipient.

#### Scenario: No credentials in the page

- **WHEN** the page is inspected
- **THEN** no bot token or chat id is present, because the share is performed by
  the user through the Telegram web interface.

### Requirement: Recipient choice and login

The system SHALL rely on the Telegram share page to handle recipient selection
and sign-in, so a signed-out user is prompted to log in before sending.

#### Scenario: Signed-in user

- **WHEN** the user is signed in to Telegram and activates Send via Telegram
- **THEN** the Telegram share page lets the user choose a recipient with the
  summary prefilled.

#### Scenario: Signed-out user

- **WHEN** the user is not signed in and activates Send via Telegram
- **THEN** the Telegram share page prompts the user to sign in.

### Requirement: Share guidance

The system SHALL display a short note next to the Send via Telegram button stating that Telegram sign-in is required and that Copy summary is the alternative when a user is not signed in.

#### Scenario: Guidance visible with share button

- **WHEN** the summary section is shown
- **THEN** a note near the Send via Telegram button states that sign-in is required and names Copy summary as the alternative.
