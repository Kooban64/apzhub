# n8n Integration — Certification Report

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Title:** n8n Integration Foundation  
> **Package:** `@apzhub/integration-n8n` **0.1.0**  
> **SDK:** `@apzhub/integration-sdk` **1.0.0** (unchanged / frozen)  
> **Status:** **Awaiting Acceptance** — **CERTIFIED_FOUNDATION**  
> **Recommendation:** **CERTIFIED_FOUNDATION**

---

## Verdict

**CERTIFIED_FOUNDATION** — suitable for consumption by future Workflow Platform Services (Owner-gated programmes).

| Dimension                                             | Result                           |
| ----------------------------------------------------- | -------------------------------- |
| Integration SDK **1.0.0** compatibility               | **PASS**                         |
| Manifest-first (`integration.yaml`)                   | **PASS**                         |
| Adapter / Client / Factory / Bootstrap                | **PASS**                         |
| Auth (API key / PAT / basic) via SecretProvider       | **PASS**                         |
| Health · diagnostics · version · capability detection | **PASS**                         |
| Error translation · metrics · logging                 | **PASS**                         |
| Capability registration · provider factory            | **PASS**                         |
| Mock provider + tests                                 | **PASS** (**22**)                |
| Canonical metadata ↔ Workflow Information Model       | **PASS** (mapping documented)    |
| Workflow Contracts / Services / HTTP / Workbench      | **ABSENT** (correct)             |
| Execute / schedule / HITL / mutations                 | **ABSENT** (foundation non-goal) |
| Engine branding hidden from standard users            | **PASS** (adapter-internal)      |

## Quality evidence

| Gate                                              | Result        |
| ------------------------------------------------- | ------------- |
| `pnpm --filter @apzhub/integration-n8n typecheck` | PASS          |
| `pnpm --filter @apzhub/integration-n8n lint`      | PASS          |
| `pnpm --filter @apzhub/integration-n8n test`      | PASS (**22**) |
| Integration SDK source changes                    | **None**      |
| Workflow contracts / services / HTTP / Workbench  | **None**      |

## Certification class

| Class                      | Status                                                          |
| -------------------------- | --------------------------------------------------------------- |
| CERTIFIED_FOUNDATION       | **Recommended**                                                 |
| CERTIFIED_DOMAIN           | Not applicable — execute/domain expansion not in this programme |
| CERTIFIED_WITH_LIMITATIONS | N/A (foundation scope; limitations documented)                  |

## STOP

Do not implement Workflow Contracts, Services, HTTP APIs, Workbench, or commercial APZ Workflow without explicit Owner Approval.
