# APZHUB Enterprise Testing Standard

| Field            | Value                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Document         | APZHUB-TESTING-STANDARD                                                                  |
| Catalogue ID     | **ES-001**                                                                               |
| Programme        | APZHUB-ENG-002                                                                           |
| Classification   | Enterprise Engineering Standard                                                          |
| Status           | **DRAFT — Under Review** (awaiting Product Board Certification)                          |
| Version          | **1.0** (candidate)                                                                      |
| Authority        | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md)       |
| Catalogue        | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md) |
| Reference source | APZQEP Testing Standard v1.0 (reference implementation — **not** copied verbatim)        |
| Process parents  | Foundation quality / release standards · APZHUB-ENG-001 / ADR-0092                       |
| Scope            | All APZHUB portfolio engineering (platform and products)                                 |
| Compliance       | **Mandatory** when Active                                                                |
| Exceptions       | Only by approved ADR                                                                     |

---

## 0. Normative language

The key words **MUST**, **MUST NOT**, **SHALL**, **SHALL NOT**, **SHOULD**, and **MAY** are to be interpreted as RFC 2119 obligations.

This document is the candidate **enterprise** Testing Standard (ES-001). It becomes mandatory portfolio law only when the catalogue status for ES-001 is **Active**.

Until then, product engineering frameworks and APZHUB-ENG-001 slice practice remain the operable testing obligations for in-flight work.

Certification outcomes (PASS / FAIL / STOP) are owned by the Enterprise Certification Standard (ES-002) when Active. Until then, APZHUB-ENG-001 slice certification practice applies. This Testing Standard owns **what MUST be tested** and **how test evidence MUST be produced**.

---

## 1. Purpose

Testing exists to prove that authorised engineering work (typically an engineering slice):

1. implements its acceptance criteria;
2. preserves architectural boundaries;
3. preserves default-deny security and tenant (and, where applicable, project/workspace) isolation;
4. does not regress certified behaviour without documented intent;
5. leaves the repository releasable.

Tests that only exercise happy paths without isolation, authorisation, or boundary risk are insufficient for certification.

---

## 2. Principles

1. Tests MUST protect **properties** (isolation, invariants, deny paths), not only method coverage percentages.
2. Tests MUST run in CI for every commit that changes packages in the authorised scope.
3. Work MUST NOT be certified if required tests for its change types are missing or failing.
4. Flaky tests MUST be treated as defects; they MUST NOT be ignored to force a PASS.
5. Test doubles MUST NOT weaken the property under test (for example, a fake authorisation layer that always allows).
6. Production secrets MUST NOT appear in tests, fixtures, or evidence.
7. AI-generated tests MUST meet the same standard as human-written tests.
8. Product-specific test conventions MAY tighten this standard; they MUST NOT weaken it.

---

## 3. Test pyramid (mandatory levels)

Every engineering specification MUST classify which levels apply. Levels that apply MUST pass.

| Level                     | Purpose                                                             | When mandatory                                                                       |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Unit**                  | Domain rules, pure policy, validators, mappers, transition matrices | Always when domain or application logic changes                                      |
| **Integration**           | Adapters + real or disposable test infrastructure                   | When persistence, storage, or external adapter behaviour changes                     |
| **Security**              | Authz, tenant/workspace isolation, default deny, ACL                | When any security-relevant path changes; also when list/search/query surfaces change |
| **Migration**             | Schema apply + compatibility with existing identifiers/content      | When migrations are introduced or modified                                           |
| **Regression**            | Prior certified behaviours remain green                             | Always for packages touched by the work                                              |
| **Performance**           | Latency/throughput/resource bounds                                  | Only when the specification states performance requirements                          |
| **Architecture boundary** | Illegal layer imports fail                                          | Always for capability packages that declare layered layout                           |
| **Certification suite**   | Aggregate proof for acceptance criteria                             | Always before certification                                                          |

End-to-end UI / browser automation flows MAY be required by a specification; they are not a substitute for unit, integration, or security tests of application services.

---

## 4. Unit testing

### 4.1 Requirements

1. Domain invariants and state-transition rules MUST have unit tests.
2. Application services MUST be unit-tested with ports faked or stubbed at the boundary.
3. Unit tests MUST NOT require network access to production systems.
4. Unit tests MUST NOT depend on undeclared global mutable state across files.
5. Deterministic clock/id generators SHOULD be injected where time/id affect assertions.

### 4.2 Naming and placement

Enterprise default (products MAY specialise naming if CI selection remains clear):

- File: `<subject>.test.ts` (or language-equivalent)
- Suite titles MUST identify the type or module under test
- Test titles MUST state the behaviour or property under test

### 4.3 Minimum expectations

For each new or changed public application method that mutates state, tests MUST cover:

- at least one success path aligned to acceptance criteria;
- at least one validation failure path;
- at least one authorisation or isolation failure path when the method is security-relevant.

---

## 5. Integration testing

### 5.1 Requirements

