# APZ TCMS — Integration Requirements

> **Programme:** APZTCMS-REQ-001 · IDs: IR-*  
> **Rule:** Platform Service → Connector → Engine only. Brand masking mandatory.

## Platform integrations (mandatory consume)

| ID     | Capability        | Requirement                                                       | Priority | Risk     | Acceptance criteria                |
| ------ | ----------------- | ----------------------------------------------------------------- | -------- | -------- | ---------------------------------- |
| IR-001 | Platform Identity | BetterAuth session; no product login engine for standard users    | P0       | Critical | Silent SSO/session via Platform    |
| IR-002 | Authorisation     | PermissionService catalogue for TCMS operations                   | P0       | Critical | Server-authoritative checks        |
| IR-003 | Notifications     | Domain events → Platform Notification / Attention path            | P0       | High     | No product SMTP                    |
| IR-004 | Workflow          | Optional approval workflows via Platform Workflow (execute gated) | P2       | Medium   | Only when Platform unlocks execute |
| IR-005 | Analytics         | Optional quality metrics publication to Analytics                 | P2       | Low      | No Metabase chrome in TCMS         |
| IR-006 | Documents         | Evidence/document refs via Platform Documents                     | P1       | Medium   | Native Documents patterns          |
| IR-007 | Search            | Search providers for TCMS entities                                | P0       | High     | Permission-filtered                |
| IR-008 | Observability     | Health/metrics/logs/traces via Platform Observability             | P0       | High     | Correlation IDs                    |
| IR-009 | Provisioning      | Product enablement via Platform Provisioning/Governance           | P0       | High     | No hardcode shell registration     |
| IR-010 | Audit             | Platform Audit for privileged TCMS actions                        | P0       | Critical | Audit immutable                    |

## External / ALM / CI integrations

| ID     | System               | Requirement                                                                                     | Priority | Risk   | Acceptance criteria                                                     |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------- | -------- | ------ | ----------------------------------------------------------------------- |
| IR-011 | Plane (APZ Projects) | Traceability adjacency to Projects via Platform ProjectService — never Plane client from module | P0       | High   | Defects/requirements link through Platform Services                     |
| IR-012 | GitHub Actions       | Read-only CI metadata adapter (reference path)                                                  | P0       | Medium | Metadata ingest; no full GitHub admin UX; dispatch/rerun optional later |
| IR-013 | GitLab CI            | Read-only CI metadata adapter                                                                   | P1       | Medium | Same constraints as GHA                                                 |
| IR-014 | Jira                 | Optional defect/issue sync via connector                                                        | P2       | Medium | Brand masked; Owner-approved adapter                                    |
| IR-015 | Azure DevOps         | Optional pipelines/work items via connector                                                     | P2       | Medium | Brand masked; Owner-approved adapter                                    |
| IR-016 | REST APIs            | Public/partner APIs versioned through Gateway                                                   | P1       | Medium | OpenAPI + authz + rate limit                                            |
| IR-017 | Webhooks             | Inbound/outbound webhooks for run/cert events (Platform patterns)                               | P1       | Medium | Signed webhooks; authz                                                  |
| IR-018 | Kiwi TCMS            | **Out of scope** as SoR/adapter                                                                 | P3       | Low    | Explicitly excluded                                                     |

## Notes

- Historical 1.0.0: GHA PRWL read-only; GitLab metadata later; Kiwi absent — this baseline keeps that direction.
- Plane means **APZ Projects** user-facing; internal engine Plane stays connector-internal.
