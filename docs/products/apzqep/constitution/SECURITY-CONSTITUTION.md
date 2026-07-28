# APZ QEP — Security Constitution

> **Programme:** APZQEP-CONSTITUTION-001  
> **Authority:** Constitutional (Article VII)  
> **Related:** Platform Zero Trust (013) · REQ SECURITY-REQUIREMENTS

## Permanent security principles

| Principle                 | Statement                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Zero Trust**            | Verify identity, permission, integrity, intent, and context on every request — never trust by default   |
| **Least Privilege**       | Users, services, workers, connectors, and AI tools receive minimum necessary rights                     |
| **Defence in Depth**      | Client → Gateway → Auth → Authz → Validation → Services → Connectors — no single control is sufficient  |
| **Secure by Default**     | Defaults are private, denied, audited; open access requires explicit grant                              |
| **Audit by Default**      | Privileged and certification actions are audited without opt-in                                         |
| **Encryption by Default** | TLS in transit; sensitive data encrypted at rest per Platform standards                                 |
| **Secrets Management**    | No secrets in code, logs, or repos; connector secrets via Platform patterns                             |
| **Compliance by Design**  | POPIA/GDPR/ISO/SOC intent shapes data minimisation, retention, and access — not afterthought checklists |

## Permanent controls (intent)

1. Platform Identity for standard users — no product login engine silo.
2. PermissionService is server-authoritative.
3. Tenant isolation on all SoR access.
4. MCP/AI tools inherit user permissions; no privilege escalation.
5. Input validation and Platform gateway protections (OWASP-aligned).
6. Dedicated worker identities for async jobs.
7. Security headers and CSRF/XSS controls remain central Platform concerns.

## Forbidden

- Security implemented only in the frontend
- Module→engine trust shortcuts
- Shared superuser credentials for connectors
- Disabling audit for “performance” without Owner Approval

## Amendment

Security Constitution may not be weakened by product convenience. Temporary exceptions require Owner Approval with expiry and compensating controls.
