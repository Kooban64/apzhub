# Engineering Operating Model

> **Programme:** APZHUB-OPERATIONS-001  
> **Classification:** Documentation only  
> **Related:** [README](./README.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) · [000 Constitution](../000-apzhub-engineering-constitution.md) · [Product Reference Implementation](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)

---

## 1. Purpose

The permanent operating handbook for APZHUB engineering after Platform Foundation closeout and first Product Engineering acceptance. All future work — product, platform, hotfix, documentation — follows this model.

---

## 2. Engineering governance

| Principle               | Rule                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Repository-first        | Disk + KF status docs override conversation history                                         |
| Programme-based work    | Named programmes with Owner Approval before implementation                                  |
| Lifecycle mandatory     | Bootstrap → Recommendation → Approval → Implement → Test → Certify → Acceptance → Bootstrap |
| Architecture freeze     | Frozen subsystems require ADR + Owner                                                       |
| Quality non-negotiable  | Failing typecheck/lint/tests/CI never merge to `main`                                       |
| Product over platform   | Prefer product capability; extend platform only when blocked                                |
| Documentation ownership | Every change updates the docs that make the change discoverable                             |

**Programme tracking states** (from [AI-WORKFLOW](../foundation/AI-WORKFLOW.md)):

| State                             | Meaning                      |
| --------------------------------- | ---------------------------- |
| Recommended, Awaiting Approval    | Report only — not authorised |
| Approved, Awaiting Implementation | Owner Approval given         |
| Implemented, Awaiting Acceptance  | Acceptance Report filed      |
| Completed & Accepted              | **ACCEPTED / CLOSED**        |

---

## 3. Repository ownership

| Concern                                 | Owner                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| Monorepo structure & tooling            | Platform / Technical Lead                                                         |
| CI quality gates                        | Technical Lead                                                                    |
| Secrets & environment coexistence       | Platform ops (see `ENVIRONMENT.md`)                                               |
| KF status docs (CURRENT-*, AI-MANIFEST) | Updating programme + Owner Acceptance                                             |
| Root version / tags                     | Release process ([RELEASE-MANAGEMENT-STANDARD](./RELEASE-MANAGEMENT-STANDARD.md)) |

---

## 4. Product ownership

| Concern                 | Owner                                                     |
| ----------------------- | --------------------------------------------------------- |
| Product Definition Pack | Product Owner + Architect                                 |
| Product maturity labels | Portfolio + readiness docs after Owner Acceptance         |
| User-facing naming      | Document 002 — never expose engine brands                 |
| Product backlog themes  | Product Owner (no invented IDs without Approval)          |
| Product programmes      | Named IDs (e.g. APZHUB-PROJECTS-001) under Owner Approval |

Authoritative portfolio: [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md).

---

## 5. Platform ownership

| Concern                           | Owner                                                     |
| --------------------------------- | --------------------------------------------------------- |
| Platform Services contracts       | Platform Architect                                        |
| Integration SDK & adapters        | Integration / Platform Lead                               |
| Frozen architectures              | ADR + Owner only                                          |
| Shared packages under `/packages` | Technical ownership per package README                    |
| Platform-only programmes          | Exceptional — product need, ops necessity, or ADR + Owner |

Platform Foundation is **CLOSED** ([APZHUB-FOUNDATION-001](../foundation/APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md)).

---

## 6. Technical ownership

| Layer                             | Responsibility                                     |
| --------------------------------- | -------------------------------------------------- |
| Presentation (`apps/web` modules) | Product engineers — Platform HTTP only             |
| Platform Services                 | Platform engineers — business rules, orchestration |
| Adapters (`integrations/`)        | Integration engineers — no business rules          |
| Shared UI (`packages/ui`)         | Design System ownership                            |
| Infrastructure                    | Ops / Technical Lead                               |

Layer rule (003/008/009): **Module → Platform Service → Connector → Engine**. No bypass.

---

## 7. Architecture governance

1. Read frozen architecture notices before change.
2. If change touches a freeze → **STOP** → ADR → Owner Approval.
3. Prefer composition and replaceable adapters.
4. Never expose backend engine names or credentials in UI.
5. Validate against Document 003 and Product Architecture Standard.

---

## 8. ADR lifecycle

```text
Problem identified
  → Draft ADR under docs/adr/
  → Architecture review
  → Owner Approval (required for freezes / breaking / cross-cutting)
  → Implement only under approved programme
  → Update freeze notices / CURRENT-STATE as required
  → Supersede ADR when replaced (never silent rewrite)
```

ADRs do not authorise implementation by themselves — a named programme + Owner Approval still required for code.

---

## 9. Engineering decision process

| Decision type                            | Path                                                              |
| ---------------------------------------- | ----------------------------------------------------------------- |
| In-scope story within approved programme | Technical Lead / PR review                                        |
| Scope expansion                          | Owner Approval (amend or new programme)                           |
| Architecture / freeze break              | ADR + Owner                                                       |
| New product programme                    | Portfolio + Definition Pack + IR + Owner Approval                 |
| Hotfix                                   | [HOTFIX-POLICY](./HOTFIX-POLICY.md)                               |
| Incident                                 | [INCIDENT-MANAGEMENT-STANDARD](./INCIDENT-MANAGEMENT-STANDARD.md) |

---

## 10. Approval hierarchy

| Level                   | Authority                                                                       |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Owner**               | Programme Approval / Acceptance; freeze exceptions; production release approval |
| **Architect**           | Architecture compliance; ADR quality; layering                                  |
| **Technical Lead**      | PR merge readiness; quality gates; branching                                    |
| **Product Owner**       | Product scope, backlog priority, acceptance criteria                            |
| **Engineer / AI agent** | Delivery within authorised scope only                                           |

---

## 11. Documentation ownership

| Doc family                           | Maintainer trigger                         |
| ------------------------------------ | ------------------------------------------ |
| `docs/foundation/*` status           | Every programme close / acceptance         |
| `docs/products/*`                    | Product programmes                         |
| `docs/operations/*`                  | This operating model (Owner-gated changes) |
| `docs/adr/*`                         | Architecture decisions                     |
| `docs/sprint/*` + completion-reports | Active programmes                          |
| Package READMEs                      | Package owners on behaviour change         |

---

## 12. Repository maintenance

- Keep CI green on `main` (QA-002 PRODUCTION READY baseline).
- No secrets in git.
- Coexist with legacy host ports (`ENVIRONMENT.md`).
- Prefer small PRs with full quality gates.
- After Owner Acceptance: update KF status docs before any next recommendation.
- Do **not** invent repository-wide governance programmes beyond this model.

---

## See also

- [DEFINITION-OF-READY](./DEFINITION-OF-READY.md) · [DEFINITION-OF-DONE](./DEFINITION-OF-DONE.md)
- [AI-ENGINEERING-OPERATIONS](./AI-ENGINEERING-OPERATIONS.md)
- [015 Quality Framework](../015-software-quality-testing-qa-cicd-release-management-framework.md)
