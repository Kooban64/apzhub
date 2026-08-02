# APZQEP Engineering Standards

| Field             | Value                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| Document          | APZQEP-ENGINEERING-STANDARDS                                            |
| Programme         | APZQEP-ENG-001                                                          |
| Status            | **Normative**                                                           |
| Version           | **1.0**                                                                 |
| Authority         | [APZQEP Engineering Constitution](./APZQEP-ENGINEERING-CONSTITUTION.md) |
| Guidance parent   | [APZQEP Engineering Handbook](./APZQEP-ENGINEERING-HANDBOOK.md)         |
| Enterprise parent | APZHUB Engineering Standard / APZHUB-ENG-001 / ADR-0092                 |
| Scope             | All APZQEP engineering                                                  |
| Compliance        | **Mandatory**                                                           |
| Exceptions        | Only by approved ADR                                                    |
| Classification    | Coding and repository standard                                          |

---

## 0. Normative language

The key words **MUST**, **MUST NOT**, **SHALL**, **SHALL NOT**, **SHOULD**, and **MAY** in this document are to be interpreted as follows:

| Keyword                      | Meaning                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| **MUST** / **SHALL**         | Absolute requirement                                                               |
| **MUST NOT** / **SHALL NOT** | Absolute prohibition                                                               |
| **SHOULD**                   | Strong recommendation; deviation requires recorded justification in slice evidence |
| **MAY**                      | Optional permission                                                                |

This document is **normative**. Non-compliance is an engineering defect unless an approved ADR grants an exception.

The Handbook explains _how_ engineering is performed. This document defines _exactly how engineering artefacts MUST look_.

### Hierarchy

```text
APZHUB Engineering Standard
        │
        ▼
APZQEP Engineering Constitution
        │
        ▼
APZQEP Engineering Framework v1.0
        │
        ├── Engineering Handbook
        ├── Engineering Standards   ← this document
        └── Specification Template
                │
                ▼
        Engineering Specifications
```

Framework citation: [APZQEP-ENGINEERING-FRAMEWORK.md](./APZQEP-ENGINEERING-FRAMEWORK.md).

Slice specifications SHALL cite Framework v1.0 and reference this document. Slice specifications SHALL NOT redefine naming, layout, or artefact conventions established here.

### Specialised standards

Where a specialised standard exists (Domain Event, API, Database, Testing, Documentation, Certification), that standard owns topic-specific normative detail. This document owns cross-cutting coding and repository conventions. On overlap, the specialised standard prevails for its topic; this document prevails for naming and layout unless the specialised standard explicitly supersedes a clause via ADR.

---

## 1. Product and package identity

### 1.1 Product code

1. The product code SHALL be `APZQEP` in programme identifiers, evidence filenames, and certification records.
2. npm / pnpm package scope SHALL be `@apzhub`.
3. Product package name segments SHALL use the prefix `qep-` (example pattern: `@apzhub/qep-<capability>`).
4. User-facing product name SHALL be APZ QEP / Quality Engineering Platform terminology. Vendor and engine names MUST NOT appear in user-facing copy.

### 1.2 Programme identifiers

Programme identifiers SHALL use:

```text
APZQEP-<AREA>-<NNN>
```

Examples of area tokens: `ENG`, `120`, `REQ`, `DEF`.

Engineering slice identifiers SHALL use:

```text
APZQEP-<PROGRAMME>-S<nn>
```

Example: `APZQEP-120-S01`.

Slice numbers SHALL be two digits, zero-padded.

### 1.3 Capability package naming

| Artefact             | Pattern                            | Example form                       |
| -------------------- | ---------------------------------- | ---------------------------------- |
| Capability package   | `@apzhub/qep-<capability>`         | `@apzhub/qep-evidence`             |
| Shared types package | `@apzhub/qep-types`                | fixed shared kernel name when used |
| Contracts package    | `@apzhub/qep-contracts`            | fixed shared kernel name when used |
| Foundation package   | `@apzhub/qep-foundation`           | fixed shared kernel name when used |
| UI package           | `@apzhub/qep-ui`                   | fixed shared kernel name when used |
| Integration package  | `@apzhub/integration-qep-<system>` | `@apzhub/integration-qep-github`   |

New capability packages MUST follow `@apzhub/qep-<capability>` with `<capability>` in kebab-case.

---

## 2. Repository layout

### 2.1 Monorepo roots

APZQEP engineering MUST place artefacts under the APZHUB monorepo. A second product repository MUST NOT be created for APZQEP without Product Board authority and ADR.

Required placement:

