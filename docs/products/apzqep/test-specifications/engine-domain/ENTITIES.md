# Entities — APZQEP-ENG-050A

## SpecificationRecord

Identity and business content: id (`tsp_*`), number, title, description, objective, scope, status, version, type, priority, complexity, classification, owner, author, reviewer, preconditions, postconditions, acceptance criteria, risks, dependencies, tags, authoritativeness, predecessor/successor ids, comparison notes.

## SpecificationMetadata

Frozen map of string key/value attributes (max 64 entries). Merged only while Draft.

## SpecificationHistory

Append-only `{ at, by, kind, summary }` entries. Never rewritten.

## SpecificationRelationship

Reference-only link (`tsr_*`) to Requirements, Trace Links, Verification, future Cases/Suites/Executions/Evidence, or external references. Cannot reference self. Unique per `(kind, artefactId)`.

## SpecificationApproval

Governance decision record: `approved` | `rejected`, actor, timestamp, review/approval comments. Rejection requires a comment.
