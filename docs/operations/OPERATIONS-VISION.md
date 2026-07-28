# APZHUB Operations Vision

> **Programme:** APZHUB-OPERATIONS-001  
> **Production Baseline:** Platform **1.1.0**  
> **Date:** 2026-07-20

---

## Vision

APZHUB is operated as a **single enterprise operating platform**: one identity, one gateway path, one permission model, and one operational control plane — masking backend engines from routine users while preserving Zero Trust and documented limitations.

## Principles

| Principle                 | Meaning                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Platform-owned operations | Ops owns health, incidents, change, recovery — products do not invent parallel ops stacks                 |
| Honesty                   | Operate within [Platform 1.1.0 Known Limitations](../releases/platform/1.1.0/KNOWN-LIMITATIONS.md) — PRWL |
| Zero Trust                | Verify identity, permission, integrity, intent, context on every operational action                       |
| Fail closed               | Prefer safe degradation over silent failure; fail-soft event/automation paths already documented          |
| Host coexistence          | Respect legacy `apz-stack` / ENVIRONMENT.md — no disruptive host changes without Owner Approval           |
| Self-hosted first         | Prefer OSS operational tooling behind platform connectors; no mandatory commercial SaaS ops               |

## Outcomes

1. Predictable Production support for Platform **1.1.0** and commercial products.
2. Clear roles, escalation, and runbooks.
3. Measurable service levels aligned to certified capability (not aspirational execute/Email SoR).
4. Continuous improvement via Operations Roadmap without unauthorised engineering.

## Related

[OPERATING-MODEL.md](./OPERATING-MODEL.md) · [SERVICE-CATALOGUE.md](./SERVICE-CATALOGUE.md) · Document **013** / **014**