| Kind                                      | Path pattern                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Capability packages                       | `packages/qep-<capability>/`                                                               |
| Shared QEP packages                       | `packages/qep-<shared>/`                                                                   |
| Product modules                           | `modules/qep-<module>/`                                                                    |
| Product services (manifest tree)          | `services/qep/` and children as architecture requires                                      |
| Integrations                              | `packages/integration-qep-<system>/` or platform `/adapters` layout per Foundation 004/026 |
| Events                                    | `events/qep/` (manifests)                                                                  |
| Product docs                              | `docs/products/apzqep/`                                                                    |
| Engineering framework docs                | `docs/products/apzqep/engineering/`                                                        |
| Slice notes                               | `docs/products/apzqep/v1.1/apzqep-120/` or successor programme path                        |
| Operations evidence                       | `docs/operations/evidence/apzqep/`                                                         |
| ADRs                                      | `docs/adr/`                                                                                |
| DB migrations (platform/product as owned) | platform migration location designated by Database Standard / existing platform convention |

### 2.2 Capability package internal layout

Every durable capability package MUST use layered directories:

```text
packages/qep-<capability>/
  package.json
  tsconfig.json
  src/
    index.ts
    domain/
    application/
    infrastructure/
    shared/          # cross-cutting types/errors local to package; MUST NOT become a dumping ground for business rules
  README.md          # when package is user/engineer facing beyond trivial stub
```

Rules:

1. `domain/` MUST contain domain models, invariants, domain events, and domain ports (interfaces).
2. `application/` MUST contain application services, commands, queries, DTOs, and application orchestration.
3. `infrastructure/` MUST contain adapters (persistence, storage providers, mappers, external clients).
4. `domain/` MUST NOT import from `application/` or `infrastructure/`.
5. `application/` MUST NOT import from `infrastructure/` implementation modules except through composition roots explicitly designated (for example `create-*-persistence.ts` / `create-application-services.ts` factory modules). Application _services_ MUST depend on ports, not concrete adapters.
6. Presentation modules MUST NOT import `infrastructure/` of a capability package.

### 2.3 Domain / application / infrastructure subfolders

| Layer          | SHALL use subfolders such as                                 | MUST NOT                          |
| -------------- | ------------------------------------------------------------ | --------------------------------- |
| domain         | `<aggregate>/`, `ports/`                                     | HTTP handlers, SQL, provider SDKs |
| application    | `commands/`, `query/`, `dto/`, `<usecase>/`, `services/`     | vendor clients, raw SQL           |
| infrastructure | `postgres/`, `persistence/`, `storage/`, `providers/<name>/` | business workflow policy          |

Exact subfolder names SHOULD match the capability’s bounded contexts. New top-level folders under `src/` beyond `domain`, `application`, `infrastructure`, `shared` MUST NOT be introduced without ADR.

---

## 3. TypeScript and module conventions

### 3.1 Language

1. TypeScript MUST be used for APZQEP application, domain, and adapter code in this monorepo.
2. `strict` compiler options MUST remain enabled for APZQEP packages.
3. The type `any` MUST NOT be introduced in new APZQEP code. Existing `any` MUST NOT be expanded.
4. Non-null assertions (`!`) SHOULD be avoided; when used, slice evidence MUST justify them.

### 3.2 Exports

1. Each layer directory SHOULD expose an `index.ts` barrel for its public surface.
2. Package root `src/index.ts` MUST export only the supported public API.
3. Internal adapter types MUST NOT be exported from the package root unless required for composition wiring authorised by architecture.

### 3.3 File names

1. File names MUST be kebab-case.
2. Test files MUST be co-located or under the same tree and MUST end with `.test.ts` (or the repository’s established Vitest pattern for that package).
3. One primary type or service per file SHOULD be preferred for application services and aggregates.

Examples of compliant names:

```text
evidence-catalogue-service.ts
evidence-repository.ts
lifecycle-history.ts
sha256-integrity-algorithm.ts
memory-evidence-storage-provider.ts
```

---

## 4. Naming — types and symbols

### 4.1 General

| Kind                       | Convention                                                                  | Example form                    |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------- |
| Class / service            | PascalCase                                                                  | `EvidenceCatalogueService`      |
| Interface (port)           | PascalCase; MUST NOT use `I` prefix                                         | `EvidenceRepository`            |
| Type alias / interface DTO | PascalCase                                                                  | `EvidenceDto`                   |
| Enum / const union         | PascalCase type; UNION members SCREAMING_SNAKE or as established closed set | `ACTIVE`                        |
| Function                   | camelCase                                                                   | `createEvidencePersistence`     |
| File                       | kebab-case                                                                  | `evidence-catalogue-service.ts` |
| Package                    | `@apzhub/qep-kebab`                                                         | `@apzhub/qep-evidence`          |
| DB table                   | singular snake_case per platform data standard                              | owned by Database Standard      |
| Event type string          | past-tense dotted or platform Event SDK form                                | owned by Domain Event Standard  |
| Error code                 | section 10                                                                  | `QEP_EVIDENCE_NOT_FOUND`        |

