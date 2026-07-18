# APZHUB Platform Metrics Certification Guide

**Programme:** APZMETRICS  
**Vertical certification:** APZMETRICS-005  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

## Purpose

Certify the complete Platform Metrics metadata-governance vertical without adding product capabilities.

## Command

```bash
pnpm certify:metrics-vertical
```

Composes:

1. `audit:metrics-foundation` … `audit:metrics-workbench`
2. `audit:metrics-vertical`
3. `openapi:validate:platform`
4. Vitest certification harness + regression
5. Scoped coverage gate
6. Playwright Workbench spec listing (live LIMITED if external conflict)

## Architecture under certification

```text
Workbench → Typed Client → /api/v1/metrics/* → gateway.metrics.*
→ RequestPipeline → Production Authorization
→ Platform Metrics Services → Core → Persistence → PostgreSQL
```

## Evidence pack

See `docs/reviews/APZMETRICS-005-*.md` and [Completion Report](../sprint/APZMETRICS-005-completion-report.md).

## Next

**APZMETRICS-006 — Metrics Wave Certification & Architecture Freeze** — owner approval required.
