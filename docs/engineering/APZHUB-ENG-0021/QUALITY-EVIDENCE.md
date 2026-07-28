# APZHUB-ENG-0021 — Quality Evidence

> **Programme:** APZHUB-ENG-0021  
> **Date:** 2026-07-21  
> **Scope:** RG-TESTING-ARCH only

---

## Commands executed

| Gate                     | Command                                                                            | Result                         |
| ------------------------ | ---------------------------------------------------------------------------------- | ------------------------------ |
| Unit / Architecture      | `pnpm exec vitest run` platform-services + web testing-architecture-boundary tests | **13/13 PASS** (was 1 failing) |
| Lint (affected)          | `pnpm exec eslint` on boundary test                                                | **PASS**                       |
| TypeScript               | Covered by Vitest transform of affected test                                       | **PASS**                       |
| Integration / Regression | N/A — Vitest architecture gate only                                                | **N/A**                        |
| Playwright               | N/A — no PW members in RG-TESTING-ARCH                                             | **N/A**                        |
| Architecture             | CI SDK boundary assertion corrected; Integration SDK still approved                | **PASS**                       |
| Compatibility            | Platform 1.2.0 packaging / SemVer unchanged                                        | **PASS**                       |

### Scoped Vitest command

```bash
pnpm exec vitest run \
  packages/platform-services/src/services/testing/testing-architecture-boundary.test.ts \
  apps/web/components/testing/testing-architecture-boundary.test.ts
```

---

## Results

| ID        | Case                                                                 | Before                                                                   | After    |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| QA2-V-082 | keeps CI/CD pipeline integration free of live provider SDKs and HTTP | **FAIL** (`@apzhub/integration-gitlab-ci` false positive in `*.test.ts`) | **PASS** |

**Previously failing:** 1  
**Newly passing:** 1  
**Remaining hard failures (group):** **0**  
**Remaining flaky (group):** **0**  
**Playwright:** N/A for this group

Evidence: [20260721T170044Z-APZHUB-ENG-0021-RG-TESTING-ARCH.json](../../operations/evidence/portfolio-recert/20260721T170044Z-APZHUB-ENG-0021-RG-TESTING-ARCH.json)
