# APZHUB Engineering Standard

| Field     | Value                       |
| --------- | --------------------------- |
| Document  | APZHUB Engineering Standard |
| Programme | **APZHUB-FOUNDATION-002**   |
| Status    | **IN FORCE**                |
| Date      | 2026-08-01                  |

---

## Purpose

Single engineering entry standard for every APZHUB repository and product.

This document **indexes** authoritative sources. Detailed rules remain in those sources.

---

## Authority map (one topic → one source)

| Topic                      | Authoritative source                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constitution               | [../000-apzhub-engineering-constitution.md](../000-apzhub-engineering-constitution.md)                                                                  |
| Architecture principles    | [../003-overall-system-architecture-design-principles.md](../003-overall-system-architecture-design-principles.md)                                      |
| Technology / repo layout   | [../004-technology-stack-repository-standards-development-environment.md](../004-technology-stack-repository-standards-development-environment.md)      |
| Quality / CI / release     | [../015-software-quality-testing-qa-cicd-release-management-framework.md](../015-software-quality-testing-qa-cicd-release-management-framework.md)      |
| Security / Zero Trust      | [../013-security-architecture-zero-trust-framework.md](../013-security-architecture-zero-trust-framework.md)                                            |
| Platform delivery          | [../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md](../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)                        |
| **Engineering slices**     | [../engineering/ENGINEERING-SLICE-STANDARD.md](../engineering/ENGINEERING-SLICE-STANDARD.md) **IN FORCE** (APZHUB-ENG-001) — day-to-day slice execution |
| Lifecycle                  | [APZHUB-LIFECYCLE-STANDARD.md](./APZHUB-LIFECYCLE-STANDARD.md) + suite                                                                                  |
| AI operations              | [APZHUB-AI-OPERATIONAL-FRAMEWORK.md](./APZHUB-AI-OPERATIONAL-FRAMEWORK.md)                                                                              |
| Engineering handbook       | [APZHUB-Engineering-Handbook.md](./APZHUB-Engineering-Handbook.md)                                                                                      |
| AI coding standards        | [../foundation/AI-ENGINEERING-STANDARDS.md](../foundation/AI-ENGINEERING-STANDARDS.md)                                                                  |
| Package / SemVer / tags    | Lifecycle [REPOSITORY-STANDARDS.md](../engineering/lifecycle-standard/v1.0/REPOSITORY-STANDARDS.md)                                                     |
| Build contract / waves     | [../engineering/oes/ENGINEERING-BUILD-CONTRACT.md](../engineering/oes/ENGINEERING-BUILD-CONTRACT.md)                                                    |
| Enterprise operating model | [ENTERPRISE-OPERATING-MODEL.md](./ENTERPRISE-OPERATING-MODEL.md)                                                                                        |

---

## Repository layout (summary)

Mandatory monorepo roots per Document 004: `/apps` · `/packages` · `/services` · `/modules` · `/integrations` · `/docs` · `/testing` · `/infrastructure` (and related). See handbook for detail.

## Package naming

Workspace packages use `@apzhub/*`. User-facing product names never expose engine brands (Plane, Kimai, Zammad, etc.).

## Branch · version · release

- Default integration branch: `main`
- SemVer for packages; capability-scoped release tags (e.g. `apzqep-evidence-v1.0.0`)
- No force-push of shared history; no moving production tags without Owner approval
- Release identity and credentials follow the active Release programme (HTTPS authorised identity for `kooban-apzor/apz-portal`)

## Testing · certification · evidence

Full test pyramid + Playwright where applicable. Certification programmes produce immutable evidence. Definition of certification classes remains in the Lifecycle suite and CERT packs.

## Security

Zero Trust; least privilege; secrets never in code/logs/prompts; TLS mandatory; security pipeline Auth → Authz → Validation → Rules → Audit → Execution.

## AI workflow

One role at a time. Repository evidence supersedes chat. See AI Operational Framework.

## Operational governance

Programme gates, Owner acceptance, freeze immutability, Go/No-Go, Operational Hold — see Lifecycle Standard.

---

## Quality gates (every PR)

Lint · types · build · unit/component/integration tests · security checks · docs/architecture compliance as applicable. Failing build never reaches `main`.

---

## Definition of Done

A change is done only when:

1. Scope matches Owner-authorised programme
2. Required tests pass
3. Types/lint/build pass
4. Docs/evidence updated where required
5. No unauthorised architecture bypass
6. Reviewed / accepted per programme class
7. Merged under quality gates

## Definition of Production Ready

A capability/product is production-ready only when:

1. Architecture + Engineering Specification baselined (as required)
2. Engineering waves complete
3. Certification **PASS** (with registered limitations if PRWL)
4. Freeze Owner-accepted
5. Release completed (or explicitly deferred by Owner)
6. Availability class declared (`LIMITED_AVAILABILITY` / GA / etc.)
7. Evidence archived; standing records current

---

## STOP

```text
APZHUB-ENGINEERING-STANDARD
IN FORCE
INDEX ONLY — DO NOT DUPLICATE DETAIL
PREFER LINKS TO AUTHORITATIVE SOURCES
```
