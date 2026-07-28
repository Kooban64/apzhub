# ENG-020E Completion Report

> **Status:** ACCEPTED / CLOSED / COMPLETE  
> Owner Acceptance recorded 2026-07-26 — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md).

## Delivered

**Part 1 (foundations):** baseline aggregate, value objects, immutable
membership model, policies, repository/event contracts, and domain tests for
state, transitions, immutability, duplicate membership, content-version
identifiers, and no unlock.

**Part 2 (runtime):** PostgreSQL persistence (migrations `0074`/`0075`),
in-memory repository, application service (create/update-draft/add-item/
remove-item/lock/archive/list/get/history/compare), platform-service and
contracts adapters, REST API routes, and baseline permissions
(`qep.requirements.baselines.view|create|modify|lock|archive|compare`).

**Part 3 (integrity + Workbench):**

- SHA-256 canonical integrity fingerprinting over membership + content-version
  snapshot hashes (`requirement-baseline-integrity.ts`), with the empty-lock
  rule enforced at the domain, application, and repository layers.
- `verifyBaselineIntegrity` command, API route, and permission
  (`qep.requirements.baselines.verify`), with `recordIntegrityVerification` on
  both repository adapters.
- `availableActions` computed on `QepBaselineDto` from status + permissions
  (`computeQepBaselineAvailableActions`).
- `versionChanged` overlay on baseline comparison for re-versioned
  requirements.
- Workbench UI: baseline list, create, detail (with contents table, add-version
  flow, lock/archive confirmations, verify-integrity action), compare view, and
  a Requirement-detail "Baseline History" panel. Routes added under
  `/workspace/qep/requirements/baselines`.
- Domain, application, contracts, and presentation test suites extended;
  ENG-020A–D suites remain green.

## Not delivered (explicitly out of scope)

Unlock, restore, delete, clone, merge, import/export; relationships,
traceability, verification-execution, AI, and MCP integration. See
[OUT-OF-SCOPE.md](./OUT-OF-SCOPE.md).

## Next programme

Not authorised. No new sprint or engineering programme should begin against
this module without a new approved programme guide (per the APZHUB
Constitution phase gate).
