import type {
  ActivityMapperRegistry,
  ActivityTypeTemplate,
} from "./activity-mapper-registry";

export class DefaultActivityMapperRegistry implements ActivityMapperRegistry {
  private readonly templates = new Map<string, ActivityTypeTemplate>();

  register(template: ActivityTypeTemplate): void {
    this.templates.set(template.activityTypeId, Object.freeze({ ...template }));
  }

  registerMany(templates: readonly ActivityTypeTemplate[]): void {
    for (const template of templates) {
      this.register(template);
    }
  }

  replace(template: ActivityTypeTemplate): void {
    this.templates.set(template.activityTypeId, Object.freeze({ ...template }));
  }

  has(activityTypeId: string): boolean {
    return this.templates.has(activityTypeId);
  }

  get(activityTypeId: string): ActivityTypeTemplate | undefined {
    const template = this.templates.get(activityTypeId);
    return template ? Object.freeze({ ...template }) : undefined;
  }

  list(): readonly ActivityTypeTemplate[] {
    return Object.freeze(
      [...this.templates.values()].map((template) => Object.freeze({ ...template })),
    );
  }

  clear(): void {
    this.templates.clear();
  }
}

export function createDefaultActivityMapperRegistry(): ActivityMapperRegistry {
  return new DefaultActivityMapperRegistry();
}
