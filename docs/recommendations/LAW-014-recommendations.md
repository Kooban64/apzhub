# LAW-014 — Recommendations (post LAW-013)

**Date:** 2026-07-06  
**Prerequisite:** Owner approval of LAW-013 closeout

---

## Recommended LAW-014 Scope

Based on LAW-012 persistence closeout and LAW-013 product experience foundation:

### 1. Integration & Public APIs (primary)

- Tenant-scoped REST/GraphQL APIs for clients, matters, documents, tasks, calendar, time, invoices
- API authentication aligned with platform auth
- OpenAPI specification and developer documentation

### 2. Outbox workers

- Consume persistence outbox events (`legal.*.created`, etc.)
- Enable async search index updates and external webhooks

### 3. UX debt parallel track

- Roll `LawFormValidationSummary` to all forms (TD-UX-01)
- CSV export on all list pages (TD-UX-02)
- Unsaved-change warnings (TD-UX-09)

### 4. Deferred to post-LAW-014

- Trust Accounting
- Payment gateway integration
- Reporting engine
- AI / semantic search
- OCR / email integrations

---

## UX → API Alignment

| UX surface          | API priority                                                          |
| ------------------- | --------------------------------------------------------------------- |
| Executive dashboard | Aggregator endpoints or BFF composition                               |
| Unified search      | Search API backed by knowledge index workers                          |
| Client CRM detail   | Client relationship endpoint (matters, invoices, documents)           |
| List tables         | Paginated, sortable, filterable list APIs matching current UI filters |

---

## Success Criteria for LAW-014

- External consumers can perform CRUD on core legal entities via documented APIs
- Dashboard and list pages can switch from in-memory to API-backed repositories via factory
- Quality gates remain green
- No regression to LAW-013 visual consistency

---

## Owner Decision Required

Approve LAW-014 charter focusing on **Integration & Public APIs** as the primary milestone, with trust accounting and payments explicitly deferred.
