# APZQEP-OES-ENG-091A

# PART 4 — API Contracts, Security & Workbench Contracts

| Item         | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-091A                                                 |
| Part         | **4 of 5**                                                          |
| Programme    | APZQEP-OES-ENG-091A                                                 |
| Status       | **IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION DECISION** |
| Architecture | APZQEP-ARCH-016 Parts 4–5 — authoritative                           |

---

## 1. API contracts

### 1.1 Base path

```text
/api/v1/qep/evidence
```

Consistent with QEP REST patterns. Exact OpenAPI artefacts **SHALL** be produced in Engineering — this OES locks resources, verbs, authz, validation, and envelopes.

### 1.2 Resources

| Method   | Path                                                | Purpose                                      | Typical permission                    |
| -------- | --------------------------------------------------- | -------------------------------------------- | ------------------------------------- |
| `POST`   | `/api/v1/qep/evidence`                              | captureEvidence (multipart or staged upload) | `qep.evidence.create`                 |
| `GET`    | `/api/v1/qep/evidence`                              | listEvidence                                 | `qep.evidence.read`                   |
| `GET`    | `/api/v1/qep/evidence/{id}`                         | getEvidence (+ availableActions)             | `qep.evidence.read`                   |
| `GET`    | `/api/v1/qep/evidence/{id}/content`                 | downloadEvidence                             | `qep.evidence.download`               |
| `POST`   | `/api/v1/qep/evidence/{id}/actions/{action}`        | lifecycle commands                           | Action-specific                       |
| `POST`   | `/api/v1/qep/evidence/{id}/relationships`           | associateEvidence                            | `qep.evidence.associate`              |
| `GET`    | `/api/v1/qep/evidence/{id}/relationships`           | list relationships                           | `qep.evidence.read`                   |
| `GET`    | `/api/v1/qep/evidence/{id}/provenance`              | provenance                                   | `qep.evidence.read`                   |
| `GET`    | `/api/v1/qep/evidence/{id}/audit`                   | audit (gated)                                | `qep.evidence.audit`                  |
| `POST`   | `/api/v1/qep/evidence/{id}/verify`                  | verifyIntegrity                              | `qep.evidence.verify`                 |
| `POST`   | `/api/v1/qep/evidence/access-checks`                | checkEvidenceAccess                          | service / `qep.evidence.access_check` |
| `POST`   | `/api/v1/qep/evidence/collections`                  | createCollection                             | `qep.evidence.collection.manage`      |
| `GET`    | `/api/v1/qep/evidence/collections/{id}`             | getCollection                                | `qep.evidence.read`                   |
| `POST`   | `/api/v1/qep/evidence/collections/{id}/members`     | add/remove                                   | `qep.evidence.collection.manage`      |
| `POST`   | `/api/v1/qep/evidence/collections/{id}/seal`        | sealCollectionAsSet                          | `qep.evidence.seal`                   |
| `GET`    | `/api/v1/qep/evidence/sets/{id}`                    | getEvidenceSet                               | `qep.evidence.read`                   |
| `POST`   | `/api/v1/qep/evidence/{id}/access-grants`           | grantAccess                                  | `qep.evidence.admin`                  |
| `DELETE` | `/api/v1/qep/evidence/{id}/access-grants/{grantId}` | revokeAccess                                 | `qep.evidence.admin`                  |

`{action}` keys **SHALL** match: `validate`, `classify`, `requestReview`, `approve`, `reject`, `quarantine`, `seal`, `replaceContent`, `applyLegalHold`, `releaseLegalHold`, `archive`, `dispose`.

### 1.3 Request / response models (logical)

**Capture request:** projectId, workspaceId?, classification?, source, mediaType, content (bytes or upload session id), optional initial relationships.

**Evidence DTO:** id, status, classification, source, integrity summary (algorithm, hash, sealed, verificationState), ownership, retention (incl. legalHold), version, revision, timestamps, `availableActions[]`.

**Access check request:** evidenceId, action (`view_metadata` \| `download` \| `associate` \| …), principal (from auth context).

**Access check response:** `{ outcome: "allowed" | "denied", reasonCode? }` — never omit outcome; consumers treat anything other than `allowed` as deny.

Mutating requests **SHALL** include `revision` except create.

