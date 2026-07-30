# REST Transport Report — APZQEP-ENG-110F

| Field            | Value                                          |
| ---------------- | ---------------------------------------------- |
| Base path        | `/api/v1/qep/evidence`                         |
| Authority        | OES-ENG-091A PART-04                           |
| Handler location | `apps/web/lib/api/v1/handlers/qep-evidence.ts` |
| Route Handlers   | `apps/web/app/api/v1/qep/evidence/`            |
| Marker           | `implemented-eng-110f`                         |

Thin Route Handlers parse and validate HTTP input, invoke the platform gateway (`PlatformServiceGateway.qep.evidence`), and return standard platform API envelopes. No business rules in transport.

## Flow

```text
HTTP Request → Route Handler → Platform API Auth/Authz → Security & Policy → Application → Domain
```

Handlers cover PART-04 resources: list/capture, detail, lifecycle actions, content, relationships, provenance, audit, verify, access-checks, collections, sets, access-grants.

Persistence for this wave uses in-memory Application ports (ADR-0088 — storage technology undecided). No SQL, storage provider SDK, authentication providers, or event publication introduced.
