# Deep-Link Verification — APZQEP-FREEZE-004

Suite: `testing/playwright/e2e/apzqep-eng-110f-evidence-workbench.spec.ts`  
Describe: `FREEZE-004 nested deep-link stability`

| Check                                        | Result                                  |
| -------------------------------------------- | --------------------------------------- |
| Click-through provenance from detail         | ✅ (ENG-110F journey)                   |
| Direct navigation to provenance              | ✅ stays mounted; not rewound to Home   |
| Refresh on provenance                        | ✅ remains on provenance with timeline  |
| Backward navigation to detail                | ✅                                      |
| Forward navigation to provenance             | ✅ remains mounted; not rewound to Home |
| Provenance content `Initial capture` visible | ✅                                      |

Overall Playwright Evidence Workbench: **10/10 PASS**.
