# OSS-100-10 Integration SDK v1.0 Certification — Audit Working Notes

**Date:** 2026-07-12  
**Package:** `@apzhub/integration-sdk` **0.9.0** (RC — **not** bumped to 1.0.0)  
**Scope:** Governance / certification audit only  
**Auditor:** Cursor agent (OSS-100-10)

> Working notes for parent polish into final certification docs. Do **not** treat as the formal completion report.

---

## 1. Quality gates

| Check                                                            | Result       | Numbers                                                                                            |
| ---------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `pnpm --filter @apzhub/integration-sdk typecheck`                | **PASS**     | exit 0                                                                                             |
| `pnpm --filter @apzhub/integration-sdk lint`                     | **PASS**     | exit 0                                                                                             |
| `vitest run packages/integration-sdk`                            | **PASS**     | **13** files, **185** tests                                                                        |
| `vitest run integrations/plane integrations/zammad`              | **PASS**     | **25** files, **223** tests                                                                        |
| Wave1 + Wave2 + support-vertical + platform-service-contracts    | **PASS**     | **9** files, **105** tests                                                                         |
| `packages/platform-services` (excl. Postgres integration)        | **PASS**     | **10** files, **129** tests                                                                        |
| `packages/platform-services` Postgres entity-mapping integration | **ENV FAIL** | Needs `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — **not an SDK defect** |
| events + harness unit tests                                      | **PASS**     | **4** files, **61** tests                                                                          |
| `testing/sdk-v1` re-certification                                | **PASS**     | **1** file, **7** tests                                                                            |

**Coverage note:** Attempted scoped coverage for `src/events` + `src/harness` hit monorepo global thresholds (80%+) and produced a non-useful 0% scoped include report. Treat coverage as **not blocking** for this governance pass; suite pass rates above are authoritative.

**Combined quality summary (SDK-relevant):** typecheck ✅ lint ✅ **185** SDK + **223** adapter + **61** events/harness + **7** sdk-v1 = all green.

---

## 2. Architecture / dependency boundary

### SDK package isolation

- Grep of `packages/integration-sdk/src` (non-test): **no** imports of `@apzhub/integration-plane`, `@apzhub/integration-zammad`, `@apzhub/platform-services`, or live `EntityMappingStore` usage.
- Mentions of `EntityMappingStore` are **documentation / harness rules / certification subject flags only** (forbidden-import detectors).

### Boundary tests

| Suite            | Path                                                    | Result                                                                                                                                                               |
| ---------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Events boundary  | `packages/integration-sdk/src/events/boundary.test.ts`  | **3/3 PASS** — no plane/zammad/platform-services/EntityMappingStore; no webhook ingress / Event Bus / scheduler; no secret field keys in diagnostics/metrics sources |
| Harness boundary | `packages/integration-sdk/src/harness/boundary.test.ts` | **1/1 PASS**                                                                                                                                                         |

### Accidental Event Bus / ingress / provisioning in SDK

| Concern                      | Finding                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Event Bus publish            | **Absent** — boundary forbids `publishToEventBus` / `eventBus.publish` / kafka/amqp/nats |
| Webhook HTTP ingress         | **Absent** — contracts + pipelines only; no route handlers / `createServer`              |
| Provisioning runtime         | **Absent** — only error **category** string `"provisioning"` in error taxonomy           |
| Durable checkpoint/dedup SoR | **Absent** — `InMemory*` stores only (test utilities)                                    |

### `package.json` exports map (16 subpaths)

```
. | ./client | ./adapter | ./diagnostics | ./lifecycle | ./errors
./auth | ./connection | ./health | ./version | ./resilience
./observability | ./transport | ./mapping | ./events | ./harness
```

All point at `./src/**/index.ts` (source exports; private workspace package).

---

## 3. Public API audit

### Inventory method

Parsed `export { … }` / `export type { … }` / `export const|function|class|type|interface` from root + each subpath index (observability via `export *` follow-through).

### Counts (approximate; root re-exports overlap subpaths)

| Surface                                 | Symbol count (approx.) |
| --------------------------------------- | ---------------------- |
| Root `@apzhub/integration-sdk`          | **581**                |
| `./client`                              | 11                     |
| `./adapter`                             | 35                     |
| `./diagnostics`                         | 21                     |
| `./lifecycle`                           | 25                     |
| `./errors`                              | 42                     |
| `./auth`                                | 34                     |
| `./connection`                          | 26                     |
| `./health`                              | 10                     |
| `./version`                             | 7                      |
| `./resilience`                          | 14                     |
| `./observability` (resolved `export *`) | **32**                 |
| `./transport`                           | 90                     |
| `./mapping`                             | 88                     |
| `./events`                              | 87                     |
| `./harness`                             | 94                     |

### Classification summary (heuristic, root + all subpaths summed — includes double-count of root re-exports)

| Class                                    | Count (summed) | Guidance                                     |
| ---------------------------------------- | -------------- | -------------------------------------------- |
| **stable**                               | ~1079          | Keep; freeze for 1.0                         |
| **stable-test** (`Mock*`, `createMock*`) | ~31            | Document as **test utilities**               |
| **test-only** (`InMemory*`, `Noop*`)     | ~30            | Document **not production SoR**              |
| **experimental** (`Placeholder*`)        | ~21            | Document experimental / pre-1.0 placeholders |
| **internal-flag**                        | **4**          | See below                                    |
| **deprecated**                           | **0**          | —                                            |

### Flags / recommendations (do **not** break APIs)

| Symbol                                                                                                                                                                                                          | Location                                  | Recommendation                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PlaneIdentityMapper`                                                                                                                                                                                           | `mapping` + root                          | Vendor convenience alias in SDK — **document as stable helper** or consider relocating to Plane adapter before strict 1.0 freeze (hide-before-v1.0 **optional**) |
| `ZammadIdentityMapper`                                                                                                                                                                                          | `mapping` + root                          | Same as above for Zammad                                                                                                                                         |
| `Placeholder*` family                                                                                                                                                                                           | adapter/client/diagnostics/auth/transport | Classify **experimental**; retain for backward compat                                                                                                            |
| `InMemoryEventDeduplicationStore`, `InMemoryReplayStore`, `InMemoryPollingCheckpointStore`, `InMemorySecretProvider`, `InMemoryConnectionRegistry`, `InMemoryMappingRegistry`, `InMemoryCapabilityRegistration` | various                                   | **Test-only / non-durable** — document as harness/fixtures, not platform SoR                                                                                     |
| Large root barrel (581)                                                                                                                                                                                         | `src/index.ts`                            | Before 1.0: publish a **stable API matrix**; prefer subpath imports for new consumers                                                                            |

