/** Template definition keyed by activity type id. */
export interface ActivityTypeTemplate {
  readonly activityTypeId: string;
  readonly titleTemplate: string;
  readonly descriptionTemplate?: string;
}

/**
 * Registry of activity type templates used by the mapper for rendering.
 * Separate from ActivityRegistry — holds presentation templates only.
 */
export interface ActivityMapperRegistry {
  register(template: ActivityTypeTemplate): void;
  registerMany(templates: readonly ActivityTypeTemplate[]): void;
  replace(template: ActivityTypeTemplate): void;
  has(activityTypeId: string): boolean;
  get(activityTypeId: string): ActivityTypeTemplate | undefined;
  list(): readonly ActivityTypeTemplate[];
  clear(): void;
}
