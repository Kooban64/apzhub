# APZHUB-ENG-0021 — Implementation Summary

> **Programme:** APZHUB-ENG-0021  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Group:** RG-TESTING-ARCH

## Preconditions verified

| Check                        | Result                        |
| ---------------------------- | ----------------------------- |
| APZHUB-ENG-0020              | **ACCEPTED** (Owner Decision) |
| ENGINEERING-PLAN Step 6      | RG-TESTING-ARCH (final)       |
| Group repository-approved    | Yes                           |
| Status before implementation | **OPEN**                      |
| Dependencies                 | None                          |

## STEP 2 — Group contract

| Field                      | Value                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Identifier                 | RG-TESTING-ARCH                                                                           |
| Title                      | Testing services CI SDK boundary compliance                                               |
| Root cause                 | RCA-10 — boundary test flagged forbidden CI SDK/HTTP imports in Testing services layer    |
| Included failures          | QA2-V-082 (**1** Vitest)                                                                  |
| Affected packages          | `@apzhub/platform-services` (Testing architecture boundary test)                          |
| Affected products          | Platform Testing / APZ TCMS                                                               |
| Affected platform services | Testing (CI/CD pipeline integration boundary)                                             |
| Dependencies               | None                                                                                      |
| Acceptance criteria        | CI/CD boundary Vitest PASS; no live provider SDK/HTTP in production Testing service layer |
| Architecture impact        | None — test hygiene only; Integration SDK adapters remain the approved CE path            |
| SemVer impact              | None                                                                                      |
| Est. reduction             | **1** Vitest                                                                              |

## Root cause (confirmed)

Bare regex token `gitlab` matched the approved Integration SDK import `@apzhub/integration-gitlab-ci` inside `testing-pipelines-gitlab.test.ts`. Production `services/testing` and `testing-services/pipelines` had no live provider SDK or raw HTTP imports.

## Fix

1. Forbid live provider SDKs / raw HTTP clients only (`@octokit/`, `@actions/`, `@gitbeaker/`, bare `gitlab`/`jenkins` package imports, axios, undici, `node:http`, …).
2. Do **not** forbid `@apzhub/integration-*` packages.
3. Exclude `*.test.ts` / `*.spec.ts` from the production-layer CI SDK scan (tests may inject Integration SDK adapters via DI).

## Result

RG-TESTING-ARCH **implemented**. All repository-approved remediation groups complete. Recommendation: **READY FOR OWNER ACCEPTANCE**.