**No accidental deep-internal exports found that must be hidden as a certification blocker.** Surface is large but intentional for adapter authors.

---

## 4. Security audit

| Control                         | Status      | Evidence                                                                                                   |
| ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `SecretProvider` abstraction    | **Present** | `packages/integration-sdk/src/auth/secret-provider.ts`                                                     |
| Webhook secrets use refs        | **PASS**    | `secretRef` / `credentialRef` in webhook verification & management; no raw secret in diagnostics snapshots |
| Credential masking              | **PASS**    | `maskSecretValue`, `maskCredentialRef`, `sanitizeDiagnosticRecord`, `containsLikelySecret`                 |
| Logger redaction                | **PASS**    | Default patterns: bearer / api_key / password → `[REDACTED]`                                               |
| Event safe log fields           | **PASS**    | `buildSafeEventLogFields` — correlation/ids only; never rawBody/secrets                                    |
| Diagnostics/metrics secret keys | **PASS**    | Boundary test forbids `"secret"                                                                            | "password" | "token" | "authorization" | "signature" | "rawBody" | "webhookSecret"` in diagnostics/metrics sources |
| Transport TLS defaults          | **PASS**    | `validateCertificates: true` default (`common-policies.ts` / `DEFAULT_TLS`)                                |
| Fixtures printing secrets       | **PASS**    | No `console.log` in events/harness production sources; mock HMAC helpers require explicit secret for tests |
| Secrets in repo fixtures        | **OK**      | Test credential refs like `secret://x` / in-memory maps — not live production secrets                      |

