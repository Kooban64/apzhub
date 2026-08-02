# APZQEP-140 — Core Quality Engineering

| Field      | Value                                                           |
| ---------- | --------------------------------------------------------------- |
| Programme  | APZQEP-140                                                      |
| Title      | Core Quality Engineering                                        |
| Status     | **NOT STARTED** · Recommended · Awaiting Owner Auth for 000     |
| Depends on | APZQEP-120 Platform Foundation **CLOSED** / Board **CERTIFIED** |
| Focus      | User-facing quality engineering capabilities on mature runtime  |

---

## Programme boundary

| Programme  | Focus                      | Status          |
| ---------- | -------------------------- | --------------- |
| APZQEP-120 | Platform Engineering       | **CLOSED**      |
| APZQEP-140 | Core Quality Engineering   | **NOT STARTED** |
| APZQEP-160 | Intelligence & AI (future) | Future          |

> Do **not** continue product slices under APZQEP-120.

---

## Capability streams

### Capability A — Test Management

- Suites
- Cases
- Parameters
- Libraries

### Capability B — Execution

- Runs
- Execution
- Results
- Evidence

### Capability C — Quality

- Defects
- Traceability
- Coverage
- Risk

### Capability D — Reporting

- Dashboards
- Analytics
- Executive Reporting

---

## First phase (required before implementation)

**APZQEP-140-000 — Core Quality Engineering Architecture**

Lightweight Product Capability Architecture defining:

- capability boundaries
- domain ownership
- APIs
- events
- UI modules
- data ownership
- integration points
- roadmap sequencing

See [APZQEP-140-000-PRODUCT-BOARD-RECOMMENDATION.md](./APZQEP-140-000-PRODUCT-BOARD-RECOMMENDATION.md).

**No Suite / Run / Execution engineering** until 000 is authorised and approved.

---

## Indicative implementation sequence (after 000)

| Slice | Title                       |
| ----- | --------------------------- |
| S14   | Suite Management            |
| S15   | Test Run Management         |
| S16   | Test Execution              |
| S17   | Defect Management           |
| S18   | Requirements & Traceability |
| S19   | Reporting & Analytics       |

Exact IDs and ordering are confirmed by the 000 architecture pack.

---

## Platform consumption (immutable)

Consume APZQEP-120 packages — do not redesign:

- `@apzhub/platform-outbox`
- `@apzhub/platform-processing`
- `@apzhub/qep-knowledge-index`
- `@apzhub/qep-notification`
- `@apzhub/qep-command`
- `@apzhub/qep-evidence`

---

## Authority

Opening engineering under APZQEP-140 requires Owner Authorisation Packs (starting with **140-000**).