### 1.4 Request context

Every request **SHALL** carry / resolve: auth token, correlation id, org/tenant, workspace/project, locale, timezone (Document 010).

### 1.5 Response envelope

Standard APZHUB envelope: data + meta (correlation id, revision). Errors: typed category + safe message + correlation id — **no** storage/backend leakage.

### 1.6 Error categories

| Category              | HTTP guidance                                        |
| --------------------- | ---------------------------------------------------- |
| `validation`          | 400                                                  |
| `unauthenticated`     | 401                                                  |
| `forbidden`           | 403                                                  |
| `not_found`           | 404 (also for existence-hiding when policy requires) |
| `conflict`            | 409                                                  |
| `precondition_failed` | 412 / 422                                            |
| `integrity_failed`    | 409 / 422                                            |
| `gone`                | 410 (disposed content)                               |

### 1.7 Validation rules (highlights)

- Content size limits per classification policy
- mediaType allow-list (Engineering config)
- classification enum validation
- dispose requires confirm flag + reason
- legal hold requires reason
- relationship targetCapability allow-list

---

## 2. Security engineering specification

### 2.1 Permission catalogue (normative strings)

| Permission                       | Use                       |
| -------------------------------- | ------------------------- |
| `qep.evidence.read`              | View metadata in scope    |
| `qep.evidence.create`            | Capture                   |
| `qep.evidence.download`          | Content retrieval         |
| `qep.evidence.associate`         | Relationships             |
| `qep.evidence.classify`          | Classification            |
| `qep.evidence.review`            | Approve/reject/quarantine |
| `qep.evidence.seal`              | Seal / seal set           |
| `qep.evidence.hold`              | Legal hold apply/release  |
| `qep.evidence.archive`           | Archive                   |
| `qep.evidence.dispose`           | Disposition               |
| `qep.evidence.verify`            | Integrity verify          |
| `qep.evidence.audit`             | Audit query               |
| `qep.evidence.access_check`      | Machine access-check API  |
| `qep.evidence.collection.manage` | Collections               |
| `qep.evidence.admin`             | Grants / privileged ops   |

### 2.2 Fail-closed / default-deny (mandatory — L-02)

```text
ONLY outcome === "allowed" GRANTS ACCESS
missing grant → DENY
indeterminate → DENY
error → DENY
null checker → DENY
```

`EvidenceAccessPolicyService` **SHALL** implement this invariant. Unit tests **SHALL** cover each deny path (see Part 5).

### 2.3 Zero Trust controls

- Authenticate every request
- Authorise every command/query/download
- Validate every payload
- Absolute tenant isolation
- Ownership / project scope checks
- EvidenceReference validation (id format + optional hash echo)
- Rate-limit at gateway
- No secrets or content bytes in logs
- Superadmin is explicit tier, not bypass
- Secure download only via authorised paths

### 2.4 Security invariants

1. Cross-tenant read/write impossible by construction.
2. Download without `qep.evidence.download` **and** ACL allow ⇒ deny.
3. Disposed content ⇒ deny download (`gone`).
4. Integrity failed ⇒ deny download.
5. Access checks never default-allow.

---

## 3. Workbench contracts

### 3.1 Nature

Presentation only. No business rules. Actions from `availableActions` only.

### 3.2 Surfaces (contractual)

| Surface          | Behaviour                                                  |
| ---------------- | ---------------------------------------------------------- |
| Explorer         | List/filter by project, status, classification, source     |
| Detail           | Metadata, integrity status, retention/hold, actions        |
| Preview          | Safe preview when mediaType supported and download allowed |
| Timeline         | Lifecycle + provenance                                     |
| Relationships    | Graph/list of associations                                 |
| Collection / Set | Membership; seal action when available                     |
| Audit            | Permission-gated                                           |

### 3.3 Design System / a11y

Tokens only; shared UI library; Lucide icons; WCAG AA. Deep links: `/qep/evidence/{id}` (exact route Eng wave).

### 3.4 Error / conflict UX

Surface typed errors; revision conflicts prompt refresh; deny states do not reveal unauthorized existence when policy requires.

---

## STOP

```text
PART-04 COMPLETE — API and security contracts locked
NO ENDPOINT IMPLEMENTATION
```
