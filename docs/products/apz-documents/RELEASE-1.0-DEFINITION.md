# APZ Documents — Release 1.0 Definition

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Lifecycle phase:** Commercial Planning  
> **Standard:** [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-19  
> **Target SemVer (naming only):** **1.0.0** — not authorised until Owner Acceptance of a future certification/release programme

---

## 1. Product identity

| Field                               | Value                                                                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-facing name                    | **APZ Documents**                                                                                                                                           |
| Purpose                             | Enterprise document metadata, versions, organisation, and discovery inside APZHUB                                                                           |
| Commercial role                     | Suite productivity product ([Commercial Catalogue](../../product-management/COMMERCIAL-PRODUCT-CATALOGUE.md) · [Portfolio](../APZHUB-PRODUCT-PORTFOLIO.md)) |
| Platform capability                 | **Documents** (native SoR — APZDOCS-001…006)                                                                                                                |
| Primary storage model               | Platform Document Core + Persistence + Storage Coordinator (filesystem / S3-compatible / memory)                                                            |
| External DMS provider (Release 1.0) | **None** — **no Paperless-ngx adapter** on disk; Paperless **out of scope** for Release 1.0                                                                 |
| User-facing surfaces                | Workbench `/workspace/documents` · HTTP `/api/v1/documents`                                                                                                 |
| Request path                        | Module → Gateway → Auth → Authz → Platform Document Services → Core / Persistence / Storage                                                                 |

---

## 2. Release 1.0 intent

Deliver the first **commercial APZ Documents product SemVer (1.0.0)** that packages the existing certified Platform Documents vertical as a named commercial product — with APZHUB branding, permission-driven Workbench, and documented limitations — without introducing Paperless or expanding beyond the APZDOCS architecture freeze.

Release 1.0 is a **commercial packaging / certification** outcome of an already-shipped platform capability, not a greenfield Documents Platform build.

---

## 3. Target users (Release 1.0)

| Persona                  | Primary use                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Knowledge workers        | Browse / organise document metadata · folders · tags · collections                         |
| Project teams            | Attach document context to project work (cross-product; limited wiring)                    |
| Legal / practice staff   | Shared document plane patterns (Law consumes Documents patterns; Law app remains separate) |
| Managers                 | Governance posture · retention / classification visibility                                 |
| Compliance               | Audit-oriented metadata · permissioned access · retention descriptors                      |
| Administrators           | Permissions · health/diagnostics · storage provider configuration (refs)                   |
| Integrators / developers | Typed HTTP client · OpenAPI · search publication consumers                                 |

---

## 4. In scope (Release 1.0)

### 4.1 Foundation capabilities (already on disk — productise / package)

| Capability                             | Description                         | Disk evidence                                                                                               |
| -------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Document metadata SoR**              | Canonical document records          | `@apzhub/document-contracts` **0.3.0** · `document-core` **0.3.0** · `document-persistence` **0.2.0**       |
| **Versions (descriptors)**             | Version metadata lifecycle          | Document vertical certification                                                                             |
| **Folders / collections / tags**       | Organisation                        | Workbench manifests · platform services                                                                     |
| **Classification / archive / restore** | Lifecycle actions (metadata plane)  | `/api/v1/documents/*`                                                                                       |
| **Retention descriptors**              | Retention metadata                  | APZDOCS surfaces                                                                                            |
| **Permissions**                        | `document.*` AuthZ                  | [Document Permissions](../../architecture/APZHUB-Platform-Document-Permissions.md)                          |
| **HTTP API**                           | Versioned REST                      | `/api/v1/documents` · OpenAPI platform spec                                                                 |
| **Workbench**                          | Permission-driven UI                | `/workspace/documents`                                                                                      |
| **Typed client**                       | HTTP-only client                    | `apps/web` documents client                                                                                 |
| **Storage coordinator**                | CE/self-hosted providers            | `@apzhub/document-storage` **0.1.0** (filesystem · S3-compatible · memory)                                  |
| **Search publication**                 | Documents search entity publication | `@apzhub/search-documents` **0.1.0** (Search Publication frozen)                                            |
| **Vertical certification**             | PRWL baseline                       | [APZDOCS-006 Vertical Certification](../../architecture/APZHUB-Platform-Document-Vertical-Certification.md) |

### 4.2 Commercial Release 1.0 deliverables (planned — not authorised by this programme)

| Deliverable                                 | Description                                       | Disk today                                        |
| ------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| **Commercial SemVer packaging**             | `docs/releases/documents/1.0.0/` evidence pack    | **Absent**                                        |
| **Product RELEASES.md / catalogue updates** | Commercial catalogue · portfolio release register | Partial (portfolio Definition Pack only)          |
| **Product certification report**            | APZ-DOCUMENTS-002-style certification             | **Absent** as commercial programme                |
| **Known Limitations (Release 1.0.0)**       | Product-facing KL for SemVer                      | Planning KL in this pack; SemVer KL folder absent |
| **Operational readiness confirmation**      | Ops checklist for commercial GA claim             | Partial (platform ops; commercial pack absent)    |

---

## 5. Non-goals / boundary (mandatory)

| Adjacent capability     | Relationship to APZ Documents 1.0                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Paperless-ngx**       | Planned in OSS catalogue historically — **not** Release 1.0; **no adapter** on disk                                      |
| Platform Search engine  | Documents registers/publishes via Search Publication — does **not** own a standalone search UI/engine                    |
| Platform Workflow       | May reference documents in automations later — **not** required for Documents 1.0 packaging                              |
| Platform Analytics      | May report on document metrics later — **not** Documents 1.0 scope                                                       |
| Identity Administration | AuthN/AuthZ consumed; Documents does not replace BetterAuth / PermissionService                                          |
| Law Platform documents  | Law has its own document surfaces; commercial APZ Documents is the **platform** product — Law remains a separate product |
| Binary content plane    | Uploads/downloads/OCR/preview/editing are **certified non-goals** of APZDOCS freeze                                      |

---

## 6. Known exclusions (Release 1.0)

Explicitly **out of scope** for commercial Release **1.0.0**:

- Paperless-ngx (or any external DMS) adapter / SSO / sync
- End-user uploads · downloads · binary transfer as product features
- OCR · AI classification · semantic AI assistants
- In-app document preview · rich editing · version binary comparison
- Email ingest · Event Bus redesign · dedicated Documents workers / realtime collab
- Azure Blob / Google Cloud Storage as certified providers (APZDOCS storage cert: CE/self-hosted only)
- Breaking the APZDOCS architecture freeze without ADR + Owner
- Claiming a “full DMS” experience beyond the metadata-first certified plane

---

## 7. Deployment & licensing (commercial framing)

| Field            | Release 1.0 posture                                 |
| ---------------- | --------------------------------------------------- |
| Deployment       | Self-hosted APZHUB (Documents native)               |
| Licensing        | Commercial APZHUB Documents (bundled suite posture) |
| External OSS DMS | Not required for Release 1.0                        |
| Prices           | None in-repo                                        |

---

## 8. Architecture note (documentation only)

Release 1.0 **documents** the commercial packaging of the frozen APZDOCS vertical. It does **not** create ADRs and does **not** change frozen architecture.

Any expansion beyond APZDOCS-005/006 certified non-goals requires **separate ADR + Owner Approval** programmes.

---

## 9. Success criteria (Release 1.0 — when eventually packaged)

1. Users operate Documents only via APZHUB Workbench / Platform HTTP (no external DMS brand).
2. All traffic Module → Gateway → Platform Service → Core/Persistence/Storage.
3. Permissions filter navigation and document actions.
4. Certification evidence under `docs/releases/documents/1.0.0/` (future programme).
5. Known Limitations honest about metadata-first / non-goals.
6. QA-002 PRODUCTION READY retained; APZDOCS freeze respected.
7. Alignment documented with Identity, Workflow, Analytics, Search, Integration (see [PLATFORM-ALIGNMENT.md](./PLATFORM-ALIGNMENT.md)).

---

## Related

- [FEATURE-CATALOGUE.md](./FEATURE-CATALOGUE.md)
- [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
- Prior portfolio pack: [documents/](../documents/README.md)
