# AF-018 — Completion Report

> **Story:** AF-018 — Invocation Source Gateways  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-019**

---

## Objective

Implement gateway interfaces and executor routing for non-user invocation sources — stubs only, no production AI, automation, or voice functionality.

---

## Acceptance criteria

| Criterion                                        | Status |
| ------------------------------------------------ | ------ |
| AI gateway stub                                  | ✅     |
| Automation gateway stub                          | ✅     |
| Voice gateway stub                               | ✅     |
| Invocation Source abstraction                    | ✅     |
| Executor routing for supported sources           | ✅     |
| Diagnostics                                      | ✅     |
| Dependency injection                             | ✅     |
| Existing execution pipeline unchanged for `user` | ✅     |
| Planned sources documented only                  | ✅     |
| No AI reasoning, voice, workflow, scheduler      | ✅     |
| All quality gates pass                           | ✅     |

---

## Architecture summary

```text
Invocation Source (ai-agent | voice | automation)
        ↓
Gateway stub (identify source, supply context)
        ↓
DefaultActionExecutor (audit + diagnostics)
        ↓
NOT_IMPLEMENTED (AF-018 stubs)
```

User and system actors continue through the existing lookup → permission → dispatch pipeline.

---

## Files added / modified

| Package           | File                                                | Change                          |
| ----------------- | --------------------------------------------------- | ------------------------------- |
| command-framework | `invocation/invocation-source.ts`                   | **New** — source abstraction    |
| command-framework | `gateways/`                                         | **New** — interfaces + stubs    |
| command-framework | `executor/default-action-executor.ts`               | Gateway routing                 |
| command-framework | `executor/action-executor.ts`                       | Gateway diagnostics on executor |
| command-framework | `di/action-framework-context.ts`                    | Gateway registry DI             |
| command-framework | `types/action-execution-diagnostics.ts`             | `gateway` phase + source        |
| docs              | `specs/SPR-004-AF-invocation-sources.md`            | **New** specification           |
| docs              | `gateways/GATEWAY-ARCHITECTURE.md`                  | **New** architecture notes      |
| docs              | `invocation/INVOCATION-SOURCES.md`                  | **New** planned sources         |
| docs              | `governance/APZHUB-Capability-Development-Guide.md` | Gateway section                 |

---

## Test results

| Suite                              | Tests                   |
| ---------------------------------- | ----------------------- |
| `invocation-source.test.ts`        | 4                       |
| `gateways.test.ts`                 | 5                       |
| `default-action-executor.test.ts`  | +2 updated              |
| `action-framework-context.test.ts` | 1                       |
| **Monorepo total**                 | **661** (+11 vs AF-017) |

### Scenarios covered

- Gateway stub NOT_IMPLEMENTED responses
- AI / voice utterance and intent entry points
- Automation system command entry point
- Executor routes `ai-agent` and `voice` through gateways
- Invocation source attribution on diagnostics
- Gateway diagnostics on executor and DI context

---

## Coverage

| Area                        | Status     |
| --------------------------- | ---------- |
| `invocation/`               | ✅ Covered |
| `gateways/`                 | ✅ Covered |
| `executor/` gateway routing | ✅ Covered |
| Monorepo statements         | **91.34%** |

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm build`         | ✅ Pass       |
| `pnpm test`          | ✅ 661 passed |
| `pnpm test:coverage` | ✅ Pass       |

---

## Technical debt

| ID         | Item                                                         | Target                  |
| ---------- | ------------------------------------------------------------ | ----------------------- |
| TD-AF18-01 | Production gateway implementations deferred                  | Future milestones       |
| TD-AF18-02 | Automation gateway not wired to executor delegate            | Future automation story |
| TD-AF18-03 | Planned sources (scheduler, webhook, external API) docs only | Future                  |
| TD-AF18-04 | `apps/web` does not expose gateway diagnostics               | AF-020                  |
| TD-AF18-05 | Service/event handler gateways still NOT_IMPLEMENTED         | Future                  |

---

## Recommendations for AF-019

1. **Scaffold platform command manifests** — add `workbench.commands` and `workbench.toolbar` to theme/platform YAML per ADR-0025.
2. **Wire toolbar extraction** — populate `ActionRegistryDto.toolbar` so AF-017 toolbar surfaces show real buttons in integration tests.
3. **Integration test** — bootstrap extracts ≥ 2 commands after `Runtime.bootstrap()`.
4. **Keep gateway stubs unchanged** — AF-019 is manifest scaffolding, not execution origin work.
5. **Optional shortcut scaffolds** — platform catalogue shortcuts for palette/global listener E2E.

---

## Invocation Sources

See [INVOCATION-SOURCES.md](../../packages/command-framework/src/invocation/INVOCATION-SOURCES.md) — planned Scheduler, External API, Webhook sources (documentation only).

---

AF-018 complete. **Do not begin AF-019** until this report is reviewed and approved.
