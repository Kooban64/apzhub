# STREAM 6 — Tenant, Identity, Organisational Roles, RBAC & Administration

## Complete UI/UX + Access-Control Build Specification

| Field            | Value                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document         | **UX-STREAM-006**                                                                                                                                         |
| Status           | **FROZEN · SUPERSEDES prior Stream 6** — 2026-08-16                                                                                                       |
| Kind             | Tenancy · identity · organisational/staff functions · hierarchical RBAC · admin UX                                                                        |
| Reference tenant | **APZOR (Pty) Ltd** — ordinary commercial tenant (same architecture as every customer)                                                                    |
| Complements      | [UX-STREAM-005](./UX-STREAM-005-platform-shell-design-system.md) · Streams 1–4 · [SAAS-COMMERCIAL-MODEL](../strategy/commercial/SAAS-COMMERCIAL-MODEL.md) |

> **APZOR is a customer of the APZ Platform architecture, not a privileged super-tenant.**

Do **not** implement simplistic Admin / Manager / User security.

---

## 1. Objective

Complete identity, tenancy, organisational-role, RBAC, provisioning and administration for APZQEP · APZPEN · APZPRD (and PRD modules). Support organisations where every employee has a different access combination.

---

## 2. Governing Access Model

```text
APZ PLATFORM
  → TENANT
  → TENANT SUBSCRIPTION / ENTITLEMENTS
  → TENANT MEMBERSHIP
  → ORGANISATIONAL / STAFF FUNCTION
  → PRODUCT ASSIGNMENT
  → PRODUCT ROLE
  → RESOURCE SCOPE
  → GRANULAR PERMISSIONS
  → PROFESSIONAL TOOL ENTITLEMENTS
  → CONTEXTUAL SECURITY POLICY
  → EFFECTIVE ACCESS
```

Every UI surface and backend request derives from **Effective Access**.

---

## 3. Five Access Layers (do not collapse)

| Layer                                      | Meaning                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| **1** Platform Roles                       | Authority over the commercial SaaS platform                                   |
| **2** Tenant Administrative Roles          | Administer one organisation                                                   |
| **3** Organisational / Staff Functions     | What someone does in the business (templates/defaults — **not** direct authz) |
| **4** Product Roles + Resource Scope       | What they can do and where                                                    |
| **5** Granular / Professional Entitlements | Source, terminals, scanners, provider consoles, release approvals, etc.       |

---

## 4. Platform vs Tenants

```text
APZ PLATFORM → APZOR | Acme | Customer X
```

Not `APZOR → Acme`. Distinction in DB, APIs, auth, admin UI.

---

## 5–13. Platform Roles

Templates: Platform Owner · Administrator · Operations · Support · Security · Compliance · Finance/Billing · Auditor.

Each: powerful in control plane; **no automatic unrestricted tenant business-data access**. Platform Support uses controlled privileged sessions for sensitive help.

---

## 14–15. Platform Admin UI

`/platform-admin` — Dashboard · Tenants · Products · Subscriptions · Provisioning · Providers · Operations · Security · Compliance · Billing · Audit · Platform Administrators.

**APZOR staff do not see Platform Admin** unless separately granted a Platform role. Employment by APZOR → **zero implied platform privilege**.

---

## 16–24. Tenant Administrative Roles

Organisation Owner · Org Administrator · User Administrator · Security Administrator · Compliance Administrator · Billing Administrator · Product Administrator · Auditor.

**Organisation Owner does not automatically receive access to all business resources.** Admin authority ≠ data access. Product Admins can be delegated per product without Org Admin.

---

## 25–30. Organisational / Staff Function Layer

Staff functions (Executive, Finance, Compliance, Legal, HR, Operations, Project Management, Customer Support, QA, Engineering, Security, Sales, Account Management, Marketing, Product Management, General Staff, …) are **organisational metadata**.

They drive: recommended access templates · default team · suggested products/roles · approval routes · Home composition.

They are **not** permission. Never `if finance: allow finance_data`. Job title stored separately — never used for security decisions.

Departments customisable. Access templates map function → suggested products/roles/tools; admin **always reviews** before provision.

APZOR reference templates listed in Owner paste (§30).

---

## 31–39. User creation UX

Steps: identity/org metadata → select template → product assignment → resource scope → source scope → professional tools → **review** → create & provision.

Partial provisioning failure: keep user; retry failed service. Do not expose provider mechanics unnecessarily.

---

## 40–45. Directory · User Inspector (flagship)

Filters include Department · Staff Function · Product · Role · Team · Status · Access Risk.

Inspector tabs: Overview · Products · Roles & Permissions · Scopes · Professional Tools · Provisioning · Teams · Sessions · Activity · Audit.

Effective Permission Inspector with **explain why** (granted by / denied because).

---

## 46–61. Product roles & scopes

Templates and permission catalogues for Projects · Support (+ queues) · Time (+ teams) · Workflow · Analytics · Knowledge · Documents · QEP (+ apps + separate source) · PEN (+ apps/engagements + professional tools).

Source and PEN tools remain independently controllable (Test Lead ≠ source write; Security Manager ≠ terminal).

---

## 62–73. Org-function examples

Executive · Finance · Compliance · Legal · HR · Operations · Support Agent · Developer · QA · Security Tester · BI Analyst · Workflow Specialist — progressive complexity examples for dogfood.

