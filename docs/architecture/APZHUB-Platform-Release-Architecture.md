# APZHUB Platform Release Architecture

**Milestone:** APZTCMS-014  

## Canonical objects

| Object | Purpose |
| ------ | ------- |
| Release | Platform release aggregate |
| Release Package | Versioned product bundle within a release |
| Release Scope | Product ID set included in the release |
| Release Candidate | Named RC label |
| Release Window | Optional time window metadata |
| Release Approval | Human approval (technical/qa/business/security/executive) |
| Release Decision | Human decision only (`isAutomatic: false`) |
| Release Summary | Advisory rollup (`isDecision: false`) |
| Release Manifest | Product keys + packages + dependencies snapshot |
| Release Note / Evidence / Dependency | Supporting metadata refs |

## Lifecycle

`draft → scoping → candidate → in_review → approved → released` (also `rejected` / `withdrawn` / `archived`).

Transition to `released` requires a prior **human** decision. No automatic deployment.

## Gateway

`gateway.platformRelease.releases` — `PlatformReleaseGovernanceService` through RequestPipeline.
