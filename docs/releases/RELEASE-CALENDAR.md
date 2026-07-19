# Release Calendar (Workflow)

> **Classification:** Documentation only  
> **Related:** [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [DEFINITION-OF-READY](../operations/DEFINITION-OF-READY.md) · [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md) · [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md)  
> **Rule:** No calendar dates. This document defines operational workflow only.

---

## Purpose

Standard sequence for Product Releases and Platform Releases from planning through maintenance.

---

## Workflow stages

```text
Planning
  → Development
  → Testing
  → Certification
  → Owner Acceptance
  → Production Release
  → Maintenance
       ↘ Hotfixes (interrupt path)
```

---

### 1. Planning

- Owner approves Product Release or Platform Release scope (or ADR for platform evolution).
- [DEFINITION-OF-READY](../operations/DEFINITION-OF-READY.md) satisfied.
- Limitations, migrations, rollback notes drafted.
- Freeze impact assessed.

### 2. Development

- Branch per [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md).
- Implement within approved scope only.
- Module → Platform Service → Connector → Engine path preserved.
- PR + [CODE-REVIEW-STANDARD](../operations/CODE-REVIEW-STANDARD.md).

### 3. Testing

- Unit / component / integration / API tests for scope.
- Playwright (or agreed UI suite) when user-facing.
- CI green on the release candidate.

### 4. Certification

- Repository quality gates (typecheck, lint, tests, build).
- Product or platform certification per applicable standards.
- Documentation and known limitations updated.
- Release evidence pack prepared.

### 5. Owner Acceptance

- Completion Report + Acceptance Report (or release evidence equivalent).
- Owner records **ACCEPTED**.
- Status docs updated (CURRENT-*, portfolio maturity if product).

### 6. Production Release

- Annotated version tag per [RELEASE-NAMING-STANDARD](./RELEASE-NAMING-STANDARD.md).
- Deploy from approved tag.
- Post-deploy health / readiness verification.
- Release notes filed under `docs/releases/` (or product `RELEASES.md`).

### 7. Maintenance

- Patches and limitation follow-ups under Owner-gated maintenance releases.
- No silent scope expansion.
- Portfolio / roadmap updated when maturity or version changes.

### Hotfixes (interrupt path)

- Severity triage per [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md).
- `hotfix/*` branch → accelerated review → regression tests → Owner/emergency approval → PATCH tag → deploy.
- Rollback if criteria met.
- Post-fix: root cause → preventative actions → docs update.

---

## Roles (summary)

| Role                      | Responsibility                        |
| ------------------------- | ------------------------------------- |
| Product / Technical Owner | Scope & priorities                    |
| Technical Lead            | Quality & merge readiness             |
| Architect                 | Freeze / ADR compliance               |
| **Owner**                 | Acceptance & production authorisation |

---

## What this is not

- Not a dated schedule
- Not authorisation for any specific release
- Not a new governance framework — operational process under the Engineering Operating Model
