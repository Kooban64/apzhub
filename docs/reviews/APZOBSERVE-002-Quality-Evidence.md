# APZOBSERVE-002 Quality Evidence

| Gate | Evidence | Result |
| --- | --- | --- |
| Architecture audit | `pnpm audit:observe-platform-services` | PASS |
| Foundation audit (still green) | `pnpm audit:observe-foundation` | PASS |
| Typecheck | observe-contracts/core + platform-services | PASS |
| Lint | observe packages + observe platform-services | PASS |
| Vitest | observe packages + platform-services observe suite + harnesses | PASS |
| Coverage | [baseline](./APZOBSERVE-002-coverage-baseline.md) | PASS |

## Versions

| Package | Version |
| --- | --- |
| `@apzhub/observe-contracts` | 0.2.0 |
| `@apzhub/observe-core` | 0.2.0 |
| `@apzhub/observe-persistence` | 0.1.0 |
| `@apzhub/platform-services` | 0.24.0 |
