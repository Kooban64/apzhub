# APZHUB Disaster Recovery

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Scope

DR covers loss of Production host/region or catastrophic multi-service failure beyond single-incident restore.

## DR tiers

| Tier | Scenario                         | Target                                              |
| ---- | -------------------------------- | --------------------------------------------------- |
| DR-1 | Single AZ/host failure           | Restore from snapshots + redeploy compose/apps      |
| DR-2 | Regional loss                    | Rebuild in alternate region from backups + IaC/docs |
| DR-3 | Logical destruction (ransomware) | Clean rebuild + verified backups only               |

## Recovery Time / Point (governance targets)

| Metric | Platform Tier A        | Product Tier B |
| ------ | ---------------------- | -------------- |
| RTO    | ≤ 8h (org may tighten) | ≤ 24h          |
| RPO    | ≤ 24h                  | ≤ 24h          |

These are **operational targets**, not contractual SLAs unless Owner publishes commercial SLAs separately.

## DR run outline

1. Declare disaster (Platform Ops Lead + Owner)
2. Preserve forensics if security-related
3. Provision infrastructure
4. Restore platform DB / object storage / secrets
5. Deploy Platform **1.1.0** artefacts
6. Restore / reconnect engines via adapters
7. Validate health hierarchy + critical user journeys
8. Communicate All Clear
9. PIR + Problem records

## Dependencies

Legacy stack coexistence ([ENVIRONMENT.md](../../ENVIRONMENT.md)) must be inventoried in DR plans — engines may share host resources.
