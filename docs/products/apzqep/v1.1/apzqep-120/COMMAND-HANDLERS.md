# Command Handlers — APZQEP-120-S13

| Field   | Value                           |
| ------- | ------------------------------- |
| Package | `@apzhub/qep-command` **0.1.0** |

## Contract

```ts
CommandHandler {
  commandId
  validate?(input) → ok | message
  execute(input) → { ok, message?, data? }
}
```

## Rules

1. Handlers register onto `CommandHandlerRegistry` — never into a switch.
2. Handlers may call business services; the **engine** must not.
3. Validation errors surface as `validation_error` outcomes.
4. Missing handler → `failure` / `handler.not_registered` (fail closed).

## Built-in handlers

Navigation, Evidence open, Knowledge search (via QKI), Project switch, Admin diagnostics, System no-op.
