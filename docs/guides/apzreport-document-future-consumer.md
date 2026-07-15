# APZREPORT — Future Document Platform Consumer

**Status:** Guidance only — **not implemented**  
**Milestone reference:** APZDOCS-002 closeout

## Intent

Platform Reporting may eventually attach generated report artifacts as Document Platform content versions (immutable PDF/HTML/CSV binaries) while keeping report **metadata** in reporting SoR.

## Correct future path

```text
Reporting Platform Service
  → Document Platform Service / DocumentContentService
    → Storage Provider
```

Never: reporting-core → document-storage provider direct.

## Constraints (current)

- APZREPORT-001–003 remain **PRODUCTION_READY_WITH_LIMITATIONS** without Document Platform wiring
- Reporting packages must not depend on `document-core` / `document-storage` / `document-persistence` today (enforced by APZDOCS-002 audit)
- No shared binary store for report generations in this milestone

## When authorised

A dedicated milestone should: define ownership (report generation id ↔ document id), permissions mapping, retention for regulated outputs, and HTTP/typed client consumption — after **APZDOCS-004** lands the Document HTTP API (gateway already available via APZDOCS-003).

**Do not start consumer integration without owner approval.**
