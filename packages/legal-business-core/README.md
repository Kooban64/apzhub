# @apzhub/legal-business-core

Shared **Legal Business Core** for the APZHUB Law Platform.

This package is the single source of truth for canonical domain types, repository interfaces, validators, formatters, reference generators, lookups, and factories. All legal modules must consume this package — no duplicate business infrastructure in app or service code.

**Authority:** [APZHUB-Law-Domain-Model.md](../../docs/architecture/APZHUB-Law-Domain-Model.md) (LAW-001-03)

## Scope

| Included                                     | Excluded                   |
| -------------------------------------------- | -------------------------- |
| Domain TypeScript types                      | Persistence                |
| Repository interfaces                        | APIs                       |
| Validators                                   | Database schemas           |
| Formatters                                   | Platform 5.0 modifications |
| Reference number generators (mock sequences) | UI components              |
| Lookup services (static)                     | Server actions             |

## Package structure

```text
src/
  domain/          Canonical entity types and enumerations
  repositories/    Repository interfaces (no implementations)
  validation/      Reusable validators
  formatting/      Shared display formatters
  reference/       Reference number generators + mock sequence provider
  lookups/         Static lookup services
  factories/       Entity factories returning valid canonical objects
  constants/         Permission, event, activity, knowledge prefixes
  interfaces/        Shared interfaces (ValidationResult)
  diagnostics/       Core surface area diagnostics
```

## Usage

```typescript
import {
  Client,
  ClientRepository,
  ClientValidator,
  ClientFactory,
  ReferenceNumberGenerator,
  formatMatterListLabel,
  legalLookups,
  getLegalBusinessCoreDiagnostics,
} from "@apzhub/legal-business-core";

const client = ClientFactory.create({ displayName: "Harbourview Holdings Pty Ltd" });
const validation = ClientValidator.validate({
  clientReference: client.clientReference,
  displayName: client.displayName,
  clientType: client.clientType,
  status: client.status,
});
```

## Reference numbers

Canonical format: `{PREFIX}-{YYYY}-{SEQ}`

| Entity        | Prefix | Example           |
| ------------- | ------ | ----------------- |
| Client        | `CLT`  | `CLT-2026-000001` |
| Matter        | `MAT`  | `MAT-2026-000001` |
| Invoice       | `INV`  | `INV-2026-000001` |
| Trust Account | `TRU`  | `TRU-2026-000001` |

Generators use `MockReferenceSequenceProvider` — in-memory counters only.

## Version

`1.0.0` (LAW-002-02)
