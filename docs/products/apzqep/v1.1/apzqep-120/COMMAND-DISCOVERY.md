# Command Discovery — APZQEP-120-S13

| Field   | Value                           |
| ------- | ------------------------------- |
| Package | `@apzhub/qep-command` **0.1.0** |

## Source of truth for discovery

**Quality Knowledge Index only.**

```text
Command Discovery SHALL NOT query business services.
```

Business domains remain authoritative. Discovery is eventually consistent with QKI.

## Flow

```text
Query + CommandContext
  → Filter visible commands (RBAC)
  → Score local command metadata
  → Enrich entity commands from QKI search hits
  → Deduplicate / sort / limit
```

## Client surface

`EnterpriseCommandPlatform.searchCommands` → discovery + ranking suggestions for Palette / AI / Dashboard clients.
