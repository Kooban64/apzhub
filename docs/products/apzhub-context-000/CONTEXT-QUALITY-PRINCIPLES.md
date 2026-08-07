# Context Quality Principles

| Field     | Value                               |
| --------- | ----------------------------------- |
| Programme | APZHUB-CONTEXT-000                  |
| Status    | **COMPLETE** (await Owner Approval) |
| Timestamp | 20260806T131000Z                    |

## Purpose

Measurable quality attributes for Enterprise Context. Users should always know **where** a piece of context originated.

## Attributes

### Accuracy

| Expectation                                            | Measure direction                    |
| ------------------------------------------------------ | ------------------------------------ |
| Fragments reflect source SoR truth at composition time | Mismatch incidents vs source product |
| No invented or guessed content                         | Zero-tolerance for fabrication       |

### Freshness

| Expectation                                        | Measure direction                                       |
| -------------------------------------------------- | ------------------------------------------------------- |
| Stale projections are refreshed or labelled        | Age / refresh indicators; user reports of stale context |
| Lifetime rules from Composition Contract respected | Audit of persisted vs ephemeral use                     |

### Traceability

| Expectation                                                                          | Measure direction                     |
| ------------------------------------------------------------------------------------ | ------------------------------------- |
| Every fragment links to provider + source entity (where applicable)                  | % fragments with complete attribution |
| Path from fragment → owning product is navigable in experience (when Auth builds UI) | UX review                             |

### Explainability

| Expectation                                                        | Measure direction                                                     |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| User can understand why a fragment appears for this focus          | “Why am I seeing this?” satisfiable from attribution + relevance note |
| Empty slices explain class of reason (none / denied / unavailable) | Failure taxonomy coverage                                             |

### Source attribution

| Expectation                                                                  | Measure direction                |
| ---------------------------------------------------------------------------- | -------------------------------- |
| Provider product name (APZ Projects, APZ Law, …) visible — not engine brands | Brand leakage checks             |
| Memory / governance / documents clearly labelled as such                     | Vocabulary Integrity spot checks |

### Failure behaviour

| Expectation                                                       | Measure direction                |
| ----------------------------------------------------------------- | -------------------------------- |
| Provider failure degrades that slice only                         | Partial composition still useful |
| No silent substitution of wrong SoR data                          | Incident count                   |
| Authz denial ≠ empty “no data” without distinction where possible | Denial vs none classification    |

## Quality non-goals

- Perfect completeness of all enterprise data
- Real-time guarantees beyond what providers can support
- Context as a compliance archive

## Relation to APZQEP

Context capability changes (when engineering is authorised) follow APZQEP like any product change. These attributes inform acceptance — they are not a parallel quality system.
