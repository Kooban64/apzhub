# Value Objects — Verification Domain

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**  
> **Source:** `packages/qep-verification/src/domain/verification/` · `constants.ts`

## Identity

| VO | Constraint |
| -- | ---------- |
| `VerificationId` | Must match `ver_[A-Za-z0-9_-]+` |

## Status & outcome

| VO | Catalogue |
| -- | --------- |
| `VerificationStatus` | `draft`, `requested`, `assigned`, `in_progress`, `verified`, `rejected`, `expired`, `withdrawn`, `superseded`, `cancelled`, `retired` |
| `VerificationOutcome` | `verified`, `failed`, `partially_verified`, `blocked`, `deferred`, `waived`, `inconclusive` |

Outcome groups:

- **Success:** `verified`, `partially_verified`, `waived`
- **Failure:** `failed`, `blocked`, `inconclusive`
- **Interim:** `blocked`, `deferred`

## Subject

| Kind | Notes |
| ---- | ----- |
| `requirement` | References Requirements 1.0.0 SoR |
| `requirement_content_version` | Content version pin |
| `requirement_baseline` | Baseline pin |
| `trace_link` | References Traceability 1.0.0 |
| `test_specification` · `test_case` · `test_execution` | Future test domains |
| `evidence` · `certification_artefact` | Future domains |
| `document` | Document reference |
| `external_reference` | Requires `externalUri` |

Fields: `kind`, `artefactId`, optional `contentVersionId`, `baselineId`, `externalUri`.

## Authority

Kinds: `user` · `role` · `system` · `delegated` — plus `actorId`.

## Context · scope · priority · origin

| VO | Catalogue / shape |
| -- | ----------------- |
| `VerificationContext` | Optional `baselineId`, `contentVersionId`, `immutable` |
| `VerificationScope` | `product` · `project` · `release` · `baseline` · `tenant_global` (+ optional `referenceId`) |
| `VerificationPriority` | `critical` · `high` · `medium` · `low` |
| `VerificationOrigin` | `user` · `import` · `system_rule` · `ai_suggestion` · `migration` |

Default on create: scope `tenant_global`, priority `medium`, origin `user`.

## Text bounds

| VO | Max length |
| -- | ---------- |
| `VerificationRationale` | 4_000 |
| `VerificationReason` | 2_000 |
| `VerificationComment` | 2_000 |
| `VerificationResultSummary` | 1_000 |

## Metadata

| Constraint | Value |
| ---------- | ----- |
| Max entries | 64 |
| Key max length | 128 |
| Value max length | 2_000 |

## Decision & history

| Structure | Role |
| --------- | ---- |
| `VerificationDecision` | Frozen decision snapshot at completion |
| `VerificationHistory` / entry | Append-only audit trail within the aggregate |
| `VerificationTimestamp` | Validated ISO timestamp |
| `VerificationVersion` | Revision helper |