---

## 74–78. Teams · Inheritance · Custom roles · Overrides

Direct vs inherited sources shown. Multiple teams combine; deny/policy wins. Custom roles from base + allowed additions. Granular override rare — badge **CUSTOM ACCESS**.

---

## 79–86. Temporary access · Access requests · Privileged · Professional tools

Time-boxed grants; request/approve workflows; MFA/reauth for sensitive actions. Product access ≠ provider access (Metabase / n8n / Plane / … separate). Professional Tools admin screen expects **small** user counts.

---

## 87–88. Source Workspace first-class

Permission matrix: Read · Search · Tree · History · Blame · Diff · Edit · Branch · Commit · Push · PR · Review · Merge · Repo Admin — each controllable. Provider-neutral (GitHub/GitLab/Bitbucket/self-hosted).

---

## 89–95. Cross-tenant · Switch · Platform+Tenant · Support sessions

Independent memberships. Switch resets all context (no leakage). Platform role + tenant role + product roles are separate contexts. Controlled tenant support access; avoid impersonation; audit everything.

---

## 96–99. Joiner · Mover · Leaver

Template-driven with review. Mover shows recommended deltas before apply. Leaver: revoke access/sessions/tools/tokens; **never delete historical attribution**.

---

## 100–104. Access reviews · Audit

Periodic reviews; privileged grants reviewed harder. Full audit of who/tenant/target/product/role/permission/scope/old→new/reason/approval.

---

## 105–113. Effective access · Backend · Search/Notify/Activity/Analytics/Docs/Knowledge

Server-side calculation; UI hide ≠ security. Authorisation questions WHO/WHERE/PRODUCT/RESOURCE/ACTION/SCOPE/POLICY. Search/notify/activity filter before return. Analytics and classification-aware docs/knowledge.

---

## 114–117. Derived UX

Navigation · Home · Quick Actions · Administration **derived** from effective access — never static menus with disabled items.

---

## 118–121. Commercial vs user access · Marketplace · Licences

Subscription ≠ everyone gets the product. Marketplace → entitlement → assign → provision → nav. Licence usage UX; exhaustion → Add Licences (no obscure provision fail).

---

## 122–126. APZOR reference tenant · Personas · Negative tests · Empty/deny UX

APZOR first complete reference config — **no APZOR-specific hardcoded behaviour**. Representative personas for UI testing. **Mandatory negative-access tests**. Permission-aware empty states; sensitive deny without metadata leak.

---

## 127–130. UX principles

Operate via Templates · Roles · Teams · Scopes (not checkbox sprawl). Distinguish organisational authority / data access / professional capability. Provider names only under Platform Admin → Providers or Professional Tools. **APZ identity is authoritative** — not provider accounts.

---

## 131–132. Data model separation · Hierarchy

Preserve distinct concepts (User · Tenant · Membership · Department · Staff Function · Team · Subscription · Entitlement · Assignment · Role · Permission · Scope · Professional Tool · Temporary Grant · Request/Approval · Provider Mapping · Session · Audit Event). Do not collapse into `users.role`.

Full hierarchy diagram: Platform Roles → Tenants → Tenant Admin → Organisation (dept/function/title/teams) → Productivity/Quality/Security → Professional Tools.

---

## 133. Final governing build instructions (verbatim)

> **Implement APZ as a true multi-tenant enterprise platform with hierarchical, tenant-scoped authorisation. APZOR (Pty) Ltd must be implemented as an ordinary reference tenant and must use exactly the same tenant architecture as every commercial customer. Employment by APZOR must confer no platform-level privilege. Separate Platform Roles, Tenant Administrative Roles, Organisational/Staff Functions, Product Roles, Resource Scopes, Granular Permissions and Professional Tool Entitlements. Organisational roles such as Executive, Finance, Compliance, Legal, HR, Operations, Support, QA, Engineering and Security are business attributes and access-template inputs, not direct authorisation mechanisms. Tenant subscriptions determine what the organisation may use. User product assignments determine what an individual may access. Product roles determine permitted actions. Resource scopes determine where those actions may occur. Granular permissions and professional-tool entitlements control sensitive capabilities. Contextual security policies may further restrict access. Every protected backend request must calculate and enforce effective access server-side.**

> **Construct each user's APZ experience dynamically from effective access. Do not show the entire platform and disable inaccessible functions. Remove inaccessible products, navigation, actions, search results, notifications, activity and administrative functions completely where appropriate. An APZOR Support Agent should experience Support, Time and Knowledge if that is all they require; a Developer may receive Projects, Time, QEP, PEN and repository-specific Source access; Finance may receive Time, Workflow, Finance Analytics and Finance Documents; Compliance may receive controlled assurance visibility across QEP and PEN without penetration-testing capability; executives may receive broad operational and assurance visibility without professional engineering tools. The same rules must work unchanged for every tenant.**

---

## 134. Definition of Done

Not complete when login and RBAC “work.”

Complete when we can create **APZOR as a normal tenant**, create all representative APZOR staff personas, provision materially different QEP/PEN/PRD combinations, constrain each person to correct projects/queues/apps/repos/data/spaces, grant specialist tools independently, and demonstrate **positive and negative access** across UI, APIs, Search, Notifications, Activity, Quick Actions and administration.

APZOR becomes the **reference tenant proving the commercial multi-tenant model**, not a special internal installation.
