# APZQEP-152 — Enterprise Production RBAC & Security Hardening

| Field           | Value                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Programme       | APZQEP-152                                                                    |
| Title           | Enterprise Production RBAC & Security Hardening                               |
| Release Blocker | RB-002                                                                        |
| Status          | **ENGINEERING COMPLETE** — Board clearance of RB-002 pending                  |
| Classification  | Production Blocker Remediation / Enterprise Production Security Certification |
| Authority       | Owner Authorisation 20260803T063000Z                                          |
| Prerequisite    | APZQEP-151 CERTIFIED (RB-001 CLOSED)                                          |
| Last updated    | 20260803T064500Z                                                              |

## Objective

Certify that APZQEP implements production-grade authentication, authorisation, tenancy isolation and permission enforcement. Clear RB-002. Not feature development.

## Document pack

| Artefact                                               | Purpose                                        |
| ------------------------------------------------------ | ---------------------------------------------- |
| [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)     | Owner gate                                     |
| [SECURITY-DISCOVERY.md](./SECURITY-DISCOVERY.md)       | Mandatory discovery (pre-remediation baseline) |
| [SECURITY-ARCHITECTURE.md](./SECURITY-ARCHITECTURE.md) | Target security architecture                   |
| [RBAC-MODEL.md](./RBAC-MODEL.md)                       | Roles and Cap grants                           |
| [AUTHORIZATION-MATRIX.md](./AUTHORIZATION-MATRIX.md)   | Cap A–F permissions vs roles                   |
| [TENANT-ISOLATION.md](./TENANT-ISOLATION.md)           | Session tenant + RLS                           |
| [PROJECT-ISOLATION.md](./PROJECT-ISOLATION.md)         | Project attribute filter / ACL gap             |
| [HTTP-SECURITY.md](./HTTP-SECURITY.md)                 | `withPlatformApiAuth` / `actorFromContext`     |
| [API-SECURITY.md](./API-SECURITY.md)                   | Cap API security posture                       |
| [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md)       | Session policy                                 |
| [AUDIT-INTEGRITY.md](./AUDIT-INTEGRITY.md)             | Audit coverage                                 |
| [SECURITY-TESTS.md](./SECURITY-TESTS.md)               | Fail-closed test evidence                      |
| [RB-002-REMEDIATION.md](./RB-002-REMEDIATION.md)       | Elevation + HR-001 fix                         |
| [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)         | Remaining limitations                          |
| [PERFORMANCE-REPORT.md](./PERFORMANCE-REPORT.md)       | Permission resolve overhead note               |
| [APZQEP-152-COMPLETION.md](./APZQEP-152-COMPLETION.md) | Completion status (not certified)              |

## Remediation implemented (in progress toward certification)

- Cap A–F HTTP elevation removed from six handlers
- `resolveSessionAuthorization` → `buildServiceRequestContext` permissions
- Cap TX path: `runWithTenantContext` + `applyPostgresTenantSession`
- Cap F facts via repositories only (no `system-reporting` actor)
- Roles: `qep-operator`, `qep-reader`; `tenant-member` has no Cap grants; `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` opt-in

## After APZQEP-152

Re-run APZQEP-150. Do not declare production GO from this programme alone. Packages remain 0.1.0; no deploy authorised.

## Out of scope

New capabilities, UI redesign, integrations, AI, persistence/database/architecture redesign, package promotion, deployment.
