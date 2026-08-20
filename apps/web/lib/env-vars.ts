/** Injectable environment map — tests may pass partial stubs. */
export type EnvVars = NodeJS.ProcessEnv | Record<string, string | undefined>;
