# Domain Model — APZQEP-ENG-050A

## Bounded context

**Test Specifications** owns the authoritative business rules for Test Specification artefacts. Spec ≠ Case ≠ Execution ≠ Verification.

## Aggregate

- **Root:** `TestSpecification`
- **Core entity:** `SpecificationRecord`
- **Supporting entities:** `SpecificationMetadata`, `SpecificationHistory`, `SpecificationRelationship`, `SpecificationApproval`

## Ownership

Owns: identity, lifecycle, versioning, metadata, classification, priority, complexity, pre/postconditions, acceptance criteria, risks, dependencies, relationships (as references), governance, policies, events, validation.

Does **not** own: Requirements, Trace Links, Verification, Test Cases, Suites, Plans, Execution, Evidence, Coverage, Impact, Certification, AI, MCP.

## Package

`@apzhub/qep-test-specifications` `0.1.0` — `packages/qep-test-specifications/src/domain/**`

Pure TypeScript. No infrastructure, persistence, React, or Next.js dependencies.