### 4.2 Services

1. Application service type names MUST end with `Service` when they expose use cases.
2. Platform-facing product service names MUST use product capability language (`EvidenceCatalogueService`, `EvidenceLifecyclePlatformService`) and MUST NOT use vendor names (`PlaneService`, `MinioService`).
3. Factory functions MUST be camelCase and SHOULD start with `create` when constructing wired graphs (`createEvidencePersistence`).

### 4.3 Repositories

1. Repository ports MUST be named `<AggregateOrRecord>Repository`.
2. Repository adapters MUST be named to reflect technology without leaking into the port name (file may be `evidence-repository.ts` under `infrastructure/postgres/`; the port remains `EvidenceRepository`).
3. Repository ports MUST live under `domain/ports` (or domain-owned ports folder). Concrete repositories MUST live under `infrastructure/`.

### 4.4 Ports and adapters

1. Port interfaces MUST describe capability, not vendor.
2. Adapter class/file names MAY include provider or technology (`LocalEvidenceStorageProvider`, `MemoryEvidenceStorageProvider`).
3. Adapter constructors MUST NOT be called from domain code.

### 4.5 Commands and queries

| Kind                             | Type naming                                                                 | File / folder           |
| -------------------------------- | --------------------------------------------------------------------------- | ----------------------- |
| Command input                    | `<Verb><Noun>Command` or capability-established command type union          | `application/commands/` |
| Command handler / service method | verb phrase matching command intent                                         | application service     |
| Query input                      | `<Noun>Query` or explicit query params type                                 | `application/query/`    |
| Query service                    | `<Noun>QueryService` or `*EnumerationService` where listing is the use case | `application/query/`    |

Commands MUST express intent to change state. Queries MUST NOT change authoritative business state.

### 4.6 DTOs

1. Transport/application DTOs MUST be named `<Noun>Dto` or `<Noun>DTO` consistently within a package (pick one; new packages MUST use `Dto`).
2. DTOs MUST NOT be used as domain entities.
3. Mappers between domain and DTO MUST live in `application/dto/` (or adjacent mapper module), not in presentation modules.

### 4.7 Domain events (symbol names)

1. Domain event type names MUST be PascalCase past-tense phrases (example form: `EvidenceArchived`).
2. Wire event type strings and envelopes are normative in the Domain Event Standard; until that standard is COMPLETE, producers MUST follow Platform Event SDK (029) and MUST NOT invent undocumented public event contracts.

---

## 5. Manifests

1. New modules MUST start with `module.yaml` before feature UI code.
2. New platform services MUST start with `service.yaml` before business logic code.
3. New integrations MUST start with `integration.yaml` before adapter code.
4. New events MUST start with `event.yaml` before publishers/subscribers.
5. Manifest identifiers MUST be stable; renames require migration notes in slice documentation.

---

## 6. Persistence and migrations

Detailed schema rules are owned by the Database Standard. Cross-cutting rules:

1. Application services MUST persist through repository ports.
2. SQL / query-builder usage MUST remain inside `infrastructure/`.
3. Migrations MUST be additive unless Owner authority explicitly permits otherwise (Constitution).
4. Migration files MUST follow the platform’s established numeric sequencing scheme.
5. Migration file names MUST be descriptive snake_case after the sequence prefix.
6. A slice that changes schema MUST include migration tests as required by the Testing Standard.

---

## 7. Storage providers

1. Storage ports MUST be provider-neutral.
2. Provider implementations MUST live under `infrastructure/storage/providers/<provider>/`.
3. Provider identifiers in config MUST be stable kebab-case or uppercase tokens as already established by the capability; new tokens MUST be documented in the slice.
4. Lifecycle and catalogue policy MUST NOT call provider SDKs directly.

---

## 8. Errors

### 8.1 Error types

1. Domain/application errors MUST be typed (custom error classes or discriminated results).
2. Adapters MUST translate infrastructure failures before they cross into application results intended for clients.
3. Raw driver/provider errors MUST NOT be returned to API clients.

### 8.2 Error codes

1. Stable error codes MUST use:

```text
QEP_<AREA>_<REASON>
```