### Residual / non-blocking notes

- Logger redacts **value patterns**, not all secret-named **keys**; diagnostics path uses `sanitizeDiagnosticRecord` for key stripping — adapters should prefer diagnostics sanitizers for operator-facing output.
- `PlaceholderVaultSecretProvider` is experimental — not a real Vault client (documented limitation).

**Security blockers for v1.0 readiness:** **none**.

---

## 5. Compatibility

| Item                         | Value                                                                 |
| ---------------------------- | --------------------------------------------------------------------- |
| SDK version (`package.json`) | **0.9.0**                                                             |
| `INTEGRATION_SDK_VERSION`    | **0.9.0** — **matches**                                               |
| Plane adapter                | **0.6.0** — depends on `workspace:*` SDK                              |
| Zammad adapter               | **0.6.0** — depends on `workspace:*` SDK                              |
| Promote to **1.0.0**         | **Requires owner approval** — semver 1.0 commits to stable public API |

---

## 6. Documentation audit

### `packages/integration-sdk/docs/*.md` (32 files)

- ADAPTER-FRAMEWORK.md
- ADAPTER-HARNESS.md
- AUTHENTICATION.md
- CERTIFICATION-FRAMEWORK.md
- CI-INTEGRATION.md
- COMPLIANCE-FRAMEWORK.md
- CONNECTION-MANAGEMENT.md
- CONTRACT-TESTS.md
- ERROR-TRANSLATION-OBSERVABILITY.md
- EVENT-DEDUPLICATION.md
- EVENT-ENVELOPE.md
- HEALTH-DIAGNOSTICS-LIFECYCLE.md
- HTTP-TRANSPORT.md
- MAPPING-FRAMEWORK.md
- MAPPING-MIGRATION.md
- MAPPING-PROFILES.md
- MAPPING-REGISTRY.md
- MAPPING-TRANSFORMERS.md
- MOCK-HARNESS.md
- POLLING-CHECKPOINTS.md
- POLLING-CONTRACTS.md
- POLLING-CURSORS.md
- QUALITY-REPORTS.md
- SCAFFOLD-GENERATOR.md
- TRANSPORT-DIAGNOSTICS.md
- TRANSPORT-MIGRATION.md
- TRANSPORT-PIPELINE.md
- TRANSPORT-POLICIES.md
- WEBHOOK-CONTRACTS.md
- WEBHOOK-PIPELINE.md
- WEBHOOK-POLLING-MIGRATION.md
- WEBHOOK-VERIFICATION.md

### README

- Version header: **0.9.0** — correct
- Link spot-check: **47/47 OK**, **0 broken**
- Roadmap correctly lists OSS-100-09 complete (RC) and OSS-100-10+ provisioning/docs/v1.0 gate awaiting owner

### Historical milestone headers

Per-milestone docs still say e.g. `v0.6.0` / `v0.7.0` / `v0.8.0` on OSS-100-06/07/08 pages. Interpreted as **as-shipped-at-milestone**, not current package version. **Not a certification blocker**; optional polish: add “shipped in package 0.9.0 cumulative” note.

**Docs fixed in this audit:** **none** (no clear obsolete contradiction blocking certification).

---

## 7. Reference adapter re-certification

### New suite

- `testing/sdk-v1/integration-sdk-v1-recertification.test.ts`
- Vitest include added: `testing/sdk-v1/**/*.test.{ts,tsx}` in `vitest.config.ts`

### Outcomes

