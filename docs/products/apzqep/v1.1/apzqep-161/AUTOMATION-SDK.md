# Automation SDK — APZQEP-161

## Platform SDK

```ts
import { createPlatformAutomation } from "@apzhub/platform-automation";

const automation = createPlatformAutomation({
  playwrightDryRun: true, // default; set false + install playwright for live
  publishEvent: async (event) => {
    // forward to platform event bus / audit / notify
  },
});

await automation.engine.enqueueAndRun({
  tenantId: "t1",
  providerId: "playwright",
  correlationId: crypto.randomUUID(),
  requestedBy: "user-1",
  target: { kind: "url", name: "smoke", baseUrl: "about:blank" },
  options: { dryRun: true },
});
```

### Surfaces

| Export / member            | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `createPlatformAutomation` | Bootstrap engine + registry + Playwright   |
| `automation.engine`        | Execution coordinator                      |
| `automation.registry`      | Provider registry                          |
| Contracts (`./contracts`)  | Lifecycle, provider interface, events      |
| Playwright factory         | Registered only via bootstrap — not engine |

## QEP SDK

```ts
import { createQepAutomation } from "@apzhub/qep-automation";

const qep = createQepAutomation({
  playwrightDryRun: true,
  onEvent: (event) => {
    /* Command / Notifications / Reporting */
  },
  onEvidencePublished: async (record) => {
    /* Evidence Platform + QKI attach here — no parallel SoR */
  },
});
```

APZQEP consumes the platform package; it does not re-implement the engine.
