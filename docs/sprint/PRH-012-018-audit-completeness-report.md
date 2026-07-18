# PRH-016 — Audit Completeness Gap Report

> **Programme:** PRH-012–018  
> **Story:** PRH-016  
> **Date:** 2026-07-18

---

## Scope

Verify that critical production paths emit structured audit signals suitable for operations and compliance review. This is a **completeness review**, not a new audit subsystem.

---

## Critical paths reviewed

| Path                         | Mechanism                                    | Status            | Notes                                                   |
| ---------------------------- | -------------------------------------------- | ----------------- | ------------------------------------------------------- |
| Authentication / session     | BetterAuth + platform session policy         | **Present**       | Session hardening delivered in PRH-006                  |
| Authorisation decisions      | `AuthorizationAuditSink` via RequestPipeline | **Present**       | `authorization.evaluated` allow/deny with correlationId |
| Tenant context               | Platform API guard + tenant validation       | **Present**       | PRH-007 / PRH-009                                       |
| Administration SoR mutations | Administration audit facets                  | **Present**       | Frozen APZADMIN wave                                    |
| Identity Administration      | Identity audit facets                        | **Present**       | Frozen APZIDENTITY wave                                 |
| Configuration publish        | Configuration audit                          | **Present**       | Frozen APZCONFIG wave                                   |
| Notification lifecycle       | Notification audit                           | **Present**       | Frozen APZNOTIFY wave                                   |
| Platform Event Bus ingress   | In-memory Event Bus audit sink               | **Present (MVP)** | OSS-100-12; not durable SIEM export                     |
| Outbox drain                 | Worker structured logs                       | **Present (MVP)** | PCv2-02; not full audit table                           |
| Law / Trust mutations        | Law outbox + domain audit patterns           | **Present**       | Product vertical                                        |

---

## Gaps (accepted / deferred)

| Gap                                    | Severity | Deferred to             |
| -------------------------------------- | -------- | ----------------------- |
| Central SIEM export stream             | Medium   | PCv2-05                 |
| Durable Event Bus audit store          | Low–Med  | Future ops programme    |
| Uniform audit query UI across all SoRs | Low      | Operations UX iteration |
| Vault secret access audit              | Medium   | PCv2-04                 |

---

## Operations Console

Platform Operations Control Plane surfaces production verification and capability health. Authorisation audit events are available to sinks configured at gateway bootstrap (`InMemoryAuthorizationAuditSink` in tests; production sink wiring must remain least-privilege).

---

## Contract tests

Unit tests assert the `AuthorizationAuditEvent` contract and that the pipeline records allow/deny decisions:

- `packages/platform-services/src/authorization/authorization-audit.contract.test.ts`

---

## Verdict

**READY WITH OBSERVATIONS** — critical auth/authz/tenant/admin paths emit audit signals; SIEM export and durable bus audit remain deferred by roadmap.

---

## Related

- `packages/platform-services/src/authorization/authorization-audit.ts`
- [Security Operations Guide](../governance/APZHUB-Security-Operations-Guide.md)
