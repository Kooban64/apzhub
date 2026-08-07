# APZ Analytics — Engineering Checklist

Copy into the change evidence pack.

```text
Product: APZ Analytics
Change:
Quality Flow ID:
Engineer:
Date:

Scope
[ ] Change classified (defect / docs / ops / authorised enhancement)
[ ] Within Owner Auth — no unauthorised feature expansion
[ ] N-01…N-03 baselines not redesigned
[ ] APZQEP architecture untouched
[ ] No AI / predictive / recommendation / warehouse work unless separately authorised
[ ] No new dashboards / metrics / insight surfaces unless separately authorised
[ ] No Lane 1 platform work

Implementation
[ ] Product contract remains APZ Analytics / Decision Companion
[ ] Decision vocabulary preserved (no Dashboard / Report as product identity in standard UX)
[ ] Identity remains APZHUB-only (no second login / BI engine identity)
[ ] Permissions from session / platform RBAC
[ ] Administrative reporting remains secondary and admin-gated
[ ] Question → Insight → Decision entry preserved
[ ] Tests updated / passing for touched surfaces
[ ] Docs updated if behaviour or ops process changed

Exit
[ ] Ready for Quality checklist
[ ] Known limitations still honest
```
