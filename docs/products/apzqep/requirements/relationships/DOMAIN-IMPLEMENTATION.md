# APZQEP-ENG-020F Part 1 — Domain Implementation Summary

| Field | Value |
| --- | --- |
| Programme | APZQEP-ENG-020F Part 1 |
| Architecture | APZQEP-ARCH-005 rev 1.1.0-arch |
| Package path | `packages/qep-requirements/src/domain/relationship/` |
| Infrastructure | **None** (domain only) |

## Aggregate

| Concept | Implementation |
| --- | --- |
| `RequirementsRelationship` | Aggregate root alias of `Relationship` (`relationship.ts`) |

## Entities

| Concept | Implementation |
| --- | --- |
| `Relationship` | Aggregate state: identity, type, direction, lifecycle, strength, criticality, classification, scope, rationale, audit metadata, append-only history, pending domain events |
| `RelationshipTaxonomyDefinition` | Domain representation in `relationship-taxonomy.ts` with normative behaviour matrix |

## Value objects

| VO | Notes |
| --- | --- |
| `RelationshipId` | Branded `rrl_*` |
| `RelationshipType` | Normative seven types only |
| `RelationshipEndpoint` | `requirement` or `content_version_pinned` |
| `RelationshipDirection` | Directed source → target |
| `RelationshipStrength` | mandatory / recommended / informational |
| `RelationshipCriticality` | critical / high / medium / low |
| `RelationshipClassification` | Approved classification set |
| `RelationshipScope` | product / project / release / baseline (+ reference rules) |
| `RelationshipLifecycleState` | draft → active → deprecated → retired |
| `RelationshipSemanticProfile` | Complete semantic profile composition |
| `RelationshipRationale` | Bounded non-empty text when provided |

## Policies (persistence-independent)

| Policy | Responsibility |
| --- | --- |
| Taxonomy validation | Approved types + taxonomy lookup |
| Endpoint validation | Tenant equality, no self-reference, existence contracts |
| Content Version pin validity | Pin belongs to requirement/tenant (facts) |
| Scope reference validity | Project/release/baseline refs resolve (facts) |
| Rationale policy | Mandatory/recommended/optional per taxonomy |
| Symmetric canonicalisation | `conflicts_with` ordered pair |
| Duplicate detection | Active/deprecated duplicate key rejection |
| Cycle validation | In-memory graph; forbidden / default-forbidden |
| Supersession uniqueness | One active successor per superseded requirement per scope |
| Baseline interaction | No membership mutation; no Content Version unlock |
| Lifecycle mutability | Draft endpoints; draft/active profile; retired immutable |

## Domain service

`validateRelationshipForActivation` — pure activation gate composing the policies above. No Platform services, repositories, HTTP, or databases.

## Domain events (types/builders only)

- `qep.requirements_relationship.created`
- `qep.requirements_relationship.activated`
- `qep.requirements_relationship.deprecated`
- `qep.requirements_relationship.retired`
- `qep.requirements_relationship.superseded`
- `qep.requirements_relationship.rationale_changed`
- `qep.requirements_relationship.semantic_profile_changed`
- `qep.requirements_relationship.strength_changed`
- `qep.requirements_relationship.classification_changed`
- `qep.requirements_relationship.scope_changed`

No messaging infrastructure.

## Lifecycle

```text
draft → active → deprecated → retired
```

No delete. No restore. No silent rewrite. History is append-only.

## Explicit non-delivery (Part 1)

Persistence, migrations, repositories, commands/queries, APIs, permissions, audit integration, search, observability, UI, Traceability, Verification, AI, MCP.
