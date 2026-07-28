# Programme Governance

> **Programme:** APZHUB-ENGINEERING-001  
> **Normative:** Applies to every APZHUB engineering programme.

---

## Programme naming standard

| Kind                                | Pattern                              | Examples                                                        |
| ----------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| Platform capability programme       | `APZHUB-PLATFORM-{CAPABILITY}-{NNN}` | `APZHUB-PLATFORM-ANALYTICS-001`, `APZHUB-PLATFORM-WORKFLOW-006` |
| Commercial product programme        | `APZ-{PRODUCT}-{NNN}`                | `APZ-ANALYTICS-001`, `APZ-WORKFLOW-002`                         |
| Cross-cutting engineering programme | `APZHUB-ENGINEERING-{NNN}`           | `APZHUB-ENGINEERING-001`                                        |
| Build / sprint (legacy/foundation)  | `BUILD-{NNN}` / `SPR-{NNN}`          | As existing                                                     |

Rules:

1. Use uppercase capability/product tokens without spaces.
2. Sequence numbers are zero-padded to three digits per series.
3. One programme ID per Owner Approval; do not reuse IDs.
4. Titles must state classification: DOCUMENTATION ONLY · FOUNDATION · IMPLEMENTATION · CERTIFICATION · PRODUCTION RELEASE · PACKAGING ONLY.

---

## Owner Approval process

1. Owner issues **OWNER PROGRAMME APPROVAL** (or equivalent Decision) with: Programme ID, Title, Classification, Scope, Stop conditions, Success criteria.
2. Agent bootstraps from **AI-MANIFEST** and repository evidence only.
3. Programme may not start without Approval.
4. Scope expansion requires a new Owner Decision (not agent assumption).

---

## Owner Acceptance process

1. Agent files Completion Report + Acceptance Report under `docs/sprint/` and `docs/foundation/completion-reports/` (or product/release paths for commercial packaging).
2. KF updated: AI-MANIFEST · CURRENT-STATE · CURRENT-MILESTONE · OWNER-ACCEPTANCE-REGISTER · DOCUMENT-MAP / PROJECT-INDEX as needed.
3. Status: **Awaiting Acceptance** until Owner Decision.
4. Owner Decision records: ACCEPTED / ACCEPTED WITH CONDITIONS / REJECTED · recommendation confirmation · next authorised programme (if any).
5. Acceptance of phase _N_ may be recorded in the Decision that authorises phase _N+1_.

---

## Architecture Freeze rules

1. Integration SDK **1.0.0** is Architecture Frozen unless Owner Decision + ADR reopen.
2. Frozen contracts, gateway facets, and OpenAPI major surfaces require ADR for breaking change.
3. Agents must not silently revise frozen ADRs or SDK versions.
4. Documentation programmes must not alter freeze status.

---

## Repository freeze rules

1. Production Release establishes a SemVer baseline; further changes need new Owner Approval.
2. Packaging-only programmes must not change runtime behaviour.
3. Documentation-only programmes must not introduce packages, tests, or builds as deliverables.
4. Host coexistence / ENVIRONMENT constraints remain in force.

---

## SemVer rules

| Surface                      | Versioning                                                   |
| ---------------------------- | ------------------------------------------------------------ |
| Contracts packages           | SemVer; bump on any export change; MAJOR for breaking        |
| Integration packages         | SemVer; document CE compatibility                            |
| OpenAPI                      | Spec `info.version` bump on any published path/schema change |
| Commercial products          | SemVer baseline at Production Release (e.g. `1.0.0`)         |
| Platform services (internal) | Follow package SemVer of containing package                  |

Default Release 1.0 posture: **PRODUCTION_READY_WITH_LIMITATIONS** is a valid certification class.

---

## Breaking-change policy

Breaking changes require:

1. Owner Approval
2. ADR (Accepted)
3. MAJOR SemVer (package and/or product as applicable)
4. Compatibility matrix update
5. Migration / consumer notes
6. OpenAPI MAJOR or explicit deprecation path for HTTP

Non-breaking additive changes may be MINOR/PATCH under Owner-approved programme scope.

---

## Consumer compatibility policy

1. Platform Services consume Integration SDK + contracts only.
2. HTTP handlers consume `gateway.*` only — never `integration-*` packages.
3. Workbench clients consume `/api/v1/{capability}/*` only — never gateway or integrations.
4. Commercial products must not bypass the platform stack.
5. Compatibility matrices must list known consumers and supported versions.

---

## Stop / Continue policy

| Signal                            | Action                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| Owner STOP in Approval            | Halt; do not start named forbidden programmes                       |
| Gate FAIL                         | Do not file READY; fix or file WITH CONDITIONS only if Owner allows |
| Scope creep                       | Stop and request Owner Decision                                     |
| Freeze conflict                   | Stop; propose ADR; await Owner                                      |
| Acceptance pending                | Do not start next programme without Approval                        |
| Documentation-only classification | No code/packages/tests/builds                                       |

**Continue** only when Exit Criteria + Owner Acceptance (or explicit continue-without-acceptance authorisation) are met.
