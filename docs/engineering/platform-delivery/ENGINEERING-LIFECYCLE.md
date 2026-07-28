# Engineering Lifecycle

> **Programme:** APZHUB-ENGINEERING-001  
> **Normative companion to:** [PLATFORM-DELIVERY-STANDARD.md](./PLATFORM-DELIVERY-STANDARD.md)

---

## Overview

APZHUB delivers platform capabilities and commercial products through a fixed phase sequence. Each phase is typically **one Owner-approved programme**. Certification and Production Release may be a single commercial programme when implementation is already complete.

```text
Commercial Planning
      ↓
Platform Foundation
      ↓
Information Model
      ↓
Provider Integration
      ↓
Contracts
      ↓
Platform Services
      ↓
HTTP API
      ↓
Workbench Module
      ↓
Product Certification
      ↓
Production Release
```

Cross-cutting AI operating loop (always):

```text
Bootstrap → Recommend → Owner Approval → Implement → Test → Certify
→ Acceptance Report → Owner Acceptance → Bootstrap → Next Recommend
```

See [AI-WORKFLOW](../../foundation/AI-WORKFLOW.md).

---

## Phase catalogue

| #   | Phase                 | Typical programme               | Classification     | Typical recommendation                       |
| --- | --------------------- | ------------------------------- | ------------------ | -------------------------------------------- |
| 1   | Commercial Planning   | `APZ-{PRODUCT}-001`             | DOCUMENTATION ONLY | READY WITH CONDITIONS / IMPLEMENTATION READY |
| 2   | Platform Foundation   | `APZHUB-PLATFORM-{CAP}-001`     | DOCS (+ ADRs)      | FOUNDATION READY                             |
| 3   | Information Model     | `APZHUB-PLATFORM-{CAP}-002`     | DOCS               | FOUNDATION COMPLETE                          |
| 4   | Provider Integration  | `APZHUB-INTEGRATION-{PROV}-001` | PRODUCTION CODE    | CERTIFIED_FOUNDATION                         |
| 5   | Contracts             | `APZHUB-PLATFORM-{CAP}-003`     | PRODUCTION CODE    | CONTRACTS READY                              |
| 6   | Platform Services     | `APZHUB-PLATFORM-{CAP}-004`     | PRODUCTION CODE    | SERVICES READY                               |
| 7   | HTTP API              | `APZHUB-PLATFORM-{CAP}-005`     | PRODUCTION CODE    | HTTP API READY                               |
| 8   | Workbench Module      | `APZHUB-PLATFORM-{CAP}-006`     | PRODUCTION CODE    | WORKBENCH READY                              |
| 9   | Product Certification | `APZ-{PRODUCT}-00N`             | PRODUCTION RELEASE | PRODUCTION READY / PRWL                      |
| 10  | Production Release    | Same as certification pack      | PRODUCTION RELEASE | SemVer evidence under `docs/releases/`       |

Per-phase gates: [STAGE-GATES.md](./STAGE-GATES.md).

---

## Sequencing rules

1. Commercial Planning may run **before** or **in parallel with** early platform foundation docs, but **implementation** of contracts/services/HTTP/workbench requires foundation + IM + provider foundation as Owner-approved prerequisites.
2. Contracts must exist before Platform Services implementation.
3. Platform Services must exist before HTTP API (handlers call `gateway.{capability}.*` only).
4. HTTP API must exist before Workbench (typed client calls `/api/v1/{capability}/*` only).
5. Product Certification verifies the full vertical; it does **not** add features.
6. Production Release packaging is the SemVer evidence set; Owner Acceptance closes the commercial baseline.

---

## Classification rules

| Classification     | Allowed work                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| DOCUMENTATION ONLY | Docs, ADRs (if authorised), catalogues, plans — **no production code** |
| PRODUCTION CODE    | Packages, services, HTTP, Workbench within Owner scope                 |
| PRODUCTION RELEASE | Certification, packaging, register updates — **no new features**       |

---

## STOP between programmes

After each programme Completion + Acceptance Report:

1. File status **Awaiting Acceptance**
2. Update CURRENT-MILESTONE stop condition
3. Do **not** start the next phase
4. Await explicit Owner Acceptance, then Owner Approval of the next named programme
