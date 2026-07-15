import type { CapabilityDescriptor } from "./types";

/** Generic in-memory register/list/get/clear registry — placeholder only. */
export class InMemoryRegistry<T extends CapabilityDescriptor> {
  private readonly items = new Map<string, T>();

  register(descriptor: T): void {
    if (!descriptor.id.trim()) {
      throw new Error("Capability descriptor id is required");
    }
    this.items.set(descriptor.id, descriptor);
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  list(): readonly T[] {
    return [...this.items.values()];
  }

  clear(): void {
    this.items.clear();
  }

  size(): number {
    return this.items.size;
  }

  unregister(id: string): boolean {
    return this.items.delete(id);
  }
}
