# Validation Report — APZQEP-RELEASE-003

| Suite                                     | Expected   | Result                       |
| ----------------------------------------- | ---------- | ---------------------------- |
| `@apzhub/qep-evidence` typecheck          | PASS       | ✅ PASS                      |
| `@apzhub/qep-evidence` lint               | PASS       | ✅ PASS                      |
| `@apzhub/qep-evidence` tests              | 54 PASS    | ✅ **54/54 PASS**            |
| Targeted transport / Workbench / platform | 35 PASS    | ✅ **35/35 PASS**            |
| `@apzhub/platform-services` typecheck     | PASS       | ✅ PASS                      |
| `@apzhub/qep-test-execution` 1.0.1 tests  | 77 PASS    | ✅ **77/77 PASS**            |
| Playwright Evidence Workbench             | 7 PASS     | ❌ **6/7 FAIL** (provenance) |
| Package identity at HEAD                  | 1.0.0-rc.1 | ✅                           |
| TE source unchanged                       | yes        | ✅                           |

## Gate

Release validation **FAIL** due to Playwright B-02.
