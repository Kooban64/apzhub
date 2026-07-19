# Release Management Standard

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [BRANCHING-AND-VERSIONING](./BRANCHING-AND-VERSIONING.md) · [015 Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md) · [Platform Release Governance](../architecture/APZHUB-Platform-Release-Governance.md)

---

## Purpose

How APZHUB plans, certifies, approves, deploys, documents, and rolls back releases — for product slices and platform packages — without bypassing quality or Owner gates.

---

## Release planning

1. Release scope is bound to **Owner-accepted** programmes (or explicit Owner-approved hotfix).
2. List deliverables, limitations, migrations, and rollback notes before tagging.
3. Confirm frozen architectures untouched (or ADR + Owner recorded).
4. Confirm host coexistence (`ENVIRONMENT.md`) for deployable changes.

---

## Release candidates

| Artefact           | Rule                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **RC branch**      | Optional `release/x.y.z` from `main` (or agreed base) — see branching standard |
| **RC build**       | CI green: lint, typecheck, tests, build                                        |
| **RC evidence**    | Programme Completion + Acceptance (or hotfix evidence pack)                    |
| **RC limitations** | Product/platform KNOWN-LIMITATIONS updated                                     |

No RC is production until Owner release approval.

---

## Release approval

| Approver       | When                             |
| -------------- | -------------------------------- |
| Technical Lead | Quality gates & merge readiness  |
| Architect      | Architecture / freeze compliance |
| **Owner**      | Production release authorisation |

---

## Release certification

Minimum before production:

- Repository typecheck PASS
- Repository lint PASS
- Repository tests PASS (or agreed scoped suite + rationale)
- Product/platform tests PASS for release scope
- UI / API certification PASS when the surface is user-facing
- Documentation PASS
- Security / audit checks PASS when defined for the programme

Aligns with [DEFINITION-OF-DONE](./DEFINITION-OF-DONE.md) and Document 015.

---

## Production deployment

1. Deploy only from tagged, approved revision.
2. Apply migrations via approved scripts; never ad-hoc production schema edits.
3. Verify health / readiness endpoints post-deploy.
4. Confirm no engine branding leakage for product releases.
5. Record release notes under `docs/releases/` (or product `RELEASES.md`).

---

## Rollback process

| Trigger                               | Action                                                     |
| ------------------------------------- | ---------------------------------------------------------- |
| Health/readiness failing after deploy | Roll back to previous tag                                  |
| Critical regression (P1/P2)           | Hotfix or rollback per [HOTFIX-POLICY](./HOTFIX-POLICY.md) |
| Data migration failure                | Stop; restore per migration runbook; Owner notified        |

Rollback criteria must be written in the release evidence pack **before** production cutover when migrations are involved.

---

## Release documentation

Every release records:

- Version / tag
- Included programmes
- Package versions touched
- Limitations
- Rollback notes
- Evidence links (CI, cert reports, acceptance)

---

## Version tagging

- Annotated git tags for releases (`vX.Y.Z` or agreed channel tags).
- Package versions follow [BRANCHING-AND-VERSIONING](./BRANCHING-AND-VERSIONING.md) SemVer.
- Root `package.json` version updated only under release process.

---

## Release evidence

Retain links to:

- Completion / Acceptance reports
- CI run
- Certification / audit command output
- ADR IDs if architecture changed
- KNOWN-LIMITATIONS diff

**Owner Acceptance of a programme ≠ automatic production deploy** — release approval is explicit when deploying.
