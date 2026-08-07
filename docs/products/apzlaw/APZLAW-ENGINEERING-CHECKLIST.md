# APZ Law — Engineering Checklist

Copy into the change evidence pack.

```text
Product: APZ Law
Change:
Quality Flow ID:
Engineer:
Date:

Scope
[ ] Change classified (defect / docs / ops / authorised enhancement)
[ ] Within Owner Auth — no unauthorised feature expansion
[ ] N-01…N-03 baselines not redesigned
[ ] APZQEP architecture untouched
[ ] No legal practice / matter / trust / billing / court / commercial legal SaaS work
[ ] No consumer product wiring unless separately authorised
[ ] No Lane 1 platform work
[ ] Change justified by APZHUB governance requirements

Implementation
[ ] Product contract remains APZ Law / Governance Companion
[ ] Governance vocabulary preserved (no Matters / Trust / Billing as product identity in standard UX)
[ ] Identity remains APZHUB-only (no second login / engine identity)
[ ] Permissions from session / platform RBAC (law.view vs law.admin)
[ ] Practice surfaces remain secondary and admin-gated
[ ] Work → Governance Context → Confident Action entry preserved
[ ] Tests updated / passing for touched surfaces
[ ] Docs updated if behaviour or ops process changed

Exit
[ ] Ready for Quality checklist
[ ] Known limitations still honest
```
