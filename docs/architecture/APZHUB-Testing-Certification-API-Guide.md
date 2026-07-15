# APZHUB Testing Certification API Guide

**Purpose:** Brief guide to certification and release readiness APIs exposed in APZTCMS-012.  
**Audience:** Testing engineers, release managers, platform engineers.  
**Authority:** [Certification Engine Architecture](./APZHUB-APZ-TCMS-Certification-Engine-Architecture.md) · [Release Readiness Guide](./APZHUB-APZ-TCMS-Release-Readiness-Guide.md)  
**Status:** Implemented — APZTCMS-012 complete.  
**Last updated:** 2026-07-12

---

## Certification Routes

Certification routes live under `/api/v1/testing/certifications` and call `gateway.testing.certification.*`.

Representative commands:

- Prepare certification.
- Evaluate gates.
- Get advisory recommendation.
- Submit for review or approval.
- Approve, conditionally approve, reject, expire, archive.
- List audit entries.

All approval actions are human workflow operations. Recommendations stay advisory and cannot auto-approve.

## Release Readiness

`GET /api/v1/testing/releases/{releaseId}/readiness` calculates readiness inputs through `gateway.testing.releaseReadiness.*`.

The response includes `isDecision: false`; callers must display readiness as advisory evidence, not a deployment decision.

## Exclusions

APZTCMS-012 does not add AI approvals, automatic certification decisions, Event Bus events, CI/CD runner execution, or notification delivery.
