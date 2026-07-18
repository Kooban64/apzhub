# Law Platform API — Versioning

> **Story:** LAW-014-07

---

## Current version

| Item                 | Value          |
| -------------------- | -------------- |
| API version          | **v1**         |
| OpenAPI info.version | **1.0.0**      |
| Base path            | `/api/law/v1/` |

---

## Policy

- **URL versioning** — major version in path (`/v1/`).
- **Breaking changes** require a new major version (`/v2/`).
- **Additive changes** (new fields, optional params) are non-breaking within v1.
- **Deprecation** — deprecated fields/operations marked in OpenAPI with `deprecated: true` for ≥ one release cycle before removal.

---

## Breaking change definition

- Removing or renaming fields
- Changing field types
- Removing endpoints
- Changing authentication or tenant requirements
- Changing error codes for the same condition

---

## Changelog

See [API Changelog](./legal-api-changelog.md).

---

## OpenAPI

Canonical spec: [/api/law/v1/openapi.yaml](../specs/LAW-OpenAPI-v1.yaml)
