# APZ Documents — Known Limitations (Release 1.0.0)

> **Product:** APZ Documents  
> **Version:** **1.0.0**  
> **Programme:** APZ-DOCUMENTS-002 (packaging) · planning APZ-DOCUMENTS-001 **ACCEPTED**  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19  
> **Authority:** [APZDOCS-006 Vertical Certification](../../architecture/APZHUB-Platform-Document-Vertical-Certification.md)

---

## Release 1.0.0 limitations

1. **Metadata-first posture** — not a full binary DMS product experience
2. **Certified non-goals:** uploads · downloads · binary transfer · OCR · AI · preview · document editing · version comparison · Documents-owned notifications · email ingest · Event Bus redesign · background workers · realtime collaboration · product consumer wiring expansions
3. **No Paperless-ngx adapter** on disk
4. **Storage providers:** filesystem · S3-compatible · memory — **not** Azure Blob / GCS as certified
5. **Playwright** historically LIMITED in vertical workbench audit — revalidate in target environments
6. **Coverage** PASS WITH LIMITATIONS per APZDOCS-006
7. **Workflow / Analytics deep product wiring** — not required for Documents 1.0.0; boundaries preserved

---

## Honesty rule

Limitations must remain visible in certification and product docs. Do not silently treat limited surfaces as complete DMS functionality.

---

## Related

- [Release Notes](../../releases/documents/APZ-DOCUMENTS-1.0-RELEASE-NOTES.md)
- [Certification Report](../../releases/documents/1.0.0/CERTIFICATION-REPORT.md)
