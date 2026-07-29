# REGRESSION-REPORT — APZQEP-CERT-002

| Suite                          | Command                                                          | Start (UTC) | End (UTC) | Exit | Result                                        |
| ------------------------------ | ---------------------------------------------------------------- | ----------- | --------- | ---- | --------------------------------------------- |
| Package typecheck              | `pnpm --filter @apzhub/qep-test-execution typecheck`             | 19:05:27Z   | 19:05:41Z | 0    | **PASS**                                      |
| Package lint                   | `pnpm --filter @apzhub/qep-test-execution lint`                  | 19:05:41Z   | 19:05:43Z | 0    | **PASS**                                      |
| Package tests                  | `pnpm --filter @apzhub/qep-test-execution test`                  | 19:05:43Z   | 19:05:48Z | 0    | **PASS 77/77**                                |
| API + Workbench + Platform QEP | vitest handlers + available-actions + qep-platform-services      | 19:06:07Z   | 19:06:21Z | 0    | **PASS 33/33**                                |
| Package build script           | `pnpm --filter @apzhub/qep-test-execution build`                 | 19:06:21Z   | 19:06:36Z | 0    | **N/A** (no build script; typecheck proxy OK) |
| Prettier check (package src)   | `prettier --check packages/qep-test-execution/src/**/*.{ts,tsx}` | —           | —         | warn | **5 files style drift** (Low)                 |
| Playwright TE workbench        | see Playwright report                                            | 19:08:07Z   | 19:12:10Z | 1    | **2/10 PASS**                                 |

## Security subset

- `evidence-access-port.test.ts` — 15 PASS
- `evidence-access-enforcement.service.test.ts` — 6 PASS

## Conclusion

All previously green automated Test Execution unit/API/platform suites remain green. Playwright authenticated journeys not green — environmental/UI, not classified as L-02 product regression without further proof.
