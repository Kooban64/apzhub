import type { WidgetDescriptor } from "../contracts/widget";

export class WidgetRegistry {
  private readonly widgets = new Map<string, WidgetDescriptor>();

  register(descriptor: WidgetDescriptor): void {
    if (this.widgets.has(descriptor.widgetId)) {
      throw new Error(`Widget already registered: ${descriptor.widgetId}`);
    }
    this.widgets.set(descriptor.widgetId, Object.freeze({ ...descriptor }));
  }

  get(widgetId: string): WidgetDescriptor | undefined {
    return this.widgets.get(widgetId);
  }

  require(widgetId: string): WidgetDescriptor {
    const widget = this.get(widgetId);
    if (!widget) {
      throw new Error(`Unknown widget: ${widgetId}`);
    }
    return widget;
  }

  list(): readonly WidgetDescriptor[] {
    return [...this.widgets.values()];
  }
}
