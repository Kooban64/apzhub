# APZ TCMS — Future Evidence Document Consumer

**Status:** Guidance only — **not implemented**  
**Milestone reference:** APZDOCS-002 closeout

## Intent

APZ TCMS evidence (screenshots, logs, attachments) should eventually store binaries through the Document Platform so Testing owns evidence **metadata** while Documents owns durable content versions + checksums.

## Correct future path

```text
Testing Platform Service (evidence)
  → Document Platform Service / DocumentContentService
    → DocumentStorageProvider
```

Never: `testing-services` → `@apzhub/document-storage` direct.  
Never: duplicate S3 clients inside TCMS.

## Current state

- TCMS evidence uses its own storage abstraction from APZTCMS-006 era
- Document Platform gateway facets are available in-process (**APZDOCS-003**)
- No HTTP document API yet (**APZDOCS-004** — not authorised)

## Migration notes (future)

1. Map evidence blob refs → `DocumentContentVersionRecord` via gateway / future HTTP client
2. Preserve SHA-256 as platform checksum authority
3. Keep TCMS permission keys; translate to `document.storage.*` at the platform service boundary
4. Retain immutability for certified evidence packs

**Do not start TCMS↔Documents wiring without owner approval.**
