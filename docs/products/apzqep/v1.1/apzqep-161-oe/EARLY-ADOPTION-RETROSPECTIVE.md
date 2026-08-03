# Early Adoption Retrospective — APZQEP-161-OE

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-161-OE    |
| Timestamp | 20260803T164801Z |

## What worked

1. **Dogfooding immediately surfaced OE-001** (public origin auth) — fixed under LIMITED engineering.
2. Provider-neutral dry-run path is genuinely usable for daily internal smoke practice.
3. Evidence refs + artifact metadata give a credible enterprise story without Wave 2.
4. Placeholders fail closed — good operator safety.

## What surprised us

1. Coexistence hostname required explicit Better Auth trusted origins — not just DNS/nginx.
2. Production build is blocked by an unrelated Cap defect schema issue — ops and eng tracks diverge.
3. “Using APZQEP to test APZHUB” is already valuable **before** GitHub integration.

## Recommendations into Board / Wave 2

1. Review OE feedback register before opening APZQEP-162.
2. Prefer solving durable history + execution UX polish if dogfooding pain exceeds CI integration urgency.
3. Keep GitHub as an orchestrator **into** the Automation Engine — never reverse the dependency.
4. Continue APZQEP-as-customer for at least a short ops period with real suites.

## Strategic note

APZQEP’s differentiator remains enterprise orchestration (lifecycle, evidence, certification, governance), not the connector list. Internal adoption reinforces that story with real usage evidence.