| Check                                           | Result                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Plane harness boot/cleanup                      | **PASS**                                                                      |
| `certifyPlaneWithSdkHarness`                    | **PASS** — overall ≠ fail; **15** capabilities; Architecture fails = **0**    |
| Zammad harness boot/cleanup                     | **PASS**                                                                      |
| `certifyZammadWithSdkHarness`                   | **PASS** — overall ≠ fail; **11** capabilities; Architecture fails = **0**    |
| `AdapterBoundaryValidator` clean sample         | **PASS** — violations = **0**                                                 |
| `AdapterBoundaryValidator` forbidden sample     | **PASS** — detects platform-services / EntityMappingStore / cross-vendor leak |
| `AdapterCompliance` on scaffold                 | **PASS**                                                                      |
| `AdapterCertification` on Plane/Zammad metadata | **PASS**                                                                      |
| Version alignment                               | **PASS** — SDK 0.9.0; adapters 0.6.0                                          |

Existing suites also green: `plane-harness.test.ts`, `zammad-harness.test.ts`, SDK `harness.test.ts`, boundary tests.

**Support vertical:** certified separately (out of this SDK gate; wave/support-vertical suites pass).

---

## 8. Explicit limitations (accepted for PRODUCTION READY WITH LIMITATIONS)

These are **documented absences**, not defects:

1. No platform **Event Bus** publish from Integration SDK
2. No webhook **HTTP ingress** / route handlers
3. No **provisioning** / upgrade orchestration (deferred OSS-100-10+)
4. No durable **checkpoint / dedup / replay** stores (in-memory test utilities only)
5. No production Vault — `PlaceholderVaultSecretProvider` only
6. Package remains **0.9.0** until owner approves **1.0.0** API freeze

---

## 9. Blockers list

| ID  | Severity  | Item                                                                                          | Disposition      |
| --- | --------- | --------------------------------------------------------------------------------------------- | ---------------- |
| B0  | —         | Hard blockers for readiness                                                                   | **None**         |
| N1  | Info      | Postgres mapping integration test needs env                                                   | Out of SDK scope |
| N2  | Info      | Scoped coverage tooling inconclusive under monorepo thresholds                                | Non-blocking     |
| R1  | Recommend | Document `PlaneIdentityMapper` / `ZammadIdentityMapper` as vendor helpers or relocate pre-1.0 | Non-blocking     |
| R2  | Recommend | Publish stable API matrix before `1.0.0` bump                                                 | Owner gate       |
| R3  | Recommend | Clarify historical `v0.x.0` headers in per-milestone docs                                     | Optional polish  |

---

## 10. Recommended maturity

### **PRODUCTION READY WITH LIMITATIONS**

- Quality, architecture boundaries, security controls, and Plane/Zammad harness re-certification all pass.
- Known absences (Event Bus, ingress, provisioning, durable stores) are explicit and acceptable.
- **Remain at package version 0.9.0** — do **not** publish `1.0.0` without owner approval (semver stable-API commitment).
- Label alternative if owner prefers a stricter gate on the “production ready” wording itself: **remain RC** until formal 1.0.0 promotion — but technical readiness for limited production use is met.

---

## 11. Artefacts touched this audit

| Path                                                          | Change                              |
| ------------------------------------------------------------- | ----------------------------------- |
| `testing/sdk-v1/integration-sdk-v1-recertification.test.ts`   | **Added** — permanent re-cert suite |
| `vitest.config.ts`                                            | **Include** `testing/sdk-v1/**`     |
| `docs/architecture/sdk-v1-audit-notes.md`                     | **Added** — this file               |
| Foundation CURRENT-MILESTONE / AI-CONTEXT / completion report | **Not written** (parent owns)       |
| `package.json` version                                        | **Unchanged** (0.9.0)               |

---

## 12. Quick command replay

```bash
pnpm --filter @apzhub/integration-sdk typecheck
pnpm --filter @apzhub/integration-sdk lint
pnpm exec vitest run packages/integration-sdk --reporter=dot
pnpm exec vitest run integrations/plane integrations/zammad --reporter=dot
pnpm exec vitest run testing/wave1 testing/wave2 testing/support-vertical packages/platform-service-contracts --reporter=dot
pnpm exec vitest run testing/sdk-v1 --reporter=verbose
```
