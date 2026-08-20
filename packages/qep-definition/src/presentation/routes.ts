export const QEP_DEFINITION_BASE_PATH = "/api/v1/qep" as const;

export const QEP_DEFINITION_ROUTES = {
  stories: `${QEP_DEFINITION_BASE_PATH}/user-stories`,
  story: (id: string) =>
    `${QEP_DEFINITION_BASE_PATH}/user-stories/${encodeURIComponent(id)}`,
  criteria: `${QEP_DEFINITION_BASE_PATH}/acceptance-criteria`,
  criterion: (id: string) =>
    `${QEP_DEFINITION_BASE_PATH}/acceptance-criteria/${encodeURIComponent(id)}`,
  promote: `${QEP_DEFINITION_BASE_PATH}/definition/promote-legacy-criteria`,
} as const;
