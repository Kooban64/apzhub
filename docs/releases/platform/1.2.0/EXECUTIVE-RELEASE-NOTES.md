# APZHUB Platform 1.2.0 — Executive Release Notes

> **Programme:** APZHUB-1.2-009  
> **Date:** 2026-07-20  
> **Certification class:** **PRODUCTION_READY_WITH_LIMITATIONS**  
> **Predecessor:** Platform **1.1.0** Production Baseline

---

## Summary

APZHUB Platform **1.2.0** packages the Owner-authorised Release **1.2** P0 engineering programmes into the next portfolio Production Baseline. It closes Production ops maturity gaps (backup restore verification, alert runbook depth, host coexistence controls), adds Time and Law Search publication adapters, and delivers a GitLab CI metadata Reference Adapter — without redesigning frozen platforms or expanding into STOP items.

## What is new in 1.2.0

| Area             | Change                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Ops — restore    | Backup restore drill + recovery evidence ([APZHUB-1.2-002](../../1.2/APZHUB-1.2-002/README.md) / R12-OPS-01)                                |
| Ops — alerts     | Alert strategy catalogue + Observe runbook depth ([APZHUB-1.2-003](../../1.2/APZHUB-1.2-003/IMPLEMENTATION-SUMMARY.md) / R12-OPS-02)        |
| Ops — host       | Host coexistence capacity controls ([APZHUB-1.2-004](../../1.2/APZHUB-1.2-004/IMPLEMENTATION-SUMMARY.md) / R12-OPS-03)                      |
| Search — Time    | `@apzhub/search-time` **0.1.0** publication adapter ([APZHUB-1.2-005](../../1.2/APZHUB-1.2-005/IMPLEMENTATION-SUMMARY.md))                  |
| Search — Law     | `@apzhub/search-law` **0.1.0** publication adapter ([APZHUB-1.2-006](../../1.2/APZHUB-1.2-006/IMPLEMENTATION-SUMMARY.md))                   |
| TCMS — GitLab CI | `@apzhub/integration-gitlab-ci` **0.1.0** metadata Reference Adapter ([APZHUB-1.2-007](../../1.2/APZHUB-1.2-007/IMPLEMENTATION-SUMMARY.md)) |

## Compatibility

- Public HTTP APIs and Identity contracts from Release **1.1** remain compatible.
- Commercial product SemVer baselines unchanged (Projects **1.1.0**; others **1.0.0**).
- Additive packages / platform composition surfaces only (`search-time`, `search-law`, `integration-gitlab-ci`, GitLab providers).

## Limitations (must travel with release)

Search live drain / composition hooks residual · Observe live alert delivery residual · GitLab mutations unsupported · Themes D–E (persist / Support CE) deferred · Workflow execute gated · Email SoR / FIN-001 STOP. Full register: [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).

## Marketing constraint

Describe **1.2.0** as a platform enhancement release under **PRODUCTION_READY_WITH_LIMITATIONS**. Do **not** claim full multi-CI admin, live Search indexing GA, automated Observe alerting GA, Support 2.0, Workflow Execute, Email SoR, or FIN-001.

## Recommendation

# PRODUCTION_READY_WITH_LIMITATIONS
