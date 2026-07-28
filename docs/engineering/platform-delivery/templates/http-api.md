# {CAPABILITY} — HTTP API

> **Programme:** {PROGRAMME_ID}  
> **Lifecycle phase:** HTTP API  
> **Standard:** [Platform Delivery Standard](../PLATFORM-DELIVERY-STANDARD.md)

## Purpose

Expose canonical versioned HTTP for {CAPABILITY}.

## Surface

- Base path: `/api/v1/{capability}/*`
- Distinct from (if any): …

## Routes

| Method | Path | Gateway call             | AuthZ |
| ------ | ---- | ------------------------ | ----- |
|        |      | `gateway.{capability}.*` |       |

## OpenAPI

- Spec: `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`
- Version bump: {FROM} → {TO}
- Validate: PASS / FAIL

## Handler rules

- [ ] No `integration-*` imports
- [ ] Zod validation
- [ ] Standard response envelope
- [ ] Correlation ID

## Single recommendation

**HTTP API READY**

## Exit checklist

- [ ] Routes + handlers
- [ ] OpenAPI paths/schemas
- [ ] Docs under `docs/http/{capability}/`
- [ ] API/AuthZ/validation tests PASS
- [ ] Typecheck · lint · build PASS
- [ ] Completion + Acceptance reports
- [ ] No Workbench in this programme
