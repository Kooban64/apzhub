import type { RenderedNotification } from "../domain/types";
import type { NotificationTemplate, TemplateRegistry } from "./registry";

function substitute(template: string, vars: Readonly<Record<string, unknown>>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_m, key: string) => {
    const value = vars[key];
    if (value === undefined || value === null) return "";
    return String(value);
  });
}

export type TemplateResolutionResult =
  | { readonly ok: true; readonly rendered: RenderedNotification }
  | { readonly ok: false; readonly error: string };

export type TemplateResolver = {
  resolve(input: {
    readonly templateId: string;
    readonly variables: Readonly<Record<string, unknown>>;
    readonly locale?: string;
  }): TemplateResolutionResult;
};

export function createTemplateResolver(registry: TemplateRegistry): TemplateResolver {
  return {
    resolve(input) {
      const template = registry.get(input.templateId);
      if (!template) {
        return { ok: false, error: `template.not_found:${input.templateId}` };
      }
      return renderTemplate(template, input.variables, input.locale);
    },
  };
}

export function renderTemplate(
  template: NotificationTemplate,
  variables: Readonly<Record<string, unknown>>,
  locale?: string,
): TemplateResolutionResult {
  const loc = locale ?? template.defaultLocale;
  const localised = template.localisation?.[loc];
  const titleTemplate = localised?.titleTemplate ?? template.titleTemplate;
  const bodyTemplate = localised?.bodyTemplate ?? template.bodyTemplate;
  return {
    ok: true,
    rendered: {
      title: substitute(titleTemplate, variables),
      body: substitute(bodyTemplate, variables),
      locale: loc,
    },
  };
}
