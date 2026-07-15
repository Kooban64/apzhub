# APZ TCMS — Automation Adapter Guide

**Milestone:** APZTCMS-007

---

## Interface

```ts
interface AutomationResultAdapter {
  readonly kind: AutomationAdapterKind;
  readonly version: string;
  canParse(input: AutomationAdapterInput): boolean;
  parse(input: AutomationAdapterInput): CanonicalAutomationResult;
}
```

Adapters **translate** provider output → canonical APZ TCMS models. They never spawn processes or open browsers.

---

## Reference adapters

| Kind              | Input                          | Notes                               |
| ----------------- | ------------------------------ | ----------------------------------- |
| `vitest`          | Vitest JSON report-like shapes | tests / suites / statuses           |
| `playwright`      | Playwright JSON report         | suites / specs                      |
| `junit_xml`       | JUnit XML string               | `<testsuite>` / `<testcase>`        |
| `generic_json`    | Canonical-ish JSON             | `{ suites: [{ cases: [...] }] }`    |
| `generic_tap`     | TAP lines                      | `ok` / `not ok` / `# skip`          |
| `allure_metadata` | Allure-like result metadata    | **No** Allure server; metadata only |

Registry resolves by explicit `adapterKind` or `canParse` probing.

---

## Extending

1. Implement `AutomationResultAdapter`
2. `registry.register(adapter)`
3. Add unit tests for happy path + unknown status + invalid payload
4. Document kind in this guide

Do not add framework runner dependencies.
