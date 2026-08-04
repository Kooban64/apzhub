# TEST-SELECTION-POLICY — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Principle

Suite selection is **policy-based, versioned, and auditable**.  
Orchestration executes policies; Automation executes suites.

## Selection profiles (architecture support)

| Profile       | Intent                                      |
| ------------- | ------------------------------------------- |
| Smoke         | Fast confidence after narrow change         |
| Targeted      | Suites mapped to changed surface            |
| Risk-based    | Elevate coverage when risk signals high     |
| Regression    | Broader pack on merge / promotion           |
| Full          | Complete declared suite set                 |
| Compliance    | Mandated compliance packs                   |
| Performance   | Performance capability / suites             |
| Accessibility | Accessibility capability / suites           |
| Security      | Security capability / suites                |
| Future        | Any profile registered by future capability |

Profiles are **labels for policies**, not hard-coded engines. Future providers/capabilities extend profiles via registration + policy updates.

## Policy model

```text
SelectionPolicy {
  policyId, version
  inputs: correlation context, env class, trigger class, QI advisory (optional)
  rules: ordered predicates → profile + suite set + capability steps
  overrides: manual (permissioned), emergency
  onLowConfidence: fail-closed | degrade | wait
  audit: always
}
```

### Input precedence (default)

1. Explicit manual override (permissioned, audited)
2. Environment class constraints (e.g. production requires compliance profile)
3. Trigger class defaults
4. Correlation-derived targeted set
5. QI advisory adjustments (if policy marks advisory as eligible)
6. Baseline smoke

## How orchestration invokes Automation

1. Resolve suite set from policy
2. Call Automation orchestration contract: `startRun` / equivalent with suite refs, env target, correlation ids
3. Await Automation events (`run.completed`, `run.failed`, …)
4. Never call Playwright/provider clients directly

## Retries, cancellation, concurrency, environment

| Concern      | Governed by                                             |
| ------------ | ------------------------------------------------------- |
| Retries      | Orchestration retry policy + Automation idempotency     |
| Cancellation | Orchestration cancel → Automation cancel contract       |
| Concurrency  | Per-project / per-repo / global policy caps             |
| Environment  | Flow env class + Automation environment targeting       |
| Scheduling   | Orchestration schedule triggers via processing platform |

## Explicit exclusions

- Hard-coding suite names or thresholds in UI widgets
- Selection logic inside dashboards
- Silent QI auto-expansion without policy version
