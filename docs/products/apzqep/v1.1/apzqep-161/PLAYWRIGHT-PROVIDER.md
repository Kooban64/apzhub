# Playwright Provider — APZQEP-161

## Role

First **active** execution provider for the Enterprise Automation Platform.

Located at `packages/platform-automation/src/providers/playwright/`.  
Imported only by SDK bootstrap — **never** by `AutomationEngine`.

## Capabilities (Wave 1)

| Capability           | Behaviour                                                      |
| -------------------- | -------------------------------------------------------------- |
| Browser lifecycle    | Prepare / execute / dispose; dry-run skips real browser launch |
| Projects / workers   | Options: `workers`, `parallel`                                 |
| Retries / timeouts   | Engine + provider honour `retries`, `timeoutMs`                |
| Screenshots / videos | Artifact kinds when collection flags set                       |
| Trace collection     | `trace` artifacts                                              |
| Artifact publication | Returned on execution record                                   |
| Evidence publication | Evidence refs + `platform.automation.evidence.published` event |
| Result publication   | Lifecycle → `completed` / `failed` with summary                |

## Dry-run vs live

| Mode    | When                                                       | Behaviour                            |
| ------- | ---------------------------------------------------------- | ------------------------------------ |
| Dry-run | Default (`dryRun: true` / `APZHUB_AUTOMATION_LIVE` unset)  | Full lifecycle + synthetic artifacts |
| Live    | `APZHUB_AUTOMATION_LIVE=true` + optional `playwright` peer | Dynamic `import("playwright")`       |

Live mode is optional; Wave 1 CI and workspace default to dry-run so Playwright is not a hard install dependency.

## Non-goals

Does not define product identity. Does not expose Playwright APIs on APZQEP HTTP surface.
