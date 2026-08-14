# SPR-APZPEN-004 — CE product complete (incl. MobSF)

> **Status:** **DELIVERED** — 2026-08-13  
> **Depends on:** [SPR-APZPEN-001](./SPR-APZPEN-001-security-assurance-foundation.md) · [002](./SPR-APZPEN-002-provider-ingest.md) · [003](./SPR-APZPEN-003-live-runner-dispatch.md)  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

---

## Goal

Finish the **operator-facing APZPEN product** on CE/OSS providers only — including **MobSF** for mobile application analysis — so engagements, assets, providers, dispatch, ingest, certification and report packs form a closed loop.

## Delivered

1. **MobSF CE** on security cluster (`--profile mobile`, `127.0.0.1:8000`) — APK/IPA static analysis; job instructions + JSON ingest
2. **Full CE dispatch catalogue** — ZAP, Trivy, Semgrep, Nuclei, Gitleaks, Syft, Grype, OSV, Checkov, Nmap, testssl, Prowler, kube-bench, Schemathesis, MobSF (dry-run + live)
3. **Ingest** — Gitleaks JSON + MobSF JSON parsers; expanded tool IDs
4. **Assets** — `/apzpen/assets` + `GET /api/v1/apzpen/assets` from engagement scope
5. **Reports** — executive / technical / compliance markdown+JSON via `/apzpen/reports` + `GET /api/v1/apzpen/reports`
6. **Provider catalogue** — single source `provider-catalogue.ts`
7. Demo engagement includes **repository** + **mobile** scope targets

## Explicitly deferred (vision follow-ons — not required for operator CE complete)

- GitHub App + PR security position
- External **customer portal**
- Immutable certification ledger / branded PDF print pipeline
- AI Security Intelligence
- Full Security Graph beyond scope-derived assets

## Acceptance

| #   | Criterion                                                        |
| --- | ---------------------------------------------------------------- |
| 1   | MobSF runner up; operators can ingest MobSF JSON into findings   |
| 2   | All CE dispatch tools dry-run against approved RoE + scope       |
| 3   | Assets page lists scope-derived inventory                        |
| 4   | Report packs generate for executive / technical / compliance     |
| 5   | Vitest suite for apzpen domain/ingest/dispatch/reports passes    |
| 6   | Sprint 001–004 marked delivered; vision remains authority for UX |

## Test command

```bash
pnpm exec vitest run apps/web/lib/apzpen
```
