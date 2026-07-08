# LAW-001-03 — Canonical Legal Domain Model Completion Report

> **Story:** LAW-001-03 — Canonical Legal Domain Model  
> **Status:** **Complete** — await owner approval before LAW-002-01  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**

---

## Summary

LAW-001-03 defines the canonical business vocabulary for the entire Law Platform. All entity definitions, relationships, enumerations, ownership rules, and naming standards are documented in a single authoritative reference. No code, database schema, APIs, UI, or business logic was implemented.

This is the **final foundation story** before business functionality begins.

---

## Deliverables

| Deliverable             | Location                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| Canonical domain model  | [APZHUB-Law-Domain-Model.md](../architecture/APZHUB-Law-Domain-Model.md) |
| Relationship diagrams   | Domain model §2 (ASCII + Mermaid)                                        |
| Enumeration catalogue   | Domain model §5                                                          |
| Naming standards        | Domain model §4                                                          |
| Module → entity mapping | Domain model §6                                                          |
| Ownership rules         | Domain model §3                                                          |
| This completion report  | `docs/sprint/LAW-001-03-completion-report.md`                            |

---

## Canonical domain model

**52 entities** defined across eight domains:

| Domain                          | Entities                                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Party & relationship            | Client, Organisation, Contact, Relationship, Address, Communication, Email, Phone                                             |
| Matter                          | Matter, Matter Type, Matter Status, Practice Area, Court, Judge, Advocate, Attorney, Candidate Attorney, Secretary, Paralegal |
| Document                        | Document, Document Category, Folder, Attachment, Template, Precedent                                                          |
| Work management                 | Task, Workflow, Appointment, Calendar Event                                                                                   |
| Financial                       | Time Entry, Expense, Invoice, Trust Account, Trust Transaction, Disbursement, Payment                                         |
| Security & audit                | User, Role, Permission, Audit Record                                                                                          |
| Platform projection & knowledge | Notification, Activity, Knowledge Article                                                                                     |
| Cross-cutting                   | Custom Field, Tag, Note                                                                                                       |

Full definitions: [APZHUB-Law-Domain-Model.md](../architecture/APZHUB-Law-Domain-Model.md) §1.

---

## Relationship diagrams

### Core matter chain

Documented in domain model §2.1:

```text
Client → Matter → Documents → Tasks → Time Entries → Invoices → Payments
                              ↘ Calendar Events
                              ↘ Expenses / Disbursements
Client → Trust Account → Trust Transactions
```

Mermaid entity-relationship diagram included in §2.1 for visual reference.

### Cardinality highlights

| Relationship                      | Cardinality |
| --------------------------------- | ----------- |
| Client → Matter                   | 1 : 0..n    |
| Matter → Document                 | 1 : 0..n    |
| Matter → Task                     | 1 : 0..n    |
| Matter → Time Entry               | 1 : 0..n    |
| Client → Invoice                  | 1 : 0..n    |
| Invoice → Matter (via line items) | 1 : 1..n    |
| Trust Account → Trust Transaction | 1 : 0..n    |

---

## Enumeration catalogue

**14 enumeration groups** defined in domain model §5:

| Enumeration            | Values                                                                   |
| ---------------------- | ------------------------------------------------------------------------ |
| Matter Status          | prospect, open, pending, on_hold, closed, archived                       |
| Matter Priority        | low, normal, high, urgent                                                |
| Matter Type            | configurable entity with seed codes (litigation, transactional, …)       |
| Task Status            | not_started, in_progress, blocked, completed, cancelled                  |
| Task Priority          | low, normal, high, critical                                              |
| Document Status        | draft, review, approved, filed, superseded, archived                     |
| Document Type          | pleading, contract, correspondence, evidence, research, invoice, other   |
| Invoice Status         | draft, issued, sent, partially_paid, paid, overdue, void, written_off    |
| Payment Status         | pending, completed, failed, reversed                                     |
| Trust Transaction Type | deposit, withdrawal, transfer_in, transfer_out, fee_transfer, adjustment |
| Communication Type     | email, phone, meeting, letter, portal_message, other                     |
| Relationship Type      | spouse, director, employee, opposing_party, opposing_counsel, witness, … |
| Calendar Event Type    | hearing, deadline, appointment, reminder, internal                       |
| Client Status          | prospect, active, inactive, archived                                     |

---

## Naming standards

| Standard            | Convention                                      |
| ------------------- | ----------------------------------------------- |
| Entity IDs          | UUID v4, immutable                              |
| Reference numbers   | `{PREFIX}-{YYYY}-{SEQ}` (e.g. `MAT-2026-00001`) |
| Codes               | lowercase dot/snake notation                    |
| Permission keys     | `legal.{module}.{action}`                       |
| Event IDs           | `legal.{entity}.{verb}`                         |
| Activity types      | `legal.activity.{noun}.{verb}`                  |
| Display names       | Entity-specific rules in §4.3                   |
| Prohibited synonyms | Case, File, Customer, Bill, Lawyer — see §4.4   |

