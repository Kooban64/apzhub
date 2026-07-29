# Repository Standards — APZ Engineering Lifecycle Standard v1.0

| Field              | Value                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Document           | **REPOSITORY-STANDARDS**                                                                                                 |
| Standard           | APZ Engineering Lifecycle Standard **v1.0**                                                                              |
| Status             | Normative for programmes adopting this lifecycle                                                                         |
| Complements        | `docs/operations/BRANCHING-AND-VERSIONING.md` · `docs/operations/RELEASE-MANAGEMENT-STANDARD.md` · OES trilogy / OES-003 |
| Normative language | **SHALL** / **MUST** · **SHOULD** · **MAY**                                                                              |

---

## 1. Purpose

Define repository conventions for versioning, changelogs, evidence, packages, release artefacts, and tagging so every capability programme leaves a durable, auditable trail — independent of which APZOR product is delivering.

---

## 2. Versioning

### 2.1 SemVer

Capability packages **SHALL** use Semantic Versioning `MAJOR.MINOR.PATCH` with optional pre-release suffix (`-rc.N`, `-hotfix.N`).

| Change                                                   | Version impact                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| Breaking public contract                                 | MAJOR                                                                      |
| Backward-compatible feature (Owner-authorised)           | MINOR                                                                      |
| Backward-compatible fix (Owner-authorised hotfix)        | PATCH                                                                      |
| Certification packaging / metadata-only (CERT packaging) | **SHOULD NOT** bump solely for docs; align when Owner authorises promotion |

### 2.2 Maturity alignment

| Maturity                               | Typical version     | Notes                         |
| -------------------------------------- | ------------------- | ----------------------------- |
| Component certified (single layer)     | `0.x.y` common      | Class must name the layer     |
| Capability certified / Freeze eligible | `1.0.0` typical     | Owner Decision required       |
| Frozen baseline                        | Exact frozen SemVer | Patch line `X.Y.x` thereafter |
| RC before production release           | `X.Y.Z-rc.N`        | Promote to `X.Y.Z` at Release |

### 2.3 Authority to bump

Agents **SHALL NOT** silently promote to `1.0.0` or change MAJOR without Owner Decision. Working versions during Waves **MAY** remain pre-1.0.0 until Certification / Version Promotion.

### 2.4 Monorepo coordination

- Version the **capability package** that owns the baseline (e.g. `@apzhub/qep-test-execution`).
- Dependent workspace packages **SHOULD** be updated only as required by the authorised programme.
- Platform portfolio versions (e.g. Platform `1.2.0`) are separate from capability package SemVer.

---

## 3. Changelog

### 3.1 Locations

| Scope                          | Path                                                                  |
| ------------------------------ | --------------------------------------------------------------------- |
| Product portfolio              | `docs/products/{{PRODUCT_SLUG}}/CHANGELOG.md`                         |
| Capability (optional deep log) | Programme pack or package `CHANGELOG.md` if product practice requires |
| Platform                       | Platform release notes under `docs/releases/platform/`                |

### 3.2 Entry requirements

Each Accepted baseline / Release **SHALL** add a changelog entry including:

1. Date (UTC) and programme id
2. Package name + SemVer
3. Git tag (if any)
4. Lifecycle stage outcome (e.g. CERTIFIED, FROZEN, RELEASED)
5. Availability posture if Release
6. Pointers to pack path + evidence id
7. Material limitations / GA blockers (summary)

### 3.3 Style

- Newest entries at top
- Imperative or factual bullets; no marketing fluff
- Do not delete historical entries

---

## 4. Evidence under `docs/operations/evidence/`

### 4.1 Root

```text
docs/operations/evidence/
  {{EVIDENCE_SUBDIR}}/
    README.md                      # optional index
    YYYYMMDDTHHMMSSZ-{{PROGRAMME_ID}}.json
    YYYYMMDDTHHMMSSZ-{{PROGRAMME_ID}}-ACCEPTANCE.json
```

### 4.2 Subdirectory selection

| Prefer                                                         | When                                   |
| -------------------------------------------------------------- | -------------------------------------- |
| Existing portfolio/product subdir (e.g. `portfolio-recert/`)   | Product already indexes evidence there |
| `{{PRODUCT_SLUG}}/` or `{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/` | Starting a clean product tree          |
| Programme-specific subdir                                      | Owner Instruction mandates isolation   |

Do **not** leave evidence JSON loose at `docs/operations/evidence/` root without an index.

### 4.3 Naming

```text
{{EVIDENCE_ID}} = YYYYMMDDTHHMMSSZ-{{PROGRAMME_ID}}
```