1. Repository adapters MUST have integration tests for load/save paths that the work changes.
2. Tenant (and workspace/project where used) predicates MUST be asserted in integration tests for multi-tenant stores.
3. Storage provider adapters MUST prove store/retrieve (and logical delete behaviour if claimed) for providers in scope.
4. Integration tests MUST use disposable fixtures or transactional cleanup; they MUST NOT leave durable pollution in shared environments without an explicit test harness contract.
5. When a relational database is the reference store, tests SHOULD use the repository’s established test database or disposable-container pattern for that package.

### 5.2 Naming

- Prefer `<subject>.test.ts` with suite titles stating integration scope, or `<subject>.integration.test.ts` when separation aids CI selection.

---

## 6. Security testing

### 6.1 Requirements

Security tests MUST prove, for paths in scope:

1. **Default deny** — missing permission ⇒ deny.
2. **Tenant isolation** — tenant A MUST NOT read or mutate tenant B data through tested APIs/services.
3. **Workspace / project isolation** — where such partitions exist, cross-partition access MUST deny without grant.
4. **Anonymous / unauthenticated** — deny where authentication is required.
5. **ACL / grant edges** — allow only when the grant model says allow; revoke/deny paths covered when grants change.
6. **No secret leakage** — errors and logs in tests MUST NOT expect secrets in client-visible payloads.

### 6.2 Naming

- Prefer `*.enforcement.test.ts` or filenames containing `security`.
- Security suite failure MUST fail the security gate for the work.

### 6.3 When security tests are mandatory

Security tests are mandatory if the work touches any of:

- authentication, authorisation, permissions, ACL, grants;
- tenant or workspace/project scoping;
- list, search, query, export, or enumeration surfaces;
- upload, download, or storage access;
- lifecycle transitions that change visibility;
- public or semi-public API exposure.

If none apply, the Engineering Specification MUST state `Security tests required: NO` with reason. Silence is non-compliant.

---

## 7. Migration testing

1. Every new migration MUST be covered by a migration validation test or an established package migration test harness.
2. Tests MUST prove the migration applies successfully on a representative schema baseline.
3. Tests MUST prove identifiers and authoritative content required by the work remain readable after migrate.
4. Destructive migrations MUST NOT proceed without Owner authority; tests MUST NOT be used to smuggle destructive behaviour without that authority recorded.
5. File naming MUST include `migration` (for example `migration.validation.test.ts`).

---

## 8. Regression testing

1. Existing tests in packages touched by the work MUST remain green.
2. Intentional behaviour changes MUST update tests in the same authorised unit of work and MUST be documented in the Engineering Specification / engineering notes.
3. Removing or weakening a security or isolation test MUST NOT be done to obtain a green build; that requires ADR + Product Board visibility.
4. Certified behaviours that remain in scope MUST NOT silently regress.

---

## 9. Performance testing

1. Performance tests are mandatory only when the Engineering Specification states performance requirements.
2. When required, tests or measured evidence MUST record method, environment class, and results.
3. Performance work MUST NOT trade away isolation, correctness, or default deny.

---

## 10. Architecture boundary testing

1. Capability packages that use layered layouts (for example `domain/`, `application/`, `infrastructure/`) MUST include an architecture boundary test.
2. Boundary tests MUST fail on illegal imports (domain → infrastructure, application services → concrete adapters outside composition roots, and equivalent violations).
3. New illegal dependency edges MUST fail CI.

---

## 11. Coverage expectations

1. Coverage tooling MAY be used; coverage percentage alone MUST NOT be treated as certification.
2. Security-relevant modules changed by the work SHOULD have explicit tests for deny and isolation paths regardless of coverage %.
3. Untested public command paths introduced by the work are defects.
4. Where coverage gates already exist in package/CI config, they MUST remain satisfied unless an ADR excepts them.

---

## 12. Fixtures and test data

1. Fixtures MUST use synthetic tenant/workspace/user identifiers.
2. Fixtures MUST NOT embed production credentials or customer data.
3. Multi-tenant fixtures MUST include at least two tenants when isolation is under test.
4. Shared fixture helpers SHOULD live under package test support paths; they MUST NOT become a second domain model.

---

## 13. Failure handling

| Situation                               | Required action                                                    |
| --------------------------------------- | ------------------------------------------------------------------ |
| Required test failing                   | Fix or STOP — MUST NOT certify                                     |
| Flaky test                              | Quarantine only with issue record; MUST NOT ignore silently        |
| Missing mandatory level for change type | FAIL readiness — add tests                                         |
| Defect found outside authorised scope   | STOP / BLOCKED per process — do not expand scope without authority |
| Test proves acceptance criterion false  | FAIL — do not weaken assertion without Owner change to criteria    |

---

## 14. Evidence collection

### 14.1 Mandatory test evidence

Engineering evidence MUST include:

1. commands executed (package test scripts / CI job names);
2. result summary (pass counts or CI conclusion);
3. identification of security / migration / boundary suites when those levels applied;
4. timestamped evidence files under the product’s or programme’s evidence root.

