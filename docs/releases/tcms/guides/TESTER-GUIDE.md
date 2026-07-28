# APZ TCMS 1.0.0 — Tester Guide

> **Product:** APZ TCMS  
> **Version:** **1.0.0**  
> **Audience:** Testers · QA leads · developers using Testing module  
> **Date:** 2026-07-19

---

## Open Testing

1. Sign in to APZHUB
2. Open **Testing** from the Activity Bar / Sidebar (if your role allows)
3. Use Certification, Plans, Cases, Executions, and related views as permitted

## Typical actions

| Action                        | Description                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Browse plans / suites / cases | Organise and review test assets                                               |
| Execute                       | Run manual executions; capture expected vs actual and evidence (as permitted) |
| Defects                       | Link and track defects related to executions                                  |
| Coverage / gates              | Review coverage and quality gate status                                       |
| Certification                 | View certification states and approval status (as permitted)                  |
| Pipelines                     | View CI metadata from GitHub Actions (read-only certified path)               |
| Search                        | Find testing entities via Unified Search when indexed                         |

## Important limitations

- This product is **APZ TCMS** — not Kiwi TCMS
- CI integration in Release **1.0.0** is **GitHub Actions metadata** (read-only certified path) — not GitLab, not full GitHub admin
- AI Assist is **not** included; humans certify
- You will not see Vitest/Playwright as the product brand

## Need help?

Contact your APZHUB administrator.

## Related

- [Product Guide](./PRODUCT-GUIDE.md)
- [Known Limitations](../../../products/apz-tcms/KNOWN-LIMITATIONS.md)
