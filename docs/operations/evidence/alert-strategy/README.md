# Alert strategy audit evidence

> **Programme:** APZHUB-1.2-003 · **Backlog:** R12-OPS-02 · **Risk:** OPS-R-05

Store dated audit JSON from:

```bash
pnpm ops:alert-strategy-audit
```

## Naming

`YYYYMMDDTHHMMSSZ-R12-OPS-02-audit-{PASS|FAIL}.json`

## Rules

- No secrets in evidence
- PASS requires all catalogue policies + runbooks present
- Delivery posture remains manual triage
