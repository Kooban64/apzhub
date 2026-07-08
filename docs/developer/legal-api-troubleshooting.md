# Law Platform API — Troubleshooting

> **Story:** LAW-014-07

---

## 401 Unauthenticated

**Cause:** Missing or expired session.

**Fix:**

1. Sign in at `/login`.
2. Ensure cookies are sent (`credentials: "include"` in fetch).
3. For Postman/Bruno, import session cookie or use bearer token.

---

## 403 Forbidden

**Cause:** Missing permission or tenant.

**Fix:**

1. Add `x-tenant-id` header.
2. Verify user has required permission (see [Permissions](./legal-api-permissions.md)).
3. In production, dev permission bypass is disabled.

---

## 403 Tenant required

**Cause:** Authenticated but no tenant resolved.

**Fix:** Set `x-tenant-id` to a valid tenant UUID.

---

## 404 Not found

**Cause:** Resource does not exist or is outside tenant scope.

**Fix:** Verify ID and tenant header. Archived resources return 404 on GET.

---

## 412 Precondition failed

**Cause:** `If-Match` version does not match current ETag.

**Fix:** Refetch resource, read new `ETag`, retry with updated `If-Match`.

---

## 422 Validation failed

**Cause:** Business rule violation.

**Fix:** Inspect `error.details[]` for field-level messages.

---

## Swagger UI requests fail

1. Sign in on same origin first.
2. Set `x-tenant-id` in Try it out headers.
3. Enable cookies in browser.

---

## Diagnostics

Authenticated developers can call:

```http
GET /api/law/v1/diagnostics
```

Returns scaffold version, auth status, and documentation links.
