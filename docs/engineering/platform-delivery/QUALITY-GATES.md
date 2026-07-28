# Quality Gates

> **Programme:** APZHUB-ENGINEERING-001  
> **Normative:** Gates apply per phase scope. Packaging-only programmes still require evidence of prior gates.

---

## Mandatory gate catalogue

| Gate                        | Applies when                                | Pass criteria                                                                                                                                    |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TypeScript**              | Any TS package/app change                   | `pnpm` typecheck / `tsc --noEmit` PASS for touched packages and consumers                                                                        |
| **Lint**                    | Any TS/JS change                            | ESLint PASS for touched packages                                                                                                                 |
| **Build**                   | App or publishable package change           | `pnpm build` (or package build) PASS                                                                                                             |
| **Unit tests**              | Logic packages, handlers, clients, services | Vitest unit suite PASS for vertical                                                                                                              |
| **Integration tests**       | Adapters, services with engine/fixtures     | Adapter/service integration tests PASS (or documented skip with Owner limitation)                                                                |
| **Playwright**              | Workbench / E2E surfaces                    | Specs PASS for capability routes; helpers reuse platform auth patterns                                                                           |
| **OpenAPI**                 | HTTP surface change                         | Spec version bumped; `scripts/validate-openapi.mjs` (or equivalent) PASS; paths/schemas documented                                               |
| **Architecture compliance** | Any code phase                              | Layer boundaries held (Module→Service→Connector→Engine); no provider DTOs in UI; no business logic in adapters/UI; Integration SDK freeze intact |
| **Documentation**           | Every phase                                 | README + phase pack + Completion + Acceptance reports; indexes updated                                                                           |
| **Compatibility**           | Contracts/HTTP/product releases             | Compatibility matrix updated; consumers listed; SemVer policy followed                                                                           |
| **Release notes**           | Certification / Production Release          | SemVer notes + CHANGELOG entry                                                                                                                   |
| **Known limitations**       | Every capability/product programme          | Explicit KL doc; no silent gaps                                                                                                                  |
| **Operational readiness**   | Certification / Production                  | Deploy/config/ops checklist documented                                                                                                           |
| **Certification**           | Product Certification / Production          | Certification class + single recommendation filed                                                                                                |

---

## Phase → minimum gates

| Phase                 | Minimum gates                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Commercial Planning   | Documentation                                                                                                                 |
| Platform Foundation   | Documentation · Architecture (narrative/ADR)                                                                                  |
| Information Model     | Documentation · Architecture (canonical model purity)                                                                         |
| Provider Integration  | TypeScript · Lint · Unit · Integration (adapter) · Architecture · Documentation · Known limitations · Certification (adapter) |
| Contracts             | TypeScript · Lint · Unit/type · Architecture · Documentation · Compatibility · SemVer                                         |
| Platform Services     | TypeScript · Lint · Unit · Architecture · AuthZ · Documentation                                                               |
| HTTP API              | TypeScript · Lint · Build · Unit/API · OpenAPI · Architecture · Documentation                                                 |
| Workbench             | TypeScript · Lint · Build · Unit · Playwright · Architecture · Documentation · a11y where required                            |
| Product Certification | Full vertical evidence + Certification + Operational readiness + Compatibility + Known limitations + Release notes (draft)    |
| Production Release    | Packaging completeness + registers + Release notes + Known limitations + Compatibility + Certification class                  |

---

## Evidence recording

Quality evidence for Production releases lives under:

```text
docs/releases/{product}/
docs/releases/{product}/{semver}/
```

Include at least: quality evidence summary, OpenAPI validation result, Playwright summary, Vitest vertical count, typecheck/lint/build status, architecture statement.

---

## Failures

Any mandatory gate FAIL blocks Exit Criteria. Owner may accept **WITH CONDITIONS** only via explicit Owner Decision listing conditions.
