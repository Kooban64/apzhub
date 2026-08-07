# Test Report — APZ-LAW-NATIVE-001-N03

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-03             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T200000Z |

## Coverage

| Area                   | Evidence                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| Routes                 | `apps/law-platform/lib/governance/routes.test.ts`                            |
| GQ catalogue           | `apps/law-platform/lib/governance/enterprise-governance-questions.test.ts`   |
| Home                   | `apps/law-platform/components/governance/governance-home-view.test.tsx`      |
| Catalogue              | `apps/law-platform/components/governance/governance-catalogue-view.test.tsx` |
| Context model          | `apps/law-platform/components/governance/governance-context-view.test.tsx`   |
| Navigation / manifests | `apps/law-platform/components/governance/governance-navigation.test.ts`      |
| Permissions (N-02)     | `apps/law-platform/lib/law/permissions.test.ts`                              |
| Bootstrap              | `apps/law-platform/lib/law-platform-bootstrap.test.ts`                       |

## Results

| Criterion                                     | Result   |
| --------------------------------------------- | -------- |
| Governance-first Home                         | **PASS** |
| Enterprise Governance Catalogue               | **PASS** |
| Governance Context model                      | **PASS** |
| Practice-first entry removed                  | **PASS** |
| Native chrome (Help / Settings / breadcrumbs) | **PASS** |
| Administrative separation (`law.admin`)       | **PASS** |
| Regression (permissions + bootstrap)          | **PASS** |
