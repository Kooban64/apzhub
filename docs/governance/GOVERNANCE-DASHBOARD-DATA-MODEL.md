# APZHUB Governance Dashboard Data Model

> **Programme:** APZHUB-GOVERNANCE-001  
> **Classification:** DOCUMENTATION ONLY — logical model; no schemas/APIs/DB tables authorised  
> **Date:** 2026-07-19

---

## Purpose

Logical entities and fields that a future Engineering Governance Dashboard would consume.  
**Implementation-independent** — may be backed by docs parsers, CI APIs, or platform services later.

---

## 1. Entity overview

```text
RepositorySnapshot
  ├─ GateResult[]
  ├─ CertificationRecord[]
  ├─ ProductStatus[]
  ├─ PlatformCapabilityStatus[]
  ├─ IntegrationStatus[]
  ├─ ProgrammeRecord[]
  ├─ ReleaseRecord[]
  ├─ QualitySnapshot
  ├─ EngineeringMeta
  └─ KpiValue[]
```

---

## 2. Core entities

### 2.1 RepositorySnapshot

| Field              | Type     | Notes                                    |
| ------------------ | -------- | ---------------------------------------- |
| `capturedAt`       | datetime | Snapshot time                            |
| `gitSha`           | string   | HEAD                                     |
| `branch`           | string   | usually `main`                           |
| `rootVersion`      | string   | e.g. `0.1.0-foundation`                  |
| `repositoryStatus` | enum     | PORTFOLIO-STATUS-MODEL §1                |
| `health`           | enum     | HEALTHY / DEGRADED / UNHEALTHY / UNKNOWN |
| `qaCertification`  | enum     | PRODUCTION_READY…                        |

### 2.2 GateResult

| Field         | Type     | Notes                                                            |
| ------------- | -------- | ---------------------------------------------------------------- |
| `gate`        | enum     | build / lint / typecheck / test / security / docs / architecture |
| `status`      | enum     | PASS/FAIL/WARN/SKIPPED/UNKNOWN                                   |
| `source`      | string   | ci job id / local                                                |
| `evidenceUri` | string   | optional URL/path                                                |
| `observedAt`  | datetime |                                                                  |

### 2.3 ProductStatus

| Field                      | Type   | Notes                         |
| -------------------------- | ------ | ----------------------------- |
| `productId`                | string | projects / time / support / … |
| `name`                     | string | APZ Projects                  |
| `owner`                    | string | role or named owner           |
| `currentVersion`           | string | SemVer or empty               |
| `currentProductionRelease` | string |                               |
| `maturity`                 | enum   | §4 product status             |
| `implementationReady`      | bool   |                               |
| `releaseLinePatch`         | string | e.g. 1.1.x                    |
| `releaseLineMinor`         | string |                               |
| `releaseLineMajor`         | string |                               |
| `knownLimitationsUri`      | string |                               |
| `latestAcceptanceUri`      | string |                               |
| `latestAcceptanceStatus`   | enum   |                               |
| `health`                   | enum   |                               |

### 2.4 PlatformCapabilityStatus

| Field          | Type   | Notes                           |
| -------------- | ------ | ------------------------------- |
| `capabilityId` | string | runtime / integration-sdk / …   |
| `name`         | string |                                 |
| `version`      | string | package version when applicable |
| `status`       | enum   | OPERATIONAL / FROZEN / MVP / …  |
| `freezeUri`    | string | optional                        |
| `health`       | enum   |                                 |

### 2.5 IntegrationStatus

| Field                  | Type     | Notes                          |
| ---------------------- | -------- | ------------------------------ |
| `integrationId`        | string   | plane / kimai / zammad / …     |
| `provider`             | string   | engine name (internal)         |
| `packageName`          | string   | `@apzhub/integration-*`        |
| `version`              | string   |                                |
| `compatibility`        | string   | supported engine range summary |
| `certification`        | enum     |                                |
| `supportedVersions`    | string[] |                                |
| `health`               | enum     |                                |
| `diagnosticsAvailable` | bool     |                                |
| `readiness`            | enum     | ready / limited / not_ready    |
| `evidenceUri`          | string   |                                |

