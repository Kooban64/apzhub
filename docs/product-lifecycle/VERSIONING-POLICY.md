# Versioning Policy

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Normative sources:** [RELEASE-NAMING-STANDARD](../releases/RELEASE-NAMING-STANDARD.md) · [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md)

---

## SemVer (mandatory)

| Bump      | Meaning                                               |
| --------- | ----------------------------------------------------- |
| **MAJOR** | Breaking public API / contract — ADR + Owner required |
| **MINOR** | Backward-compatible capability                        |
| **PATCH** | Backward-compatible fix                               |

## Platform vs products vs packages

| Artefact                     | Rule                                                                     |
| ---------------------------- | ------------------------------------------------------------------------ |
| Platform Production Baseline | Advances only on Owner Promotion Acceptance                              |
| Commercial products          | Independent SemVer; do not silently track platform minors                |
| `@apzhub/*` packages         | Package SemVer; frozen packages need ADR for breaks                      |
| Root `package.json`          | May remain engineering root version until Owner-aligned SemVer programme |

## Promotion rules

1. Engineering completion ≠ SemVer bump.
2. Feature Acceptance ≠ Production Baseline change.
3. Only Owner Promotion Approval updates PORTFOLIO-RELEASE-REGISTER current versions.
4. Pre-release tags (`-rc.N`) optional for trains.

## Compatibility

Public API and SemVer compatibility must be verified for every train/hotfix (additive preferred). Breaking changes require ADR + Owner — never “train convenience.”
