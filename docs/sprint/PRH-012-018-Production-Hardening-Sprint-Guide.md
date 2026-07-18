# PRH-012–018 — Production Hardening & Operational Readiness — Sprint Guide

> **Status:** APPROVED (Owner Programme Approval)  
> **Stories:** PRH-012 … PRH-018 (slice of PCv2-01)  
> **Authority:** Portfolio Review · [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md) · [PRH-000 Baseline](../reviews/PRH-000-Implementation-Baseline.md)

---

## Objective

Complete production deployment documentation, upgrade/rollback, operations checklist, commercial readiness **design**, audit completeness review, local production smoke E2E, and closeout — **without** M17 CI, Vault, provisioning, BullMQ, or new OSS adapters.

---

## In scope

| Story   | Deliverable                                           |
| ------- | ----------------------------------------------------- |
| PRH-012 | Production Deployment Guide                           |
| PRH-013 | Upgrade & Rollback Guide                              |
| PRH-014 | Production Operations Checklist                       |
| PRH-015 | Tenant Onboarding Design + monitoring hooks catalogue |
| PRH-016 | Audit completeness gap report + contract tests        |
| PRH-017 | `testing/e2e/production-smoke/` (local; CI → M17)     |
| PRH-018 | Completion + Acceptance + CURRENT-* updates           |

---

## Out of scope

OSS-100-12+ · M17 CI/CD pipeline · Vault · Kimai · Paperless · Metabase · GitLab CI · BullMQ · AI Assist · Integration SDK contract changes · frozen architecture rewrites

---

## Certification

- `pnpm audit:prh-012-018`
- Unit tests for hooks + authz audit contract
- `pnpm test:production-smoke` (local operational validation)

---

## Stop

Await Owner Acceptance after Programme Acceptance Report. Do not recommend the next programme automatically.
