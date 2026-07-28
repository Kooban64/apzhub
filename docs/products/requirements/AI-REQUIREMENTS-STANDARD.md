# AI Requirements Standard

> **Programme:** APZHUB-PRODUCTS-004 · Aligns with [../definition/PRODUCT-AI-STANDARD.md](../definition/PRODUCT-AI-STANDARD.md)

## Purpose

Make AI scope explicit at Requirements time. AI is opt-in and Owner-gated for later implementation.

## Mandatory choice

**A)** AI **out of scope** for this baseline — rationale recorded, or  
**B)** AI requirements completed for:

| Topic             | Content                                  |
| ----------------- | ---------------------------------------- |
| AI capabilities   | User outcomes                            |
| Guardrails        | Disallowed actions; human-in-the-loop    |
| Prompt governance | Ownership / change control intent        |
| Knowledge sources | SoRs / indexes; permission filtering     |
| Model usage       | Provider classes; self-hosted preference |
| Auditability      | Logging and review                       |

## Binding rules

1. AI must not grant permissions or bypass Authz.
2. AI must not call engines/connectors directly.
3. Including AI requirements does **not** authorise AI implementation.
4. Use IDs `AIR-###`.

## Default

If unsure: **N/A — out of scope** for the current horizon.
