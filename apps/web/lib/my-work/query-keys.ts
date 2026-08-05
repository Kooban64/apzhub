export const myWorkQueryKeys = {
  all: ["my-work"] as const,
  composition: () => [...myWorkQueryKeys.all, "composition"] as const,
};
