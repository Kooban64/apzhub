# APZTCMS-014 Completion Report

**Milestone:** APZTCMS-014 — Release & Quality Governance Domain  
**Status:** COMPLETE  
**Date:** 2026-07-12  
**Next:** APZTCMS-015 — External CI/CD Integration Framework (**complete** as of 2026-07-12; programme stop now **APZTCMS-016**)

> **Owner scope:** TCMS-only release governance. Prior “Platform Quality Integration Layer / Product Registry” brief is **superseded** for this milestone ID.

## Executive Summary

APZ TCMS now includes a formal **Release & Quality Governance** domain: deterministic state machine, human approvals, advisory readiness/risk/certification aggregation (consuming existing TCMS services), Postgres persistence (migrations 0029/0030), and `gateway.testing.releaseGovernance` via RequestPipeline. No HTTP, UI, CI/CD, Event Bus, AI, Product Registry, or cross-product governance.

## Architecture

Workbench/HTTP deferred. Path:

`gateway.testing.releaseGovernance` → RequestPipeline → Authz → Platform impl → Domain → Persistence → PostgreSQL

## Release Domain

Entities: Release, ReleaseCandidate, ReleasePackage, ReleaseScope, ReleaseApproval, ReleaseDecision, ReleaseEvidence, ReleaseManifest, ReleaseWindow, ReleaseDependency, ReleaseSummary, ReleaseNote, ReleaseRiskAssessment, ReleaseReadinessSnapshot, ReleaseAuditEntry.

## State Machine

`draft → planning → ready_for_review → ready_for_approval → approved|conditionally_approved|rejected` (+ withdrawn / superseded / archived / restore). Illegal transitions rejected.

## Permissions

`release.*`, `release.approvals.*`, `release.readiness.*`, `release.audit.*`, `release.risk.*`.

## Persistence

`@apzhub/testing-persistence` **0.8.0**; SQL **0029** / **0030** (RLS). Production uses Postgres only; in-memory for tests.

## Gateway Integration

`TestingPlatformGateway.releaseGovernance` on platform packages **0.10.0**.

## Testing

| Suite | Result |
| ----- | ------ |
| Domain release-governance | green (coverage **99.38%** lines) |
| Persistence release-governance | green |
| Platform release-governance | green |
| Combined focused | **24+** tests |

## Coverage

Domain folder: **99.38%** statements/lines, **100%** functions, **91.56%** branches.

## Quality Gates

| Gate | Result |
| ---- | ------ |
| typecheck (contracts/persistence/services) | PASS |
| tests (014 suites) | PASS |
| coverage | PASS ≥95% |
| architecture / boundary | PASS (no HTTP/UI) |
| authorization mappings | PASS |

## Technical Debt

- Prior `platform-quality` / Product Registry code remains but is **out of APZTCMS-014 scope** (cleanup later)
- Pre-existing Plane/Zammad typecheck noise unchanged
- HTTP/OpenAPI/Workbench for release governance deferred

## Recommendation

**APZTCMS-015 — External CI/CD Integration Framework** only. No implementation.

## Package versions

- contracts **0.8.0** · persistence **0.8.0** · services **0.7.0** · platform **0.10.0**

## Stop Condition

APZTCMS-014 complete. **Do not begin APZTCMS-015** until explicit owner approval.
