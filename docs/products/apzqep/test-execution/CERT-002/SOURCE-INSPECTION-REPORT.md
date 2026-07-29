# SOURCE-INSPECTION-REPORT — APZQEP-CERT-002

Independent inspection of candidate **1.0.1-rc.1** (no reliance on REM-001 narrative alone).

## Files inspected

| Path                                                                   | Finding                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `application/ports/index.ts`                                           | Typed `EvidenceAccessAction` / `EvidenceAccessDecision`; `evaluateAccess` + `assertAccessible`          |
| `infrastructure/adapters/evidence-access-port.ts`                      | Fail-closed; unconfigured → deny; only `outcome === "allowed"` grants                                   |
| `infrastructure/factories.ts`                                          | Always injects check (baseline or override); port never left intentionally unconfigured in factory path |
| `application/services/execution-command-service.ts`                    | Required `evidenceAccess`; unconditional assert; deny audit                                             |
| `application/services/create-application-services.ts`                  | Required port                                                                                           |
| `apps/web/.../bootstrap.ts`                                            | Explicit `createBaselineEvidenceAccessCheck()`                                                          |
| `platform-services/.../create-qep-test-execution-platform-services.ts` | Passes `evidenceAccess` into application                                                                |
| `apps/web/.../evidence-references/route.ts`                            | Auth wrapper + POST associate / GET list                                                                |
| `apps/web/.../handlers/qep-test-execution.ts`                          | Delegates to platform service; no client permission trust                                               |
| `application/services/execution-query-service.ts`                      | List evidence via execution read + `requireExecution` (tenant) — no blob SoR                            |
| Workbench `qep-test-execution-views.tsx`                               | `canAssociate` from `availableActions` only                                                             |

## Search results (bypass patterns)

| Pattern                               | Result                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `if (!check) return` (allow)          | **Absent** — replaced with deny                                        |
| `if (deps.evidenceAccess)` skip       | **Absent**                                                             |
| `evidenceAccess?` optional deps       | **Absent** on command/app factories                                    |
| default `true` grant in adapter       | **Absent** (allow only via affirmative check/decision)                 |
| undefined/null-as-allow               | **Absent** — normalize → indeterminate → deny                          |
| exception swallowing that grants      | **Absent** — catch → unavailable → forbid; audit catch rethrows denial |
| bypass flags / ALLOW_ALL for evidence | **Absent** in Test Execution package                                   |
| unguarded repository associate        | **Absent** — associate only via command service                        |
| client-controlled authorisation       | **Absent** — server permissions + EvidenceAccessPort                   |

## Alternative paths

No second associate path found. Domain `associateEvidence` is only reached after port assert. List/metadata exposes URI references already stored on tenant-scoped execution (ADR-0080). No download/blob retrieval endpoint in this package.