### 14.2 Evidence artefacts (testing)

When tests are non-trivial, work SHOULD file:

```text
docs/operations/evidence/<product-or-programme>/<UTC>-<WORK_ID>-TESTING.json
```

Minimum JSON fields:

- `programme` / work identifier
- `timestampUtc`
- `levelsExecuted` (unit, integration, security, migration, regression, performance, boundary)
- `result` (`PASS` / `FAIL`)
- `commands`
- `packages`

Security-specific evidence remains required under `SECURITY` artefact naming when the security gate applies.

### 14.3 What MUST NOT appear in evidence

- secrets, tokens, private keys;
- full production data dumps;
- customer-identifying payloads unless synthetic and approved for evidence.

---

## 15. Relationship to Engineering Specifications

The Testing section of the applicable Engineering Specification MUST list the levels that apply.

Acceptance criteria MUST be mapped to tests or inspection proofs. An acceptance criterion without a verification method is a specification defect.

---

## 16. Relationship to certification

1. Testing PASS is necessary for certification PASS; it is not sufficient alone (docs, security, repository gates remain).
2. The Enterprise Certification Standard (ES-002) owns final PASS / FAIL / STOP vocabulary when Active.
3. Until ES-002 is Active, APZHUB-ENG-001 slice certification gates apply in addition to this standard (once this standard is Active).

---

## 17. CI requirements

1. Package tests in authorised scope MUST be executable via documented package scripts.
2. CI MUST run lint, typecheck, and unit/package tests required by portfolio quality standards for touched packages.
3. A red CI result for in-scope packages MUST block certification.
4. Local-only tests that cannot run in CI SHOULD be avoided; if unavoidable, the specification MUST record the gap and Product Board risk.

---

## 18. Tooling

This standard does **not** freeze tool vendors.

Durable rules:

1. The chosen runner MUST support deterministic automation in CI.
2. New packages MUST adopt the monorepo’s established test runner unless an ADR selects otherwise.
3. Tooling upgrades MUST NOT drop mandatory level coverage.

Reference implementation note: APZQEP currently uses Vitest for package tests and Playwright for designated E2E programmes. Other products MAY use equivalent runners that satisfy the durable rules above.

---

## 19. Compliance and exceptions

1. When ES-001 is **Active**, all APZHUB portfolio engineering MUST comply with this standard.
2. Exceptions MUST be granted only by approved ADR linked from the Engineering Specification.
3. AI agents MUST apply this standard without restatement in each Owner prompt.
4. On conflict with Document 000 or Foundation, Document 000 / Foundation prevail; then STOP if unresolvable in scope.
5. Product Testing Standards MAY remain as product specialisations; they MUST NOT contradict Active enterprise obligations.

---

## 20. Reference implementation

| Item                 | Value                                                                             |
| -------------------- | --------------------------------------------------------------------------------- |
| Proving product      | APZQEP                                                                            |
| Source framework     | APZQEP Engineering Framework v1.0                                                 |
| Source artefact      | `docs/products/apzqep/engineering/APZQEP-TESTING-STANDARD.md`                     |
| Derivation method    | **Abstraction** (see Promotion Principles) — not duplication                      |
| Genericisation notes | [ES-001-GENERICISATION-NOTES.md](./APZHUB-ENG-002/ES-001-GENERICISATION-NOTES.md) |

APZQEP remains the **proven source**. APZHUB owns the **enterprise** standard. The product standard is not automatically replaced; citation alignment is a separate maintenance action after ES-001 becomes Active.

---

## 21. Quick reference

```text
Always:     unit (if logic changes) + regression + boundary (layered packages)
Often:      integration (persistence/storage) + security (authz/tenant/list/query)
When schema: migration tests
When stated: performance tests
Evidence:   commands + results + TESTING.json when non-trivial
Naming:     *.test.ts · *.enforcement.test.ts · migration*.test.ts · architecture-boundaries.test.ts
Certify:    only when required levels PASS
```

---

## 22. Related documents

- [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)
- [PORTFOLIO-ENGINEERING-CHARTER.md](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md)
- [PROMOTION-PRINCIPLES.md](./APZHUB-ENG-002/PROMOTION-PRINCIPLES.md)
- [ES-001-GENERICISATION-NOTES.md](./APZHUB-ENG-002/ES-001-GENERICISATION-NOTES.md)
- [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md)
- [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md)
- Reference: `docs/products/apzqep/engineering/APZQEP-TESTING-STANDARD.md`

---

## Document history

| Version | Programme phase        | Status               | Notes                                                             |
| ------- | ---------------------- | -------------------- | ----------------------------------------------------------------- |
| 1.0     | APZHUB-ENG-002 Phase 1 | DRAFT — Under Review | First enterprise Testing Standard; abstracted from APZQEP TS v1.0 |

---

_End of APZHUB Enterprise Testing Standard (ES-001)_
