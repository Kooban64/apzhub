# APZHUB Portfolio Status Model

> **Programme:** APZHUB-GOVERNANCE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md) · [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md) · [Engineering Operating Model](../operations/ENGINEERING-OPERATING-MODEL.md)  
> **Date:** 2026-07-19

---

## Purpose

Canonical **status vocabularies** for every governance dashboard dimension.  
Implementations (future) must use these enums — do not invent parallel labels.

---

## 1. Repository status

| Value                              | Meaning                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `PRODUCTION_READY`                 | QA certification held; merge gates green as certified |
| `PRODUCTION_READY_WITH_EXCEPTIONS` | Owner-accepted temporary QA exception documented      |
| `DEGRADED`                         | Known gate failure or blocked merge path              |
| `UNKNOWN`                          | Insufficient metadata                                 |

**Primary source today:** QA-002 certification · CI on `main`.

---

## 2. Platform status

| Value         | Meaning                                                              |
| ------------- | -------------------------------------------------------------------- |
| `OPERATIONAL` | Capability delivered and in use                                      |
| `FROZEN`      | Architecture freeze in force (ADR + Owner to change)                 |
| `MVP`         | Delivered with documented MVP limitations (e.g. Event Bus **0.1.0**) |
| `CLOSED`      | Programme/foundation closed (e.g. Platform Foundation)               |
| `PLANNED`     | Documented intent only                                               |

Apply per subsystem (Runtime, SDK, Services, HTTP, Workbench, AuthN, AuthZ, Provisioning, Configuration).

---

## 3. Integration status

| Value                        | Meaning                                         |
| ---------------------------- | ----------------------------------------------- |
| `CERTIFIED`                  | Full certification without material limitations |
| `CERTIFIED_WITH_LIMITATIONS` | Certified; limitations documented               |
| `CERTIFIED_DOMAIN`           | Domain API certification (e.g. Kimai **0.2.0**) |
| `REFERENCE_ADAPTER`          | Official reference; may be read-only / metadata |
| `IN_PROGRESS`                | Active certification programme                  |
| `ABSENT`                     | Not on disk                                     |
| `DEPRECATED`                 | Owner-declared deprecation                      |

---

## 4. Product status (maturity)

Aligned with Portfolio maturity legend:

| Value                         | Meaning                                      |
| ----------------------------- | -------------------------------------------- |
| `CONCEPT`                     | Intent only                                  |
| `PLANNING`                    | Roadmapped; no substantive delivery          |
| `ARCHITECTURE_READY`          | Architecture ready; product incomplete       |
| `IMPLEMENTATION_READY`        | IR declared; waiting Owner Approval to build |
| `IN_DEVELOPMENT`              | Active delivery                              |
| `PRODUCTION`                  | Production SemVer / certified slice in use   |
| `PRODUCTION_WITH_LIMITATIONS` | Production with honest PRWL limitations      |
| `MAINTENANCE`                 | Production; only Owner-approved Patch/hotfix |

**Release line fields (separate):** `currentVersion`, `patchLine`, `minorLine`, `majorLine` (naming only until approved).

---

## 5. Programme status

Aligned with Operating Model / CURRENT-MILESTONE:

| Value                              | Meaning                                           |
| ---------------------------------- | ------------------------------------------------- |
| `RECOMMENDED_AWAITING_APPROVAL`    | Recommendation only — not authorised              |
| `APPROVED_AWAITING_IMPLEMENTATION` | Owner Approval given                              |
| `IMPLEMENTED_AWAITING_ACCEPTANCE`  | Acceptance Report filed                           |
| `ACCEPTED_CLOSED`                  | Owner Acceptance — CLOSED                         |
| `BLOCKED`                          | Explicit blocker (freeze, dependency, Owner STOP) |
| `CANCELLED`                        | Owner cancelled                                   |

---

## 6. Release status

| Value                | Meaning                             |
| -------------------- | ----------------------------------- |
| `PLANNING`           | Scope not Owner-approved            |
| `IN_DELIVERY`        | Approved programme executing        |
| `PENDING_ACCEPTANCE` | Completion filed; await Owner       |
| `PRODUCTION`         | Current Production SemVer           |
| `SUPERSEDED`         | Replaced by later SemVer            |
| `HOTFIX`             | Emergency Patch under HOTFIX-POLICY |
| `NOT_SCHEDULED`      | Naming line only — not authorised   |

---

## 7. Quality status

| Value     | Meaning                            |
| --------- | ---------------------------------- |
| `PASS`    | Gate green                         |
| `FAIL`    | Gate red                           |
| `WARN`    | Soft failure / flaky / partial     |
| `SKIPPED` | Intentionally not run (documented) |
| `UNKNOWN` | No recent evidence                 |

---

## 8. Certification status

| Value                               | Meaning                                            |
| ----------------------------------- | -------------------------------------------------- |
| `NOT_STARTED`                       | No cert programme                                  |
| `IN_PROGRESS`                       | Cert underway                                      |
| `CERTIFIED`                         | Cert closed without material limits                |
| `CERTIFIED_WITH_LIMITATIONS`        | Cert closed; limits documented                     |
| `PRODUCTION_READY`                  | Repository / product QA label                      |
| `PRODUCTION_READY_WITH_LIMITATIONS` | PRWL                                               |
| `EXPIRED`                           | Evidence stale vs declared refresh policy (future) |
| `REVOKED`                           | Owner revoked                                      |

---

## 9. Health (aggregate traffic light)

Used on dashboard cards; derived — never manually contradictory to underlying statuses.

| Value       | Meaning                                                 |
| ----------- | ------------------------------------------------------- |
| `HEALTHY`   | No FAIL; no BLOCKED; Production/Operational as expected |
| `DEGRADED`  | WARN or limitations materially affecting ops            |
| `UNHEALTHY` | FAIL, DEGRADED repo, or BLOCKED critical path           |
| `UNKNOWN`   | Missing data                                            |

---

## Related

- [REPOSITORY-HEALTH-MODEL.md](./REPOSITORY-HEALTH-MODEL.md)
- [ENGINEERING-GOVERNANCE-DASHBOARD.md](./ENGINEERING-GOVERNANCE-DASHBOARD.md)
- [GOVERNANCE-DASHBOARD-DATA-MODEL.md](./GOVERNANCE-DASHBOARD-DATA-MODEL.md)
