# APZ Time — Release Process

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T034500Z |

## Purpose

Define how APZ Time ships under APZQEP. This is operational process — not feature work.

## Preconditions

- A01–A03 remain unchanged (native experience baseline)
- Change is within Owner-authorised scope
- Architecture remains frozen (APZQEP V1.1; Time product contract unchanged)

## Process

1. **Backlog intake** — classify change; refuse unauthorised feature expansion.
2. **Open Quality Flow** — identify components (UI, routes, services, adapter-internal, docs).
3. **Engineer** — implement; keep Kimai invisible; no engine branding.
4. **Impact + Policy** — record results in the Flow.
5. **Decision Package** — produce before release.
6. **Evidence** — complete pack (tests, docs, checklist copies).
7. **Checklists** — Engineering + Quality + Release (this pack).
8. **Release** — label as next APZQEP release number when shipping to main/production.
9. **Operational Learning** — mandatory capture after completed release.
10. **Close** — Flow closed; learning registered; friction logged if any.

## Release labelling

| Situation                               | Label                                               |
| --------------------------------------- | --------------------------------------------------- |
| First real Time change under this model | Prefer **APZQEP Release 0001** (if unused)          |
| Subsequent shipments                    | Next free APZQEP release number                     |
| Docs-only / non-shipping ops            | Quality Flow still required; release label optional |

Do **not** invent artificial releases solely to exercise the pipeline.

## Forbidden paths

- Hotfix that skips Quality Flow
- Adapter-direct releases
- User-facing “Kimai” / engine release notes
- Feature expansion disguised as ops
