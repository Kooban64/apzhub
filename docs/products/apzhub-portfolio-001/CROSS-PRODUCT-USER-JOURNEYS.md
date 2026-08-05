# Cross-Product User Journeys

| Field     | Value                    |
| --------- | ------------------------ |
| Programme | APZHUB-PORTFOLIO-001     |
| Status    | **IN FORCE**             |
| Timestamp | 20260805T081000Z         |
| Kind      | Portfolio narrative only |

## Purpose

Show how real work crosses APZHUB products. Journeys are **operational stories**, not technical integration designs and not authorised feature programmes.

## Journey 1 — Project Manager (delivery spine)

```text
Project Manager
      ↓
Creates Project          → APZ Projects
      ↓
Allocates Team           → APZ Projects (+ platform identity)
      ↓
Tracks Time              → APZ Time
      ↓
Raises Support Issue     → APZ Support
      ↓
Quality Review           → APZQEP (change/release discipline)
      ↓
Release                  → APZQEP + product ops packs
      ↓
Reporting                → APZ Analytics (future) / product summaries today
```

**Platform promise:** one identity and one workspace across every step. Engines never appear.

## Journey 2 — Team Member (daily work)

```text
Team Member
      ↓
Opens My Work / My Projects   → APZHUB cross-product experience (platform-owned)
      ↓
Completes Tasks               → APZ Projects
      ↓
Records Time                  → APZ Time
      ↓
Needs Help                    → APZ Support
      ↓
Receives Notifications        → APZHUB Attention (platform-owned)
```

## Journey 3 — Service Agent

```text
Service Agent
      ↓
Works My Tickets              → APZ Support (+ APZHUB “My …” surfaces)
      ↓
Links Delivery Context        → APZ Projects (when relevant)
      ↓
Sees Who Is Working           → Platform identity / people context
      ↓
Follows Progress to Resolution→ APZ Support
```

## Journey 4 — Product / Engineering Change

```text
Engineer / QA / Release Owner
      ↓
Authorised Change
      ↓
Quality Flow → Decision → Evidence → Release → Learning
      ↓
APZQEP (all products)
```

Same quality journey for Time, Support, Projects, and future products.

## Journey design rules

1. Name **APZHUB** and **product capabilities** — never engines.
2. Cross-product steps must remain possible without a second login.
3. “My …” destinations are platform experiences, even when product data feeds them.
4. Gaps in journey completeness are portfolio priorities — not automatic engineering tickets.

## Related

Interaction rules: [PORTFOLIO-INTERACTION-MODEL.md](./PORTFOLIO-INTERACTION-MODEL.md)  
Experience principles: [PLATFORM-EXPERIENCE-PRINCIPLES.md](./PLATFORM-EXPERIENCE-PRINCIPLES.md)