### 2.6 ProgrammeRecord

| Field           | Type     | Notes                         |
| --------------- | -------- | ----------------------------- |
| `programmeId`   | string   | APZHUB-GOVERNANCE-001         |
| `title`         | string   |                               |
| `class`         | enum     | docs / product / platform / … |
| `status`        | enum     | programme status              |
| `completionUri` | string   |                               |
| `acceptanceUri` | string   |                               |
| `blockedReason` | string   | optional                      |
| `updatedAt`     | datetime |                               |

### 2.7 ReleaseRecord

| Field                   | Type   | Notes                                        |
| ----------------------- | ------ | -------------------------------------------- |
| `productId`             | string |                                              |
| `version`               | string |                                              |
| `releaseStatus`         | enum   |                                              |
| `channel`               | enum   | production / patch / minor / major / pending |
| `acceptanceUri`         | string |                                              |
| `evidenceUri`           | string |                                              |
| `ownerApprovalRequired` | bool   |                                              |

### 2.8 QualitySnapshot

| Field                   | Type    | Notes          |
| ----------------------- | ------- | -------------- |
| `coveragePercent`       | number? | optional       |
| `certificationSummary`  | string  |                |
| `knownLimitationsCount` | number  |                |
| `riskRegisterUri`       | string  |                |
| `techDebtCount`         | number  |                |
| `documentationQuality`  | enum    | PASS/WARN/FAIL |

### 2.9 EngineeringMeta

| Field                        | Type   | Notes |
| ---------------------------- | ------ | ----- |
| `activeAdrCount`             | number |       |
| `freezeCount`                | number |       |
| `referenceImplementationUri` | string |       |
| `standardsCompliance`        | enum   |       |
| `repositoryQualityLabel`     | string |       |

### 2.10 KpiValue

| Field        | Type               | Notes    |
| ------------ | ------------------ | -------- |
| `kpiId`      | string             | KPI-R01… |
| `value`      | number/string/bool |          |
| `unit`       | string             |          |
| `window`     | string             | e.g. 30d |
| `observedAt` | datetime           |          |

---

## 3. Source classes (population — future only)

| Source class               | Examples                                            | Maps to                                     |
| -------------------------- | --------------------------------------------------- | ------------------------------------------- |
| **GitHub**                 | PRs, commits, tags, Actions status API              | GateResult, ReleaseRecord tags              |
| **CI/CD**                  | workflow runs, job conclusions                      | GateResult, KPI-R*                          |
| **Coverage Reports**       | Vitest/Istanbul artefacts                           | QualitySnapshot                             |
| **Release Metadata**       | PORTFOLIO-RELEASE-REGISTER, RELEASES.md, tags       | ProductStatus, ReleaseRecord                |
| **Documentation Metadata** | AI-MANIFEST, CURRENT-*, Acceptance Reports, freezes | ProgrammeRecord, Certification              |
| **Repository Metadata**    | package.json versions, integrations/*/package.json  | IntegrationStatus, PlatformCapabilityStatus |

**No collectors are implemented in this programme.**

---

## 4. Snapshot consistency rules

1. One `RepositorySnapshot` per capture — nested entities share `capturedAt` / `gitSha`.
2. Enums must match [PORTFOLIO-STATUS-MODEL](./PORTFOLIO-STATUS-MODEL.md).
3. Prefer URIs to repo-relative paths for evidence.
4. Never invent Production SemVer not present in Release Register / RELEASES.md.

---

## Related

- [ENGINEERING-GOVERNANCE-DASHBOARD.md](./ENGINEERING-GOVERNANCE-DASHBOARD.md)
- [GOVERNANCE-KPI-CATALOGUE.md](./GOVERNANCE-KPI-CATALOGUE.md)
- [AUTOMATION readiness](./ENGINEERING-GOVERNANCE-DASHBOARD.md#8-automation-readiness-future-population)
