# APZQEP-140 — Core Quality Engineering

| Field      | Value                                                  |
| ---------- | ------------------------------------------------------ |
| Programme  | APZQEP-140                                             |
| Title      | Core Quality Engineering                               |
| Status     | **Architecture CERTIFIED** · Capability A **COMPLETE** |
| Depends on | APZQEP-120 Platform Foundation **CLOSED**              |
| Progress   | [CAPABILITY-PROGRESS.md](./CAPABILITY-PROGRESS.md)     |

---

## Programme boundary

| Programme      | Focus                            | Status                                  |
| -------------- | -------------------------------- | --------------------------------------- |
| APZQEP-120     | Platform Engineering             | **CLOSED**                              |
| APZQEP-140-000 | Product Architecture             | **CERTIFIED / APPROVED**                |
| APZQEP-140-A   | Enterprise Test Suite Management | **COMPLETE**                            |
| APZQEP-140-B…F | Capability engineering           | B recommended next · Auth Pack required |

---

## Where we are

| Layer                | State                                           |
| -------------------- | ----------------------------------------------- |
| Platform             | **Complete**                                    |
| Product architecture | **Approved**                                    |
| Capability A         | **Complete** — Enterprise Test Suite Management |
| Capabilities B–F     | **0%** — ready to build                         |

Primary metric: [CAPABILITY-PROGRESS.md](./CAPABILITY-PROGRESS.md).

---

## APZQEP-140-000

- Board: [000/APZQEP-140-000-PRODUCT-BOARD-CERTIFICATION.md](./000/APZQEP-140-000-PRODUCT-BOARD-CERTIFICATION.md)
- Pack: [000/README.md](./000/README.md)

---

## Capability A (COMPLETE)

**Enterprise Test Suite Management** — [a/README.md](./a/README.md)

Package: `@apzhub/qep-suites` · Workspace: `/workspace/qep/suites`

---

## Next capability

**APZQEP-140-B — Enterprise Test Run Management**

Engineering starts only with Owner Authorisation Pack (`AUTHORISED`)

---

## Platform consumption (immutable)

`@apzhub/platform-outbox` · `@apzhub/platform-processing` · `@apzhub/qep-knowledge-index` · `@apzhub/qep-notification` · `@apzhub/qep-command` · `@apzhub/qep-evidence` · `@apzhub/qep-suites`
