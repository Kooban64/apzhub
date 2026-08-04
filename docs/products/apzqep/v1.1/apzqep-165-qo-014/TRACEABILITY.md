# Traceability Model

Every Evidence Integration Package includes an immutable `TraceabilityRecord`:

- Evidence Integration Package ID
- Artefact refs (Quality Flow → Enrichment)
- Evidence refs
- Report refs
- Audit refs
- Created timestamp
- `immutable: true`

Report views carry `traceabilityId` and `evidenceIntegrationPackageId`, enabling:

```text
Report View → Evidence Integration Package → Authoritative Artefacts → Audit Refs
```

Traceability is never rewritten; supersession creates a new package with a new record.
