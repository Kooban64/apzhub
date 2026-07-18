# APZHUB Platform Identity Administration Architecture

**Programme:** APZIDENTITY-001 — Identity Administration Foundation  
**Status:** Complete (foundation)  
**Classification:** Metadata System of Record (not authentication)

---

## Purpose

Identity Administration is the enterprise Identity and Access Management **metadata** plane for APZHUB.

It owns identity metadata (users, groups, roles, organisations, tenants, memberships, service assignments, administrative policies).

It does **not** replace Authentication. Credentials, sessions, tokens, MFA, OAuth/OIDC/SAML, SCIM, and LDAP remain outside this programme.

---

## Layering

```text
Identity Administration (SoR metadata)
        ↓
Authentication (existing — credentials / sessions)
        ↓
Platform Authorization (existing)
        ↓
Administration (frozen metadata governance)
        ↓
Platform Services (APZIDENTITY-002 — not started)
```

No shortcuts. Packages in this milestone:

| Package                        | Role                                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| `@apzhub/identity-contracts`   | Models, permissions, read-only service interface                       |
| `@apzhub/identity-core`        | Repository ports, validation, lifecycle, membership/assignment helpers |
| `@apzhub/identity-persistence` | PostgreSQL + in-memory implementations                                 |

---

## Ownership boundary

| Owns                                     | Does not own                                 |
| ---------------------------------------- | -------------------------------------------- |
| User / group / role metadata             | Passwords, hashes, sessions, tokens          |
| Organisation / tenant metadata (IAM SoR) | Authentication `platform_tenant` scaffolding |
| Memberships & service assignments        | Runtime authorization evaluation             |
| Administrative identity policies         | Provisioning / directory sync                |
| Audit & history metadata                 | Event Bus / AI                               |

Service assignments describe which platform capabilities a subject may access (Projects, Support, Testing, Reporting, Documents, Search, Workflow, Notifications, Configuration, Administration) — **metadata only**, no provisioning.

---

## Persistence

- PostgreSQL tables `platform_iam_*` (migrations **0052** / **0053**)
- Distinct from Authentication tables created by `0011_platform_identity.sql`
- In-memory for tests only
- Production factories require explicit Postgres — **no silent memory fallback**

---

## Permissions

`identity.*` catalogue — see [Permission Catalogue](../guides/APZHUB-Identity-Permission-Catalogue.md). Wiring via Gateway / Authorization is **APZIDENTITY-002**.

---

## Explicit exclusions (APZIDENTITY-001)

HTTP · Gateway · Platform Services · Workbench · Authentication · Login · MFA · OAuth · Passwords · Sessions · Tokens · SAML · OIDC · SCIM · LDAP · Provisioning · AD / Azure AD / Google Workspace · Event Bus · AI

---

## Next

**APZIDENTITY-002 — Platform Services, Gateway & Authorization** (await owner approval).
