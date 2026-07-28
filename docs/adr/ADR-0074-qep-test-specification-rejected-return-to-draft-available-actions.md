# ADR-0074 — Test Specification Rejected → Draft and `availableActions` fidelity

| Item                | Value                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| ADR                 | **ADR-0074**                                                                                                |
| Title               | QEP Test Specification — Rejected → Draft vs `availableActions` contract                                    |
| Status              | **Accepted**                                                                                                |
| Date                | 2026-07-27                                                                                                  |
| Product             | APZ QEP                                                                                                     |
| Related             | APZQEP-ENG-050A · APZQEP-ENG-050B · APZQEP-OES-ARCH-012 · APZQEP-ENG-050C · `@apzhub/qep-contracts`         |
| Deciders            | Owner / APZOR Engineering                                                                                   |
| ENG-050C resolution | **NO CHANGE** — Workbench reflects current contract; `returnToDraft` deferred to a separate delta programme |

---

## Context

Domain engineering (**ENG-050A**) permits the lifecycle transition **Rejected → Draft** (`returnSpecificationToDraft`).

The application/contracts surface (`computeQepTestSpecificationAvailableActions` in `@apzhub/qep-contracts`) currently exposes for `rejected` only:

- `withdraw`
- `cancel`

It does **not** expose a return-to-draft action (e.g. `returnToDraft`).

Workbench Architecture (**OES-ARCH-012**) correctly records that the Workbench MUST render only server `availableActions` and MUST NOT invent client-side transitions.

## Decision

1. **Presentation layer authority:** The Workbench (future ENG-050C) SHALL expose only actions present in the server DTO `availableActions`. It MUST NOT invent `returnToDraft` (or equivalent) in the UI.
2. **Correction locus:** If product intent is that authors may return Rejected Specifications to Draft, the change SHALL be made in **Domain (if needed) → Application → `@apzhub/qep-contracts` `availableActions` → REST/DTO**, with tests and audit, under a separately authorised engineering change — **not** by amending Workbench Architecture to fake the action.
3. **OES-ARCH-012:** Remains Accepted without modification for this gap; the observation stands as intentional architectural discipline.

## Consequences

### Positive

- Preserves Zero Trust and server authority (013, OES-ARCH-012 Principles 1 & 4).
- Prevents presentation-layer lifecycle drift.
- Creates an explicit backlog/ADR trail for contract alignment.

### Owner Decision (2026-07-27) — ENG-050C scope

**No contract change within ENG-050C.**

- Workbench MUST faithfully reflect Withdraw / Cancel only for `rejected`
- A **separate delta programme** SHALL evaluate whether `returnToDraft` becomes part of Domain/Application/API
- If approved, implement Domain + Infrastructure first; Workbench consumes the updated contract afterwards

### Follow-up (separate programme — not ENG-050C)

| Item                                                                            | Owner                      |
| ------------------------------------------------------------------------------- | -------------------------- |
| Evaluate whether Rejected → Draft is a required product command                 | Owner / delta programme    |
| If yes: add action to contracts, wire application command, expose in DTO, tests | Domain + Infra delta first |
| Then: Workbench consumes updated `availableActions`                             | Post-delta Workbench patch |

### Out of scope

- Workbench React implementation
- Silent Domain weakening
- AI/MCP inventing the transition

## Traceability

| Artefact           | Link                                               |
| ------------------ | -------------------------------------------------- |
| Domain transition  | ENG-050A `returnSpecificationToDraft`              |
| Contracts          | `packages/qep-contracts/src/test-specification.ts` |
| Architecture note  | OES-ARCH-012 Part 4 §3.3                           |
| Owner confirmation | OES-ARCH-012 OWNER-ACCEPTANCE 2026-07-27           |

## STOP

```text
ADR-0074 ACCEPTED
WORKBENCH MUST NOT INVENT returnToDraft
CONTRACT/DOMAIN CORRECTION REQUIRES SEPARATE AUTHORISATION
```