2. `<AREA>` MUST be SCREAMING_SNAKE capability or subdomain (`EVIDENCE`, `LIFECYCLE`, `INTEGRITY`, `STORAGE`, `AUTHZ`).
3. `<REASON>` MUST be SCREAMING_SNAKE (`NOT_FOUND`, `FORBIDDEN`, `INVALID_TRANSITION`, `CONFLICT`).
4. Error codes MUST be documented when introduced.
5. Error codes MUST NOT be recycled with new meanings.

### 8.3 HTTP / API mapping

API status mapping is owned by the API Standard. Application code MUST expose enough typed category information for the API layer to map without stringly parsing message text.

---

## 9. Logging

1. Logs MUST be structured (key/value or JSON fields), not unstructured concatenated secrets.
2. Correlation IDs MUST be propagated when present in request context.
3. Secrets, tokens, raw credentials, and full sensitive payloads MUST NOT be logged.
4. Security-relevant denials SHOULD log at a level suitable for audit without creating user enumeration oracles in client responses.

---

## 10. Testing names and placement

Normative depth of test types is owned by the Testing Standard. Naming:

| Test kind             | File name pattern                                      | Symbol / describe naming                         |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Unit                  | `<subject>.test.ts`                                    | `describe('<TypeOrModule>')`                     |
| Integration           | `<subject>.test.ts` or `<subject>.integration.test.ts` | MUST state integration scope in `describe`       |
| Security              | `<subject>.enforcement.test.ts` or `security*.test.ts` | MUST include `security` or `enforcement` in name |
| Migration             | `migration.validation.test.ts` or equivalent           | MUST include `migration`                         |
| Architecture boundary | `architecture-boundaries.test.ts`                      | MUST fail on illegal imports                     |

Test titles MUST describe behaviour and constraint (for example tenant isolation), not only method names.

---

## 11. Documentation names

| Artefact                      | Pattern                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| Engineering framework docs    | `APZQEP-<NAME>.md` under `docs/products/apzqep/engineering/` |
| Slice engineering notes       | `S<nn>-ENGINEERING-NOTES.md`                                 |
| Product capability docs       | `SCREAMING-KEBAB` product docs under `docs/products/apzqep/` |
| Completion report (framework) | `APZQEP-ENG-001-COMPLETION.md`                               |
| ADR                           | `ADR-<NNNN>-<kebab-title>.md`                                |

Documentation craft rules are owned by the Documentation Standard. Filenames in this section are mandatory.

---

## 12. ADR numbering

1. ADRs MUST live under `docs/adr/`.
2. ADR identifiers MUST be `ADR-<NNNN>` with four-digit zero-padded numbers.
3. Filenames MUST be `ADR-<NNNN>-<kebab-case-title>.md`.
4. New ADRs MUST take the next unused number in the repository index.
5. Exceptions to these Engineering Standards MUST be recorded in an ADR with status Accepted before non-compliant code is certified.
6. Supersession MUST update the ADR index; silent replacement is forbidden.

---

## 13. Commit messages

### 13.1 Format

Commit subjects SHOULD follow:

```text
<type>(<scope>): <summary>
```

Allowed `<type>` values for APZQEP work:

| Type       | Use                                           |
| ---------- | --------------------------------------------- |
| `feat`     | New capability behaviour                      |
| `fix`      | Defect fix                                    |
| `refactor` | Behaviour-preserving restructure              |
| `test`     | Test-only change                              |
| `docs`     | Documentation only                            |
| `chore`    | Tooling/maintenance without product behaviour |
| `security` | Security fix or control hardening             |

`<scope>` SHOULD be the capability or programme (`qep-evidence`, `apzqep-120-s06`, `apzqep-eng-001`).

Summary MUST be imperative mood, ≤ 72 characters for the subject line when practical.

### 13.2 Slice commit practice

Per APZHUB-ENG-001:

1. Engineering changes and documentation/evidence changes SHOULD be separate commits when both occur.
2. Secrets MUST NOT be committed.
3. `--no-verify` and hook bypass MUST NOT be used.
4. Force-push to protected branches MUST NOT be performed.

---

## 14. Engineering evidence naming

Evidence files MUST be written under:

```text
docs/operations/evidence/apzqep/
```

Filename pattern:

```text
<UTC_TIMESTAMP>-<PROGRAMME_OR_SLICE>-<ARTEFACT>.json
```

or `.md` when a narrative validation record is required.

| Element                | Rule                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `<UTC_TIMESTAMP>`      | `YYYYMMDDTHHMMSSZ`                                                                                                             |
| `<PROGRAMME_OR_SLICE>` | e.g. `APZQEP-120-S06`, `APZQEP-ENG-001`                                                                                        |
| `<ARTEFACT>`           | `COMPLETION`, `CERTIFICATION`, `SECURITY`, `TESTING`, `ENGINEERING`, `PHASE1`, `PHASE2`, `PRODUCT-BOARD`, etc. SCREAMING_SNAKE |

