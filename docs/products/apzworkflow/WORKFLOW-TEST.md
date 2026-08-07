# APZ Workflow — The Workflow Test

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZ-WORKFLOW-000 |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T163000Z |
| Authority | Owner Approval   |

## The test

Ask one question of every proposed workflow:

> **Can the business describe this workflow without mentioning software?**

## Passes (business language)

| Example                     |
| --------------------------- |
| Employee onboarding         |
| Customer complaint handling |
| Project approval            |
| Procurement request         |
| Leave approval              |
| Quality review              |
| Contract approval           |

## Fails (implementation language)

| Example          | Why it fails                             |
| ---------------- | ---------------------------------------- |
| Trigger webhook  | Technology verb — not a business journey |
| Run automation   | Execution concern, not business intent   |
| Execute provider | Integration detail                       |
| Call API         | Implementation step                      |

## Rule

If the workflow cannot be described in business language, it is probably **not** a workflow — it is an implementation detail and belongs outside the product identity of APZ Workflow (typically automation/execution or a connector).

## Use in Native Adoption

N-01…N-04 must apply this test to naming, navigation labels, help text, templates, and any user-visible process catalogue. Failures are gaps — not features to productise.
