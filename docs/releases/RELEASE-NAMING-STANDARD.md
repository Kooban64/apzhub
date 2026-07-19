# Release Naming Standard

> **Classification:** Documentation only  
> **Related:** [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md) · [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md) · Document 015

---

## Semantic Versioning

Publishable packages and release tags use **SemVer**: `MAJOR.MINOR.PATCH`.

| Bump      | Meaning                        |
| --------- | ------------------------------ |
| **MAJOR** | Breaking public API / contract |
| **MINOR** | Backward-compatible feature    |
| **PATCH** | Backward-compatible fix        |

Pre-release suffixes (optional): `-alpha.N`, `-beta.N`, `-rc.N`.

---

## Product versioning

| Rule            | Detail                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------- |
| Source of truth | Owner-accepted Product Release evidence + disk packages touched                               |
| Label form      | Product name + SemVer when declared, e.g. `APZ Projects 1.1.0`                                |
| Until declared  | Cite programme baseline (e.g. APZHUB-PROJECTS-001 Phase 1) — do not invent marketing versions |
| Engines         | Never used as user-facing product versions                                                    |
| Evidence        | Product `RELEASES.md` and/or `docs/releases/` note                                            |

---

## Platform versioning

| Artefact          | Form                               | Example                                               |
| ----------------- | ---------------------------------- | ----------------------------------------------------- |
| Git release tag   | `vMAJOR.MINOR.PATCH`               | `v1.2.0`                                              |
| Workspace root    | Root `package.json` version        | `0.1.0-foundation` until advanced by Platform Release |
| Package           | `@apzhub/<name>@x.y.z`             | `@apzhub/integration-sdk@1.0.0`                       |
| Release note file | Descriptive under `docs/releases/` | `APZHUB-Integration-SDK-v1.0.0-Release-Notes.md`      |

Frozen packages: MAJOR (or any public break) requires ADR + Owner.

---

## Release Candidate naming

| Artefact              | Form                         |
| --------------------- | ---------------------------- |
| Branch                | `release/x.y.z`              |
| Pre-release version   | `x.y.z-rc.N` (N starts at 1) |
| Tag (optional RC tag) | `vx.y.z-rc.N`                |

RC is not production until Owner release approval and final `vx.y.z` tag (without `-rc`).

---

## Hotfix naming

| Artefact | Form                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| Branch   | `hotfix/x.y.z` (target PATCH)                                                            |
| Version  | Bump **PATCH** from the production line being fixed                                      |
| Tag      | `vx.y.z` (PATCH)                                                                         |
| Evidence | Hotfix severity + regression results per [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md) |

Do not reuse or move tags.

---

## LTS policy

- **LTS** (Long-Term Support) is declared only by **Owner** for a specific Product or Platform Release.
- LTS lines receive security and critical PATCH fixes; feature MINOR/MAJOR goes to the current line.
- LTS end-of-support requires Owner notice and migration guidance.
- Absence of an LTS declaration means support follows the current Production / Maintenance maturity only.

---

## Deprecation policy

1. Announce deprecation in release notes + portfolio/pack docs.
2. Prefer one MINOR (or agreed window) of coexistence before removal.
3. Removal is a **MAJOR** (or Owner-accepted breaking Platform/Product Release).
4. Frozen architecture removals require **ADR + Owner**.
5. Retired products follow [PRODUCT-LIFECYCLE](../operations/PRODUCT-LIFECYCLE.md) Deprecation → Retirement.

---

## Consistency

Naming here complements — does not replace — [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md). On conflict, Operating Model + this standard apply for release labels; git protection rules still apply.
