# Automation Provider Contract — APZQEP-161

## Interface

Every provider implements `AutomationProvider`:

| Method       | Required | Behaviour                                          |
| ------------ | -------- | -------------------------------------------------- |
| `descriptor` | yes      | Id, name, status (`active` \| `placeholder`), caps |
| `prepare`    | yes      | Validate target/options; allocate resources        |
| `execute`    | yes      | Run work; return summary + artifacts               |
| `cancel`     | optional | Best-effort abort                                  |
| `health`     | optional | Provider readiness                                 |

## Context (provider-neutral)

`ProviderExecutionContext` carries `executionId`, `tenantId`, `correlationId`, `attempt`, `target`, `options`, optional `AbortSignal`.

## Result

`ProviderExecutionResult`: `ok`, `summary`, `artifacts[]`, optional `errorMessage`, optional `timing`.

## Rules

1. Providers must not leak engine-specific types into the public API surface.
2. Placeholder providers (`status: "placeholder"`) must refuse `execute` with a clear error.
3. Artifacts use neutral kinds: `log`, `screenshot`, `video`, `trace`, `console`, `network`, `timing`, `metadata`, `other`.
4. New providers register via `ProviderRegistry` — **no Automation Engine changes**.

## Wave 1 registry

| ProviderId    | Status      | Implementation |
| ------------- | ----------- | -------------- |
| playwright    | active      | Full Wave 1    |
| selenium      | placeholder | Stub only      |
| cypress       | placeholder | Stub only      |
| appium        | placeholder | Stub only      |
| rest          | placeholder | Stub only      |
| k6            | placeholder | Stub only      |
| visual        | placeholder | Stub only      |
| accessibility | placeholder | Stub only      |
