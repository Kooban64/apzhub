# Relationships — APZQEP-ENG-050A

## Nature

Reference-only. The Domain never owns foreign artefacts.

## Supported kinds

`requirement` · `trace_link` · `verification` · `test_case` · `test_suite` · `execution` · `evidence` · `external_reference`

## Rules

- Relationship id: `tsr_*`
- Cannot reference the Specification’s own id
- Unique per `(kind, artefactId)` within the aggregate
- Add/remove only while Draft
- Emit `qep.specification.relationship.added` / `.removed`

## Non-ownership

Requirements, Trace Links, Verification, Cases, Suites, Executions, and Evidence remain owned by their respective capabilities. Specifications store opaque artefact ids only.
