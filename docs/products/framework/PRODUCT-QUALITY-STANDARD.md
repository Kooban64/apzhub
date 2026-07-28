# Product Quality Standard

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4 · inherits 015 Quality

## Minimum quality model (every product)

| Stage                 | Minimum requirement                                               |
| --------------------- | ----------------------------------------------------------------- |
| Architecture review   | Product ARCHITECTURE.md + compliance with layering                |
| ADR approval          | Product/Platform ADR Owner-accepted when required                 |
| Engineering design    | Design pack before implementation                                 |
| Implementation        | Strict TypeScript · tokens-only UI · no secrets · structured logs |
| Testing               | Unit + integration; API/E2E when UI/API surface changes           |
| Operational readiness | OR validation of approved scope                                   |
| Remediation           | Only Owner-approved findings                                      |
| Build validation      | Clean packaging under documented env (OQs allowed)                |
| Certification         | Product CERT pack with classification                             |
| Release approval      | SemVer evidence + Owner Acceptance                                |
| Maintenance           | Limitations maintained; regressions barred from main              |

## Mandatory repository gates (programme scope)

| Gate                | Requirement                                       |
| ------------------- | ------------------------------------------------- |
| `pnpm typecheck`    | PASS                                              |
| `pnpm lint`         | PASS                                              |
| `pnpm format:check` | PASS                                              |
| Affected Vitest     | PASS                                              |
| Integration tests   | PASS when product touches DB/adapters             |
| Playwright          | PASS for affected product E2E (or OQ + ownership) |
| Repository audits   | Product `pnpm audit:*` / certify scripts PASS     |
| Accessibility       | WCAG AA target for product UI changes             |
| Security            | Auth/authz/validation/audit on new APIs           |
| Docs                | Pack complete before Acceptance                   |

## Testing standards

- **Unit** — domain/services/adapters with mocks at connector boundary
- **Integration** — Platform Service ↔ adapter (mock engine HTTP preferred)
- **Contract** — OpenAPI / SDK manifests where applicable
- **E2E** — Playwright against APZHUB UI only (never engine UIs)
- **Brand mask tests** — fail if engine names appear in user-visible chrome

## Operational standards

- Health reporting for product services/connectors
- Correlation IDs end-to-end
- No long-running work in request handlers
- Jobs idempotent with retry/DLQ where used
- Administration surfaces permission-gated

## Security standards

- Zero Trust on every product API
- Least privilege permissions; no backend role leakage
- Secrets never in repo/logs
- Tenant isolation where product schemas apply (e.g. Law RLS)

## Compliance standards

- POPIA / data-minimisation for personal data in product SoR
- External delivery / SMTP / Email SoR only under named Approvals
- Audit trails for privileged and mutating operations
- Document processing basis when processing personal information

## Environmental qualifications

Build/runtime failures caused solely by invalid operator environment (e.g. `NODE_ENV=development` during production build) are **Operational Qualifications**, not product defects — consistent with Platform-1.4-BLD-001 / CERT-001.
