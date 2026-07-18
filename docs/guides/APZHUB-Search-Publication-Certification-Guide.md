# APZHUB Search Publication Certification Guide

> **Milestone:** APZSEARCH-018  
> **Audience:** Platform owners, release managers, AI agents  
> **Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-18

---

## Purpose

Certify the complete Search Publication ecosystem (framework, publishers, orchestrator, journal, retry, DLQ, admin APIs, typed client, Workbench) for operational readiness. This guide describes the certification command and evidence pack. It introduces **no** new runtime behaviour.

---

## Scope

| Layer                  | Packages / surfaces                                                              |
| ---------------------- | -------------------------------------------------------------------------------- |
| Publication Framework  | `@apzhub/search-integration` **0.2.0**                                           |
| Product Publishers     | projects / support / documents / testing / reporting                             |
| Orchestrator           | `@apzhub/search-orchestrator` **0.1.0**                                          |
| Administration         | `@apzhub/search-publication-admin` **0.1.0**                                     |
| Frozen Search Platform | contracts **0.4.0**, persistence **0.2.0**, SDK **0.1.0**, Meilisearch **0.1.0** |

Out of scope: Search Platform query changes, Meilisearch adapter changes, Event Bus, semantic/vector/AI.

---

## Certification command

```bash
pnpm certify:search-publication
```

Composes:

1. Architecture / dependency / boundary / authorization / documentation audit (`audit:search-publication-reliability`)
2. Publication ecosystem audits (009–017)
3. Vitest publication regression suite
4. Scoped coverage (publication packages)
5. Playwright Publication Ops listing (LIMITED when live server blocked)
6. Documentation pack presence

Expected terminal result: `RESULT: PASS (with documented LIMITED gates where noted)`.

---

## Related audits

| Command                                                    | Milestone |
| ---------------------------------------------------------- | --------- |
| `pnpm audit:search-publication-reliability`                | 018       |
| `pnpm audit:search-publication`                            | 015       |
| `pnpm audit:search-orchestrator`                           | 016       |
| `pnpm audit:search-publication-admin`                      | 017       |
| `pnpm audit:search-integration` … `audit:search-reporting` | 009–014   |

---

## Evidence pack

- [Architecture Review](../reviews/APZSEARCH-018-architecture-review.md)
- [Security Confirmation](../reviews/APZSEARCH-018-security-confirmation.md)
- [Quality Evidence](../reviews/APZSEARCH-018-quality-evidence.md)
- [Publication Certification](../reviews/APZSEARCH-018-publication-certification.md)
- [Completion Report](../sprint/APZSEARCH-018-completion-report.md)
- [Operational Readiness Guide](./APZHUB-Search-Publication-Operational-Readiness-Guide.md)
- [Reliability Guide](./APZHUB-Search-Publication-Reliability-Guide.md)

---

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — feature-complete publication + ops; durable admin markers/audit overlay and scale-oriented journal aggregates remain limitations. Frozen Search Platform unchanged.

---

## Successor

**APZSEARCH-019 — Search Publication Wave Certification & Architecture Freeze** — roadmap only; do not implement without owner approval.
