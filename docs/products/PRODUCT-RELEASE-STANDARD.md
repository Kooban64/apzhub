# Product Release Standard

> **Programme:** APZHUB-PRODUCTS-000  
> **Related:** [PRODUCT-CERTIFICATION-STANDARD](./PRODUCT-CERTIFICATION-STANDARD.md) · [015 Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md)

---

## Purpose

Define how product changes become releasable after Owner Acceptance of a product programme.

---

## Preconditions for release

A product release may proceed only when:

1. Programme **Owner Acceptance** is recorded (ACCEPTED / CLOSED)
2. [PRODUCT-CERTIFICATION-STANDARD](./PRODUCT-CERTIFICATION-STANDARD.md) gates passed
3. Repository status docs updated (CURRENT-* / product `RELEASES.md` as applicable)
4. No frozen-architecture or SDK public contract break without ADR + Owner

---

## Release record (RELEASES.md)

Each product `RELEASES.md` entry should include:

| Field            | Content                                             |
| ---------------- | --------------------------------------------------- |
| Version / label  | Product or monorepo-aligned version as used on disk |
| Programme ID     | Owner-accepted programme                            |
| Date             | Release / acceptance date                           |
| Summary          | User-visible outcomes                               |
| Packages touched | From `package.json` on disk                         |
| Limitations      | Link or summarize `KNOWN-LIMITATIONS.md`            |
| Audit / certify  | Commands that passed                                |

---

## Versioning discipline

- Prefer repository / package versions already established in the monorepo.
- Do not invent marketing versions that conflict with disk `package.json`.
- Engine versions are connector-internal; do not expose them as product versions in UI.

---

## Post-release

- Update product `KNOWN-LIMITATIONS.md` if needed
- Maintenance work still requires Owner Approval for new programmes
- Platform patches for ops necessity follow Phase 3 exceptional rules
