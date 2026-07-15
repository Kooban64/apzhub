# @apzhub/testing-foundation

APZ TCMS foundation helpers — in-memory capability registries and domain validation utilities.

**Version:** **0.1.0** (APZTCMS-002)  
**Status:** Placeholders only — no business orchestration, persistence, or execution

## Purpose

Provides lightweight scaffolding used while service implementations and persistence land in later milestones:

- **Registries** — `TestingRegistry`, `CertificationRegistry`, `EvidenceRegistry`, `AutomationRegistry`, `DomainRegistry` (register / list / get / clear)
- **Validation** — Zod + hand helpers for required fields, enum membership, and platform ID shapes

## Usage

```typescript
import {
  createTestingRegistries,
  validateTestCaseInput,
} from "@apzhub/testing-foundation";

const registries = createTestingRegistries();
registries.testing.register({
  id: "testing.cases",
  kind: "testing",
  name: "Cases",
  status: "planned",
});

const outcome = validateTestCaseInput({
  tenantId: "tenant_1",
  key: "TC-1",
  title: "Login",
  status: "ready",
  priority: "high",
});
```

Depends on `@apzhub/testing-contracts` and `zod`.

## Explicit non-goals

- No database / Drizzle
- No `@apzhub/platform-services` implementations
- No Playwright / Vitest-as-product-runner dependencies
- No certification engine or automation execution

## Related documentation

- [Package Guide](../../docs/architecture/APZHUB-APZ-TCMS-Package-Guide.md)
- [Developer Guide](../../docs/architecture/APZHUB-APZ-TCMS-Developer-Guide.md)
