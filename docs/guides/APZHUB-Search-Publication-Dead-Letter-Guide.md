# Search Publication Dead-letter Guide

> **Milestone:** APZSEARCH-017

## Inspect

List with `status=dead-letter` (hide acknowledged/archived by default).

## Retry

Re-enqueues a **new** journal row with the original payload. Original dead-letter row remains for audit.

## Acknowledge

Admin marker — hides from default DLQ lists. Journal row retained.

## Archive

Admin marker — stronger hide from default views. Journal row retained. Never permanently deleted via UI.
