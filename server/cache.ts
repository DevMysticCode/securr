/** Tiny TTL cache. Protects the demo key's 100 requests/day quota. Only successful results are cached. */
export class TtlCache<T> {
  private entry?: { value: T; storedAt: number };
  constructor(private ttlMs: number) {}
  get() {
    if (this.entry && Date.now() - this.entry.storedAt < this.ttlMs) return this.entry;
    return undefined;
  }
  set(value: T) {
    this.entry = { value, storedAt: Date.now() };
  }
}