Acceptance / Decision files append `-ACCEPTANCE` (or `-DECISION`).

### 4.4 Content rules

1. Valid JSON only
2. No secrets, tokens, connection strings, credentials, or PII
3. Repo-relative paths
4. `status` / `decision` strings match Markdown packs exactly
5. Schema guidance: [templates/EVIDENCE-PACK.json.md](./templates/EVIDENCE-PACK.json.md)

### 4.5 Minimum evidence pair

| Stage completion            | Owner Decision                         |
| --------------------------- | -------------------------------------- |
| `...-{{PROGRAMME_ID}}.json` | `...-{{PROGRAMME_ID}}-ACCEPTANCE.json` |

Waves, ECR, CERT, Freeze, and Release **SHALL** produce at least the implementation evidence file before Owner Decision; acceptance file **SHALL** be written when Owner Decision is recorded (by Owner or by agent under Owner Instruction to record a stated Decision).

---

## 5. Package conventions

### 5.1 Naming

| Item                    | Convention                                        | Example                      |
| ----------------------- | ------------------------------------------------- | ---------------------------- |
| npm / workspace package | `@apzhub/{{product-short}}-{{capability-kebab}}`  | `@apzhub/qep-test-execution` |
| Product slug            | lowercase, no spaces                              | `apzqep`                     |
| Capability slug         | kebab-case                                        | `test-execution`             |
| Programme ids           | `{{PRODUCT}}-{{TYPE}}-{{NNN}}{{OPTIONAL_LETTER}}` | `APZQEP-ENG-100A`            |

### 5.2 Layout (capability)

Follow Module / Service / Integration SDK manifests where code exists. Documentation packs live under:

```text
docs/products/{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/
  {{PROGRAMME_FOLDER}}/     # ARCH, OES, ENG-WAVES, ECR, CERT, FREEZE, RELEASE, …
```

### 5.3 Public surface

New public exports, REST resources, and manifests introduced in a Wave **SHALL** be documented in that Wave’s pack before Owner Review.

### 5.4 Frozen packages

After Freeze Acceptance:

- Treat `{{PACKAGE_NAME}}@{{VERSION}}` as immutable baseline
- Changes require new Owner-authorised programme (hotfix / minor / major)
- Do not edit frozen release mirrors to rewrite history; add errata / new version docs instead

---

## 6. Release artefacts under `docs/releases/`

### 6.1 Path pattern

```text
docs/releases/
  {{PRODUCT_SLUG}}/
    {{CAPABILITY_SLUG}}/
      {{VERSION}}/
        README.md
        (pointers or copies of release governance artefacts)
      {{VERSION}}-rc.{{N}}/          # optional RC mirror
```

Example: `docs/releases/apzqep/test-execution/1.0.0/`

Platform-wide releases **MAY** use `docs/releases/platform/{{VERSION}}/` per existing platform practice.

### 6.2 Minimum README fields

Release mirror `README.md` **SHALL** state:

| Field         | Example                             |
| ------------- | ----------------------------------- |
| Package       | `@apzhub/qep-test-execution`        |
| Version       | `1.0.0`                             |
| Git tag       | `apzqep-test-execution-v1.0.0`      |
| Programme     | `APZQEP-RELEASE-001`                |
| Class         | `PRODUCTION_READY_WITH_LIMITATIONS` |
| Availability  | `LIMITED_AVAILABILITY_APPROVED`     |
| Evidence ids  | implementation + acceptance         |
| Pack pointers | `docs/products/.../RELEASE-001/`    |

### 6.3 What belongs in the mirror

- Catalogue of release governance docs (notes, handover, limitations, risks, traceability)
- Baseline confirmation
- Links to CERT / FREEZE Owner Decisions

Prefer **pointers** to programme packs over duplicating large files; duplicate only when product practice requires a self-contained release bundle.

### 6.4 RC vs final

| Artefact tree           | When                                                    |
| ----------------------- | ------------------------------------------------------- |
| `{{VERSION}}-rc.{{N}}/` | Release candidate governance                            |
| `{{VERSION}}/`          | Production baseline after promotion / Release programme |

---

## 7. Tagging strategy

### 7.1 Capability-scoped tags (normative)

Production capability baselines **SHALL** use annotated git tags of the form:

```text
{{product_slug}}-{{capability_slug}}-v{{MAJOR}}.{{MINOR}}.{{PATCH}}
```

**Example:** `apzqep-test-execution-v1.0.0`