Evidence JSON MUST include at minimum: programme/slice id, status, timestampUtc, and outcome-relevant fields.

---

## 15. Certification naming

1. Slice certification records MUST use artefact token `CERTIFICATION` in the evidence filename.
2. Certification outcomes in records MUST be exactly one of: `PASS`, `FAIL`, `STOP` (or Product Board `CERTIFIED` / `REJECTED` for board decisions).
3. Certification narrative MAY use Markdown sibling files with the same timestamp prefix.
4. Detailed gate definitions are owned by the Certification Standard.

---

## 16. Release naming

1. Git tags for APZQEP package releases MUST be explicit and authorised. Pattern:

```text
apzqep-<capability>-v<semver>
```

Example form: `apzqep-evidence-v1.0.0`.

2. SemVer MUST be used for published package versions.
3. Pre-release labels MUST be explicit (`-rc.1`, `-la` only if product authority defines them).
4. An engineering slice MUST NOT create release tags unless the slice programme explicitly authorises release.
5. Portfolio release names follow Lifecycle Standard; product engineering MUST NOT invent parallel GA naming.

---

## 17. API surface naming (cross-cutting)

Detailed API rules are owned by the API Standard. Until COMPLETE:

1. Public HTTP paths MUST be versioned.
2. Public resource names MUST use product language, not vendor language.
3. Undocumented client contracts MUST NOT be introduced (Constitution).

---

## 18. Security naming and enforcement markers

1. Permission keys MUST be stable dotted or platform-conventional identifiers declared in manifests where required.
2. Security enforcement tests MUST be named so automated discovery can find them (`*.enforcement.test.ts` or equivalent).
3. Authorisation checks MUST remain server-side in application services or platform authz integration—not only in UI.

---

## 19. Versioning of this standard

1. This document’s Version field MUST be incremented on normative change.
2. Additive clarifications that do not change requirements MAY keep the same minor version only if the Versioning policy in Documentation Standard later defines semver for docs; until then, normative changes MUST bump the Version visible in the header (for example 1.0 → 1.1).
3. Breaking normative changes SHOULD be accompanied by an ADR when they invalidate certified slice patterns.

---

## 20. Compliance and exceptions

1. All APZQEP engineering slices MUST comply with this standard.
2. Exceptions MUST be granted only by an approved ADR that:
   - identifies the clause(s) excepted;
   - states rationale and expiry or review date;
   - is linked from the slice engineering notes.
3. AI agents MUST apply this standard without waiting for restatement in the slice prompt.
4. On conflict with repository reality that cannot be resolved in scope, the slice MUST STOP (Constitution).

---

## 21. Quick reference — deterministic patterns

```text
Product code:              APZQEP
Package:                   @apzhub/qep-<capability>
Module dir:                modules/qep-<module>/
Package dir:               packages/qep-<capability>/
Layers:                    domain/ · application/ · infrastructure/
Files:                     kebab-case.ts
Types:                     PascalCase
Ports:                     PascalCase, no I-prefix
DTO:                       <Noun>Dto
Error code:                QEP_<AREA>_<REASON>
Slice id:                  APZQEP-<PROGRAMME>-S<nn>
Evidence file:             <UTC>-<ID>-<ARTEFACT>.json
ADR:                       ADR-<NNNN>-<kebab>.md
Commit:                    <type>(<scope>): <summary>
Release tag:               apzqep-<capability>-v<semver>
Test (unit):               <subject>.test.ts
Test (security):           <subject>.enforcement.test.ts
```

---

## 22. Related documents

- [APZQEP-ENGINEERING-CONSTITUTION.md](./APZQEP-ENGINEERING-CONSTITUTION.md) — immutable principles
- [APZQEP-ENGINEERING-HANDBOOK.md](./APZQEP-ENGINEERING-HANDBOOK.md) — how engineering is performed
- [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md) — slice instruction template
- Specialised standards (Events, API, Database, Testing, Documentation, Certification) — topic detail
- APZHUB-ENG-001 / ADR-0092 — slice process
- Foundation 003, 004, 010, 011, 013, 015, 024–029 — platform architecture and SDKs

---

## Document history

| Version | Phase                  | Status               | Notes                                 |
| ------- | ---------------------- | -------------------- | ------------------------------------- |
| 1.0     | APZQEP-ENG-001 Phase 3 | Normative / COMPLETE | First normative Engineering Standards |

---

_End of APZQEP Engineering Standards_
