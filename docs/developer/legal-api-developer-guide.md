# Law Platform API — Developer Guide

> **Story:** LAW-014-07  
> **Interactive docs:** [/api/docs](/api/docs)

---

## Overview

The Law Platform REST API provides tenant-scoped access to legal business data at `/api/law/v1/`. All responses use a standard JSON envelope with tracing metadata.

---

## Quick links

| Resource              | URL                                                  |
| --------------------- | ---------------------------------------------------- |
| Documentation landing | [/api/docs](/api/docs)                               |
| OpenAPI YAML          | [/api/law/v1/openapi.yaml](/api/law/v1/openapi.yaml) |
| OpenAPI JSON          | [/api/law/v1/openapi.json](/api/law/v1/openapi.json) |
| Health                | `/api/law/v1/health`                                 |
| Diagnostics           | `/api/law/v1/diagnostics` (authenticated)            |

---

## Guides

| Guide                                                           | Description                        |
| --------------------------------------------------------------- | ---------------------------------- |
| [Getting started](./legal-api-getting-started.md)               | Base URL, first request, envelopes |
| [Onboarding](./legal-api-onboarding.md)                         | Integration checklist              |
| [Authentication](./legal-api-authentication.md)                 | Session and bearer auth            |
| [Tenant resolution](./legal-api-tenant-resolution.md)           | `x-tenant-id` header               |
| [Permissions](./legal-api-permissions.md)                       | Permission strings                 |
| [Filtering](./legal-api-filtering.md)                           | Query filters                      |
| [Pagination](./legal-api-pagination.md)                         | Cursor pagination                  |
| [Optimistic concurrency](./legal-api-optimistic-concurrency.md) | ETag / If-Match                    |
| [Error handling](./legal-api-error-handling.md)                 | Error envelope                     |
| [Versioning](./legal-api-versioning.md)                         | Version policy                     |
| [Examples](../specs/LAW-API-Examples.md)                        | Request/response examples          |
| [Troubleshooting](./legal-api-troubleshooting.md)               | Common issues                      |
| [Changelog](./legal-api-changelog.md)                           | Version history                    |

---

## Collections

| Format              | Path                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Postman Collection  | [/specs/collections/LAW-OpenAPI-v1.postman_collection.json](/specs/collections/LAW-OpenAPI-v1.postman_collection.json)   |
| Postman Environment | [/specs/collections/LAW-OpenAPI-v1.postman_environment.json](/specs/collections/LAW-OpenAPI-v1.postman_environment.json) |
| Bruno               | [/specs/collections/bruno/LAW-OpenAPI-v1](/specs/collections/bruno/LAW-OpenAPI-v1)                                       |

Regenerate: `pnpm openapi:collections`

---

## Specification authority

| Document        | Location                                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| OpenAPI 3.1     | [LAW-OpenAPI-v1.yaml](../specs/LAW-OpenAPI-v1.yaml)                                 |
| DTO catalogue   | [LAW-API-DTO-Catalogue.md](../specs/LAW-API-DTO-Catalogue.md)                       |
| Error catalogue | [LAW-API-Error-Catalogue.md](../specs/LAW-API-Error-Catalogue.md)                   |
| Pagination spec | [LAW-API-Pagination-and-Filtering.md](../specs/LAW-API-Pagination-and-Filtering.md) |

---

## API explorer

The [/api/docs](/api/docs) page includes Swagger UI for interactive testing of GET, POST, PATCH, and DELETE against live endpoints. Sign in first, then set `x-tenant-id` in request headers.
