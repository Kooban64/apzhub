# Domain Implementation — APZQEP-ENG-030A Part 1

## Package

`packages/qep-traceability` — `@apzhub/qep-traceability` **0.1.0**

## Aggregate

| Aggregate   | Module                                |
| ----------- | ------------------------------------- |
| `TraceLink` | `src/domain/trace-link/trace-link.ts` |

## Entities

| Entity        | Representation                                   |
| ------------- | ------------------------------------------------ |
| TraceLink     | Aggregate root                                   |
| TraceEndpoint | Endpoint entity (`role` + reference)             |
| TraceHistory  | Append-only `TraceHistory` / `TraceHistoryEntry` |
| TraceMetadata | Extensible string map entity                     |

## Value objects

TraceId (`trl_*`) · TraceType · TraceEndpointReference · TraceDirection · TraceScope · TraceStrength · TraceConfidence · TraceOrigin · TraceAuthority · TraceLifecycleState · TraceProvenance · TraceRationale · TraceContext

## Lifecycle

```text
draft → validated → approved → retired
                 ↘ superseded
```

No delete. No restore. History preserved.

## Trace types (normative)

Sixteen ARCH-007 types including projection (`projects_relationship`), specification, test, execution, evidence, defect, risk, verification, certification, documents, and external reference families.

## Policies (persistence-independent)

Duplicate detection · endpoint existence · authority · confidence/origin · scope · provenance · lifecycle transitions · circular traces · cross-domain ownership · historical immutability · projection-only origin · AI authority promotion · rationale requirements · future extensibility helpers

## Domain service

`validateTraceLinkStructure` · `validateTraceLinkForValidation` · `defaultStrengthForTraceType` — pure, fact-driven, no I/O.

## Domain events (builders only)

`qep.trace_link.created|validated|approved|retired|superseded|origin_changed|confidence_changed|authority_changed|scope_changed|endpoint_changed`

## Ownership boundary

Traceability owns Trace Links only. Does **not** own Requirements, Relationships, Coverage, Impact, Verification, Evidence, Certification, AI, or MCP.
