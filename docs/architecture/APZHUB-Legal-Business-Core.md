# Legal Business Core — Architecture Notes

> **Story:** LAW-002-02 — Legal Business Core  
> **Package:** `@apzhub/legal-business-core`

---

## Purpose

Establish the reusable business core consumed by every Law Platform module. This package encodes the canonical vocabulary from [APZHUB-Law-Domain-Model.md](./APZHUB-Law-Domain-Model.md) as TypeScript types and business utilities.

---

## Design principles

1. **Single source of truth** — Domain types live here only. Apps re-export for convenience; they must not redefine entities.
2. **Interfaces, not implementations** — Repository interfaces define contracts. In-memory implementations remain in app or future service layers until persistence is approved.
3. **Framework-agnostic validation** — Validators return plain `ValidationResult` objects. No React, Next.js, or Platform 5.0 dependencies.
4. **Mock reference sequences** — `ReferenceNumberGenerator` uses `MockReferenceSequenceProvider`. No database sequences.
5. **Static lookups** — Lookup services ship with seed data. Configurable lookups deferred to Administration module.

---

## Layer placement

```text
Platform 5.0 (frozen)
        ↓
Law Platform app / services
        ↓
@apzhub/legal-business-core   ← this package
        ↓
APZHUB-Law-Domain-Model.md  ← authority
```

---

## Entity coverage

All 52 canonical entities from LAW-001-03 are represented as TypeScript types across:

- `domain/party.ts` — Client, Organisation, Contact, Relationship, Address, Communication, Email, Phone
- `domain/matter.ts` — Matter, MatterType, PracticeArea, Court, Judge, Advocate, Attorney, team roles
- `domain/document.ts` — Document, DocumentCategory, Folder, Attachment, Template, Precedent
- `domain/work.ts` — Task, Workflow, Appointment, CalendarEvent
- `domain/financial.ts` — TimeEntry, Expense, Invoice, TrustAccount, TrustTransaction, Disbursement, Payment
- `domain/security.ts` — User, Role, Permission, AuditRecord
- `domain/knowledge.ts` — KnowledgeArticle, NotificationProjection, ActivityProjection
- `domain/cross-cutting.ts` — CustomField, Tag, Note

---

## Consumer rules

| Rule                             | Detail                                                                |
| -------------------------------- | --------------------------------------------------------------------- |
| Import domain types from package | Never duplicate `Client`, `Matter`, etc. in apps                      |
| Use package validators           | App forms may wrap validators for UI-specific fields                  |
| Use package formatters           | Display logic must not reimplement reference/date/currency formatting |
| Repository interfaces only       | Persistence implementations require separate approval                 |
| No platform changes              | Package has zero dependencies on Platform 5.0 packages                |

---

## Migration (LAW-002-02)

Client Management (`apps/law-platform/lib/clients/`) now consumes:

- `Client`, `ClientSearchCriteria`, enums from `@apzhub/legal-business-core`
- `ClientRepository` interface from package
- `ClientValidator` for canonical field validation

UI-specific concerns remain in the app:

- `ClientFormValues` (string-based form model)
- `client-routes.ts` (navigation)
- `InMemoryClientRepository` (UX validation seed data)
- Custom fields string parsing (form presentation)

---

_Legal Business Core architecture notes — LAW-002-02._
