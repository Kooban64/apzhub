# Engineering Onboarding — APZQEP Wave 1

| Field     | Value                              |
| --------- | ---------------------------------- |
| Programme | APZQEP-161-OE                      |
| Audience  | Software engineers building APZHUB |

## In 30 minutes

1. Open https://apzhub.apzportal.apzor.com/login and sign in.
2. Read [INTERNAL-ADOPTION-GUIDE.md](./INTERNAL-ADOPTION-GUIDE.md).
3. Run a Playwright dry-run from Enterprise Automation.
4. Inspect execution detail + evidence refs.
5. Call provider-neutral APIs (see API examples below).
6. Skim `@apzhub/platform-automation` contracts — engine must never import Playwright.

## Architecture you must respect

```text
Client → API → QepAutomationFacade → AutomationEngine → Provider Interface → Playwright Provider
```

- Product language: Automation / Playwright **provider**, not “Playwright product”.
- Future engines plug into the same interface (placeholders already registered).

## API quick examples

```bash
# After browser sign-in, reuse session cookie — or use local coexistence:
ORIGIN=http://localhost:3300
BASE=http://127.0.0.1:3300

curl -sS -c /tmp/cj -b /tmp/cj -X POST "$BASE/api/auth/sign-in/email" \
  -H "content-type: application/json" -H "origin: $ORIGIN" \
  -d '{"email":"dev@apzhub.local","password":"DevPassword123!"}'

curl -sS -b /tmp/cj "$BASE/api/v1/qep/automation/providers" | jq .
```

## Packages

| Package                       | Role                          |
| ----------------------------- | ----------------------------- |
| `@apzhub/platform-automation` | Platform Automation Engine    |
| `@apzhub/qep-automation`      | APZQEP facade + routes        |
| `modules/qep-automation`      | Module manifest (M07 enabled) |

## When you find friction

Add a row to [OPERATIONAL-FEEDBACK-REGISTER.md](./OPERATIONAL-FEEDBACK-REGISTER.md). Do **not** start Wave 2 features under this programme.
