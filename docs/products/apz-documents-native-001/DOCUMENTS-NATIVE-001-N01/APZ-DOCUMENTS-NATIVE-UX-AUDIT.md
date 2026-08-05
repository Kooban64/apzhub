# APZ Documents — Native UX Audit (Gap Register)

| Field       | Value                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Slice       | **APZ-DOCUMENTS-NATIVE-001-N01**                                                                                              |
| Status      | **COMPLETE** (analysis only)                                                                                                  |
| Timestamp   | 20260805T141500Z                                                                                                              |
| Method      | Static review of Documents UI/lib, manifests, workbench mount, document contracts; compared to Time/Support/Projects after RI |
| Engineering | **None** — no code changes in this slice                                                                                      |
| Mission     | [../../apzdocuments/PRODUCT-MISSION.md](../../apzdocuments/PRODUCT-MISSION.md) **APPROVED**                                   |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                                            |

## Objective

Determine whether APZ Documents already behaves like a native APZHUB product while preserving document ownership boundaries and supporting the enterprise work model.

**Central audit question:** When a user wants a document, do they start with the **work**, or with the **repository**?

## Classification legend

| Class                 | Meaning                                                       |
| --------------------- | ------------------------------------------------------------- |
| **Already Compliant** | Meets native APZHUB product contract today                    |
| **Native**            | APZHUB-owned surface; may need polish but no engine leak      |
| **Wrapper**           | Thin shell; feels incomplete / not first-class                |
| **Engine Leak Risk**  | User could infer or see engine/adapter identity — defect risk |
| **Requires Redesign** | Must change for first-class APZHUB experience                 |

**Engine leak test:** Could a user tell which implementation engine exists? If yes → defect.

## Scope inventory (user-facing routes)

Base: `/workspace/documents` via `DocumentsWorkspaceRouter` in `workbench-page.tsx` → `DesktopShell`.

| Route                                | View          | Present                         |
| ------------------------------------ | ------------- | ------------------------------- |
| `/workspace/documents` / `overview`  | Overview      | Yes                             |
| `/workspace/documents/documents`     | Documents     | Yes                             |
| `/workspace/documents/versions`      | Versions      | Yes                             |
| `/workspace/documents/collections`   | Collections   | Yes                             |
| `/workspace/documents/folders`       | Folders       | Yes                             |
| `/workspace/documents/tags`          | Tags          | Yes                             |
| `/workspace/documents/relationships` | Relationships | Yes                             |
| `/workspace/documents/retention`     | Retention     | Yes                             |
| `/workspace/documents/audit`         | Audit         | Yes                             |
| `/workspace/documents/diagnostics`   | Diagnostics   | Yes                             |
| `/workspace/documents/metadata`      | Metadata      | Yes                             |
| Help / Settings / Onboarding         | —             | **No**                          |
| Upload / binary viewer / preview     | —             | **No** (explicit metadata-only) |

Activity Bar label: **Documents** (`platform-documents` module). Command: **Go to Documents**.

Law Platform has a **separate** Documents module under `/workspace/law/documents` — out of this product’s native chrome but noted as portfolio adjacency.

---

## Gap register

