# @apzhub/integration-sdk v1.0.0 Release Notes

**Date:** 2026-07-18  
**Milestone:** OSS-100-11 — Integration SDK v1.0.0 Wave Certification & Architecture Freeze  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Architecture:** Frozen

---

## Summary

Promotes `@apzhub/integration-sdk` from **0.9.0** to **1.0.0**. This is a **semver stability commitment**, not a feature release. Public API remains backward compatible with 0.9.0. Architecture is frozen per [Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md).

---

## Semantic version justification

| Criterion           | Evidence                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| Prior certification | OSS-100-10 `PRODUCTION_READY_WITH_LIMITATIONS`; hard blockers none         |
| Owner approval      | OSS-100-11 authorises 1.0.0 promotion + freeze                             |
| Breaking changes    | **None** relative to 0.9.0                                                 |
| API freeze          | Public export subpaths and contracts declared frozen                       |
| Semver meaning      | 1.0.0 = first stable public API; subsequent breaking changes require MAJOR |

---

## What changed

- `package.json` version → **1.0.0**
- `INTEGRATION_SDK_VERSION` → **1.0.0**
- Governance pack: Freeze Notice, Reference Standard, guides, ADR-0065, `pnpm certify:integration-sdk`

## What did not change

- No new providers
- No Event Bus / webhook ingress / provisioning
- No Search / Metrics / Platform Service / HTTP / Workbench changes
- No intentional public API removals or renames

---

## Upgrade guidance

Consumers on `workspace:*` pick up 1.0.0 automatically in the monorepo. Prefer subpath imports. Re-run adapter harness certification after upgrade in release lanes.

---

## Limitations (unchanged)

No Event Bus publish · no webhook HTTP ingress · no provisioning · no durable checkpoint stores · PlaceholderVault only.

---

## Certification

```bash
pnpm certify:integration-sdk
```
