# Aggregate Design Report — APZQEP-ENG-110B

## Evidence

Transactional root. Pure command functions return new immutable instances with revision bumps and uncommitted events.

Invariants: tenant/ownership required; content implies hash metadata; sealed content immutable; legalHold blocks dispose; disposed denies content delivery.

## EvidenceCollection / EvidenceSet

Collection mutable until `sealCollectionAsSet` creates immutable EvidenceSet. Seal hash supplied externally (no crypto in Domain).

## EvidenceRelationship

Association aggregate: evidenceId ↔ target capability/id.
