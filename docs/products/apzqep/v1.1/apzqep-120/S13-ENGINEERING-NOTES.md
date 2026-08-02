# APZQEP-120-S13 — Engineering Notes

| Field           | Value                           |
| --------------- | ------------------------------- |
| Slice           | S13                             |
| Title           | Enterprise Command Platform     |
| Package         | `@apzhub/qep-command` **0.1.0** |
| Classification  | Product Engineering             |
| Phase           | Platform Foundation Completion  |
| Timestamp (UTC) | 20260802T162714Z                |

## Architecture decisions

1. **New package** `@apzhub/qep-command` — does not redesign `@apzhub/command-framework` (shell UCP).
2. **UI-independent** — Palette is the first client; AI / Dashboard / QI consume the same platform.
3. **Discovery via QKI only** — never queries business services for discovery.
4. **Registry + handler registry** — no switch statements; deterministic `registerBatch`.
5. **Security fail-closed** — permission_denied / handler.not_registered.
6. **Built-ins are catalogue entries** registered at compose — not engine hard-coding.

## Package layout

```text
packages/qep-command/src/
  domain/        kinds, categories, contracts
  registry/      CommandRegistry
  handlers/      Handler contract + registry
  discovery/     QKI consumer
  security/      PermissionResolver
  ranking/       pinned / favourite / recent
  preferences/   user command prefs
  execution/     engine (HOW)
  catalogue/     builtin definitions + handlers
  metrics/       observability
  diagnostics/   health
  compose.ts     createEnterpriseCommandPlatform
```

## Programme transition

APZQEP-120 Platform Foundation completes with S13.
Recommended next programme: **APZQEP-140 – Core Quality Engineering**.

See [APZQEP-120-PLATFORM-FOUNDATION-COMPLETE.md](./APZQEP-120-PLATFORM-FOUNDATION-COMPLETE.md).

## Out of scope (held)

AI Assistant · NL/LLM/voice · Executive dashboards · QI · Workflow automation · External integrations · Mobile UI · Browser shortcut wiring.
