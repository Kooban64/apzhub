# APZSEARCH-015 — Canonical Entity Catalogue

**Date:** 2026-07-15  
**Authority:** Product adapter entity-type constants (010–014)

---

## Summary counts

| Product | Constant | Count |
| ------- | -------- | ----- |
| Projects | `PROJECTS_SEARCH_ENTITY_TYPES` | 7 |
| Support | `SUPPORT_SEARCH_ENTITY_TYPES` | 5 |
| Documents | `DOCUMENTS_SEARCH_ENTITY_TYPES` | 6 |
| Testing (APZ TCMS) | `TESTING_SEARCH_ENTITY_TYPES` | 40+ |
| Reporting | `REPORTING_SEARCH_ENTITY_TYPES` | 11 |

---

## Projects (`product = projects`)

| Entity type |
| ----------- |
| workspace |
| project |
| task |
| sprint |
| milestone |
| module |
| team |

---

## Support (`product = support`)

| Entity type |
| ----------- |
| support_request |
| support_article |
| support_organisation |
| support_group |
| support_user |

---

## Documents (`product = documents`)

| Entity type |
| ----------- |
| document |
| document_version |
| document_collection |
| document_folder |
| document_category |
| document_tag |

---

## Testing / APZ TCMS (`product = testing`)

| Domain | Entity types |
| ------ | ------------ |
| Manual | test_plan · test_suite · test_case · test_execution · test_run · execution_step · evidence · approval · requirement · defect |
| Automation | automation_run · automation_suite · imported_result · coverage_summary |
| Certification | certification · certification_gate · certification_approval · certification_evidence · certification_decision |
| Release | release · release_candidate · release_package · release_scope · release_approval · release_decision · release_manifest · release_summary |
| Engineering intelligence | engineering_snapshot · engineering_trend · benchmark · historical_snapshot · risk_summary |
| Quality | quality_summary · quality_coverage_summary · defect_summary |
| Reporting metadata | report_metadata · report_template |
| Pipeline | pipeline · pipeline_run · pipeline_import |

---

## Reporting (`product = reporting`)

| Entity type | Notes |
| ----------- | ----- |
| report_template | |
| report_category | |
| report_placeholder_catalogue | |
| report_definition | |
| report_type | |
| report_profile | |
| report_generation | Alias path for generation metadata |
| report_generation_metadata | Primary generation SoR for search |
| report_output_metadata | Format / size / checksumPresent only |
| report_consumer | |
| report_usage_summary | |

Framework aliases accepted by Reporting guards: `template` → report_template · `report` → report_generation_metadata · `dashboard` → report_usage_summary.

---

## Isolation rules

- Entity type names are product-owned; Support Request ≠ Project Task.
- Testing `report_template` / `report_metadata` are TCMS reporting-metadata surfaces — not `@apzhub/search-reporting` entities.
- No shared entity catalogue package; each adapter owns its constant array.
