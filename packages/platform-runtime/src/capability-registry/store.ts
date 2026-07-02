import type { CapabilityKind } from "../manifest-engine/capability-kinds";
import type { RegisteredCapabilityRecord } from "./types";

export class CapabilityRegistryStore {
  private readonly byId = new Map<string, RegisteredCapabilityRecord>();
  private readonly byKind = new Map<
    CapabilityKind,
    Map<string, RegisteredCapabilityRecord>
  >();
  private registrationOrder: string[] = [];

  has(id: string): boolean {
    return this.byId.has(id);
  }

  get(id: string): RegisteredCapabilityRecord | undefined {
    return this.byId.get(id);
  }

  getAll(): RegisteredCapabilityRecord[] {
    return this.registrationOrder
      .map((id) => this.byId.get(id))
      .filter((record): record is RegisteredCapabilityRecord => record !== undefined);
  }

  getByKind(kind: CapabilityKind): RegisteredCapabilityRecord[] {
    const bucket = this.byKind.get(kind);
    if (!bucket) return [];
    return [...bucket.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  count(): number {
    return this.byId.size;
  }

  insert(record: RegisteredCapabilityRecord, preserveOrderAfter?: string): void {
    if (this.byId.has(record.id)) {
      throw new Error(`Internal store invariant violated: duplicate id ${record.id}`);
    }

    this.byId.set(record.id, record);

    let kindBucket = this.byKind.get(record.kind);
    if (!kindBucket) {
      kindBucket = new Map();
      this.byKind.set(record.kind, kindBucket);
    }
    kindBucket.set(record.id, record);

    if (preserveOrderAfter) {
      const anchorIndex = this.registrationOrder.indexOf(preserveOrderAfter);
      if (anchorIndex >= 0) {
        this.registrationOrder.splice(anchorIndex + 1, 0, record.id);
        return;
      }
    }

    this.registrationOrder.push(record.id);
  }

  remove(id: string): RegisteredCapabilityRecord | undefined {
    const existing = this.byId.get(id);
    if (!existing) return undefined;

    this.byId.delete(id);
    this.byKind.get(existing.kind)?.delete(id);
    this.registrationOrder = this.registrationOrder.filter((entry) => entry !== id);
    return existing;
  }

  clear(): void {
    this.byId.clear();
    this.byKind.clear();
    this.registrationOrder = [];
  }

  getRegistrationOrder(): readonly string[] {
    return this.registrationOrder;
  }
}
