# APZHUB Platform Delivery Standard

> **Programme:** APZHUB-ENGINEERING-001  
> **Status:** Normative — **ACCEPTED / CLOSED** (APZHUB-ENGINEERING-001)  
> **Classification:** DOCUMENTATION ONLY  
> **Supersedes:** Ad-hoc programme instruction recreation  
> **Date:** 2026-07-19

---

## 1. Authority

This standard is mandatory for every future:

- Platform capability programme (e.g. Analytics, Workflow, future shared capabilities)
- Commercial APZ product programme (planning → certification → SemVer release)
- Platform Services, HTTP API, and Workbench programmes that extend a capability

On conflict:

1. Document **000** (Constitution)
2. Accepted ADRs + Architecture Freeze notices
3. **This Platform Delivery Standard**
4. Programme-specific Owner Approval
5. Conversation history — never authoritative

---

## 2. Normative lifecycle

```text
Commercial Planning
      ↓
Platform Foundation
      ↓
Information Model
      ↓
Provider Integration
      ↓
Contracts
      ↓
Platform Services
      ↓
HTTP API
      ↓
Workbench Module
      ↓
Product Certification
      ↓
Production Release
```

Rules:

1. **Do not skip stages** unless Owner Approval explicitly scopes a programme as docs-only or certification-only.
2. **Do not combine** Module + Platform Service + Connector responsibilities in one programme.
3. **Do not implement** without Owner Approval of the named programme ID.
4. **Do not recommend** the next programme until Owner Acceptance of the current one.
5. **Bootstrap from repository** (AI-MANIFEST) — never conversation history.

Detailed phase mechanics: [ENGINEERING-LIFECYCLE.md](./ENGINEERING-LIFECYCLE.md) · [STAGE-GATES.md](./STAGE-GATES.md).

---

## 3. Layered architecture (always)

```text
Presentation (Workbench / HTTP handlers)
      ↓
Platform Services (business logic only)
      ↓
Service Connector / Integration Adapter
      ↓
Backend Engine
```

Forbidden:

- Module → Connector direct calls
- Service → Engine skipping connector
- UI → integration packages or platform-services imports
- Provider DTOs / engine branding in user-facing surfaces

Technology and quality baselines remain [004](../../004-technology-stack-repository-standards-development-environment.md) and [015](../../015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 4. Programme taxonomy

| Kind                            | Naming pattern                                     | Example                       |
| ------------------------------- | -------------------------------------------------- | ----------------------------- |
| Commercial planning             | `APZ-{PRODUCT}-NNN`                                | APZ-WORKFLOW-001              |
| Platform capability             | `APZHUB-PLATFORM-{CAPABILITY}-NNN`                 | APZHUB-PLATFORM-ANALYTICS-003 |
| Provider integration            | `APZHUB-INTEGRATION-{PROVIDER}-NNN`                | APZHUB-INTEGRATION-N8N-001    |
| Product certification / release | `APZ-{PRODUCT}-NNN`                                | APZ-ANALYTICS-002             |
| Engineering / ops standards     | `APZHUB-ENGINEERING-NNN` · `APZHUB-OPERATIONS-NNN` | APZHUB-ENGINEERING-001        |

Full governance: [PROGRAMME-GOVERNANCE.md](./PROGRAMME-GOVERNANCE.md).

---

## 5. Evidence hierarchy (bootstrap)

1. Repository implementation (`packages/`, `integrations/`, `apps/`, `services/`)
2. `package.json` versions
3. Completion / acceptance reports
4. CURRENT-STATE · CURRENT-MILESTONE
5. Catalogues · ADRs
6. Conversation history — advisory only

---

## 6. Package & quality standards

See [PACKAGE-STANDARDS.md](./PACKAGE-STANDARDS.md) and [QUALITY-GATES.md](./QUALITY-GATES.md).

Every production programme that ships code must satisfy the quality gates listed there before Completion Report filing.

---

## 7. Templates

Reusable templates live in [templates/](./templates/). Owner Approvals should instruct agents to bootstrap from AI-MANIFEST and conform to this standard rather than pasting full lifecycle instructions each time.

---

## 8. Reference implementations

| Capability         | Reference stack on disk                                  |
| ------------------ | -------------------------------------------------------- |
| Analytics Platform | ANALYTICS-001…006 + METABASE-001 + APZ-ANALYTICS-001/002 |
| Workflow Platform  | WORKFLOW-001…006 + N8N-001 + APZ-WORKFLOW-001/002        |

See [EXAMPLES.md](./EXAMPLES.md).

---

## 9. Explicit non-goals of this standard

- Authorising Documents / TCMS / Law / new capabilities
- Changing Architecture Freeze or Integration SDK freeze
- Replacing Constitution, ADRs, or QA-002 certification
- Shipping production code

---

## STOP

Await Owner Acceptance. Future delivery programmes must cite this standard.
