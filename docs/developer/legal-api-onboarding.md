# Law Platform API — Onboarding Guide

> **Story:** LAW-014-07

---

## Integration checklist

### 1. Obtain access

- [ ] Portal account with Law Platform permissions
- [ ] Tenant ID for your firm (`x-tenant-id`)
- [ ] Confirm environment URL (local / staging / production)

### 2. Download contract

- [ ] [OpenAPI YAML](../specs/LAW-OpenAPI-v1.yaml)
- [ ] [Postman collection](../specs/collections/LAW-OpenAPI-v1.postman_collection.json)
- [ ] [Postman environment](../specs/collections/LAW-OpenAPI-v1.postman_environment.json)
- [ ] [Bruno collection](../specs/collections/bruno/LAW-OpenAPI-v1)

### 3. Authenticate

- [ ] Complete [authentication flow](./legal-api-authentication.md)
- [ ] Verify `GET /api/law/v1/health` returns 200
- [ ] Verify authenticated `GET /api/law/v1/diagnostics` returns 200

### 4. First business call

- [ ] `GET /api/law/v1/clients?limit=5` with tenant header
- [ ] Confirm `{ ok: true, data, pagination, meta }` envelope

### 5. Create workflow

- [ ] Create client → matter → document (or task) chain
- [ ] Handle 422 validation errors using `error.details`
- [ ] Use `If-Match` on updates (optional)

### 6. Production readiness

- [ ] Store tenant ID securely
- [ ] Propagate `x-correlation-id` from your system
- [ ] Implement retry for 412 (refetch + retry) and 500 (backoff)
- [ ] Monitor `x-request-id` for support tickets

---

## Recommended reading order

1. [Getting started](./legal-api-getting-started.md)
2. [Authentication](./legal-api-authentication.md)
3. [Tenant resolution](./legal-api-tenant-resolution.md)
4. [Permissions](./legal-api-permissions.md)
5. [Pagination](./legal-api-pagination.md) + [Filtering](./legal-api-filtering.md)
6. [Error handling](./legal-api-error-handling.md)
7. [Examples](../specs/LAW-API-Examples.md)

---

## Support

- Interactive docs: [/api/docs](../developer/legal-api-developer-guide.md)
- Changelog: [legal-api-changelog.md](./legal-api-changelog.md)
