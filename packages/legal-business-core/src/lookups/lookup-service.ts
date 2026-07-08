export interface LookupItem<TValue extends string = string> {
  readonly value: TValue;
  readonly label: string;
  readonly description?: string;
}

export interface LookupService<TValue extends string = string> {
  list(): readonly LookupItem<TValue>[];
  get(value: TValue): LookupItem<TValue> | undefined;
  has(value: TValue): boolean;
}

export class StaticLookupService<
  TValue extends string,
> implements LookupService<TValue> {
  private readonly items: ReadonlyMap<TValue, LookupItem<TValue>>;

  constructor(items: readonly LookupItem<TValue>[]) {
    this.items = new Map(items.map((item) => [item.value, item]));
  }

  list(): readonly LookupItem<TValue>[] {
    return [...this.items.values()];
  }

  get(value: TValue): LookupItem<TValue> | undefined {
    return this.items.get(value);
  }

  has(value: TValue): boolean {
    return this.items.has(value);
  }
}
