# Branching and Versioning Standard

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [branch-protection](../developer/branch-protection.md) · [RELEASE-MANAGEMENT-STANDARD](./RELEASE-MANAGEMENT-STANDARD.md) · Document 004 · Document 015

---

## Purpose

Git branching, merge, PR, tagging, and Semantic Versioning rules for the APZHUB monorepo.

---

## Branch model

| Branch                           | Purpose                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| **`main`**                       | Production-ready line. Protected. No direct commits.                                   |
| **`develop`** (optional)         | Integration line if the team uses a two-track model; otherwise feature → `main` via PR |
| **`feature/<programme>-<slug>`** | Approved programme work                                                                |
| **`release/x.y.z`**              | Release candidate stabilisation                                                        |
| **`hotfix/x.y.z`**               | Production emergency fixes ([HOTFIX-POLICY](./HOTFIX-POLICY.md))                       |

Programme IDs in branch names when work is programme-bound (e.g. `feature/apzhub-projects-001-workbench`).

---

## Merge strategy

- **Pull request required** into `main` (and into `develop` if used).
- Prefer **squash** or **merge commit** consistently per team convention; no force-push to `main`.
- Branch must be up to date with target; CI must be green.
- No `--no-verify` / skipped hooks unless Owner-exception documented.

---

## Pull request policy

Every PR:

1. Links programme ID or hotfix severity.
2. Passes CI (lint, typecheck, format, test, build — see `.github/workflows`).
3. Completes [CODE-REVIEW-STANDARD](./CODE-REVIEW-STANDARD.md) checklist.
4. Updates docs when behaviour or status changes.
5. Does not expand scope beyond Owner Approval.

---

## Tagging policy

- Release tags: `vMAJOR.MINOR.PATCH` (annotated).
- Hotfix tags: bump PATCH (or agreed hotfix channel).
- Do not move/reuse tags.
- Tag only after release certification + Owner release approval when deploying.

---

## Semantic Versioning policy

For publishable packages (`packages/*`, `integrations/*`):

| Bump      | When                                                                      |
| --------- | ------------------------------------------------------------------------- |
| **MAJOR** | Breaking public API / contract (requires ADR + Owner for frozen packages) |
| **MINOR** | Backward-compatible feature                                               |
| **PATCH** | Backward-compatible fix                                                   |

Root workspace version (`0.1.0-foundation` at Foundation) advances only under release management.

Frozen packages (e.g. Integration SDK **1.0.0**): no public API change without ADR + Owner.

---

## Protection (required)

Documented in [branch-protection.md](../developer/branch-protection.md):

- PR required to `main`
- Required status checks: CI quality job
- Branches up to date before merge