| Segment           | Rule                                             |
| ----------------- | ------------------------------------------------ |
| `product_slug`    | lowercase product id (`apzqep`, `apztcms`, …)    |
| `capability_slug` | kebab-case capability                            |
| `v` + SemVer      | Matches package.json / workspace version exactly |

### 7.2 Optional variants

| Kind               | Pattern                                                                                 | Example                             |
| ------------------ | --------------------------------------------------------------------------------------- | ----------------------------------- |
| RC                 | `...-v{{VERSION}}-rc.{{N}}` with tag `{{product}}-{{capability}}-v{{VERSION}}-rc.{{N}}` | `apzqep-test-execution-v1.0.0-rc.1` |
| Hotfix             | same pattern at patch bump                                                              | `apzqep-test-execution-v1.0.1`      |
| Platform portfolio | `platform-v{{VERSION}}` or existing platform convention                                 | per platform release docs           |

Do **not** use ambiguous bare `v1.0.0` for capability baselines in a multi-capability monorepo.

### 7.3 Tag operations

1. Tags **SHALL** be annotated (message includes programme id + package + version).
2. Create tags only when Owner Instruction / Availability Decision authorises tag operations.
3. Tags **SHOULD** be immutable; moving tags requires Owner Decision and an audit note.
4. Record tag name in Release Report, evidence JSON (`git.tag`), changelog, and Standing Record.
5. Verify with `git rev-parse '{{TAG}}^{}'` before declaring release verification PASS.

### 7.4 Branching (summary)

Follow `docs/operations/BRANCHING-AND-VERSIONING.md`. Lifecycle programmes **SHOULD** keep work reviewable; do not rewrite shared main history. Freeze / Release verification **SHALL** identify the commit that the tag points to.

---

## 8. Programme pack hygiene

Every Owner-authorised programme **SHALL** produce:

| Artefact                                         | Required                                                    |
| ------------------------------------------------ | ----------------------------------------------------------- |
| README index                                     | Yes                                                         |
| Owner Instruction (or Cursor directive instance) | Yes                                                         |
| Completion / stage report                        | Yes                                                         |
| Deviation register (empty allowed)               | Yes                                                         |
| Evidence JSON                                    | Yes                                                         |
| Owner Summary + Decision/Acceptance template     | Yes                                                         |
| Validation report                                | Wave / ECR / CERT / Release — Yes                           |
| Conformance matrix                               | Wave / ECR / CERT — Yes                                     |
| Risk register                                    | When residual risk exists; Release/CERT — Yes even if empty |

Templates: [templates/](./templates/)

---

## 9. Index updates (definition of repository complete)

After programme completion (and again after Owner Decision), update as applicable:

| Index                                                       | When                                             |
| ----------------------------------------------------------- | ------------------------------------------------ |
| Product Standing Programme Record                           | Always for product programmes                    |
| Product CHANGELOG                                           | Baseline / version / release changes             |
| `docs/foundation/AI-MANIFEST.md`                            | When it governs agent bootstrap for that product |
| `docs/foundation/CURRENT-STATE.md` / `CURRENT-MILESTONE.md` | When product practice requires                   |
| Owner Acceptance Register                                   | On Owner Decision                                |
| `docs/operations/evidence/.../README.md`                    | When subdir maintains an index                   |
| `docs/releases/.../README.md`                               | On Release                                       |

---

## 10. Secrets & safety

- **SHALL NOT** commit secrets, `.env` production values, keys, or tokens
- Evidence and release docs **SHALL** mask sensitive operational data
- Host coexistence constraints in `ENVIRONMENT.md` remain in force for runtime work

---

## 11. Relationship to other standards

| Standard                    | Relationship                                                        |
| --------------------------- | ------------------------------------------------------------------- |
| OES-003 / Build Contract    | Governs Engineering Wave behaviour; this doc governs repo artefacts |
| Platform Delivery Standard  | Still applies to platform capability programmes where cited         |
| BRANCHING-AND-VERSIONING    | Detailed git workflow; capability tag pattern here is additive      |
| Lifecycle Cursor directives | Agents must obey both stage mode and these repository rules         |

On conflict about **lifecycle stage authority**, Lifecycle Standard + Owner Instruction prevail. On conflict about **git host mechanics**, operations branching docs prevail unless Owner Instruction states otherwise.

---

## STOP

```text
REPOSITORY STANDARDS
APZ ENGINEERING LIFECYCLE STANDARD v1.0
EVIDENCE → docs/operations/evidence/
RELEASES → docs/releases/{{product}}/{{capability}}/{{version}}/
TAGS → {{product}}-{{capability}}-v{{semver}}
NO SILENT 1.0.0 PROMOTION
```
