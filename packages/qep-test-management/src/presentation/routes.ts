export const QEP_TEST_MANAGEMENT_BASE_PATH = "/api/v1/qep" as const;

export const QEP_TEST_MANAGEMENT_ROUTES = {
  testCases: `${QEP_TEST_MANAGEMENT_BASE_PATH}/test-cases`,
  testCase: (id: string) =>
    `${QEP_TEST_MANAGEMENT_BASE_PATH}/test-cases/${encodeURIComponent(id)}`,
  suites: `${QEP_TEST_MANAGEMENT_BASE_PATH}/test-suites`,
  suite: (id: string) =>
    `${QEP_TEST_MANAGEMENT_BASE_PATH}/test-suites/${encodeURIComponent(id)}`,
  plans: `${QEP_TEST_MANAGEMENT_BASE_PATH}/test-plans`,
  plan: (id: string) =>
    `${QEP_TEST_MANAGEMENT_BASE_PATH}/test-plans/${encodeURIComponent(id)}`,
} as const;
