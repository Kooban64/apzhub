# Release Notes — APZ QEP Traceability 1.0.0

> **Package:** `@apzhub/qep-traceability` **1.0.0**  
> **Module:** `qep-traceability` **1.0.0**  
> **Programme:** APZQEP-TRACE-001  
> **Date:** 2026-07-26  
> **Status:** CERTIFIED BASELINE — **AWAITING OWNER ACCEPTANCE** of TRACE-001  
> **Class:** **PRODUCTION_READY_WITH_LIMITATIONS**

## Highlights

First stable major baseline of the APZ QEP Traceability capability: Trace Links domain, platform integration, and Traceability Workbench — certified as documentation/governance promotion from **0.3.0**.

## Included capability

- **TraceLink aggregate** with 16 Trace Types and lifecycle (draft → validated → approved → retired/superseded)
- History, authority, confidence, origin, provenance, and context
- Persistence migrations **0079** / **0080** (PG + RLS); dual repositories
- REST APIs under `/api/v1/qep/traceability/*`
- Permissions `qep.traceability.*`, audit, search entity `trace_link`, observability
- Workbench: Explorer, Matrix (presentation), Inspector, History, Taxonomy, create, lifecycle
- Server-authoritative `availableActions`
- Routes under `/workspace/qep/traceability/*`

## Upstream programmes

ARCH-007 · ENG-030A Part 1 · ENG-030A Part 2 · ARCH-008 · ENG-030C — all **ACCEPTED**

## Not included

Coverage Engine · Impact Engine · Verification · Evidence · Certification Engine · AI · MCP · Graph SoR

## Upgrade notes

- Apply migrations **0079** and **0080** before relying on Trace Links persistence.
- Grant `qep.traceability.*` permissions as required.
- Requirements remains `@apzhub/qep-requirements` **1.0.0** (frozen consumer).
- From **0.3.0**: SemVer/marker promotion for certification; no breaking API redesign.

## Known limitations

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).
