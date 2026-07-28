# Build Validation — Platform-1.4-BLD-001

## Commands executed

| #   | Command                                         | Environment               | Result   |
| --- | ----------------------------------------------- | ------------------------- | -------- |
| 1   | `pnpm build`                                    | `NODE_ENV=development`    | **FAIL** |
| 2   | `env -u NODE_ENV pnpm build`                    | `NODE_ENV` unset          | **PASS** |
| 3   | `NODE_ENV=test pnpm --filter @apzhub/web build` | `NODE_ENV=test` (CI-like) | **PASS** |

## PASS build summary (`env -u NODE_ENV`)

- Compiled successfully (~48s)
- Generating static pages **334/334**
- Routes include `/login`, `/register`, `/workspace/[[...segments]]`, API surface
- Exit code **0**

## FAIL build summary (`NODE_ENV=development`)

- Compiled successfully (~43s)
- Static generation reaches ~250/334 then aborts on `/_global-error`
- Exit code **1** (`ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL @apzhub/web`)

## Release packaging implication

| Context                                    | Build readiness                                |
| ------------------------------------------ | ---------------------------------------------- |
| CI (`NODE_ENV: test` in workflow)          | Compatible with clean build                    |
| Operator shell with `NODE_ENV=development` | Must use `env -u NODE_ENV pnpm build`          |
| Production packaging                       | Unset or non-`development` `NODE_ENV` required |

## Platform implementation

Unchanged. No behavioural, architectural, or package redesign performed.
