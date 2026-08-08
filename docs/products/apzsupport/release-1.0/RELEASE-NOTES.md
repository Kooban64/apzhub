# APZ Support Version 1.0 — Release Notes

| Field   | Value                         |
| ------- | ----------------------------- |
| Product | APZ Support                   |
| Version | **1.0**                       |
| Status  | **Production Ready** · CLOSED |
| Date    | 2026-08-08                    |

## What is delivered

Permissioned users can raise, follow, communicate on, and close support requests via APZHUB Workbench on a durable fail-closed path, with honest limitation disclosure and Delivery-Standard hardening evidence.

## Honest limitations (v1.0)

- Live updates are **not enabled** in the Support product UI (platform SSE may exist behind flags).
- Attachments: **1 MiB** max; **no delete**.
- Ticket business data remains in the Support engine; platform owns identity mappings and product UX.

## Out of scope

Support 2.0, redesign, new engines, native N-05, architecture reopen without ADR.

## Engineering

Finite inventory APZSUP-002 **ACCEPTED**. Phases 1–3 **Closed**. Evidence under `docs/products/apzsupport/engineering/evidence/`.
