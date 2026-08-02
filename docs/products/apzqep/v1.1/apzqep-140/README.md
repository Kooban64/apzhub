# APZQEP-140 — Core Quality Engineering

| Field      | Value                                                           |
| ---------- | --------------------------------------------------------------- |
| Programme  | APZQEP-140                                                      |
| Title      | Core Quality Engineering                                        |
| Status     | **ARCHITECTURE COMPLETE** · Implementation **NOT AUTHORISED**   |
| Depends on | APZQEP-120 Platform Foundation **CLOSED** / Board **CERTIFIED** |
| Focus      | User-facing quality engineering capabilities on mature runtime  |

---

## Programme boundary

| Programme  | Focus                      | Status                                 |
| ---------- | -------------------------- | -------------------------------------- |
| APZQEP-120 | Platform Engineering       | **CLOSED**                             |
| APZQEP-140 | Core Quality Engineering   | Architecture done · impl pending Board |
| APZQEP-160 | Intelligence & AI (future) | Future                                 |

> Do **not** continue product slices under APZQEP-120.

---

## APZQEP-140-000 (COMPLETE)

Architecture pack (documentation only):

**[000/README.md](./000/README.md)** · [Board review](./000/PRODUCT-BOARD-REVIEW.md) · [Completion](./000/APZQEP-140-000-COMPLETION.md)

---

## Capabilities (A–F)

| ID  | Capability                                         |
| --- | -------------------------------------------------- |
| A   | Test Management (Suites, Libraries, Shared Assets) |
| B   | Run Management                                     |
| C   | Test Execution                                     |
| D   | Defect & Quality Findings                          |
| E   | Requirements & Traceability                        |
| F   | Reporting                                          |

Stakeholder streams: [CAPABILITY-STREAMS.md](./CAPABILITY-STREAMS.md) · Detail: [000/CAPABILITY-MAP.md](./000/CAPABILITY-MAP.md)

---

## Implementation programmes (after Board approval of 000)

| Programme    | Title                         |
| ------------ | ----------------------------- |
| APZQEP-140-A | Suite & Library Management    |
| APZQEP-140-B | Test Run Management           |
| APZQEP-140-C | Test Execution Productisation |
| APZQEP-140-D | Defect & Quality Findings     |
| APZQEP-140-E | Requirements & Traceability   |
| APZQEP-140-F | Reporting & Analytics         |

See [000/ENGINEERING-PROGRAMME-BREAKDOWN.md](./000/ENGINEERING-PROGRAMME-BREAKDOWN.md).

---

## Platform consumption (immutable)

`@apzhub/platform-outbox` · `@apzhub/platform-processing` · `@apzhub/qep-knowledge-index` · `@apzhub/qep-notification` · `@apzhub/qep-command` · `@apzhub/qep-evidence`

---

## Authority

```text
140-000 architecture = COMPLETE / READY FOR BOARD
140-A…F engineering = NOT AUTHORISED
```
