export type StoreType = "local" | "session";

export interface StoreOptions {
  storage?: StoreType;
  /** @deprecated Use obfuscate instead. This option will be removed in a future version. */
  encrypt?: boolean;
  /** Enable basic obfuscation of stored values. Note: This is not encryption and should not be used for sensitive data. */
  obfuscate?: boolean;
  secret?: string;
  /** Enable automatic cleanup of expired items on getAll() and init() */
  autoCleanup?: boolean;
}

export interface StoredValue<T = any> {
  value: T;
  expiry?: number;
}

export interface Store<T = any> {
  /** Set a value in the store with optional TTL in seconds */
  set(key: string, value: T, ttlSeconds?: number): void;
  /** Get a value from the store */
  get(key: string): T | null;
  /** Remove a value from the store */
  remove(key: string): void;
  /** Clear all values in the namespace */
  clear(): void;
  /** Check if a key exists in the store */
  has(key: string): boolean;
  /** Get all keys in the store */
  keys(): string[];
  /** Get all values in the store */
  getAll(): Record<string, T>;
  /** Initialize the store and optionally clean up expired items */
  init(): void;
}