---

## Architecture rules enforced

| Rule                                               | Status                          |
| -------------------------------------------------- | ------------------------------- |
| No module may create duplicate entities            | Documented § Architecture rules |
| Every module consumes canonical model              | Module mapping §6               |
| Platform projections distinct from domain entities | Notification, Activity §1.7     |
| User authority remains Platform auth               | User §1.6                       |
| Enumerations are shared                            | Enumeration catalogue §5        |

---

## Validation — future module mapping

| Module              | Milestone | Entities consumed                                                             |
| ------------------- | --------- | ----------------------------------------------------------------------------- |
| Client Management   | LAW-002   | Client, Contact, Organisation, Address, Relationship, Tag, Note, Custom Field |
| Matter Management   | LAW-003   | Matter, Matter Type, Practice Area, team roles, Court, Judge, Advocate        |
| Document Management | LAW-004   | Document, Document Category, Folder, Attachment, Template                     |
| Time Recording      | LAW-005   | Time Entry                                                                    |
| Billing             | LAW-006   | Invoice, Expense, Disbursement, Payment, Trust Account, Trust Transaction     |
| Calendar            | LAW-007   | Calendar Event, Appointment                                                   |
| Workflow            | LAW-008   | Task, Workflow                                                                |
| Knowledge           | LAW-009   | Knowledge Article, Precedent                                                  |
| Reporting           | LAW-010   | Read-only aggregates across all entities                                      |
| Administration      | LAW-011   | User, Role, Permission, configuration entities                                |

---

## Platform 5.0 frameworks referenced (documentation alignment)

LAW-001-03 is documentation-only. The domain model **aligns vocabulary** with Platform 5.0 without extending platform packages:

| Platform framework        | Domain alignment                                                       |
| ------------------------- | ---------------------------------------------------------------------- |
| **Platform auth**         | User entity bridges to `@apzhub/auth`                                  |
| **Action Framework**      | Permission keys align with manifest `legal.*` namespace                |
| **Event & Notification**  | Notification documented as projection; event ID convention defined     |
| **Activity & Timeline**   | Activity documented as projection; activity type ID convention defined |
| **Knowledge & Discovery** | Knowledge Article distinct from platform help sources (`legal.help.*`) |
| **Workbench**             | Matter as primary workspace scope for views (future)                   |

No platform code was modified.

---

## Validation summary

| Gate                  | Result                                         |
| --------------------- | ---------------------------------------------- |
| Scope compliance      | No code, DB, API, UI, or business logic        |
| Entity completeness   | All 52 requested entities defined              |
| Relationship coverage | Core chain + party + document + billing + team |
| Enumeration coverage  | All requested enums + supporting enums         |
| Module mapping        | LAW-002 through LAW-012 mapped                 |

---

## Technical debt

| ID        | Item                                                      | Recommendation                                                                                                |
| --------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| TD-LAW-09 | Domain model not yet encoded as shared TypeScript types   | Introduce `@apzhub/legal-types` or `packages/legal-domain` in LAW-002-01 — types generated from this document |
| TD-LAW-10 | Multi-matter invoice rules need billing module validation | Confirm with Billing (LAW-006) before persistence schema                                                      |
| TD-LAW-11 | Client intake documents vs matter documents transition    | Define handoff workflow in LAW-003                                                                            |
| TD-LAW-12 | Trust compliance rules vary by jurisdiction               | Administration module must support jurisdiction-specific Trust Account rules                                  |
| TD-LAW-13 | Matter Type as entity vs enum hybrid                      | Seed codes provided; full configurability deferred to Administration                                          |

---

## Recommendation for LAW-002-01

Proceed with **Client Management** as the first business module:

1. **Implement shared domain types** — TypeScript interfaces mirroring Client, Contact, Organisation, Address, Relationship, Tag, Note, Custom Field from the canonical model.
2. **Use LAW-001-02 UX layouts** — `LawListPageLayout` for client list, `LawDetailPageLayout` for client detail, `LawFormPageLayout` for create/edit.
3. **Declare manifest permissions** — `legal.client.view`, `legal.client.manage` per Permission naming standard.
4. **Declare domain events** — `legal.client.created`, `legal.client.updated`, `legal.client.archived` per Event ID convention.
5. **Do not introduce alternate entity names** — enforce code review against [APZHUB-Law-Domain-Model.md](../architecture/APZHUB-Law-Domain-Model.md).

Persistence and API design remain out of scope until explicitly approved in LAW-002 stories.

---

## Stop condition

**LAW-001-03 is complete.** Foundation phase (LAW-001-01, LAW-001-02, LAW-001-03) is finished.

Await owner approval before beginning **LAW-002-01 Client Management**.

Do not implement Client Management, Matter Management, database schema, or APIs until approved.

---

_LAW-001-03 — Canonical Legal Domain Model complete._
