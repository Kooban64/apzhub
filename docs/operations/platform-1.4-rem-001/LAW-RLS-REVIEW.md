# Law RLS Review — Platform-1.4-REM-001

## Investigation

1. OR-001 failure mode: `describe.runIf(postgresAvailable)` evaluated **before** async `beforeAll`, so denial cases never ran while availability meta-test raced.
2. Live role `apzhub` is **SUPERUSER** (`rolsuper=t`) — PostgreSQL superusers **always bypass RLS**, even with `FORCE ROW LEVEL SECURITY`.
3. Law policies on `law_client` are correctly defined (`law_client_tenant_isolation`).
4. Direct `psql` as non-superuser `apzhub_rls_tester` proves isolation (tenant B count = 0).
5. Additional Platform bug: `createDb(connectionString)` reused process-global pool, ignoring explicit URLs.

## Ownership

| Item                                   | Owner                                                       |
| -------------------------------------- | ----------------------------------------------------------- |
| Test gate anti-pattern                 | **Platform** (fixed)                                        |
| Superuser DATABASE_URL bypassing RLS   | **Platform** infra (documented; tester role for validation) |
| Law policy definitions                 | **APZ Law** (verified OK — not defective)                   |
| `createDb` pool singleton ignoring URL | **Platform** (fixed)                                        |

## Remediation performed (Platform)

- Rewrote RLS integration test to create/use `apzhub_rls_tester` (NOSUPERUSER, NOBYPASSRLS).
- Fixed `createDb` to use a dedicated pool when `connectionString` is provided.
- Result: **3/3 PASS** with `DATABASE_URL` set.

## OR-DEF-003

**CLOSED** (Platform). Law product policies not reclassified as defective.