| ID   | Area                        | Current                                                                                   | Target                                                               | Gap / notes                                            | Class             | Engine leak? | Priority | Feeds   |
| ---- | --------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ | ----------------- | ------------ | -------- | ------- |
| G-01 | Branding / product name     | Eyebrow **Documents**; copy **Document Platform** / **Shared Document Platform**          | Consistent **APZ Documents**                                         | Commercial/product name absent from UI                 | Wrapper           | No           | High     | N-03    |
| G-02 | Branding / engine marks     | No Paperless / Paperless-ngx strings in `apps/web` Documents UI                           | Keep zero engine marks                                               | Compliant for named engines                            | Already Compliant | No           | —        | —       |
| G-03 | Error copy                  | `toDocumentUserMessage` — auth/permission/not found; may pass through raw `Error.message` | Sanitised APZHUB messages only                                       | Weaker than Projects sanitizer                         | Native            | Low risk     | Medium   | N-03    |
| G-04 | Diagnostics panel           | Renders raw key/value including `providerId`, `providerKind`, `providerReady`             | Operator-only; APZHUB framing; no storage provider IDs for end users | Provider identity exposed                              | Engine Leak Risk  | **Yes**      | High     | N-03    |
| G-05 | Storage technical metadata  | Checksum, bytes, MIME, `storageKeyPresent`, storage status in detail panels               | Product language; admin-gate deep storage                            | Feels repository/ops, not work                         | Wrapper           | Low          | Medium   | N-03    |
| G-06 | Shell integration           | Mounted in `DesktopShell` via WorkbenchPage                                               | Peer workspace                                                       | Compliant                                              | Already Compliant | No           | —        | —       |
| G-07 | Navigation (manifest)       | Activity Bar + sidebar modules for all sections                                           | Manifest-driven primary nav                                          | Aligned                                                | Already Compliant | No           | —        | —       |
| G-08 | Breadcrumbs                 | None — page eyebrow only                                                                  | APZ Documents → section → entity                                     | Missing vs Time/Support/Projects                       | Requires Redesign | No           | High     | N-03    |
| G-09 | Help                        | Absent                                                                                    | APZHUB-only help                                                     | Missing                                                | Requires Redesign | No           | Medium   | N-03    |
| G-10 | Settings                    | Absent                                                                                    | Product preferences only (no engine consoles)                        | Missing                                                | Requires Redesign | No           | Low      | N-03    |
| G-11 | Onboarding                  | Absent                                                                                    | First-run guidance; work-first framing                               | Missing                                                | Requires Redesign | No           | Medium   | N-03    |
| G-12 | Empty / loading / error     | Present (“No documents found”, “Loading…”, “Unable to load documents”)                    | APZ Documents naming + work-first CTAs                               | Functional but repository-framed                       | Native            | No           | Medium   | N-03    |
| G-13 | Document context in list/UI | Metadata table; no project/ticket/evidence context columns                                | Show related work context                                            | Isolated document plane                                | Requires Redesign | No           | High     | N-03    |
| G-14 | Relationships UX            | Read-only stub: “Use product services to create relationships”                            | Work-context relationship visibility                                 | No attach journey                                      | Wrapper           | No           | High     | N-03    |
| G-15 | Attach-from-Projects        | No Documents links/API usage in Projects UI                                               | Attach document to project                                           | Repository-first only                                  | Requires Redesign | No           | High     | later\* |
| G-16 | Attach-from-Support         | Support “attachments” = ticket files, not Platform Documents                              | Attach document to ticket                                            | Separate attachment plane                              | Requires Redesign | No           | High     | later\* |
| G-17 | Attach-from-Time / APZQEP   | No Platform Documents attach; QEP uses evidence IDs                                       | Reference Documents where appropriate                                | Not wired                                              | Requires Redesign | No           | Medium   | later\* |
| G-18 | Primary mental model        | Activity Bar → Documents → browse metadata                                                | Start from work; repository as service                               | **Users start with the repository**                    | Requires Redesign | No           | Critical | N-03+   |
| G-19 | Permissions UI              | ~~No session permission hook~~                                                            | Session / PermissionService only                                     | **CLOSED** in N-02                                     | Already Compliant | No           | —        | N-02    |
| G-20 | Identity / session          | ~~Not UX-proven~~                                                                         | One APZHUB identity end-to-end                                       | **CLOSED** in N-02                                     | Already Compliant | No           | —        | N-02    |
| G-21 | SoR duplication             | Document entity holds document metadata; cross-product via `DocumentReference`            | Keep by-reference                                                    | Model compliant; UX does not exercise refs             | Already Compliant | No           | —        | —       |
| G-22 | Client relate API           | Client `RelateDocumentClientInput` lacks `reference` field vs domain/HTTP schemas         | Support product+externalId references                                | Contract gap for attach-by-reference                   | Wrapper           | No           | High     | later\* |
| G-23 | Law Documents adjacency     | Separate Law Documents module (upload placeholder)                                        | Clear product boundary; no engine leak                               | Portfolio adjacency — not platform Documents native UX | Native            | No           | Low      | note    |
| G-24 | My Work / Unified Work      | My Work has no Documents feed                                                             | Optional future composition (Lane 1 / capability)                    | Out of N-01 fix scope; alignment note only             | Native            | No           | —        | Lane 1  |
| G-25 | Enterprise capability docs  | Mission, SoR, Document Context, ECM updated                                               | Remain authoritative                                                 | Docs aligned; product experience lags                  | Already Compliant | No           | —        | —       |

\* “later” = product experience / consumer wiring — may require Owner Auth beyond presentation-only N-03 if it expands capability; **this slice records gaps only**.

---

## Area summaries

| Area                            | Result              | Detail                                      |
| ------------------------------- | ------------------- | ------------------------------------------- |
| Native Experience               | **GAPS IDENTIFIED** | Shell yes; polish/help/breadcrumbs/branding |
| Engine Leakage                  | **GAPS IDENTIFIED** | No Paperless; diagnostics `provider*` keys  |
| Document Context                | **GAPS IDENTIFIED** | Isolated metadata workbench                 |
| System of Record Boundaries     | **PASS**            | Model correct; no foreign SoR in Documents  |
| Attach-to-Work Philosophy       | **GAPS IDENTIFIED** | Repository-first starting point             |
| Enterprise Capability Alignment | **PASS**            | Mission/ECM/Playbook alignment documented   |

## Companion reports

| Report           | Path                                                           |
| ---------------- | -------------------------------------------------------------- |
| Engine leakage   | [ENGINE-LEAKAGE-REPORT.md](./ENGINE-LEAKAGE-REPORT.md)         |
| Document context | [DOCUMENT-CONTEXT-ANALYSIS.md](./DOCUMENT-CONTEXT-ANALYSIS.md) |
| SoR boundaries   | [SOR-BOUNDARY-VALIDATION.md](./SOR-BOUNDARY-VALIDATION.md)     |
| Attach-to-work   | [ATTACH-TO-WORK-ANALYSIS.md](./ATTACH-TO-WORK-ANALYSIS.md)     |
| Completion       | [COMPLETION.md](./COMPLETION.md)                               |

## Explicit non-actions (this slice)

No engineering · No UI changes · No architecture · No Playbook changes · No Lane 1 platform changes · No solutions implemented.
